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
    SELECT order_id, customer_name, total_amount, payment_method, order_status, address, created_at
    FROM tbl_orders
    WHERE restaurant_id = ?
    ORDER BY created_at DESC
    LIMIT 5
");

if (!$stmt) {
    echo json_encode([]);
    exit;
}

$stmt->bind_param("i", $restaurant_id);
$stmt->execute();
$result = $stmt->get_result();

$orders = [];

while ($row = $result->fetch_assoc()) {
    $order_id = (int)$row["order_id"];

    $items = [];

    $itemStmt = $conn->prepare("
        SELECT quantity, product_name
        FROM tbl_order_items
        WHERE order_id = ?
    ");

    if ($itemStmt) {
        $itemStmt->bind_param("i", $order_id);
        $itemStmt->execute();
        $itemResult = $itemStmt->get_result();

        while ($item = $itemResult->fetch_assoc()) {
            $items[] = (int)$item["quantity"] . "x " . ($item["product_name"] ?? "Unknown Item");
        }

        $itemStmt->close();
    }

    $statusRaw = strtolower($row["order_status"]);

    if ($statusRaw === "done") {
        $status = "Completed";
    } else {
        $status = ucfirst($statusRaw);
    }

    $orders[] = [
        "id" => "ORD-" . $row["order_id"],
        "order_id" => (int)$row["order_id"],
        "customer" => $row["customer_name"] ?? "Unknown Customer",
        "items" => $items,
        "total" => (float)$row["total_amount"],
        "payment" => $row["payment_method"] ?? "N/A",
        "status" => $status,
        "date" => $row["created_at"],
        "address" => $row["address"] ?? "N/A"
    ];
}

$stmt->close();

echo json_encode($orders);