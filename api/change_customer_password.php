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

$currentPassword = (string) ($data["current_password"] ?? "");
$newPassword = (string) ($data["new_password"] ?? "");
$confirmPassword = (string) ($data["confirm_password"] ?? "");

if (
    $currentPassword === "" ||
    $newPassword === "" ||
    $confirmPassword === ""
) {
    respond([
        "success" => false,
        "message" => "Please complete all password fields."
    ], 400);
}

if (strlen($newPassword) < 8) {
    respond([
        "success" => false,
        "message" => "New password must be at least 8 characters."
    ], 400);
}

if (
    !preg_match('/[a-z]/', $newPassword) ||
    !preg_match('/[A-Z]/', $newPassword) ||
    !preg_match('/\d/', $newPassword)
) {
    respond([
        "success" => false,
        "message" => "New password must include uppercase, lowercase, and a number."
    ], 400);
}

if ($newPassword !== $confirmPassword) {
    respond([
        "success" => false,
        "message" => "New passwords do not match."
    ], 400);
}

$stmt = $conn->prepare("
    SELECT password_hash
    FROM tbl_users
    WHERE user_id = ?
      AND role = 'customer'
      AND status = 1
    LIMIT 1
");

if (!$stmt) {
    respond(
        ["success" => false, "message" => "Unable to verify your account."],
        500
    );
}

$stmt->bind_param("i", $userId);
$stmt->execute();

$user = $stmt->get_result()->fetch_assoc();
$stmt->close();

if (!$user) {
    respond(
        ["success" => false, "message" => "Customer account was not found."],
        404
    );
}

if (!password_verify($currentPassword, $user["password_hash"])) {
    respond([
        "success" => false,
        "message" => "Current password is incorrect."
    ], 403);
}

if (password_verify($newPassword, $user["password_hash"])) {
    respond([
        "success" => false,
        "message" => "New password must be different from your current password."
    ], 400);
}

$newHash = password_hash($newPassword, PASSWORD_DEFAULT);

if ($newHash === false) {
    respond(
        ["success" => false, "message" => "Unable to secure the new password."],
        500
    );
}

$update = $conn->prepare("
    UPDATE tbl_users
    SET
        password_hash = ?,
        remember_token_hash = NULL,
        remember_token_expires = NULL
    WHERE user_id = ?
      AND role = 'customer'
      AND status = 1
    LIMIT 1
");

if (!$update) {
    respond(
        ["success" => false, "message" => "Unable to update your password."],
        500
    );
}

$update->bind_param("si", $newHash, $userId);
$update->execute();
$update->close();

respond([
    "success" => true,
    "message" => "Password updated successfully."
]);
