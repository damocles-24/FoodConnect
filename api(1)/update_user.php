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
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Invalid or missing restaurant_id in session."
    ]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

$user_id = isset($data["user_id"]) ? (int) $data["user_id"] : 0;
$full_name = trim($data["full_name"] ?? "");
$email = trim($data["email"] ?? "");
$contact_number = trim($data["contact_number"] ?? "");
$address = trim($data["address"] ?? "");
$role = trim($data["role"] ?? "");
$status = isset($data["status"]) ? (int) $data["status"] : 1;

$allowed_roles = [
    "owner",
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

if ($contact_number !== "" && !preg_match('/^[0-9]{11}$/', $contact_number)) {
    echo json_encode([
        "success" => false,
        "message" => "Contact number must be exactly 11 digits."
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