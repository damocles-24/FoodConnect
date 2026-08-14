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
        "message" => "Method not allowed."
    ], 405);
}

/* =========================================================
   RIDER SESSION
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
            "Invalid tracking authorization request."
    ], 400);
}

$assignmentId =
    isset($input["assignment_id"])
        ? (int)$input["assignment_id"]
        : 0;

if ($assignmentId <= 0) {
    respond_json([
        "success" => false,
        "message" =>
            "A valid delivery assignment is required."
    ], 400);
}

/* =========================================================
   VERIFY RIDER ACCOUNT
========================================================= */

$riderStmt = $conn->prepare("
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

if (!$riderStmt) {
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

/* =========================================================
   VERIFY ASSIGNMENT + ORDER

   Important:
   - exact rider
   - exact restaurant
   - delivery order only
========================================================= */

$trackingStmt = $conn->prepare("
    SELECT
        da.assignment_id,
        da.order_id,
        da.restaurant_id,
        da.rider_id,
        da.delivery_status,

        o.order_type,
        o.order_status,
        o.user_id AS customer_id,
        o.customer_name,
        o.address,
        o.landmark,
        o.customer_latitude,
        o.customer_longitude

    FROM tbl_delivery_assignments AS da

    INNER JOIN tbl_orders AS o
        ON o.order_id = da.order_id
       AND o.restaurant_id =
           da.restaurant_id

    WHERE da.assignment_id = ?
      AND da.rider_id = ?
      AND da.restaurant_id = ?
      AND o.order_type = 'delivery'

    LIMIT 1
");

if (!$trackingStmt) {
    respond_json([
        "success" => false,
        "message" =>
            "Unable to verify the delivery assignment."
    ], 500);
}

$trackingStmt->bind_param(
    "iii",
    $assignmentId,
    $riderId,
    $restaurantId
);

$trackingStmt->execute();

$trackingResult =
    $trackingStmt->get_result();

$delivery =
    $trackingResult->fetch_assoc();

$trackingStmt->close();

if (!$delivery) {
    respond_json([
        "success" => false,
        "message" =>
            "Delivery assignment not found or does not belong to this rider."
    ], 403);
}

/* =========================================================
   NORMALIZE STATUS
========================================================= */

$deliveryStatus =
    strtolower(
        trim(
            (string)$delivery[
                "delivery_status"
            ]
        )
    );

$orderStatus =
    strtolower(
        trim(
            (string)$delivery[
                "order_status"
            ]
        )
    );

/* =========================================================
   BLOCK FINISHED DELIVERIES
========================================================= */

if (
    $deliveryStatus === "completed" ||
    $deliveryStatus === "cancelled" ||
    $orderStatus === "completed" ||
    $orderStatus === "cancelled"
) {
    respond_json([
        "success" => true,

        "authorized" => true,

        "tracking_allowed" => false,

        "message" =>
            "Live tracking is no longer available for this delivery.",

        "assignment_id" =>
            $assignmentId,

        "order_id" =>
            (int)$delivery["order_id"],

        "delivery_status" =>
            $deliveryStatus
    ]);
}

/* =========================================================
   VERIFY CUSTOMER DESTINATION
========================================================= */

$latitude =
    $delivery[
        "customer_latitude"
    ];

$longitude =
    $delivery[
        "customer_longitude"
    ];

$hasCoordinates =
    is_numeric($latitude) &&
    is_numeric($longitude);

if ($hasCoordinates) {
    $latitude =
        (float)$latitude;

    $longitude =
        (float)$longitude;

    $hasCoordinates =
        $latitude >= -90 &&
        $latitude <= 90 &&
        $longitude >= -180 &&
        $longitude <= 180;
}

if (!$hasCoordinates) {
    respond_json([
        "success" => false,

        "authorized" => true,

        "tracking_allowed" => false,

        "message" =>
            "This delivery does not have a valid customer map location."
    ], 409);
}

/* =========================================================
   TRACKING BUSINESS RULE

   Live GPS starts ONLY when rider is
   officially Out for Delivery.
========================================================= */

$trackingAllowed =
    $deliveryStatus ===
    "out_for_delivery";

$message =
    $trackingAllowed
        ? "Live delivery tracking is authorized."
        : "Live tracking will become available when the order is marked Out for Delivery.";

/* =========================================================
   SUCCESS RESPONSE
========================================================= */

respond_json([
    "success" => true,

    /*
     * The rider owns the assignment.
     */
    "authorized" => true,

    /*
     * True only when live GPS may actually run.
     */
    "tracking_allowed" =>
        $trackingAllowed,

    "message" =>
        $message,

    "tracking" => [
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

        "rider_id" =>
            (int)$delivery[
                "rider_id"
            ],

        "customer_id" =>
            (int)$delivery[
                "customer_id"
            ],

        "delivery_status" =>
            $deliveryStatus,

        "order_status" =>
            $orderStatus,

        "destination" => [
            "latitude" =>
                (float)$latitude,

            "longitude" =>
                (float)$longitude,

            "address" =>
                (string)(
                    $delivery[
                        "address"
                    ] ?? ""
                ),

            "landmark" =>
                (string)(
                    $delivery[
                        "landmark"
                    ] ?? ""
                )
        ]
    ]
]);