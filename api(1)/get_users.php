<?php

header("Content-Type: application/json; charset=utf-8");

require_once __DIR__ . "/session_config.php";

require_once __DIR__ . "/db.php";

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
    full_name,
    email,
    contact_number,
    address,
    status,
    created_at
    FROM tbl_users
    WHERE restaurant_id = ?
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

$stmt->execute();

$result = $stmt->get_result();

$users = [];

while ($row = $result->fetch_assoc()) {
    $users[] = [
        "user_id" => (int) $row["user_id"],
        "restaurant_id" => (int) $row["restaurant_id"],
        "role" => $row["role"],
        "full_name" => $row["full_name"],
        "email" => $row["email"],
        "contact_number" => $row["contact_number"] ?? "",
        "address" => $row["address"] ?? "",
        "status" => (int) $row["status"],
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