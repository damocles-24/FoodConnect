<?php

date_default_timezone_set("Asia/Manila");

header("Content-Type: application/json; charset=utf-8");
header("Cache-Control: no-store");

error_reporting(E_ALL & ~E_NOTICE & ~E_WARNING);
ini_set("display_errors", "0");

require_once __DIR__ . "/session_config.php";
require_once __DIR__ . "/db.php";
require_once __DIR__ . "/rate_limit.php";
require_once __DIR__ . "/url_helper.php";

function payment_json(array $data, int $statusCode = 200): void
{
    http_response_code($statusCode);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

if (strtoupper($_SERVER["REQUEST_METHOD"] ?? "") !== "POST") {
    payment_json(["success" => false, "message" => "Only POST requests are allowed."], 405);
}

$customerId = (int)($_SESSION["user_id"] ?? 0);
$role = strtolower(trim((string)($_SESSION["role"] ?? "")));

if ($customerId <= 0 || ($role !== "" && $role !== "customer")) {
    payment_json(["success" => false, "message" => "Please login as a customer first."], 401);
}

$input = json_decode(file_get_contents("php://input"), true);
if (!is_array($input)) {
    payment_json(["success" => false, "message" => "Invalid payment request."], 400);
}

$orderId = (int)($input["order_id"] ?? 0);
if ($orderId <= 0) {
    payment_json(["success" => false, "message" => "Invalid order ID."], 400);
}

rate_limit_enforce(
    $conn,
    "paymongo-checkout-create",
    rate_limit_identifier(
        (string)$customerId,
        (string)$orderId,
        rate_limit_client_ip()
    ),
    5,
    600,
    600,
    "Too many payment-session requests for this order. Please wait 10 minutes and try again."
);

$orderStmt = $conn->prepare("\n    SELECT\n        o.order_id,\n        o.restaurant_id,\n        o.user_id,\n        o.order_type,\n        o.order_status,\n        o.qr_verified_at,\n        o.payment_method,\n        o.payment_status,\n        o.total_amount,\n        r.name AS restaurant_name\n    FROM tbl_orders AS o\n    INNER JOIN tbl_restaurants AS r\n        ON r.restaurant_id = o.restaurant_id\n    WHERE o.order_id = ?\n      AND o.user_id = ?\n    LIMIT 1\n");

if (!$orderStmt) {
    payment_json(["success" => false, "message" => "Unable to prepare payment validation."], 500);
}

$orderStmt->bind_param("ii", $orderId, $customerId);
if (!$orderStmt->execute()) {
    $orderStmt->close();
    payment_json(["success" => false, "message" => "Unable to validate the order."], 500);
}

$order = $orderStmt->get_result()->fetch_assoc();
$orderStmt->close();

if (!$order) {
    payment_json(["success" => false, "message" => "Order not found."], 404);
}

$orderStatus = strtolower(trim((string)($order["order_status"] ?? "")));
$paymentMethod = trim((string)($order["payment_method"] ?? ""));
$paymentStatus = strtolower(trim((string)($order["payment_status"] ?? "")));
$orderType = strtolower(trim((string)($order["order_type"] ?? "")));
if ($orderType === "take-out") {
    $orderType = "takeout";
}

if ($orderStatus === "cancelled") {
    payment_json(["success" => false, "message" => "This order has been cancelled."], 409);
}

if ($paymentMethod !== "PayMongo QR Ph") {
    payment_json(["success" => false, "message" => "This order is not configured for PayMongo payment."], 409);
}

if ($paymentStatus === "paid") {
    payment_json(["success" => false, "message" => "This order is already paid."], 409);
}

if (in_array($paymentStatus, ["refunded"], true)) {
    payment_json(["success" => false, "message" => "This payment can no longer be processed."], 409);
}

$requiresQrFirst = in_array($orderType, ["dine-in", "dinein", "takeout"], true);
if ($requiresQrFirst && empty($order["qr_verified_at"])) {
    payment_json([
        "success" => false,
        "message" => "Please present the FoodConnect order QR to the cashier before paying online.",
        "error_code" => "QR_VERIFICATION_REQUIRED"
    ], 409);
}

$amount = round((float)($order["total_amount"] ?? 0), 2);
$amountCentavos = (int)round($amount * 100);
if ($amountCentavos < 100) {
    payment_json(["success" => false, "message" => "The order total is too small for online payment."], 400);
}

$restaurantId =
    (int)$order["restaurant_id"];

/*
 * Route this order through the PayMongo account configured for the
 * restaurant that owns the order. In multi-account mode there is no
 * fallback to another restaurant's credentials.
 */
$GLOBALS["FOODCONNECT_PAYMONGO_RESTAURANT_ID"] = $restaurantId;

try {
    require_once __DIR__ . "/paymongo_config.php";
    paymongo_set_restaurant_context($restaurantId);
    paymongo_validate_configuration($restaurantId, true);
} catch (Throwable $e) {
    error_log("create_paymongo_checkout.php configuration error for restaurant " . $restaurantId . ": " . $e->getMessage());
    payment_json([
        "success" => false,
        "message" => "QR Ph online payment is not available for this restaurant right now."
    ], 503);
}

if (!function_exists("curl_init")) {
    payment_json(["success" => false, "message" => "PHP cURL is not enabled."], 500);
}

/*
 * Production safety:
 * Reuse an existing active PayMongo checkout session for this order
 * instead of creating multiple payable checkout URLs.
 */
$existingStmt =
    $conn->prepare("
        SELECT
            payment_id,
            amount,
            reference_number,
            checkout_session_id
        FROM tbl_payments
        WHERE order_id = ?
          AND restaurant_id = ?
          AND provider = 'paymongo'
          AND payment_method_type = 'qrph'
          AND payment_status = 'pending'
        ORDER BY payment_id DESC
        LIMIT 1
    ");

if (!$existingStmt) {
    payment_json([
        "success" => false,
        "message" => "Unable to check the existing payment session."
    ], 500);
}

$existingStmt->bind_param(
    "ii",
    $orderId,
    $restaurantId
);

if (!$existingStmt->execute()) {
    $existingStmt->close();

    payment_json([
        "success" => false,
        "message" => "Unable to check the existing payment session."
    ], 500);
}

$existingPayment =
    $existingStmt
        ->get_result()
        ->fetch_assoc();

$existingStmt->close();

if ($existingPayment) {
    $existingAmount =
        round(
            (float)($existingPayment["amount"] ?? 0),
            2
        );

    $existingSessionId =
        trim(
            (string)(
                $existingPayment["checkout_session_id"] ?? ""
            )
        );

    $existingReference =
        trim(
            (string)(
                $existingPayment["reference_number"] ?? ""
            )
        );

    if (
        abs($existingAmount - $amount) <= 0.009 &&
        $existingSessionId !== "" &&
        $existingReference !== ""
    ) {
        $existingCurl =
            curl_init(
                "https://api.paymongo.com/v1/checkout_sessions/" .
                rawurlencode($existingSessionId)
            );

        curl_setopt_array(
            $existingCurl,
            [
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_TIMEOUT => 30,
                CURLOPT_CONNECTTIMEOUT => 10,
                CURLOPT_HTTPHEADER => [
                    "Authorization: Basic " .
                        base64_encode(paymongo_secret_key() . ":"),
                    "Accept: application/json"
                ]
            ]
        );

        $existingResponseBody =
            curl_exec($existingCurl);

        $existingCurlError =
            curl_error($existingCurl);

        $existingHttpCode =
            (int)curl_getinfo(
                $existingCurl,
                CURLINFO_HTTP_CODE
            );

        curl_close($existingCurl);

        if ($existingResponseBody === false) {
            error_log(
                "create_paymongo_checkout.php existing-session cURL error: " .
                $existingCurlError
            );

            payment_json([
                "success" => false,
                "message" => "Unable to verify the existing payment session. Please try again."
            ], 502);
        }

        $existingResponse =
            json_decode(
                $existingResponseBody,
                true
            );

        if (
            $existingHttpCode >= 200 &&
            $existingHttpCode < 300 &&
            is_array($existingResponse)
        ) {
            $existingAttributes =
                $existingResponse["data"]["attributes"] ?? null;

            if (is_array($existingAttributes)) {
                $existingLivemode =
                    (bool)(
                        $existingAttributes["livemode"] ?? false
                    );

                $existingRemoteReference =
                    trim(
                        (string)(
                            $existingAttributes["reference_number"] ?? ""
                        )
                    );

                $existingStatus =
                    strtolower(
                        trim(
                            (string)(
                                $existingAttributes["status"] ?? ""
                            )
                        )
                    );

                $existingCheckoutUrl =
                    trim(
                        (string)(
                            $existingAttributes["checkout_url"] ?? ""
                        )
                    );

                $existingPayments =
                    is_array(
                        $existingAttributes["payments"] ?? null
                    )
                        ? $existingAttributes["payments"]
                        : [];

                $existingAlreadyPaid = false;

                foreach ($existingPayments as $existingPayAttempt) {
                    if (!is_array($existingPayAttempt)) {
                        continue;
                    }

                    $existingPayAttributes =
                        is_array(
                            $existingPayAttempt["attributes"] ?? null
                        )
                            ? $existingPayAttempt["attributes"]
                            : [];

                    if (
                        strtolower(
                            trim(
                                (string)(
                                    $existingPayAttributes["status"] ?? ""
                                )
                            )
                        ) === "paid"
                    ) {
                        $existingAlreadyPaid = true;
                        break;
                    }
                }

                if ($existingLivemode === paymongo_is_live()) {
                    if (
                        $existingRemoteReference === "" ||
                        !hash_equals(
                            $existingReference,
                            $existingRemoteReference
                        )
                    ) {
                        payment_json([
                            "success" => false,
                            "message" => "The existing PayMongo payment reference does not match this order.",
                            "error_code" => "PAYMENT_REFERENCE_MISMATCH"
                        ], 409);
                    }

                    if ($existingAlreadyPaid) {
                        payment_json([
                            "success" => false,
                            "message" => "This payment was already completed and is being confirmed. Please refresh My Orders.",
                            "error_code" => "PAYMENT_CONFIRMATION_PENDING"
                        ], 409);
                    }

                    if (
                        $existingStatus === "active" &&
                        $existingCheckoutUrl !== ""
                    ) {
                        payment_json([
                            "success" => true,
                            "message" => "Existing PayMongo checkout is ready.",
                            "order_id" => $orderId,
                            "checkout_session_id" => $existingSessionId,
                            "reference_number" => $existingReference,
                            "checkout_url" => $existingCheckoutUrl,
                            "payment_status" => "pending",
                            "livemode" => $existingLivemode,
                            "reused" => true
                        ]);
                    }

                    if ($existingStatus === "expired") {
                        $expiredPaymentId =
                            (int)$existingPayment["payment_id"];

                        $expireLocalStmt =
                            $conn->prepare("
                                UPDATE tbl_payments
                                SET payment_status = 'failed'
                                WHERE payment_id = ?
                                  AND payment_status = 'pending'
                            ");

                        if ($expireLocalStmt) {
                            $expireLocalStmt->bind_param(
                                "i",
                                $expiredPaymentId
                            );
                            $expireLocalStmt->execute();
                            $expireLocalStmt->close();
                        }
                    } else {
                        payment_json([
                            "success" => false,
                            "message" => "The existing PayMongo checkout could not be safely reused. Please try again later.",
                            "error_code" => "PAYMENT_SESSION_STATE_INVALID"
                        ], 409);
                    }
                }

            }
        } elseif ($existingHttpCode !== 404) {
            error_log(
                "create_paymongo_checkout.php existing-session HTTP " .
                $existingHttpCode
            );

            payment_json([
                "success" => false,
                "message" => "Unable to verify the existing payment session. Please try again."
            ], 502);
        }
    } elseif (abs($existingAmount - $amount) > 0.009) {
        payment_json([
            "success" => false,
            "message" => "The order total changed while a payment session is still pending. Please contact the restaurant before paying.",
            "error_code" => "PENDING_PAYMENT_AMOUNT_MISMATCH"
        ], 409);
    }
}

/*
 * Build one deterministic logical-attempt key. If the customer double-clicks
 * or the network retries before the first request is saved locally, PayMongo
 * receives the same payload and Idempotency-Key instead of creating a second
 * payable Checkout Session. A later attempt gets a new seed from the latest
 * stored payment row.
 */
$latestPaymentStmt =
    $conn->prepare("
        SELECT COALESCE(MAX(payment_id), 0) AS latest_payment_id
        FROM tbl_payments
        WHERE order_id = ?
          AND restaurant_id = ?
          AND provider = 'paymongo'
          AND payment_method_type = 'qrph'
    ");

if (!$latestPaymentStmt) {
    payment_json([
        "success" => false,
        "message" => "Unable to prepare the payment attempt."
    ], 500);
}

$latestPaymentStmt->bind_param(
    "ii",
    $orderId,
    $restaurantId
);

if (!$latestPaymentStmt->execute()) {
    $latestPaymentStmt->close();

    payment_json([
        "success" => false,
        "message" => "Unable to prepare the payment attempt."
    ], 500);
}

$latestPaymentRow =
    $latestPaymentStmt
        ->get_result()
        ->fetch_assoc();

$latestPaymentStmt->close();

$latestPaymentId =
    (int)(
        $latestPaymentRow["latest_payment_id"] ?? 0
    );

$attemptSeed = $latestPaymentId + 1;
$modeMarker = paymongo_is_live() ? "L" : "T";

$attemptFingerprint =
    hash(
        "sha256",
        "foodconnect|qrph|" .
        $restaurantId . "|" .
        $orderId . "|" .
        $amountCentavos . "|" .
        $attemptSeed . "|" .
        paymongo_mode()
    );

$referenceNumber =
    "FC-" .
    $restaurantId . "-" .
    $orderId . "-" .
    $modeMarker . "-" .
    $attemptSeed . "-" .
    substr($attemptFingerprint, 0, 10);

$idempotencyKey =
    "foodconnect-qrph-" .
    $attemptFingerprint;

$restaurantName = trim((string)($order["restaurant_name"] ?? "FoodConnect Restaurant"));
if ($restaurantName === "") {
    $restaurantName = "FoodConnect Restaurant";
}

/*
 * Production return URL:
 * FoodConnect is deployed at the domain root on foodconnect.store.
 * Do not include the old /FoodConnect development folder in PayMongo
 * success/cancel redirects.
 */
$returnBase = "https://foodconnect.store/frontend/html/cart.html";

$successUrl =
    $returnBase .
    "?tab=orders&paymongo_return=success&order_id=" .
    rawurlencode((string)$orderId);

$cancelUrl =
    $returnBase .
    "?tab=orders&paymongo_return=cancelled&order_id=" .
    rawurlencode((string)$orderId);

$payload = [
    "data" => [
        "attributes" => [
            "line_items" => [[
                "name" => "FoodConnect Order #" . $orderId . " - " . $restaurantName,
                "amount" => $amountCentavos,
                "currency" => "PHP",
                "quantity" => 1
            ]],
            "payment_method_types" => ["qrph"],
            "success_url" => $successUrl,
            "cancel_url" => $cancelUrl,
            "reference_number" => $referenceNumber,
            "metadata" => [
                "foodconnect_order_id" => (string)$orderId,
                "restaurant_id" => (string)$order["restaurant_id"],
                "customer_id" => (string)$customerId,
                "foodconnect_payment_channel" => "qrph"
            ]
        ]
    ]
];

$curl = curl_init("https://api.paymongo.com/v2/checkout_sessions");
curl_setopt_array($curl, [
    CURLOPT_POST => true,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 30,
    CURLOPT_CONNECTTIMEOUT => 10,
    CURLOPT_HTTPHEADER => [
        "Authorization: Basic " . base64_encode(paymongo_secret_key() . ":"),
        "Content-Type: application/json",
        "Accept: application/json",
        "Idempotency-Key: " . $idempotencyKey
    ],
    CURLOPT_POSTFIELDS => json_encode($payload, JSON_UNESCAPED_SLASHES)
]);

$responseBody = curl_exec($curl);
$curlError = curl_error($curl);
$httpCode = (int)curl_getinfo($curl, CURLINFO_HTTP_CODE);
curl_close($curl);

if ($responseBody === false) {
    if ($curlError !== "") {
        error_log("create_paymongo_checkout.php cURL error: " . $curlError);
    }

    payment_json([
        "success" => false,
        "message" => "FoodConnect could not connect to PayMongo."
    ], 502);
}

$response = json_decode($responseBody, true);
if (!is_array($response) || $httpCode < 200 || $httpCode >= 300) {
    $message =
        $response["errors"][0]["detail"] ??
        $response["errors"][0]["code"] ??
        "PayMongo rejected the checkout request.";

    payment_json([
        "success" => false,
        "message" => $message,
        "paymongo_http_status" => $httpCode
    ], 502);
}

$responseLivemode =
    (bool)(
        $response["data"]["attributes"]["livemode"] ?? false
    );

if ($responseLivemode !== paymongo_is_live()) {
    error_log(
        "create_paymongo_checkout.php PayMongo mode mismatch. Configured=" .
        paymongo_mode()
    );

    payment_json([
        "success" => false,
        "message" => "PayMongo returned a checkout session from the wrong environment."
    ], 502);
}

$sessionId = trim((string)($response["data"]["id"] ?? ""));
$checkoutUrl = trim((string)($response["data"]["attributes"]["checkout_url"] ?? ""));

if ($sessionId === "" || $checkoutUrl === "") {
    payment_json(["success" => false, "message" => "PayMongo returned an incomplete checkout session."], 502);
}

$conn->begin_transaction();

try {
    $insertStmt = $conn->prepare("\n        INSERT INTO tbl_payments (\n            order_id,\n            restaurant_id,\n            provider,\n            payment_method_type,\n            payment_status,\n            amount,\n            currency,\n            reference_number,\n            checkout_session_id\n        ) VALUES (?, ?, 'paymongo', 'qrph', 'pending', ?, 'PHP', ?, ?)\n    ");

    if (!$insertStmt) {
        throw new RuntimeException("Unable to prepare the payment record.");
    }

    $restaurantId = (int)$order["restaurant_id"];
    $insertStmt->bind_param("iidss", $orderId, $restaurantId, $amount, $referenceNumber, $sessionId);

    if (!$insertStmt->execute()) {
        $insertStmt->close();
        throw new RuntimeException("Unable to save the PayMongo checkout session.");
    }

    $insertStmt->close();

    $updateStmt = $conn->prepare("\n        UPDATE tbl_orders\n        SET payment_status = 'pending'\n        WHERE order_id = ?\n          AND restaurant_id = ?\n          AND user_id = ?\n          AND payment_method = 'PayMongo QR Ph'\n    ");

    if (!$updateStmt) {
        throw new RuntimeException("Unable to prepare the order payment update.");
    }

    $updateStmt->bind_param("iii", $orderId, $restaurantId, $customerId);
    if (!$updateStmt->execute()) {
        $updateStmt->close();
        throw new RuntimeException("Unable to update the order payment state.");
    }
    $updateStmt->close();

    $conn->commit();
} catch (Throwable $e) {
    try { $conn->rollback(); } catch (Throwable $ignored) {}
    error_log("create_paymongo_checkout.php payment persistence error: " . $e->getMessage());
    payment_json([
        "success" => false,
        "message" => "Unable to save the online payment session."
    ], 500);
}

payment_json([
    "success" => true,
    "message" => "PayMongo checkout is ready.",
    "order_id" => $orderId,
    "checkout_session_id" => $sessionId,
    "reference_number" => $referenceNumber,
    "checkout_url" => $checkoutUrl,
    "payment_status" => "pending",
    "livemode" => $responseLivemode,
    "reused" => false
]);
