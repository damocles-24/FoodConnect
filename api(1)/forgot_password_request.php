<?php
header("Content-Type: application/json; charset=utf-8");
error_reporting(E_ALL & ~E_NOTICE & ~E_WARNING);
ini_set("display_errors", 0);

require_once __DIR__ . "/db.php";
require_once __DIR__ . "/mailer.php";

$input = json_decode(file_get_contents("php://input"), true);
$email = trim($input["email"] ?? "");

if ($email === "") {
  http_response_code(400);
  echo json_encode(["error" => "Email is required."]);
  exit;
}

// ✅ Generic message for security (don't reveal if email exists)
$generic = ["success" => true, "message" => "If that email exists, a reset link has been sent."];

$stmt = $conn->prepare("SELECT user_id, email FROM tbl_users WHERE email = ? LIMIT 1");
$stmt->bind_param("s", $email);
$stmt->execute();
$user = $stmt->get_result()->fetch_assoc();

if (!$user) {
  echo json_encode($generic);
  exit;
}

$raw_token  = bin2hex(random_bytes(32));
$token_hash = password_hash($raw_token, PASSWORD_DEFAULT);
$expires_dt = date("Y-m-d H:i:s", time() + (15 * 60)); // 15 minutes

$upd = $conn->prepare("
  UPDATE tbl_users
  SET reset_token_hash = ?, reset_token_expires = ?
  WHERE user_id = ?
  LIMIT 1
");
$uid = (int)$user["user_id"];
$upd->bind_param("ssi", $token_hash, $expires_dt, $uid);
$upd->execute();

// ✅ reset goes to your login.html (same page)
$reset_link = "http://localhost/FoodConnect/frontend/html/login.html?email=" . urlencode($email) . "&token=" . urlencode($raw_token);

$safe_reset_link = htmlspecialchars(
  $reset_link,
  ENT_QUOTES,
  "UTF-8"
);

$logo_url = "https://raw.githubusercontent.com/damocles-24/IMAGES/refs/heads/main/05f3b888-5229-477b-87a0-0b27c7ddee38%20(1)-Photoroom%20(2).png";

$html = "
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
                    <img
                      src='{$logo_url}'
                      alt='FoodConnect'
                      width='150'
                      style='display:block;width:150px;max-width:100%;height:auto;border:0;'
                    >
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

              <div style='width:56px;height:56px;line-height:56px;margin:0 0 20px;background:#fff2e8;border-radius:16px;text-align:center;font-size:25px;'>
                &#128274;
              </div>

              <h1 style='margin:0 0 10px;color:#171717;font-size:26px;line-height:1.25;font-weight:800;'>
                Reset your password
              </h1>

              <p style='margin:0 0 22px;color:#667085;font-size:14px;line-height:1.7;'>
                We received a request to reset the password for your FoodConnect account.
              </p>

              <table role='presentation' cellspacing='0' cellpadding='0' border='0' style='margin:0 0 22px;'>
                <tr>
                  <td bgcolor='#f78021' style='border-radius:11px;'>
                    <a
                      href='{$safe_reset_link}'
                      target='_blank'
                      style='display:inline-block;padding:14px 24px;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;line-height:1;border-radius:11px;'
                    >
                      Reset My Password
                    </a>
                  </td>
                </tr>
              </table>

              <table role='presentation' width='100%' cellspacing='0' cellpadding='0' border='0' style='width:100%;margin:0 0 22px;background:#fff8f2;border:1px solid #ffe1cb;border-radius:12px;'>
                <tr>
                  <td style='padding:14px 16px;color:#9a4b16;font-size:12px;line-height:1.6;'>
                    <strong>This link expires in 15 minutes.</strong><br>
                    For your security, the reset link can only be used while it is valid.
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
                {$safe_reset_link}
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

$sent = sendBrevoSMTP($email, "FoodConnect - Reset Password", $html);

if (!$sent) {
  http_response_code(500);
  echo json_encode(["error" => "Email sending failed."]);
  exit;
}

echo json_encode($generic);