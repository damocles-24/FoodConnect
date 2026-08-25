<?php

date_default_timezone_set("Asia/Manila");

header("Content-Type: application/json; charset=utf-8");
header("Cache-Control: no-store");

error_reporting(E_ALL & ~E_NOTICE & ~E_WARNING);
ini_set("display_errors", "0");

require_once __DIR__ . "/session_config.php";
require_once __DIR__ . "/db.php";
require_once __DIR__ . "/paymongo_order_notification_helper.php";

function sync_json(array $data, int $statusCode = 200): void
{
    http_response_code($statusCode);

    echo json_encode(
        $data,
        JSON_UNESCAPED_UNICODE |
        JSON_UNESCAPED_SLASHES
    );

    exit;
}

if (
    strtoupper(
        (string)($_SERVER["REQUEST_METHOD"] ?? "")
    ) !== "POST"
) {
    sync_json([
        "success" => false,
        "message" => "Method not allowed."
    ], 405);
}

$customerId =
    (int)($_SESSION["user_id"] ?? 0);

$role =
    strtolower(
        trim(
            (string)($_SESSION["role"] ?? "")
        )
    );

if (
    $customerId <= 0 ||
    ($role !== "" && $role !== "customer")
) {
    sync_json([
        "success" => false,
        "message" => "Please log in as a customer."
    ], 401);
}

$input =
    json_decode(
        file_get_contents("php://input"),
        true
    );

$orderId =
    (int)($input["order_id"] ?? 0);

if ($orderId <= 0) {
    sync_json([
        "success" => false,
        "message" => "The order could not be found."
    ], 400);
}

