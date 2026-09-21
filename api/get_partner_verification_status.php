<?php
header("Content-Type: application/json; charset=utf-8");
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Pragma: no-cache");

error_reporting(E_ALL & ~E_NOTICE & ~E_WARNING);
ini_set("display_errors", "0");

require_once __DIR__ . "/session_config.php";
require_once __DIR__ . "/db.php";

function respond_json(array $data, int $statusCode = 200): void
{
    http_response_code($statusCode);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function mask_email_address(string $email): string
{
    $parts = explode("@", $email, 2);
    if (count($parts) !== 2) {
        return $email;
    }

    [$local, $domain] = $parts;
    $length = strlen($local);

    if ($length <= 2) {
        $masked = substr($local, 0, 1) . "*";
    } else {
        $masked = substr($local, 0, 2) . str_repeat("*", max(2, $length - 2));
    }

    return $masked . "@" . $domain;
}

if (empty($_SESSION["user_id"])) {
    respond_json([
        "success" => false,
        "message" => "Please log in to your partner application."
    ], 401);
}

$sessionRole = strtolower(trim((string)($_SESSION["role"] ?? "")));
if (!in_array($sessionRole, ["owner", "partner_applicant"], true)) {
    respond_json([
        "success" => false,
        "message" => "Partner application access is required."
    ], 403);
}

$ownerId = (int)$_SESSION["user_id"];

$stmt = $conn->prepare("
    SELECT
        u.user_id,
        u.role,
        u.email,
        u.status AS owner_status,
        u.is_verified,
        u.verification_expires_at,
        u.restaurant_id,
        pa.application_id,
        pa.application_status
    FROM tbl_users u
    INNER JOIN tbl_partner_applications pa
        ON pa.owner_id = u.user_id
    WHERE u.user_id = ?
      AND u.role = 'owner'
    ORDER BY pa.application_id DESC
    LIMIT 1
");

if (!$stmt) {
    respond_json([
        "success" => false,
        "message" => "Unable to load email verification status."
    ], 500);
}

$stmt->bind_param("i", $ownerId);
$stmt->execute();
$record = $stmt->get_result()->fetch_assoc();
$stmt->close();

if (!$record) {
    respond_json([
        "success" => false,
        "message" => "Partner application not found."
    ], 404);
}

$isVerified = (int)$record["is_verified"] === 1;
$applicationStatus = strtolower(trim((string)$record["application_status"]));
$expiresAt = $record["verification_expires_at"] ?: null;
$linkExpired = false;

if (!$isVerified && $expiresAt) {
    $expiryTimestamp = strtotime((string)$expiresAt);
    $linkExpired = $expiryTimestamp !== false && $expiryTimestamp < time();
}

/*
 * Once the database confirms verification, promote a restricted applicant
 * session to a normal owner session. This keeps a wizard tab open safely when
 * verification was completed from another tab or device.
 */
if (
    $isVerified &&
    (int)$record["owner_status"] === 1 &&
    $sessionRole === "partner_applicant"
) {
    $_SESSION["role"] = "owner";
    $_SESSION["restaurant_id"] = !empty($record["restaurant_id"])
        ? (int)$record["restaurant_id"]
        : null;

    unset(
        $_SESSION["partner_application_only"],
        $_SESSION["account_role"]
    );
}

$request = null;
$requestStmt = $conn->prepare("
    SELECT
        request_id,
        request_status,
        requested_at,
        reviewed_at,
        sent_at,
        rejection_reason,
        updated_at
    FROM tbl_partner_verification_resend_requests
    WHERE application_id = ?
      AND owner_id = ?
    ORDER BY request_id DESC
    LIMIT 1
");

if ($requestStmt) {
    $applicationId = (int)$record["application_id"];
    $requestStmt->bind_param("ii", $applicationId, $ownerId);
    $requestStmt->execute();
    $row = $requestStmt->get_result()->fetch_assoc();
    $requestStmt->close();

    if ($row) {
        $request = [
            "request_id" => (int)$row["request_id"],
            "status" => strtolower((string)$row["request_status"]),
            "requested_at" => $row["requested_at"],
            "reviewed_at" => $row["reviewed_at"],
            "sent_at" => $row["sent_at"],
            "rejection_reason" => $row["rejection_reason"],
            "updated_at" => $row["updated_at"]
        ];
    }
}

$canRequestResend = !$isVerified && $applicationStatus === "email_pending";

if ($canRequestResend && $request) {
    $requestStatus = (string)$request["status"];

    if (in_array($requestStatus, ["pending", "processing", "send_failed"], true)) {
        $canRequestResend = false;
    } elseif ($requestStatus === "sent" && !empty($request["sent_at"])) {
        $sentTimestamp = strtotime((string)$request["sent_at"]);
        if ($sentTimestamp !== false && $sentTimestamp >= time() - 86400) {
            $canRequestResend = false;
        }
    } elseif ($requestStatus === "rejected" && !empty($request["reviewed_at"])) {
        $reviewedTimestamp = strtotime((string)$request["reviewed_at"]);
        if ($reviewedTimestamp !== false && $reviewedTimestamp >= time() - 86400) {
            $canRequestResend = false;
        }
    }
}

respond_json([
    "success" => true,
    "email_verification" => [
        "is_verified" => $isVerified,
        "application_id" => (int)$record["application_id"],
        "application_status" => $applicationStatus,
        "registered_email_masked" => mask_email_address((string)$record["email"]),
        "verification_expires_at" => $expiresAt,
        "link_expired" => $linkExpired,
        "can_request_resend" => $canRequestResend,
        "request" => $request
    ]
]);
