<?php

date_default_timezone_set("Asia/Manila");

header("Content-Type: application/json; charset=utf-8");
header("Cache-Control: no-store");

error_reporting(E_ALL & ~E_NOTICE & ~E_WARNING);
ini_set("display_errors", "0");

require_once __DIR__ . "/db.php";
require_once __DIR__ . "/paymongo_order_notification_helper.php";

function webhook_json(array $data, int $statusCode = 200): void
{
    http_response_code($statusCode);
    echo json_encode(
        $data,
        JSON_UNESCAPED_UNICODE |
        JSON_UNESCAPED_SLASHES
    );
    exit;
}

$requestMethod =
    strtoupper(
        (string)(
            $_SERVER["REQUEST_METHOD"] ?? ""
        )
    );

if ($requestMethod === "GET") {
    webhook_json([
        "success" => true,
        "message" =>
            "FoodConnect PayMongo webhook endpoint is reachable.",
        "mode" => "test"
    ]);
}

if ($requestMethod !== "POST") {
    webhook_json([
        "success" => false,
        "message" =>
            "Only POST webhook requests are accepted."
    ], 405);
}

try {
    require_once __DIR__ . "/paymongo_config.php";
} catch (Throwable $e) {
    webhook_json([
        "success" => false,
        "message" =>
            "PayMongo configuration is unavailable."
    ], 500);
}

if (
    !defined("PAYMONGO_WEBHOOK_SECRET") ||
    trim((string)PAYMONGO_WEBHOOK_SECRET) === ""
) {
    webhook_json([
        "success" => false,
        "message" =>
            "PayMongo webhook secret is not configured."
    ], 500);
}

$webhookSecret =
    trim(
        (string)PAYMONGO_WEBHOOK_SECRET
    );

$rawBody =
    file_get_contents("php://input");

if (
    !is_string($rawBody) ||
    $rawBody === ""
) {
    webhook_json([
        "success" => false,
        "message" => "Empty webhook body."
    ], 400);
}

$signatureHeader =
    trim(
        (string)(
            $_SERVER["HTTP_PAYMONGO_SIGNATURE"] ??
            ""
        )
    );

if ($signatureHeader === "") {
    webhook_json([
        "success" => false,
        "message" =>
            "Missing PayMongo signature."
    ], 401);
}

$signatureParts = [];

foreach (explode(",", $signatureHeader) as $piece) {
    $pair =
        explode(
            "=",
            trim($piece),
            2
        );

    if (count($pair) !== 2) {
        continue;
    }

    $signatureParts[
        trim($pair[0])
    ] =
        trim($pair[1]);
}

$timestamp =
    trim(
        (string)(
            $signatureParts["t"] ?? ""
        )
    );

$testSignature =
    trim(
        (string)(
            $signatureParts["te"] ?? ""
        )
    );

if (
    $timestamp === "" ||
    $testSignature === ""
) {
    webhook_json([
        "success" => false,
        "message" =>
            "Invalid Test Mode PayMongo signature."
    ], 401);
}

if (ctype_digit($timestamp)) {
    $age =
        abs(
            time() -
            (int)$timestamp
        );

    if ($age > 600) {
        webhook_json([
            "success" => false,
            "message" =>
                "Webhook timestamp is too old."
        ], 401);
    }
}

$signedPayload =
    $timestamp .
    "." .
    $rawBody;

$expectedSignature =
    hash_hmac(
        "sha256",
        $signedPayload,
        $webhookSecret
    );

if (
    !hash_equals(
        $expectedSignature,
        $testSignature
    )
) {
    webhook_json([
        "success" => false,
        "message" =>
            "Invalid PayMongo webhook signature."
    ], 401);
}

$payload =
    json_decode(
        $rawBody,
        true
    );

if (!is_array($payload)) {
    webhook_json([
        "success" => false,
        "message" =>
            "Invalid webhook JSON."
    ], 400);
}

$event =
    $payload["data"] ?? null;

if (!is_array($event)) {
    webhook_json([
        "success" => false,
        "message" =>
            "Invalid webhook event."
    ], 400);
}

$eventAttributes =
    $event["attributes"] ?? null;

if (!is_array($eventAttributes)) {
    webhook_json([
        "success" => false,
        "message" =>
            "Webhook event attributes are missing."
    ], 400);
}

$eventType =
    trim(
        (string)(
            $eventAttributes["type"] ?? ""
        )
    );

