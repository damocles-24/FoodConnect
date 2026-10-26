<?php

/**
 * Restaurant owner: deactivate or reactivate a cashier / delivery staff account
 * of the owner's OWN restaurant. A recorded reason is mandatory.
 *
 * POST JSON: { "user_id": int, "status": 0|1, "reason": string, "note": string }
 *
 * All permission, reason, locking and history rules live in
 * account_status_helper.php (shared with every other status endpoint).
 */

header("Content-Type: application/json; charset=utf-8");
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");

require_once __DIR__ . "/session_config.php";
require_once __DIR__ . "/db.php";
require_once __DIR__ . "/account_status_helper.php";

function update_staff_status_respond(array $data, int $statusCode = 200): void
{
    http_response_code($statusCode);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

if (strtoupper((string)($_SERVER["REQUEST_METHOD"] ?? "")) !== "POST") {
    update_staff_status_respond(["success" => false, "message" => "This action is not available."], 405);
}

$ownerId = (int)($_SESSION["user_id"] ?? 0);
$restaurantId = (int)($_SESSION["restaurant_id"] ?? 0);
$sessionRole = strtolower(trim((string)($_SESSION["role"] ?? "")));

if ($ownerId <= 0) {
    update_staff_status_respond([
        "success" => false,
        "message" => "Your session has expired or you do not have access. Please log in again."
    ], 401);
}

if ($sessionRole !== "owner") {
    update_staff_status_respond([
        "success" => false,
        "message" => "Only the restaurant owner can deactivate or reactivate staff accounts."
    ], 403);
}

if ($restaurantId <= 0) {
    update_staff_status_respond([
        "success" => false,
        "message" => "Your session has expired or you do not have access. Please log in again."
    ], 401);
}

/* Confirm against the database, not only the session. */
$ownerStmt = $conn->prepare("
    SELECT u.user_id, u.role, u.status, u.is_verified, u.restaurant_id,
           TRIM(CONCAT_WS(' ', NULLIF(TRIM(u.first_name), ''), NULLIF(TRIM(u.middle_name), ''), NULLIF(TRIM(u.last_name), ''))) AS display_name
    FROM tbl_users u
    INNER JOIN tbl_restaurants r ON r.restaurant_id = ? AND r.owner_id = u.user_id
    WHERE u.user_id = ?
    LIMIT 1
");

if (!$ownerStmt) {
    error_log("update_staff_status.php owner prepare error: " . $conn->error);
    update_staff_status_respond(["success" => false, "message" => "Unable to verify your account."], 500);
}

$ownerStmt->bind_param("ii", $restaurantId, $ownerId);

if (!$ownerStmt->execute()) {
    error_log("update_staff_status.php owner execute error: " . $ownerStmt->error);
    $ownerStmt->close();
    update_staff_status_respond(["success" => false, "message" => "Unable to verify your account."], 500);
}

$owner = $ownerStmt->get_result()->fetch_assoc();
$ownerStmt->close();

if (
    !$owner ||
    strtolower((string)$owner["role"]) !== "owner" ||
    (int)$owner["status"] !== 1 ||
    (int)$owner["is_verified"] !== 1
) {
    update_staff_status_respond([
        "success" => false,
        "message" => "You are not authorized to manage staff for this restaurant."
    ], 403);
}

$data = json_decode((string)file_get_contents("php://input"), true);

if (!is_array($data)) {
    update_staff_status_respond(["success" => false, "message" => "Invalid request data."], 400);
}

$userId = filter_var($data["user_id"] ?? null, FILTER_VALIDATE_INT);
$status = filter_var($data["status"] ?? null, FILTER_VALIDATE_INT);

if ($userId === false || $userId === null || $userId <= 0) {
    update_staff_status_respond(["success" => false, "message" => "A valid staff account is required."], 422);
}

if ($status === false || $status === null || !in_array($status, [0, 1], true)) {
    update_staff_status_respond(["success" => false, "message" => "The account status must be active or inactive."], 422);
}

$result = fc_change_account_status(
    $conn,
    (int)$userId,
    (int)$status,
    [
        "actor" => [
            "user_id" => $ownerId,
            "role" => "owner",
            "restaurant_id" => $restaurantId
        ],
        "actor_name" => (string)$owner["display_name"],
        "reason" => $data["reason"] ?? "",
        "note" => $data["note"] ?? "",
        "activity_log" => true
    ]
);

if (!$result["success"]) {
    update_staff_status_respond([
        "success" => false,
        "message" => $result["message"],
        "field" => $result["field"] ?? null,
        "code" => $result["code"] ?? null,
        "blockers" => $result["blockers"] ?? null
    ], (int)$result["http"]);
}

$name = (string)($result["target"]["display_name"] ?? "The staff account");

update_staff_status_respond([
    "success" => true,
    "changed" => !empty($result["changed"]),
    "message" => empty($result["changed"])
        ? $result["message"]
        : ($status === 1
            ? $name . " was reactivated successfully."
            : $name . " was deactivated successfully."),
    "user_id" => (int)$userId,
    "status" => (int)$status
]);
