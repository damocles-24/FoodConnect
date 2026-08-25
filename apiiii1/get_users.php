<?php

header("Content-Type: application/json; charset=utf-8");

require_once __DIR__ . "/session_config.php";

require_once __DIR__ . "/db.php";
require_once __DIR__ . "/name_helper.php";

/*
|--------------------------------------------------------------------------
| CHECK LOGIN SESSION
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| GET RESTAURANT ID
|--------------------------------------------------------------------------
*/

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

if (!$ownershipStmt->execute()) {
    error_log("get_users.php ownership execute error: " . $ownershipStmt->error);
    $ownershipStmt->close();
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Unable to verify restaurant ownership."
    ]);
    exit;
}

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

/*
|--------------------------------------------------------------------------
| GET USERS
|--------------------------------------------------------------------------
*/

$sql = "
   SELECT
    user_id,
    restaurant_id,
    role,

    first_name,
    middle_name,
    last_name,
    full_name,

    email,
    contact_number,
    address,
    status,
    must_change_password,
    created_at

    FROM tbl_users
    WHERE restaurant_id = ?
      AND role IN ('cashier', 'delivery_staff')
    ORDER BY created_at DESC, user_id DESC
";

$stmt = $conn->prepare($sql);

if (!$stmt) {
    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Unable to complete your request right now. Please try again."
    ]);

    exit;
}

$stmt->bind_param("i", $restaurant_id);

if (!$stmt->execute()) {
    error_log("get_users.php staff query execute error: " . $stmt->error);
    $stmt->close();
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Unable to load staff accounts."
    ]);
    exit;
}

$result = $stmt->get_result();

$users = [];

while ($row = $result->fetch_assoc()) {
    $users[] = [
    "user_id" =>
        (int) $row["user_id"],

    "restaurant_id" =>
        (int) $row["restaurant_id"],

    "role" =>
        $row["role"],

    "first_name" =>
        $row["first_name"] ?? "",

    "middle_name" =>
        $row["middle_name"] ?? "",

    "last_name" =>
        $row["last_name"] ?? "",

    "full_name" =>
        formatUserName($row),

    "email" =>
        $row["email"],
        "contact_number" => $row["contact_number"] ?? "",
        "address" => $row["address"] ?? "",
        "status" => (int) $row["status"],
        "must_change_password" => (int) ($row["must_change_password"] ?? 0),
        "created_at" => $row["created_at"]
    ];
}

$stmt->close();
$conn->close();

/*
|--------------------------------------------------------------------------
| RESPONSE
|--------------------------------------------------------------------------
*/

echo json_encode([
    "success" => true,
    "users" => $users
]);