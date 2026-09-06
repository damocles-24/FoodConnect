<?php

require_once __DIR__ . '/env.php';

define(
    "PAYMONGO_SECRET_KEY",
    $_ENV["PAYMONGO_SECRET_KEY"] ?? ""
);

define(
    "PAYMONGO_WEBHOOK_SECRET",
    $_ENV["PAYMONGO_WEBHOOK_SECRET"] ?? ""
);