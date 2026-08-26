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
        "message" => "Your session has expired or you do not have access. Please log in again."
    ], 401);
}

$assigned_by_user_id = (int) $_SESSION["user_id"];
$restaurant_id = (int) $_SESSION["restaurant_id"];

if ($assigned_by_user_id <= 0 || $restaurant_id <= 0) {
    respond_json([
        "success" => false,
        "message" => "Invalid user or restaurant session."
    ], 400);
}

$actorStmt = $conn->prepare("
    SELECT user_id, role, status
    FROM tbl_users
    WHERE user_id = ?
      AND restaurant_id = ?
    LIMIT 1
");

if (!$actorStmt) {
    respond_json([
        "success" => false,
        "message" => "Unable to verify your account permissions."
    ], 500);
}

$actorStmt->bind_param("ii", $assigned_by_user_id, $restaurant_id);
$actorStmt->execute();
$actor = $actorStmt->get_result()->fetch_assoc();
$actorStmt->close();

$actorRole = strtolower(trim((string)($actor["role"] ?? "")));
if (
    !$actor ||
    (int)($actor["status"] ?? 0) !== 1 ||
    !in_array($actorRole, ["owner", "cashier"], true)
) {
    respond_json([
        "success" => false,
        "message" => "Only an active restaurant owner or cashier can assign delivery riders."
    ], 403);
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

$delivery_staff_id = isset($data["delivery_staff_id"])
    ? (int) $data["delivery_staff_id"]
    : 0;

$delivery_fee = isset($data["delivery_fee"])
    ? (float) $data["delivery_fee"]
    : 0.00;

$delivery_staff_payment = isset($data["delivery_staff_payment"])
    ? (float) $data["delivery_staff_payment"]
    : 0.00;

if ($order_id <= 0 || $delivery_staff_id <= 0) {
    respond_json([
        "success" => false,
        "message" => "Order ID and rider ID are required."
    ], 400);
}

if ($delivery_fee < 0 || $delivery_staff_payment < 0) {
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
            TRIM(CONCAT_WS(' ', NULLIF(TRIM(first_name), ''), NULLIF(TRIM(middle_name), ''), NULLIF(TRIM(last_name), ''))) AS display_name
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
        $delivery_staff_id,
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
        WHERE delivery_staff_id = ?
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
        $delivery_staff_id,
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
        delivery_staff_id,
        assigned_by_user_id,
        assignment_type,
        delivery_status,
        delivery_fee,
        delivery_staff_payment,
        assigned_at,
        accepted_at
    )
    VALUES (
        ?,
        ?,
        ?,
        ?,
        'internal',
        'accepted',
        ?,
        ?,
        NOW(),
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
        $delivery_staff_id,
        $assigned_by_user_id,
        $delivery_fee,
        $delivery_staff_payment
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
    SET order_status = 'assigned'
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
    $rider["display_name"] .
    " was assigned and automatically accepted delivery Order #" .
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
    $assigned_by_user_id,
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
        "message" => "Rider assigned successfully. The delivery was automatically accepted.",
        "assignment" => [
            "assignment_id" => $assignment_id,
            "order_id" => $order_id,
            "delivery_staff_id" => $delivery_staff_id,
            "rider_name" => $rider["display_name"],
            "assignment_type" => "internal",
            "delivery_status" => "accepted",
            "delivery_fee" => $delivery_fee,
            "delivery_staff_payment" => $delivery_staff_payment
        ]
    ]);

} catch (Throwable $error) {
    try { $conn->rollback(); } catch (Throwable $ignored) {}

    $errorMessage = $error->getMessage();
    error_log("assign_delivery_rider.php error: " . $errorMessage);

    $safeErrors = [
        "Order not found or does not belong to this restaurant." => 404,
        "Only delivery orders can be assigned to a rider." => 409,
        "The order must be preparing before assigning a rider." => 409,
        "This order already has a delivery assignment." => 409,
        "The selected rider is invalid, inactive, or belongs to another restaurant." => 422,
        "The selected rider already has an active delivery." => 409
    ];

    $conn->close();

    if (isset($safeErrors[$errorMessage])) {
        respond_json([
            "success" => false,
            "message" => $errorMessage
        ], $safeErrors[$errorMessage]);
    }

    respond_json([
        "success" => false,
        "message" => "Unable to assign the rider right now."
    ], 500);
}
