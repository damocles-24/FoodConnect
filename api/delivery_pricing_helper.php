<?php

declare(strict_types=1);

/**
 * FoodConnect delivery-pricing helper.
 *
 * Backward compatibility:
 * - tbl_restaurants.delivery_fee remains the legacy/fallback fee.
 * - old restaurants without a pricing-settings row behave as fixed-fee.
 * - checkout never trusts a delivery fee sent by JavaScript.
 */

function fc_delivery_pricing_type(mixed $value): string
{
    $type = strtolower(trim((string)$value));

    return in_array($type, ["fixed", "distance", "tiered"], true)
        ? $type
        : "fixed";
}

function fc_delivery_pricing_money(mixed $value, string $field): float
{
    if (!is_numeric($value)) {
        throw new InvalidArgumentException($field . " must be a valid amount.");
    }

    $amount = round((float)$value, 2);

    if (!is_finite($amount) || $amount < 0 || $amount > 9999) {
        throw new InvalidArgumentException($field . " must be from ₱0.00 to ₱9,999.00.");
    }

    return $amount;
}

function fc_delivery_pricing_positive_km(mixed $value, string $field): float
{
    if (!is_numeric($value)) {
        throw new InvalidArgumentException($field . " must be a valid distance.");
    }

    $km = round((float)$value, 2);

    if (!is_finite($km) || $km <= 0 || $km > 100) {
        throw new InvalidArgumentException($field . " must be greater than 0 and not exceed 100 km.");
    }

    return $km;
}

function fc_delivery_pricing_normalize(
    array $input,
    float $fallbackFee = 0.0,
    bool $deliveryEnabled = true
): array {
    if (!$deliveryEnabled) {
        $pricing = [
            "pricing_type" => "fixed",
            "legacy_fee" => 0.0,
            "base_fee" => 0.0,
            "included_km" => null,
            "extra_fee_per_km" => null,
            "tiers" => []
        ];

        $pricing["pricing_json"] = json_encode(
            [
                "fixed_fee" => 0.0
            ],
            JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES
        );

        return $pricing;
    }

    $nested = $input["delivery_pricing"] ?? [];
    if (!is_array($nested)) {
        $nested = [];
    }

    $type = fc_delivery_pricing_type(
        $input["delivery_pricing_type"]
            ?? $nested["pricing_type"]
            ?? $input["pricing_type"]
            ?? "fixed"
    );

    if ($type === "distance") {
        $baseFee = fc_delivery_pricing_money(
            $nested["base_fee"]
                ?? $input["base_fee"]
                ?? $input["delivery_fee"]
                ?? $fallbackFee,
            "Base delivery fee"
        );

        $includedKm = fc_delivery_pricing_positive_km(
            $nested["included_km"]
                ?? $input["included_km"]
                ?? 5,
            "Included distance"
        );

        $extraFee = fc_delivery_pricing_money(
            $nested["extra_fee_per_km"]
                ?? $input["extra_fee_per_km"]
                ?? 0,
            "Additional fee per kilometer"
        );

        if ($extraFee <= 0) {
            throw new InvalidArgumentException(
                "Additional fee per kilometer must be greater than ₱0.00 for distance-based pricing."
            );
        }

        $pricingData = [
            "base_fee" => $baseFee,
            "included_km" => $includedKm,
            "extra_fee_per_km" => $extraFee,
            "rounding" => "ceil_extra_km"
        ];

        return [
            "pricing_type" => "distance",
            "legacy_fee" => $baseFee,
            "base_fee" => $baseFee,
            "included_km" => $includedKm,
            "extra_fee_per_km" => $extraFee,
            "tiers" => [],
            "pricing_json" => json_encode(
                $pricingData,
                JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES
            )
        ];
    }

    if ($type === "tiered") {
        $rawTiers = $nested["tiers"] ?? $input["tiers"] ?? [];

        if (!is_array($rawTiers)) {
            $rawTiers = [];
        }

        if (count($rawTiers) < 1 || count($rawTiers) > 10) {
            throw new InvalidArgumentException(
                "Tiered delivery pricing must contain between 1 and 10 distance tiers."
            );
        }

        $tiers = [];
        $previousMax = 0.0;

        foreach ($rawTiers as $index => $tier) {
            if (!is_array($tier)) {
                throw new InvalidArgumentException("Each delivery tier must be valid.");
            }

            $upToKm = fc_delivery_pricing_positive_km(
                $tier["up_to_km"] ?? null,
                "Tier " . ($index + 1) . " distance"
            );

            if ($upToKm <= $previousMax) {
                throw new InvalidArgumentException(
                    "Delivery tier distances must increase from one tier to the next."
                );
            }

            $fee = fc_delivery_pricing_money(
                $tier["fee"] ?? null,
                "Tier " . ($index + 1) . " fee"
            );

            $tiers[] = [
                "up_to_km" => $upToKm,
                "fee" => $fee
            ];

            $previousMax = $upToKm;
        }

        $firstFee = (float)$tiers[0]["fee"];

        return [
            "pricing_type" => "tiered",
            "legacy_fee" => $firstFee,
            "base_fee" => $firstFee,
            "included_km" => null,
            "extra_fee_per_km" => null,
            "tiers" => $tiers,
            "pricing_json" => json_encode(
                ["tiers" => $tiers],
                JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES
            )
        ];
    }

    $fixedFee = fc_delivery_pricing_money(
        $nested["fixed_fee"]
            ?? $input["delivery_fee"]
            ?? $input["fixed_fee"]
            ?? $fallbackFee,
        "Delivery fee"
    );

    return [
        "pricing_type" => "fixed",
        "legacy_fee" => $fixedFee,
        "base_fee" => $fixedFee,
        "included_km" => null,
        "extra_fee_per_km" => null,
        "tiers" => [],
        "pricing_json" => json_encode(
            ["fixed_fee" => $fixedFee],
            JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES
        )
    ];
}

