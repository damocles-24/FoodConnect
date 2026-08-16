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
        "message" => "This action is not available.",
        "restaurants" => []
    ], 405);
}

/* =========================================================
   LOAD PUBLIC RESTAURANTS

   Only restaurants with an active and verified owner
   are visible to customers.
========================================================= */

$stmt = $conn->prepare("
    SELECT
        r.restaurant_id,
        r.name,
        r.description,
        r.logo_path,
        r.banner_path,
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

    WHERE
        r.setup_completed = 1
        AND r.customer_visibility = 'Visible'

    ORDER BY
        r.restaurant_id ASC
");

if (!$stmt) {
    error_log(
        "get_public_restaurants.php prepare error: " .
        $conn->error
    );

    respond_json([
        "success" => false,
        "message" =>
            "Unable to load restaurants.",
        "restaurants" => []
    ], 500);
}

if (!$stmt->execute()) {
    error_log(
        "get_public_restaurants.php execute error: " .
        $stmt->error
    );

    $stmt->close();

    respond_json([
        "success" => false,
        "message" =>
            "Unable to load restaurants.",
        "restaurants" => []
    ], 500);
}

$result = $stmt->get_result();

$restaurants = [];

while ($row = $result->fetch_assoc()) {
    $businessStatus = trim(
        (string) (
            $row["business_status"] ??
            "Closed"
        )
    );

    $restaurants[] = [
        "restaurant_id" =>
            (int) $row["restaurant_id"],

        "name" =>
            (string) $row["name"],

        "address" =>
            (string) (
                $row["address"] ?? ""
            ),

        "contact_number" =>
            (string) (
                $row["contact_number"] ?? ""
            ),

        "opening_hours" =>
            (string) (
                $row["opening_hours"] ?? ""
            ),

        "delivery_fee" =>
            round(
                (float) (
                    $row["delivery_fee"] ?? 0
                ),
                2
            ),

        "business_status" =>
            $businessStatus,

        "is_accepting_orders" =>
            strtolower($businessStatus) ===
            "open"
    ];
}

$stmt->close();

respond_json([
    "success" => true,
    "restaurants" => $restaurants
]);