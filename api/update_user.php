<?php

header("Content-Type: application/json; charset=utf-8");

require_once __DIR__ . "/session_config.php";

require_once __DIR__ . "/db.php";
require_once __DIR__ . "/ph_phone.php";

if (!isset($_SESSION["user_id"])) {
    http_response_code(401);
    echo json_encode([
        "success" => false,
        "message" => "Your session has expired or you do not have access. Please log in again."
    ]);
    exit;
}

$sessionRole = strtolower(trim((string)($_SESSION["role"] ?? "")));
if ($sessionRole !== "owner") {
    http_response_code(403);
    echo json_encode([
        "success" => false,
        "message" => "Only the restaurant owner can manage staff accounts."
    ]);
    exit;
}

$restaurant_id = isset($_SESSION["restaurant_id"])
    ? (int) $_SESSION["restaurant_id"]
    : 0;

if ($restaurant_id <= 0) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Your restaurant session has expired. Please log in again."
    ]);
    exit;
}

$ownershipStmt = $conn->prepare("
    SELECT restaurant_id
    FROM tbl_restaurants
    WHERE restaurant_id = ?
      AND owner_id = ?
    LIMIT 1
");

if (!$ownershipStmt) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Unable to verify restaurant ownership."
    ]);
    exit;
}

$currentOwnerId = (int)$_SESSION["user_id"];
$ownershipStmt->bind_param("ii", $restaurant_id, $currentOwnerId);
$ownershipStmt->execute();
$ownedRestaurant = $ownershipStmt->get_result()->fetch_assoc();
$ownershipStmt->close();

if (!$ownedRestaurant) {
    http_response_code(403);
    echo json_encode([
        "success" => false,
        "message" => "You are not authorized to manage staff for this restaurant."
    ]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

$user_id = isset($data["user_id"]) ? (int) $data["user_id"] : 0;
$full_name = trim($data["full_name"] ?? "");
$email = trim($data["email"] ?? "");
$contact_number_raw = trim((string)($data["contact_number"] ?? ""));
$contact_number = $contact_number_raw === "" ? "" : normalize_ph_mobile($contact_number_raw);
$address = trim($data["address"] ?? "");
$role = trim($data["role"] ?? "");
$status = isset($data["status"]) ? (int) $data["status"] : 1;

$allowed_roles = [
    "cashier",
    "delivery_staff"
];

if (
    $user_id <= 0 ||
    $full_name === "" ||
    $email === "" ||
    !filter_var($email, FILTER_VALIDATE_EMAIL) ||
    !in_array($role, $allowed_roles, true) ||
    !in_array($status, [0, 1], true)
) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Please provide valid user details."
    ]);
    exit;
}

if ($contact_number_raw !== "" && $contact_number === "") {
    echo json_encode([
        "success" => false,
        "message" => "Enter a valid Philippine mobile number starting with 9."
    ]);
    exit;
}

$checkSql = "
    SELECT user_id
    FROM tbl_users
    WHERE email = ?
      AND user_id != ?
      AND restaurant_id = ?
    LIMIT 1
";

$checkStmt = $conn->prepare($checkSql);
$checkStmt->bind_param("sii", $email, $user_id, $restaurant_id);
$checkStmt->execute();
$checkResult = $checkStmt->get_result();

if ($checkResult->num_rows > 0) {
    echo json_encode([
        "success" => false,
        "message" => "Email is already used by another account in this restaurant."
    ]);
    exit;
}

$checkStmt->close();

$sql = "
    UPDATE tbl_users
    SET
        full_name = ?,
        email = ?,
        contact_number = ?,
        address = ?,
        role = ?,
        status = ?
    WHERE user_id = ?
      AND restaurant_id = ?
      AND role IN ('cashier', 'delivery_staff')
";

$stmt = $conn->prepare($sql);

if (!$stmt) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Failed to prepare update query."
    ]);
    exit;
}

$stmt->bind_param(
    "sssssiii",
    $full_name,
    $email,
    $contact_number,
    $address,
    $role,
    $status,
    $user_id,
    $restaurant_id
);

$stmt->execute();

if ($stmt->affected_rows > 0) {
    echo json_encode([
        "success" => true,
        "message" => "User updated successfully."
    ]);
} else {
    echo json_encode([
        "success" => false,
        "message" => "No changes were made, or the user does not belong to this restaurant."
    ]);
}

$stmt->close();
$conn->close();