<?php

header(
    "Content-Type: application/json; charset=utf-8"
);

header(
    "Cache-Control: no-store, no-cache, must-revalidate, max-age=0"
);

header("Pragma: no-cache");
header("Expires: 0");

error_reporting(
    E_ALL &
    ~E_NOTICE &
    ~E_WARNING
);

ini_set(
    "display_errors",
    "0"
);

require_once __DIR__ . "/session_config.php";
require_once __DIR__ . "/db.php";
require_once __DIR__ . "/rate_limit.php";
require_once __DIR__ . "/order_stock_helper.php";

/* =========================================================
   JSON RESPONSE
========================================================= */

function respond_json(
    array $data,
    int $statusCode = 200
): void {
    http_response_code(
        $statusCode
    );

    echo json_encode(
        $data,
        JSON_UNESCAPED_UNICODE |
        JSON_UNESCAPED_SLASHES
    );

    exit;
}

/* =========================================================
   REQUEST METHOD
========================================================= */

if (
    strtoupper(
        (string)(
            $_SERVER["REQUEST_METHOD"] ??
            ""
        )
    ) !== "POST"
) {
    respond_json(
        [
            "success" => false,
            "message" =>
                "Only POST requests are allowed."
        ],
        405
    );
}

/* =========================================================
   AUTHENTICATION
========================================================= */

$customerId =
    (int)(
        $_SESSION["user_id"] ??
        0
    );

$role =
    strtolower(
        trim(
            (string)(
                $_SESSION["role"] ??
                ""
            )
        )
    );

if ($customerId <= 0) {
    respond_json(
        [
            "success" => false,
            "message" =>
                "Please log in before cancelling an order."
        ],
        401
    );
}

if (
    $role !== "" &&
    $role !== "customer"
) {
    respond_json(
        [
            "success" => false,
            "message" =>
                "Only customers may use this cancellation endpoint."
        ],
        403
    );
}

/* =========================================================
   REQUEST BODY
========================================================= */

$rawBody =
    file_get_contents(
        "php://input"
    );

$data =
    json_decode(
        $rawBody ?: "{}",
        true
    );

if (!is_array($data)) {
    respond_json(
        [
            "success" => false,
            "message" =>
                "Invalid cancellation request."
        ],
        400
    );
}

$orderId =
    (int)(
        $data["order_id"] ??
        0
    );

$cancellationReason =
    trim(
        (string)(
            $data["cancellation_reason"] ??
            ""
        )
    );

if ($orderId <= 0) {
    respond_json(
        [
            "success" => false,
            "message" =>
                "Invalid order."
        ],
        400
    );
}

rate_limit_enforce(
    $conn,
    "customer-order-cancel",
    rate_limit_identifier(
        (string)$customerId,
        rate_limit_client_ip()
    ),
    10,
    600,
    600,
    "Too many cancellation requests. Please wait 10 minutes and try again."
);

$reasonLength =
    mb_strlen(
        $cancellationReason
    );

if ($reasonLength < 3) {
    respond_json(
        [
            "success" => false,
            "message" =>
                "Please provide a clear cancellation reason."
        ],
        422
    );
}

if ($reasonLength > 250) {
    respond_json(
        [
            "success" => false,
            "message" =>
                "The cancellation reason must not exceed 250 characters."
        ],
        422
    );
}

/* =========================================================
   TRANSACTION
========================================================= */

$conn->begin_transaction();

