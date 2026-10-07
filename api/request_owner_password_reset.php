<?php

header("Content-Type: application/json; charset=utf-8");
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Pragma: no-cache");

error_reporting(E_ALL & ~E_NOTICE & ~E_WARNING);
ini_set("display_errors", "0");

/* =========================================================
   OWNER PASSWORD RESET — REQUEST A RESET LINK

   Self-service flow. The owner enters the registered owner
   email; if it belongs to an active, verified owner account a
   single-use link (valid 30 minutes) is emailed. No password is
   ever generated or emailed.

   The response is always the same generic message so this
   endpoint cannot be used to discover which emails are owners.
   ========================================================= */

require_once __DIR__ . "/db.php";
require_once __DIR__ . "/rate_limit.php";
require_once __DIR__ . "/mailer.php";
require_once __DIR__ . "/url_helper.php";
require_once __DIR__ . "/name_helper.php";

const OWNER_RESET_TOKEN_LIFETIME_MINUTES = 30;
const OWNER_RESET_RESEND_COOLDOWN_SECONDS = 60;

function owner_reset_request_respond(array $payload, int $code = 200): void
{
    http_response_code($code);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function build_owner_password_reset_email(string $ownerName, string $resetLink): string
{
    $safeName = htmlspecialchars(
        $ownerName !== "" ? $ownerName : "Restaurant Owner",
        ENT_QUOTES,
        "UTF-8"
    );

    $safeLink = htmlspecialchars($resetLink, ENT_QUOTES, "UTF-8");

    $logoUrl = "https://raw.githubusercontent.com/damocles-24/IMAGES/refs/heads/main/05f3b888-5229-477b-87a0-0b27c7ddee38%20(1)-Photoroom%20(2).png";

    return "
<!doctype html>
<html>
<head>
  <meta charset='UTF-8'>
  <meta name='viewport' content='width=device-width, initial-scale=1.0'>
  <title>FoodConnect Password Reset</title>
</head>
<body style='margin:0;padding:0;background:#f4f5f7;font-family:Arial,Helvetica,sans-serif;color:#1f2937;'>
  <table role='presentation' width='100%' cellspacing='0' cellpadding='0' border='0' style='width:100%;background:#f4f5f7;margin:0;padding:0;'>
    <tr>
      <td align='center' style='padding:32px 14px;'>
        <table role='presentation' width='100%' cellspacing='0' cellpadding='0' border='0' style='width:100%;max-width:560px;background:#ffffff;border:1px solid #e8e8e8;border-radius:18px;overflow:hidden;'>
          <tr>
            <td style='padding:20px 28px;border-bottom:1px solid #eeeeee;background:#ffffff;'>
              <table role='presentation' width='100%' cellspacing='0' cellpadding='0' border='0'>
                <tr>
                  <td style='vertical-align:middle;'>
                    <img src='{$logoUrl}' alt='FoodConnect' width='150' style='display:block;width:150px;max-width:100%;height:auto;border:0;'>
                  </td>
                  <td align='right' style='vertical-align:middle;color:#98a2b3;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;'>
                    Security
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style='padding:36px 34px 32px;'>
              <h1 style='margin:0 0 10px;color:#171717;font-size:26px;line-height:1.25;font-weight:800;'>
                Reset your owner password
              </h1>
              <p style='margin:0 0 12px;color:#667085;font-size:14px;line-height:1.7;'>
                Hello {$safeName},
              </p>
              <p style='margin:0 0 12px;color:#667085;font-size:14px;line-height:1.7;'>
                A password reset request was made for your owner account.
              </p>
              <p style='margin:0 0 22px;color:#667085;font-size:14px;line-height:1.7;'>
                Click the link below to create a new password.
              </p>
              <table role='presentation' cellspacing='0' cellpadding='0' border='0' style='margin:0 0 22px;'>
                <tr>
                  <td bgcolor='#f78021' style='border-radius:11px;'>
                    <a href='{$safeLink}' target='_blank' style='display:inline-block;padding:14px 24px;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;line-height:1;border-radius:11px;'>
                      Create New Password
                    </a>
                  </td>
                </tr>
              </table>
              <table role='presentation' width='100%' cellspacing='0' cellpadding='0' border='0' style='width:100%;margin:0 0 22px;background:#fff8f2;border:1px solid #ffe1cb;border-radius:12px;'>
                <tr>
                  <td style='padding:14px 16px;color:#9a4b16;font-size:12px;line-height:1.6;'>
                    <strong>Reset link expires after 30 minutes.</strong><br>
                    The link can only be used once.
                  </td>
                </tr>
              </table>
              <p style='margin:0;color:#667085;font-size:12px;line-height:1.7;'>
                If you did not request a password reset, you can safely ignore this email.
                Your current password will remain unchanged.
              </p>
              <div style='height:1px;background:#eeeeee;margin:28px 0 20px;'></div>
              <p style='margin:0 0 8px;color:#98a2b3;font-size:10px;line-height:1.6;'>
                Button not working? Copy and paste this link into your browser:
              </p>
              <p style='margin:0;word-break:break-all;color:#667085;font-size:10px;line-height:1.6;'>
                {$safeLink}
              </p>
            </td>
          </tr>
          <tr>
            <td align='center' style='padding:18px 24px;background:#171717;color:#b8bcc4;font-size:10px;line-height:1.6;'>
              <strong style='color:#ffffff;'>FoodConnect</strong><br>
              Food ordering made simple.
            </td>
          </tr>
        </table>
        <p style='max-width:560px;margin:16px auto 0;color:#98a2b3;font-size:10px;line-height:1.6;text-align:center;'>
          This is an automated security email from FoodConnect.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
";
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

if ($email === "") {
    owner_reset_request_respond([
        "success" => false,
        "message" => "Enter your registered owner email."
    ], 422);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 150) {
    owner_reset_request_respond([
        "success" => false,
        "message" => "Enter a valid email address."
    ], 422);
}

/* Per-email + per-IP limits. Every valid request counts, matched or not. */
rate_limit_enforce(
    $conn,
    "owner-password-reset-request",
    rate_limit_identifier(rate_limit_client_ip(), $email),
    3,
    900,
    900,
    "Too many password reset requests. Please wait 15 minutes and try again."
);

rate_limit_enforce(
    $conn,
    "owner-password-reset-request-ip",
    rate_limit_identifier(rate_limit_client_ip()),
    10,
    3600,
    3600,
    "Too many password reset requests. Please wait before trying again."
);

$genericSuccess = [
    "success" => true,
    "message" => "If this email belongs to a registered FoodConnect owner account, a password reset link has been sent. Check your inbox and Spam/Junk folder. The link expires after 30 minutes."
];

try {
    /* Housekeeping: purge tokens that are used or expired. */
    $purgeStmt = $conn->prepare("
        DELETE FROM tbl_owner_password_reset_tokens
        WHERE used_at IS NOT NULL
           OR expires_at <= NOW()
    ");

    if ($purgeStmt) {
        $purgeStmt->execute();
        $purgeStmt->close();
    }

    $ownerStmt = $conn->prepare("
        SELECT
            user_id,
            first_name,
            middle_name,
            last_name,
            email,
            status,
            is_verified
        FROM tbl_users
        WHERE email = ?
          AND role = 'owner'
        LIMIT 1
    ");

    if (!$ownerStmt) {
        throw new RuntimeException("Unable to prepare owner lookup.");
    }

    $ownerStmt->bind_param("s", $email);
    $ownerStmt->execute();
    $owner = $ownerStmt->get_result()->fetch_assoc();
    $ownerStmt->close();

    if (
        !$owner ||
        (int)$owner["status"] !== 1 ||
        (int)$owner["is_verified"] !== 1
    ) {
        owner_reset_request_respond($genericSuccess);
    }

    $ownerId = (int)$owner["user_id"];

    /* Do not let one inbox be flooded: one email per cooldown window. */
    $recentStmt = $conn->prepare("
        SELECT token_id
        FROM tbl_owner_password_reset_tokens
        WHERE owner_id = ?
          AND created_at > DATE_SUB(NOW(), INTERVAL ? SECOND)
        LIMIT 1
    ");

    if ($recentStmt) {
        $cooldown = OWNER_RESET_RESEND_COOLDOWN_SECONDS;
        $recentStmt->bind_param("ii", $ownerId, $cooldown);
        $recentStmt->execute();
        $recent = $recentStmt->get_result()->fetch_assoc();
        $recentStmt->close();

        if ($recent) {
            owner_reset_request_respond($genericSuccess);
        }
    }

    $selector = bin2hex(random_bytes(16));
    $secret = bin2hex(random_bytes(32));
    $secretHash = hash("sha256", $secret);
    $requestedIp = substr(rate_limit_client_ip(), 0, 45);
    $lifetime = OWNER_RESET_TOKEN_LIFETIME_MINUTES;

    $conn->begin_transaction();

    /* Any earlier unused link for this owner stops working. */
    $invalidateStmt = $conn->prepare("
        DELETE FROM tbl_owner_password_reset_tokens
        WHERE owner_id = ?
    ");

    if (!$invalidateStmt) {
        throw new RuntimeException("Unable to prepare token invalidation.");
    }

    $invalidateStmt->bind_param("i", $ownerId);
    $invalidateStmt->execute();
    $invalidateStmt->close();

    $insertStmt = $conn->prepare("
        INSERT INTO tbl_owner_password_reset_tokens (
            owner_id,
            selector,
            token_hash,
            expires_at,
            requested_ip
        ) VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL ? MINUTE), ?)
    ");

    if (!$insertStmt) {
        throw new RuntimeException("Unable to prepare reset token.");
    }

    $insertStmt->bind_param(
        "issis",
        $ownerId,
        $selector,
        $secretHash,
        $lifetime,
        $requestedIp
    );

    if (!$insertStmt->execute()) {
        $insertStmt->close();
        throw new RuntimeException("Unable to save reset token.");
    }

    $insertStmt->close();
    $conn->commit();

    $resetLink = foodconnect_url(
        "frontend/html/reset_owner_password.html",
        ["token" => $selector . $secret]
    );

    $sent = sendBrevoSMTP(
        (string)$owner["email"],
        "FoodConnect Password Reset",
        build_owner_password_reset_email(
            formatUserName($owner),
            $resetLink
        )
    );

    if (!$sent) {
        /* The link never reached the owner, so do not leave it valid. */
        $cleanupStmt = $conn->prepare("
            DELETE FROM tbl_owner_password_reset_tokens
            WHERE selector = ?
        ");

        if ($cleanupStmt) {
            $cleanupStmt->bind_param("s", $selector);
            $cleanupStmt->execute();
            $cleanupStmt->close();
        }

        error_log("request_owner_password_reset.php: reset email could not be sent.");
    }

    /*
     * Same response whether or not the email was sent, so mail
     * failures cannot be used to tell which emails are owners.
     */
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
        "message" => "Unable to process the request right now. Please try again later."
    ], 500);
}
