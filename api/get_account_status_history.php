<?php

/**
 * Account status history (deactivation / reactivation records).
 *
 * GET ?user_id=<target>
 *
 * Authorization (enforced here, not in the browser):
 *   - administrator -> history of RESTAURANT OWNER accounts only
 *   - restaurant owner -> history of cashier / delivery staff of the owner's OWN restaurant only
 *   - everyone else -> denied (customers and staff cannot read history)
 *
 * Returns plain text fields; the browser must still escape them before display.
 */

header("Content-Type: application/json; charset=utf-8");
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");

require_once __DIR__ . "/session_config.php";
require_once __DIR__ . "/db.php";
require_once __DIR__ . "/account_status_helper.php";

function status_history_respond(array $data, int $statusCode = 200): void
{
    http_response_code($statusCode);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

if (strtoupper((string)($_SERVER["REQUEST_METHOD"] ?? "GET")) !== "GET") {
    status_history_respond(["success" => false, "message" => "This action is not available."], 405);
}

$actorId = (int)($_SESSION["user_id"] ?? 0);
$actorRole = strtolower(trim((string)($_SESSION["role"] ?? "")));

if ($actorId <= 0) {
    status_history_respond(["success" => false, "message" => "Please log in again."], 401);
}

if (!in_array($actorRole, ["admin", "owner"], true)) {
    status_history_respond(["success" => false, "message" => "You are not allowed to view account history."], 403);
}

$targetId = filter_var($_GET["user_id"] ?? null, FILTER_VALIDATE_INT);

if ($targetId === false || $targetId === null || $targetId <= 0) {
    status_history_respond(["success" => false, "message" => "A valid account is required."], 422);
}

/* Confirm the signed-in account in the database. */
$actorStmt = $conn->prepare("SELECT user_id, role, status, restaurant_id FROM tbl_users WHERE user_id = ? LIMIT 1");

if (!$actorStmt) {
    status_history_respond(["success" => false, "message" => "Unable to verify your account."], 500);
}

$actorStmt->bind_param("i", $actorId);
$actorStmt->execute();
$actor = $actorStmt->get_result()->fetch_assoc();
$actorStmt->close();

if (
    !$actor ||
    (int)$actor["status"] !== 1 ||
    strtolower((string)$actor["role"]) !== $actorRole
) {
    status_history_respond(["success" => false, "message" => "You are not allowed to view account history."], 403);
}

$targetStmt = $conn->prepare("
    SELECT user_id, role, restaurant_id, status,
           TRIM(CONCAT_WS(' ', NULLIF(TRIM(first_name), ''), NULLIF(TRIM(middle_name), ''), NULLIF(TRIM(last_name), ''))) AS display_name
    FROM tbl_users
    WHERE user_id = ?
    LIMIT 1
");

if (!$targetStmt) {
    status_history_respond(["success" => false, "message" => "Unable to load the account."], 500);
}

$targetStmt->bind_param("i", $targetId);
$targetStmt->execute();
$target = $targetStmt->get_result()->fetch_assoc();
$targetStmt->close();

$targetRole = strtolower((string)($target["role"] ?? ""));
$allowed = false;

if ($target && $actorRole === "admin") {
    $allowed = $targetRole === "owner";
} elseif ($target && $actorRole === "owner") {
    $ownerRestaurantId = (int)($actor["restaurant_id"] ?? 0);

    if (
        in_array($targetRole, FC_STATUS_STAFF_ROLES, true) &&
        $ownerRestaurantId > 0 &&
        (int)$target["restaurant_id"] === $ownerRestaurantId
    ) {
        $ownedStmt = $conn->prepare("SELECT restaurant_id FROM tbl_restaurants WHERE restaurant_id = ? AND owner_id = ? LIMIT 1");

        if ($ownedStmt) {
            $ownedStmt->bind_param("ii", $ownerRestaurantId, $actorId);
            $ownedStmt->execute();
            $allowed = (bool)$ownedStmt->get_result()->fetch_assoc();
            $ownedStmt->close();
        }
    }
}

if (!$allowed) {
    /* Same answer for "not found" and "not yours" so ids cannot be probed. */
    status_history_respond(["success" => false, "message" => "You are not allowed to view this account's history."], 403);
}

$stmt = $conn->prepare("
    SELECT h.history_id, h.action, h.reason, h.note, h.created_at,
           TRIM(CONCAT_WS(' ', NULLIF(TRIM(p.first_name), ''), NULLIF(TRIM(p.last_name), ''))) AS performed_by_name,
           p.role AS performed_by_role
    FROM tbl_account_status_history h
    LEFT JOIN tbl_users p ON p.user_id = h.performed_by
    WHERE h.user_id = ?
    ORDER BY h.created_at DESC, h.history_id DESC
    LIMIT 200
");

if (!$stmt) {
    status_history_respond(["success" => false, "message" => "Unable to load the account history."], 500);
}

$stmt->bind_param("i", $targetId);

if (!$stmt->execute()) {
    $stmt->close();
    status_history_respond(["success" => false, "message" => "Unable to load the account history."], 500);
}

$result = $stmt->get_result();
$history = [];

while ($row = $result->fetch_assoc()) {
    $history[] = [
        "history_id" => (int)$row["history_id"],
        "action" => (string)$row["action"],
        "reason" => (string)($row["reason"] ?? ""),
        "note" => (string)($row["note"] ?? ""),
        "created_at" => (string)($row["created_at"] ?? ""),
        "performed_by" => (string)($row["performed_by_name"] ?? ""),
        "performed_by_role" => (string)($row["performed_by_role"] ?? "")
    ];
}

$stmt->close();

status_history_respond([
    "success" => true,
    "account" => [
        "user_id" => (int)$target["user_id"],
        "role" => $targetRole,
        "display_name" => (string)$target["display_name"],
        "status" => (int)$target["status"]
    ],
    "history" => $history
]);
