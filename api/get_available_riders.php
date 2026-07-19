<?php

header("Content-Type: application/json; charset=utf-8");

session_set_cookie_params(0, "/capshit", "", false, true);
session_start();

require_once __DIR__ . "/db.php";

function respond_json(array $data, int $statusCode = 200): void
{
    http_response_code($statusCode);
    echo json_encode($data);
    exit;
}

if (!isset($_SESSION["user_id"], $_SESSION["restaurant_id"])) {
    respond_json([
        "success" => false,
        "message" => "Unauthorized access.",
        "riders" => []
    ], 401);
}

$restaurant_id = (int) $_SESSION["restaurant_id"];

if ($restaurant_id <= 0) {
    respond_json([
        "success" => false,
        "message" => "Invalid restaurant session.",
        "riders" => []
    ], 400);
}

/*
|--------------------------------------------------------------------------
| Available internal restaurant riders
|--------------------------------------------------------------------------
|
| A rider is considered available when:
| - Belongs to the same restaurant
| - Has the delivery_staff role
| - Is active
| - Has no active delivery assignment
|
*/

$sql = "
    SELECT
        u.user_id,
        u.full_name,
        u.email,
        u.contact_number,
        u.address,

        COUNT(da.assignment_id) AS active_delivery_count

    FROM tbl_users u

    LEFT JOIN tbl_delivery_assignments da
        ON da.rider_id = u.user_id
       AND da.restaurant_id = u.restaurant_id
       AND da.delivery_status NOT IN (
            'completed',
            'cancelled'
       )

    WHERE u.restaurant_id = ?
      AND u.role = 'delivery_staff'
      AND u.status = 1

    GROUP BY
        u.user_id,
        u.full_name,
        u.email,
        u.contact_number,
        u.address

    HAVING active_delivery_count = 0

    ORDER BY u.full_name ASC
";

$stmt = $conn->prepare($sql);

if (!$stmt) {
    respond_json([
        "success" => false,
        "message" => "Failed to prepare rider query.",
        "riders" => []
    ], 500);
}

$stmt->bind_param("i", $restaurant_id);
$stmt->execute();

$result = $stmt->get_result();

$riders = [];

while ($row = $result->fetch_assoc()) {
    $riders[] = [
        "user_id" => (int) $row["user_id"],
        "full_name" => $row["full_name"],
        "email" => $row["email"],
        "contact_number" => $row["contact_number"],
        "address" => $row["address"],
        "availability" => "available"
    ];
}

$stmt->close();
$conn->close();

respond_json([
    "success" => true,
    "riders" => $riders
]);