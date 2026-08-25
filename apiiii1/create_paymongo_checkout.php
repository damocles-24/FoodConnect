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
    payment_json(["success" => false, "message" => "The order total is too small for this payment test."], 400);
}

try {
    require_once __DIR__ . "/paymongo_config.php";
} catch (Throwable $e) {
    error_log("create_paymongo_checkout.php configuration error: " . $e->getMessage());
    payment_json([
        "success" => false,
        "message" => "Online payment is temporarily unavailable."
    ], 500);
}

if (!function_exists("curl_init")) {
    payment_json(["success" => false, "message" => "PHP cURL is not enabled."], 500);
}

$referenceNumber =
    "FC-" .
    (int)$order["restaurant_id"] . "-" .
    $orderId . "-" .
    date("YmdHis") . "-" .
    bin2hex(random_bytes(3));

$restaurantName = trim((string)($order["restaurant_name"] ?? "FoodConnect Restaurant"));
if ($restaurantName === "") {
    $restaurantName = "FoodConnect Restaurant";
}

$returnBase = foodconnect_url("frontend/html/cart.html");

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
                "customer_id" => (string)$customerId
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
        "Authorization: Basic " . base64_encode(PAYMONGO_SECRET_KEY . ":"),
        "Content-Type: application/json",
        "Accept: application/json"
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
    "livemode" => (bool)($response["data"]["attributes"]["livemode"] ?? false)
]);
