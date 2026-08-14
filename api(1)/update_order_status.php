<?php

header("Content-Type: application/json; charset=utf-8");
header(
    "Cache-Control: no-store, no-cache, must-revalidate, max-age=0"
);

error_reporting(E_ALL & ~E_NOTICE & ~E_WARNING);
ini_set("display_errors", "0");

session_set_cookie_params(
    0,
    "/FoodConnect",
    "",
    false,
    true
);

require_once __DIR__ . "/session_config.php";

require_once __DIR__ . "/db.php";
require_once __DIR__ . "/order_stock_helper.php";

/* =========================================================
   JSON RESPONSE
========================================================= */

function respond_json(
    array $data,
    int $statusCode = 200
): void {
    http_response_code($statusCode);
    echo json_encode($data);
    exit;
}

/* =========================================================
   AUTHENTICATION
========================================================= */

if (
    empty($_SESSION["user_id"]) ||
    empty($_SESSION["restaurant_id"])
) {
    respond_json([
        "success" => false,
        "message" => "Unauthorized access."
    ], 401);
}

$user_id = (int)$_SESSION["user_id"];

$restaurant_id = (int)(
    $_SESSION["restaurant_id"] ?? 0
);

$role = strtolower(
    trim(
        (string)(
            $_SESSION["role"] ?? ""
        )
    )
);

$allowedRoles = [
    "cashier",
    "owner"
];

if (!in_array($role, $allowedRoles, true)) {
    respond_json([
        "success" => false,
        "message" =>
            "You are not authorized to update order statuses."
    ], 403);
}

if (
    $user_id <= 0 ||
    $restaurant_id <= 0
) {
    respond_json([
        "success" => false,
        "message" =>
            "Invalid or missing restaurant session."
    ], 400);
}

/* =========================================================
   REQUEST
========================================================= */

$rawInput = file_get_contents(
    "php://input"
);

$data = json_decode(
    $rawInput,
    true
);

if (!is_array($data)) {
    respond_json([
        "success" => false,
        "message" => "Invalid JSON request body."
    ], 400);
}

$order_id = (int)(
    $data["order_id"] ?? 0
);

$new_status = strtolower(
    trim(
        (string)(
            $data["order_status"] ?? ""
        )
    )
);

$cancellation_reason = trim(
    (string)(
        $data["cancellation_reason"] ?? ""
    )
);


$allowedStatuses = [
    "pending",
    "preparing",
    "ready",
    "completed",
    "cancelled"
];

if (
    $order_id <= 0 ||
    !in_array(
        $new_status,
        $allowedStatuses,
        true
    )
) {
    respond_json([
        "success" => false,
        "message" =>
            "Invalid order ID or order status."
    ], 400);
}

if (
    $new_status === "cancelled" &&
    $cancellation_reason === ""
) {
    respond_json([
        "success" => false,
        "message" => "Please select a cancellation reason."
    ], 400);
}

/* =========================================================
   TRANSACTION
========================================================= */

$conn->begin_transaction();

