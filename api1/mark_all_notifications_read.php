<?php
header("Content-Type: application/json; charset=utf-8");
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");

session_set_cookie_params(0, "/FoodConnect", "", false, true);
require_once __DIR__ . "/session_config.php";
require_once __DIR__ . "/db.php";

function respond_json(array $data, int $statusCode = 200): void {
    http_response_code($statusCode);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

if (strtoupper((string)($_SERVER["REQUEST_METHOD"] ?? "")) !== "POST") {
    respond_json(["success" => false, "message" => "This action is not available."], 405);
}

if (!isset($conn) || !($conn instanceof mysqli)) {
    respond_json(["success" => false, "message" => "Service is temporarily unavailable. Please try again shortly."], 500);
}

if (empty($_SESSION["user_id"]) || empty($_SESSION["restaurant_id"])) {
    $conn->close();
    respond_json(["success" => false, "message" => "Your session has expired or you do not have access. Please log in again."], 401);
}

$user_id = (int)$_SESSION["user_id"];
$restaurant_id = (int)$_SESSION["restaurant_id"];
$role = strtolower(trim((string)($_SESSION["role"] ?? "")));

if (!in_array($role, ["cashier", "owner"], true)) {
    $conn->close();
    respond_json(["success" => false, "message" => "You are not authorized to update cashier notifications."], 403);
}

$stmt = $conn->prepare("
    INSERT IGNORE INTO tbl_notification_reads
        (log_id, user_id, restaurant_id, read_at)
    SELECT
        activity_logs.log_id,
        ?,
        activity_logs.restaurant_id,
        NOW()
    FROM tbl_activity_logs AS activity_logs
    WHERE activity_logs.restaurant_id = ?
      AND (
            activity_logs.action_title LIKE '%New Customer Order%'
            OR activity_logs.action_title = 'Customer Cancelled Order'
            OR activity_logs.action_title LIKE '%Low Stock%'
            OR activity_logs.action_title LIKE '%Out of Stock%'
      )
");

if (!$stmt) {
    error_log("mark_all_notifications_read.php prepare error: " . $conn->error);
    $conn->close();
    respond_json(["success" => false, "message" => "Unable to update notifications."], 500);
}

$stmt->bind_param("ii", $user_id, $restaurant_id);

if (!$stmt->execute()) {
    error_log("mark_all_notifications_read.php execute error: " . $stmt->error);
    $stmt->close();
    $conn->close();
    respond_json(["success" => false, "message" => "Unable to update notifications."], 500);
}

$marked_count = max(0, (int)$stmt->affected_rows);
$stmt->close();
$conn->close();

respond_json([
    "success" => true,
    "message" => "All notifications marked as read.",
    "marked_count" => $marked_count
]);
