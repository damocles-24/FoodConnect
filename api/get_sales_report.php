<?php
header("Content-Type: application/json; charset=utf-8");
require_once __DIR__ . "/session_config.php";

require_once __DIR__ . "/db.php";

if (!isset($_SESSION["user_id"])) {
    http_response_code(401);
    echo json_encode(["success" => false, "message" => "Unauthorized access."]);
    exit;
}

$restaurant_id = isset($_SESSION["restaurant_id"]) ? (int) $_SESSION["restaurant_id"] : 0;

if ($restaurant_id <= 0) {
    echo json_encode(["success" => false, "message" => "Invalid restaurant session."]);
    exit;
}

function prepareOrFail($conn, $sql) {
    $stmt = $conn->prepare($sql);

    if (!$stmt) {
        throw new Exception("SQL prepare failed: " . $conn->error);
    }

    return $stmt;
}

try {
    $summarySql = "
        SELECT
            COALESCE(SUM(CASE WHEN order_status = 'completed' THEN total_amount ELSE 0 END), 0) AS total_revenue,
            COUNT(*) AS total_orders,
            SUM(CASE WHEN order_status = 'completed' THEN 1 ELSE 0 END) AS completed_orders,
            SUM(CASE WHEN order_status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled_orders,
            COALESCE(AVG(CASE WHEN order_status = 'completed' THEN total_amount END), 0) AS average_order_value
        FROM tbl_orders
        WHERE restaurant_id = ?
    ";

    $stmt = prepareOrFail($conn, $summarySql);
    $stmt->bind_param("i", $restaurant_id);
    $stmt->execute();
    $summary = $stmt->get_result()->fetch_assoc();

    $bestProductSql = "
        SELECT 
            COALESCE(p.product_name, oi.product_name, 'Unknown Product') AS product_name,
            COALESCE(p.size, '') AS size,
            SUM(oi.quantity) AS total_sold,
            SUM(oi.quantity * oi.price) AS total_sales
        FROM tbl_order_items oi
        INNER JOIN tbl_orders o ON oi.order_id = o.order_id
        LEFT JOIN tbl_products p ON oi.product_id = p.product_id
        WHERE o.restaurant_id = ?
        AND o.order_status = 'completed'
        GROUP BY p.product_id, product_name, size
        ORDER BY total_sold DESC
        LIMIT 5
    ";

    $stmt = prepareOrFail($conn, $bestProductSql);
    $stmt->bind_param("i", $restaurant_id);
    $stmt->execute();
    $bestProducts = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);

    $bestCategorySql = "
        SELECT 
            COALESCE(p.category, 'Uncategorized') AS category,
            SUM(oi.quantity) AS total_sold,
            SUM(oi.quantity * oi.price) AS total_sales
        FROM tbl_order_items oi
        INNER JOIN tbl_orders o ON oi.order_id = o.order_id
        LEFT JOIN tbl_products p ON oi.product_id = p.product_id
        WHERE o.restaurant_id = ?
        AND o.order_status = 'completed'
        GROUP BY category
        ORDER BY total_sold DESC
        LIMIT 5
    ";

    $stmt = prepareOrFail($conn, $bestCategorySql);
    $stmt->bind_param("i", $restaurant_id);
    $stmt->execute();
    $bestCategories = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);

    echo json_encode([
        "success" => true,
        "summary" => $summary,
        "bestProducts" => $bestProducts,
        "bestCategories" => $bestCategories
    ]);

} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => "Failed to load sales report.",
        "error" => $e->getMessage()
    ]);
}