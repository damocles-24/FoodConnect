<?php

header(
    "Content-Type: application/json; charset=utf-8"
);

error_reporting(
    E_ALL &
    ~E_NOTICE &
    ~E_WARNING
);

ini_set(
    "display_errors",
    "0"
);

session_set_cookie_params(
    0,
    "/",
    "",
    false,
    true
);

require_once __DIR__ . "/session_config.php";

require_once __DIR__ . "/db.php";

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
   OWNER AUTHENTICATION
   ========================================================= */

if (empty($_SESSION["user_id"])) {
    respond_json(
        [
            "success" => false,
            "message" => "Please log in as a restaurant owner."
        ],
        401
    );
}

$role =
    strtolower(
        trim(
            (string) ($_SESSION["role"] ?? "")
        )
    );

if ($role !== "owner") {
    respond_json(
        [
            "success" => false,
            "message" => "Only restaurant owners can access this page."
        ],
        403
    );
}

$ownerId =
    (int) $_SESSION["user_id"];

/* =========================================================
   CHECK IF OWNER ALREADY HAS A RESTAURANT
   ========================================================= */

$restaurantStmt = $conn->prepare("
    SELECT
        restaurant_id,
        name,
        business_status
    FROM tbl_restaurants
    WHERE owner_id = ?
    LIMIT 1
");

if (!$restaurantStmt) {
    respond_json(
        [
            "success" => false,
            "message" => "Unable to check the restaurant account."
        ],
        500
    );
}

$restaurantStmt->bind_param(
    "i",
    $ownerId
);

$restaurantStmt->execute();

$restaurant =
    $restaurantStmt
        ->get_result()
        ->fetch_assoc();

$restaurantStmt->close();

if ($restaurant) {
    respond_json([
        "success" => true,
        "has_restaurant" => true,
        "restaurant" => [
            "restaurant_id" =>
                (int) $restaurant["restaurant_id"],

            "name" =>
                $restaurant["name"],

            "business_status" =>
                $restaurant["business_status"]
        ]
    ]);
}

/* =========================================================
   GET LATEST PARTNER APPLICATION
   ========================================================= */

$stmt = $conn->prepare("
    SELECT
    application_id,
    owner_id,
    restaurant_name,
    restaurant_address,
    restaurant_contact,
    cuisine,
    restaurant_description,
    logo_path,
    business_email,
    province,
    city_municipality,
    barangay,
    postal_code,
    business_hours_json,
    order_types_json,
    delivery_fee,
    application_status,
    rejection_reason,
    submitted_at,
    reviewed_at,
    created_at,
    updated_at
    FROM tbl_partner_applications
    WHERE owner_id = ?
    ORDER BY application_id DESC
    LIMIT 1
");

if (!$stmt) {
    respond_json(
        [
            "success" => false,
            "message" => "Unable to load the restaurant application."
        ],
        500
    );
}

$stmt->bind_param(
    "i",
    $ownerId
);

$stmt->execute();

$application =
    $stmt
        ->get_result()
        ->fetch_assoc();

$stmt->close();

if (!$application) {
    respond_json(
        [
            "success" => false,
            "message" => "No restaurant application was found."
        ],
        404
    );
}

/* =========================================================
   DECODE JSON SETTINGS
   ========================================================= */

$businessHours = json_decode(
    (string) (
        $application["business_hours_json"] ?? ""
    ),
    true
);

$deliveryOptions = json_decode(
    (string) (
        $application["order_types_json"] ?? ""
    ),
    true
);

if (!is_array($businessHours)) {
    $businessHours = [];
}

if (!is_array($deliveryOptions)) {
    $deliveryOptions = [];
}

$application["application_id"] =
    (int) $application["application_id"];

$application["owner_id"] =
    (int) $application["owner_id"];


$application["delivery_fee"] =
    (float) $application["delivery_fee"];

$application["business_hours"] =
    $businessHours;

$application["delivery_options"] =
    $deliveryOptions;

unset(
    $application["business_hours_json"],
    $application["order_types_json"]
);

respond_json([
    "success" => true,
    "has_restaurant" => false,
    "application" => $application
]);