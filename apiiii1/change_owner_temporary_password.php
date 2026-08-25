<?php

header("Content-Type: application/json; charset=utf-8");
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Pragma: no-cache");

error_reporting(E_ALL & ~E_NOTICE & ~E_WARNING);
ini_set("display_errors", "0");

require_once __DIR__ . "/session_config.php";
require_once __DIR__ . "/db.php";
require_once __DIR__ . "/name_helper.php";
require_once __DIR__ . "/rate_limit.php";

function owner_temp_password_respond(array $payload, int $code = 200): void
{
    http_response_code($code);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function clear_owner_password_change_session(): void
{
    unset(
        $_SESSION["owner_password_change_user_id"],
        $_SESSION["owner_password_change_restaurant_id"],
        $_SESSION["owner_password_change_full_name"],
        $_SESSION["owner_password_change_email"],
        $_SESSION["owner_password_change_started_at"]
    );
}

function request_is_https_for_owner_password(): bool
{
    return !empty($_SERVER["HTTPS"]) && strtolower((string)$_SERVER["HTTPS"]) !== "off";
}

function clear_owner_trusted_cookie_for_password_change(): void
{
    setcookie(
        "FOODCONNECT_OWNER_TRUST",
        "",
        [
            "expires" => time() - 3600,
            "path" => "/FoodConnect",
            "secure" => request_is_https_for_owner_password(),
            "httponly" => true,
            "samesite" => "Lax"
        ]
    );
}

if (strtoupper((string)($_SERVER["REQUEST_METHOD"] ?? "")) !== "POST") {
    owner_temp_password_respond([
        "success" => false,
        "message" => "This action is not available."
    ], 405);
}

$userId = (int)($_SESSION["owner_password_change_user_id"] ?? 0);
$restaurantId = (int)($_SESSION["owner_password_change_restaurant_id"] ?? 0);
$startedAt = (int)($_SESSION["owner_password_change_started_at"] ?? 0);

if ($userId <= 0 || $startedAt <= 0 || (time() - $startedAt) > 900) {
    clear_owner_password_change_session();

    owner_temp_password_respond([
        "success" => false,
        "message" => "Your password-change session expired. Enter the temporary password again.",
        "login_required" => true
    ], 401);
}

rate_limit_enforce(
    $conn,
    "owner-temporary-password-change",
    rate_limit_identifier((string)$userId, rate_limit_client_ip()),
    8,
    900,
    900,
    "Too many password-change attempts. Please wait and try again."
);

$input = json_decode(file_get_contents("php://input"), true);
if (!is_array($input)) {
    owner_temp_password_respond([
        "success" => false,
        "message" => "Invalid request data."
    ], 400);
}

$newPassword = (string)($input["new_password"] ?? "");
$confirmPassword = (string)($input["confirm_password"] ?? "");

if (strlen($newPassword) < 8) {
    owner_temp_password_respond([
        "success" => false,
        "message" => "New password must contain at least 8 characters."
    ], 422);
}

if (!preg_match('/[A-Z]/', $newPassword) || !preg_match('/[a-z]/', $newPassword) || !preg_match('/\d/', $newPassword)) {
    owner_temp_password_respond([
        "success" => false,
        "message" => "Use at least one uppercase letter, one lowercase letter, and one number."
    ], 422);
}

if ($newPassword !== $confirmPassword) {
    owner_temp_password_respond([
        "success" => false,
        "message" => "New password and confirmation do not match."
    ], 422);
}

try {
    $ownerNameSql = userNameSqlExpression();

    $ownerStmt = $conn->prepare("
        SELECT
            user_id,
            restaurant_id,
            role,
            {$ownerNameSql} AS full_name,
            email,
            password_hash,
            status,
            is_verified,
            must_change_password
        FROM tbl_users
        WHERE user_id = ?
        LIMIT 1
    ");

    if (!$ownerStmt) {
        throw new RuntimeException("Unable to prepare owner account lookup.");
    }

    $ownerStmt->bind_param("i", $userId);
    $ownerStmt->execute();
    $owner = $ownerStmt->get_result()->fetch_assoc();
    $ownerStmt->close();

    if (
        !$owner ||
        strtolower(trim((string)$owner["role"])) !== "owner" ||
        (int)$owner["status"] !== 1 ||
        (int)$owner["is_verified"] !== 1
    ) {
        clear_owner_password_change_session();

        owner_temp_password_respond([
            "success" => false,
            "message" => "This owner account is not available for password recovery."
        ], 403);
    }

    if ((int)$owner["must_change_password"] !== 1) {
        clear_owner_password_change_session();

        owner_temp_password_respond([
            "success" => false,
            "message" => "A password change is no longer required for this owner account."
        ], 409);
    }

    if (password_verify($newPassword, (string)$owner["password_hash"])) {
        owner_temp_password_respond([
            "success" => false,
            "message" => "Choose a new password that is different from the temporary password."
        ], 422);
    }

    $passwordHash = password_hash($newPassword, PASSWORD_DEFAULT);
    if ($passwordHash === false) {
        throw new RuntimeException("Unable to securely process the new password.");
    }

    $conn->begin_transaction();

    $updateStmt = $conn->prepare("
        UPDATE tbl_users
        SET password_hash = ?,
            must_change_password = 0,
            remember_token_hash = NULL,
            remember_token_expires = NULL,
            reset_token_hash = NULL,
            reset_token_expires = NULL
        WHERE user_id = ?
          AND role = 'owner'
          AND must_change_password = 1
    ");

    if (!$updateStmt) {
        throw new RuntimeException("Unable to prepare the new owner password.");
    }

    $updateStmt->bind_param("si", $passwordHash, $userId);
    $updateStmt->execute();

    if ((int)$updateStmt->affected_rows !== 1) {
        $updateStmt->close();
        throw new RuntimeException("The owner password could not be updated.");
    }

    $updateStmt->close();

    $trustedStmt = $conn->prepare("
        DELETE FROM tbl_owner_trusted_devices
        WHERE owner_id = ?
    ");

    if ($trustedStmt) {
        $trustedStmt->bind_param("i", $userId);
        $trustedStmt->execute();
        $trustedStmt->close();
    }

    $resolvedRestaurantId = (int)($owner["restaurant_id"] ?? $restaurantId);

    if ($resolvedRestaurantId > 0) {
        $description = (string)$owner["full_name"] .
            " created a new private password after an administrator-assisted account recovery.";

        $logStmt = $conn->prepare("
            INSERT INTO tbl_activity_logs (
                restaurant_id,
                user_id,
                user_role,
                action_type,
                action_title,
                action_description
            ) VALUES (?, ?, 'owner', 'owner_password_reset', 'Owner Password Changed', ?)
        ");

        if ($logStmt) {
            $logStmt->bind_param("iis", $resolvedRestaurantId, $userId, $description);
            $logStmt->execute();
            $logStmt->close();
        }
    }

    $conn->commit();

    clear_owner_password_change_session();
    clear_owner_trusted_cookie_for_password_change();

    /* Ensure the recovery flow never leaves an authenticated owner session behind. */
    unset(
        $_SESSION["user_id"],
        $_SESSION["role"],
        $_SESSION["restaurant_id"],
        $_SESSION["full_name"],
        $_SESSION["logged_in"],
        $_SESSION["authenticated_at"],
        $_SESSION["owner_email_verified_at"],
        $_SESSION["owner_trusted_device"],
        $_SESSION["pending_owner_login"]
    );

    session_regenerate_id(true);
    session_write_close();

    owner_temp_password_respond([
        "success" => true,
        "message" => "Your new password was saved. Log in again with the new password to continue to owner verification.",
        "login_required" => true
    ]);
} catch (Throwable $error) {
    try {
        $conn->rollback();
    } catch (Throwable $ignored) {
    }

    error_log(
        "change_owner_temporary_password.php error: " .
        $error->getMessage()
    );

    owner_temp_password_respond([
        "success" => false,
        "message" => "Unable to save the new owner password right now."
    ], 500);
}
