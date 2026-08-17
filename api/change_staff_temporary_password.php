<?php
header("Content-Type: application/json; charset=utf-8");

/*
 * This endpoint intentionally uses conservative mysqli calls so it stays
 * compatible with the older PHP/XAMPP build used by the FoodConnect project.
 */
error_reporting(E_ALL & ~E_NOTICE & ~E_WARNING);
ini_set("display_errors", "0");

require_once __DIR__ . "/session_config.php";
require_once __DIR__ . "/db.php";

function staff_password_respond($payload, $code = 200) {
    http_response_code($code);
    echo json_encode($payload);
    exit;
}

function clear_staff_password_change_session() {
    unset(
        $_SESSION["staff_password_change_user_id"],
        $_SESSION["staff_password_change_restaurant_id"],
        $_SESSION["staff_password_change_role"],
        $_SESSION["staff_password_change_full_name"],
        $_SESSION["staff_password_change_started_at"]
    );
}

if (($_SERVER["REQUEST_METHOD"] ?? "") !== "POST") {
    staff_password_respond([
        "success" => false,
        "message" => "This action is not available."
    ], 405);
}

$userId = (int)($_SESSION["staff_password_change_user_id"] ?? 0);
$restaurantId = (int)($_SESSION["staff_password_change_restaurant_id"] ?? 0);
$sessionRole = strtolower(trim((string)($_SESSION["staff_password_change_role"] ?? "")));
$startedAt = (int)($_SESSION["staff_password_change_started_at"] ?? 0);

if (
    $userId <= 0 ||
    $restaurantId <= 0 ||
    !in_array($sessionRole, ["cashier", "delivery_staff", "delivery_coordinator"], true) ||
    $startedAt <= 0 ||
    (time() - $startedAt) > 900
) {
    clear_staff_password_change_session();

    staff_password_respond([
        "success" => false,
        "message" => "Your password-change session expired. Log in again using the temporary password."
    ], 401);
}

$data = json_decode(file_get_contents("php://input"), true);
if (!is_array($data)) {
    staff_password_respond([
        "success" => false,
        "message" => "Invalid request data."
    ], 400);
}

$newPassword = (string)($data["new_password"] ?? "");
$confirmPassword = (string)($data["confirm_password"] ?? "");

if (strlen($newPassword) < 8) {
    staff_password_respond([
        "success" => false,
        "message" => "New password must contain at least 8 characters."
    ], 422);
}

if ($newPassword !== $confirmPassword) {
    staff_password_respond([
        "success" => false,
        "message" => "New password and confirmation do not match."
    ], 422);
}

try {
    /*
     * Avoid get_result() here. bind_result()/fetch() is more portable across
     * older XAMPP / mysqlnd combinations and removes a common source of 500s.
     */
    $stmt = $conn->prepare("\n        SELECT\n            user_id,\n            restaurant_id,\n            role,\n            full_name,\n            email,\n            password_hash,\n            status,\n            must_change_password\n        FROM tbl_users\n        WHERE user_id = ?\n          AND restaurant_id = ?\n        LIMIT 1\n    ");

    if (!$stmt) {
        throw new RuntimeException("Unable to prepare staff account lookup.");
    }

    $stmt->bind_param("ii", $userId, $restaurantId);

    if (!$stmt->execute()) {
        throw new RuntimeException("Unable to load the staff account.");
    }

    $dbUserId = null;
    $dbRestaurantId = null;
    $dbRole = null;
    $dbFullName = null;
    $dbEmail = null;
    $dbPasswordHash = null;
    $dbStatus = null;
    $dbMustChangePassword = null;

    $stmt->bind_result(
        $dbUserId,
        $dbRestaurantId,
        $dbRole,
        $dbFullName,
        $dbEmail,
        $dbPasswordHash,
        $dbStatus,
        $dbMustChangePassword
    );

    $found = $stmt->fetch();
    $stmt->close();

    if (!$found) {
        staff_password_respond([
            "success" => false,
            "message" => "Staff account was not found."
        ], 404);
    }

    if ((int)$dbStatus !== 1) {
        staff_password_respond([
            "success" => false,
            "message" => "This staff account is disabled."
        ], 403);
    }

    if ((int)$dbMustChangePassword !== 1) {
        staff_password_respond([
            "success" => false,
            "message" => "A password change is not required for this account."
        ], 409);
    }

    if (password_verify($newPassword, (string)$dbPasswordHash)) {
        staff_password_respond([
            "success" => false,
            "message" => "Choose a new password that is different from the temporary password."
        ], 422);
    }

    $passwordHash = password_hash($newPassword, PASSWORD_DEFAULT);
    if ($passwordHash === false) {
        throw new RuntimeException("Unable to securely process the new password.");
    }

    $updateStmt = $conn->prepare("\n        UPDATE tbl_users\n        SET password_hash = ?,\n            must_change_password = 0\n        WHERE user_id = ?\n          AND restaurant_id = ?\n          AND must_change_password = 1\n    ");

    if (!$updateStmt) {
        throw new RuntimeException("Unable to prepare the password update.");
    }

    $updateStmt->bind_param("sii", $passwordHash, $userId, $restaurantId);

    if (!$updateStmt->execute()) {
        throw new RuntimeException("Unable to save the new password.");
    }

    $affectedRows = (int)$updateStmt->affected_rows;
    $updateStmt->close();

    if ($affectedRows !== 1) {
        staff_password_respond([
            "success" => false,
            "message" => "The password change could not be completed. Log in again using the temporary password."
        ], 409);
    }

    /* Promote the short-lived password-change session to the real staff session. */
    @session_regenerate_id(true);

    clear_staff_password_change_session();

    $_SESSION["user_id"] = (int)$dbUserId;
    $_SESSION["role"] = (string)$dbRole;
    $_SESSION["restaurant_id"] = (int)$dbRestaurantId;
    $_SESSION["full_name"] = (string)$dbFullName;

    /* Accountability only; never log either password. Failure must not block login. */
    try {
        $logStmt = $conn->prepare("\n            INSERT INTO tbl_activity_logs (\n                restaurant_id,\n                user_id,\n                user_role,\n                action_type,\n                action_title,\n                action_description\n            ) VALUES (?, ?, ?, 'staff', 'Staff Password Changed', ?)\n        ");

        if ($logStmt) {
            $roleForLog = (string)$dbRole;
            $description = (string)$dbFullName .
                " created a new private password after a temporary password reset.";

            $logStmt->bind_param(
                "iiss",
                $restaurantId,
                $userId,
                $roleForLog,
                $description
            );
            $logStmt->execute();
            $logStmt->close();
        }
    } catch (Throwable $logError) {
        error_log(
            "FoodConnect staff password activity-log error: " .
            $logError->getMessage()
        );
    }

    staff_password_respond([
        "success" => true,
        "message" => "Password updated successfully.",
        "must_change_password" => false,
        "user" => [
            "user_id" => (int)$dbUserId,
            "restaurant_id" => (int)$dbRestaurantId,
            "role" => (string)$dbRole,
            "full_name" => (string)$dbFullName,
            "email" => (string)$dbEmail
        ]
    ]);

} catch (Throwable $error) {
    error_log(
        "FoodConnect staff password change error: " .
        $error->getMessage()
    );

    staff_password_respond([
        "success" => false,
        "message" => "Unable to update the password. Please log in again with the temporary password and retry."
    ], 500);
}
?>
