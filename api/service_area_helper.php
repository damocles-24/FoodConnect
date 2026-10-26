<?php

declare(strict_types=1);

/**
 * FoodConnect service-area helper.
 *
 * FoodConnect operates only in City of Alaminos, Pangasinan.
 * This helper is the single server-side source of truth for:
 *   - the fixed province / city values
 *   - the official City of Alaminos barangay list
 *   - the City of Alaminos administrative boundary (point-in-polygon)
 *
 * Boundary data: config/service_area_alaminos.json
 * (PSA/NAMRIA 2023 boundary, PSGC 0105503000). The same file is served
 * to the browser through get_service_area.php so frontend and backend
 * always validate against identical data.
 */

const FC_SERVICE_AREA_CODE = "OUTSIDE_SERVICE_AREA";
const FC_SERVICE_AREA_UNVERIFIED_CODE = "LOCATION_NOT_VERIFIED";

function fc_service_area_config(): array
{
    static $config = null;

    if (is_array($config)) {
        return $config;
    }

    $file = __DIR__ . "/config/service_area_alaminos.json";

    if (!is_file($file)) {
        throw new RuntimeException("FoodConnect service-area configuration is missing.");
    }

    $decoded = json_decode((string)file_get_contents($file), true);

    if (
        !is_array($decoded) ||
        !is_array($decoded["boundary"]["coordinates"] ?? null) ||
        !is_array($decoded["barangays"] ?? null)
    ) {
        throw new RuntimeException("FoodConnect service-area configuration is invalid.");
    }

    $minLat = 90.0;
    $maxLat = -90.0;
    $minLng = 180.0;
    $maxLng = -180.0;

    foreach ($decoded["boundary"]["coordinates"] as $polygon) {
        foreach ((array)$polygon as $ring) {
            foreach ((array)$ring as $point) {
                $lng = (float)$point[0];
                $lat = (float)$point[1];
                $minLat = min($minLat, $lat);
                $maxLat = max($maxLat, $lat);
                $minLng = min($minLng, $lng);
                $maxLng = max($maxLng, $lng);
            }
        }
    }

    $decoded["_bbox"] = [$minLat, $minLng, $maxLat, $maxLng];
    /*
     * Frontend-only UX hint: how close (m) a GPS fix outside the boundary
     * must be to get the friendlier "near the boundary" message. The
     * server never uses it to accept a location.
     */
    $decoded["gps_tolerance_meters"] = max(
        0.0,
        min(100.0, (float)($decoded["gps_tolerance_meters"] ?? $decoded["boundary_tolerance_meters"] ?? 50))
    );
    unset($decoded["boundary_tolerance_meters"]);

    $config = $decoded;

    return $config;
}

function fc_service_area_province(): string
{
    return (string)(fc_service_area_config()["province"] ?? "Pangasinan");
}

function fc_service_area_city(): string
{
    return (string)(fc_service_area_config()["city"] ?? "City of Alaminos");
}

function fc_service_area_label(): string
{
    return fc_service_area_city() . ", " . fc_service_area_province();
}

/**
 * Comparison key: lowercase letters/digits only, so "Pocal-Pocal",
 * "Pocalpocal" and "POCAL POCAL" all match.
 */
function fc_service_area_key(string $value): string
{
    $value = strtolower(trim($value));
    $value = preg_replace("/\\b(brgy|barangay|bgy)\\b\\.?/u", " ", $value) ?? $value;
    $value = preg_replace("/\\bsta\\b\\.?/u", "santa", $value) ?? $value;

    return preg_replace("/[^a-z0-9]+/", "", $value) ?? "";
}

function fc_service_area_is_supported_province(string $value): bool
{
    $key = fc_service_area_key(
        preg_replace("/\\bprovince(\\s+of)?\\b/i", " ", $value) ?? $value
    );

    return $key === fc_service_area_key(fc_service_area_province());
}

function fc_service_area_is_supported_city(string $value): bool
{
    $clean = preg_replace("/\\b(city\\s+of|city|municipality\\s+of|municipality)\\b/i", " ", $value) ?? $value;

    return fc_service_area_key($clean) === "alaminos";
}

/**
 * Returns the official barangay name, or null when the barangay does not
 * belong to City of Alaminos.
 */
function fc_service_area_match_barangay(string $value): ?string
{
    $key = fc_service_area_key($value);

    if ($key === "") {
        return null;
    }

    foreach (fc_service_area_config()["barangays"] as $barangay) {
        if (fc_service_area_key((string)$barangay) === $key) {
            return (string)$barangay;
        }
    }

    return null;
}

function fc_service_area_clean_street(string $street): string
{
    $street = trim(preg_replace("/\\s+/u", " ", $street) ?? "");

    return function_exists("mb_substr")
        ? mb_substr($street, 0, 180, "UTF-8")
        : (string)substr($street, 0, 180);
}

/**
 * Canonical stored address:
 * [street, ]Barangay, City of Alaminos, Pangasinan, Philippines
 */
