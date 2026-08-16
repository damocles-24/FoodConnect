<?php
header("Content-Type: application/json; charset=utf-8");
require_once __DIR__ . "/db.php";
require_once __DIR__ . "/rate_limit.php";
require_once __DIR__ . "/mailer.php";

$input = json_decode(file_get_contents("php://input"), true);
$email = trim($input["email"] ?? "");

if ($email === "") {
  http_response_code(400);
  echo json_encode(["error" => "Email is required"]);
  exit;
}

rate_limit_enforce(
  $conn,
  "verification-email-resend",
  rate_limit_identifier(rate_limit_client_ip(), strtolower($email)),
  3,
  600,
  600,
  "Too many verification email requests. Please wait 10 minutes and try again."
);

$stmt = $conn->prepare("
  SELECT user_id, full_name, is_verified
  FROM tbl_users
  WHERE email = ?
  LIMIT 1
");
$stmt->bind_param("s", $email);
$stmt->execute();
$user = $stmt->get_result()->fetch_assoc();

// ✅ Professional: don't reveal if email exists
if (!$user) {
  echo json_encode(["success" => true, "message" => "If that email exists, we sent a verification link."]);
  exit;
}

if ((int)$user["is_verified"] === 1) {
  echo json_encode(["success" => true, "message" => "Your account is already verified."]);
  exit;
}

// Create new token + expiry
$token = bin2hex(random_bytes(16));
$expires_at = date("Y-m-d H:i:s", time() + (24 * 60 * 60)); // 24 hours

$upd = $conn->prepare("
  UPDATE tbl_users
  SET verification_token = ?,
      verification_expires_at = ?
  WHERE user_id = ?
  LIMIT 1
");
$uid = (int)$user["user_id"];
$upd->bind_param("ssi", $token, $expires_at, $uid);
$upd->execute();

// Send email
$link = "http://localhost/FoodConnect/api/verify.php?token=" . $token;

$htmlBody = "
<!doctype html>
<html><body style='margin:0;background:#f6f7fb;font-family:Arial,Helvetica,sans-serif;'>
  <table width='100%' cellpadding='0' cellspacing='0' style='padding:24px'><tr><td align='center'>
    <table width='520' cellpadding='0' cellspacing='0' style='background:#fff;border-radius:16px;padding:28px;box-shadow:0 8px 30px rgba(0,0,0,.06)'>
      <tr><td align='center' style='padding-bottom:10px'><div style='font-size:22px;font-weight:bold;color:#ff7a00'>FoodConnect</div></td></tr>
      <tr><td style='font-size:20px;font-weight:bold'>Verify your email</td></tr>
      <tr><td style='color:#444;padding-top:12px;line-height:1.6'>
        Hi ".htmlspecialchars($user["full_name"]).",<br><br>
        Here is your new verification link (valid for 24 hours).
      </td></tr>
      <tr><td align='center' style='padding:28px 0'>
        <a href='{$link}' style='background:#ff7a00;color:#fff;text-decoration:none;padding:14px 22px;border-radius:12px;font-weight:bold;display:inline-block'>Verify Email</a>
      </td></tr>
      <tr><td style='color:#666;font-size:13px;line-height:1.6'>
        If the button doesn’t work, copy and paste this link:<br><br>
        <span style='word-break:break-all;color:#ff7a00'>{$link}</span>
      </td></tr>
    </table>
  </td></tr></table>
</body></html>
";

sendBrevoSMTP($email, "Verify your FoodConnect account", $htmlBody);

echo json_encode(["success" => true, "message" => "Verification email sent. Please check your inbox."]);
exit;