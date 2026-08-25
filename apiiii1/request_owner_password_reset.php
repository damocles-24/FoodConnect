<?php

header("Content-Type: application/json; charset=utf-8");
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Pragma: no-cache");

error_reporting(E_ALL & ~E_NOTICE & ~E_WARNING);
ini_set("display_errors", "0");

require_once __DIR__ . "/session_config.php";
require_once __DIR__ . "/db.php";
require_once __DIR__ . "/rate_limit.php";
require_once __DIR__ . "/ph_phone.php";

function owner_reset_request_respond(array $payload, int $code = 200): void
{
    http_response_code($code);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

if (strtoupper((string)($_SERVER["REQUEST_METHOD"] ?? "")) !== "POST") {
    owner_reset_request_respond([
        "success" => false,
        "message" => "This action is not available."
    ], 405);
}

if (!isset($conn) || !($conn instanceof mysqli)) {
    owner_reset_request_respond([
        "success" => false,
        "message" => "Service is temporarily unavailable. Please try again shortly."
    ], 500);
}

$conn->set_charset("utf8mb4");

$input = json_decode(file_get_contents("php://input"), true);
if (!is_array($input)) {
    owner_reset_request_respond([
        "success" => false,
        "message" => "Invalid request data."
    ], 400);
}

$email = strtolower(trim((string)($input["email"] ?? "")));
$contactNumber = normalize_ph_mobile($input["contact_number"] ?? "");
$restaurantName = trim((string)($input["restaurant_name"] ?? ""));
$reason = trim((string)($input["reason"] ?? ""));

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    owner_reset_request_respond([
        "success" => false,
        "message" => "Enter a valid owner email address."
    ], 422);
}

if ($contactNumber === "") {
    owner_reset_request_respond([
        "success" => false,
        "message" => "Enter the Philippine mobile number registered to the owner account."
    ], 422);
}

if (mb_strlen($restaurantName) < 2 || mb_strlen($restaurantName) > 180) {
    owner_reset_request_respond([
        "success" => false,
        "message" => "Restaurant name must contain between 2 and 180 characters."
    ], 422);
}

if (mb_strlen($reason) < 10 || mb_strlen($reason) > 500) {
    owner_reset_request_respond([
        "success" => false,
        "message" => "Explain the recovery request in 10 to 500 characters."
    ], 422);
}

rate_limit_enforce(
    $conn,
    "owner-password-reset-request",
    rate_limit_identifier(rate_limit_client_ip(), $email),
    4,
    3600,
    3600,
    "Too many password recovery requests. Please wait before trying again."
);

/*
 * Create a session-scoped recovery tracker for every syntactically valid
 * submission, including non-matching account details. This preserves the
 * endpoint's anti-enumeration behavior: the initial response does not reveal
 * whether an owner account matched.
 */
$trackingToken = bin2hex(random_bytes(24));
$trackingTokenHash = hash("sha256", $trackingToken);
$trackingLifetimeSeconds = 86400;

$_SESSION["owner_password_reset_tracker"] = [
    "token_hash" => $trackingTokenHash,
    "request_id" => 0,
    "owner_id" => 0,
    "created_at" => time()
];

$genericSuccess = [
    "success" => true,
    "message" => "If the account details match an active FoodConnect owner account, your request has been sent to the administrator for review. If approved, FoodConnect will automatically email the temporary password to the registered owner email.",
    "tracking_token" => $trackingToken,
    "tracking_expires_in" => $trackingLifetimeSeconds
];