$livemode =
    (bool)(
        $eventAttributes["livemode"] ?? false
    );

if ($livemode) {
    webhook_json([
        "success" => false,
        "message" =>
            "Live webhook events are disabled during FoodConnect Test Mode."
    ], 403);
}

if (
    $eventType !==
    "checkout_session.payment.paid"
) {
    webhook_json([
        "success" => true,
        "ignored" => true,
        "event_type" =>
            $eventType
    ]);
}

$session =
    $eventAttributes["data"] ?? null;

if (!is_array($session)) {
    webhook_json([
        "success" => false,
        "message" =>
            "Webhook checkout session is missing."
    ], 400);
}

$checkoutSessionId =
    trim(
        (string)(
            $session["id"] ?? ""
        )
    );

$attributes =
    $session["attributes"] ?? null;

if (
    $checkoutSessionId === "" ||
    !is_array($attributes)
) {
    webhook_json([
        "success" => false,
        "message" =>
            "Webhook checkout session is incomplete."
    ], 400);
}

$referenceNumber =
    trim(
        (string)(
            $attributes[
                "reference_number"
            ] ?? ""
        )
    );

$metadata =
    is_array(
        $attributes["metadata"] ?? null
    )
        ? $attributes["metadata"]
        : [];

$metadataOrderId =
    (int)(
        $metadata[
            "foodconnect_order_id"
        ] ?? 0
    );

$metadataRestaurantId =
    (int)(
        $metadata[
            "restaurant_id"
        ] ?? 0
    );

$providerPaymentId = null;
$paidAmountCentavos = null;
$paymentMethodType = null;

$payments =
    is_array(
        $attributes["payments"] ?? null
    )
        ? $attributes["payments"]
        : [];

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
                    $paymentAttributes[
                        "status"
                    ] ?? ""
                )
            )
        );

    if ($status !== "paid") {
        continue;
    }

    $providerPaymentId =
        trim(
            (string)(
                $payment["id"] ?? ""
            )
        );

    $paidAmountCentavos =
        (int)(
            $paymentAttributes[
                "amount"
            ] ?? 0
        );

    $source =
        is_array(
            $paymentAttributes[
                "source"
            ] ?? null
        )
            ? $paymentAttributes[
                "source"
            ]
            : [];

    $paymentMethodType =
        trim(
            (string)(
                $source["type"] ?? ""
            )
        );

    break;
}

if (
    !$providerPaymentId ||
    !$paidAmountCentavos
) {
    webhook_json([
        "success" => false,
        "message" =>
            "No paid payment was found in the PayMongo checkout session."
    ], 422);
}

$conn->begin_transaction();

