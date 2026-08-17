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

$stmt = $conn->prepare("
    SELECT
        user_id,
        full_name,
        email,
        contact_number,
        address
    FROM tbl_users
    WHERE user_id = ?
      AND role = 'customer'
      AND status = 1
    LIMIT 1
");

if (!$stmt) {
    respond(
        ["success" => false, "message" => "Unable to load account settings."],
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

respond([
    "success" => true,
    "user" => [
        "user_id" => (int) $user["user_id"],
        "full_name" => (string) $user["full_name"],
        "email" => (string) $user["email"],
        "contact_number" => (string) ($user["contact_number"] ?? ""),
        "address" => (string) ($user["address"] ?? "")
    ]
]);
