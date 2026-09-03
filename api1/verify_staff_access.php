<?php
header("Content-Type: application/json; charset=utf-8");

session_set_cookie_params(0, "/", "", false, true);
require_once __DIR__ . "/session_config.php";

require_once __DIR__ . "/db.php";
require_once __DIR__ . "/rate_limit.php";

function respond_json($arr, $code = 200) {
  http_response_code($code);
  echo json_encode($arr);
  exit;
}

$input = json_decode(file_get_contents("php://input"), true);

$restaurant_id = (int)($input["restaurant_id"] ?? 0);
$code = trim($input["access_code"] ?? "");

if ($restaurant_id <= 0 || $code === "") {
  respond_json([
    "success" => false,
    "message" => "Restaurant and access code are required."
  ], 400);
}

rate_limit_enforce(
  $conn,
  "staff-access-code",
  rate_limit_identifier(rate_limit_client_ip(), (string)$restaurant_id),
  10,
  600,
  600,
  "Too many access-code attempts. Please wait 10 minutes and try again."
);

$stmt = $conn->prepare("
  SELECT
    r.staff_access_code,
    owner.status AS owner_status

  FROM tbl_restaurants AS r

  INNER JOIN tbl_users AS owner
    ON owner.user_id = r.owner_id
    AND owner.role = 'owner'

  WHERE r.restaurant_id = ?

  LIMIT 1
");

if (!$stmt) {
  respond_json([
    "success" => false,
    "message" => "Server error."
  ], 500);
}

$stmt->bind_param("i", $restaurant_id);
$stmt->execute();
$result = $stmt->get_result();
$restaurant = $result->fetch_assoc();
$stmt->close();

if (!$restaurant) {
  respond_json([
    "success" => false,
    "message" => "Restaurant not found."
  ], 404);
}

if (
  (int) (
    $restaurant["owner_status"]
    ?? 0
  ) !== 1
) {
  respond_json([
    "success" => false,
    "message" =>
      "This restaurant has been deactivated from FoodConnect."
  ], 403);
}

$storedCode =
    (string) $restaurant["staff_access_code"];

if (
    $storedCode === "" ||
    !hash_equals(
        $storedCode,
        $code
    )
) {
  respond_json([
    "success" => false,
    "message" => "Invalid access code."
  ], 403);
}

$_SESSION["staff_access_verified"] = true;
$_SESSION["staff_access_restaurant_id"] = $restaurant_id;

respond_json([
  "success" => true,
  "message" => "Access verified."
]);
?>