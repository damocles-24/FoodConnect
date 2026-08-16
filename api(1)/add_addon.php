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

$name = trim((string)($data["name"] ?? ""));
$price = filter_var($data["price"] ?? null, FILTER_VALIDATE_FLOAT);
$statusRaw = strtolower(trim((string)($data["status"] ?? "available")));

if ($name === "" || mb_strlen($name) > 150) {
    respond_json(["success" => false, "message" => "Enter a valid add-on name."], 422);
}
if ($price === false || (float)$price <= 0) {
    respond_json(["success" => false, "message" => "Add-on price must be greater than zero."], 422);
}
$status = $statusRaw === "unavailable" ? "Unavailable" : "Available";
$price = round((float)$price, 2);

$duplicate = $conn->prepare("
    SELECT product_id
    FROM tbl_products
    WHERE restaurant_id = ?
      AND item_type = 'add_on'
      AND LOWER(TRIM(product_name)) = LOWER(TRIM(?))
    LIMIT 1
");
if (!$duplicate) {
    respond_json(["success" => false, "message" => "Unable to validate the add-on."], 500);
}
$duplicate->bind_param("is", $restaurantId, $name);
$duplicate->execute();
$exists = $duplicate->get_result()->fetch_assoc();
$duplicate->close();

if ($exists) {
    respond_json(["success" => false, "message" => "An add-on with this name already exists."], 409);
}

$stmt = $conn->prepare("
    INSERT INTO tbl_products (
        restaurant_id, product_name, category, item_type, size,
        price, stock, status, image_path,
        discount_type, discount_value, discount_schedule,
        discount_start, discount_end, discount_status
    )
    VALUES (?, ?, 'Add-ons', 'add_on', NULL, ?, 0, ?, NULL,
            'none', 0, 'permanent', NULL, NULL, 'Inactive')
");
if (!$stmt) {
    respond_json(["success" => false, "message" => "Unable to prepare the add-on."], 500);
}
$stmt->bind_param("isds", $restaurantId, $name, $price, $status);

if (!$stmt->execute()) {
    error_log("add_addon.php: " . $stmt->error);
    $stmt->close();
    respond_json(["success" => false, "message" => "Unable to add the add-on."], 500);
}
$id = (int)$stmt->insert_id;
$stmt->close();

respond_json([
    "success" => true,
    "message" => "Add-on added successfully.",
    "addon" => [
        "product_id" => $id,
        "name" => $name,
        "price" => $price,
        "status" => $status,
        "item_type" => "add_on"
    ]
], 201);
