<?php

header("Content-Type: application/json; charset=utf-8");

session_set_cookie_params(0, "/FoodConnect", "", false, true);
require_once __DIR__ . "/session_config.php";

require_once __DIR__ . "/db.php";

function respond_json(array $data, int $statusCode = 200): void
{
    http_response_code($statusCode);
    echo json_encode($data);
    exit;
}

/*
|--------------------------------------------------------------------------
| Authentication
|--------------------------------------------------------------------------
*/

if (!isset($_SESSION["user_id"], $_SESSION["restaurant_id"])) {
    respond_json([
        "success" => false,
        "message" => "Unauthorized access.",
        "deliveries" => []
    ], 401);
}

$rider_id = (int) $_SESSION["user_id"];
$restaurant_id = (int) $_SESSION["restaurant_id"];

if ($rider_id <= 0 || $restaurant_id <= 0) {
    respond_json([
        "success" => false,
        "message" => "Invalid delivery staff session.",
        "deliveries" => []
    ], 400);
}

/*
|--------------------------------------------------------------------------
| Verify delivery staff account
|--------------------------------------------------------------------------
*/

$userSql = "
    SELECT
        user_id,
        full_name,
        role,
        status
    FROM tbl_users
    WHERE user_id = ?
      AND restaurant_id = ?
    LIMIT 1
";

$userStmt = $conn->prepare($userSql);

if (!$userStmt) {
    respond_json([
        "success" => false,
        "message" => "Failed to prepare staff validation query.",
        "deliveries" => []
    ], 500);
}

$userStmt->bind_param("ii", $rider_id, $restaurant_id);
$userStmt->execute();

$userResult = $userStmt->get_result();
$user = $userResult->fetch_assoc();

$userStmt->close();

if (
    !$user ||
    strtolower((string) $user["role"]) !== "delivery_staff" ||
    (int) $user["status"] !== 1
) {
    $conn->close();

    respond_json([
        "success" => false,
        "message" => "This account is not an active delivery staff account.",
        "deliveries" => []
    ], 403);
}

/*
|--------------------------------------------------------------------------
| Get assigned deliveries and order items
|--------------------------------------------------------------------------
*/

$sql = "
    SELECT
        da.assignment_id,
        da.order_id,
        da.restaurant_id,
        da.rider_id,
        da.assigned_by,
        da.assignment_type,
        da.delivery_status,
        da.delivery_fee,
        da.rider_payment,
        da.assigned_at,
        da.accepted_at,
        da.picked_up_at,
        da.out_for_delivery_at,
        da.completed_at,
        da.cancelled_at,

        o.queue_number,
        o.customer_name,
        o.contact_number,
        o.order_type,
        o.order_status,
        o.total_amount,
        o.payment_method,
        o.address,
        o.landmark,
        o.notes,
        o.created_at,

        oi.order_item_id,
        oi.product_id,
        oi.combo_id,
        oi.quantity,
        oi.price,
        oi.product_name,
        oi.base_text,
        oi.addon_text

    FROM tbl_delivery_assignments da

    INNER JOIN tbl_orders o
        ON o.order_id = da.order_id
       AND o.restaurant_id = da.restaurant_id

    LEFT JOIN tbl_order_items oi
        ON oi.order_id = o.order_id

    WHERE da.rider_id = ?
      AND da.restaurant_id = ?

    ORDER BY
        CASE da.delivery_status
            WHEN 'assigned' THEN 1
            WHEN 'accepted' THEN 2
            WHEN 'picked_up' THEN 3
            WHEN 'out_for_delivery' THEN 4
            WHEN 'completed' THEN 5
            WHEN 'cancelled' THEN 6
            ELSE 7
        END,
        da.created_at DESC,
        da.assignment_id DESC
";

$stmt = $conn->prepare($sql);

if (!$stmt) {
    $conn->close();

    respond_json([
        "success" => false,
        "message" => "Failed to prepare delivery orders query.",
        "deliveries" => []
    ], 500);
}

$stmt->bind_param("ii", $rider_id, $restaurant_id);
$stmt->execute();

$result = $stmt->get_result();

$deliveries = [];

while ($row = $result->fetch_assoc()) {
    $assignment_id = (int) $row["assignment_id"];

    if (!isset($deliveries[$assignment_id])) {
        $deliveries[$assignment_id] = [
            "assignment_id" => $assignment_id,
            "order_id" => (int) $row["order_id"],
            "restaurant_id" => (int) $row["restaurant_id"],
            "rider_id" => (int) $row["rider_id"],
            "assigned_by" => (int) $row["assigned_by"],

            "assignment_type" => $row["assignment_type"],
            "delivery_status" => $row["delivery_status"],

            "delivery_fee" => (float) $row["delivery_fee"],
            "rider_payment" => (float) $row["rider_payment"],

            "assigned_at" => $row["assigned_at"],
            "accepted_at" => $row["accepted_at"],
            "picked_up_at" => $row["picked_up_at"],
            "out_for_delivery_at" => $row["out_for_delivery_at"],
            "completed_at" => $row["completed_at"],
            "cancelled_at" => $row["cancelled_at"],

            "queue_number" => $row["queue_number"] !== null
                ? (int) $row["queue_number"]
                : null,

            "customer_name" => $row["customer_name"],
            "contact_number" => $row["contact_number"],
            "order_type" => $row["order_type"],
            "order_status" => $row["order_status"],

            "total_amount" => (float) $row["total_amount"],
            "payment_method" => $row["payment_method"],

            "address" => $row["address"],
            "landmark" => $row["landmark"],
            "notes" => $row["notes"],
            "created_at" => $row["created_at"],

            "items" => []
        ];
    }

    if (!empty($row["order_item_id"])) {
        $deliveries[$assignment_id]["items"][] = [
            "order_item_id" => (int) $row["order_item_id"],

            "product_id" => $row["product_id"] !== null
                ? (int) $row["product_id"]
                : null,

            "combo_id" => $row["combo_id"] !== null
                ? (int) $row["combo_id"]
                : null,

            "quantity" => (int) $row["quantity"],
            "price" => (float) $row["price"],
            "product_name" => $row["product_name"],
            "base_text" => $row["base_text"],
            "addon_text" => $row["addon_text"]
        ];
    }
}

$stmt->close();
$conn->close();

respond_json([
    "success" => true,
    "rider" => [
        "user_id" => $rider_id,
        "full_name" => $user["full_name"]
    ],
    "deliveries" => array_values($deliveries)
]);