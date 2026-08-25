<?php

header("Content-Type: application/json; charset=utf-8");
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Pragma: no-cache");

require_once __DIR__ . "/session_config.php";
require_once __DIR__ . "/db.php";

function mark_notification_respond(array $data, int $statusCode = 200): void
{
    http_response_code($statusCode);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

if (strtoupper((string)($_SERVER["REQUEST_METHOD"] ?? "")) !== "POST") {
    mark_notification_respond([
        "success" => false,
        "message" => "This action is not available."
    ], 405);
}

$userId = (int)($_SESSION["user_id"] ?? 0);
$restaurantId = (int)($_SESSION["restaurant_id"] ?? 0);
$role = strtolower(trim((string)($_SESSION["role"] ?? "")));

if ($userId <= 0 || $restaurantId <= 0) {
    mark_notification_respond([
        "success" => false,
        "message" => "Your session has expired or you do not have access. Please log in again."
    ], 401);
}

if (!in_array($role, ["cashier", "owner"], true)) {
    mark_notification_respond([
        "success" => false,
        "message" => "You are not authorized to update cashier notifications."
    ], 403);
}

$accountStmt = $conn->prepare("
    SELECT user_id
    FROM tbl_users
    WHERE user_id = ?
      AND restaurant_id = ?
      AND role = ?
      AND status = 1
    LIMIT 1
");

if (!$accountStmt) {
    error_log("mark_notification_read.php account prepare error: " . $conn->error);
    mark_notification_respond(["success" => false, "message" => "Unable to update the notification."], 500);
}

$accountStmt->bind_param("iis", $userId, $restaurantId, $role);
if (!$accountStmt->execute()) {
    error_log("mark_notification_read.php account execute error: " . $accountStmt->error);
    $accountStmt->close();
    mark_notification_respond(["success" => false, "message" => "Unable to update the notification."], 500);
}

$account = $accountStmt->get_result()->fetch_assoc();
$accountStmt->close();

if (!$account) {
    mark_notification_respond([
        "success" => false,
        "message" => "Your account is not authorized for this restaurant."
    ], 403);
}

$input = json_decode(file_get_contents("php://input"), true);
if (!is_array($input)) {
    mark_notification_respond(["success" => false, "message" => "Invalid request data."], 400);
}

$logId = (int)($input["log_id"] ?? 0);
if ($logId <= 0) {
    mark_notification_respond(["success" => false, "message" => "Invalid notification."], 422);
}

// Only allow notification types that are visible in get_cashier_notifications.php.
$logStmt = $conn->prepare("
    SELECT log_id, restaurant_id
    FROM tbl_activity_logs
    WHERE log_id = ?
      AND restaurant_id = ?
      AND (
            action_title LIKE '%New Customer Order%'
            OR action_title = 'Customer Cancelled Order'
            OR action_title LIKE '%Low Stock%'
            OR action_title LIKE '%Out of Stock%'
      )
    LIMIT 1
");

if (!$logStmt) {
    error_log("mark_notification_read.php log prepare error: " . $conn->error);
    mark_notification_respond(["success" => false, "message" => "Unable to update the notification."], 500);
}

$logStmt->bind_param("ii", $logId, $restaurantId);
if (!$logStmt->execute()) {
    error_log("mark_notification_read.php log execute error: " . $logStmt->error);
    $logStmt->close();
    mark_notification_respond(["success" => false, "message" => "Unable to update the notification."], 500);
}

$notification = $logStmt->get_result()->fetch_assoc();
$logStmt->close();

if (!$notification) {
    mark_notification_respond([
        "success" => false,
        "message" => "The notification was not found for this restaurant."
    ], 404);
}

$insertStmt = $conn->prepare("
    INSERT IGNORE INTO tbl_notification_reads
        (log_id, user_id, restaurant_id, read_at)
    VALUES (?, ?, ?, NOW())
");

if (!$insertStmt) {
    error_log("mark_notification_read.php insert prepare error: " . $conn->error);
    mark_notification_respond(["success" => false, "message" => "Unable to update the notification."], 500);
}

$insertStmt->bind_param("iii", $logId, $userId, $restaurantId);
if (!$insertStmt->execute()) {
    error_log("mark_notification_read.php insert execute error: " . $insertStmt->error);
    $insertStmt->close();
    mark_notification_respond(["success" => false, "message" => "Unable to update the notification."], 500);
}

$alreadyRead = $insertStmt->affected_rows === 0;
$insertStmt->close();
$conn->close();

mark_notification_respond([
    "success" => true,
    "message" => $alreadyRead ? "Notification was already marked as read." : "Notification marked as read.",
    "log_id" => $logId,
    "is_read" => 1
]);