function fc_delivery_pricing_geocode_address(string $address): array
{
    $address = trim($address);

    if ($address === "") {
        throw new RuntimeException("Restaurant address is required for distance-based delivery pricing.");
    }

    $configFile = __DIR__ . "/config/geoapify.local.php";

    if (!is_file($configFile)) {
        throw new RuntimeException("Geoapify configuration is missing.");
    }

    $config = require $configFile;
    $apiKey = trim((string)($config["api_key"] ?? ""));

    if ($apiKey === "" || $apiKey === "PASTE_YOUR_GEOAPIFY_API_KEY_HERE") {
        throw new RuntimeException("Geoapify API key is not configured.");
    }

    $url = "https://api.geoapify.com/v1/geocode/search?" . http_build_query([
        "text" => $address,
        "filter" => "countrycode:ph",
        "limit" => 1,
        "format" => "json",
        "apiKey" => $apiKey
    ]);

    $curl = curl_init();
    if ($curl === false) {
        throw new RuntimeException("Unable to initialize the location service.");
    }

    curl_setopt_array($curl, [
        CURLOPT_URL => $url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_CONNECTTIMEOUT => 8,
        CURLOPT_TIMEOUT => 15,
        CURLOPT_HTTPHEADER => ["Accept: application/json"],
        CURLOPT_SSL_VERIFYPEER => true,
        CURLOPT_SSL_VERIFYHOST => 2
    ]);

    $body = curl_exec($curl);
    $error = curl_error($curl);
    $status = (int)curl_getinfo($curl, CURLINFO_HTTP_CODE);
    curl_close($curl);

    if ($body === false || $status < 200 || $status >= 300) {
        error_log(
            "FoodConnect delivery pricing geocode failed. HTTP=" . $status .
            " cURL=" . $error
        );
        throw new RuntimeException(
            "FoodConnect could not locate the restaurant address. Please review the address and try again."
        );
    }

    $decoded = json_decode((string)$body, true);
    $result = is_array($decoded) ? ($decoded["results"][0] ?? null) : null;

    if (!is_array($result)) {
        throw new RuntimeException(
            "FoodConnect could not locate the restaurant address. Please review the address and try again."
        );
    }

    $lat = filter_var($result["lat"] ?? null, FILTER_VALIDATE_FLOAT);
    $lon = filter_var($result["lon"] ?? null, FILTER_VALIDATE_FLOAT);

    if (
        $lat === false ||
        $lon === false ||
        $lat < -90 || $lat > 90 ||
        $lon < -180 || $lon > 180
    ) {
        throw new RuntimeException("The restaurant address returned invalid coordinates.");
    }

    return [
        "latitude" => (float)$lat,
        "longitude" => (float)$lon
    ];
}

