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

$html = "
  <h2>FoodConnect Password Reset</h2>
  <p>You requested to reset your password.</p>
  <p>This link is valid for <b>15 minutes</b>:</p>
  <p><a href='{$reset_link}' target='_blank'>Reset Password</a></p>
  <p>If you did not request this, ignore this email.</p>
";

$sent = sendBrevoSMTP($email, "FoodConnect - Reset Password", $html);

if (!$sent) {
  http_response_code(500);
  echo json_encode(["error" => "Email sending failed."]);
  exit;
}

echo json_encode($generic);