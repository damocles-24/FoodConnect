<?php
header("Content-Type: application/json; charset=utf-8");

session_set_cookie_params(0, "/capshit", "", false, true);
session_start();

require_once __DIR__ . "/db.php";

if (!isset($_SESSION["user_id"], $_SESSION["restaurant_id"])) {
    echo json_encode([
        "success" => false,
        "message" => "Unauthorized access."
    ]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

$restaurant_id = (int) $_SESSION["restaurant_id"];
$user_id = (int) $_SESSION["user_id"];
$user_role = $_SESSION["role"] ?? null;

$action_type = trim($data["action_type"] ?? "");
$action_title = trim($data["action_title"] ?? "");
$action_description = trim($data["action_description"] ?? "");

if ($action_type === "" || $action_title === "" || $action_description === "") {
    echo json_encode([
        "success" => false,
        "message" => "Missing required fields."
    ]);
    exit;
}

$stmt = $conn->prepare("
    INSERT INTO tbl_activity_logs
    (restaurant_id, user_id, user_role, action_type, action_title, action_description)
    VALUES (?, ?, ?, ?, ?, ?)
");

$stmt->bind_param(
    "iissss",
    $restaurant_id,
    $user_id,
    $user_role,
    $action_type,
    $action_title,
    $action_description
);

if ($stmt->execute()) {
    echo json_encode([
        "success" => true,
        "message" => "Activity log saved."
    ]);
} else {
    echo json_encode([
        "success" => false,
        "message" => "Failed to save activity log."
    ]);
}

$stmt->close();
$conn->close();
?>