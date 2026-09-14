<?php

/*
|--------------------------------------------------------------------------
| FoodConnect PayMongo Configuration Loader
|--------------------------------------------------------------------------
|
| Supports one PayMongo account per restaurant while remaining backward
| compatible with the older single-account configuration.
|
| Recommended multi-account .env names:
|
|   PAYMONGO_MULTI_ACCOUNT="true"
|   PAYMONGO_RESTAURANT_6_SECRET_KEY="sk_test_..."
|   PAYMONGO_RESTAURANT_6_WEBHOOK_SECRET="..."
|   PAYMONGO_RESTAURANT_8_SECRET_KEY="sk_test_..."
|   PAYMONGO_RESTAURANT_8_WEBHOOK_SECRET="..."
|   PAYMONGO_RESTAURANT_9_SECRET_KEY="sk_test_..."
|   PAYMONGO_RESTAURANT_9_WEBHOOK_SECRET="..."
|
| Only the server reads these secrets. Never expose them to JavaScript.
|
| Legacy single-account values remain supported when multi-account mode is
| not enabled:
|   PAYMONGO_SECRET_KEY="sk_test_..."
|   PAYMONGO_WEBHOOK_SECRET="..."
|
*/

require_once __DIR__ . "/config/env.php";

if (!function_exists("paymongo_truthy")) {
    function paymongo_truthy($value): bool
    {
        return in_array(
            strtolower(trim((string)$value)),
            ["1", "true", "yes", "on"],
            true
        );
    }
}

if (!function_exists("paymongo_set_restaurant_context")) {
    function paymongo_set_restaurant_context(int $restaurantId): void
    {
        $GLOBALS["FOODCONNECT_PAYMONGO_RESTAURANT_ID"] =
            max(0, $restaurantId);
    }
}

if (!function_exists("paymongo_restaurant_context")) {
    function paymongo_restaurant_context(): int
    {
        return max(
            0,
            (int)($GLOBALS["FOODCONNECT_PAYMONGO_RESTAURANT_ID"] ?? 0)
        );
    }
}

if (!function_exists("paymongo_has_any_restaurant_key")) {
    function paymongo_has_any_restaurant_key(): bool
    {
        foreach ($_ENV as $key => $value) {
            if (
                preg_match(
                    '/^PAYMONGO_RESTAURANT_\d+_SECRET_KEY$/',
                    (string)$key
                ) === 1 &&
                trim((string)$value) !== ""
            ) {
                return true;
            }
        }

        return false;
    }
}

if (!function_exists("paymongo_multi_account_mode")) {
    function paymongo_multi_account_mode(): bool
    {
        return paymongo_truthy(
            $_ENV["PAYMONGO_MULTI_ACCOUNT"] ?? ""
        ) || paymongo_has_any_restaurant_key();
    }
}

if (!function_exists("paymongo_restaurant_env_value")) {
    function paymongo_restaurant_env_value(
        int $restaurantId,
        string $suffix
    ): string {
        if ($restaurantId <= 0) {
            return "";
        }

        $suffix = strtoupper(trim($suffix));

        $candidates = [
            "PAYMONGO_RESTAURANT_{$restaurantId}_{$suffix}",
            "PAYMONGO_{$suffix}_RESTAURANT_{$restaurantId}",
            "PAYMONGO_R{$restaurantId}_{$suffix}"
        ];

        foreach ($candidates as $key) {
            $value = trim((string)($_ENV[$key] ?? ""));

            if ($value !== "") {
                return $value;
            }
        }

        return "";
    }
}

if (!function_exists("paymongo_secret_key")) {
    function paymongo_secret_key(?int $restaurantId = null): string
    {
        $restaurantId = $restaurantId ?? paymongo_restaurant_context();

        if ($restaurantId > 0) {
            $restaurantKey = paymongo_restaurant_env_value(
                $restaurantId,
                "SECRET_KEY"
            );

            if ($restaurantKey !== "") {
                return $restaurantKey;
            }

            /*
             * In multi-account mode, never silently fall back to another
             * restaurant's/global account. This prevents misdirected funds.
             */
            if (paymongo_multi_account_mode()) {
                return "";
            }
        }

        return trim((string)($_ENV["PAYMONGO_SECRET_KEY"] ?? ""));
    }
}

if (!function_exists("paymongo_webhook_secret")) {
    function paymongo_webhook_secret(?int $restaurantId = null): string
    {
        $restaurantId = $restaurantId ?? paymongo_restaurant_context();

        if ($restaurantId > 0) {
            $restaurantSecret = paymongo_restaurant_env_value(
                $restaurantId,
                "WEBHOOK_SECRET"
            );

            if ($restaurantSecret !== "") {
                return $restaurantSecret;
            }

            if (paymongo_multi_account_mode()) {
                return "";
            }
        }

        return trim((string)($_ENV["PAYMONGO_WEBHOOK_SECRET"] ?? ""));
    }
}

if (!function_exists("paymongo_key_is_valid")) {
    function paymongo_key_is_valid(string $secretKey): bool
    {
        return strpos($secretKey, "sk_test_") === 0 ||
            strpos($secretKey, "sk_live_") === 0;
    }
}

if (!function_exists("paymongo_is_live")) {
    function paymongo_is_live(?int $restaurantId = null): bool
    {
        return strpos(
            paymongo_secret_key($restaurantId),
            "sk_live_"
        ) === 0;
    }
}

if (!function_exists("paymongo_mode")) {
    function paymongo_mode(?int $restaurantId = null): string
    {
        return paymongo_is_live($restaurantId)
            ? "live"
            : "test";
    }
}

if (!function_exists("paymongo_validate_configuration")) {
    function paymongo_validate_configuration(
        ?int $restaurantId = null,
        bool $requireWebhook = false
    ): void {
        $restaurantId = $restaurantId ?? paymongo_restaurant_context();
        $secretKey = paymongo_secret_key($restaurantId);

        if ($secretKey === "") {
            $target = $restaurantId > 0
                ? " for restaurant #{$restaurantId}"
                : "";

            throw new RuntimeException(
                "PAYMONGO_SECRET_KEY is not configured{$target}."
            );
        }

        if (!paymongo_key_is_valid($secretKey)) {
            throw new RuntimeException(
                "The configured PayMongo secret key is invalid."
            );
        }

        /*
         * Real payments must fail closed when webhook verification is not
         * available. In test mode, webhook is still strongly recommended,
         * but manual status sync may be used during development.
         */
        if (
            ($requireWebhook || paymongo_is_live($restaurantId)) &&
            paymongo_is_live($restaurantId) &&
            paymongo_webhook_secret($restaurantId) === ""
        ) {
            throw new RuntimeException(
                "PAYMONGO_WEBHOOK_SECRET is required for live mode."
            );
        }
    }
}

if (!function_exists("paymongo_qrph_available")) {
    function paymongo_qrph_available(
        int $restaurantId,
        bool $requireProductionWebhook = true
    ): bool {
        if ($restaurantId <= 0) {
            return false;
        }

        $secretKey = paymongo_secret_key($restaurantId);

        if (!paymongo_key_is_valid($secretKey)) {
            return false;
        }

        if (
            $requireProductionWebhook &&
            strpos($secretKey, "sk_live_") === 0 &&
            paymongo_webhook_secret($restaurantId) === ""
        ) {
            return false;
        }

        return true;
    }
}
