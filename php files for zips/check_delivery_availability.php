<?php

header(
    "Content-Type: application/json; charset=utf-8"
);

header(
    "Cache-Control: no-store, no-cache, must-revalidate, max-age=0"
);

session_set_cookie_params(
    0,
    "FoodConnect",
    "",
    false,
    true
);

require_once __DIR__ . "/session_config.php";

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
        JSON_UNESCAPED_UNICODE
    );

    exit;
}

/* =========================================================
   DATABASE CONNECTION CHECK
========================================================= */

if (
    !isset($conn) ||
    !($conn instanceof mysqli)
) {
    respond_json([
        "success" => false,
        "message" =>
            "Database connection is unavailable.",
        "delivery_available" => false,
        "available_rider_count" => 0
    ], 500);
}

/* =========================================================
   CUSTOMER AUTHENTICATION
========================================================= */

if (empty($_SESSION["user_id"])) {
    $conn->close();

    respond_json([
        "success" => false,
        "message" =>
            "Please login first.",
        "delivery_available" => false,
        "available_rider_count" => 0
    ], 401);
}

$user_id =
    (int)$_SESSION["user_id"];

if ($user_id <= 0) {
    $conn->close();

    respond_json([
        "success" => false,
        "message" =>
            "Invalid customer session.",
        "delivery_available" => false,
        "available_rider_count" => 0
    ], 401);
}

/* =========================================================
   DETERMINE RESTAURANT FROM CUSTOMER CART

   Customers do not need restaurant_id stored in their
   session. The restaurant is determined from their cart.
========================================================= */

$cartStmt = $conn->prepare("
    SELECT DISTINCT
        restaurant_id

    FROM tbl_cart

    WHERE user_id = ?

    ORDER BY restaurant_id ASC
");

if (!$cartStmt) {
    error_log(
        "FoodConnect delivery availability cart prepare error: " .
        $conn->error
    );

    $conn->close();

    respond_json([
        "success" => false,
        "message" =>
            "Unable to check delivery availability.",
        "delivery_available" => false,
        "available_rider_count" => 0
    ], 500);
}

$cartStmt->bind_param(
    "i",
    $user_id
);

if (!$cartStmt->execute()) {
    error_log(
        "FoodConnect delivery availability cart execute error: " .
        $cartStmt->error
    );

    $cartStmt->close();
    $conn->close();

    respond_json([
        "success" => false,
        "message" =>
            "Unable to check delivery availability.",
        "delivery_available" => false,
        "available_rider_count" => 0
    ], 500);
}

$cartResult =
    $cartStmt->get_result();

$restaurantIds = [];

while (
    $row = $cartResult->fetch_assoc()
) {
    $restaurantId = (int)(
        $row["restaurant_id"] ?? 0
    );

    if ($restaurantId > 0) {
        $restaurantIds[] =
            $restaurantId;
    }
}

$cartStmt->close();

if (count($restaurantIds) === 0) {
    $conn->close();

    respond_json([
        "success" => false,
        "message" =>
            "Your cart is empty.",
        "delivery_available" => false,
        "available_rider_count" => 0
    ], 400);
}

if (count($restaurantIds) > 1) {
    $conn->close();

    respond_json([
        "success" => false,
        "message" =>
            "Products from different restaurants cannot be checked out together.",
        "delivery_available" => false,
        "available_rider_count" => 0
    ], 400);
}

$restaurant_id =
    (int)$restaurantIds[0];

/* =========================================================
   COUNT AVAILABLE INTERNAL RESTAURANT RIDERS

   Available means:
   - belongs to this restaurant
   - role is delivery_staff
   - account is active
   - has no active delivery assignment
========================================================= */

$riderStmt = $conn->prepare("
    SELECT
        COUNT(*) AS available_rider_count

    FROM tbl_users AS riders

    WHERE riders.restaurant_id = ?
      AND riders.role = 'delivery_staff'
      AND riders.status = 1

      AND NOT EXISTS (
            SELECT
                1

            FROM tbl_delivery_assignments AS assignments

            WHERE assignments.rider_id =
                    riders.user_id

              AND assignments.restaurant_id =
                    riders.restaurant_id

              AND assignments.delivery_status
                    NOT IN (
                        'completed',
                        'cancelled'
                    )
      )
");

if (!$riderStmt) {
    error_log(
        "FoodConnect delivery availability rider prepare error: " .
        $conn->error
    );

    $conn->close();

    respond_json([
        "success" => false,
        "message" =>
            "Unable to check delivery availability.",
        "delivery_available" => false,
        "available_rider_count" => 0
    ], 500);
}

$riderStmt->bind_param(
    "i",
    $restaurant_id
);

if (!$riderStmt->execute()) {
    error_log(
        "FoodConnect delivery availability rider execute error: " .
        $riderStmt->error
    );

    $riderStmt->close();
    $conn->close();

    respond_json([
        "success" => false,
        "message" =>
            "Unable to check delivery availability.",
        "delivery_available" => false,
        "available_rider_count" => 0
    ], 500);
}

$riderResult =
    $riderStmt->get_result();

$riderRow =
    $riderResult->fetch_assoc();

$riderStmt->close();
$conn->close();

$availableRiderCount = (int)(
    $riderRow["available_rider_count"] ?? 0
);

respond_json([
    "success" => true,

    "message" =>
        $availableRiderCount > 0
            ? "Delivery is currently available."
            : "No delivery rider is currently available for this restaurant.",

    "restaurant_id" =>
        $restaurant_id,

    "delivery_available" =>
        $availableRiderCount > 0,

    "available_rider_count" =>
        $availableRiderCount
]);