function fc_delivery_pricing_haversine_km(
    float $lat1,
    float $lon1,
    float $lat2,
    float $lon2
): float {
    $earthRadiusKm = 6371.0088;

    $lat1Rad = deg2rad($lat1);
    $lat2Rad = deg2rad($lat2);
    $deltaLat = deg2rad($lat2 - $lat1);
    $deltaLon = deg2rad($lon2 - $lon1);

    $a = sin($deltaLat / 2) ** 2 +
        cos($lat1Rad) * cos($lat2Rad) * sin($deltaLon / 2) ** 2;

    $c = 2 * atan2(sqrt($a), sqrt(max(0.0, 1 - $a)));

    return $earthRadiusKm * $c;
}

function fc_delivery_pricing_get_active(
    mysqli $conn,
    int $restaurantId,
    float $fallbackFee
): array {
    $fallback = [
        "pricing_type" => "fixed",
        "base_fee" => max(0.0, round($fallbackFee, 2)),
        "included_km" => null,
        "extra_fee_per_km" => null,
        "tiers" => [],
        "restaurant_latitude" => null,
        "restaurant_longitude" => null
    ];

    $stmt = null;

    try {
        $stmt = $conn->prepare("
            SELECT
                pricing_type,
                base_fee,
                included_km,
                extra_fee_per_km,
                tiers_json,
                restaurant_latitude,
                restaurant_longitude
            FROM tbl_restaurant_delivery_settings
            WHERE restaurant_id = ?
            LIMIT 1
        ");

        if (!$stmt) {
            return $fallback;
        }

        $stmt->bind_param("i", $restaurantId);

        if (!$stmt->execute()) {
            $stmt->close();
            return $fallback;
        }

        $row = $stmt->get_result()->fetch_assoc();
        $stmt->close();
        $stmt = null;

        if (!$row) {
            return $fallback;
        }

        $tiers = json_decode((string)($row["tiers_json"] ?? ""), true);
        if (!is_array($tiers)) {
            $tiers = [];
        }

        return [
            "pricing_type" => fc_delivery_pricing_type($row["pricing_type"] ?? "fixed"),
            "base_fee" => max(0.0, (float)($row["base_fee"] ?? $fallbackFee)),
            "included_km" => $row["included_km"] !== null
                ? (float)$row["included_km"]
                : null,
            "extra_fee_per_km" => $row["extra_fee_per_km"] !== null
                ? (float)$row["extra_fee_per_km"]
                : null,
            "tiers" => $tiers,
            "restaurant_latitude" => $row["restaurant_latitude"] !== null
                ? (float)$row["restaurant_latitude"]
                : null,
            "restaurant_longitude" => $row["restaurant_longitude"] !== null
                ? (float)$row["restaurant_longitude"]
                : null
        ];
    } catch (Throwable $error) {
        if ($stmt instanceof mysqli_stmt) {
            try {
                $stmt->close();
            } catch (Throwable $closeError) {
                // Ignore close errors while falling back to the legacy fee.
            }
        }

        error_log(
            "FoodConnect delivery pricing fallback: " .
            $error->getMessage()
        );

        return $fallback;
    }
}

function fc_delivery_pricing_upsert_active(
    mysqli $conn,
    int $restaurantId,
    array $pricing,
    ?float $restaurantLatitude = null,
    ?float $restaurantLongitude = null
): void {
    $tiersJson = json_encode(
        $pricing["tiers"] ?? [],
        JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES
    );

    if ($tiersJson === false) {
        throw new RuntimeException("Unable to encode delivery pricing tiers.");
    }

    $type = fc_delivery_pricing_type($pricing["pricing_type"] ?? "fixed");
    $baseFee = (float)($pricing["base_fee"] ?? $pricing["legacy_fee"] ?? 0);
    $includedKm = $pricing["included_km"] ?? null;
    $extraFee = $pricing["extra_fee_per_km"] ?? null;

    $stmt = $conn->prepare("
        INSERT INTO tbl_restaurant_delivery_settings (
            restaurant_id,
            pricing_type,
            base_fee,
            included_km,
            extra_fee_per_km,
            tiers_json,
            restaurant_latitude,
            restaurant_longitude
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
            pricing_type = VALUES(pricing_type),
            base_fee = VALUES(base_fee),
            included_km = VALUES(included_km),
            extra_fee_per_km = VALUES(extra_fee_per_km),
            tiers_json = VALUES(tiers_json),
            restaurant_latitude = VALUES(restaurant_latitude),
            restaurant_longitude = VALUES(restaurant_longitude)
    ");

    if (!$stmt) {
        throw new RuntimeException("Unable to prepare delivery pricing settings.");
    }

    $stmt->bind_param(
        "isdddsdd",
        $restaurantId,
        $type,
        $baseFee,
        $includedKm,
        $extraFee,
        $tiersJson,
        $restaurantLatitude,
        $restaurantLongitude
    );

    if (!$stmt->execute()) {
        $message = $stmt->error;
        $stmt->close();
        throw new RuntimeException("Unable to save delivery pricing settings: " . $message);
    }

    $stmt->close();
}

function fc_delivery_pricing_calculate(
    mysqli $conn,
    int $restaurantId,
    float $customerLatitude,
    float $customerLongitude
): array {
    if (
        $customerLatitude < -90 || $customerLatitude > 90 ||
        $customerLongitude < -180 || $customerLongitude > 180
    ) {
        throw new InvalidArgumentException("Invalid delivery location coordinates.");
    }

    $stmt = $conn->prepare("
        SELECT address, delivery_fee
        FROM tbl_restaurants
        WHERE restaurant_id = ?
        LIMIT 1
    ");

    if (!$stmt) {
        throw new RuntimeException("Unable to load restaurant delivery pricing.");
    }

    $stmt->bind_param("i", $restaurantId);
    $stmt->execute();
    $restaurant = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    if (!$restaurant) {
        throw new RuntimeException("Restaurant not found.");
    }

    $fallbackFee = max(0.0, (float)($restaurant["delivery_fee"] ?? 0));
    $settings = fc_delivery_pricing_get_active($conn, $restaurantId, $fallbackFee);
    $type = fc_delivery_pricing_type($settings["pricing_type"] ?? "fixed");

    if ($type === "fixed") {
        $fee = max(0.0, round((float)$settings["base_fee"], 2));

        return [
            "pricing_type" => "fixed",
            "delivery_fee" => $fee,
            "distance_km" => null,
            "pricing_label" => "Fixed delivery fee"
        ];
    }

    $restaurantLatitude = $settings["restaurant_latitude"];
    $restaurantLongitude = $settings["restaurant_longitude"];

    if (
        !is_float($restaurantLatitude) ||
        !is_float($restaurantLongitude)
    ) {
        $coordinates = fc_delivery_pricing_geocode_address(
            (string)($restaurant["address"] ?? "")
        );

        $restaurantLatitude = $coordinates["latitude"];
        $restaurantLongitude = $coordinates["longitude"];

        $update = $conn->prepare("
            UPDATE tbl_restaurant_delivery_settings
            SET restaurant_latitude = ?, restaurant_longitude = ?
            WHERE restaurant_id = ?
            LIMIT 1
        ");

        if ($update) {
            $update->bind_param(
                "ddi",
                $restaurantLatitude,
                $restaurantLongitude,
                $restaurantId
            );
            $update->execute();
            $update->close();
        }
    }

    $distanceKm = fc_delivery_pricing_haversine_km(
        (float)$restaurantLatitude,
        (float)$restaurantLongitude,
        $customerLatitude,
        $customerLongitude
    );

    if ($type === "distance") {
        $baseFee = max(0.0, (float)($settings["base_fee"] ?? 0));
        $includedKm = max(0.01, (float)($settings["included_km"] ?? 0));
        $extraFee = max(0.0, (float)($settings["extra_fee_per_km"] ?? 0));

        $extraKm = max(0, (int)ceil(max(0.0, $distanceKm - $includedKm - 0.000001)));
        $fee = round($baseFee + ($extraKm * $extraFee), 2);

        return [
            "pricing_type" => "distance",
            "delivery_fee" => $fee,
            "distance_km" => round($distanceKm, 2),
            "included_km" => $includedKm,
            "extra_km_charged" => $extraKm,
            "pricing_label" => "Distance-based delivery fee"
        ];
    }

    $tiers = is_array($settings["tiers"] ?? null)
        ? $settings["tiers"]
        : [];

    foreach ($tiers as $tier) {
        if (!is_array($tier)) {
            continue;
        }

        $upToKm = (float)($tier["up_to_km"] ?? 0);
        $fee = (float)($tier["fee"] ?? 0);

        if ($upToKm > 0 && $distanceKm <= $upToKm + 0.000001) {
            return [
                "pricing_type" => "tiered",
                "delivery_fee" => round(max(0.0, $fee), 2),
                "distance_km" => round($distanceKm, 2),
                "matched_tier_up_to_km" => $upToKm,
                "pricing_label" => "Distance-tier delivery fee"
            ];
        }
    }

    throw new DomainException(
        "The selected delivery location is outside this restaurant's configured delivery range."
    );
}
