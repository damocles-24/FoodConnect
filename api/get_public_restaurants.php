<?php

header(
    "Content-Type: application/json; charset=utf-8"
);

header(
    "Cache-Control: no-store, no-cache, must-revalidate, max-age=0"
);

require_once __DIR__ . "/db.php";
require_once __DIR__ . "/delivery_pricing_helper.php";

/*
 * Load the schedule checker defensively.
 * A missing/new helper file must never make the public restaurant directory
 * return HTTP 500. The included helper is still used whenever available.
 */
$availabilityHelperPath = __DIR__ . "/restaurant_availability_helper.php";

if (is_file($availabilityHelperPath)) {
    require_once $availabilityHelperPath;
} else {
    error_log(
        "FoodConnect availability helper is missing: " .
        $availabilityHelperPath
    );
}

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

    $openingHours =
        (string) (
            $row["opening_hours"] ?? ""
        );

    /*
     * Do not allow one availability-calculation problem to hide every
     * restaurant from customers. If the helper cannot run for any reason,
     * fall back to the previous manual business-status behavior and log the
     * server-side error for debugging.
     */
    $availability = [
        "is_accepting_orders" =>
            strtolower($businessStatus) === "open",
        "customer_status" =>
            strtolower($businessStatus) === "open"
                ? "Open"
                : (
                    strtolower($businessStatus) === "temporarily unavailable"
                        ? "Temporarily Unavailable"
                        : "Closed"
                ),
        "availability_reason" => "manual_fallback",
        "schedule_parsed" => false
    ];

    if (function_exists("fc_restaurant_evaluate_availability")) {
        try {
            $availability =
                fc_restaurant_evaluate_availability(
                    $businessStatus,
                    $openingHours
                );
        } catch (Throwable $error) {
            error_log(
                "Restaurant availability check failed for restaurant " .
                (int) $row["restaurant_id"] .
                ": " .
                $error->getMessage()
            );
        }
    }

    $deliveryPricing =
        fc_delivery_pricing_get_active(
            $conn,
            (int) $row["restaurant_id"],
            (float) ($row["delivery_fee"] ?? 0)
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
            $openingHours,

        "delivery_fee" =>
            round(
                (float) (
                    $row["delivery_fee"] ?? 0
                ),
                2
            ),

        "delivery_pricing_type" =>
            (string) $deliveryPricing["pricing_type"],

        "business_status" =>
            $businessStatus,

        "customer_status" =>
            (string) $availability["customer_status"],

        "availability_reason" =>
            (string) $availability["availability_reason"],

        "is_accepting_orders" =>
            (bool) $availability["is_accepting_orders"]
    ];
}

$stmt->close();

respond_json([
    "success" => true,
    "restaurants" => $restaurants
]);