<?php
header("Content-Type: application/json; charset=utf-8");
require_once __DIR__ . "/session_config.php";

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
$product_name = trim($data["product_name"] ?? "");
$category = trim($data["category"] ?? "");
$size = trim($data["size"] ?? "");
$price = floatval($data["price"] ?? 0);
$stock = intval($data["stock"] ?? 0);
$status = ($stock > 0) ? "Available" : "Unavailable";

if (
  $product_id <= 0 ||
  $product_name === "" ||
  $category === "" ||
  $size === "" ||
  $price <= 0 ||
  $stock < 0
) {
  echo json_encode([
    "success" => false,
    "message" => "Invalid product data."
  ]);
  exit;
}



$stmt = $conn->prepare("
  UPDATE tbl_products
  SET 
    product_name = ?,
    category = ?,
    size = ?,
    price = ?,
    stock = ?,
    status = ?
  WHERE product_id = ?
  AND restaurant_id = ?
");

$stmt->bind_param(
  "sssdissii",
  $product_name,
  $category,
  $size,
  $price,
  $stock,
  $status,
  $product_id,
  $restaurant_id
);

if ($stmt->execute()) {
  echo json_encode([
    "success" => true,
    "message" => "Product updated successfully."
  ]);
} else {
  echo json_encode([
    "success" => false,
    "message" => "Failed to update product."
  ]);
}

$stmt->close();
$conn->close();