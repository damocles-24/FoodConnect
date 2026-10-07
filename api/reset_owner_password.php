<?php

header("Content-Type: application/json; charset=utf-8");
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Pragma: no-cache");

error_reporting(E_ALL & ~E_NOTICE & ~E_WARNING);
ini_set("display_errors", "0");

/* =========================================================
   OWNER PASSWORD RESET — VALIDATE LINK / SET NEW PASSWORD

   POST JSON:
     { "action": "validate", "token": "..." }
         Checks that the emailed link is still usable (does not
         consume it).
     { "action": "reset", "token": "...",
       "new_password": "...", "confirm_password": "..." }
         Sets the new owner password and consumes the token.

   Token format: 32-hex selector + 64-hex secret (96 chars). Only a
   SHA-256 hash of the secret is stored. Tokens are single use and
   expire 30 minutes after they were requested.
   ========================================================= */

require_once __DIR__ . "/db.php";
require_once __DIR__ . "/rate_limit.php";
require_once __DIR__ . "/name_helper.php";

function owner_reset_respond(array $payload, int $code = 200): void
{
    http_response_code($code);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function owner_reset_invalid_link(): void
{
    owner_reset_respond([
        "success" => false,
        "invalid_link" => true,
        "message" => "This password reset link is invalid or has expired. Please request a new one."
    ], 400);
}

function request_is_https_for_owner_reset(): bool
{
    return !empty($_SERVER["HTTPS"]) &&
        strtolower((string)$_SERVER["HTTPS"]) !== "off";
}

function clear_owner_trusted_cookie_after_reset(): void
{
    /* Same name and path used when the trusted-device cookie is created. */
    setcookie(
        "FOODCONNECT_OWNER_TRUST",
        "",
        [
            "expires" => time() - 3600,
            "path" => "/",
            "secure" => request_is_https_for_owner_reset(),
            "httponly" => true,
            "samesite" => "Lax"
        ]
    );
}

if (strtoupper((string)($_SERVER["REQUEST_METHOD"] ?? "")) !== "POST") {
    owner_reset_respond([
        "success" => false,
        "message" => "This action is not available."
    ], 405);
}

if (!isset($conn) || !($conn instanceof mysqli)) {
    owner_reset_respond([
        "success" => false,
        "message" => "Service is temporarily unavailable. Please try again shortly."
    ], 500);
}

$conn->set_charset("utf8mb4");

$input = json_decode(file_get_contents("php://input"), true);

if (!is_array($input)) {
    owner_reset_respond([
        "success" => false,
        "message" => "Invalid request data."
    ], 400);
}

$action = strtolower(trim((string)($input["action"] ?? "reset")));

if (!in_array($action, ["validate", "reset"], true)) {
    owner_reset_respond([
        "success" => false,
        "message" => "Invalid request."
    ], 400);
}

$token = strtolower(trim((string)($input["token"] ?? "")));

if (!preg_match('/^[a-f0-9]{96}$/', $token)) {
    owner_reset_invalid_link();
}

$selector = substr($token, 0, 32);
$secretHash = hash("sha256", substr($token, 32));

if ($action === "validate") {
    rate_limit_enforce(
        $conn,
        "owner-reset-link-check",
        rate_limit_identifier(rate_limit_client_ip()),
        30,
        900,
        900,
        "Too many attempts. Please wait a few minutes and try again."
    );
} else {
    rate_limit_enforce(
        $conn,
        "owner-reset-password-submit",
        rate_limit_identifier(rate_limit_client_ip()),
        10,
        900,
        900,
        "Too many password reset attempts. Please wait 15 minutes and try again."
    );
}

/* =========================================================
   LOAD TOKEN + OWNER (row-locked when resetting)
   ========================================================= */

function owner_reset_load_token(
    mysqli $conn,
    string $selector,
    bool $lock
): ?array {
    $sql = "
        SELECT
            t.token_id,
            t.owner_id,
            t.token_hash,
            t.used_at,
            (t.expires_at > NOW()) AS is_current,
            u.role,
            u.status,
            u.is_verified,
            u.restaurant_id,
            u.first_name,
            u.middle_name,
            u.last_name,
            u.suffix
        FROM tbl_owner_password_reset_tokens AS t
        INNER JOIN tbl_users AS u
            ON u.user_id = t.owner_id
        WHERE t.selector = ?
        LIMIT 1
    ";

    if ($lock) {
        $sql .= " FOR UPDATE";
    }

    $stmt = $conn->prepare($sql);

    if (!$stmt) {
        throw new RuntimeException("Unable to prepare reset token lookup.");
    }

    $stmt->bind_param("s", $selector);
    $stmt->execute();
    $row = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    return $row ?: null;
}

function owner_reset_token_is_usable(?array $row, string $secretHash): bool
{
    return $row !== null &&
        $row["used_at"] === null &&
        (int)$row["is_current"] === 1 &&
        hash_equals((string)$row["token_hash"], $secretHash) &&
        strtolower(trim((string)$row["role"])) === "owner" &&
        (int)$row["status"] === 1 &&
        (int)$row["is_verified"] === 1;
}

try {
    if ($action === "validate") {
        $row = owner_reset_load_token($conn, $selector, false);

        if (!owner_reset_token_is_usable($row, $secretHash)) {
            owner_reset_invalid_link();
        }

        owner_reset_respond([
            "success" => true,
            "valid" => true
        ]);
    }

    /* ---------------- RESET ---------------- */

    $newPassword = (string)($input["new_password"] ?? "");
    $confirmPassword = (string)($input["confirm_password"] ?? "");

    if (strlen($newPassword) < 8) {
        owner_reset_respond([
            "success" => false,
            "message" => "New password must contain at least 8 characters."
        ], 422);
    }

    if (strlen($newPassword) > 72) {
        owner_reset_respond([
            "success" => false,
            "message" => "New password must not exceed 72 characters."
        ], 422);
    }

    if (
        !preg_match('/[A-Z]/', $newPassword) ||
        !preg_match('/[a-z]/', $newPassword) ||
        !preg_match('/\d/', $newPassword)
    ) {
        owner_reset_respond([
            "success" => false,
            "message" => "Use at least one uppercase letter, one lowercase letter, and one number."
        ], 422);
    }

    if ($newPassword !== $confirmPassword) {
        owner_reset_respond([
            "success" => false,
            "message" => "New password and confirmation do not match."
        ], 422);
    }

    $passwordHash = password_hash($newPassword, PASSWORD_DEFAULT);

    if ($passwordHash === false) {
        throw new RuntimeException("Unable to securely process the new password.");
    }

    $conn->begin_transaction();

    /* Lock the token row so two submissions cannot both succeed. */
    $row = owner_reset_load_token($conn, $selector, true);

    if (!owner_reset_token_is_usable($row, $secretHash)) {
        $conn->rollback();
        owner_reset_invalid_link();
    }

    $ownerId = (int)$row["owner_id"];
    $restaurantId = (int)($row["restaurant_id"] ?? 0);
    $ownerName = formatUserName($row);

    /*
     * Owner only. must_change_password is cleared so an owner left
     * flagged by the retired temporary-password workflow can log in
     * again. Remembered-login tokens are revoked.
     */
    $updateStmt = $conn->prepare("
        UPDATE tbl_users
        SET password_hash = ?,
            must_change_password = 0,
            remember_token_hash = NULL,
            remember_token_expires = NULL
        WHERE user_id = ?
          AND role = 'owner'
          AND status = 1
          AND is_verified = 1
        LIMIT 1
    ");

    if (!$updateStmt) {
        throw new RuntimeException("Unable to prepare the owner password update.");
    }

    $updateStmt->bind_param("si", $passwordHash, $ownerId);

    if (!$updateStmt->execute() || $updateStmt->affected_rows !== 1) {
        $updateStmt->close();
        throw new RuntimeException("The owner password could not be updated.");
    }

    $updateStmt->close();

    /* Revoke every trusted device so the next login needs the email code. */
    $trustedStmt = $conn->prepare("
        DELETE FROM tbl_owner_trusted_devices
        WHERE owner_id = ?
    ");

    if ($trustedStmt) {
        $trustedStmt->bind_param("i", $ownerId);
        $trustedStmt->execute();
        $trustedStmt->close();
    }

    /* Single use: remove this token and any other for the owner. */
    $deleteStmt = $conn->prepare("
        DELETE FROM tbl_owner_password_reset_tokens
        WHERE owner_id = ?
    ");

    if (!$deleteStmt) {
        throw new RuntimeException("Unable to clear the used reset token.");
    }

    $deleteStmt->bind_param("i", $ownerId);
    $deleteStmt->execute();
    $deleteStmt->close();

    if ($restaurantId > 0) {
        $description =
            ($ownerName !== "" ? $ownerName : "The restaurant owner") .
            " reset the owner account password using an emailed reset link.";

        $logStmt = $conn->prepare("
            INSERT INTO tbl_activity_logs (
                restaurant_id,
                user_id,
                user_role,
                action_type,
                action_title,
                action_description
            ) VALUES (?, ?, 'owner', 'owner_password_reset', 'Owner Password Reset', ?)
        ");

        if ($logStmt) {
            $logStmt->bind_param("iis", $restaurantId, $ownerId, $description);
            $logStmt->execute();
            $logStmt->close();
        }
    }

    $conn->commit();

    clear_owner_trusted_cookie_after_reset();

    owner_reset_respond([
        "success" => true,
        "message" => "Password successfully changed. You may now login."
    ]);
} catch (Throwable $error) {
    try {
        $conn->rollback();
    } catch (Throwable $ignored) {
    }

    error_log(
        "reset_owner_password.php error: " .
        $error->getMessage()
    );

    owner_reset_respond([
        "success" => false,
        "message" => "Unable to reset the password right now. Please try again later."
    ], 500);
}
