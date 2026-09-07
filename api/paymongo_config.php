<?php

/*
|--------------------------------------------------------------------------
| FoodConnect PayMongo Configuration Loader
|--------------------------------------------------------------------------
|
| PayMongo secrets are loaded from the existing FoodConnect .env system via:
|     api/config/env.php
|
| Required .env values:
|     PAYMONGO_SECRET_KEY="sk_test_..." or "sk_live_..."
|     PAYMONGO_WEBHOOK_SECRET="..."
|
| The environment is detected from the secret-key prefix:
|     sk_test_...  => Test Mode
|     sk_live_...  => Live Mode
|
*/

require_once __DIR__ . "/config/env.php";

/*
|--------------------------------------------------------------------------
| Accessors
|--------------------------------------------------------------------------
*/

if (!function_exists("paymongo_secret_key")) {
    function paymongo_secret_key(): string
    {
        return trim(
            (string)($_ENV["PAYMONGO_SECRET_KEY"] ?? "")
        );
    }
}

if (!function_exists("paymongo_webhook_secret")) {
    function paymongo_webhook_secret(): string
    {
        return trim(
            (string)($_ENV["PAYMONGO_WEBHOOK_SECRET"] ?? "")
        );
    }
}

if (!function_exists("paymongo_is_live")) {
    function paymongo_is_live(): bool
    {
        return strpos(
            paymongo_secret_key(),
            "sk_live_"
        ) === 0;
    }
}

if (!function_exists("paymongo_mode")) {
    function paymongo_mode(): string
    {
        return paymongo_is_live()
            ? "live"
            : "test";
    }
}

/*
|--------------------------------------------------------------------------
| Validate configuration
|--------------------------------------------------------------------------
*/

$paymongoSecretKey = paymongo_secret_key();

if ($paymongoSecretKey === "") {
    throw new RuntimeException(
        "PAYMONGO_SECRET_KEY is not configured in the FoodConnect .env file."
    );
}

$paymongoIsTest =
    strpos($paymongoSecretKey, "sk_test_") === 0;

$paymongoIsLive =
    strpos($paymongoSecretKey, "sk_live_") === 0;

if (!$paymongoIsTest && !$paymongoIsLive) {
    throw new RuntimeException(
        "PAYMONGO_SECRET_KEY must be a valid PayMongo test or live secret key."
    );
}

/*
| In live mode, fail closed if webhook verification is not configured.
| This prevents FoodConnect from accepting real QR Ph payments without a
| working PayMongo webhook signature secret.
*/
if (
    $paymongoIsLive &&
    paymongo_webhook_secret() === ""
) {
    throw new RuntimeException(
        "PAYMONGO_WEBHOOK_SECRET is required in live mode."
    );
}
