<?php

header(
    "Content-Type: application/json; charset=utf-8"
);

header("Cache-Control: no-store");

error_reporting(
    E_ALL &
    ~E_NOTICE &
    ~E_WARNING
);

ini_set(
    "display_errors",
    "0"
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
   CASHIER AUTHENTICATION
========================================================= */

if (empty($_SESSION["user_id"])) {
    respond_json([
        "success" => false,
        "message" =>
            "You are not logged in."
    ], 401);
}

$userId = (int)$_SESSION["user_id"];

$role = strtolower(
    trim(
        (string)(
            $_SESSION["role"] ?? ""
        )
    )
);

if ($role !== "cashier") {
    respond_json([
        "success" => false,
        "message" =>
            "Only cashier accounts can scan order QR codes."
    ], 403);
}

/* =========================================================
   RESTAURANT VALIDATION
========================================================= */

$restaurantId = (int)(
    $_SESSION["restaurant_id"] ?? 0
);

if ($restaurantId <= 0) {
    respond_json([
        "success" => false,
        "message" =>
            "Your cashier account is not assigned to a restaurant."
    ], 400);
}

/* =========================================================
   REQUEST BODY
========================================================= */

$input = json_decode(
    file_get_contents("php://input"),
    true
);

if (!is_array($input)) {
    respond_json([
        "success" => false,
        "message" =>
            "Invalid QR scan request."
    ], 400);
}

$qrValue = trim(
    (string)(
        $input["qr_value"] ?? ""
    )
);

if ($qrValue === "") {
    respond_json([
        "success" => false,
        "message" =>
            "No QR value was received."
    ], 400);
}

/* =========================================================
   QR FORMAT VALIDATION
========================================================= */

$prefix = "FOODCONNECT_ORDER:";

if (
    strncmp(
        $qrValue,
        $prefix,
        strlen($prefix)
    ) !== 0
) {
    respond_json([
        "success" => false,
        "message" =>
            "This is not a valid FoodConnect order QR."
    ], 400);
}

$token = substr(
    $qrValue,
    strlen($prefix)
);

$token = strtolower(
    trim($token)
);

/*
 * checkout.php creates the token using:
 *
 * bin2hex(random_bytes(32))
 *
 * Therefore, the valid token must contain:
 * - exactly 64 characters
 * - hexadecimal characters only
 */
if (
    !preg_match(
        "/^[a-f0-9]{64}$/",
        $token
    )
) {
    respond_json([
        "success" => false,
        "message" =>
            "The FoodConnect order QR is invalid."
    ], 400);
}

/* =========================================================
   FIND ORDER USING THE PRIVATE TOKEN
========================================================= */

$stmt = $conn->prepare("
    SELECT
        order_id,
        queue_number,
        restaurant_id,
        order_type,
        order_status
    FROM tbl_orders
    WHERE order_qr_token = ?
    LIMIT 1
");

if (!$stmt) {
    error_log(
        "FoodConnect QR order prepare error: " .
        $conn->error
    );

    respond_json([
        "success" => false,
        "message" =>
            "Unable to verify the order QR."
    ], 500);
}

$stmt->bind_param(
    "s",
    $token
);

if (!$stmt->execute()) {
    error_log(
        "FoodConnect QR order execute error: " .
        $stmt->error
    );

    $stmt->close();

    respond_json([
        "success" => false,
        "message" =>
            "Unable to verify the order QR."
    ], 500);
}

$order = $stmt
    ->get_result()
    ->fetch_assoc();

$stmt->close();

if (!$order) {
    respond_json([
        "success" => false,
        "message" =>
            "No order matches this QR code."
    ], 404);
}

/* =========================================================
   STRICT RESTAURANT ISOLATION
========================================================= */

$orderRestaurantId = (int)(
    $order["restaurant_id"] ?? 0
);

if (
    $orderRestaurantId !==
    $restaurantId
) {
    /*
     * Do not reveal any information about
     * orders belonging to other restaurants.
     */
    respond_json([
        "success" => false,
        "message" =>
            "No order matches this QR code."
    ], 404);
}

/* =========================================================
   ORDER TYPE VALIDATION
========================================================= */

$orderType = strtolower(
    trim(
        (string)(
            $order["order_type"] ?? ""
        )
    )
);

if ($orderType === "take-out") {
    $orderType = "takeout";
}

$allowedOrderTypes = [
    "dine-in",
    "dinein",
    "takeout"
];

if (
    !in_array(
        $orderType,
        $allowedOrderTypes,
        true
    )
) {
    respond_json([
        "success" => false,
        "message" =>
            "Only Dine-in and Takeout orders can be scanned."
    ], 400);
}

/* =========================================================
   SUCCESS
========================================================= */

respond_json([
    "success" => true,

    "message" =>
        "Order QR verified successfully.",

    "order" => [
        "order_id" =>
            (int)$order["order_id"],

        "queue_number" =>
            $order["queue_number"] !== null
                ? (int)$order["queue_number"]
                : null,

        "order_type" =>
            $orderType,

        "order_status" =>
            trim(
                (string)(
                    $order["order_status"] ?? ""
                )
            )
    ]
]);