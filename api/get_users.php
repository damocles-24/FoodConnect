<?php
header("Content-Type: application/json; charset=utf-8");
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Pragma: no-cache");

error_reporting(E_ALL & ~E_NOTICE & ~E_WARNING);
ini_set("display_errors", "0");

require_once __DIR__ . "/session_config.php";
require_once __DIR__ . "/db.php";
require_once __DIR__ . "/name_helper.php";

function get_users_respond(array $payload, int $code = 200): void
{
    http_response_code($code);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

$ownerId = (int)($_SESSION["user_id"] ?? 0);
$restaurantId = (int)($_SESSION["restaurant_id"] ?? 0);
$sessionRole = strtolower(trim((string)($_SESSION["role"] ?? "")));

if ($ownerId <= 0) {
    get_users_respond([
        "success" => false,
        "message" => "Your session has expired or you do not have access. Please log in again.",
        "users" => [],
        "password_reset_requests_pending" => 0
    ], 401);
}

if ($sessionRole !== "owner") {
    get_users_respond([
        "success" => false,
        "message" => "Only the restaurant owner can manage staff accounts.",
        "users" => [],
        "password_reset_requests_pending" => 0
    ], 403);
}

if ($restaurantId <= 0) {
    get_users_respond([
        "success" => false,
        "message" => "Your restaurant session has expired. Please log in again.",
        "users" => [],
        "password_reset_requests_pending" => 0
    ], 400);
}

$ownershipStmt = $conn->prepare("
    SELECT restaurant_id
    FROM tbl_restaurants
    WHERE restaurant_id = ?
      AND owner_id = ?
    LIMIT 1
");

if (!$ownershipStmt) {
    get_users_respond([
        "success" => false,
        "message" => "Unable to verify restaurant ownership.",
        "users" => [],
        "password_reset_requests_pending" => 0
    ], 500);
}

$ownershipStmt->bind_param("ii", $restaurantId, $ownerId);
if (!$ownershipStmt->execute()) {
    error_log("get_users.php ownership execute error: " . $ownershipStmt->error);
    $ownershipStmt->close();
    get_users_respond([
        "success" => false,
        "message" => "Unable to verify restaurant ownership.",
        "users" => [],
        "password_reset_requests_pending" => 0
    ], 500);
}

$ownedRestaurant = $ownershipStmt->get_result()->fetch_assoc();
$ownershipStmt->close();

if (!$ownedRestaurant) {
    get_users_respond([
        "success" => false,
        "message" => "You are not authorized to manage staff for this restaurant.",
        "users" => [],
        "password_reset_requests_pending" => 0
    ], 403);
}

$sql = "
    SELECT
        user_id,
        restaurant_id,
        role,
        first_name,
        middle_name,
        last_name,
        email,
        contact_number,
        address,
        status,
        must_change_password,
        created_at,
        CASE
            WHEN reset_token_hash IS NOT NULL
             AND reset_token_expires IS NOT NULL
             AND reset_token_expires >= ?
            THEN 1
            ELSE 0
        END AS password_reset_requested,
        CASE
            WHEN reset_token_hash IS NOT NULL
             AND reset_token_expires IS NOT NULL
             AND reset_token_expires >= ?
            THEN DATE_SUB(reset_token_expires, INTERVAL 7 DAY)
            ELSE NULL
        END AS password_reset_requested_at
    FROM tbl_users
    WHERE restaurant_id = ?
      AND role IN ('cashier', 'delivery_staff', 'delivery_coordinator')
    ORDER BY
        password_reset_requested DESC,
        created_at DESC,
        user_id DESC
";

$stmt = $conn->prepare($sql);
if (!$stmt) {
    error_log("get_users.php staff query prepare error: " . $conn->error);
    get_users_respond([
        "success" => false,
        "message" => "Unable to load staff accounts.",
        "users" => [],
        "password_reset_requests_pending" => 0
    ], 500);
}

$nowManila = date("Y-m-d H:i:s");
$stmt->bind_param("ssi", $nowManila, $nowManila, $restaurantId);
if (!$stmt->execute()) {
    error_log("get_users.php staff query execute error: " . $stmt->error);
    $stmt->close();
    get_users_respond([
        "success" => false,
        "message" => "Unable to load staff accounts.",
        "users" => [],
        "password_reset_requests_pending" => 0
    ], 500);
}

$result = $stmt->get_result();
$users = [];
$pendingRequests = 0;

while ($row = $result->fetch_assoc()) {
    $passwordResetRequested = (int)($row["password_reset_requested"] ?? 0);
    if ($passwordResetRequested === 1 && (int)$row["status"] === 1) {
        $pendingRequests++;
    }

    $users[] = [
        "user_id" => (int)$row["user_id"],
        "restaurant_id" => (int)$row["restaurant_id"],
        "role" => (string)$row["role"],
        "first_name" => (string)($row["first_name"] ?? ""),
        "middle_name" => (string)($row["middle_name"] ?? ""),
        "last_name" => (string)($row["last_name"] ?? ""),
        "display_name" => formatUserName($row),
        "email" => (string)$row["email"],
        "contact_number" => (string)($row["contact_number"] ?? ""),
        "address" => (string)($row["address"] ?? ""),
        "status" => (int)$row["status"],
        "must_change_password" => (int)($row["must_change_password"] ?? 0),
        "password_reset_requested" => $passwordResetRequested,
        "password_reset_requested_at" => $row["password_reset_requested_at"] ?? null,
        "created_at" => $row["created_at"]
    ];
}

$result->free();
$stmt->close();

get_users_respond([
    "success" => true,
    "users" => $users,
    "password_reset_requests_pending" => $pendingRequests
]);
