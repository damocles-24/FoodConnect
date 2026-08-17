<?php
header("Content-Type: application/json; charset=utf-8");

error_reporting(E_ALL & ~E_NOTICE & ~E_WARNING);
ini_set("display_errors", 0);

session_set_cookie_params(0, "/FoodConnect", "", false, true);
require_once __DIR__ . "/session_config.php";

if (empty($_SESSION["staff_access_verified"])) {
  respond_json([
    "success" => false,
    "message" => "Staff access code required."
  ], 403);
}

require_once __DIR__ . "/db.php";
require_once __DIR__ . "/rate_limit.php";

function respond_json($arr, $code = 200) {
  http_response_code($code);
  echo json_encode($arr);
  exit;
}

$input = json_decode(file_get_contents("php://input"), true);

$email = trim($input["email"] ?? "");
$password = $input["password"] ?? "";

if ($email === "" || $password === "") {
  respond_json(["success" => false, "message" => "Please enter email and password."], 400);
}

rate_limit_enforce(
  $conn,
  "staff-login",
  rate_limit_identifier(rate_limit_client_ip(), strtolower($email)),
  10,
  900,
  900,
  "Too many staff login attempts. Please wait 15 minutes and try again."
);

$stmt = $conn->prepare("
  SELECT user_id, restaurant_id, role, full_name, email, password_hash, status, is_verified
  FROM tbl_users
  WHERE email = ?
  LIMIT 1
");

if (!$stmt) {
  respond_json(["success" => false, "message" => "Server error."], 500);
}

$stmt->bind_param("s", $email);
$stmt->execute();
$user = $stmt->get_result()->fetch_assoc();
$stmt->close();

if (!$user || !password_verify($password, $user["password_hash"])) {
  respond_json(["success" => false, "message" => "Invalid email or password."], 401);
}

if ((int)$user["status"] !== 1) {
  respond_json(["success" => false, "message" => "Account is disabled."], 403);
}



$allowed_roles = [
  "admin",
  "owner",
  "cashier",
  "delivery_staff",
  "delivery_coordinator"
];

if (!in_array($user["role"], $allowed_roles, true)) {
  respond_json([
    "success" => false,
    "message" => "Customer accounts cannot login here."
  ], 403);
}

$access_restaurant_id = (int)($_SESSION["staff_access_restaurant_id"] ?? 0);

if ($access_restaurant_id <= 0) {
  respond_json([
    "success" => false,
    "message" => "Please verify staff access code first."
  ], 403);
}

if ($user["role"] !== "admin" && (int)$user["restaurant_id"] !== $access_restaurant_id) {
  respond_json([
    "success" => false,
    "message" => "This staff account does not belong to the selected restaurant."
  ], 403);
}

session_regenerate_id(true);

$_SESSION["user_id"] = (int)$user["user_id"];
$_SESSION["role"] = $user["role"];
$_SESSION["restaurant_id"] = $user["restaurant_id"];
$_SESSION["full_name"] = $user["full_name"];

respond_json([
  "success" => true,
  "message" => "Staff login successful.",
  "user" => [
    "user_id" => (int)$user["user_id"],
    "restaurant_id" => (int)$user["restaurant_id"],
    "role" => $user["role"],
    "full_name" => $user["full_name"],
    "email" => $user["email"]
  ]
]);
?>