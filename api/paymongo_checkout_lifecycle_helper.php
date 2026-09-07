<?php

/*
|--------------------------------------------------------------------------
| PayMongo Checkout Lifecycle Helper
|--------------------------------------------------------------------------
|
| Used by FoodConnect cancellation flows before an unpaid PayMongo QR Ph
| order is cancelled. PayMongo Checkout Sessions remain payable until they
| are explicitly expired, so cancellation must close any active session
| first.
|
| This file does not send output and does not commit/rollback transactions.
|
*/

function paymongo_checkout_request(
    string $method,
    string $url
): array {
    if (!function_exists("curl_init")) {
        return [
            "ok" => false,
            "network_error" => true,
            "http_code" => 0,
            "body" => null,
            "raw_body" => "",
            "error" => "PHP cURL is unavailable."
        ];
    }

    $curl = curl_init($url);

    $options = [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 15,
        CURLOPT_CONNECTTIMEOUT => 8,
        CURLOPT_HTTPHEADER => [
            "Authorization: Basic " .
                base64_encode(paymongo_secret_key() . ":"),
            "Accept: application/json"
        ]
    ];

    if (strtoupper($method) === "POST") {
        $options[CURLOPT_POST] = true;
        $options[CURLOPT_POSTFIELDS] = "";
    }

    curl_setopt_array($curl, $options);

    $responseBody = curl_exec($curl);
    $curlError = curl_error($curl);
    $httpCode = (int)curl_getinfo($curl, CURLINFO_HTTP_CODE);

    curl_close($curl);

    if ($responseBody === false) {
        return [
            "ok" => false,
            "network_error" => true,
            "http_code" => $httpCode,
            "body" => null,
            "raw_body" => "",
            "error" => $curlError
        ];
    }

    $decoded = json_decode((string)$responseBody, true);

    return [
        "ok" => $httpCode >= 200 && $httpCode < 300,
        "network_error" => false,
        "http_code" => $httpCode,
        "body" => is_array($decoded) ? $decoded : null,
        "raw_body" => (string)$responseBody,
        "error" => ""
    ];
}

function paymongo_checkout_has_paid_payment(array $attributes): bool
{
    $payments = is_array($attributes["payments"] ?? null)
        ? $attributes["payments"]
        : [];

    foreach ($payments as $payment) {
        if (!is_array($payment)) {
            continue;
        }

        $paymentAttributes = is_array($payment["attributes"] ?? null)
            ? $payment["attributes"]
            : [];

        if (
            strtolower(
                trim(
                    (string)($paymentAttributes["status"] ?? "")
                )
            ) === "paid"
        ) {
            return true;
        }
    }

    return false;
}

