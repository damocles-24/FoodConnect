<?php
header("Content-Type: application/json; charset=utf-8");
session_start();
require_once __DIR__ . "/db.php";

if (!isset($_SESSION["user_id"])) {
    echo json_encode([]);
    exit;
}

$restaurant_id = isset($_SESSION["restaurant_id"]) ? (int)$_SESSION["restaurant_id"] : 1;

function getOne($conn, $sql, $restaurant_id) {
    $stmt = $conn->prepare($sql);
    if (!$stmt) return null;

    $stmt->bind_param("i", $restaurant_id);
    $stmt->execute();
    $result = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    return $result;
}

$sales = getOne($conn, "
    SELECT COALESCE(SUM(total_amount), 0) AS total_sales
    FROM tbl_orders
    WHERE restaurant_id = ? AND order_status = 'completed'
", $restaurant_id);

$totalOrders = getOne($conn, "
    SELECT COUNT(*) AS total_orders
    FROM tbl_orders
    WHERE restaurant_id = ?
", $restaurant_id);

$pending = getOne($conn, "
    SELECT COUNT(*) AS pending_orders
    FROM tbl_orders
    WHERE restaurant_id = ? AND order_status = 'pending'
", $restaurant_id);

$completed = getOne($conn, "
    SELECT COUNT(*) AS completed_orders
    FROM tbl_orders
    WHERE restaurant_id = ? AND order_status = 'completed'
", $restaurant_id);

$cancelled = getOne($conn, "
    SELECT COUNT(*) AS cancelled_orders
    FROM tbl_orders
    WHERE restaurant_id = ? AND order_status = 'cancelled'
", $restaurant_id);

$avg = getOne($conn, "
    SELECT COALESCE(AVG(total_amount), 0) AS avg_order
    FROM tbl_orders
    WHERE restaurant_id = ?
      AND order_status = 'completed'
", $restaurant_id);

$products = getOne($conn, "
    SELECT COUNT(*) AS total_products
    FROM tbl_products
    WHERE restaurant_id = ?
", $restaurant_id);

$bestStmt = $conn->prepare("
    SELECT
        oi.product_name,
        SUM(oi.quantity) AS total_qty
    FROM tbl_order_items oi
    INNER JOIN tbl_orders o
        ON oi.order_id = o.order_id
    WHERE o.restaurant_id = ?
  AND o.order_status = 'completed'
      AND o.order_status = 'completed'
    GROUP BY oi.product_name
    ORDER BY total_qty DESC
    LIMIT 1
");

$bestSeller = "-";

if ($bestStmt) {
    $bestStmt->bind_param("i", $restaurant_id);
    $bestStmt->execute();
    $best = $bestStmt->get_result()->fetch_assoc();
    $bestSeller = $best["product_name"] ?? "-";
    $bestStmt->close();
}

echo json_encode([
    "salesToday" => (float)$sales["total_sales"],
    "totalOrders" => (int)$totalOrders["total_orders"],
    "pendingOrders" => (int)$pending["pending_orders"],
    "completedOrders" => (int)$completed["completed_orders"],
    "cancelledOrders" => (int)$cancelled["cancelled_orders"],
    "averageOrderValue" => (float)$avg["avg_order"],
    "bestSeller" => $bestSeller,
    "totalProducts" => (int)$products["total_products"]
]);