<?php
header("Content-Type: application/json; charset=utf-8");
error_reporting(E_ALL & ~E_NOTICE & ~E_WARNING);
ini_set("display_errors", 0);

require_once __DIR__ . "/db.php";
require_once __DIR__ . "/rate_limit.php";

$input = json_decode(file_get_contents("php://input"), true);
$email = trim($input["email"] ?? "");
$token = trim($input["token"] ?? "");
$new_password = $input["new_password"] ?? "";

if ($email === "" || $token === "" || $new_password === "") {
  http_response_code(400);
  echo json_encode(["error" => "Missing required fields."]);
  exit;
}

rate_limit_enforce(
  $conn,
  "password-reset-submit",
  rate_limit_identifier(rate_limit_client_ip(), strtolower($email)),
  6,
  900,
  900,
  "Too many password reset attempts. Please wait 15 minutes and try again."
);

if (strlen($new_password) < 6) {
  http_response_code(400);
  echo json_encode(["error" => "Password must be at least 6 characters."]);
  exit;
}

$stmt = $conn->prepare("
  SELECT user_id, reset_token_hash, reset_token_expires
  FROM tbl_users
  WHERE email = ?
  LIMIT 1
");
$stmt->bind_param("s", $email);
$stmt->execute();
$user = $stmt->get_result()->fetch_assoc();

if (!$user || !$user["reset_token_hash"] || !$user["reset_token_expires"]) {
  http_response_code(400);
  echo json_encode(["error" => "Invalid or expired reset link."]);
  exit;
}

if (strtotime($user["reset_token_expires"]) < time()) {
  http_response_code(400);
  echo json_encode(["error" => "Reset link expired. Please request again."]);
  exit;
}

if (!password_verify($token, $user["reset_token_hash"])) {
  http_response_code(400);
  echo json_encode(["error" => "Invalid or expired reset link."]);
  exit;
}

$new_hash = password_hash($new_password, PASSWORD_DEFAULT);

$upd = $conn->prepare("
  UPDATE tbl_users
  SET password_hash = ?, reset_token_hash = NULL, reset_token_expires = NULL
  WHERE user_id = ?
  LIMIT 1
");
$uid = (int)$user["user_id"];
$upd->bind_param("si", $new_hash, $uid);
$upd->execute();

echo json_encode(["success" => true, "message" => "Password updated successfully."]);