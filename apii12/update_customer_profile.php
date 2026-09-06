<?php
header("Content-Type: application/json; charset=utf-8");
require_once __DIR__ . "/session_config.php";
require_once __DIR__ . "/db.php";
require_once __DIR__ . "/ph_phone.php";

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
    respond(["success" => false, "message" => "Please check the information and try again."], 400);
}

$firstName = trim((string) ($data["first_name"] ?? ""));
$middleName = trim((string) ($data["middle_name"] ?? ""));
$lastName = trim((string) ($data["last_name"] ?? ""));

$fullName = trim(
    implode(" ", array_filter([
        $firstName,
        $middleName,
        $lastName
    ]))
);

$email = strtolower(trim((string) ($data["email"] ?? "")));
$contactRaw = trim((string) ($data["contact_number"] ?? ""));
$contact = $contactRaw === "" ? "" : normalize_ph_mobile($contactRaw);
$address = trim((string) ($data["address"] ?? ""));

if (
    $firstName === "" ||
    $lastName === "" ||
    mb_strlen($firstName) > 100 ||
    mb_strlen($middleName) > 100 ||
    mb_strlen($lastName) > 100 ||
    mb_strlen($fullName) > 150
) {
    respond(
        ["success" => false, "message" => "Please enter a valid first name and last name."],
        400
    );
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL) || mb_strlen($email) > 150) {
    respond(
        ["success" => false, "message" => "Please enter a valid email address."],
        400
    );
}

if ($contactRaw !== "" && $contact === "") {
    respond([
        "success" => false,
        "message" => "Enter a valid Philippine mobile number. Accepted formats include 09123456789 and +639123456789."
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

if (!$check->execute()) {
    error_log("update_customer_profile.php duplicate check error: " . $check->error);
    $check->close();
    respond(
        ["success" => false, "message" => "Unable to validate email address."],
        500
    );
}

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
    first_name = ?,
    middle_name = ?,
    last_name = ?,
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
    "ssssssi",
    $firstName,
    $middleName,
    $lastName,
    $email,
    $contact,
    $address,
    $userId
);

if (!$stmt->execute()) {
    error_log("update_customer_profile.php update error: " . $stmt->error);
    $stmt->close();
    respond(
        ["success" => false, "message" => "Unable to update account settings."],
        500
    );
}

$stmt->close();

$_SESSION["display_name"] = $fullName;
$_SESSION["first_name"] = $firstName;
$_SESSION["middle_name"] = $middleName;
$_SESSION["last_name"] = $lastName;

respond([
    "success" => true,
    "message" => "Profile updated successfully."
]);