function fc_service_area_build_address(string $street, string $barangay): string
{
    $street = fc_service_area_clean_street($street);

    return implode(", ", array_values(array_filter([
        $street,
        $barangay,
        fc_service_area_city(),
        fc_service_area_province(),
        "Philippines"
    ], static fn ($part): bool => trim((string)$part) !== "")));
}

/**
 * Parses a stored/composed address in the FoodConnect format
 * "[street,] barangay, city, province[, Philippines]".
 *
 * Returns ["street" => ..., "barangay" => <official name>] only when the
 * city is City of Alaminos, the province is Pangasinan and the barangay is
 * an official Alaminos barangay. Otherwise returns null.
 */
function fc_service_area_parse_address(string $address): ?array
{
    $parts = array_values(array_filter(
        array_map("trim", explode(",", $address)),
        static fn ($part): bool => $part !== ""
    ));

    if (!empty($parts) && fc_service_area_key((string)end($parts)) === "philippines") {
        array_pop($parts);
    }

    if (!empty($parts) && preg_match("/^\\d{4}$/", (string)end($parts))) {
        array_pop($parts);
    }

    if (count($parts) < 3) {
        return null;
    }

    $province = (string)array_pop($parts);
    $city = (string)array_pop($parts);
    $barangayRaw = (string)array_pop($parts);

    if (
        !fc_service_area_is_supported_province($province) ||
        !fc_service_area_is_supported_city($city)
    ) {
        return null;
    }

    $barangay = fc_service_area_match_barangay($barangayRaw);

    if ($barangay === null) {
        return null;
    }

    return [
        "street" => fc_service_area_clean_street(implode(", ", $parts)),
        "barangay" => $barangay
    ];
}

/**
 * Resolves a submitted address to the canonical Alaminos address.
 * Prefers explicit structured fields (barangay + street), falls back to
 * parsing the composed address text. Returns null when unsupported.
 */
function fc_service_area_resolve_address(
    string $barangayInput,
    string $streetInput,
    string $addressText
): ?array {
    if (trim($barangayInput) !== "") {
        $barangay = fc_service_area_match_barangay($barangayInput);

        if ($barangay === null) {
            return null;
        }

        $street = fc_service_area_clean_street($streetInput);

        return [
            "street" => $street,
            "barangay" => $barangay,
            "address" => fc_service_area_build_address($street, $barangay)
        ];
    }

    $parsed = fc_service_area_parse_address($addressText);

    if ($parsed === null) {
        return null;
    }

    $parsed["address"] = fc_service_area_build_address(
        $parsed["street"],
        $parsed["barangay"]
    );

    return $parsed;
}

function fc_service_area_point_in_ring(float $lng, float $lat, array $ring): bool
{
    $inside = false;
    $count = count($ring);

    for ($i = 0, $j = $count - 1; $i < $count; $j = $i++) {
        $xi = (float)$ring[$i][0];
        $yi = (float)$ring[$i][1];
        $xj = (float)$ring[$j][0];
        $yj = (float)$ring[$j][1];

        if (
            (($yi > $lat) !== ($yj > $lat)) &&
            ($lng < ($xj - $xi) * ($lat - $yi) / (($yj - $yi) ?: 1e-12) + $xi)
        ) {
            $inside = !$inside;
        }
    }

    return $inside;
}

/**
 * Distance in meters from a point to the nearest boundary edge
 * (local equirectangular projection; accurate at city scale).
 */
function fc_service_area_distance_to_boundary_m(float $lat, float $lng): float
{
    $metersPerDegLat = 111320.0;
    $metersPerDegLng = 111320.0 * cos(deg2rad($lat));
    $best = INF;

    foreach (fc_service_area_config()["boundary"]["coordinates"] as $polygon) {
        foreach ((array)$polygon as $ring) {
            $count = count($ring);

            for ($i = 0; $i < $count - 1; $i++) {
                $ax = ((float)$ring[$i][0] - $lng) * $metersPerDegLng;
                $ay = ((float)$ring[$i][1] - $lat) * $metersPerDegLat;
                $bx = ((float)$ring[$i + 1][0] - $lng) * $metersPerDegLng;
                $by = ((float)$ring[$i + 1][1] - $lat) * $metersPerDegLat;
                $dx = $bx - $ax;
                $dy = $by - $ay;
                $lengthSquared = $dx * $dx + $dy * $dy;
                $t = $lengthSquared > 0
                    ? max(0.0, min(1.0, -($ax * $dx + $ay * $dy) / $lengthSquared))
                    : 0.0;
                $px = $ax + $t * $dx;
                $py = $ay + $t * $dy;
                $best = min($best, sqrt($px * $px + $py * $py));
            }
        }
    }

    return $best;
}

/**
 * Checks coordinates against the official City of Alaminos boundary.
 *
 * ALWAYS STRICT (0 m tolerance). The server never widens the area based on
 * client-submitted values such as location_source or location_accuracy.
 *
 * inside / allowed = strictly inside the official boundary
 * distance_m       = distance to the boundary when outside (null when inside
 *                    or far outside the bounding box); informational only
 */