try {

    /* =====================================================
       LOCK CURRENT ORDER
    ===================================================== */

    $checkStmt = $conn->prepare("
    SELECT
            order_id,
            queue_number,
            restaurant_id,
            processed_by_cashier_id,
            user_id,
            customer_name,
            order_type,
            total_amount,
            payment_method,
            payment_status,
            order_status

        FROM tbl_orders

        WHERE order_id = ?
          AND restaurant_id = ?

        LIMIT 1

        FOR UPDATE
    ");
    

    if (!$checkStmt) {
        throw new RuntimeException(
            "Unable to prepare order validation."
        );
    }

    $checkStmt->bind_param(
        "ii",
        $order_id,
        $restaurant_id
    );

    if (!$checkStmt->execute()) {
        $checkStmt->close();

        throw new RuntimeException(
            "Unable to validate the order."
        );
    }

    $result =
        $checkStmt->get_result();

    $order =
        $result->fetch_assoc();

    $checkStmt->close();

    if (!$order) {
        $conn->rollback();

        respond_json([
            "success" => false,
            "message" =>
                "Order not found or does not belong to this restaurant."
        ], 404);
    }

    $current_status = strtolower(
        trim(
            (string)(
                $order["order_status"] ?? ""
            )
        )
    );

    if ($new_status === "cancelled") {
    $reasonLength = mb_strlen(
        $cancellation_reason
    );

    if (
        $reasonLength < 3 ||
        $reasonLength > 255
    ) {
        respond_json([
            "success" => false,
            "message" =>
                "Please provide a cancellation reason between 3 and 255 characters."
        ], 400);
    }
}

    $order_type = strtolower(
        trim(
            (string)(
                $order["order_type"] ?? ""
            )
        )
    );

    $customer_id = (int)(
    $order["user_id"] ?? 0
);

$queue_number =
    $order["queue_number"] !== null
        ? (int)$order["queue_number"]
        : null;

$customer_name = trim(
    (string)(
        $order["customer_name"] ??
        ""
    )
);

if ($customer_name === "") {
    $customer_name =
        "Unknown Customer";
}

$total_amount =
    (float)(
        $order["total_amount"] ??
        0
    );

switch ($order_type) {
    case "dine_in":
        $order_type_label = "Dine-in";
        break;

    case "takeout":
        $order_type_label = "Takeout";
        break;

    case "delivery":
        $order_type_label = "Delivery";
        break;

    default:
        $order_type_label = ucwords(
            str_replace(
                "_",
                " ",
                $order_type
            )
        );
        break;
}

/* =====================================================
   AUTHENTICATED ACTOR
===================================================== */

$actorName =
    $role === "owner"
        ? "Restaurant Owner"
        : "Cashier";

$actorStmt = $conn->prepare("
    SELECT
        full_name

    FROM tbl_users

    WHERE user_id = ?

    LIMIT 1
");

if (!$actorStmt) {
    throw new RuntimeException(
        "Unable to prepare actor information."
    );
}

$actorStmt->bind_param(
    "i",
    $user_id
);

if (!$actorStmt->execute()) {
    $actorStmt->close();

    throw new RuntimeException(
        "Unable to load actor information."
    );
}

$actorResult =
    $actorStmt->get_result();

$actorRow =
    $actorResult->fetch_assoc();

$actorStmt->close();

$loadedActorName = trim(
    (string)(
        $actorRow["full_name"] ??
        ""
    )
);

if ($loadedActorName !== "") {
    $actorName =
        $loadedActorName;
}

$actorRoleLabel =
    $role === "owner"
        ? "Restaurant Owner"
        : "Cashier";

    /*
     * Avoid performing the same action twice.
     */
    if ($current_status === $new_status) {
        $conn->rollback();

        respond_json([
            "success" => true,
            "message" =>
                "Order already has this status.",
            "order_id" =>
                $order_id,
            "order_status" =>
                $current_status
        ]);
    }

    /* =====================================================
       ONLINE PAYMENT GATE

       PayMongo orders cannot enter preparation or completion
       until PayMongo has confirmed payment. Cancellation remains
       allowed so an unpaid order can still be safely closed.
    ===================================================== */

    $orderPaymentMethod = trim(
        (string)(
            $order["payment_method"] ?? ""
        )
    );

    $orderPaymentStatus = strtolower(
        trim(
            (string)(
                $order["payment_status"] ?? ""
            )
        )
    );

    if (
        $orderPaymentMethod === "PayMongo QR Ph" &&
        $new_status !== "cancelled" &&
        $new_status !== "pending" &&
        $orderPaymentStatus !== "paid"
    ) {
        $conn->rollback();

        respond_json([
            "success" => false,
            "message" =>
                "PayMongo payment must be confirmed before this order can be prepared."
        ], 409);
    }

    /* =====================================================
       STATUS TRANSITIONS
    ===================================================== */

   $allowedTransitions = [
    "pending" => [
        "preparing",
        "cancelled"
    ],

    /*
     * Dine-in and Takeout orders can be
     * completed directly from Preparing.
     *
     * Ready remains supported for older
     * existing records.
     */
    "preparing" => [
        "ready",
        "completed",
        "cancelled"
    ],

    "ready" => [
        "completed",
        "cancelled"
    ],

    "completed" => [],

    "cancelled" => []
];

    $allowedNextStatuses =
        $allowedTransitions[
            $current_status
        ] ?? [];

    if (
        !in_array(
            $new_status,
            $allowedNextStatuses,
            true
        )
    ) {
        $conn->rollback();

        respond_json([
            "success" => false,
            "message" =>
                "Invalid status transition from " .
                $current_status .
                " to " .
                $new_status .
                "."
        ], 409);
    }

   /*
 * Delivery orders cannot be completed directly
 * by the cashier.
 *
 * They must go through rider assignment and the
 * delivery workflow.
 */
if (
    $order_type === "delivery" &&
    $new_status === "completed"
) {
    $conn->rollback();

    respond_json([
        "success" => false,
        "message" =>
            "A delivery order must be assigned and delivered before completion."
    ], 409);
}

    /* =====================================================
       STOCK RESTORATION

       This restores:
       - normal products
       - fixed combo components
       - selected combo choices
       - selected add-ons

       The combo parent is not restored.
    ===================================================== */

    $stockRestoreSummary = null;

    if ($new_status === "cancelled") {
        $stockRestoreSummary =
            restore_order_stock(
                $conn,
                $order_id,
                $restaurant_id
            );

        /* =============================================
           CANCEL ACTIVE DELIVERY ASSIGNMENT
        ============================================= */

        $cancelAssignmentStmt = $conn->prepare("
            UPDATE tbl_delivery_assignments

            SET
                delivery_status = 'cancelled',
                cancelled_at = NOW()

            WHERE order_id = ?
              AND restaurant_id = ?
              AND delivery_status NOT IN (
                  'completed',
                  'cancelled'
              )
        ");

        if ($cancelAssignmentStmt) {
            $cancelAssignmentStmt->bind_param(
                "ii",
                $order_id,
                $restaurant_id
            );

            if (
                !$cancelAssignmentStmt->execute()
            ) {
                $cancelAssignmentStmt->close();

                throw new RuntimeException(
                    "Unable to cancel the active delivery assignment."
                );
            }

            $cancelAssignmentStmt->close();
        }
    }

    /* =====================================================
   UPDATE ORDER STATUS

   The old-status condition protects against concurrent
   updates.
===================================================== */

$cancelled_by = null;

/*
 * Save the first cashier who handles the order.
 *
 * COALESCE in the UPDATE query ensures that another
 * cashier cannot overwrite the original cashier.
 *
 * Owner actions do not assign a cashier.
 */
$processed_by_cashier_id =
    $role === "cashier"
        ? $user_id
        : null;

if ($new_status === "cancelled") {
    $cancelled_by =
        $role === "owner"
            ? "owner"
            : "cashier";

    $updateStmt = $conn->prepare("
        UPDATE tbl_orders

        SET
            order_status = 'cancelled',
            cancellation_reason = ?,
            cancelled_by = ?,
            cancelled_at = NOW(),

            processed_by_cashier_id =
                COALESCE(
                    processed_by_cashier_id,
                    ?
                )

        WHERE order_id = ?
          AND restaurant_id = ?
          AND order_status = ?
    ");

    if (!$updateStmt) {
        throw new RuntimeException(
            "Unable to prepare the cancellation update."
        );
    }

    $updateStmt->bind_param(
        "ssiiis",
        $cancellation_reason,
        $cancelled_by,
        $processed_by_cashier_id,
        $order_id,
        $restaurant_id,
        $current_status
    );
}
 else {
    $updateStmt = $conn->prepare("
        UPDATE tbl_orders

        SET
            order_status = ?,
            cancellation_reason = NULL,
            cancelled_by = NULL,
            cancelled_at = NULL,

            processed_by_cashier_id =
                COALESCE(
                    processed_by_cashier_id,
                    ?
                )

        WHERE order_id = ?
          AND restaurant_id = ?
          AND order_status = ?
    ");

    if (!$updateStmt) {
        throw new RuntimeException(
            "Unable to prepare the order update."
        );
    }

    $updateStmt->bind_param(
        "siiis",
        $new_status,
        $processed_by_cashier_id,
        $order_id,
        $restaurant_id,
        $current_status
    );
}

if (!$updateStmt->execute()) {
    $updateStmt->close();

    throw new RuntimeException(
        "Unable to update the order status."
    );
}

if ($updateStmt->affected_rows !== 1) {
    $updateStmt->close();

    throw new RuntimeException(
        "The order status was changed by another user."
    );
}

$updateStmt->close();

    /* =====================================================
       ACTIVITY LOG
    ===================================================== */

    $logStmt = $conn->prepare("
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
            ?,
            'order',
            ?,
            ?
        )
    ");

    if (!$logStmt) {
        throw new RuntimeException(
            "Unable to prepare activity logging."
        );
    }

    if ($new_status === "cancelled") {
    $statusTitle =
        "Order #" .
        $order_id .
        " Cancelled";

    $queueLabel =
        $queue_number !== null
            ? "Queue #" .
                $queue_number
            : "No queue number";

    $formattedAmount =
        number_format(
            $total_amount,
            2
        );

    $restoredStockUnits = 0;

    if (
        is_array(
            $stockRestoreSummary
        )
    ) {
        foreach (
            $stockRestoreSummary
            as $restoredQuantity
        ) {
            $restoredStockUnits +=
                max(
                    0,
                    (int)$restoredQuantity
                );
        }
    }

    $stockRestorationText =
        $restoredStockUnits > 0
            ? $restoredStockUnits .
                " stock unit" .
                (
                    $restoredStockUnits === 1
                        ? ""
                        : "s"
                ) .
                " restored."
            : "Reserved stock restored.";

    $statusDescription =
        $actorName .
        " (" .
        $actorRoleLabel .
        ") cancelled " .
        $queueLabel .
        ", Order #" .
        $order_id .
        " for " .
        $customer_name .
        ". Order type: " .
        $order_type_label .
        ". Amount affected: ₱" .
        $formattedAmount .
        ". Reason: " .
        $cancellation_reason .
        ". Inventory: " .
        $stockRestorationText;
} else {
    $statusTitle =
        "Order Status Updated";

    $statusDescription =
        $actorName .
        " (" .
        $actorRoleLabel .
        ") changed Order #" .
        $order_id .
        " from " .
        ucwords(
            str_replace(
                "_",
                " ",
                $current_status
            )
        ) .
        " to " .
        ucwords(
            str_replace(
                "_",
                " ",
                $new_status
            )
        ) .
        ".";
}


    $logStmt->bind_param(
        "iisss",
        $restaurant_id,
        $user_id,
        $role,
        $statusTitle,
        $statusDescription
    );

    if (!$logStmt->execute()) {
        $logStmt->close();

        throw new RuntimeException(
            "Unable to save the activity log."
        );
    }

    $logStmt->close();

    /* =====================================================
       COMMIT
    ===================================================== */

    $conn->commit();

    respond_json([
        "success" => true,
        "message" =>
            "Order status updated successfully.",

        "order_id" =>
            $order_id,

        "previous_status" =>
            $current_status,

        "order_status" =>
            $new_status,

        "order_type" =>
    $order_type,

    "processed_by_cashier_id" =>
    $processed_by_cashier_id ??
    (
        isset(
            $order["processed_by_cashier_id"]
        )
            ? (int) $order[
                "processed_by_cashier_id"
            ]
            : null
    ),

"cancellation_reason" =>
    $new_status === "cancelled"
        ? $cancellation_reason
        : null,

"cancelled_by" =>
    $new_status === "cancelled"
        ? $cancelled_by
        : null,

"stock_restored" =>
    $new_status === "cancelled",

        "stock_restore_summary" =>
            $stockRestoreSummary
    ]);

} catch (Throwable $exception) {

    try {
        $conn->rollback();
    } catch (Throwable $rollbackException) {
        error_log(
            "FoodConnect status rollback error: " .
            $rollbackException->getMessage()
        );
    }

    error_log(
        "FoodConnect order status error: " .
        $exception->getMessage()
    );

    respond_json([
        "success" => false,
        "message" =>
            "Unable to update the order status. Please try again."
    ], 500);
}
