<?php
header("Content-Type: application/json; charset=utf-8");

error_reporting(E_ALL & ~E_NOTICE & ~E_WARNING);
ini_set("display_errors", 0);

session_set_cookie_params(0, "/FoodConnect", "", false, true);
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

$stmt = $conn->prepare("DELETE FROM tbl_cart WHERE user_id = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();

respond_json([
  "success" => true,
  "message" => "Cart cleared."
]);