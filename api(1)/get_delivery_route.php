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
        "message" => "Method not allowed."
    ], 405);
}

/* =========================================================
   DELIVERY STAFF SESSION
========================================================= */

if (
    empty($_SESSION["user_id"]) ||
    empty($_SESSION["restaurant_id"])
) {
    respond_json([
        "success" => false,
        "message" => "Unauthorized access."
    ], 401);
}

$riderId =
    (int)$_SESSION["user_id"];

$restaurantId =
    (int)$_SESSION["restaurant_id"];

if (
    $riderId <= 0 ||
    $restaurantId <= 0
) {
    respond_json([
        "success" => false,
        "message" =>
            "Invalid delivery staff session."
    ], 401);
}

/* =========================================================
   VERIFY DELIVERY STAFF
========================================================= */

$stmt = $conn->prepare("
    SELECT
        user_id
    FROM tbl_users
    WHERE user_id = ?
      AND restaurant_id = ?
      AND role = 'delivery_staff'
      AND status = 1
    LIMIT 1
");

if (!$stmt) {
    respond_json([
        "success" => false,
        "message" =>
            "Unable to verify the delivery rider."
    ], 500);
}

$stmt->bind_param(
    "ii",
    $riderId,
    $restaurantId
);

$stmt->execute();

$result =
    $stmt->get_result();

$rider =
    $result->fetch_assoc();

$stmt->close();

if (!$rider) {
    respond_json([
        "success" => false,
        "message" =>
            "This account is not authorized as delivery staff."
    ], 403);
}

/* =========================================================
   REQUEST DATA
========================================================= */

$input = json_decode(
    file_get_contents("php://input"),
    true
);

if (!is_array($input)) {
    respond_json([
        "success" => false,
        "message" =>
            "Invalid route request."
    ], 400);
}

$assignmentId =
    (int)($input["assignment_id"] ?? 0);

$riderLatitude =
    filter_var(
        $input["rider_latitude"] ?? null,
        FILTER_VALIDATE_FLOAT
    );

$riderLongitude =
    filter_var(
        $input["rider_longitude"] ?? null,
        FILTER_VALIDATE_FLOAT
    );

if (
    $assignmentId <= 0 ||
    $riderLatitude === false ||
    $riderLongitude === false
) {
    respond_json([
        "success" => false,
        "message" =>
            "Invalid route coordinates."
    ], 400);
}

if (
    $riderLatitude < -90 ||
    $riderLatitude > 90 ||
    $riderLongitude < -180 ||
    $riderLongitude > 180
) {
    respond_json([
        "success" => false,
        "message" =>
            "The rider coordinates are invalid."
    ], 400);
}

/* =========================================================
   LOAD THE ACTUAL DELIVERY DESTINATION FROM MYSQL

   IMPORTANT:
   Customer coordinates are NOT accepted from JavaScript.
   We load them from the authorized assignment instead.
========================================================= */

$stmt = $conn->prepare("
    SELECT
        da.assignment_id,
        da.order_id,
        da.delivery_status,
        o.customer_latitude,
        o.customer_longitude
    FROM tbl_delivery_assignments da

    INNER JOIN tbl_orders o
        ON o.order_id = da.order_id
       AND o.restaurant_id = da.restaurant_id

    WHERE da.assignment_id = ?
      AND da.rider_id = ?
      AND da.restaurant_id = ?
      AND da.delivery_status = 'out_for_delivery'

    LIMIT 1
");

if (!$stmt) {
    respond_json([
        "success" => false,
        "message" =>
            "Unable to validate the delivery assignment."
    ], 500);
}

$stmt->bind_param(
    "iii",
    $assignmentId,
    $riderId,
    $restaurantId
);

$stmt->execute();

$result =
    $stmt->get_result();

$delivery =
    $result->fetch_assoc();

$stmt->close();

if (!$delivery) {
    respond_json([
        "success" => false,
        "message" =>
            "This delivery is not authorized for route tracking."
    ], 403);
}

$customerLatitude =
    filter_var(
        $delivery["customer_latitude"] ?? null,
        FILTER_VALIDATE_FLOAT
    );

$customerLongitude =
    filter_var(
        $delivery["customer_longitude"] ?? null,
        FILTER_VALIDATE_FLOAT
    );

if (
    $customerLatitude === false ||
    $customerLongitude === false
) {
    respond_json([
        "success" => false,
        "message" =>
            "The customer destination does not have valid coordinates."
    ], 422);
}

if (
    $customerLatitude < -90 ||
    $customerLatitude > 90 ||
    $customerLongitude < -180 ||
    $customerLongitude > 180
) {
    respond_json([
        "success" => false,
        "message" =>
            "The customer destination coordinates are invalid."
    ], 422);
}

/* =========================================================
   LOAD PRIVATE GEOAPIFY CONFIGURATION
========================================================= */

$geoapifyConfigFile =
    __DIR__ .
    "/config/geoapify.local.php";

if (!is_file($geoapifyConfigFile)) {
    respond_json([
        "success" => false,
        "message" =>
            "Geoapify configuration is missing."
    ], 500);
}

$geoapifyConfig =
    require $geoapifyConfigFile;

$geoapifyApiKey =
    trim(
        (string)(
            $geoapifyConfig["api_key"] ?? ""
        )
    );

if ($geoapifyApiKey === "") {
    respond_json([
        "success" => false,
        "message" =>
            "Geoapify API key is not configured."
    ], 500);
}

/* =========================================================
   BUILD GEOAPIFY ROUTING REQUEST
========================================================= */

$waypoints =
    $riderLatitude .
    "," .
    $riderLongitude .
    "|" .
    $customerLatitude .
    "," .
    $customerLongitude;

$parameters =
    http_build_query([
        "waypoints" =>
            $waypoints,

        /*
         * Your delivery riders use motorcycles.
         */
        "mode" =>
            "motorcycle",

        "type" =>
            "balanced",

        /*
         * GeoJSON is easy to draw directly in Leaflet.
         */
        "format" =>
            "geojson",

        "apiKey" =>
            $geoapifyApiKey
    ]);

$url =
    "https://api.geoapify.com/v1/routing?" .
    $parameters;

/* =========================================================
   CALL GEOAPIFY
========================================================= */

$curl =
    curl_init();

if ($curl === false) {
    respond_json([
        "success" => false,
        "message" =>
            "Unable to initialize the routing service."
    ], 500);
}

curl_setopt_array($curl, [
    CURLOPT_URL =>
        $url,

    CURLOPT_RETURNTRANSFER =>
        true,

    CURLOPT_FOLLOWLOCATION =>
        true,

    CURLOPT_CONNECTTIMEOUT =>
        8,

    CURLOPT_TIMEOUT =>
        15,

    CURLOPT_HTTPHEADER => [
        "Accept: application/json"
    ],

    CURLOPT_SSL_VERIFYPEER =>
        true,

    CURLOPT_SSL_VERIFYHOST =>
        2
]);

$responseBody =
    curl_exec($curl);

$curlError =
    curl_error($curl);

$httpStatus =
    (int)curl_getinfo(
        $curl,
        CURLINFO_HTTP_CODE
    );

curl_close($curl);

/* =========================================================
   HANDLE PROVIDER ERRORS
========================================================= */

if ($responseBody === false) {
    error_log(
        "Geoapify routing cURL error: " .
        $curlError
    );

    respond_json([
        "success" => false,
        "message" =>
            "The routing service is temporarily unavailable."
    ], 502);
}

if ($httpStatus !== 200) {
    error_log(
        "Geoapify routing HTTP status: " .
        $httpStatus
    );

    respond_json([
        "success" => false,
        "message" =>
            "Unable to calculate the delivery route."
    ], 502);
}

$geoapifyResponse =
    json_decode(
        $responseBody,
        true
    );

if (!is_array($geoapifyResponse)) {
    respond_json([
        "success" => false,
        "message" =>
            "The routing service returned an invalid response."
    ], 502);
}

/* =========================================================
   VALIDATE ROUTE
========================================================= */

$features =
    $geoapifyResponse["features"] ?? [];

if (
    !is_array($features) ||
    empty($features)
) {
    respond_json([
        "success" => false,
        "message" =>
            "No road route could be found for this delivery."
    ], 404);
}

$routeFeature =
    $features[0];

if (
    !is_array($routeFeature) ||
    empty($routeFeature["geometry"])
) {
    respond_json([
        "success" => false,
        "message" =>
            "The calculated route does not contain valid geometry."
    ], 502);
}

/* =========================================================
   ROUTE INFORMATION
========================================================= */

$properties =
    is_array(
        $routeFeature["properties"] ?? null
    )
        ? $routeFeature["properties"]
        : [];

$distanceMeters =
    (float)(
        $properties["distance"] ?? 0
    );

$timeSeconds =
    (float)(
        $properties["time"] ?? 0
    );

/* =========================================================
   RESPONSE

   Do NOT return:
   - Geoapify API key
   - private config
========================================================= */

respond_json([
    "success" => true,

    "message" =>
        "Delivery route calculated successfully.",

    "assignment_id" =>
        $assignmentId,

    "order_id" =>
        (int)$delivery["order_id"],

    "route" => [
        "geometry" =>
            $routeFeature["geometry"],

        "distance_meters" =>
            $distanceMeters,

        "duration_seconds" =>
            $timeSeconds
    ],

    "destination" => [
        "latitude" =>
            (float)$customerLatitude,

        "longitude" =>
            (float)$customerLongitude
    ]
]);