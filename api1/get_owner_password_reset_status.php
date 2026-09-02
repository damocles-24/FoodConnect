<?php

header("Content-Type: application/json; charset=utf-8");
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Pragma: no-cache");

error_reporting(E_ALL & ~E_NOTICE & ~E_WARNING);
ini_set("display_errors", "0");

require_once __DIR__ . "/session_config.php";
require_once __DIR__ . "/db.php";
require_once __DIR__ . "/rate_limit.php";

function owner_reset_status_respond(array $payload, int $code = 200): void
{
    http_response_code($code);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function owner_reset_status_mask_email(string $email): string
{
    $email = trim($email);
    $parts = explode("@", $email, 2);

    if (count($parts) !== 2) {
        return "your registered owner email";
    }

    [$localPart, $domain] = $parts;
    $localLength = strlen($localPart);

    if ($localLength <= 1) {
        $maskedLocal = "*";
    } elseif ($localLength === 2) {
        $maskedLocal = substr($localPart, 0, 1) . "*";
    } else {
        $maskedLocal = substr($localPart, 0, 2) . str_repeat("*", max(2, $localLength - 2));
    }

    return $maskedLocal . "@" . $domain;
}

if (strtoupper((string)($_SERVER["REQUEST_METHOD"] ?? "")) !== "POST") {
    owner_reset_status_respond([
        "success" => false,
        "message" => "This action is not available."
    ], 405);
}

if (!isset($conn) || !($conn instanceof mysqli)) {
    owner_reset_status_respond([
        "success" => false,
        "message" => "Service is temporarily unavailable."
    ], 500);
}

$input = json_decode(file_get_contents("php://input"), true);
if (!is_array($input)) {
    owner_reset_status_respond([
        "success" => false,
        "message" => "Invalid request data."
    ], 400);
}

$trackingToken = strtolower(trim((string)($input["tracking_token"] ?? "")));

if (!preg_match('/^[a-f0-9]{48}$/', $trackingToken)) {
    owner_reset_status_respond([
        "success" => true,
        "status" => "unavailable",
        "message" => "Recovery status is not available in this browser session."
    ]);
}

$tracker = $_SESSION["owner_password_reset_tracker"] ?? null;

if (!is_array($tracker)) {
    owner_reset_status_respond([
        "success" => true,
        "status" => "unavailable",
        "message" => "Recovery status is not available in this browser session."
    ]);
}

$createdAt = (int)($tracker["created_at"] ?? 0);
$trackerHash = (string)($tracker["token_hash"] ?? "");
$requestId = (int)($tracker["request_id"] ?? 0);
$ownerId = (int)($tracker["owner_id"] ?? 0);

if ($createdAt <= 0 || (time() - $createdAt) > 86400) {
    unset($_SESSION["owner_password_reset_tracker"]);

    owner_reset_status_respond([
        "success" => true,
        "status" => "expired",
        "message" => "Recovery status tracking has expired. Check your email or submit a new recovery request if needed."
    ]);
}

$providedHash = hash("sha256", $trackingToken);

if ($trackerHash === "" || !hash_equals($trackerHash, $providedHash)) {
    owner_reset_status_respond([
        "success" => true,
        "status" => "unavailable",
        "message" => "Recovery status is not available in this browser session."
    ]);
}

/* Release the PHP session lock before database work so normal portal requests are not blocked. */
if (session_status() === PHP_SESSION_ACTIVE) {
    session_write_close();
}

rate_limit_enforce(
    $conn,
    "owner-password-reset-status",
    rate_limit_identifier(rate_limit_client_ip(), $trackingToken),
    120,
    600,
    600,
    "Too many recovery status checks. Please wait before trying again."
);

/*
 * Decoy trackers are intentionally indistinguishable from real pending
 * requests. This keeps the original forgot-password endpoint from becoming
 * an owner-account enumeration oracle.
 */
if ($requestId <= 0 || $ownerId <= 0) {
    owner_reset_status_respond([
        "success" => true,
        "status" => "pending",
        "email_sent" => false,
        "message" => "Your recovery request is waiting for administrator review. If approved, FoodConnect will automatically email the temporary password to the registered owner email."
    ]);
}

try {
    $statusStmt = $conn->prepare("
        SELECT
            req.request_status,
            req.reviewed_at,
            owner.email AS owner_email
        FROM tbl_owner_password_reset_requests AS req
        INNER JOIN tbl_users AS owner
            ON owner.user_id = req.owner_id
        WHERE req.request_id = ?
          AND req.owner_id = ?
          AND owner.role = 'owner'
        LIMIT 1
    ");

    if (!$statusStmt) {
        throw new RuntimeException("Unable to prepare owner recovery status lookup.");
    }

    $statusStmt->bind_param("ii", $requestId, $ownerId);
    $statusStmt->execute();
    $request = $statusStmt->get_result()->fetch_assoc();
    $statusStmt->close();

    if (!$request) {
        owner_reset_status_respond([
            "success" => true,
            "status" => "pending",
            "email_sent" => false,
            "message" => "Your recovery request is waiting for administrator review. If approved, FoodConnect will automatically email the temporary password to the registered owner email."
        ]);
    }

    $status = strtolower(trim((string)$request["request_status"]));

    if ($status === "approved") {
        $maskedEmail = owner_reset_status_mask_email((string)$request["owner_email"]);

        owner_reset_status_respond([
            "success" => true,
            "status" => "approved",
            "email_sent" => true,
            "owner_email_masked" => $maskedEmail,
            "reviewed_at" => $request["reviewed_at"] ?? null,
            "message" => "Password reset approved. FoodConnect sent the temporary password to {$maskedEmail}. Check your Inbox and Spam/Junk folder, then return to Owner Login."
        ]);
    }

    if ($status === "rejected") {
        owner_reset_status_respond([
            "success" => true,
            "status" => "rejected",
            "email_sent" => false,
            "reviewed_at" => $request["reviewed_at"] ?? null,
            "message" => "Your recovery request was reviewed but was not approved. Contact the FoodConnect administrator if you still need help accessing the owner account."
        ]);
    }

    owner_reset_status_respond([
        "success" => true,
        "status" => "pending",
        "email_sent" => false,
        "message" => "Your recovery request is waiting for administrator review. If approved, FoodConnect will automatically email the temporary password to the registered owner email."
    ]);
} catch (Throwable $error) {
    error_log(
        "get_owner_password_reset_status.php error: " .
        $error->getMessage()
    );

    owner_reset_status_respond([
        "success" => false,
        "message" => "Unable to check the recovery request right now."
    ], 500);
}
