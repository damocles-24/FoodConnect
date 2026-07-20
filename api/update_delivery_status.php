<?php

header("Content-Type: application/json; charset=utf-8");

session_set_cookie_params(0, "/FoodConnect", "", false, true);
require_once __DIR__ . "/session_config.php";

require_once __DIR__ . "/db.php";

function respond_json(array $data, int $status = 200): void
{
    http_response_code($status);
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
        "message" => "Unauthorized access."
    ], 401);
}

$rider_id = (int) $_SESSION["user_id"];
$restaurant_id = (int) $_SESSION["restaurant_id"];

if ($rider_id <= 0 || $restaurant_id <= 0) {
    respond_json([
        "success" => false,
        "message" => "Invalid delivery staff session."
    ], 400);
}

$data = json_decode(file_get_contents("php://input"), true);

if (!is_array($data)) {
    respond_json([
        "success" => false,
        "message" => "Invalid JSON request body."
    ], 400);
}

$assignment_id = isset($data["assignment_id"])
    ? (int) $data["assignment_id"]
    : 0;

$new_status = strtolower(
    trim($data["delivery_status"] ?? "")
);

if ($assignment_id <= 0 || $new_status === "") {
    respond_json([
        "success" => false,
        "message" => "Invalid request."
    ], 400);
}

/*
|--------------------------------------------------------------------------
| Allowed delivery workflow
|--------------------------------------------------------------------------
*/

$workflow = [
    "assigned" => ["accepted"],
    "accepted" => ["picked_up"],
    "picked_up" => ["out_for_delivery"],
    "out_for_delivery" => ["completed"],
    "completed" => [],
    "cancelled" => []
];

$conn->begin_transaction();

