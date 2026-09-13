<?php
header("Content-Type: application/json; charset=utf-8");
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Pragma: no-cache");

error_reporting(E_ALL & ~E_NOTICE & ~E_WARNING);
ini_set("display_errors", "0");

require_once __DIR__ . "/session_config.php";
require_once __DIR__ . "/db.php";

function staff_reset_summary_respond(array $payload, int $code = 200): void
{
    http_response_code($code);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

if (strtoupper((string)($_SERVER["REQUEST_METHOD"] ?? "")) !== "GET") {
    staff_reset_summary_respond([
        "success" => false,
        "message" => "This action is not available."
    ], 405);
}

$ownerId = (int)($_SESSION["user_id"] ?? 0);
$restaurantId = (int)($_SESSION["restaurant_id"] ?? 0);
$role = strtolower(trim((string)($_SESSION["role"] ?? "")));

if ($ownerId <= 0 || $restaurantId <= 0 || $role !== "owner") {
    staff_reset_summary_respond([
        "success" => false,
        "message" => "Owner authentication is required.",
        "pending_requests" => 0
    ], 401);
}

$ownerStmt = $conn->prepare("
    SELECT restaurant_id
    FROM tbl_restaurants
    WHERE restaurant_id = ?
      AND owner_id = ?
    LIMIT 1
");

if (!$ownerStmt) {
    staff_reset_summary_respond([
        "success" => false,
        "message" => "Unable to verify restaurant ownership.",
        "pending_requests" => 0
    ], 500);
}

$ownerStmt->bind_param("ii", $restaurantId, $ownerId);
$ownerStmt->execute();
$owned = $ownerStmt->get_result()->fetch_assoc();
$ownerStmt->close();

if (!$owned) {
    staff_reset_summary_respond([
        "success" => false,
        "message" => "You are not authorized to manage this restaurant.",
        "pending_requests" => 0
    ], 403);
}

$stmt = $conn->prepare("
    SELECT COUNT(*) AS pending_requests
    FROM tbl_users
    WHERE restaurant_id = ?
      AND role IN ('cashier', 'delivery_staff', 'delivery_coordinator')
      AND status = 1
      AND reset_token_hash IS NOT NULL
      AND reset_token_expires IS NOT NULL
      AND reset_token_expires >= ?
");

if (!$stmt) {
    staff_reset_summary_respond([
        "success" => false,
        "message" => "Unable to load staff recovery notifications.",
        "pending_requests" => 0
    ], 500);
}

$nowManila = date("Y-m-d H:i:s");
$stmt->bind_param("is", $restaurantId, $nowManila);
$stmt->execute();
$row = $stmt->get_result()->fetch_assoc() ?: [];
$stmt->close();

staff_reset_summary_respond([
    "success" => true,
    "pending_requests" => (int)($row["pending_requests"] ?? 0)
]);
