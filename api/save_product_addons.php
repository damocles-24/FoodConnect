<?php
declare(strict_types=1);

header("Content-Type: application/json; charset=utf-8");
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");

require_once __DIR__ . "/session_config.php";
require_once __DIR__ . "/db.php";
require_once __DIR__ . "/addon_helper.php";

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

$productId = filter_var($data["product_id"] ?? null, FILTER_VALIDATE_INT);
$addonIds = normalize_addon_ids($data["addon_ids"] ?? []);

if ($productId === false || $productId <= 0) {
    respond_json(["success" => false, "message" => "A valid product is required."], 422);
}

try {
    $product = get_product_group($conn, $restaurantId, (int)$productId);
    if (!$product || ($product["item_type"] ?? "menu_item") !== "menu_item") {
        throw new DomainException("Add-ons can only be assigned to menu items.");
    }

    $conn->begin_transaction();

    replace_product_group_addons(
        $conn,
        $restaurantId,
        (string)$product["product_name"],
        (string)$product["category"],
        $addonIds
    );

    $conn->commit();

    respond_json([
        "success" => true,
        "message" => "Available add-ons updated."
    ]);
} catch (DomainException $e) {
    try { $conn->rollback(); } catch (Throwable $ignore) {}
    respond_json(["success" => false, "message" => $e->getMessage()], 422);
} catch (Throwable $e) {
    try { $conn->rollback(); } catch (Throwable $ignore) {}
    error_log("save_product_addons.php: " . $e->getMessage());
    respond_json(["success" => false, "message" => "Unable to save product add-ons."], 500);
}
