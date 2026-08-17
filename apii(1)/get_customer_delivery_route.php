<?php

declare(strict_types=1);

header(
    "Content-Type: application/json; charset=utf-8"
);

header(
    "Cache-Control: no-store, no-cache, must-revalidate, max-age=0"
);

require_once __DIR__ . "/session_config.php";
require_once __DIR__ . "/db.php";


function respond_json(
    array $data,
    int $statusCode = 200
): void {
    http_response_code(
        $statusCode
    );

    echo json_encode(
        $data,
        JSON_UNESCAPED_UNICODE |
        JSON_UNESCAPED_SLASHES
    );

    exit;
}


/* =========================================================
   METHOD
========================================================= */

if (
    strtoupper(
        (string)(
            $_SERVER["REQUEST_METHOD"] ?? ""
        )
    ) !== "POST"
) {
    respond_json([
        "success" => false,
        "message" => "This action is not available."
    ], 405);
}


/* =========================================================
   CUSTOMER SESSION
========================================================= */

$customerId =
    (int)(
        $_SESSION["user_id"] ?? 0
    );

if ($customerId <= 0) {
    respond_json([
        "success" => false,
        "message" =>
            "Your session has expired or you do not have access. Please log in again."
    ], 401);
}


/* =========================================================
   VERIFY CUSTOMER ACCOUNT
========================================================= */

