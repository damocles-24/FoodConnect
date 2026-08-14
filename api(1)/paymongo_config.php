<?php

/*
|--------------------------------------------------------------------------
| FoodConnect PayMongo Configuration Loader
|--------------------------------------------------------------------------
|
| IMPORTANT:
| - Keep the real PayMongo secret key ONLY in:
|     api/config/paymongo.local.php
| - Do not commit that local file to Git.
| - Test Mode is intentionally required for this first integration step.
|
*/

$paymongoLocalConfig =
    __DIR__ . "/config/paymongo.local.php";

if (!file_exists($paymongoLocalConfig)) {
    throw new RuntimeException(
        "PayMongo local configuration is missing. " .
        "Create api/config/paymongo.local.php from " .
        "api/config/paymongo.local.example.php."
    );
}

require $paymongoLocalConfig;

if (
    !defined("PAYMONGO_SECRET_KEY") ||
    trim((string)PAYMONGO_SECRET_KEY) === ""
) {
    throw new RuntimeException(
        "PAYMONGO_SECRET_KEY is not configured."
    );
}

if (
    strpos(
        trim((string)PAYMONGO_SECRET_KEY),
        "sk_test_"
    ) !== 0
) {
    throw new RuntimeException(
        "FoodConnect Step 1 only accepts a PayMongo TEST secret key."
    );
}


/* Optional PayMongo webhook secret. */
if (defined("PAYMONGO_WEBHOOK_SECRET")) {
    $paymongoWebhookSecret = trim((string)PAYMONGO_WEBHOOK_SECRET);
}
