<?php
header("Content-Type: application/json; charset=utf-8");
require_once __DIR__ . "/db.php";
require_once __DIR__ . "/mailer.php";

$input = json_decode(file_get_contents("php://input"), true);

$full_name = trim($input["full_name"] ?? "");
$email     = trim($input["email"] ?? "");
$password  = $input["password"] ?? "";
$confirm   = $input["confirm"] ?? "";

$role = "customer";

if ($full_name === "" || $email === "" || $password === "" || $confirm === "") {
  http_response_code(400);
  echo json_encode(["error" => "Please fill in all fields."]);
  exit;
}

if ($password !== $confirm) {
  http_response_code(400);
  echo json_encode(["error" => "Passwords do not match."]);
  exit;
}

// check duplicate
$check = $conn->prepare("SELECT user_id FROM tbl_users WHERE email=? LIMIT 1");
$check->bind_param("s", $email);
$check->execute();
if ($check->get_result()->fetch_assoc()) {
  http_response_code(409);
  echo json_encode(["error" => "Email already exists"]);
  exit;
}

$hash  = password_hash($password, PASSWORD_DEFAULT);
$token = bin2hex(random_bytes(16)); // verification token

$expires_at = date("Y-m-d H:i:s", time() + (24 * 60 * 60)); // 24 hours

$stmt = $conn->prepare("
  INSERT INTO tbl_users
  (restaurant_id, role, full_name, email, password_hash, status, is_verified, verification_token, verification_expires_at)
  VALUES (NULL, ?, ?, ?, ?, 1, 0, ?, ?)
");

$stmt->bind_param("ssssss", $role, $full_name, $email, $hash, $token, $expires_at);

if (!$stmt->execute()) {
  http_response_code(500);
  echo json_encode([
    "error" => "Signup failed",
    "mysql_error" => $conn->error
  ]);
  exit;
}

// ✅ Professional: send email (no verify_link in response)
$verify_link = "http://localhost/FoodConnect/api/verify.php?token=" . $token;

$htmlBody = "
<!doctype html>
<html>
<body style='margin:0;background:#f6f7fb;font-family:Arial,Helvetica,sans-serif;'>

<table width='100%' cellpadding='0' cellspacing='0' style='padding:24px'>
<tr>
<td align='center'>

<table width='520' cellpadding='0' cellspacing='0' style='background:#ffffff;border-radius:16px;padding:28px;box-shadow:0 8px 30px rgba(0,0,0,.06)'>

<tr>
<td align='center' style='padding-bottom:10px'>
  <!-- LOGO (optional) -->
  <div style='font-size:22px;font-weight:bold;color:#ff7a00'>FoodConnect</div>
</td>
</tr>

<tr>
<td style='font-size:20px;font-weight:bold;padding-top:8px'>
Verify your email
</td>
</tr>

<tr>
<td style='color:#444;padding-top:12px;line-height:1.6'>
Hi ".htmlspecialchars($full_name).",<br><br>
Thanks for signing up to FoodConnect. Please verify your email to activate your account.
</td>
</tr>

<tr>
<td align='center' style='padding:28px 0'>
<a href='{$verify_link}'
style='background:#ff7a00;color:#ffffff;text-decoration:none;padding:14px 22px;border-radius:12px;font-weight:bold;display:inline-block'>
Verify Email
</a>
</td>
</tr>

<tr>
<td style='color:#666;font-size:13px;line-height:1.6'>
If the button doesn’t work, copy and paste this link into your browser:
<br><br>
<span style='word-break:break-all;color:#ff7a00'>{$verify_link}</span>
</td>
</tr>

<tr>
<td style='padding-top:22px;color:#999;font-size:12px'>
If you didn’t create this account, you can safely ignore this email.
</td>
</tr>

</table>

<div style='padding-top:16px;color:#999;font-size:12px'>
© ".date("Y")." FoodConnect
</div>

</td>
</tr>
</table>

</body>
</html>
";

$sent = sendBrevoSMTP($email, "Verify your FoodConnect account", $htmlBody);


if (!$sent) {
  // Optional: keep account but tell user email failed (professional message)
  http_response_code(500);
  echo json_encode([
    "error" => "Account created but verification email failed to send. Please try again."
  ]);
  exit;
}

echo json_encode([
  "success" => true,
  "message" => "Account created. Please check your email to verify your account."
]);
exit;