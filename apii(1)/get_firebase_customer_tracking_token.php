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
   FOODCONNECT CUSTOMER SESSION
========================================================= */

$customerId =
    isset($_SESSION["user_id"])
        ? (int)$_SESSION["user_id"]
        : 0;

$sessionRole =
    strtolower(
        trim(
            isset($_SESSION["role"])
                ? (string)$_SESSION["role"]
                : ""
        )
    );

if ($customerId <= 0) {
    respond_json([
        "success" => false,
        "message" =>
            "Your session has expired or you do not have access. Please log in again. Please log in again."
    ], 401);
}

if (
    $sessionRole !== "" &&
    $sessionRole !== "customer"
) {
    respond_json([
        "success" => false,
        "message" =>
            "Only customers can access delivery tracking."
    ], 403);
}


/* =========================================================
   REQUEST
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
            "Invalid tracking request."
    ], 400);
}

$orderId =
    isset($input["order_id"])
        ? (int)$input["order_id"]
        : 0;

if ($orderId <= 0) {
    respond_json([
        "success" => false,
        "message" =>
            "A valid order ID is required."
    ], 400);
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
            "Unable to verify the customer account."
    ], 500);
}

$userStmt->bind_param(
    "i",
    $customerId
);

$userStmt->execute();

$userResult =
    $userStmt->get_result();

$customer =
    $userResult->fetch_assoc();

$userStmt->close();

if (!$customer) {
    respond_json([
        "success" => false,
        "message" =>
            "This customer account is not authorized."
    ], 403);
}


/* =========================================================
   VERIFY ORDER + ACTIVE DELIVERY ASSIGNMENT

   Important:
   The customer must own the order.
========================================================= */

$orderStmt =
    $conn->prepare("
        SELECT
            o.order_id,
            o.user_id,
            o.restaurant_id,
            o.order_type,
            o.order_status,

            da.assignment_id,
            da.delivery_staff_id,
            da.delivery_status

        FROM tbl_orders o

        INNER JOIN tbl_delivery_assignments da
            ON da.order_id =
               o.order_id
           AND da.restaurant_id =
               o.restaurant_id

        WHERE o.order_id = ?
          AND o.user_id = ?
          AND o.order_type = 'delivery'
          AND da.delivery_status =
              'out_for_delivery'
          AND da.delivery_staff_id IS NOT NULL

        ORDER BY
            da.assignment_id DESC

        LIMIT 1
    ");

if (!$orderStmt) {
    respond_json([
        "success" => false,
        "message" =>
            "Unable to verify this delivery order."
    ], 500);
}

$orderStmt->bind_param(
    "ii",
    $orderId,
    $customerId
);

$orderStmt->execute();

$orderResult =
    $orderStmt->get_result();

$delivery =
    $orderResult->fetch_assoc();

$orderStmt->close();

if (!$delivery) {
    respond_json([
        "success" => false,
        "message" =>
            "Live rider tracking is not available for this order."
    ], 403);
}


/* =========================================================
   VERIFIED DELIVERY DATA
========================================================= */

$restaurantId =
    (int)$delivery["restaurant_id"];

$assignmentId =
    (int)$delivery["assignment_id"];

$riderId =
    (int)$delivery["delivery_staff_id"];

if (
    $restaurantId <= 0 ||
    $assignmentId <= 0 ||
    $riderId <= 0
) {
    respond_json([
        "success" => false,
        "message" =>
            "The delivery assignment is invalid."
    ], 500);
}


/* =========================================================
   LOAD FIREBASE SERVICE ACCOUNT

   Keep this OUTSIDE htdocs.
========================================================= */

$serviceAccountPath =
    "C:/xampp/private/" .
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
   CUSTOMER FIREBASE UID
========================================================= */

$firebaseUid =
    "customer_" .
    $customerId;


/* =========================================================
   CUSTOM FIREBASE TOKEN

   This token authorizes ONE delivery relationship.
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
            "customer",

        "foodconnect_user_id" =>
            $customerId,

        "restaurant_id" =>
            $restaurantId,

        "order_id" =>
            $orderId,

        "assignment_id" =>
            $assignmentId,

        "delivery_staff_id" =>
            $riderId,

        /*
         * Exact Firebase rider UID.
         */
        "rider_uid" =>
            "rider_" .
            $riderId
    ]
];


/* =========================================================
   CREATE TOKEN
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
        "Firebase customer tracking token error: " .
        $error->getMessage()
    );

    respond_json([
        "success" => false,
        "message" =>
            "Unable to create the customer tracking token."
    ], 500);
}


/* =========================================================
   RESPONSE

   No private Firebase credentials are returned.
========================================================= */

respond_json([
    "success" => true,

    "message" =>
        "Customer delivery tracking token created successfully.",

    "firebase" => [
        "uid" =>
            $firebaseUid,

        "token" =>
            $customToken,

        "expires_in" =>
            3600
    ],

    "tracking" => [
        "order_id" =>
            $orderId,

        "assignment_id" =>
            $assignmentId,

        "restaurant_id" =>
            $restaurantId,

        "delivery_staff_id" =>
            $riderId,

        "rider_uid" =>
            "rider_" .
            $riderId
    ]
]);