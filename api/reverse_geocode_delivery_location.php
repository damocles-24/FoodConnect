<?php

declare(strict_types=1);

header(
    "Content-Type: application/json; charset=utf-8"
);

header(
    "Cache-Control: no-store, no-cache, must-revalidate, max-age=0"
);

require_once __DIR__ . "/session_config.php";

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
        (string)($_SERVER["REQUEST_METHOD"] ?? "")
    ) !== "POST"
) {
    respond_json([
        "success" => false,
        "message" =>
            "Method not allowed."
    ], 405);
}

/* =========================================================
   AUTHENTICATION
========================================================= */

if (empty($_SESSION["user_id"])) {
    respond_json([
        "success" => false,
        "message" =>
            "Please log in before getting your current address."
    ], 401);
}

/* =========================================================
   GEOAPIFY CONFIGURATION
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

$geoapifyApiKey = trim(
    (string)(
        $geoapifyConfig["api_key"] ?? ""
    )
);

if (
    $geoapifyApiKey === "" ||
    $geoapifyApiKey ===
        "PASTE_YOUR_GEOAPIFY_API_KEY_HERE"
) {
    respond_json([
        "success" => false,
        "message" =>
            "Geoapify API key is not configured."
    ], 500);
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
            "Invalid location request."
    ], 400);
}

$latitude =
    filter_var(
        $input["latitude"] ?? null,
        FILTER_VALIDATE_FLOAT
    );

$longitude =
    filter_var(
        $input["longitude"] ?? null,
        FILTER_VALIDATE_FLOAT
    );

if (
    $latitude === false ||
    $longitude === false
) {
    respond_json([
        "success" => false,
        "message" =>
            "Valid latitude and longitude are required."
    ], 400);
}

$latitude =
    (float)$latitude;

$longitude =
    (float)$longitude;

if (
    $latitude < -90 ||
    $latitude > 90 ||
    $longitude < -180 ||
    $longitude > 180
) {
    respond_json([
        "success" => false,
        "message" =>
            "The selected coordinates are invalid."
    ], 400);
}

/* =========================================================
   SIMPLE RATE LIMIT
========================================================= */

$currentTime =
    microtime(true);

$lastRequestTime = isset(
    $_SESSION[
        "delivery_reverse_geocode_last_request"
    ]
)
    ? (float)$_SESSION[
        "delivery_reverse_geocode_last_request"
    ]
    : 0.0;

if (
    $lastRequestTime > 0 &&
    ($currentTime - $lastRequestTime) < 1.0
) {
    respond_json([
        "success" => false,
        "message" =>
            "Please wait a moment before trying again."
    ], 429);
}

$_SESSION[
    "delivery_reverse_geocode_last_request"
] = $currentTime;

/* =========================================================
   GEOAPIFY REVERSE GEOCODING
========================================================= */

$parameters = http_build_query([
    "lat" =>
        $latitude,

    "lon" =>
        $longitude,

    "format" =>
        "json",

    "lang" =>
        "en",

    "limit" =>
        1,

    "apiKey" =>
        $geoapifyApiKey
]);

$url =
    "https://api.geoapify.com/v1/geocode/reverse?" .
    $parameters;

$curl =
    curl_init();

if ($curl === false) {
    respond_json([
        "success" => false,
        "message" =>
            "Unable to start the address lookup."
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

if ($responseBody === false) {
    error_log(
        "Geoapify reverse geocoding error: " .
        $curlError
    );

    respond_json([
        "success" => false,
        "message" =>
            "Unable to identify the current address."
    ], 502);
}

if ($httpStatus !== 200) {
    error_log(
        "Geoapify reverse geocoding HTTP status: " .
        $httpStatus
    );

    respond_json([
        "success" => false,
        "message" =>
            "The address service is temporarily unavailable."
    ], 502);
}

$decodedResponse =
    json_decode(
        $responseBody,
        true
    );

if (!is_array($decodedResponse)) {
    respond_json([
        "success" => false,
        "message" =>
            "The address service returned an invalid response."
    ], 502);
}

$results =
    $decodedResponse["results"] ?? [];

if (
    !is_array($results) ||
    empty($results) ||
    !is_array($results[0])
) {
    respond_json([
        "success" => true,
        "message" =>
            "Your location was found, but no written address is available.",

        "address_found" =>
            false,

        "location" => [
            "latitude" =>
                $latitude,

            "longitude" =>
                $longitude
        ]
    ]);
}

$result =
    $results[0];

$formattedAddress = trim(
    (string)(
        $result["formatted"] ??
        $result["address_line2"] ??
        $result["address_line1"] ??
        ""
    )
);

$road = trim(
    (string)(
        $result["street"] ??
        $result["road"] ??
        ""
    )
);

$houseNumber = trim(
    (string)(
        $result["housenumber"] ??
        $result["house_number"] ??
        ""
    )
);

$streetDetails = trim(
    implode(
        " ",
        array_values(
            array_filter(
                [
                    $houseNumber,
                    $road
                ],
                static function ($value): bool {
                    return trim(
                        (string)$value
                    ) !== "";
                }
            )
        )
    )
);

$barangay = trim(
    (string)(
        $result["suburb"] ??
        $result["district"] ??
        $result["village"] ??
        ""
    )
);

$city = trim(
    (string)(
        $result["city"] ??
        $result["town"] ??
        $result["municipality"] ??
        ""
    )
);

/*
 * For Philippine Geoapify results, `state` is the best primary
 * candidate for FoodConnect's Province / Area.
 *
 * Example from the real Alaminos response:
 *   city   = Alaminos
 *   county = Alaminos
 *   state  = Pangasinan
 *
 * This is generic logic, not a Pangasinan hard-code.
 */
$provinceState = trim(
    (string)(
        $result["state"] ??
        ""
    )
);

$provinceCounty = trim(
    (string)(
        $result["county"] ??
        ""
    )
);

$province = $provinceState;

if (
    $province === "" &&
    $provinceCounty !== "" &&
    strcasecmp(
        $provinceCounty,
        $city
    ) !== 0
) {
    $province =
        $provinceCounty;
}

respond_json([
    "success" =>
        true,

    "message" =>
        $formattedAddress !== ""
            ? "Current address found successfully."
            : "Your location was found, but no written address is available.",

    "address_found" =>
        $formattedAddress !== "",

    "location" => [
        /*
         * Keep the phone GPS coordinates.
         * These are more important than the coordinates
         * returned by reverse geocoding.
         */
        "latitude" =>
            $latitude,

        "longitude" =>
            $longitude,

        "display_name" =>
            $formattedAddress,

        "road" =>
            $road,

        "street_details" =>
            $streetDetails,

        "barangay" =>
            $barangay,

        "city" =>
            $city,

        "province" =>
            $province,

        /*
         * Non-secret administrative hints for defensive frontend matching.
         */
        "province_county" =>
            $provinceCounty,

        "region" =>
            $provinceState
    ]
]);