function fc_service_area_check_point(mixed $latitude, mixed $longitude): array
{
    $result = [
        "valid_coordinates" => false,
        "inside" => false,
        "allowed" => false,
        "distance_m" => null
    ];

    if (!is_numeric($latitude) || !is_numeric($longitude)) {
        return $result;
    }

    $lat = (float)$latitude;
    $lng = (float)$longitude;

    if (
        !is_finite($lat) || !is_finite($lng) ||
        $lat < -90 || $lat > 90 ||
        $lng < -180 || $lng > 180
    ) {
        return $result;
    }

    $result["valid_coordinates"] = true;

    $config = fc_service_area_config();
    [$minLat, $minLng, $maxLat, $maxLng] = $config["_bbox"];

    if ($lat < $minLat || $lat > $maxLat || $lng < $minLng || $lng > $maxLng) {
        return $result;
    }

    foreach ($config["boundary"]["coordinates"] as $polygon) {
        $polygon = (array)$polygon;

        if (empty($polygon) || !fc_service_area_point_in_ring($lng, $lat, (array)$polygon[0])) {
            continue;
        }

        $inHole = false;

        for ($h = 1; $h < count($polygon); $h++) {
            if (fc_service_area_point_in_ring($lng, $lat, (array)$polygon[$h])) {
                $inHole = true;
                break;
            }
        }

        if (!$inHole) {
            $result["inside"] = true;
            $result["allowed"] = true;

            return $result;
        }
    }

    $result["distance_m"] = round(fc_service_area_distance_to_boundary_m($lat, $lng), 1);

    return $result;
}

function fc_service_area_point_allowed(mixed $latitude, mixed $longitude): bool
{
    return fc_service_area_check_point($latitude, $longitude)["allowed"] === true;
}

/**
 * Physical check for a restaurant address: geocodes it (existing Geoapify
 * integration) and requires the point to be strictly inside the boundary.
 *
 * Returns:
 *   ["status" => "inside",      "latitude" => .., "longitude" => ..]
 *   ["status" => "outside",     "latitude" => .., "longitude" => ..]
 *   ["status" => "unavailable"] geocoder not configured / unreachable /
 *                               timed out / no usable result.
 *                               Callers must FAIL CLOSED: a final restaurant
 *                               registration / submission / address change is
 *                               not accepted as verified.
 */
function fc_service_area_verify_restaurant_address(string $address): array
{
    require_once __DIR__ . "/delivery_pricing_helper.php";

    try {
        $point = fc_delivery_pricing_geocode_address($address);
    } catch (Throwable $error) {
        error_log("FoodConnect restaurant location check unavailable: " . $error->getMessage());

        return ["status" => "unavailable"];
    }

    return [
        "status" => fc_service_area_point_allowed($point["latitude"], $point["longitude"])
            ? "inside"
            : "outside",
        "latitude" => (float)$point["latitude"],
        "longitude" => (float)$point["longitude"]
    ];
}

/**
 * User-facing messages. "context" picks the wording:
 *   area       - map / generic delivery location
 *   gps        - Use Exact Location
 *   address    - manually entered / searched address
 *   restaurant - restaurant (partner) location
 */
function fc_service_area_messages(string $context = "area"): array
{
    $label = fc_service_area_label();

    switch ($context) {
        case "gps":
            return [
                "title" => "Location Not Supported",
                "message" => "Your current location is outside FoodConnect's service area. FoodConnect currently serves {$label} only. Please choose a delivery location within " . fc_service_area_city() . "."
            ];
        case "address":
            return [
                "title" => "Address Not Supported",
                "message" => "The address you entered is outside the FoodConnect service area. Please enter an address within {$label}."
            ];
        case "restaurant_unverified":
            return [
                "title" => "Unable to Verify Restaurant Location",
                "message" => "FoodConnect could not verify this restaurant location right now. Please try again."
            ];
        case "restaurant":
            return [
                "title" => "Location Outside Service Area",
                "message" => "FoodConnect currently operates only in {$label}. Please choose a restaurant location within " . fc_service_area_city() . "."
            ];
        default:
            return [
                "title" => "Location Outside Service Area",
                "message" => "FoodConnect currently accepts delivery locations within {$label} only. Please select a location within " . fc_service_area_city() . " to continue."
            ];
    }
}

function fc_service_area_error_payload(string $context = "area", array $extra = []): array
{
    $messages = fc_service_area_messages($context);

    return array_merge([
        "success" => false,
        "code" => $context === "restaurant_unverified"
            ? FC_SERVICE_AREA_UNVERIFIED_CODE
            : FC_SERVICE_AREA_CODE,
        "context" => $context,
        "title" => $messages["title"],
        "message" => $messages["message"],
        "service_area" => fc_service_area_label()
    ], $extra);
}