try {
    $paymentStmt =
        $conn->prepare("
            SELECT
                p.payment_id,
                p.order_id,
                p.restaurant_id,
                p.payment_status,
                p.amount,
                p.reference_number,
                p.checkout_session_id,
                o.payment_method,
                o.order_status,
                o.user_id,
                o.customer_name,
                o.queue_number
            FROM tbl_payments AS p
            INNER JOIN tbl_orders AS o
                ON o.order_id = p.order_id
               AND o.restaurant_id = p.restaurant_id
            WHERE p.checkout_session_id = ?
            LIMIT 1
            FOR UPDATE
        ");

    if (!$paymentStmt) {
        throw new RuntimeException(
            "Unable to prepare webhook payment lookup."
        );
    }

    $paymentStmt->bind_param(
        "s",
        $checkoutSessionId
    );

    if (!$paymentStmt->execute()) {
        $paymentStmt->close();
        throw new RuntimeException(
            "Unable to read the webhook payment record."
        );
    }

    $paymentRow =
        $paymentStmt
            ->get_result()
            ->fetch_assoc();

    $paymentStmt->close();

    if (!$paymentRow) {
        throw new RuntimeException(
            "No FoodConnect payment matches this PayMongo checkout session."
        );
    }

    $paymentId =
        (int)$paymentRow["payment_id"];

    $orderId =
        (int)$paymentRow["order_id"];

    $restaurantId =
        (int)$paymentRow["restaurant_id"];

    $storedAmount =
        round(
            (float)$paymentRow["amount"],
            2
        );

    $paidAmount =
        round(
            $paidAmountCentavos / 100,
            2
        );

    if (
        $referenceNumber === "" ||
        !hash_equals(
            (string)$paymentRow[
                "reference_number"
            ],
            $referenceNumber
        )
    ) {
        throw new RuntimeException(
            "PayMongo reference number does not match FoodConnect."
        );
    }

    if (
        $metadataOrderId > 0 &&
        $metadataOrderId !== $orderId
    ) {
        throw new RuntimeException(
            "PayMongo order metadata does not match FoodConnect."
        );
    }

    if (
        $metadataRestaurantId > 0 &&
        $metadataRestaurantId !==
            $restaurantId
    ) {
        throw new RuntimeException(
            "PayMongo restaurant metadata does not match FoodConnect."
        );
    }

    if (
        abs(
            $storedAmount -
            $paidAmount
        ) > 0.009
    ) {
        throw new RuntimeException(
            "PayMongo payment amount does not match the FoodConnect order."
        );
    }

    if (
        trim(
            (string)$paymentRow[
                "payment_method"
            ]
        ) !==
        "PayMongo QR Ph"
    ) {
        throw new RuntimeException(
            "The FoodConnect order is not configured for PayMongo QR Ph."
        );
    }

    if (
        strtolower(
            trim(
                (string)$paymentRow[
                    "payment_status"
                ]
            )
        ) === "paid"
    ) {
        ensure_paid_order_cashier_notification(
            $conn,
            $restaurantId,
            (int)($paymentRow["user_id"] ?? 0),
            trim((string)($paymentRow["customer_name"] ?? "Customer")),
            $orderId,
            (int)($paymentRow["queue_number"] ?? 0)
        );

        $conn->commit();

        webhook_json([
            "success" => true,
            "duplicate" => true,
            "message" =>
                "Payment was already confirmed.",
            "order_id" =>
                $orderId
        ]);
    }

    $updatePaymentStmt =
        $conn->prepare("
            UPDATE tbl_payments
            SET
                payment_status = 'paid',
                provider_payment_id = ?,
                payment_method_type =
                    CASE
                        WHEN ? <> ''
                            THEN ?
                        ELSE
                            payment_method_type
                    END,
                paid_at = NOW()
            WHERE payment_id = ?
              AND order_id = ?
              AND restaurant_id = ?
              AND payment_status <> 'paid'
        ");

    if (!$updatePaymentStmt) {
        throw new RuntimeException(
            "Unable to prepare the payment confirmation update."
        );
    }

    $methodForBind =
        (string)$paymentMethodType;

    $updatePaymentStmt->bind_param(
        "sssiii",
        $providerPaymentId,
        $methodForBind,
        $methodForBind,
        $paymentId,
        $orderId,
        $restaurantId
    );

    if (!$updatePaymentStmt->execute()) {
        $updatePaymentStmt->close();
        throw new RuntimeException(
            "Unable to confirm the payment transaction."
        );
    }

    $updatePaymentStmt->close();

    $updateOrderStmt =
        $conn->prepare("
            UPDATE tbl_orders
            SET payment_status = 'paid'
            WHERE order_id = ?
              AND restaurant_id = ?
              AND payment_method = 'PayMongo QR Ph'
        ");

    if (!$updateOrderStmt) {
        throw new RuntimeException(
            "Unable to prepare the order payment confirmation."
        );
    }

    $updateOrderStmt->bind_param(
        "ii",
        $orderId,
        $restaurantId
    );

    if (!$updateOrderStmt->execute()) {
        $updateOrderStmt->close();
        throw new RuntimeException(
            "Unable to mark the FoodConnect order as paid."
        );
    }

    $updateOrderStmt->close();

    ensure_paid_order_cashier_notification(
        $conn,
        $restaurantId,
        (int)($paymentRow["user_id"] ?? 0),
        trim((string)($paymentRow["customer_name"] ?? "Customer")),
        $orderId,
        (int)($paymentRow["queue_number"] ?? 0)
    );

    $conn->commit();

    webhook_json([
        "success" => true,
        "message" =>
            "PayMongo payment confirmed.",
        "order_id" =>
            $orderId,
        "restaurant_id" =>
            $restaurantId,
        "payment_status" =>
            "paid"
    ]);

} catch (Throwable $e) {
    try {
        $conn->rollback();
    } catch (Throwable $ignored) {
    }

    webhook_json([
        "success" => false,
        "message" =>
            $e->getMessage()
    ], 422);
}