$userStmt =
    $conn->prepare("
        SELECT
            user_id,
            role,
            status
        FROM tbl_users
        WHERE user_id = ?
          AND role = 'customer'
          AND status = 1
        LIMIT 1
    ");

if (!$userStmt) {
    respond_json([
        "success" => false,
        "message" =>
            "Unable to verify customer account."
    ], 500);
}

$userStmt->bind_param(
    "i",
    $customerId
);

$userStmt->execute();

$user =
    $userStmt
        ->get_result()
        ->fetch_assoc();

$userStmt->close();

if (!$user) {
    respond_json([
        "success" => false,
        "message" =>
            "This account is not an active customer account."
    ], 403);
}


/* =========================================================
   REQUEST BODY
========================================================= */

$rawInput =
    file_get_contents(
        "php://input"
    );

$input =
    json_decode(
        $rawInput,
        true
    );

if (!is_array($input)) {
    respond_json([
        "success" => false,
        "message" =>
            "Invalid request data."
    ], 400);
}

$assignmentId =
    (int)(
        $input["assignment_id"] ?? 0
    );

$riderLatitude =
    isset($input["rider_latitude"])
        ? (float)$input["rider_latitude"]
        : null;

$riderLongitude =
    isset($input["rider_longitude"])
        ? (float)$input["rider_longitude"]
        : null;


if ($assignmentId <= 0) {
    respond_json([
        "success" => false,
        "message" =>
            "A valid delivery assignment is required."
    ], 400);
}


if (
    $riderLatitude === null ||
    $riderLongitude === null ||
    $riderLatitude < -90 ||
    $riderLatitude > 90 ||
    $riderLongitude < -180 ||
    $riderLongitude > 180
) {
    respond_json([
        "success" => false,
        "message" =>
            "Invalid rider coordinates."
    ], 400);
}


/* =========================================================
   VERIFY CUSTOMER OWNS THE DELIVERY

   IMPORTANT:
   Never trust assignment_id by itself.

   We join:
   assignment
       ↓
   order
       ↓
   logged-in customer
========================================================= */

$deliveryStmt =
    $conn->prepare("
        SELECT
            da.assignment_id,
            da.order_id,
            da.restaurant_id,
            da.delivery_staff_id,
            da.delivery_status,

            o.user_id,
            o.order_type,
            o.order_status,
            o.customer_latitude,
            o.customer_longitude

        FROM tbl_delivery_assignments da

        INNER JOIN tbl_orders o
            ON o.order_id =
               da.order_id
           AND o.restaurant_id =
               da.restaurant_id

        WHERE da.assignment_id = ?
          AND o.user_id = ?
          AND o.order_type = 'delivery'
          AND da.delivery_status =
              'out_for_delivery'

        LIMIT 1
    ");

if (!$deliveryStmt) {
    respond_json([
        "success" => false,
        "message" =>
            "Unable to verify delivery assignment."
    ], 500);
}

$deliveryStmt->bind_param(
    "ii",
    $assignmentId,
    $customerId
);

$deliveryStmt->execute();

$delivery =
    $deliveryStmt
        ->get_result()
        ->fetch_assoc();

$deliveryStmt->close();


if (!$delivery) {
    respond_json([
        "success" => false,
        "message" =>
            "This delivery is not available for customer tracking."
    ], 403);
}


/* =========================================================
   CUSTOMER DESTINATION
========================================================= */

$customerLatitude =
    $delivery[
        "customer_latitude"
    ] !== null
        ? (float)$delivery[
            "customer_latitude"
        ]
        : null;

$customerLongitude =
    $delivery[
        "customer_longitude"
    ] !== null
        ? (float)$delivery[
            "customer_longitude"
        ]
        : null;


if (
    $customerLatitude === null ||
    $customerLongitude === null ||
    $customerLatitude < -90 ||
    $customerLatitude > 90 ||
    $customerLongitude < -180 ||
    $customerLongitude > 180
) {
    respond_json([
        "success" => false,
        "message" =>
            "Customer delivery coordinates are unavailable."
    ], 400);
}


/* =========================================================
   GEOAPIFY CONFIGURATION
========================================================= */

$configPath =
    __DIR__ .
    "/config/geoapify.local.php";


if (!is_file($configPath)) {
    respond_json([
        "success" => false,
        "message" =>
            "Geoapify configuration is missing."
    ], 500);
}


$config =
    require $configPath;


$apiKey =
    trim(
        (string)(
            $config["api_key"] ?? ""
        )
    );


if ($apiKey === "") {
    respond_json([
        "success" => false,
        "message" =>
            "Geoapify API key is missing."
    ], 500);
}


/* =========================================================
   GEOAPIFY ROUTING REQUEST

   Geoapify expects:
   latitude,longitude
========================================================= */

$waypoints =
    $riderLatitude .
    "," .
    $riderLongitude .
    "|" .
    $customerLatitude .
    "," .
    $customerLongitude;


$url =
    "https://api.geoapify.com/v1/routing" .
    "?waypoints=" .
    rawurlencode(
        $waypoints
    ) .
    "&mode=motorcycle" .
    "&apiKey=" .
    rawurlencode(
        $apiKey
    );


/* =========================================================
   CURL
========================================================= */

$curl =
    curl_init();

curl_setopt_array(
    $curl,
    [
        CURLOPT_URL =>
            $url,

        CURLOPT_RETURNTRANSFER =>
            true,

        CURLOPT_CONNECTTIMEOUT =>
            8,

        CURLOPT_TIMEOUT =>
            15,

        CURLOPT_HTTPHEADER =>
            [
                "Accept: application/json"
            ]
    ]
);


$responseBody =
    curl_exec(
        $curl
    );


$curlError =
    curl_error(
        $curl
    );


$httpStatus =
    (int)curl_getinfo(
        $curl,
        CURLINFO_HTTP_CODE
    );


curl_close(
    $curl
);


if ($responseBody === false) {
    respond_json([
        "success" => false,
        "message" =>
            "Unable to contact the routing service.",
        "error" =>
            $curlError
    ], 502);
}


$geoapify =
    json_decode(
        $responseBody,
        true
    );


if (
    $httpStatus < 200 ||
    $httpStatus >= 300 ||
    !is_array($geoapify)
) {
    respond_json([
        "success" => false,
        "message" =>
            "The routing service returned an error."
    ], 502);
}


/* =========================================================
   ROUTE FEATURE
========================================================= */

$feature =
    $geoapify["features"][0]
        ?? null;


if (
    !is_array($feature) ||
    empty($feature["geometry"])
) {
    respond_json([
        "success" => false,
        "message" =>
            "No delivery route could be calculated."
    ], 404);
}


$properties =
    is_array(
        $feature["properties"] ?? null
    )
        ? $feature["properties"]
        : [];


$distanceMeters =
    (float)(
        $properties["distance"]
        ?? 0
    );


$durationSeconds =
    (float)(
        $properties["time"]
        ?? 0
    );


/* =========================================================
   RESPONSE
========================================================= */

respond_json([
    "success" =>
        true,

    "route" => [
        "geometry" =>
            $feature["geometry"],

        "distance_meters" =>
            $distanceMeters,

        "duration_seconds" =>
            $durationSeconds
    ],

    "delivery" => [
        "assignment_id" =>
            (int)$delivery[
                "assignment_id"
            ],

        "order_id" =>
            (int)$delivery[
                "order_id"
            ],

        "restaurant_id" =>
            (int)$delivery[
                "restaurant_id"
            ],

        "delivery_staff_id" =>
            (int)$delivery[
                "delivery_staff_id"
            ]
    ]
]);