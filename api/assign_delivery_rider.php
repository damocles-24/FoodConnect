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

if (!isset($_SESSION["user_id"], $_SESSION["restaurant_id"])) {
    respond_json([
        "success" => false,
        "message" => "Unauthorized access."
    ], 401);
}

$assigned_by = (int) $_SESSION["user_id"];
$restaurant_id = (int) $_SESSION["restaurant_id"];

if ($assigned_by <= 0 || $restaurant_id <= 0) {
    respond_json([
        "success" => false,
        "message" => "Invalid user or restaurant session."
    ], 400);
}

$data = json_decode(file_get_contents("php://input"), true);

if (!is_array($data)) {
    respond_json([
        "success" => false,
        "message" => "Invalid JSON request body."
    ], 400);
}

$order_id = isset($data["order_id"])
    ? (int) $data["order_id"]
    : 0;

$rider_id = isset($data["rider_id"])
    ? (int) $data["rider_id"]
    : 0;

$delivery_fee = isset($data["delivery_fee"])
    ? (float) $data["delivery_fee"]
    : 0.00;

$rider_payment = isset($data["rider_payment"])
    ? (float) $data["rider_payment"]
    : 0.00;

if ($order_id <= 0 || $rider_id <= 0) {
    respond_json([
        "success" => false,
        "message" => "Order ID and rider ID are required."
    ], 400);
}

if ($delivery_fee < 0 || $rider_payment < 0) {
    respond_json([
        "success" => false,
        "message" => "Delivery fee and rider payment cannot be negative."
    ], 400);
}

$conn->begin_transaction();

