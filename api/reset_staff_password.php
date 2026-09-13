<?php
header("Content-Type: application/json; charset=utf-8");
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Pragma: no-cache");

error_reporting(E_ALL & ~E_NOTICE & ~E_WARNING);
ini_set("display_errors", "0");

require_once __DIR__ . "/session_config.php";
require_once __DIR__ . "/db.php";
require_once __DIR__ . "/name_helper.php";

function staff_reset_respond(array $payload, int $code = 200): void
{
    http_response_code($code);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

if (strtoupper((string)($_SERVER["REQUEST_METHOD"] ?? "")) !== "POST") {
    staff_reset_respond([
        "success" => false,
        "message" => "This action is not available."
    ], 405);
}

$ownerId = (int)($_SESSION["user_id"] ?? 0);
$restaurantId = (int)($_SESSION["restaurant_id"] ?? 0);
$role = strtolower(trim((string)($_SESSION["role"] ?? "")));

if ($ownerId <= 0 || $restaurantId <= 0 || $role !== "owner") {
    staff_reset_respond([
        "success" => false,
        "message" => "Only the restaurant owner can reset a staff password."
    ], 403);
}

$data = json_decode(file_get_contents("php://input"), true);
if (!is_array($data)) {
    staff_reset_respond([
        "success" => false,
        "message" => "Invalid request data."
    ], 400);
}

$staffUserId = (int)($data["user_id"] ?? 0);
$newPassword = (string)($data["new_password"] ?? "");

if ($staffUserId <= 0) {
    staff_reset_respond([
        "success" => false,
        "message" => "Select a valid staff account."
    ], 422);
}

if (strlen($newPassword) < 8) {
    staff_reset_respond([
        "success" => false,
        "message" => "Temporary password must contain at least 8 characters."
    ], 422);
}

$ownerStmt = $conn->prepare("
    SELECT restaurant_id
    FROM tbl_restaurants
    WHERE restaurant_id = ?
      AND owner_id = ?
    LIMIT 1
");

if (!$ownerStmt) {
    staff_reset_respond([
        "success" => false,
        "message" => "Unable to verify restaurant ownership."
    ], 500);
}

$ownerStmt->bind_param("ii", $restaurantId, $ownerId);
$ownerStmt->execute();
$ownedRestaurant = $ownerStmt->get_result()->fetch_assoc();
$ownerStmt->close();

if (!$ownedRestaurant) {
    staff_reset_respond([
        "success" => false,
        "message" => "You are not authorized to manage this restaurant."
    ], 403);
}

$staffStmt = $conn->prepare("
    SELECT
        user_id,
        first_name,
        middle_name,
        last_name,
        role,
        status,
        password_hash,
        reset_token_hash,
        reset_token_expires
    FROM tbl_users
    WHERE user_id = ?
      AND restaurant_id = ?
    LIMIT 1
");

if (!$staffStmt) {
    staff_reset_respond([
        "success" => false,
        "message" => "Unable to load the staff account."
    ], 500);
}

$staffStmt->bind_param("ii", $staffUserId, $restaurantId);
$staffStmt->execute();
$staff = $staffStmt->get_result()->fetch_assoc();
$staffStmt->close();

if (!$staff) {
    staff_reset_respond([
        "success" => false,
        "message" => "Staff account was not found in this restaurant."
    ], 404);
}

$staffRole = strtolower(trim((string)$staff["role"]));
if (!in_array($staffRole, ["cashier", "delivery_staff", "delivery_coordinator"], true)) {
    staff_reset_respond([
        "success" => false,
        "message" => "Only cashier and delivery staff passwords can be reset here."
    ], 403);
}

if (password_verify($newPassword, (string)$staff["password_hash"])) {
    staff_reset_respond([
        "success" => false,
        "message" => "Choose a temporary password that is different from the staff member's current password."
    ], 422);
}

$passwordHash = password_hash($newPassword, PASSWORD_DEFAULT);
if ($passwordHash === false) {
    staff_reset_respond([
        "success" => false,
        "message" => "Unable to securely process the temporary password."
    ], 500);
}

$hadPendingRequest =
    !empty($staff["reset_token_hash"]) &&
    !empty($staff["reset_token_expires"]) &&
    strtotime((string)$staff["reset_token_expires"]) >= time();

try {
    $conn->begin_transaction();

    $updateStmt = $conn->prepare("
        UPDATE tbl_users
        SET password_hash = ?,
            must_change_password = 1,
            reset_token_hash = NULL,
            reset_token_expires = NULL,
            remember_token_hash = NULL,
            remember_token_expires = NULL
        WHERE user_id = ?
          AND restaurant_id = ?
          AND role IN ('cashier', 'delivery_staff', 'delivery_coordinator')
    ");

    if (!$updateStmt) {
        throw new RuntimeException("Unable to prepare the password reset.");
    }

    $updateStmt->bind_param("sii", $passwordHash, $staffUserId, $restaurantId);

    if (!$updateStmt->execute() || (int)$updateStmt->affected_rows !== 1) {
        $updateStmt->close();
        throw new RuntimeException("Unable to reset the staff password.");
    }

    $updateStmt->close();

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
        $staffName = formatUserName($staff);
        $description = $staffName . " was issued a temporary password and must create a new password at the next login.";
        if ($hadPendingRequest) {
            $description .= " The staff password reset request was resolved.";
        }
        $logStmt->bind_param("iis", $restaurantId, $ownerId, $description);
        $logStmt->execute();
        $logStmt->close();
    }

    $conn->commit();
} catch (Throwable $error) {
    try {
        $conn->rollback();
    } catch (Throwable $ignored) {
    }

    error_log("reset_staff_password.php error: " . $error->getMessage());

    staff_reset_respond([
        "success" => false,
        "message" => "Unable to reset the staff password right now. Please try again."
    ], 500);
}

$message = $hadPendingRequest
    ? "Temporary password saved and the staff recovery request was resolved. The staff member must create a new private password at the next login."
    : "Temporary password saved. The staff member must create a new private password at the next login.";

staff_reset_respond([
    "success" => true,
    "message" => $message,
    "user_id" => $staffUserId,
    "must_change_password" => true,
    "resolved_reset_request" => $hadPendingRequest
]);
