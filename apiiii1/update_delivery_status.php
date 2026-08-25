<?php

header("Content-Type: application/json; charset=utf-8");

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
        "message" => "Your session has expired or you do not have access. Please log in again."
    ], 401);
}

$delivery_staff_id = (int) $_SESSION["user_id"];
$restaurant_id = (int) $_SESSION["restaurant_id"];

if ($delivery_staff_id <= 0 || $restaurant_id <= 0) {
    respond_json([
        "success" => false,
        "message" => "Invalid delivery staff session."
    ], 400);
}

$staffStmt = $conn->prepare("
    SELECT user_id
    FROM tbl_users
    WHERE user_id = ?
      AND restaurant_id = ?
      AND role = 'delivery_staff'
      AND status = 1
    LIMIT 1
");

if (!$staffStmt) {
    respond_json([
        "success" => false,
        "message" => "Unable to verify the delivery staff account."
    ], 500);
}

$staffStmt->bind_param("ii", $delivery_staff_id, $restaurant_id);
$staffStmt->execute();
$staff = $staffStmt->get_result()->fetch_assoc();
$staffStmt->close();

if (!$staff) {
    respond_json([
        "success" => false,
        "message" => "This account is not authorized to update deliveries."
    ], 403);
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

$rider_latitude = isset($data["rider_latitude"]) && is_numeric($data["rider_latitude"])
    ? (float)$data["rider_latitude"]
    : null;

$rider_longitude = isset($data["rider_longitude"]) && is_numeric($data["rider_longitude"])
    ? (float)$data["rider_longitude"]
    : null;

if ($assignment_id <= 0 || $new_status === "") {
    respond_json([
        "success" => false,
        "message" => "Please check the information and try again."
    ], 400);
}

function coordinate_distance_meters(
    float $lat1,
    float $lon1,
    float $lat2,
    float $lon2
): float {
    $earthRadius = 6371000.0;
    $lat1Rad = deg2rad($lat1);
    $lat2Rad = deg2rad($lat2);
    $deltaLat = deg2rad($lat2 - $lat1);
    $deltaLon = deg2rad($lon2 - $lon1);

    $a = sin($deltaLat / 2) ** 2 +
        cos($lat1Rad) * cos($lat2Rad) *
        sin($deltaLon / 2) ** 2;

    return $earthRadius * 2 * atan2(sqrt($a), sqrt(1 - $a));
}

/*
|--------------------------------------------------------------------------
| Allowed delivery workflow
|--------------------------------------------------------------------------
*/

$workflow = [
    /*
     * Internal restaurant riders are automatically
     * accepted when assigned by the cashier.
     */
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
    delivery_staff_id,
    delivery_status
FROM tbl_delivery_assignments
        WHERE assignment_id = ?
          AND delivery_staff_id = ?
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
        $delivery_staff_id,
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

    $orderDetailStmt = $conn->prepare("
        SELECT
            order_id,
            order_type,
            order_status,
            payment_method,
            payment_status,
            customer_latitude,
            customer_longitude
        FROM tbl_orders
        WHERE order_id = ?
          AND restaurant_id = ?
        LIMIT 1
        FOR UPDATE
    ");

    if (!$orderDetailStmt) {
        throw new Exception("Unable to validate the delivery order.");
    }

    $orderDetailStmt->bind_param("ii", $assignment["order_id"], $restaurant_id);
    $orderDetailStmt->execute();
    $order = $orderDetailStmt->get_result()->fetch_assoc();
    $orderDetailStmt->close();

    if (!$order || strtolower(trim((string)$order["order_type"])) !== "delivery") {
        throw new Exception("The delivery order could not be verified.");
    }

    if ($new_status === "completed") {
        if (
            $rider_latitude === null ||
            $rider_longitude === null ||
            $rider_latitude < -90 || $rider_latitude > 90 ||
            $rider_longitude < -180 || $rider_longitude > 180
        ) {
            throw new Exception("Your current GPS location is required before completing this delivery.");
        }

        $customerLatitude = $order["customer_latitude"] !== null
            ? (float)$order["customer_latitude"]
            : null;
        $customerLongitude = $order["customer_longitude"] !== null
            ? (float)$order["customer_longitude"]
            : null;

        if ($customerLatitude === null || $customerLongitude === null) {
            throw new Exception("The customer's pinned delivery location is unavailable.");
        }

        $distanceMeters = coordinate_distance_meters(
            $rider_latitude,
            $rider_longitude,
            $customerLatitude,
            $customerLongitude
        );

        if ($distanceMeters > 100.0) {
            throw new Exception(
                "Move within 100 meters of the customer's pinned location before completing the delivery."
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Determine timestamp column
    |--------------------------------------------------------------------------
    */

    $timestampColumns = [
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
          AND delivery_staff_id = ?
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
        $delivery_staff_id,
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
    "picked_up" => "assigned",
    "out_for_delivery" => "out_for_delivery",
    "completed" => "completed"
];

    $order_status =
        $orderStatusMap[$new_status] ?? null;

    if ($order_status !== null) {
        $isCodCompletion =
            $new_status === "completed" &&
            strcasecmp(trim((string)($order["payment_method"] ?? "")), "Cash on Delivery") === 0;

        $orderSql = $isCodCompletion
            ? "
                UPDATE tbl_orders
                SET order_status = ?, payment_status = 'paid'
                WHERE order_id = ?
                  AND restaurant_id = ?
              "
            : "
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
    "picked_up" => "Order Picked Up",
    "out_for_delivery" => "Out for Delivery",
    "completed" => "Delivery Completed"
];

    $logDescriptions = [
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
        (
            strcasecmp(trim((string)($order["payment_method"] ?? "")), "Cash on Delivery") === 0
                ? " was delivered and the COD cash payment was confirmed."
                : " was completed successfully."
        )
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
        $delivery_staff_id,
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
    error_log("update_delivery_status.php error: " . $error->getMessage());

    $safeMessage = $error->getMessage();
    if (
        stripos($safeMessage, "prepare") !== false ||
        stripos($safeMessage, "execute") !== false ||
        stripos($safeMessage, "sql") !== false ||
        stripos($safeMessage, "query") !== false
    ) {
        $safeMessage = "The delivery could not be updated right now. Please try again.";
    }

    respond_json([
        "success" => false,
        "message" => $safeMessage
    ], 409);

} finally {
    $conn->close();
}