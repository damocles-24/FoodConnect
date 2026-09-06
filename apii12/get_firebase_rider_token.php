<?php

header(
    "Content-Type: application/json; charset=utf-8"
);

header(
    "Cache-Control: no-store, no-cache, must-revalidate, max-age=0"
);

require_once __DIR__ . "/session_config.php";
require_once __DIR__ . "/db.php";

require_once dirname(__DIR__) .
    "/vendor/autoload.php";

use Firebase\JWT\JWT;


/* =========================================================
   JSON RESPONSE
========================================================= */

function respond_json(
    array $data,
    $statusCode = 200
) {
    http_response_code(
        (int)$statusCode
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
        isset($_SERVER["REQUEST_METHOD"])
            ? (string)$_SERVER["REQUEST_METHOD"]
            : ""
    ) !== "POST"
) {
    respond_json([
        "success" => false,
        "message" =>
            "This action is not available."
    ], 405);
}


/* =========================================================
   FOODCONNECT RIDER SESSION
========================================================= */

$riderId =
    isset($_SESSION["user_id"])
        ? (int)$_SESSION["user_id"]
        : 0;

$restaurantId =
    isset($_SESSION["restaurant_id"])
        ? (int)$_SESSION["restaurant_id"]
        : 0;

$sessionRole =
    strtolower(
        trim(
            isset($_SESSION["role"])
                ? (string)$_SESSION["role"]
                : ""
        )
    );

if (
    $riderId <= 0 ||
    $restaurantId <= 0
) {
    respond_json([
        "success" => false,
        "message" =>
            "Your session has expired or you do not have access. Please log in again."
    ], 401);
}

/*
 * The database verification below is authoritative.
 * This early role check also blocks another logged-in
 * FoodConnect role from requesting a rider token.
 */
if (
    $sessionRole !== "" &&
    $sessionRole !== "delivery_staff"
) {
    respond_json([
        "success" => false,
        "message" =>
            "Only delivery staff can access rider GPS tracking."
    ], 403);
}


/* =========================================================
   VERIFY ACTIVE DELIVERY RIDER ACCOUNT
========================================================= */

$riderStmt =
    $conn->prepare("
        SELECT
            user_id,
            restaurant_id,
            role,
            status
        FROM tbl_users
        WHERE user_id = ?
          AND restaurant_id = ?
          AND role = 'delivery_staff'
          AND status = 1
        LIMIT 1
    ");

if (!$riderStmt) {
    error_log(
        "Firebase rider token: unable to prepare rider verification query: " .
        $conn->error
    );

    respond_json([
        "success" => false,
        "message" =>
            "Unable to verify the delivery rider."
    ], 500);
}

$riderStmt->bind_param(
    "ii",
    $riderId,
    $restaurantId
);

$riderStmt->execute();

$riderResult =
    $riderStmt->get_result();

$rider =
    $riderResult->fetch_assoc();

$riderStmt->close();

if (!$rider) {
    respond_json([
        "success" => false,
        "message" =>
            "This account is not authorized as an active delivery rider."
    ], 403);
}

/*
 * Use the database-verified values for the Firebase
 * token instead of trusting client input.
 */
$riderId =
    (int)$rider["user_id"];

$restaurantId =
    (int)$rider["restaurant_id"];

if (
    $riderId <= 0 ||
    $restaurantId <= 0
) {
    respond_json([
        "success" => false,
        "message" =>
            "The delivery rider account is invalid."
    ], 500);
}


/* =========================================================
   LOAD FIREBASE SERVICE ACCOUNT

   Production file stays outside public_html.
========================================================= */

$serviceAccountPath =
    dirname(__DIR__, 2) .
    "/private/" .
    "foodconnect-94d23-firebase-adminsdk-fbsvc-1ae7580248.json";

if (!is_file($serviceAccountPath)) {
    respond_json([
        "success" => false,
        "message" =>
            "Firebase service account configuration is missing."
    ], 500);
}

$serviceAccountJson =
    file_get_contents(
        $serviceAccountPath
    );

if ($serviceAccountJson === false) {
    respond_json([
        "success" => false,
        "message" =>
            "Unable to read Firebase service account configuration."
    ], 500);
}

$serviceAccount =
    json_decode(
        $serviceAccountJson,
        true
    );

if (!is_array($serviceAccount)) {
    respond_json([
        "success" => false,
        "message" =>
            "Firebase service account configuration is invalid."
    ], 500);
}


/* =========================================================
   FIREBASE SERVICE ACCOUNT VALUES
========================================================= */

$projectId =
    trim(
        isset(
            $serviceAccount[
                "project_id"
            ]
        )
            ? (string)$serviceAccount[
                "project_id"
            ]
            : ""
    );

$clientEmail =
    trim(
        isset(
            $serviceAccount[
                "client_email"
            ]
        )
            ? (string)$serviceAccount[
                "client_email"
            ]
            : ""
    );

$privateKey =
    isset(
        $serviceAccount[
            "private_key"
        ]
    )
        ? (string)$serviceAccount[
            "private_key"
        ]
        : "";

if (
    $projectId === "" ||
    $clientEmail === "" ||
    $privateKey === ""
) {
    respond_json([
        "success" => false,
        "message" =>
            "Firebase service account credentials are incomplete."
    ], 500);
}


/* =========================================================
   RIDER FIREBASE UID

   Must match:
   rider_locations/{restaurant_id}/rider_{user_id}
========================================================= */

$firebaseUid =
    "rider_" .
    $riderId;


/* =========================================================
   CUSTOM FIREBASE TOKEN

   These claims match the currently deployed
   Realtime Database rider write/read rules.
========================================================= */

$now =
    time();

$expiresAt =
    $now + 3600;

$payload = [
    "iss" =>
        $clientEmail,

    "sub" =>
        $clientEmail,

    "aud" =>
        "https://identitytoolkit.googleapis.com/google.identity.identitytoolkit.v1.IdentityToolkit",

    "iat" =>
        $now,

    "exp" =>
        $expiresAt,

    "uid" =>
        $firebaseUid,

    "claims" => [
        "role" =>
            "delivery_staff",

        "foodconnect_user_id" =>
            $riderId,

        "restaurant_id" =>
            $restaurantId,

        "delivery_staff_id" =>
            $riderId,

        "rider_uid" =>
            $firebaseUid
    ]
];


/* =========================================================
   CREATE FIREBASE CUSTOM TOKEN
========================================================= */

try {

    $customToken =
        JWT::encode(
            $payload,
            $privateKey,
            "RS256"
        );

} catch (Throwable $error) {

    error_log(
        "Firebase rider token error: " .
        $error->getMessage()
    );

    respond_json([
        "success" => false,
        "message" =>
            "Unable to create the rider tracking token."
    ], 500);
}


/* =========================================================
   RESPONSE

   firebase-config.js expects:
   - firebase.token
   - rider.user_id
   - rider.restaurant_id
========================================================= */

respond_json([
    "success" => true,

    "message" =>
        "Delivery rider Firebase token created successfully.",

    "firebase" => [
        "uid" =>
            $firebaseUid,

        "token" =>
            $customToken,

        "expires_in" =>
            3600
    ],

    "rider" => [
        "user_id" =>
            $riderId,

        "restaurant_id" =>
            $restaurantId,

        "rider_uid" =>
            $firebaseUid
    ]
]);