try {

    /* =====================================================
       LOCK CUSTOMER ORDER
    ===================================================== */

    $orderStmt =
        $conn->prepare("
            SELECT
                o.order_id,
                o.queue_number,
                o.restaurant_id,
                o.user_id,
                o.customer_name,
                o.order_type,
                o.order_status,
                o.qr_verified_at,
                o.total_amount,
                o.created_at,

                r.name
                    AS restaurant_name

            FROM tbl_orders o

            INNER JOIN tbl_restaurants r
                ON r.restaurant_id =
                   o.restaurant_id

            WHERE o.order_id = ?
              AND o.user_id = ?

            LIMIT 1

            FOR UPDATE
        ");

    if (!$orderStmt) {
        throw new RuntimeException(
            "Unable to prepare the customer order."
        );
    }

    $orderStmt->bind_param(
        "ii",
        $orderId,
        $customerId
    );

    if (!$orderStmt->execute()) {
        $orderStmt->close();

        throw new RuntimeException(
            "Unable to load the customer order."
        );
    }

    $orderResult =
        $orderStmt->get_result();

    $order =
        $orderResult->fetch_assoc();

    $orderStmt->close();

    if (!$order) {
        $conn->rollback();

        respond_json(
            [
                "success" => false,
                "message" =>
                    "The order was not found or does not belong to your account."
            ],
            404
        );
    }

    $restaurantId =
        (int)$order["restaurant_id"];

    $currentStatus =
        strtolower(
            trim(
                (string)$order[
                    "order_status"
                ]
            )
        );

    /* =====================================================
   FIVE-MINUTE CANCELLATION WINDOW
===================================================== */

$orderCreatedAt =
    trim(
        (string)(
            $order["created_at"] ??
            ""
        )
    );

$orderCreatedTimestamp =
    strtotime(
        $orderCreatedAt
    );

$currentTimestamp =
    time();

$cancellationDeadline =
    $orderCreatedTimestamp !== false
        ? $orderCreatedTimestamp + 300
        : 0;

$cancelWindowExpired =
    $cancellationDeadline <= 0 ||
    $currentTimestamp >=
        $cancellationDeadline;

/*
 * Customer cancellation is allowed only when:
 *
 * 1. The order is still pending.
 * 2. The five-minute window has not expired.
 *
 * QR verification does not close the cancellation window.
 * Preparing or any later order status closes it immediately.
 */
if (
    $currentStatus !== "pending" ||
    $cancelWindowExpired
) {
    $conn->rollback();

    $message =
        $currentStatus !== "pending"
            ? "This order can no longer be cancelled because the restaurant has already started processing it."
            : "The 5-minute cancellation period for this order has already expired.";

    respond_json(
        [
            "success" => false,
            "message" => $message
        ],
        409
    );
}

    /* =====================================================
       RESTORE RESERVED STOCK
    ===================================================== */

    $stockRestoreSummary =
        restore_order_stock(
            $conn,
            $orderId,
            $restaurantId
        );

    $restoredUnits = 0;

    foreach (
        $stockRestoreSummary
        as $restoredQuantity
    ) {
        $restoredUnits +=
            max(
                0,
                (int)$restoredQuantity
            );
    }

    /* =====================================================
       CANCEL ACTIVE DELIVERY ASSIGNMENT

       Normally there should be no rider assignment while
       the order is pending, but this protects data integrity.
    ===================================================== */

    $deliveryStmt =
        $conn->prepare("
            UPDATE tbl_delivery_assignments

            SET
                delivery_status =
                    'cancelled',

                cancelled_at =
                    NOW()

            WHERE order_id = ?
              AND restaurant_id = ?
              AND delivery_status NOT IN (
                  'completed',
                  'cancelled'
              )
        ");

    if (!$deliveryStmt) {
        throw new RuntimeException(
            "Unable to prepare delivery cancellation."
        );
    }

    $deliveryStmt->bind_param(
        "ii",
        $orderId,
        $restaurantId
    );

    if (!$deliveryStmt->execute()) {
        $deliveryStmt->close();

        throw new RuntimeException(
            "Unable to cancel the delivery assignment."
        );
    }

    $deliveryStmt->close();

    /* =====================================================
       UPDATE ORDER

       The pending condition prevents duplicate cancellation
       and duplicate stock restoration.
    ===================================================== */

    $updateStmt =
        $conn->prepare("
            UPDATE tbl_orders

            SET
                order_status =
                    'cancelled',

                cancellation_reason = ?,

                cancelled_by =
                    'customer',

                cancelled_at =
                    NOW()

            WHERE order_id = ?
                AND user_id = ?
                AND restaurant_id = ?
                AND order_status =
                        'pending'
                AND created_at >
                        DATE_SUB(
                            NOW(),
            INTERVAL 5 MINUTE
        )
        ");

    if (!$updateStmt) {
        throw new RuntimeException(
            "Unable to prepare the order cancellation."
        );
    }

    $updateStmt->bind_param(
        "siii",
        $cancellationReason,
        $orderId,
        $customerId,
        $restaurantId
    );

    if (!$updateStmt->execute()) {
        $updateStmt->close();

        throw new RuntimeException(
            "Unable to cancel the order."
        );
    }

    if (
        $updateStmt->affected_rows !== 1
    ) {
        $updateStmt->close();

        throw new RuntimeException(
    "The order is already being processed or its 5-minute cancellation period has expired."
);
    }

    $updateStmt->close();

    /* =====================================================
       ACTIVITY LOG AND CASHIER NOTIFICATION

       get_cashier_notifications.php currently listens for
       the exact title "Customer Cancelled Order".
    ===================================================== */

    $queueLabel =
        $order["queue_number"] !== null
            ? "Queue #" .
                (int)$order[
                    "queue_number"
                ]
            : "No queue number";

    $customerName =
        trim(
            (string)(
                $order[
                    "customer_name"
                ] ??
                ""
            )
        );

    if ($customerName === "") {
        $customerName =
            "Customer";
    }

    $orderType =
        strtolower(
            trim(
                (string)$order[
                    "order_type"
                ]
            )
        );

   if ($orderType === "dine_in") {
    $orderTypeLabel = "Dine-in";

} elseif ($orderType === "takeout") {
    $orderTypeLabel = "Takeout";

} elseif ($orderType === "delivery") {
    $orderTypeLabel = "Delivery";

} else {
    $orderTypeLabel =
        ucwords(
            str_replace(
                "_",
                " ",
                $orderType
            )
        );
}

    $formattedAmount =
        number_format(
            (float)$order[
                "total_amount"
            ],
            2
        );

    $inventoryText =
        $restoredUnits > 0
            ? $restoredUnits .
                " stock unit" .
                (
                    $restoredUnits === 1
                        ? ""
                        : "s"
                ) .
                " restored."
            : "Reserved stock restored.";

    $actionTitle =
        "Customer Cancelled Order";

    $actionDescription =
        $customerName .
        " cancelled " .
        $queueLabel .
        ", Order #" .
        $orderId .
        ". Order type: " .
        $orderTypeLabel .
        ". Amount affected: ₱" .
        $formattedAmount .
        ". Reason: " .
        $cancellationReason .
        ". Inventory: " .
        $inventoryText;

    $logStmt =
        $conn->prepare("
            INSERT INTO tbl_activity_logs (
                restaurant_id,
                user_id,
                user_role,
                action_type,
                action_title,
                action_description
            )
            VALUES (
                ?,
                ?,
                'customer',
                'order',
                ?,
                ?
            )
        ");

    if (!$logStmt) {
        throw new RuntimeException(
            "Unable to prepare the cancellation activity."
        );
    }

    $logStmt->bind_param(
        "iiss",
        $restaurantId,
        $customerId,
        $actionTitle,
        $actionDescription
    );

    if (!$logStmt->execute()) {
        $logStmt->close();

        throw new RuntimeException(
            "Unable to record the cancellation activity."
        );
    }

    $logStmt->close();

    $conn->commit();
    $conn->close();

    respond_json([
        "success" => true,

        "message" =>
            "Your order was cancelled successfully.",

        "order" => [
            "order_id" =>
                $orderId,

            "order_status" =>
                "cancelled",

            "cancelled_by" =>
                "customer",

            "cancellation_reason" =>
                $cancellationReason
        ]
    ]);

} catch (Throwable $error) {
    $conn->rollback();

    error_log(
        "FoodConnect customer cancellation error: " .
        $error->getMessage()
    );

    $conn->close();

    respond_json(
        [
            "success" => false,
            "message" =>
                "Unable to cancel the order. Please refresh your orders and try again."
        ],
        500
    );
}