function mark_foodconnect_payment_cancelled(
    mysqli $conn,
    int $paymentId
): void {
    $stmt = $conn->prepare("
        UPDATE tbl_payments
        SET
            payment_status = 'cancelled',
            cancelled_at = COALESCE(cancelled_at, NOW())
        WHERE payment_id = ?
          AND payment_status = 'pending'
    ");

    if (!$stmt) {
        throw new RuntimeException(
            "Unable to prepare the payment-session cancellation update."
        );
    }

    $stmt->bind_param("i", $paymentId);

    if (!$stmt->execute()) {
        $stmt->close();

        throw new RuntimeException(
            "Unable to save the payment-session cancellation."
        );
    }

    $stmt->close();
}

function paymongo_close_pending_checkout_sessions(
    mysqli $conn,
    int $orderId,
    int $restaurantId
): array {
    try {
        require_once __DIR__ . "/paymongo_config.php";
    } catch (Throwable $error) {
        error_log(
            "PayMongo lifecycle configuration error: " .
            $error->getMessage()
        );

        return [
            "safe_to_cancel" => false,
            "http_status" => 503,
            "error_code" => "PAYMONGO_CONFIG_UNAVAILABLE",
            "message" =>
                "Online payment could not be safely closed. Please try again later."
        ];
    }

    $stmt = $conn->prepare("
        SELECT
            payment_id,
            reference_number,
            checkout_session_id
        FROM tbl_payments
        WHERE order_id = ?
          AND restaurant_id = ?
          AND provider = 'paymongo'
          AND payment_method_type = 'qrph'
          AND payment_status = 'pending'
        ORDER BY payment_id ASC
        FOR UPDATE
    ");

    if (!$stmt) {
        throw new RuntimeException(
            "Unable to prepare the pending PayMongo checkout lookup."
        );
    }

    $stmt->bind_param("ii", $orderId, $restaurantId);

    if (!$stmt->execute()) {
        $stmt->close();

        throw new RuntimeException(
            "Unable to read the pending PayMongo checkout sessions."
        );
    }

    $result = $stmt->get_result();
    $pendingPayments = [];

    while ($row = $result->fetch_assoc()) {
        $pendingPayments[] = $row;
    }

    $stmt->close();

    foreach ($pendingPayments as $paymentRow) {
        $paymentId = (int)($paymentRow["payment_id"] ?? 0);
        $sessionId = trim(
            (string)($paymentRow["checkout_session_id"] ?? "")
        );
        $storedReference = trim(
            (string)($paymentRow["reference_number"] ?? "")
        );

        if ($paymentId <= 0) {
            continue;
        }

        /* No remote checkout exists if no session ID was ever saved. */
        if ($sessionId === "") {
            mark_foodconnect_payment_cancelled($conn, $paymentId);
            continue;
        }

        $sessionUrl =
            "https://api.paymongo.com/v1/checkout_sessions/" .
            rawurlencode($sessionId);

        $getResult = paymongo_checkout_request("GET", $sessionUrl);

        if ($getResult["network_error"]) {
            error_log(
                "PayMongo lifecycle retrieve error for " .
                $sessionId . ": " .
                (string)$getResult["error"]
            );

            return [
                "safe_to_cancel" => false,
                "http_status" => 502,
                "error_code" => "PAYMONGO_SESSION_UNREACHABLE",
                "message" =>
                    "FoodConnect could not verify the online payment session. The order was not cancelled. Please try again."
            ];
        }

        $getHttpCode = (int)$getResult["http_code"];

        /*
         * A 404 means this checkout session does not exist in the currently
         * configured PayMongo environment. This also safely handles old test
         * records after FoodConnect switches to a live key.
         */
        if ($getHttpCode === 404) {
            mark_foodconnect_payment_cancelled($conn, $paymentId);
            continue;
        }

        if (!$getResult["ok"] || !is_array($getResult["body"])) {
            error_log(
                "PayMongo lifecycle retrieve HTTP " .
                $getHttpCode .
                " for " .
                $sessionId
            );

            return [
                "safe_to_cancel" => false,
                "http_status" => 502,
                "error_code" => "PAYMONGO_SESSION_VERIFY_FAILED",
                "message" =>
                    "FoodConnect could not safely verify the online payment session. The order was not cancelled."
            ];
        }

        $attributes =
            $getResult["body"]["data"]["attributes"] ?? null;

        if (!is_array($attributes)) {
            return [
                "safe_to_cancel" => false,
                "http_status" => 502,
                "error_code" => "PAYMONGO_SESSION_INVALID",
                "message" =>
                    "PayMongo returned an invalid payment session. The order was not cancelled."
            ];
        }

        $sessionLivemode = (bool)($attributes["livemode"] ?? false);

        if ($sessionLivemode !== paymongo_is_live()) {
            return [
                "safe_to_cancel" => false,
                "http_status" => 409,
                "error_code" => "PAYMONGO_MODE_MISMATCH",
                "message" =>
                    "The PayMongo payment environment does not match FoodConnect. The order was not cancelled."
            ];
        }

        $remoteReference = trim(
            (string)($attributes["reference_number"] ?? "")
        );

        if (
            $storedReference !== "" &&
            $remoteReference !== "" &&
            !hash_equals($storedReference, $remoteReference)
        ) {
            return [
                "safe_to_cancel" => false,
                "http_status" => 409,
                "error_code" => "PAYMONGO_REFERENCE_MISMATCH",
                "message" =>
                    "The PayMongo payment reference does not match this order. The order was not cancelled."
            ];
        }

        if (paymongo_checkout_has_paid_payment($attributes)) {
            return [
                "safe_to_cancel" => false,
                "http_status" => 409,
                "error_code" => "PAYMONGO_PAYMENT_ALREADY_PAID",
                "message" =>
                    "This online payment has already been completed or is being confirmed. The order cannot be cancelled automatically."
            ];
        }

        $sessionStatus = strtolower(
            trim((string)($attributes["status"] ?? ""))
        );

        if ($sessionStatus === "expired") {
            mark_foodconnect_payment_cancelled($conn, $paymentId);
            continue;
        }

        if ($sessionStatus !== "active") {
            return [
                "safe_to_cancel" => false,
                "http_status" => 409,
                "error_code" => "PAYMONGO_SESSION_STATE_UNSAFE",
                "message" =>
                    "The online payment is in a state that cannot be safely cancelled right now."
            ];
        }

        $expireResult = paymongo_checkout_request(
            "POST",
            $sessionUrl . "/expire"
        );

        if ($expireResult["network_error"]) {
            error_log(
                "PayMongo lifecycle expire error for " .
                $sessionId . ": " .
                (string)$expireResult["error"]
            );

            return [
                "safe_to_cancel" => false,
                "http_status" => 502,
                "error_code" => "PAYMONGO_EXPIRE_UNREACHABLE",
                "message" =>
                    "FoodConnect could not close the online payment session. The order was not cancelled. Please try again."
            ];
        }

        if ($expireResult["ok"]) {
            mark_foodconnect_payment_cancelled($conn, $paymentId);
            continue;
        }

        $expireHttpCode = (int)$expireResult["http_code"];

        if ($expireHttpCode === 404) {
            mark_foodconnect_payment_cancelled($conn, $paymentId);
            continue;
        }

        /*
         * PayMongo returns 400 if the session is already expired, has a paid
         * payment, or has an ongoing payment. Re-read the session so we do
         * not guess which one occurred.
         */
        if ($expireHttpCode === 400) {
            $recheckResult = paymongo_checkout_request("GET", $sessionUrl);

            if (
                $recheckResult["network_error"] ||
                !$recheckResult["ok"] ||
                !is_array($recheckResult["body"])
            ) {
                return [
                    "safe_to_cancel" => false,
                    "http_status" => 502,
                    "error_code" => "PAYMONGO_RECHECK_FAILED",
                    "message" =>
                        "FoodConnect could not confirm whether the online payment was still in progress. The order was not cancelled."
                ];
            }

            $recheckAttributes =
                $recheckResult["body"]["data"]["attributes"] ?? null;

            if (!is_array($recheckAttributes)) {
                return [
                    "safe_to_cancel" => false,
                    "http_status" => 502,
                    "error_code" => "PAYMONGO_RECHECK_INVALID",
                    "message" =>
                        "FoodConnect could not confirm the online payment state. The order was not cancelled."
                ];
            }

            if (paymongo_checkout_has_paid_payment($recheckAttributes)) {
                return [
                    "safe_to_cancel" => false,
                    "http_status" => 409,
                    "error_code" => "PAYMONGO_PAYMENT_ALREADY_PAID",
                    "message" =>
                        "This online payment has already been completed or is being confirmed. The order cannot be cancelled automatically."
                ];
            }

            $recheckStatus = strtolower(
                trim((string)($recheckAttributes["status"] ?? ""))
            );

            if ($recheckStatus === "expired") {
                mark_foodconnect_payment_cancelled($conn, $paymentId);
                continue;
            }

            return [
                "safe_to_cancel" => false,
                "http_status" => 409,
                "error_code" => "PAYMONGO_PAYMENT_IN_PROGRESS",
                "message" =>
                    "The customer may already be completing this QR Ph payment. The order was not cancelled. Please wait for payment confirmation."
            ];
        }

        error_log(
            "PayMongo lifecycle expire HTTP " .
            $expireHttpCode .
            " for " .
            $sessionId
        );

        return [
            "safe_to_cancel" => false,
            "http_status" => 502,
            "error_code" => "PAYMONGO_EXPIRE_FAILED",
            "message" =>
                "FoodConnect could not safely close the online payment session. The order was not cancelled."
        ];
    }

    return [
        "safe_to_cancel" => true,
        "http_status" => 200,
        "error_code" => null,
        "message" => "Pending PayMongo checkout sessions were safely closed."
    ];
}
