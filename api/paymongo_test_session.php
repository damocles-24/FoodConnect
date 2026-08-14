<?php

date_default_timezone_set(
    "Asia/Manila"
);

header(
    "Content-Type: application/json; charset=utf-8"
);

error_reporting(E_ALL & ~E_NOTICE & ~E_WARNING);
ini_set("display_errors", "0");

require_once __DIR__ . "/session_config.php";
require_once __DIR__ . "/db.php";

function paymongo_test_respond(
    array $data,
    int $statusCode = 200
): void {
    http_response_code($statusCode);
    echo json_encode($data);
    exit;
}

/*
|--------------------------------------------------------------------------
| Require a logged-in FoodConnect user.
|--------------------------------------------------------------------------
*/

if (empty($_SESSION["user_id"])) {
    paymongo_test_respond([
        "success" => false,
        "message" => "Please login to FoodConnect first."
    ], 401);
}

$userId = (int)$_SESSION["user_id"];

$roleStmt = $conn->prepare("
    SELECT
        role

    FROM tbl_users

    WHERE user_id = ?

    LIMIT 1
");

if (!$roleStmt) {
    paymongo_test_respond([
        "success" => false,
        "message" => "Unable to validate your FoodConnect account."
    ], 500);
}

$roleStmt->bind_param(
    "i",
    $userId
);

if (!$roleStmt->execute()) {
    $roleStmt->close();

    paymongo_test_respond([
        "success" => false,
        "message" => "Unable to validate your FoodConnect account."
    ], 500);
}

$roleRow =
    $roleStmt
        ->get_result()
        ->fetch_assoc();

$roleStmt->close();

$role = strtolower(
    trim(
        (string)(
            $roleRow["role"] ?? ""
        )
    )
);

/*
 * This developer test endpoint is intentionally limited
 * to owner/admin accounts.
 */
if (
    !in_array(
        $role,
        ["owner", "admin"],
        true
    )
) {
    paymongo_test_respond([
        "success" => false,
        "message" =>
            "Only an owner or admin can run the PayMongo integration test."
    ], 403);
}

/*
|--------------------------------------------------------------------------
| Load the TEST secret key.
|--------------------------------------------------------------------------
*/

try {
    require_once __DIR__ . "/paymongo_config.php";
} catch (Throwable $e) {
    paymongo_test_respond([
        "success" => false,
        "message" => $e->getMessage()
    ], 500);
}

if (!function_exists("curl_init")) {
    paymongo_test_respond([
        "success" => false,
        "message" =>
            "PHP cURL is not enabled in this server."
    ], 500);
}

/*
|--------------------------------------------------------------------------
| Create a harmless PayMongo TEST checkout session.
|--------------------------------------------------------------------------
|
| Amount = PHP 1.00 (100 centavos)
| Payment method = QR Ph only
|
| This does NOT create a FoodConnect order and does NOT touch stock/cart.
| It exists only to confirm that:
| - the test secret key is valid
| - the server can reach PayMongo
| - PayMongo can create a hosted test checkout session
|
*/

$reference =
    "FOODCONNECT-DEVTEST-" .
    date("YmdHis") .
    "-" .
    $userId;

$payload = [
    "data" => [
        "attributes" => [
            "line_items" => [
                [
                    "name" =>
                        "FoodConnect PayMongo Integration Test",
                    "amount" => 100,
                    "currency" => "PHP",
                    "quantity" => 1
                ]
            ],
            "payment_method_types" => [
                "qrph"
            ],
            "success_url" =>
                "http://localhost/FoodConnect/frontend/html/cart.html?paymongo_test=success",
            "cancel_url" =>
                "http://localhost/FoodConnect/frontend/html/cart.html?paymongo_test=cancelled",
            "reference_number" =>
                $reference
        ]
    ]
];

$payloadJson =
    json_encode(
        $payload,
        JSON_UNESCAPED_SLASHES
    );

if ($payloadJson === false) {
    paymongo_test_respond([
        "success" => false,
        "message" =>
            "Unable to build the PayMongo test request."
    ], 500);
}

$curl =
    curl_init(
        "https://api.paymongo.com/v2/checkout_sessions"
    );

curl_setopt_array(
    $curl,
    [
        CURLOPT_POST => true,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 30,
        CURLOPT_CONNECTTIMEOUT => 10,
        CURLOPT_HTTPHEADER => [
            "Authorization: Basic " .
                base64_encode(
                    PAYMONGO_SECRET_KEY . ":"
                ),
            "Content-Type: application/json",
            "Accept: application/json"
        ],
        CURLOPT_POSTFIELDS =>
            $payloadJson
    ]
);

$responseBody =
    curl_exec($curl);

$curlError =
    curl_error($curl);

$httpCode =
    (int)curl_getinfo(
        $curl,
        CURLINFO_HTTP_CODE
    );

curl_close($curl);

if ($responseBody === false) {
    paymongo_test_respond([
        "success" => false,
        "message" =>
            "FoodConnect could not connect to PayMongo.",
        "details" =>
            $curlError !== ""
                ? $curlError
                : null
    ], 502);
}

$response =
    json_decode(
        $responseBody,
        true
    );

if (!is_array($response)) {
    paymongo_test_respond([
        "success" => false,
        "message" =>
            "PayMongo returned an invalid response."
    ], 502);
}

if (
    $httpCode < 200 ||
    $httpCode >= 300
) {
    $paymongoMessage =
        $response["errors"][0]["detail"] ??
        $response["errors"][0]["code"] ??
        "PayMongo rejected the test request.";

    paymongo_test_respond([
        "success" => false,
        "message" => $paymongoMessage,
        "paymongo_http_status" =>
            $httpCode
    ], 502);
}

$sessionId =
    $response["data"]["id"] ?? null;

$checkoutUrl =
    $response["data"]["attributes"]["checkout_url"]
    ?? null;

if (
    !is_string($sessionId) ||
    $sessionId === "" ||
    !is_string($checkoutUrl) ||
    $checkoutUrl === ""
) {
    paymongo_test_respond([
        "success" => false,
        "message" =>
            "PayMongo created an unexpected checkout response."
    ], 502);
}

paymongo_test_respond([
    "success" => true,
    "message" =>
        "PayMongo Test Mode connection is working.",
    "checkout_session_id" =>
        $sessionId,
    "reference_number" =>
        $reference,
    "checkout_url" =>
        $checkoutUrl,
    "livemode" =>
        (bool)(
            $response["data"]["attributes"]["livemode"]
            ?? false
        )
]);
