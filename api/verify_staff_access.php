<?php
header("Content-Type: application/json; charset=utf-8");

session_set_cookie_params(0, "/capshit", "", false, true);
session_start();

require_once __DIR__ . "/db.php";

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

$stmt = $conn->prepare("
  SELECT staff_access_code
  FROM tbl_restaurants
  WHERE restaurant_id = ?
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