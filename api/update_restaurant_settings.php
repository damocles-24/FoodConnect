<?php
header("Content-Type: application/json; charset=utf-8");
require_once __DIR__ . "/session_config.php";

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

$data = json_decode(file_get_contents("php://input"), true);

$name = trim($data["name"] ?? "");
$address = trim($data["address"] ?? "");
$contact_number = trim($data["contact_number"] ?? "");
$opening_hours = trim($data["opening_hours"] ?? "");
$delivery_fee = isset($data["delivery_fee"]) ? (float)$data["delivery_fee"] : 0;
$business_status = trim($data["business_status"] ?? "Open");

$allowed_status = ["Open", "Closed", "Temporarily Unavailable"];

if (
    $name === "" ||
    $address === "" ||
    $contact_number === "" ||
    $opening_hours === "" ||
    $delivery_fee < 0 ||
    !in_array($business_status, $allowed_status)
) {
    echo json_encode([
        "success" => false,
        "message" => "Please complete all settings fields correctly."
    ]);
    exit;
}

try {
    $sql = "
        UPDATE tbl_restaurants
        SET
            name = ?,
            address = ?,
            contact_number = ?,
            opening_hours = ?,
            delivery_fee = ?,
            business_status = ?
        WHERE restaurant_id = ?
    ";

    $stmt = $conn->prepare($sql);

    if (!$stmt) {
        throw new Exception($conn->error);
    }

    $stmt->bind_param(
        "ssssdsi",
        $name,
        $address,
        $contact_number,
        $opening_hours,
        $delivery_fee,
        $business_status,
        $restaurant_id
    );

    $stmt->execute();

    echo json_encode([
        "success" => true,
        "message" => "Restaurant settings updated successfully."
    ]);

} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => "Failed to update restaurant settings.",
        "error" => $e->getMessage()
    ]);
}