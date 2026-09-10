<?php

/**
 * Return an environment value from the sources used by phpdotenv/PHP.
 */
function foodconnect_env_value(string $key): string
{
    $value = $_ENV[$key] ?? $_SERVER[$key] ?? getenv($key);

    if ($value === false || $value === null) {
        return "";
    }

    return trim((string) $value);
}

/**
 * Build the current request origin without any application subdirectory.
 * Example: https://foodconnect.store
 */
function foodconnect_request_origin(): string
{
    $forwardedProto = strtolower(
        trim(
            explode(",", (string) ($_SERVER["HTTP_X_FORWARDED_PROTO"] ?? ""))[0]
        )
    );

    $isHttps =
        $forwardedProto === "https" ||
        (!empty($_SERVER["HTTPS"]) && strtolower((string) $_SERVER["HTTPS"]) !== "off") ||
        (string) ($_SERVER["SERVER_PORT"] ?? "") === "443";

    $scheme = $isHttps ? "https" : "http";

    $forwardedHost = trim(
        explode(",", (string) ($_SERVER["HTTP_X_FORWARDED_HOST"] ?? ""))[0]
    );

    $host = $forwardedHost !== ""
        ? $forwardedHost
        : trim((string) ($_SERVER["HTTP_HOST"] ?? ""));

    if ($host === "") {
        $host = trim((string) ($_SERVER["SERVER_NAME"] ?? ""));
    }

    if ($host === "") {
        return "";
    }

    if (!preg_match('/^[A-Za-z0-9.-]+(?::[0-9]{1,5})?$/', $host)) {
        return "";
    }

    return $scheme . "://" . $host;
}

/**
 * Build the canonical FoodConnect base URL.
 *
 * On a real hosted domain, always use the current domain root. This prevents
 * stale local/development values such as /FoodConnect from leaking into
 * production email links.
 *
 * On localhost, an explicitly configured URL may still contain /FoodConnect
 * because the local project can legitimately live inside that subdirectory.
 */
function foodconnect_base_url(): string
{
    $requestOrigin = foodconnect_request_origin();

    if ($requestOrigin !== "") {
        $requestHost = strtolower((string) parse_url($requestOrigin, PHP_URL_HOST));

        $isLocalRequest = in_array(
            $requestHost,
            ["localhost", "127.0.0.1", "::1"],
            true
        );

        if (!$isLocalRequest) {
            return rtrim($requestOrigin, "/");
        }
    }

    $configured = foodconnect_env_value("FOODCONNECT_APP_URL");

    if ($configured === "") {
        $configured = foodconnect_env_value("APP_URL");
    }

    if ($configured !== "") {
        if (preg_match('#^https?://#i', $configured)) {
            return rtrim($configured, "/");
        }

        error_log(
            "FoodConnect ignored invalid application URL; expected http:// or https://."
        );
    }

    if ($requestOrigin !== "") {
        return rtrim($requestOrigin, "/");
    }

    return "http://localhost";
}

function foodconnect_url(string $path, array $query = []): string
{
    $baseUrl = rtrim(foodconnect_base_url(), "/");

    /*
     * Final production guard: older FoodConnect deployments used the
     * application under /FoodConnect. The live domain now serves the
     * application directly from public_html, so never allow that legacy
     * suffix to leak into generated absolute links.
     */
    $cleanBaseUrl = preg_replace(
        '#/FoodConnect/?$#i',
        '',
        $baseUrl
    );

    if (is_string($cleanBaseUrl) && $cleanBaseUrl !== '') {
        $baseUrl = $cleanBaseUrl;
    }

    $normalizedPath = ltrim($path, "/");

    /* Also protect callers that accidentally pass FoodConnect/... */
    $cleanPath = preg_replace(
        '#^FoodConnect/(?=.+)#i',
        '',
        $normalizedPath
    );

    if (is_string($cleanPath) && $cleanPath !== '') {
        $normalizedPath = $cleanPath;
    }

    $url = $baseUrl . "/" . $normalizedPath;

    if ($query !== []) {
        $url .= "?" . http_build_query(
            $query,
            "",
            "&",
            PHP_QUERY_RFC3986
        );
    }

    return $url;
}

/**
 * Build the canonical account verification URL.
 */
function foodconnect_verification_url(string $token): string
{
    return foodconnect_url(
        "api/verify.php",
        ["token" => $token]
    );
}