$stmt = $conn->prepare("
    SELECT
        o.order_id,
        o.restaurant_id,
        o.user_id,
        o.customer_name,
        o.queue_number,
        o.payment_method,
        o.payment_status AS order_payment_status,
        o.total_amount,

        p.payment_id,
        p.payment_status AS payment_record_status,
        p.amount,
        p.reference_number,
        p.checkout_session_id

    FROM tbl_orders AS o

    INNER JOIN tbl_payments AS p
        ON p.order_id = o.order_id
       AND p.restaurant_id = o.restaurant_id

    WHERE o.order_id = ?
      AND o.user_id = ?
      AND o.payment_method = 'PayMongo QR Ph'

    ORDER BY p.payment_id DESC

    LIMIT 1
");

if (!$stmt) {
    sync_json([
        "success" => false,
        "message" => "Unable to verify the payment right now."
    ], 500);
}

$stmt->bind_param(
    "ii",
    $orderId,
    $customerId
);

if (!$stmt->execute()) {
    $stmt->close();

    sync_json([
        "success" => false,
        "message" => "Unable to verify the payment right now."
    ], 500);
}

$row =
    $stmt
        ->get_result()
        ->fetch_assoc();

$stmt->close();

if (!$row) {
    sync_json([
        "success" => false,
        "message" => "No PayMongo payment was found for this order."
    ], 404);
}

$restaurantId =
    (int)$row["restaurant_id"];

$queueNumber =
    (int)$row["queue_number"];

$customerName =
    trim(
        (string)(
            $row["customer_name"] ??
            "Customer"
        )
    );

$currentOrderPaymentStatus =
    strtolower(
        trim(
            (string)(
                $row["order_payment_status"] ??
                ""
            )
        )
    );

if ($currentOrderPaymentStatus === "paid") {
    try {
        ensure_paid_order_cashier_notification(
            $conn,
            $restaurantId,
            $customerId,
            $customerName,
            $orderId,
            $queueNumber
        );
    } catch (Throwable $ignored) {
        error_log(
            "PayMongo notification sync warning: " .
            $ignored->getMessage()
        );
    }

    sync_json([
        "success" => true,
        "paid" => true,
        "payment_status" => "paid",
        "message" => "Payment confirmed."
    ]);
}

$checkoutSessionId =
    trim(
        (string)(
            $row["checkout_session_id"] ??
            ""
        )
    );

if ($checkoutSessionId === "") {
    sync_json([
        "success" => false,
        "message" => "The payment session is unavailable."
    ], 409);
}

try {
    require_once __DIR__ . "/paymongo_config.php";
} catch (Throwable $e) {
    sync_json([
        "success" => false,
        "message" => "Payment verification is unavailable right now."
    ], 500);
}

if (!function_exists("curl_init")) {
    sync_json([
        "success" => false,
        "message" => "Payment verification is unavailable right now."
    ], 500);
}

$curl =
    curl_init(
        "https://api.paymongo.com/v1/checkout_sessions/" .
        rawurlencode($checkoutSessionId)
    );

curl_setopt_array(
    $curl,
    [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 30,
        CURLOPT_CONNECTTIMEOUT => 10,
        CURLOPT_HTTPHEADER => [
            "Authorization: Basic " .
                base64_encode(
                    PAYMONGO_SECRET_KEY . ":"
                ),
            "Accept: application/json"
        ]
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
    error_log(
        "PayMongo payment sync cURL error: " .
        $curlError
    );

    sync_json([
        "success" => false,
        "message" => "Unable to confirm the payment right now. Please try again."
    ], 502);
}

$response =
    json_decode(
        $responseBody,
        true
    );

if (
    !is_array($response) ||
    $httpCode < 200 ||
    $httpCode >= 300
) {
    error_log(
        "PayMongo payment sync HTTP " .
        $httpCode .
        ": " .
        $responseBody
    );

    sync_json([
        "success" => false,
        "message" => "Unable to confirm the payment right now. Please try again."
    ], 502);
}

$session =
    $response["data"] ?? null;

$attributes =
    is_array($session)
        ? ($session["attributes"] ?? null)
        : null;

if (!is_array($attributes)) {
    sync_json([
        "success" => false,
        "message" => "Unable to confirm the payment right now."
    ], 502);
}

$referenceNumber =
    trim(
        (string)(
            $attributes["reference_number"] ??
            ""
        )
    );

if (
    $referenceNumber === "" ||
    !hash_equals(
        (string)$row["reference_number"],
        $referenceNumber
    )
) {
    sync_json([
        "success" => false,
        "message" => "The payment reference could not be verified."
    ], 409);
}

$payments =
    is_array(
        $attributes["payments"] ?? null
    )
        ? $attributes["payments"]
        : [];

$paidPayment = null;

foreach ($payments as $payment) {
    if (!is_array($payment)) {
        continue;
    }

    $paymentAttributes =
        is_array(
            $payment["attributes"] ?? null
        )
            ? $payment["attributes"]
            : [];

    $status =
        strtolower(
            trim(
                (string)(
                    $paymentAttributes["status"] ??
                    ""
                )
            )
        );

    if ($status === "paid") {
        $paidPayment = $payment;
        break;
    }
}

if (!$paidPayment) {
    sync_json([
        "success" => true,
        "paid" => false,
        "payment_status" => "pending",
        "message" => "Payment is still being confirmed."
    ]);
}

$paymentAttributes =
    is_array(
        $paidPayment["attributes"] ?? null
    )
        ? $paidPayment["attributes"]
        : [];

$providerPaymentId =
    trim(
        (string)(
            $paidPayment["id"] ??
            ""
        )
    );

$paidAmount =
    round(
        ((int)($paymentAttributes["amount"] ?? 0)) /
        100,
        2
    );

$storedAmount =
    round(
        (float)$row["amount"],
        2
    );

if (
    $providerPaymentId === "" ||
    abs($paidAmount - $storedAmount) > 0.009
) {
    sync_json([
        "success" => false,
        "message" => "The payment amount could not be verified."
    ], 409);
}

$source =
    is_array(
        $paymentAttributes["source"] ?? null
    )
        ? $paymentAttributes["source"]
        : [];

$paymentMethodType =
    trim(
        (string)(
            $source["type"] ??
            "qrph"
        )
    );

$conn->begin_transaction();

try {
    $updatePaymentStmt =
        $conn->prepare("
            UPDATE tbl_payments
            SET
                payment_status = 'paid',
                provider_payment_id = ?,
                payment_method_type = ?,
                paid_at = COALESCE(paid_at, NOW())
            WHERE payment_id = ?
              AND order_id = ?
              AND restaurant_id = ?
        ");

    if (!$updatePaymentStmt) {
        throw new RuntimeException(
            "Unable to prepare the payment confirmation."
        );
    }

    $paymentId =
        (int)$row["payment_id"];

    $updatePaymentStmt->bind_param(
        "ssiii",
        $providerPaymentId,
        $paymentMethodType,
        $paymentId,
        $orderId,
        $restaurantId
    );

    if (!$updatePaymentStmt->execute()) {
        $updatePaymentStmt->close();

        throw new RuntimeException(
            "Unable to confirm the payment."
        );
    }

    $updatePaymentStmt->close();

    $updateOrderStmt =
        $conn->prepare("
            UPDATE tbl_orders
            SET payment_status = 'paid'
            WHERE order_id = ?
              AND restaurant_id = ?
              AND user_id = ?
              AND payment_method = 'PayMongo QR Ph'
        ");

    if (!$updateOrderStmt) {
        throw new RuntimeException(
            "Unable to prepare the order payment update."
        );
    }

    $updateOrderStmt->bind_param(
        "iii",
        $orderId,
        $restaurantId,
        $customerId
    );

    if (!$updateOrderStmt->execute()) {
        $updateOrderStmt->close();

        throw new RuntimeException(
            "Unable to update the order payment."
        );
    }

    $updateOrderStmt->close();

    ensure_paid_order_cashier_notification(
        $conn,
        $restaurantId,
        $customerId,
        $customerName,
        $orderId,
        $queueNumber
    );

    $conn->commit();
} catch (Throwable $e) {
    try {
        $conn->rollback();
    } catch (Throwable $ignored) {
    }

    error_log(
        "PayMongo payment sync error: " .
        $e->getMessage()
    );

    sync_json([
        "success" => false,
        "message" => "Unable to save the confirmed payment right now."
    ], 500);
}

sync_json([
    "success" => true,
    "paid" => true,
    "payment_status" => "paid",
    "message" => "Payment confirmed."
]);
