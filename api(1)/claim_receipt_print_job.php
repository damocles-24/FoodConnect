<?php

header("Content-Type: application/json; charset=utf-8");
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Pragma: no-cache");
header("Expires: 0");

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

function respond_json(array $data, int $statusCode = 200): void
{
    http_response_code($statusCode);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function normalize_addon_text($value): string
{
    $text = trim((string)$value);

    if ($text === "" || $text === "[]" || strtolower($text) === "null") {
        return "No Add-on";
    }

    return $text;
}

function normalize_combo_choice_text($value): string
{
    $text = trim((string)$value);

    if ($text === "" || $text === "[]" || strtolower($text) === "null") {
        return "";
    }

    return $text;
}

if (!isset($conn) || !($conn instanceof mysqli)) {
    respond_json([
        "success" => false,
        "message" => "Database connection is unavailable."
    ], 500);
}

if (empty($_SESSION["user_id"]) || empty($_SESSION["restaurant_id"])) {
    $conn->close();

    respond_json([
        "success" => false,
        "message" => "Unauthorized access."
    ], 401);
}

$userId = (int)$_SESSION["user_id"];
$restaurantId = (int)$_SESSION["restaurant_id"];
$role = strtolower(trim((string)($_SESSION["role"] ?? "")));

if (!in_array($role, ["cashier", "owner"], true)) {
    $conn->close();

    respond_json([
        "success" => false,
        "message" => "You are not authorized to process receipt print jobs."
    ], 403);
}

if ($restaurantId <= 0) {
    $conn->close();

    respond_json([
        "success" => false,
        "message" => "Invalid or missing restaurant information."
    ], 400);
}

try {
    $conn->begin_transaction();

    /*
     * Automatically create one first-print job for each eligible order.
     *
     * Delivery:
     *   eligible as soon as the order exists.
     *
     * Dine-in / Takeout:
     *   eligible only after QR verification.
     *
     * UNIQUE(order_id, print_kind) prevents duplicate first-print jobs.
     */
    $seedSql = "
        INSERT IGNORE INTO tbl_receipt_print_jobs (
            order_id,
            restaurant_id,
            print_kind,
            trigger_source,
            status,
            created_at
        )
        SELECT
            o.order_id,
            o.restaurant_id,
            kinds.print_kind,
            CASE
                WHEN LOWER(TRIM(o.order_type)) = 'delivery'
                    THEN 'delivery_order'
                ELSE 'qr_verified'
            END,
            'pending',
            CASE
                WHEN LOWER(TRIM(o.order_type)) = 'delivery'
                    THEN o.created_at
                ELSE COALESCE(o.qr_verified_at, o.created_at)
            END
        FROM tbl_orders AS o
        CROSS JOIN (
            SELECT 'customer_receipt' AS print_kind, 1 AS kind_order
            UNION ALL
            SELECT 'kitchen_ticket' AS print_kind, 2 AS kind_order
        ) AS kinds
        WHERE o.restaurant_id = ?
          AND LOWER(TRIM(o.order_status)) <> 'cancelled'
          AND (
                LOWER(TRIM(o.order_type)) = 'delivery'

                OR (
                    LOWER(TRIM(o.order_type)) IN (
                        'dine-in',
                        'dinein',
                        'takeout',
                        'take-out'
                    )
                    AND o.qr_verified_at IS NOT NULL
                )
          )
        ORDER BY
            CASE
                WHEN LOWER(TRIM(o.order_type)) = 'delivery'
                    THEN o.created_at
                ELSE COALESCE(o.qr_verified_at, o.created_at)
            END ASC,
            o.order_id ASC,
            kinds.kind_order ASC
    ";

    $seedStmt = $conn->prepare($seedSql);

    if (!$seedStmt) {
        throw new RuntimeException("Unable to prepare receipt print queue.");
    }

    $seedStmt->bind_param("i", $restaurantId);

    if (!$seedStmt->execute()) {
        $seedStmt->close();
        throw new RuntimeException("Unable to update receipt print queue.");
    }

    $seedStmt->close();

    /*
     * If an order was cancelled before its pending receipt was claimed,
     * do not print it automatically.
     */
    $cancelStmt = $conn->prepare("
        UPDATE tbl_receipt_print_jobs AS jobs
        INNER JOIN tbl_orders AS orders
            ON orders.order_id = jobs.order_id
           AND orders.restaurant_id = jobs.restaurant_id
        SET
            jobs.status = 'cancelled',
            jobs.processed_at = NOW()
        WHERE jobs.restaurant_id = ?
          AND jobs.status = 'pending'
          AND LOWER(TRIM(orders.order_status)) = 'cancelled'
    ");

    if (!$cancelStmt) {
        throw new RuntimeException("Unable to prepare cancelled print-job cleanup.");
    }

    $cancelStmt->bind_param("i", $restaurantId);

    if (!$cancelStmt->execute()) {
        $cancelStmt->close();
        throw new RuntimeException("Unable to update cancelled print jobs.");
    }

    $cancelStmt->close();

    /*
     * Lock exactly one pending job. If two cashier browsers request a job
     * at the same time, they cannot claim the same row.
     */
    $claimStmt = $conn->prepare("
        SELECT
            print_job_id,
            order_id,
            print_kind,
            trigger_source
        FROM tbl_receipt_print_jobs
        WHERE restaurant_id = ?
          AND status = 'pending'
        ORDER BY created_at ASC, print_job_id ASC
        LIMIT 1
        FOR UPDATE
    ");

    if (!$claimStmt) {
        throw new RuntimeException("Unable to prepare receipt print claim.");
    }

    $claimStmt->bind_param("i", $restaurantId);

    if (!$claimStmt->execute()) {
        $claimStmt->close();
        throw new RuntimeException("Unable to claim the next receipt print job.");
    }

    $job = $claimStmt->get_result()->fetch_assoc();
    $claimStmt->close();

    if (!$job) {
        $conn->commit();
        $conn->close();

        respond_json([
            "success" => true,
            "job" => null,
            "order" => null
        ]);
    }

    $printJobId = (int)$job["print_job_id"];
    $orderId = (int)$job["order_id"];

    $markStmt = $conn->prepare("
        UPDATE tbl_receipt_print_jobs
        SET
            status = 'processing',
            claimed_by_user_id = ?,
            claimed_at = NOW()
        WHERE print_job_id = ?
          AND restaurant_id = ?
          AND status = 'pending'
    ");

    if (!$markStmt) {
        throw new RuntimeException("Unable to prepare receipt print claim update.");
    }

    $markStmt->bind_param(
        "iii",
        $userId,
        $printJobId,
        $restaurantId
    );

    if (!$markStmt->execute() || $markStmt->affected_rows !== 1) {
        $markStmt->close();
        throw new RuntimeException("Unable to reserve the receipt print job.");
    }

    $markStmt->close();

    $orderStmt = $conn->prepare("
        SELECT
            o.order_id,
            o.queue_number,
            o.restaurant_id,
            r.name AS restaurant_name,
            o.customer_name,
            o.contact_number,
            o.order_type,
            o.order_status,
            o.qr_verified_at,
            o.total_amount,
            o.subtotal,
            o.delivery_fee,
            o.payment_method,
            o.address,
            o.landmark,
            o.table_number,
            o.pickup_time,
            o.notes,
            o.created_at,

            oi.order_item_id,
            oi.product_id,
            oi.combo_id,
            oi.quantity,
            oi.price,
            oi.product_name,
            oi.base_text,
            oi.addon_text,
            oi.combo_choice_text

        FROM tbl_orders AS o

        INNER JOIN tbl_restaurants AS r
            ON r.restaurant_id = o.restaurant_id

        LEFT JOIN tbl_order_items AS oi
            ON oi.order_id = o.order_id

        WHERE o.order_id = ?
          AND o.restaurant_id = ?

        ORDER BY oi.order_item_id ASC
    ");

    if (!$orderStmt) {
        throw new RuntimeException("Unable to prepare receipt order data.");
    }

    $orderStmt->bind_param(
        "ii",
        $orderId,
        $restaurantId
    );

    if (!$orderStmt->execute()) {
        $orderStmt->close();
        throw new RuntimeException("Unable to load receipt order data.");
    }

    $result = $orderStmt->get_result();
    $order = null;

    while ($row = $result->fetch_assoc()) {
        if ($order === null) {
            $order = [
                "order_id" => (int)$row["order_id"],
                "queue_number" => $row["queue_number"] !== null
                    ? (int)$row["queue_number"]
                    : null,
                "restaurant_id" => (int)$row["restaurant_id"],
                "restaurant_name" => trim((string)($row["restaurant_name"] ?? "")),
                "customer_name" => trim((string)($row["customer_name"] ?? "")),
                "contact_number" => trim((string)($row["contact_number"] ?? "")),
                "order_type" => trim((string)($row["order_type"] ?? "")),
                "order_status" => trim((string)($row["order_status"] ?? "")),
                "qr_verified_at" => $row["qr_verified_at"] ?? null,
                "total_amount" => round((float)($row["total_amount"] ?? 0), 2),
                "subtotal" => round((float)($row["subtotal"] ?? 0), 2),
                "delivery_fee" => round((float)($row["delivery_fee"] ?? 0), 2),
                "payment_method" => trim((string)($row["payment_method"] ?? "")),
                "address" => trim((string)($row["address"] ?? "")),
                "landmark" => trim((string)($row["landmark"] ?? "")),
                "table_number" => trim((string)($row["table_number"] ?? "")),
                "pickup_time" => trim((string)($row["pickup_time"] ?? "")),
                "notes" => trim((string)($row["notes"] ?? "")),
                "created_at" => $row["created_at"],
                "items" => []
            ];
        }

        if (!empty($row["order_item_id"])) {
            $order["items"][] = [
                "order_item_id" => (int)$row["order_item_id"],
                "product_id" => $row["product_id"] !== null
                    ? (int)$row["product_id"]
                    : null,
                "combo_id" => $row["combo_id"] !== null
                    ? (int)$row["combo_id"]
                    : null,
                "quantity" => (int)($row["quantity"] ?? 0),
                "price" => round((float)($row["price"] ?? 0), 2),
                "product_name" => trim((string)($row["product_name"] ?? "")),
                "base_text" => trim((string)($row["base_text"] ?? "")),
                "addon_text" => normalize_addon_text($row["addon_text"] ?? ""),
                "combo_choice_text" => normalize_combo_choice_text($row["combo_choice_text"] ?? "")
            ];
        }
    }

    $orderStmt->close();

    if ($order === null) {
        throw new RuntimeException("The order for this receipt print job no longer exists.");
    }

    $conn->commit();
    $conn->close();

    respond_json([
        "success" => true,
        "job" => [
            "print_job_id" => $printJobId,
            "order_id" => $orderId,
            "print_kind" => (string)$job["print_kind"],
            "trigger_source" => (string)$job["trigger_source"]
        ],
        "order" => $order
    ]);

} catch (Throwable $error) {
    if (isset($conn) && $conn instanceof mysqli) {
        try {
            $conn->rollback();
        } catch (Throwable $rollbackError) {
            // Ignore rollback errors; original failure is logged below.
        }
    }

    error_log(
        "FoodConnect receipt print queue error: " .
        $error->getMessage()
    );

    if (isset($conn) && $conn instanceof mysqli) {
        $conn->close();
    }

    respond_json([
        "success" => false,
        "message" => "Unable to process the automatic receipt print queue."
    ], 500);
}