try {

    /*
    |--------------------------------------------------------------------------
    | Lock and verify assignment
    |--------------------------------------------------------------------------
    */

    $assignmentSql = "
        SELECT
            assignment_id,
            order_id,
            restaurant_id,
            rider_id,
            delivery_status
        FROM tbl_delivery_assignments
        WHERE assignment_id = ?
          AND rider_id = ?
          AND restaurant_id = ?
        LIMIT 1
        FOR UPDATE
    ";

    $assignmentStmt = $conn->prepare($assignmentSql);

    if (!$assignmentStmt) {
        throw new Exception(
            "Failed to prepare assignment query: " .
            $conn->error
        );
    }

    $assignmentStmt->bind_param(
        "iii",
        $assignment_id,
        $rider_id,
        $restaurant_id
    );

    if (!$assignmentStmt->execute()) {
        $error = $assignmentStmt->error;
        $assignmentStmt->close();

        throw new Exception(
            "Failed to execute assignment query: " .
            $error
        );
    }

    $assignmentResult = $assignmentStmt->get_result();
    $assignment = $assignmentResult->fetch_assoc();

    $assignmentStmt->close();

    if (!$assignment) {
        throw new Exception(
            "Delivery assignment not found or does not belong to this rider."
        );
    }

    $current_status = strtolower(
        trim((string) $assignment["delivery_status"])
    );

    if (
        !isset($workflow[$current_status]) ||
        !in_array(
            $new_status,
            $workflow[$current_status],
            true
        )
    ) {
        throw new Exception(
            "Invalid delivery status transition from " .
            $current_status .
            " to " .
            $new_status .
            "."
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Determine timestamp column
    |--------------------------------------------------------------------------
    */

    $timestampColumns = [
        "accepted" => "accepted_at",
        "picked_up" => "picked_up_at",
        "out_for_delivery" => "out_for_delivery_at",
        "completed" => "completed_at"
    ];

    $timestampColumn =
        $timestampColumns[$new_status] ?? null;

    if ($timestampColumn === null) {
        throw new Exception(
            "Unsupported delivery status."
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Update delivery assignment
    |--------------------------------------------------------------------------
    */

    $deliveryUpdateSql = "
        UPDATE tbl_delivery_assignments
        SET
            delivery_status = ?,
            {$timestampColumn} = NOW()
        WHERE assignment_id = ?
          AND rider_id = ?
          AND restaurant_id = ?
          AND delivery_status = ?
    ";

    $deliveryStmt = $conn->prepare(
        $deliveryUpdateSql
    );

    if (!$deliveryStmt) {
        throw new Exception(
            "Failed to prepare delivery update: " .
            $conn->error
        );
    }

    $deliveryStmt->bind_param(
        "siiis",
        $new_status,
        $assignment_id,
        $rider_id,
        $restaurant_id,
        $current_status
    );

    if (!$deliveryStmt->execute()) {
        $error = $deliveryStmt->error;
        $deliveryStmt->close();

        throw new Exception(
            "Failed to update delivery status: " .
            $error
        );
    }

    if ($deliveryStmt->affected_rows <= 0) {
        $deliveryStmt->close();

        throw new Exception(
            "The delivery status could not be updated. " .
            "It may have already changed."
        );
    }

    $deliveryStmt->close();

    /*
    |--------------------------------------------------------------------------
    | Synchronize main order status
    |--------------------------------------------------------------------------
    */

    $orderStatusMap = [
        "accepted" => "assigned",
        "picked_up" => "assigned",
        "out_for_delivery" => "out_for_delivery",
        "completed" => "completed"
    ];

    $order_status =
        $orderStatusMap[$new_status] ?? null;

    if ($order_status !== null) {
        $orderSql = "
            UPDATE tbl_orders
            SET order_status = ?
            WHERE order_id = ?
              AND restaurant_id = ?
        ";

        $orderStmt = $conn->prepare($orderSql);

        if (!$orderStmt) {
            throw new Exception(
                "Failed to prepare order update: " .
                $conn->error
            );
        }

        $orderStmt->bind_param(
            "sii",
            $order_status,
            $assignment["order_id"],
            $restaurant_id
        );

        if (!$orderStmt->execute()) {
            $error = $orderStmt->error;
            $orderStmt->close();

            throw new Exception(
                "Failed to synchronize order status: " .
                $error
            );
        }

        /*
         * Do not require affected_rows > 0 here.
         *
         * accepted and picked_up both keep the main order
         * status as assigned. MySQL will return 0 affected
         * rows when the value is already assigned.
         */

        $orderStmt->close();
    }

    /*
    |--------------------------------------------------------------------------
    | Record delivery activity
    |--------------------------------------------------------------------------
    */

    $logTitles = [
        "accepted" => "Delivery Accepted",
        "picked_up" => "Order Picked Up",
        "out_for_delivery" => "Out for Delivery",
        "completed" => "Delivery Completed"
    ];

    $logDescriptions = [
        "accepted" =>
            "The rider accepted delivery Order #" .
            $assignment["order_id"] .
            ".",

        "picked_up" =>
            "The rider picked up delivery Order #" .
            $assignment["order_id"] .
            " from the restaurant.",

        "out_for_delivery" =>
            "Delivery Order #" .
            $assignment["order_id"] .
            " is now out for delivery.",

        "completed" =>
            "Delivery Order #" .
            $assignment["order_id"] .
            " was completed successfully."
    ];

    $action_type = "delivery_status";

    $action_title =
        $logTitles[$new_status] ??
        "Delivery Updated";

    $action_description =
        $logDescriptions[$new_status] ??
        (
            "Delivery Order #" .
            $assignment["order_id"] .
            " status changed to " .
            $new_status .
            "."
        );

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
            "Failed to prepare delivery activity log: " .
            $conn->error
        );
    }

    $logStmt->bind_param(
        "iisss",
        $restaurant_id,
        $rider_id,
        $action_type,
        $action_title,
        $action_description
    );

    if (!$logStmt->execute()) {
        $error = $logStmt->error;
        $logStmt->close();

        throw new Exception(
            "Failed to record delivery activity: " .
            $error
        );
    }

    if ($logStmt->affected_rows <= 0) {
        $logStmt->close();

        throw new Exception(
            "Failed to record delivery activity."
        );
    }

    $logStmt->close();

    /*
    |--------------------------------------------------------------------------
    | Commit transaction
    |--------------------------------------------------------------------------
    */

    $conn->commit();

    respond_json([
        "success" => true,
        "message" => "Delivery status updated successfully.",
        "delivery_status" => $new_status,
        "order_status" => $order_status
    ]);

} catch (Throwable $error) {
    $conn->rollback();

    respond_json([
        "success" => false,
        "message" => $error->getMessage()
    ], 409);

} finally {
    $conn->close();
}