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
require_once __DIR__ . "/rate_limit.php";

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

rate_limit_enforce(
    $conn,
    "cashier-qr-scan",
    rate_limit_identifier(
        (string)$userId,
        (string)$restaurantId,
        rate_limit_client_ip()
    ),
    30,
    60,
    60,
    "Too many QR verification attempts. Please wait one minute and try again."
);

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
    order_status,
    payment_method,
    payment_status,
    qr_verified_at,
    qr_expires_at
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
   ORDER STATUS VALIDATION
========================================================= */

$orderStatus = strtolower(
    trim(
        (string)(
            $order["order_status"] ?? ""
        )
    )
);

if ($orderStatus === "completed") {
    respond_json([
        "success" => false,
        "message" =>
            "This order has already been completed."
    ], 409);
}

if ($orderStatus === "cancelled") {
    respond_json([
        "success" => false,
        "message" =>
            "This order has been cancelled and can no longer be processed."
    ], 409);
}

/* =========================================================
   QR EXPIRATION VALIDATION
========================================================= */

$alreadyVerified =
    !empty($order["qr_verified_at"]);

$qrExpiresAt = trim(
    (string)(
        $order["qr_expires_at"] ?? ""
    )
);

/*
 * An already verified QR remains recognized as verified.
 * Expiration only blocks a QR that has not yet been scanned.
 */
if (
    !$alreadyVerified &&
    $qrExpiresAt !== ""
) {
    $qrExpirationTimestamp =
        strtotime($qrExpiresAt);

    if (
        $qrExpirationTimestamp !== false &&
        $qrExpirationTimestamp <= time()
    ) {
        respond_json([
            "success" => false,

            "message" =>
                "This order QR has expired. The customer must place a new order.",

            "error_code" =>
                "QR_EXPIRED",

            "qr_expired" =>
                true,

            "expired_at" =>
                $qrExpiresAt
        ], 410);
    }
}

/* =========================================================
   SAVE QR VERIFICATION
========================================================= */

if (!$alreadyVerified) {
    $verifyStmt = $conn->prepare("
        UPDATE tbl_orders

SET qr_verified_at = NOW()

WHERE order_id = ?
  AND restaurant_id = ?
  AND qr_verified_at IS NULL
  AND (
        qr_expires_at IS NULL
        OR qr_expires_at > NOW()
  )
    ");

    if (!$verifyStmt) {
        error_log(
            "FoodConnect QR verification update prepare error: " .
            $conn->error
        );

        respond_json([
            "success" => false,
            "message" =>
                "Unable to save the QR verification."
        ], 500);
    }

    $orderId =
        (int)$order["order_id"];

    $verifyStmt->bind_param(
        "ii",
        $orderId,
        $restaurantId
    );

    if (!$verifyStmt->execute()) {
        error_log(
            "FoodConnect QR verification update execute error: " .
            $verifyStmt->error
        );

        $verifyStmt->close();

        respond_json([
            "success" => false,
            "message" =>
                "Unable to save the QR verification."
        ], 500);
    }

    if ($verifyStmt->affected_rows !== 1) {
    $verifyStmt->close();

    respond_json([
        "success" => false,

        "message" =>
            "This order QR has expired or was already processed.",

        "error_code" =>
            "QR_NOT_VERIFIABLE"
    ], 409);
}

    $verifyStmt->close();
}

/* =========================================================
   CASH PAYMENT CONFIRMATION
   Dine-In / Takeout only.

   Successful cashier QR verification is FoodConnect's
   confirmation that counter cash payment was received.
   Delivery cash remains Cash on Delivery and is untouched.
========================================================= */

$normalizedPaymentMethod =
    strtolower(
        trim(
            (string)(
                $order["payment_method"] ?? ""
            )
        )
    );

$normalizedPaymentStatus =
    strtolower(
        trim(
            (string)(
                $order["payment_status"] ?? ""
            )
        )
    );

$isCounterCashOrder =
    in_array(
        $orderType,
        [
            "dine-in",
            "takeout"
        ],
        true
    ) &&
    $normalizedPaymentMethod === "cash";

if (
    $isCounterCashOrder &&
    $normalizedPaymentStatus !== "paid"
) {
    $cashPaidStmt =
        $conn->prepare("
            UPDATE tbl_orders
            SET payment_status = 'paid'
            WHERE order_id = ?
              AND restaurant_id = ?
              AND LOWER(TRIM(payment_method)) = 'cash'
              AND LOWER(TRIM(COALESCE(payment_status, 'pending'))) <> 'paid'
        ");

    if (!$cashPaidStmt) {
        error_log(
            "FoodConnect cash payment confirmation prepare error: " .
            $conn->error
        );

        respond_json([
            "success" => false,
            "message" =>
                "The QR was verified, but the cash payment could not be confirmed."
        ], 500);
    }

    $orderId =
        (int)$order["order_id"];

    $cashPaidStmt->bind_param(
        "ii",
        $orderId,
        $restaurantId
    );

    if (!$cashPaidStmt->execute()) {
        error_log(
            "FoodConnect cash payment confirmation execute error: " .
            $cashPaidStmt->error
        );

        $cashPaidStmt->close();

        respond_json([
            "success" => false,
            "message" =>
                "The QR was verified, but the cash payment could not be confirmed."
        ], 500);
    }

    $cashPaidStmt->close();

    $order["payment_status"] =
        "paid";
}

/* =========================================================
   PAYMENT GATING STATE
========================================================= */

$paymentMethod =
    strtolower(
        trim(
            (string)(
                $order["payment_method"] ?? ""
            )
        )
    );

$paymentStatus =
    strtolower(
        trim(
            (string)(
                $order["payment_status"] ?? ""
            )
        )
    );

$waitingForPayment =
    $paymentMethod === "paymongo qr ph" &&
    $paymentStatus !== "paid";

/* =========================================================
   SUCCESS
========================================================= */

respond_json([
    "success" => true,

    "message" =>
        $waitingForPayment
            ? "Order QR verified. Waiting for customer payment."
            : (
                $isCounterCashOrder
                    ? "Order QR verified. Cash payment confirmed."
                    : (
                        $alreadyVerified
                            ? "This order QR was already verified."
                            : "Order QR verified successfully."
                    )
            ),

    "waiting_for_payment" =>
        $waitingForPayment,

    "payment_status" =>
        $paymentStatus !== ""
            ? $paymentStatus
            : "pending",

    "already_verified" =>
        $alreadyVerified,

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
            $orderStatus,

        "payment_status" =>
            $paymentStatus !== ""
                ? $paymentStatus
                : "pending",

        "waiting_for_payment" =>
            $waitingForPayment,

            "qr_expires_at" =>
    $order["qr_expires_at"] ?? null,

        "qr_verified" =>
            true
    ]
]);