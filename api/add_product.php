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

$product_name = trim($data["product_name"] ?? "");
$category = trim($data["category"] ?? "");
$size = trim($data["size"] ?? "");
$price = floatval($data["price"] ?? 0);
$stock = intval($data["stock"] ?? 0);
$status = ($stock > 0) ? "Available" : "Unavailable";
if (
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
  INSERT INTO tbl_products
    (restaurant_id, product_name, category, size, price, stock, status)
  VALUES
    (?, ?, ?, ?, ?, ?, ?)
");

$stmt->bind_param(
  "isssdis",
  $restaurant_id,
  $product_name,
  $category,
  $size,
  $price,
  $stock,
  $status
);

if ($stmt->execute()) {
  echo json_encode([
    "success" => true,
    "message" => "Product added successfully.",
    "product_id" => $stmt->insert_id
  ]);
} else {
  echo json_encode([
    "success" => false,
    "message" => "Failed to add product."
  ]);
}

$stmt->close();
$conn->close();