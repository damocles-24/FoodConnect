<?php

header("Content-Type: application/json; charset=utf-8");
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");

require_once __DIR__ . "/session_config.php";
require_once __DIR__ . "/db.php";
require_once __DIR__ . "/ph_phone.php";
require_once __DIR__ . "/account_status_helper.php";

function update_user_respond(array $data, int $statusCode = 200): void
{
    http_response_code($statusCode);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

if (strtoupper((string)($_SERVER["REQUEST_METHOD"] ?? "")) !== "POST") {
    update_user_respond(["success" => false, "message" => "This action is not available."], 405);
}

$currentOwnerId = (int)($_SESSION["user_id"] ?? 0);
$restaurantId = (int)($_SESSION["restaurant_id"] ?? 0);
$sessionRole = strtolower(trim((string)($_SESSION["role"] ?? "")));

if ($currentOwnerId <= 0 || $restaurantId <= 0) {
    update_user_respond([
        "success" => false,
        "message" => "Your session has expired or you do not have access. Please log in again."
    ], 401);
}

if ($sessionRole !== "owner") {
    update_user_respond([
        "success" => false,
        "message" => "Only the restaurant owner can manage staff accounts."
    ], 403);
}

$ownershipStmt = $conn->prepare("
    SELECT restaurant_id
    FROM tbl_restaurants
    WHERE restaurant_id = ?
      AND owner_id = ?
    LIMIT 1
");

if (!$ownershipStmt) {
    error_log("update_user.php ownership prepare error: " . $conn->error);
    update_user_respond(["success" => false, "message" => "Unable to verify restaurant ownership."], 500);
}

$ownershipStmt->bind_param("ii", $restaurantId, $currentOwnerId);
if (!$ownershipStmt->execute()) {
    error_log("update_user.php ownership execute error: " . $ownershipStmt->error);
    $ownershipStmt->close();
    update_user_respond(["success" => false, "message" => "Unable to verify restaurant ownership."], 500);
}

$ownedRestaurant = $ownershipStmt->get_result()->fetch_assoc();
$ownershipStmt->close();

if (!$ownedRestaurant) {
    update_user_respond([
        "success" => false,
        "message" => "You are not authorized to manage staff for this restaurant."
    ], 403);
}

$data = json_decode(file_get_contents("php://input"), true);
if (!is_array($data)) {
    update_user_respond(["success" => false, "message" => "Invalid request data."], 400);
}

$userId = (int)($data["user_id"] ?? 0);
$firstName = trim((string)($data["first_name"] ?? ""));
$middleName = trim((string)($data["middle_name"] ?? ""));
$lastName = trim((string)($data["last_name"] ?? ""));
$suffix = trim((string)($data["suffix"] ?? ""));
$fullName = trim(implode(" ", array_filter(
    [$firstName, $middleName, $lastName, $suffix],
    static fn($part) => $part !== ""
)));
$email = strtolower(trim((string)($data["email"] ?? "")));
$contactRaw = trim((string)($data["contact_number"] ?? ""));
$contactNumber = $contactRaw === "" ? "" : normalize_ph_mobile($contactRaw);
$address = trim((string)($data["address"] ?? ""));
$role = strtolower(trim((string)($data["role"] ?? "")));
/*
 * Account status is NOT editable here. Deactivating or reactivating staff needs a
 * recorded reason and goes through update_staff_status.php only. A status value in
 * this request is accepted only if it equals the staff member's current status
 * (older cached forms still send it back unchanged).
 */
$requestedStatus = null;

if (array_key_exists("status", $data) && $data["status"] !== null && $data["status"] !== "") {
    $requestedStatus = filter_var($data["status"], FILTER_VALIDATE_INT);

    if ($requestedStatus === false || !in_array($requestedStatus, [0, 1], true)) {
        update_user_respond(["success" => false, "message" => "Please provide valid staff details."], 422);
    }
}

$allowedRoles = ["cashier", "delivery_staff"];

if ($userId <= 0 || $firstName === "" || $lastName === "") {
    update_user_respond(["success" => false, "message" => "First name and last name are required."], 422);
}

if (
    mb_strlen($firstName) > 100 ||
    mb_strlen($middleName) > 100 ||
    mb_strlen($lastName) > 100 ||
    mb_strlen($suffix) > 30 ||
    mb_strlen($fullName) > 180
) {
    update_user_respond(["success" => false, "message" => "Please enter a shorter staff name."], 422);
}

if ($email === "" || !filter_var($email, FILTER_VALIDATE_EMAIL) || mb_strlen($email) > 150) {
    update_user_respond(["success" => false, "message" => "Enter a valid email address."], 422);
}

if ($contactRaw !== "" && $contactNumber === "") {
    update_user_respond([
        "success" => false,
        "message" => "Enter a valid Philippine mobile number. Accepted formats include 09123456789 and +639123456789."
    ], 422);
}

if (mb_strlen($address) > 1000) {
    update_user_respond(["success" => false, "message" => "Address is too long."], 422);
}

if (!in_array($role, $allowedRoles, true)) {
    update_user_respond(["success" => false, "message" => "Please provide valid staff details."], 422);
}

// Confirm the target belongs to this owner before doing any update.
$targetStmt = $conn->prepare("
    SELECT user_id, status, role, restaurant_id
    FROM tbl_users
    WHERE user_id = ?
      AND restaurant_id = ?
      AND role IN ('cashier', 'delivery_staff')
    LIMIT 1
");

if (!$targetStmt) {
    error_log("update_user.php target prepare error: " . $conn->error);
    update_user_respond(["success" => false, "message" => "Unable to validate the staff account."], 500);
}

$targetStmt->bind_param("ii", $userId, $restaurantId);
if (!$targetStmt->execute()) {
    error_log("update_user.php target execute error: " . $targetStmt->error);
    $targetStmt->close();
    update_user_respond(["success" => false, "message" => "Unable to validate the staff account."], 500);
}

$target = $targetStmt->get_result()->fetch_assoc();
$targetStmt->close();

if (!$target) {
    update_user_respond([
        "success" => false,
        "message" => "The staff account was not found in this restaurant."
    ], 404);
}

$currentStatus = (int)$target["status"];

if ($requestedStatus !== null && $requestedStatus !== $currentStatus) {
    update_user_respond([
        "success" => false,
        "message" => "Account status cannot be changed from the edit form. Use the Deactivate or Reactivate action and provide a reason."
    ], 422);
}

// Email is globally unique because staff_login.php authenticates by email alone.
$checkStmt = $conn->prepare("
    SELECT user_id
    FROM tbl_users
    WHERE LOWER(email) = ?
      AND user_id <> ?
    LIMIT 1
");

if (!$checkStmt) {
    error_log("update_user.php email check prepare error: " . $conn->error);
    update_user_respond(["success" => false, "message" => "Unable to validate the email address."], 500);
}

$checkStmt->bind_param("si", $email, $userId);
if (!$checkStmt->execute()) {
    error_log("update_user.php email check execute error: " . $checkStmt->error);
    $checkStmt->close();
    update_user_respond(["success" => false, "message" => "Unable to validate the email address."], 500);
}

$duplicate = $checkStmt->get_result()->fetch_assoc();
$checkStmt->close();

if ($duplicate) {
    update_user_respond([
        "success" => false,
        "message" => "This email address is already registered to another FoodConnect account."
    ], 409);
}

/*
 * Moving a cashier or rider to another role takes them out of their current duties
 * exactly like deactivating them would, so it must not strand live work either.
 * The row is locked and the check runs in the same transaction as the update.
 */
$roleChangeTx = false;

if (strtolower((string)$target["role"]) !== $role) {
    try {
        $conn->begin_transaction();
        $roleChangeTx = true;

        $lockStmt = $conn->prepare("
            SELECT user_id, restaurant_id, role, status
            FROM tbl_users
            WHERE user_id = ?
              AND restaurant_id = ?
              AND role IN ('cashier', 'delivery_staff')
            LIMIT 1
            FOR UPDATE
        ");

        if (!$lockStmt) {
            throw new RuntimeException("lock prepare: " . $conn->error);
        }

        $lockStmt->bind_param("ii", $userId, $restaurantId);

        if (!$lockStmt->execute()) {
            throw new RuntimeException("lock execute: " . $lockStmt->error);
        }

        $lockedTarget = $lockStmt->get_result()->fetch_assoc();
        $lockStmt->close();

        if (!$lockedTarget) {
            $conn->rollback();
            update_user_respond([
                "success" => false,
                "message" => "The staff account was not found in this restaurant."
            ], 404);
        }

        if (strtolower((string)$lockedTarget["role"]) !== $role) {
            $blockers = fc_status_operation_blockers($conn, $lockedTarget, "moved to another role");

            if ($blockers !== null) {
                $conn->rollback();
                update_user_respond([
                    "success" => false,
                    "message" => $blockers["message"],
                    "code" => $blockers["code"],
                    "blockers" => $blockers["blockers"]
                ], (int)$blockers["http"]);
            }
        }
    } catch (Throwable $roleGuardError) {
        if ($roleChangeTx) {
            try {
                $conn->rollback();
            } catch (Throwable $ignored) {
            }
        }

        error_log("update_user.php role change guard error: " . $roleGuardError->getMessage());
        update_user_respond(["success" => false, "message" => "Unable to update the staff account."], 500);
    }
}

$stmt = $conn->prepare("
    UPDATE tbl_users
    SET
        first_name = ?,
        middle_name = ?,
        last_name = ?,
        suffix = ?,
        email = ?,
        contact_number = ?,
        address = ?,
        role = ?
    WHERE user_id = ?
      AND restaurant_id = ?
      AND role IN ('cashier', 'delivery_staff')
    LIMIT 1
");

if (!$stmt) {
    error_log("update_user.php update prepare error: " . $conn->error);
    if ($roleChangeTx) {
        $conn->rollback();
    }
    update_user_respond(["success" => false, "message" => "Unable to update the staff account."], 500);
}

$stmt->bind_param(
    "ssssssssii",
    $firstName,
    $middleName,
    $lastName,
    $suffix,
    $email,
    $contactNumber,
    $address,
    $role,
    $userId,
    $restaurantId
);

if (!$stmt->execute()) {
    $errno = (int)$stmt->errno;
    error_log("update_user.php update execute error: " . $stmt->error);
    $stmt->close();

    if ($roleChangeTx) {
        $conn->rollback();
    }

    if ($errno === 1062) {
        update_user_respond([
            "success" => false,
            "message" => "This email address is already registered to another FoodConnect account."
        ], 409);
    }

    update_user_respond(["success" => false, "message" => "Unable to update the staff account."], 500);
}

$changed = $stmt->affected_rows > 0;
$stmt->close();

if ($roleChangeTx) {
    $conn->commit();
}

$conn->close();

update_user_respond([
    "success" => true,
    "message" => $changed ? "User updated successfully." : "No changes were needed.",
    "user" => [
        "user_id" => $userId,
        "restaurant_id" => $restaurantId,
        "first_name" => $firstName,
        "middle_name" => $middleName,
        "last_name" => $lastName,
        "suffix" => $suffix,
        "display_name" => $fullName,
        "email" => $email,
        "contact_number" => $contactNumber,
        "address" => $address,
        "role" => $role,
        "status" => $currentStatus
    ]
]);
