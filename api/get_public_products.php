<?php

header(
    "Content-Type: application/json; charset=utf-8"
);

header(
    "Cache-Control: no-store, no-cache, must-revalidate, max-age=0"
);

require_once __DIR__ . "/db.php";

/* =========================================================
   JSON RESPONSE
========================================================= */

function respond_json(
    array $data,
    int $statusCode = 200
): void {
    http_response_code($statusCode);

    echo json_encode(
        $data,
        JSON_UNESCAPED_UNICODE |
        JSON_UNESCAPED_SLASHES
    );

    exit;
}

/* =========================================================
   REQUEST METHOD
========================================================= */

if (
    strtoupper(
        (string) (
            $_SERVER["REQUEST_METHOD"] ?? ""
        )
    ) !== "GET"
) {
    respond_json([
        "success" => false,
        "message" => "Method not allowed."
    ], 405);
}

/* =========================================================
   RESTAURANT ID
========================================================= */

$restaurant_id = filter_input(
    INPUT_GET,
    "restaurant_id",
    FILTER_VALIDATE_INT
);

if (
    $restaurant_id === false ||
    $restaurant_id === null ||
    $restaurant_id <= 0
) {
    respond_json([
        "success" => false,
        "message" => "Invalid restaurant ID."
    ], 422);
}

/* =========================================================
   VERIFY RESTAURANT
========================================================= */

$restaurantStmt = $conn->prepare("
    SELECT
        restaurant_id,
        name,
        business_status
    FROM tbl_restaurants
    WHERE restaurant_id = ?
    LIMIT 1
");

if (!$restaurantStmt) {
    error_log(
        "get_public_products.php restaurant prepare error: " .
        $conn->error
    );

    respond_json([
        "success" => false,
        "message" => "Unable to load the restaurant."
    ], 500);
}

$restaurantStmt->bind_param(
    "i",
    $restaurant_id
);

$restaurantStmt->execute();

$restaurant = $restaurantStmt
    ->get_result()
    ->fetch_assoc();

$restaurantStmt->close();

if (!$restaurant) {
    respond_json([
        "success" => false,
        "message" => "Restaurant not found."
    ], 404);
}

$business_status = trim(
    (string) (
        $restaurant["business_status"] ??
        "Closed"
    )
);

$is_accepting_orders =
    strtolower($business_status) === "open";

/* =========================================================
   LOAD PUBLIC PRODUCTS
========================================================= */

$stmt = $conn->prepare("
    SELECT
        product_id,
        product_name,
        category,
        size,
        price,
        stock,
        status
    FROM tbl_products
    WHERE restaurant_id = ?
    ORDER BY product_id DESC
");

if (!$stmt) {
    error_log(
        "get_public_products.php products prepare error: " .
        $conn->error
    );

    respond_json([
        "success" => false,
        "message" => "Unable to load products."
    ], 500);
}

$stmt->bind_param(
    "i",
    $restaurant_id
);

if (!$stmt->execute()) {
    error_log(
        "get_public_products.php execute error: " .
        $stmt->error
    );

    $stmt->close();

    respond_json([
        "success" => false,
        "message" => "Unable to load products."
    ], 500);
}

$result = $stmt->get_result();

$products = [];

while ($row = $result->fetch_assoc()) {
    $stock = max(
        0,
        (int) (
            $row["stock"] ?? 0
        )
    );

    $products[] = [
        "id" =>
            (int) $row["product_id"],

        "product_id" =>
            (int) $row["product_id"],

        "name" =>
            (string) $row["product_name"],

        "product_name" =>
            (string) $row["product_name"],

        "category" =>
            (string) (
                $row["category"] ??
                "Uncategorized"
            ),

        "size" =>
            (string) (
                $row["size"] ?? ""
            ),

        "price" =>
            round(
                (float) (
                    $row["price"] ?? 0
                ),
                2
            ),

        "stock" =>
            $stock,

        "status" =>
            (string) (
                $row["status"] ??
                (
                    $stock > 0
                        ? "Available"
                        : "Unavailable"
                )
            )
    ];
}

$stmt->close();

respond_json([
    "success" => true,

    "restaurant" => [
        "restaurant_id" =>
            (int) $restaurant["restaurant_id"],

        "name" =>
            (string) $restaurant["name"],

        "business_status" =>
            $business_status,

        "is_accepting_orders" =>
            $is_accepting_orders
    ],

    "products" =>
        $products
]);