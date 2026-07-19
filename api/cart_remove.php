<?php
header("Content-Type: application/json; charset=utf-8");

error_reporting(E_ALL & ~E_NOTICE & ~E_WARNING);
ini_set("display_errors", 0);

session_set_cookie_params(0, "/capshit", "", false, true);
session_start();

require_once __DIR__ . "/db.php";

function respond_json($arr, $code = 200) {
  http_response_code($code);
  echo json_encode($arr);
  exit;
}

if (empty($_SESSION["user_id"])) {
  respond_json([
    "success" => false,
    "message" => "Please login first."
  ], 401);
}

$user_id = (int)$_SESSION["user_id"];
$data = json_decode(file_get_contents("php://input"), true);

$cart_id = intval($data["cart_id"] ?? 0);

if ($cart_id <= 0) {
  respond_json([
    "success" => false,
    "message" => "Invalid cart ID."
  ], 400);
}

$stmt = $conn->prepare("DELETE FROM tbl_cart WHERE cart_id = ? AND user_id = ?");
$stmt->bind_param("ii", $cart_id, $user_id);
$stmt->execute();

respond_json([
  "success" => true,
  "message" => "Item removed."
]);