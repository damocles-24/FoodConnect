<?php
declare(strict_types=1);

header("Content-Type: application/json; charset=utf-8");
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");

require_once __DIR__ . "/session_config.php";
require_once __DIR__ . "/db.php";

function respond_json(array $data, int $status = 200): void
{
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

if (strtoupper((string)($_SERVER["REQUEST_METHOD"] ?? "")) !== "POST") {
    respond_json(["success" => false, "message" => "Method not allowed."], 405);
}

$userId = (int)($_SESSION["user_id"] ?? 0);
$restaurantId = (int)($_SESSION["restaurant_id"] ?? 0);
$role = strtolower(trim((string)($_SESSION["role"] ?? "")));

if ($userId <= 0 || $restaurantId <= 0 || $role !== "owner") {
    respond_json(["success" => false, "message" => "Owner access is required."], 403);
}

$data = json_decode(file_get_contents("php://input"), true);
if (!is_array($data)) {
    respond_json(["success" => false, "message" => "Invalid request."], 400);
}

$id = filter_var($data["product_id"] ?? null, FILTER_VALIDATE_INT);
$name = trim((string)($data["name"] ?? ""));
$price = filter_var($data["price"] ?? null, FILTER_VALIDATE_FLOAT);
$statusRaw = strtolower(trim((string)($data["status"] ?? "available")));

if ($id === false || $id <= 0 || $name === "" || mb_strlen($name) > 150) {
    respond_json(["success" => false, "message" => "Valid add-on information is required."], 422);
}
if ($price === false || (float)$price <= 0) {
    respond_json(["success" => false, "message" => "Add-on price must be greater than zero."], 422);
}

$status = $statusRaw === "unavailable" ? "Unavailable" : "Available";
$price = round((float)$price, 2);

$stmt = $conn->prepare("
    UPDATE tbl_products
    SET product_name = ?,
        category = 'Add-ons',
        item_type = 'add_on',
        size = NULL,
        price = ?,
        stock = 0,
        status = ?,
        discount_type = 'none',
        discount_value = 0,
        discount_schedule = 'permanent',
        discount_start = NULL,
        discount_end = NULL,
        discount_status = 'Inactive'
    WHERE product_id = ?
      AND restaurant_id = ?
      AND item_type = 'add_on'
");
if (!$stmt) {
    respond_json(["success" => false, "message" => "Unable to prepare the add-on update."], 500);
}
$stmt->bind_param("sdsii", $name, $price, $status, $id, $restaurantId);

if (!$stmt->execute()) {
    error_log("update_addon.php: " . $stmt->error);
    $stmt->close();
    respond_json(["success" => false, "message" => "Unable to update the add-on."], 500);
}
if ($stmt->affected_rows === 0) {
    $check = $conn->prepare("
        SELECT product_id FROM tbl_products
        WHERE product_id = ? AND restaurant_id = ? AND item_type = 'add_on'
        LIMIT 1
    ");
    $check->bind_param("ii", $id, $restaurantId);
    $check->execute();
    $exists = $check->get_result()->fetch_assoc();
    $check->close();
    if (!$exists) {
        $stmt->close();
        respond_json(["success" => false, "message" => "Add-on not found."], 404);
    }
}
$stmt->close();

respond_json(["success" => true, "message" => "Add-on updated successfully."]);
