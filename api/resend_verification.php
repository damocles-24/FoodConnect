<?php
header("Content-Type: application/json; charset=utf-8");
header("Cache-Control: no-store, no-cache, must-revalidate");
header("Pragma: no-cache");

require_once __DIR__ . "/db.php";
require_once __DIR__ . "/name_helper.php";
require_once __DIR__ . "/rate_limit.php";
require_once __DIR__ . "/mailer.php";
require_once __DIR__ . "/url_helper.php";

function respond_json(array $data, int $statusCode = 200): void
{
    http_response_code($statusCode);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

if (strtoupper((string)($_SERVER["REQUEST_METHOD"] ?? "")) !== "POST") {
    header("Allow: POST");
    respond_json([
        "success" => false,
        "message" => "This action is not available."
    ], 405);
}

$input = json_decode(file_get_contents("php://input"), true);
$email = strtolower(trim((string)($input["email"] ?? "")));

if ($email === "" || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    respond_json([
        "success" => false,
        "message" => "Enter a valid email address."
    ], 422);
}

rate_limit_enforce(
    $conn,
    "verification-email-resend",
    rate_limit_identifier(rate_limit_client_ip(), $email),
    3,
    600,
    600,
    "Too many verification email requests. Please wait 10 minutes and try again."
);

$userNameSql = userNameSqlExpression();

$stmt = $conn->prepare("
    SELECT
        user_id,
        role,
        {$userNameSql} AS display_name,
        is_verified
    FROM tbl_users
    WHERE email = ?
    LIMIT 1
");

if (!$stmt) {
    respond_json([
        "success" => false,
        "message" => "Unable to process the verification request right now."
    ], 500);
}

$stmt->bind_param("s", $email);
$stmt->execute();
$user = $stmt->get_result()->fetch_assoc();
$stmt->close();

/* Do not reveal whether an arbitrary customer email exists. */
if (!$user) {
    respond_json([
        "success" => true,
        "message" => "If that email exists, a verification link will be sent when eligible."
    ]);
}

if ((int)$user["is_verified"] === 1) {
    respond_json([
        "success" => true,
        "message" => "Your account is already verified."
    ]);
}

$role = strtolower(trim((string)($user["role"] ?? "")));

/*
 * IMPORTANT: partner-owner verification cannot be resent directly anymore.
 * The applying owner must request it first, and an authenticated FoodConnect
 * administrator must approve/send it through the dedicated partner workflow.
 * Customer verification resend remains unchanged below.
 */
if ($role === "owner") {
    $ownerId = (int)$user["user_id"];

    $applicationStmt = $conn->prepare("
        SELECT application_id, application_status
        FROM tbl_partner_applications
        WHERE owner_id = ?
        ORDER BY application_id DESC
        LIMIT 1
    ");

    if ($applicationStmt) {
        $applicationStmt->bind_param("i", $ownerId);
        $applicationStmt->execute();
        $application = $applicationStmt->get_result()->fetch_assoc();
        $applicationStmt->close();

        if (
            $application &&
            strtolower((string)$application["application_status"]) === "email_pending"
        ) {
            respond_json([
                "success" => false,
                "message" => "Partner verification emails require administrator approval. Use the partner application page to request a new verification email."
            ], 403);
        }
    }

    respond_json([
        "success" => false,
        "message" => "This owner account is not eligible for direct verification resend."
    ], 403);
}

$token = bin2hex(random_bytes(32));
$expiresAt = date("Y-m-d H:i:s", time() + 86400);
$uid = (int)$user["user_id"];

$upd = $conn->prepare("
    UPDATE tbl_users
    SET verification_token = ?,
        verification_expires_at = ?
    WHERE user_id = ?
      AND is_verified = 0
    LIMIT 1
");

if (!$upd) {
    respond_json([
        "success" => false,
        "message" => "Unable to prepare a new verification link."
    ], 500);
}

$upd->bind_param("ssi", $token, $expiresAt, $uid);

if (!$upd->execute()) {
    $upd->close();
    respond_json([
        "success" => false,
        "message" => "Unable to create a new verification link."
    ], 500);
}

$upd->close();

$link = foodconnect_verification_url($token);
$safeName = htmlspecialchars((string)$user["display_name"], ENT_QUOTES, "UTF-8");

$htmlBody = "
<!doctype html>
<html><body style='margin:0;background:#f6f7fb;font-family:Arial,Helvetica,sans-serif;'>
  <table width='100%' cellpadding='0' cellspacing='0' style='padding:24px'><tr><td align='center'>
    <table width='520' cellpadding='0' cellspacing='0' style='background:#fff;border-radius:16px;padding:28px;box-shadow:0 8px 30px rgba(0,0,0,.06)'>
      <tr><td align='center' style='padding-bottom:10px'><div style='font-size:22px;font-weight:bold;color:#ff7a00'>FoodConnect</div></td></tr>
      <tr><td style='font-size:20px;font-weight:bold'>Verify your email</td></tr>
      <tr><td style='color:#444;padding-top:12px;line-height:1.6'>
        Hi {$safeName},<br><br>
        Here is your new verification link (valid for 24 hours).
      </td></tr>
      <tr><td align='center' style='padding:28px 0'>
        <a href='{$link}' style='background:#ff7a00;color:#fff;text-decoration:none;padding:14px 22px;border-radius:12px;font-weight:bold;display:inline-block'>Verify Email</a>
      </td></tr>
      <tr><td style='color:#666;font-size:13px;line-height:1.6'>
        If the button does not work, copy and paste this link:<br><br>
        <span style='word-break:break-all;color:#ff7a00'>{$link}</span>
      </td></tr>
    </table>
  </td></tr></table>
</body></html>
";

$emailSent = sendBrevoSMTP(
    $email,
    "Verify your FoodConnect account",
    $htmlBody
);

if (!$emailSent) {
    respond_json([
        "success" => false,
        "message" => "FoodConnect could not send the verification email right now. Please try again shortly."
    ], 502);
}

respond_json([
    "success" => true,
    "message" => "Verification email sent. Please check your inbox."
]);
