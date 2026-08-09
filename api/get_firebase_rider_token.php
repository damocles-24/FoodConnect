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

require_once dirname(__DIR__) .
    "/vendor/autoload.php";

use Firebase\JWT\JWT;

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
   FOODCONNECT SESSION
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
   VERIFY RIDER AGAINST MYSQL
========================================================= */

$stmt = $conn->prepare("
    SELECT
        user_id,
        restaurant_id,
        full_name,
        role,
        status
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
            "Unable to verify the rider account."
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
            "This account is not authorized as a delivery rider."
    ], 403);
}

/* =========================================================
   LOAD SERVICE ACCOUNT

   IMPORTANT:
   This file is OUTSIDE htdocs.
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

$projectId = trim(
    (string)(
        $serviceAccount["project_id"] ?? ""
    )
);

$clientEmail = trim(
    (string)(
        $serviceAccount["client_email"] ?? ""
    )
);

$privateKey = (string)(
    $serviceAccount["private_key"] ?? ""
);

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
   FIREBASE UID

   Important:
   Firebase UIDs are strings.

   MySQL user_id 24 becomes:
   rider_24
========================================================= */

$firebaseUid =
    "rider_" .
    $riderId;

/* =========================================================
   CUSTOM TOKEN

   Firebase requires:
   RS256
   service account issuer
   service account subject
   Identity Toolkit audience
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

    /*
     * Custom Firebase claims.
     *
     * Security Rules will use these later.
     */
    "claims" => [
        "foodconnect_user_id" =>
            $riderId,

        "restaurant_id" =>
            $restaurantId,

        "role" =>
            "delivery_staff"
    ]
];

$customToken = "";

try {

    $customToken =
        JWT::encode(
            $payload,
            $privateKey,
            "RS256"
        );

} catch (Throwable $error) {

    error_log(
        "Firebase custom token error: " .
        $error->getMessage()
    );

    respond_json([
        "success" => false,
        "message" =>
            "Unable to create Firebase authentication token."
    ], 500);
}

/* =========================================================
   RESPONSE
========================================================= */

respond_json([
    "success" =>
        true,

    "message" =>
        "Firebase rider authentication token created successfully.",

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

        "full_name" =>
            (string)(
                $rider["full_name"] ?? ""
            )
    ]
]);