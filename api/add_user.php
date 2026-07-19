<?php

header("Content-Type: application/json; charset=utf-8");

session_start();

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

$full_name = trim($data["full_name"] ?? "");
$email = trim($data["email"] ?? "");
$password = trim($data["password"] ?? "");
$contact_number = trim($data["contact_number"] ?? "");
$address = trim($data["address"] ?? "");
$role = trim($data["role"] ?? "");
$status = isset($data["status"]) ? (int) $data["status"] : 1;

$allowed_roles = [
    "cashier",
    "kitchen_staff",
    "delivery_staff"
];
if (
    $full_name === "" ||
    $email === "" ||
    $password === "" ||
    !filter_var($email, FILTER_VALIDATE_EMAIL) ||
    !in_array($role, $allowed_roles, true) ||
    !in_array($status, [0, 1], true)
) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Please complete all required user details."
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
      AND restaurant_id = ?
    LIMIT 1
";

$checkStmt = $conn->prepare($checkSql);
$checkStmt->bind_param("si", $email, $restaurant_id);
$checkStmt->execute();
$checkResult = $checkStmt->get_result();

if ($checkResult->num_rows > 0) {
    echo json_encode([
        "success" => false,
        "message" => "Email already exists in this restaurant."
    ]);
    exit;
}

$checkStmt->close();

$password_hash = password_hash($password, PASSWORD_DEFAULT);

$sql = "
    INSERT INTO tbl_users (
        restaurant_id,
        role,
        full_name,
        email,
        contact_number,
        address,
        password_hash,
        status
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
";

$stmt = $conn->prepare($sql);

if (!$stmt) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Failed to prepare insert query."
    ]);
    exit;
}

$stmt->bind_param(
    "issssssi",
    $restaurant_id,
    $role,
    $full_name,
    $email,
    $contact_number,
    $address,
    $password_hash,
    $status
);

$stmt->execute();

if ($stmt->affected_rows > 0) {
    echo json_encode([
        "success" => true,
        "message" => "User added successfully."
    ]);
} else {
    echo json_encode([
        "success" => false,
        "message" => "Failed to add user."
    ]);
}

$stmt->close();
$conn->close();