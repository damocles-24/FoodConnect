<?php
header("Content-Type: application/json; charset=utf-8");
session_start();
require_once __DIR__ . "/db.php";

if (!isset($_SESSION["user_id"])) {
    echo json_encode([]);
    exit;
}

$restaurant_id = isset($_SESSION["restaurant_id"]) ? (int)$_SESSION["restaurant_id"] : 1;
$range = $_GET["range"] ?? "weekly";

if ($range === "monthly") {
    $sql = "
        SELECT DATE_FORMAT(created_at, '%b %d') AS label,
               COALESCE(SUM(total_amount), 0) AS total
        FROM tbl_orders
        WHERE restaurant_id = ?
          AND order_status = 'completed'
          AND created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        GROUP BY DATE(created_at)
        ORDER BY DATE(created_at)
    ";
} else {
    $sql = "
        SELECT DATE_FORMAT(created_at, '%a') AS label,
               COALESCE(SUM(total_amount), 0) AS total
        FROM tbl_orders
        WHERE restaurant_id = ?
          AND order_status = 'completed'
          AND created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
        GROUP BY DATE(created_at)
        ORDER BY DATE(created_at)
    ";
}

$stmt = $conn->prepare($sql);

if (!$stmt) {
    echo json_encode([]);
    exit;
}

$stmt->bind_param("i", $restaurant_id);
$stmt->execute();
$result = $stmt->get_result();

$data = [];

while ($row = $result->fetch_assoc()) {
    $data[] = [
        "label" => $row["label"],
        "total" => (float)$row["total"]
    ];
}

$stmt->close();

echo json_encode($data);