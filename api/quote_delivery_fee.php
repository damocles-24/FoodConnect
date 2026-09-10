<?php

declare(strict_types=1);

header("Content-Type: application/json; charset=utf-8");
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");

require_once __DIR__ . "/session_config.php";
require_once __DIR__ . "/db.php";
require_once __DIR__ . "/delivery_pricing_helper.php";

function respond_json(array $data, int $statusCode = 200): void
{
    http_response_code($statusCode);
    echo json_encode(
        $data,
        JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES
    );
    exit;
}

if (($_SERVER["REQUEST_METHOD"] ?? "") !== "POST") {
    respond_json([
        "success" => false,
        "message" => "This action is not available."
    ], 405);
}

if (empty($_SESSION["user_id"])) {
    respond_json([
        "success" => false,
        "message" => "Please log in first."
    ], 401);
}

$userId = (int)$_SESSION["user_id"];

$input = json_decode(
    file_get_contents("php://input"),
    true
);

if (!is_array($input)) {
    respond_json([
        "success" => false,
        "message" => "Invalid delivery quote request."
    ], 400);
}

$latitude = filter_var(
    $input["customer_latitude"] ?? null,
    FILTER_VALIDATE_FLOAT
);

$longitude = filter_var(
    $input["customer_longitude"] ?? null,
    FILTER_VALIDATE_FLOAT
);

if (
    $latitude === false ||
    $longitude === false ||
    $latitude < -90 || $latitude > 90 ||
    $longitude < -180 || $longitude > 180
) {
    respond_json([
        "success" => false,
        "message" => "Please select a valid delivery location on the map."
    ], 422);
}

try {
    $cartStmt = $conn->prepare("
        SELECT DISTINCT restaurant_id
        FROM tbl_cart
        WHERE user_id = ?
        ORDER BY restaurant_id ASC
    ");

    if (!$cartStmt) {
        throw new RuntimeException("Unable to load the cart restaurant.");
    }

    $cartStmt->bind_param("i", $userId);
    $cartStmt->execute();
    $result = $cartStmt->get_result();

    $restaurantIds = [];
    while ($row = $result->fetch_assoc()) {
        $restaurantId = (int)($row["restaurant_id"] ?? 0);
        if ($restaurantId > 0) {
            $restaurantIds[] = $restaurantId;
        }
    }
    $cartStmt->close();

    if (count($restaurantIds) !== 1) {
        respond_json([
            "success" => false,
            "message" => count($restaurantIds) === 0
                ? "Your cart is empty."
                : "Products from different restaurants cannot be checked out together."
        ], 400);
    }

    $restaurantId = (int)$restaurantIds[0];

    $serviceStmt = $conn->prepare("
        SELECT order_types_json
        FROM tbl_restaurants
        WHERE restaurant_id = ?
        LIMIT 1
    ");

    if (!$serviceStmt) {
        throw new RuntimeException("Unable to verify restaurant delivery service.");
    }

    $serviceStmt->bind_param("i", $restaurantId);
    $serviceStmt->execute();
    $restaurant = $serviceStmt->get_result()->fetch_assoc();
    $serviceStmt->close();

    if (!$restaurant) {
        respond_json([
            "success" => false,
            "message" => "Restaurant not found."
        ], 404);
    }

    $orderTypes = json_decode(
        (string)($restaurant["order_types_json"] ?? ""),
        true
    );

    if (
        is_array($orderTypes) &&
        !in_array("delivery", $orderTypes, true)
    ) {
        respond_json([
            "success" => false,
            "message" => "This restaurant does not currently accept delivery orders."
        ], 422);
    }

    $quote = fc_delivery_pricing_calculate(
        $conn,
        $restaurantId,
        (float)$latitude,
        (float)$longitude
    );

    respond_json([
        "success" => true,
        "restaurant_id" => $restaurantId,
        "pricing_type" => $quote["pricing_type"],
        "pricing_label" => $quote["pricing_label"],
        "delivery_fee" => round((float)$quote["delivery_fee"], 2),
        "distance_km" => $quote["distance_km"]
    ]);
} catch (DomainException | InvalidArgumentException $error) {
    respond_json([
        "success" => false,
        "message" => $error->getMessage()
    ], 422);
} catch (Throwable $error) {
    error_log(
        "quote_delivery_fee.php error: " .
        $error->getMessage()
    );

    respond_json([
        "success" => false,
        "message" => "Unable to calculate the delivery fee right now. Please try again."
    ], 500);
}
