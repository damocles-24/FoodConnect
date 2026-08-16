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
        "message" => "This action is not available."
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
   LOAD PUBLIC RESTAURANT INFORMATION
========================================================= */

$stmt = $conn->prepare("
    SELECT
        r.restaurant_id,
        r.name,
        r.address,
        r.contact_number,
        r.opening_hours,
        r.delivery_fee,
        r.business_status

    FROM tbl_restaurants AS r

    INNER JOIN tbl_users AS owner
        ON owner.user_id = r.owner_id
        AND owner.role = 'owner'
        AND owner.status = 1
        AND owner.is_verified = 1

    WHERE r.restaurant_id = ?

    LIMIT 1
");

if (!$stmt) {
    error_log(
        "get_public_restaurant.php prepare error: " .
        $conn->error
    );

    respond_json([
        "success" => false,
        "message" =>
            "Unable to load restaurant information."
    ], 500);
}

$stmt->bind_param(
    "i",
    $restaurant_id
);

if (!$stmt->execute()) {
    error_log(
        "get_public_restaurant.php execute error: " .
        $stmt->error
    );

    $stmt->close();

    respond_json([
        "success" => false,
        "message" =>
            "Unable to load restaurant information."
    ], 500);
}

$restaurant = $stmt
    ->get_result()
    ->fetch_assoc();

$stmt->close();

if (!$restaurant) {
    respond_json([
        "success" => false,
        "message" =>
            "This restaurant is currently unavailable on FoodConnect."
    ], 404);
}

$business_status = trim(
    (string) (
        $restaurant["business_status"] ??
        "Closed"
    )
);

$normalized_status = strtolower(
    $business_status
);

$is_accepting_orders =
    $normalized_status === "open";

/* =========================================================
   RESPONSE
========================================================= */

respond_json([
    "success" => true,

    "restaurant" => [
        "restaurant_id" =>
            (int) $restaurant["restaurant_id"],

        "name" =>
            (string) $restaurant["name"],

        "address" =>
            (string) (
                $restaurant["address"] ?? ""
            ),

        "contact_number" =>
            (string) (
                $restaurant["contact_number"] ?? ""
            ),

        "opening_hours" =>
            (string) (
                $restaurant["opening_hours"] ?? ""
            ),

        "delivery_fee" =>
            round(
                (float) (
                    $restaurant["delivery_fee"] ?? 0
                ),
                2
            ),

        "business_status" =>
            $business_status,

        "is_accepting_orders" =>
            $is_accepting_orders
    ]
]);