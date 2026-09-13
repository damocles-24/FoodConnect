<?php
header("Content-Type: application/json; charset=utf-8");
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Pragma: no-cache");

error_reporting(E_ALL & ~E_NOTICE & ~E_WARNING);
ini_set("display_errors", "0");

require_once __DIR__ . "/session_config.php";
require_once __DIR__ . "/db.php";
require_once __DIR__ . "/rate_limit.php";
require_once __DIR__ . "/name_helper.php";

function staff_reset_request_respond(array $payload, int $code = 200): void
{
    http_response_code($code);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

if (strtoupper((string)($_SERVER["REQUEST_METHOD"] ?? "")) !== "POST") {
    staff_reset_request_respond([
        "success" => false,
        "message" => "This action is not available."
    ], 405);
}

if (empty($_SESSION["staff_access_verified"])) {
    staff_reset_request_respond([
        "success" => false,
        "message" => "Verify the restaurant staff access code first."
    ], 403);
}

$restaurantId = (int)($_SESSION["staff_access_restaurant_id"] ?? 0);
if ($restaurantId <= 0) {
    staff_reset_request_respond([
        "success" => false,
        "message" => "Verify the restaurant staff access code first."
    ], 403);
}

$input = json_decode(file_get_contents("php://input"), true);
if (!is_array($input)) {
    staff_reset_request_respond([
        "success" => false,
        "message" => "Invalid request data."
    ], 400);
}

$email = strtolower(trim((string)($input["email"] ?? "")));

if ($email === "" || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    staff_reset_request_respond([
        "success" => false,
        "message" => "Enter a valid staff email address first."
    ], 422);
}

rate_limit_enforce(
    $conn,
    "staff-owner-password-reset-request",
    rate_limit_identifier(rate_limit_client_ip(), $restaurantId . ":" . $email),
    3,
    900,
    900,
    "Too many password recovery requests. Please wait 15 minutes and try again."
);

/*
 * The public-facing response deliberately stays generic. A valid restaurant
 * access code is already required, but the response still avoids confirming
 * whether a particular email exists.
 */
$genericSuccess = [
    "success" => true,
    "message" => "If this email belongs to an active cashier or delivery staff account, your restaurant owner will see the password reset request in Staff Management."
];

try {
    $stmt = $conn->prepare("
        SELECT
            user_id,
            restaurant_id,
            role,
            first_name,
            middle_name,
            last_name,
            status,
            reset_token_hash,
            reset_token_expires
        FROM tbl_users
        WHERE email = ?
          AND restaurant_id = ?
          AND role IN ('cashier', 'delivery_staff', 'delivery_coordinator')
        LIMIT 1
    ");

    if (!$stmt) {
        throw new RuntimeException("Unable to prepare staff recovery lookup.");
    }

    $stmt->bind_param("si", $email, $restaurantId);
    if (!$stmt->execute()) {
        throw new RuntimeException("Unable to load the staff account.");
    }

    $user = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    if (!$user || (int)$user["status"] !== 1) {
        staff_reset_request_respond($genericSuccess);
    }

    $hasActiveRequest =
        !empty($user["reset_token_hash"]) &&
        !empty($user["reset_token_expires"]) &&
        strtotime((string)$user["reset_token_expires"]) >= time();

    if (!$hasActiveRequest) {
        $opaqueRequestSecret = bin2hex(random_bytes(32));
        $requestHash = password_hash($opaqueRequestSecret, PASSWORD_DEFAULT);
        $requestExpires = date("Y-m-d H:i:s", time() + (7 * 24 * 60 * 60));

        if ($requestHash === false) {
            throw new RuntimeException("Unable to create recovery request marker.");
        }

        $conn->begin_transaction();

        $updateStmt = $conn->prepare("
            UPDATE tbl_users
            SET reset_token_hash = ?,
                reset_token_expires = ?
            WHERE user_id = ?
              AND restaurant_id = ?
              AND role IN ('cashier', 'delivery_staff', 'delivery_coordinator')
        ");

        if (!$updateStmt) {
            throw new RuntimeException("Unable to prepare recovery request update.");
        }

        $staffUserId = (int)$user["user_id"];
        $updateStmt->bind_param("ssii", $requestHash, $requestExpires, $staffUserId, $restaurantId);

        if (!$updateStmt->execute() || (int)$updateStmt->affected_rows !== 1) {
            $updateStmt->close();
            throw new RuntimeException("Unable to save the recovery request.");
        }

        $updateStmt->close();

        $logStmt = $conn->prepare("
            INSERT INTO tbl_activity_logs (
                restaurant_id,
                user_id,
                user_role,
                action_type,
                action_title,
                action_description
            ) VALUES (?, ?, ?, 'security', 'Staff Password Reset Requested', ?)
        ");

        if ($logStmt) {
            $staffRole = strtolower(trim((string)$user["role"]));
            $staffName = formatUserName($user);
            $description = $staffName . " requested owner-assisted password recovery from the staff portal.";
            $logStmt->bind_param("iiss", $restaurantId, $staffUserId, $staffRole, $description);
            $logStmt->execute();
            $logStmt->close();
        }

        $conn->commit();
    }

    staff_reset_request_respond($genericSuccess);
} catch (Throwable $error) {
    try {
        $conn->rollback();
    } catch (Throwable $ignored) {
    }

    error_log(
        "request_staff_password_reset.php error: " .
        $error->getMessage()
    );

    staff_reset_request_respond([
        "success" => false,
        "message" => "Unable to send the password reset request right now. Please try again."
    ], 500);
}
