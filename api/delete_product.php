<?php
header("Content-Type: application/json; charset=utf-8");
session_start();

require_once __DIR__ . "/db.php";

if (!isset($_SESSION["user_id"])) {
  echo json_encode([
    "success" => false,
    "message" => "Unauthorized. Please login first."
  ]);
  exit;
}

$restaurant_id = intval($_SESSION["restaurant_id"] ?? 1);

$data = json_decode(file_get_contents("php://input"), true);

$product_id = intval($data["product_id"] ?? 0);

if ($product_id <= 0) {
  echo json_encode([
    "success" => false,
    "message" => "Invalid product ID."
  ]);
  exit;
}

$stmt = $conn->prepare("
  DELETE FROM tbl_products
  WHERE product_id = ?
  AND restaurant_id = ?
");

$stmt->bind_param("ii", $product_id, $restaurant_id);

if ($stmt->execute()) {
  echo json_encode([
    "success" => true,
    "message" => "Product deleted successfully."
  ]);
} else {
  echo json_encode([
    "success" => false,
    "message" => "Failed to delete product."
  ]);
}

$stmt->close();
$conn->close();