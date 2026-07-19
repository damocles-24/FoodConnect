<?php
header("Content-Type: application/json; charset=utf-8");
session_start();
require_once __DIR__ . "/db.php";

if (!isset($_SESSION["user_id"])) {
    echo json_encode([]);
    exit;
}

$restaurant_id = isset($_SESSION["restaurant_id"]) ? (int)$_SESSION["restaurant_id"] : 1;

$stmt = $conn->prepare("
    SELECT product_id, product_name, category, size, price, stock, status
    FROM tbl_products
    WHERE restaurant_id = ?
    ORDER BY product_id DESC
");

if (!$stmt) {
    echo json_encode([]);
    exit;
}

$stmt->bind_param("i", $restaurant_id);
$stmt->execute();
$result = $stmt->get_result();

$products = [];

while ($row = $result->fetch_assoc()) {
    $products[] = [
        "id" => (int)$row["product_id"],
        "product_id" => (int)$row["product_id"],

        "name" => $row["product_name"],
        "product_name" => $row["product_name"],

        "category" => $row["category"],
        "size" => $row["size"] ?? "",
        "price" => (float)$row["price"],
        "stock" => (int)$row["stock"],
        "status" => $row["status"]
    ];
}

$stmt->close();

echo json_encode($products);