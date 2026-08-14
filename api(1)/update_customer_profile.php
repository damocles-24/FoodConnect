<?php
header("Content-Type: application/json; charset=utf-8");
require_once __DIR__ . "/session_config.php";
require_once __DIR__ . "/db.php";

function respond(array $data, int $status = 200): void
{
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

$userId = isset($_SESSION["user_id"]) ? (int) $_SESSION["user_id"] : 0;
$role = strtolower(trim((string) ($_SESSION["role"] ?? "")));

if ($userId <= 0 || $role !== "customer") {
    respond(
        ["success" => false, "message" => "Please log in as a customer."],
        401
    );
}

$data = json_decode(file_get_contents("php://input"), true);

if (!is_array($data)) {
    respond(["success" => false, "message" => "Invalid request."], 400);
}

$fullName = trim((string) ($data["full_name"] ?? ""));
$email = strtolower(trim((string) ($data["email"] ?? "")));
$contact = trim((string) ($data["contact_number"] ?? ""));
$address = trim((string) ($data["address"] ?? ""));

if ($fullName === "" || mb_strlen($fullName) > 150) {
    respond(
        ["success" => false, "message" => "Please enter a valid full name."],
        400
    );
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL) || mb_strlen($email) > 150) {
    respond(
        ["success" => false, "message" => "Please enter a valid email address."],
        400
    );
}

if ($contact !== "" && !preg_match('/^(09\d{9}|\+639\d{9})$/', $contact)) {
    respond([
        "success" => false,
        "message" => "Use a valid Philippine mobile number, such as 09123456789 or +639123456789."
    ], 400);
}

if (mb_strlen($address) > 1000) {
    respond(
        ["success" => false, "message" => "Address is too long."],
        400
    );
}

$check = $conn->prepare("
    SELECT user_id
    FROM tbl_users
    WHERE email = ?
      AND user_id <> ?
    LIMIT 1
");

if (!$check) {
    respond(
        ["success" => false, "message" => "Unable to validate email address."],
        500
    );
}

$check->bind_param("si", $email, $userId);
$check->execute();

$duplicate = $check->get_result()->fetch_assoc();
$check->close();

if ($duplicate) {
    respond([
        "success" => false,
        "message" => "That email address is already used by another FoodConnect account."
    ], 409);
}

$stmt = $conn->prepare("
    UPDATE tbl_users
    SET
        full_name = ?,
        email = ?,
        contact_number = ?,
        address = ?
    WHERE user_id = ?
      AND role = 'customer'
      AND status = 1
    LIMIT 1
");

if (!$stmt) {
    respond(
        ["success" => false, "message" => "Unable to update account settings."],
        500
    );
}

$stmt->bind_param(
    "ssssi",
    $fullName,
    $email,
    $contact,
    $address,
    $userId
);

$stmt->execute();

if ($stmt->affected_rows < 0) {
    $stmt->close();
    respond(
        ["success" => false, "message" => "Unable to update account settings."],
        500
    );
}

$stmt->close();

$_SESSION["full_name"] = $fullName;

respond([
    "success" => true,
    "message" => "Profile updated successfully."
]);
