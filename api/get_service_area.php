<?php

declare(strict_types=1);

/**
 * Public, read-only FoodConnect service-area definition.
 * The browser uses it for instant feedback; every write endpoint still
 * re-validates with service_area_helper.php.
 */

header("Content-Type: application/json; charset=utf-8");
header("Cache-Control: public, max-age=3600");

require_once __DIR__ . "/service_area_helper.php";

try {
    $config = fc_service_area_config();

    echo json_encode([
        "success" => true,
        "province" => fc_service_area_province(),
        "city" => fc_service_area_city(),
        "country" => (string)($config["country"] ?? "Philippines"),
        "psgc_code" => (string)($config["psgc_code"] ?? ""),
        "postal_code" => (string)($config["postal_code"] ?? ""),
        "center" => $config["center"] ?? null,
        "gps_tolerance_meters" => $config["gps_tolerance_meters"],
        "barangays" => array_values($config["barangays"]),
        "messages" => [
            "area" => fc_service_area_messages("area"),
            "gps" => fc_service_area_messages("gps"),
            "address" => fc_service_area_messages("address"),
            "restaurant" => fc_service_area_messages("restaurant")
        ],
        "boundary" => $config["boundary"]
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
} catch (Throwable $error) {
    error_log("get_service_area.php error: " . $error->getMessage());
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "The FoodConnect service area could not be loaded. Please refresh the page and try again."
    ]);
}
