<?php
header("Content-Type: application/json; charset=utf-8");
header("Cache-Control: no-store, no-cache, must-revalidate");
header("Pragma: no-cache");

error_reporting(E_ALL & ~E_NOTICE & ~E_WARNING);
ini_set("display_errors", "0");

if (session_status() !== PHP_SESSION_ACTIVE) {
    session_set_cookie_params([
        "lifetime" => 0,
        "path" => "/capshit",
        "domain" => "",
        "secure" => false,
        "httponly" => true,
        "samesite" => "Lax"
    ]);

    session_start();
}

require_once __DIR__ . "/db.php";

if (!isset($_SESSION["user_id"])) {
    http_response_code(401);
    echo json_encode([
        "success" => false,
        "message" => "Unauthorized access."
    ]);
    exit;
}

$restaurant_id = isset($_SESSION["restaurant_id"])
    ? (int) $_SESSION["restaurant_id"]
    : 0;

if ($restaurant_id <= 0) {
    echo json_encode([
        "success" => false,
        "message" => "Invalid restaurant session."
    ]);
    exit;
}

try {
    $sql = "
        SELECT
            restaurant_id,
            name,
            address,
            contact_number,
            opening_hours,
            delivery_fee,
            business_status
        FROM tbl_restaurants
        WHERE restaurant_id = ?
        LIMIT 1
    ";

    $stmt = $conn->prepare($sql);

    if (!$stmt) {
        throw new Exception($conn->error);
    }

    $stmt->bind_param("i", $restaurant_id);
    $stmt->execute();

    $result = $stmt->get_result();
    $restaurant = $result->fetch_assoc();

    if (!$restaurant) {
        echo json_encode([
            "success" => false,
            "message" => "Restaurant not found."
        ]);
        exit;
    }

    echo json_encode([
        "success" => true,
        "restaurant" => $restaurant
    ]);

} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => "Failed to load restaurant settings.",
        "error" => $e->getMessage()
    ]);
}