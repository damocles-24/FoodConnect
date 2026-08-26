<?php
header("Content-Type: application/json; charset=utf-8");

require_once __DIR__ . "/session_config.php";
require_once __DIR__ . "/db.php";
require_once __DIR__ . "/name_helper.php";

function respond_json($payload, $code = 200) {
    http_response_code($code);
    echo json_encode($payload);
    exit;
}

if (($_SERVER["REQUEST_METHOD"] ?? "") !== "POST") {
    respond_json([
        "success" => false,
        "message" => "This action is not available."
    ], 405);
}

$ownerId = (int)($_SESSION["user_id"] ?? 0);
$restaurantId = (int)($_SESSION["restaurant_id"] ?? 0);
$role = strtolower(trim((string)($_SESSION["role"] ?? "")));

if ($ownerId <= 0 || $restaurantId <= 0 || $role !== "owner") {
    respond_json([
        "success" => false,
        "message" => "Only the restaurant owner can reset a staff password."
    ], 403);
}

$data = json_decode(file_get_contents("php://input"), true);
if (!is_array($data)) {
    respond_json([
        "success" => false,
        "message" => "Invalid request data."
    ], 400);
}

$staffUserId = (int)($data["user_id"] ?? 0);
$newPassword = (string)($data["new_password"] ?? "");

if ($staffUserId <= 0) {
    respond_json([
        "success" => false,
        "message" => "Select a valid staff account."
    ], 422);
}

if (strlen($newPassword) < 8) {
    respond_json([
        "success" => false,
        "message" => "Temporary password must contain at least 8 characters."
    ], 422);
}

/* Confirm that this owner actually owns the active restaurant. */
$ownerStmt = $conn->prepare("
    SELECT restaurant_id
    FROM tbl_restaurants
    WHERE restaurant_id = ?
      AND owner_id = ?
    LIMIT 1
");
if (!$ownerStmt) {
    respond_json(["success" => false, "message" => "Unable to verify restaurant ownership."], 500);
}
$ownerStmt->bind_param("ii", $restaurantId, $ownerId);
$ownerStmt->execute();
$ownedRestaurant = $ownerStmt->get_result()->fetch_assoc();
$ownerStmt->close();

if (!$ownedRestaurant) {
    respond_json([
        "success" => false,
        "message" => "You are not authorized to manage this restaurant."
    ], 403);
}

/* Restaurant isolation + explicit staff roles only. */
$staffStmt = $conn->prepare("
    SELECT user_id, TRIM(CONCAT_WS(' ', NULLIF(TRIM(first_name), ''), NULLIF(TRIM(middle_name), ''), NULLIF(TRIM(last_name), ''))) AS display_name, role, status
    FROM tbl_users
    WHERE user_id = ?
      AND restaurant_id = ?
    LIMIT 1
");
if (!$staffStmt) {
    respond_json(["success" => false, "message" => "Unable to load the staff account."], 500);
}
$staffStmt->bind_param("ii", $staffUserId, $restaurantId);
$staffStmt->execute();
$staff = $staffStmt->get_result()->fetch_assoc();
$staffStmt->close();

if (!$staff) {
    respond_json([
        "success" => false,
        "message" => "Staff account was not found in this restaurant."
    ], 404);
}

$staffRole = strtolower(trim((string)$staff["role"]));
if (!in_array($staffRole, ["cashier", "delivery_staff", "delivery_coordinator"], true)) {
    respond_json([
        "success" => false,
        "message" => "Only restaurant staff passwords can be reset here."
    ], 403);
}

$passwordHash = password_hash($newPassword, PASSWORD_DEFAULT);
if ($passwordHash === false) {
    respond_json(["success" => false, "message" => "Unable to securely process the temporary password."], 500);
}

$updateStmt = $conn->prepare("
    UPDATE tbl_users
    SET password_hash = ?,
        must_change_password = 1
    WHERE user_id = ?
      AND restaurant_id = ?
");
if (!$updateStmt) {
    respond_json(["success" => false, "message" => "Unable to prepare the password reset."], 500);
}
$updateStmt->bind_param("sii", $passwordHash, $staffUserId, $restaurantId);

if (!$updateStmt->execute()) {
    $updateStmt->close();
    respond_json(["success" => false, "message" => "Unable to reset the staff password."], 500);
}
$updateStmt->close();

/* Accountability log. Never store the temporary password in logs. */
$logStmt = $conn->prepare("
    INSERT INTO tbl_activity_logs (
        restaurant_id,
        user_id,
        user_role,
        action_type,
        action_title,
        action_description
    )
    VALUES (?, ?, 'owner', 'staff', 'Staff Password Reset', ?)
");
if ($logStmt) {
    $description = (string)$staff["display_name"] . " was issued a temporary password and must create a new password at the next login.";
    $logStmt->bind_param("iis", $restaurantId, $ownerId, $description);
    $logStmt->execute();
    $logStmt->close();
}

respond_json([
    "success" => true,
    "message" => "Temporary password saved. The staff member must create a new password at the next login.",
    "user_id" => $staffUserId,
    "must_change_password" => true
]);
?>
