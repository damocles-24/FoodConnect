<?php

/**
 * Build absolute FoodConnect URLs without hard-coding localhost.
 *
 * Production can explicitly set FOODCONNECT_APP_URL, for example:
 *   https://foodconnect.example.com/FoodConnect
 *
 * When it is not set, the helper derives the scheme/host from the current
 * request and keeps the existing /FoodConnect deployment path.
 */
function foodconnect_base_url(): string
{
    $configured = trim((string) getenv("FOODCONNECT_APP_URL"));

    if ($configured !== "") {
        if (preg_match('#^https?://#i', $configured)) {
            return rtrim($configured, "/");
        }

        error_log("FoodConnect ignored invalid FOODCONNECT_APP_URL; expected http:// or https://.");
    }

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

    $host = trim((string) ($_SERVER["SERVER_NAME"] ?? ""));
    $port = (int) ($_SERVER["SERVER_PORT"] ?? 0);

    if ($host === "") {
        $hostHeader = trim((string) ($_SERVER["HTTP_HOST"] ?? ""));

        if (preg_match('/^[A-Za-z0-9.-]+(?::[0-9]{1,5})?$/', $hostHeader)) {
            $host = $hostHeader;
        }
    }

    if ($host === "") {
        $host = "localhost";
    }

    if (
        strpos($host, ":") === false &&
        $port > 0 &&
        !(($scheme === "http" && $port === 80) || ($scheme === "https" && $port === 443))
    ) {
        $host .= ":" . $port;
    }

    return $scheme . "://" . $host . "/FoodConnect";
}

function foodconnect_url(string $path, array $query = []): string
{
    $url = foodconnect_base_url() . "/" . ltrim($path, "/");

    if ($query !== []) {
        $url .= "?" . http_build_query($query, "", "&", PHP_QUERY_RFC3986);
    }

    return $url;
}