try {
    $ownerStmt = $conn->prepare("
        SELECT
            u.user_id,
            u.restaurant_id,
            COALESCE(NULLIF(TRIM(CONCAT_WS(' ', NULLIF(TRIM(u.first_name), ''), NULLIF(TRIM(u.middle_name), ''), NULLIF(TRIM(u.last_name), ''))), ''), NULLIF(TRIM(u.full_name), ''), '') AS full_name,
            u.contact_number,
            u.status,
            u.is_verified,
            COALESCE(r.restaurant_id, u.restaurant_id) AS resolved_restaurant_id,
            COALESCE(r.name, pa.restaurant_name, '') AS actual_restaurant_name
        FROM tbl_users AS u
        LEFT JOIN tbl_restaurants AS r
            ON r.owner_id = u.user_id
        LEFT JOIN tbl_partner_applications AS pa
            ON pa.owner_id = u.user_id
        WHERE u.email = ?
          AND u.role = 'owner'
        ORDER BY r.restaurant_id ASC
        LIMIT 1
    ");

    if (!$ownerStmt) {
        throw new RuntimeException("Unable to prepare owner recovery lookup.");
    }

    $ownerStmt->bind_param("s", $email);
    $ownerStmt->execute();
    $owner = $ownerStmt->get_result()->fetch_assoc();
    $ownerStmt->close();

    if (!$owner || (int)$owner["status"] !== 1 || (int)$owner["is_verified"] !== 1) {
        owner_reset_request_respond($genericSuccess);
    }

    $registeredContact = normalize_ph_mobile($owner["contact_number"] ?? "");
    if ($registeredContact === "" || !hash_equals($registeredContact, $contactNumber)) {
        owner_reset_request_respond($genericSuccess);
    }

    $ownerId = (int)$owner["user_id"];
    $restaurantId = (int)($owner["resolved_restaurant_id"] ?? 0);

    $conn->begin_transaction();

    /* Serialize requests for the same owner to prevent duplicate pending rows. */
    $lockStmt = $conn->prepare("
        SELECT user_id
        FROM tbl_users
        WHERE user_id = ?
          AND role = 'owner'
        LIMIT 1
        FOR UPDATE
    ");

    if (!$lockStmt) {
        throw new RuntimeException("Unable to prepare owner recovery lock.");
    }

    $lockStmt->bind_param("i", $ownerId);
    $lockStmt->execute();
    $lockedOwner = $lockStmt->get_result()->fetch_assoc();
    $lockStmt->close();

    if (!$lockedOwner) {
        throw new RuntimeException("Owner account is no longer available.");
    }

    $pendingStmt = $conn->prepare("
        SELECT request_id
        FROM tbl_owner_password_reset_requests
        WHERE owner_id = ?
          AND request_status = 'pending'
        ORDER BY request_id DESC
        LIMIT 1
    ");

    if (!$pendingStmt) {
        throw new RuntimeException("Unable to check existing recovery requests.");
    }

    $pendingStmt->bind_param("i", $ownerId);
    $pendingStmt->execute();
    $pendingRequest = $pendingStmt->get_result()->fetch_assoc();
    $pendingStmt->close();

    $trackedRequestId = 0;

    if (!$pendingRequest) {
        $insertStmt = $conn->prepare("
            INSERT INTO tbl_owner_password_reset_requests (
                owner_id,
                restaurant_id,
                submitted_email,
                submitted_contact_number,
                submitted_restaurant_name,
                reason,
                request_status
            ) VALUES (?, NULLIF(?, 0), ?, ?, ?, ?, 'pending')
        ");

        if (!$insertStmt) {
            throw new RuntimeException("Unable to prepare owner recovery request.");
        }

        $insertStmt->bind_param(
            "iissss",
            $ownerId,
            $restaurantId,
            $email,
            $contactNumber,
            $restaurantName,
            $reason
        );

        if (!$insertStmt->execute()) {
            $insertStmt->close();
            throw new RuntimeException("Unable to save owner recovery request.");
        }

        $trackedRequestId = (int)$insertStmt->insert_id;
        $insertStmt->close();
    } else {
        $trackedRequestId = (int)$pendingRequest["request_id"];
    }

    $conn->commit();

    /*
     * Bind the opaque browser tracker to the real request only after the
     * transaction commits. The token never grants password-reset authority;
     * it can only read this request's review status in the same PHP session.
     */
    $_SESSION["owner_password_reset_tracker"] = [
        "token_hash" => $trackingTokenHash,
        "request_id" => $trackedRequestId,
        "owner_id" => $ownerId,
        "created_at" => time()
    ];

    owner_reset_request_respond($genericSuccess);
} catch (Throwable $error) {
    try {
        $conn->rollback();
    } catch (Throwable $ignored) {
    }

    error_log(
        "request_owner_password_reset.php error: " .
        $error->getMessage()
    );

    owner_reset_request_respond([
        "success" => false,
        "message" => "Unable to submit the recovery request right now. Please try again later."
    ], 500);
}