try {
    /*
    |--------------------------------------------------------------------------
    | Verify the order
    |--------------------------------------------------------------------------
    */

    $orderSql = "
        SELECT
            order_id,
            order_type,
            order_status
        FROM tbl_orders
        WHERE order_id = ?
          AND restaurant_id = ?
        LIMIT 1
        FOR UPDATE
    ";

    $orderStmt = $conn->prepare($orderSql);

    if (!$orderStmt) {
        throw new Exception("Failed to prepare order query.");
    }

    $orderStmt->bind_param("ii", $order_id, $restaurant_id);
    $orderStmt->execute();

    $orderResult = $orderStmt->get_result();
    $order = $orderResult->fetch_assoc();

    $orderStmt->close();

    if (!$order) {
        throw new Exception(
            "Order not found or does not belong to this restaurant."
        );
    }

    $order_type = strtolower(trim((string) $order["order_type"]));
    $order_status = strtolower(trim((string) $order["order_status"]));

    if ($order_type !== "delivery") {
        throw new Exception(
            "Only delivery orders can be assigned to a rider."
        );
    }

    if (
    !in_array(
        $order_status,
        ["preparing", "ready"],
        true
    )
) {
    throw new Exception(
        "The order must be preparing before assigning a rider."
    );
}

    /*
    |--------------------------------------------------------------------------
    | Check existing assignment
    |--------------------------------------------------------------------------
    */

    $existingSql = "
        SELECT assignment_id
        FROM tbl_delivery_assignments
        WHERE order_id = ?
        LIMIT 1
        FOR UPDATE
    ";

    $existingStmt = $conn->prepare($existingSql);

    if (!$existingStmt) {
        throw new Exception(
            "Failed to prepare delivery assignment validation."
        );
    }

    $existingStmt->bind_param("i", $order_id);
    $existingStmt->execute();

    $existingResult = $existingStmt->get_result();
    $existingAssignment = $existingResult->fetch_assoc();

    $existingStmt->close();

    if ($existingAssignment) {
        throw new Exception(
            "This order already has a delivery assignment."
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Verify the rider
    |--------------------------------------------------------------------------
    */

    $riderSql = "
        SELECT
            user_id,
            full_name
        FROM tbl_users
        WHERE user_id = ?
          AND restaurant_id = ?
          AND role = 'delivery_staff'
          AND status = 1
        LIMIT 1
        FOR UPDATE
    ";

    $riderStmt = $conn->prepare($riderSql);

    if (!$riderStmt) {
        throw new Exception("Failed to prepare rider query.");
    }

    $riderStmt->bind_param(
        "ii",
        $rider_id,
        $restaurant_id
    );

    $riderStmt->execute();

    $riderResult = $riderStmt->get_result();
    $rider = $riderResult->fetch_assoc();

    $riderStmt->close();

    if (!$rider) {
        throw new Exception(
            "The selected rider is invalid, inactive, or belongs to another restaurant."
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Check whether rider already has an active delivery
    |--------------------------------------------------------------------------
    */

    $availabilitySql = "
        SELECT assignment_id
        FROM tbl_delivery_assignments
        WHERE rider_id = ?
          AND restaurant_id = ?
          AND delivery_status NOT IN (
              'completed',
              'cancelled'
          )
        LIMIT 1
        FOR UPDATE
    ";

    $availabilityStmt = $conn->prepare($availabilitySql);

    if (!$availabilityStmt) {
        throw new Exception(
            "Failed to prepare rider availability query."
        );
    }

    $availabilityStmt->bind_param(
        "ii",
        $rider_id,
        $restaurant_id
    );

    $availabilityStmt->execute();

    $availabilityResult = $availabilityStmt->get_result();
    $activeDelivery = $availabilityResult->fetch_assoc();

    $availabilityStmt->close();

    if ($activeDelivery) {
        throw new Exception(
            "The selected rider already has an active delivery."
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Create internal delivery assignment
    |--------------------------------------------------------------------------
    */

    $insertSql = "
        INSERT INTO tbl_delivery_assignments (
            order_id,
            restaurant_id,
            rider_id,
            assigned_by,
            assignment_type,
            delivery_status,
            delivery_fee,
            rider_payment,
            assigned_at
        )
        VALUES (
            ?,
            ?,
            ?,
            ?,
            'internal',
            'assigned',
            ?,
            ?,
            NOW()
        )
    ";

    $insertStmt = $conn->prepare($insertSql);

    if (!$insertStmt) {
        throw new Exception(
            "Failed to prepare delivery assignment."
        );
    }

    $insertStmt->bind_param(
        "iiiidd",
        $order_id,
        $restaurant_id,
        $rider_id,
        $assigned_by,
        $delivery_fee,
        $rider_payment
    );

    $insertStmt->execute();

    if ($insertStmt->affected_rows <= 0) {
        $insertStmt->close();

        throw new Exception(
            "Failed to create the delivery assignment."
        );
    }

    $assignment_id = $insertStmt->insert_id;

    $insertStmt->close();

    /*
    |--------------------------------------------------------------------------
    | Synchronize the overall order status
    |--------------------------------------------------------------------------
    */

    $updateOrderSql = "
        UPDATE tbl_orders
        SET order_status = 'out_for_delivery'
        WHERE order_id = ?
          AND restaurant_id = ?
        AND order_status IN (
        'preparing',
        'ready'
)  
    ";

    $updateOrderStmt = $conn->prepare($updateOrderSql);

    if (!$updateOrderStmt) {
        throw new Exception(
            "Failed to prepare order status update."
        );
    }

    $updateOrderStmt->bind_param(
        "ii",
        $order_id,
        $restaurant_id
    );

    $updateOrderStmt->execute();

    if ($updateOrderStmt->affected_rows <= 0) {
        $updateOrderStmt->close();

        throw new Exception(
            "The order status could not be updated."
        );
    }

    $updateOrderStmt->close();

    /*
|--------------------------------------------------------------------------
| Record delivery assignment activity
|--------------------------------------------------------------------------
*/

$action_type = "delivery_assignment";
$action_title = "Rider Assigned";

$action_description =
    $rider["full_name"] .
    " was assigned to delivery Order #" .
    $order_id .
    ".";

$logSql = "
    INSERT INTO tbl_activity_logs (
        restaurant_id,
        user_id,
        action_type,
        action_title,
        action_description,
        created_at
    )
    VALUES (?, ?, ?, ?, ?, NOW())
";

$logStmt = $conn->prepare($logSql);

if (!$logStmt) {
    throw new Exception(
        "Failed to prepare delivery activity log."
    );
}

$logStmt->bind_param(
    "iisss",
    $restaurant_id,
    $assigned_by,
    $action_type,
    $action_title,
    $action_description
);

$logStmt->execute();

if ($logStmt->affected_rows <= 0) {
    $logStmt->close();

    throw new Exception(
        "Failed to record delivery assignment activity."
    );
}

$logStmt->close();

    $conn->commit();
    $conn->close();

    respond_json([
        "success" => true,
        "message" => "Rider assigned successfully.",
        "assignment" => [
            "assignment_id" => $assignment_id,
            "order_id" => $order_id,
            "rider_id" => $rider_id,
            "rider_name" => $rider["full_name"],
            "assignment_type" => "internal",
            "delivery_status" => "assigned",
            "delivery_fee" => $delivery_fee,
            "rider_payment" => $rider_payment
        ]
    ]);

} catch (Throwable $error) {
    $conn->rollback();
    $conn->close();

    respond_json([
        "success" => false,
        "message" => $error->getMessage()
    ], 409);
}