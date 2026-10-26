<?php

header("Content-Type: application/json; charset=utf-8");

require_once __DIR__ . "/session_config.php";

require_once __DIR__ . "/db.php";

require_once __DIR__ . "/account_status_helper.php";

if (!isset($_SESSION["user_id"])) {
    http_response_code(401);
    echo json_encode([
        "success" => false,
        "message" => "Your session has expired or you do not have access. Please log in again."
    ]);
    exit;
}

$sessionRole = strtolower(trim((string)($_SESSION["role"] ?? "")));
if ($sessionRole !== "owner") {
    http_response_code(403);
    echo json_encode([
        "success" => false,
        "message" => "Only the restaurant owner can manage staff accounts."
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
        "message" => "Your restaurant session has expired. Please log in again."
    ]);
    exit;
}

$ownershipStmt = $conn->prepare("
    SELECT restaurant_id
    FROM tbl_restaurants
    WHERE restaurant_id = ?
      AND owner_id = ?
    LIMIT 1
");

if (!$ownershipStmt) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Unable to verify restaurant ownership."
    ]);
    exit;
}

$currentOwnerId = (int)$_SESSION["user_id"];
$ownershipStmt->bind_param("ii", $restaurant_id, $currentOwnerId);
$ownershipStmt->execute();
$ownedRestaurant = $ownershipStmt->get_result()->fetch_assoc();
$ownershipStmt->close();

if (!$ownedRestaurant) {
    http_response_code(403);
    echo json_encode([
        "success" => false,
        "message" => "You are not authorized to manage staff for this restaurant."
    ]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

$user_id = isset($data["user_id"]) ? (int) $data["user_id"] : 0;

if ($user_id <= 0) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Invalid user ID."
    ]);
    exit;
}

if ($user_id === (int) $_SESSION["user_id"]) {
    echo json_encode([
        "success" => false,
        "message" => "You cannot delete your own account while logged in."
    ]);
    exit;
}

/*
 * Deleting a rider or the last cashier is at least as disruptive as deactivating
 * them, so the same live-work check applies. The row is locked and the check runs in
 * the same transaction as the delete (an order cannot be created in between).
 */
try {
    $conn->begin_transaction();

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

    $lockStmt->bind_param("ii", $user_id, $restaurant_id);

    if (!$lockStmt->execute()) {
        throw new RuntimeException("lock execute: " . $lockStmt->error);
    }

    $lockedTarget = $lockStmt->get_result()->fetch_assoc();
    $lockStmt->close();

    if (!$lockedTarget) {
        $conn->rollback();
        echo json_encode([
            "success" => false,
            "message" => "User not found or already deleted."
        ]);
        exit;
    }

    $blockers = fc_status_operation_blockers($conn, $lockedTarget, "deleted");

    if ($blockers !== null) {
        $conn->rollback();
        http_response_code((int)$blockers["http"]);
        echo json_encode([
            "success" => false,
            "message" => $blockers["message"],
            "code" => $blockers["code"],
            "blockers" => $blockers["blockers"]
        ]);
        exit;
    }

    $stmt = $conn->prepare("
        DELETE FROM tbl_users
        WHERE user_id = ?
          AND restaurant_id = ?
          AND role IN ('cashier', 'delivery_staff')
    ");

    if (!$stmt) {
        throw new RuntimeException("delete prepare: " . $conn->error);
    }

    $stmt->bind_param("ii", $user_id, $restaurant_id);

    if (!$stmt->execute()) {
        throw new RuntimeException("delete execute: " . $stmt->error);
    }

    $deleted = $stmt->affected_rows > 0;
    $stmt->close();

    $conn->commit();
} catch (Throwable $deleteError) {
    try {
        $conn->rollback();
    } catch (Throwable $ignored) {
    }

    error_log("delete_user.php error: " . $deleteError->getMessage());
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Failed to delete the user. Nothing was changed."
    ]);
    exit;
}

if ($deleted) {
    echo json_encode([
        "success" => true,
        "message" => "User deleted successfully."
    ]);
} else {
    echo json_encode([
        "success" => false,
        "message" => "User not found or already deleted."
    ]);
}

$conn->close();
