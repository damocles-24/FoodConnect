<?php

header("Content-Type: application/json; charset=utf-8");
header(
    "Cache-Control: no-store, no-cache, must-revalidate, max-age=0"
);

require_once __DIR__ . "/session_config.php";
require_once __DIR__ . "/db.php";

/* =========================================================
   JSON RESPONSE
========================================================= */

function respond_json(
    array $data,
    int $statusCode = 200
): void {
    http_response_code($statusCode);

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
        (string) ($_SERVER["REQUEST_METHOD"] ?? "")
    ) !== "GET"
) {
    respond_json([
        "success" => false,
        "message" => "This action is not available."
    ], 405);
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
        "message" => "Your session has expired or you do not have access. Please log in again."
    ], 401);
}

$user_id = (int) $_SESSION["user_id"];
$restaurant_id = (int) $_SESSION["restaurant_id"];

$role = strtolower(
    trim(
        (string) ($_SESSION["role"] ?? "")
    )
);

if (
    $user_id <= 0 ||
    $restaurant_id <= 0 ||
    $role !== "owner"
) {
    respond_json([
        "success" => false,
        "message" => "Owner access is required."
    ], 403);
}

/* =========================================================
   VERIFY RESTAURANT OWNERSHIP
========================================================= */

$ownerStmt = $conn->prepare("
    SELECT
        u.user_id
    FROM tbl_users u
    INNER JOIN tbl_restaurants r
        ON r.owner_id = u.user_id
    WHERE u.user_id = ?
      AND r.restaurant_id = ?
      AND LOWER(u.role) = 'owner'
    LIMIT 1
");

if (!$ownerStmt) {
    error_log(
        "get_recent_orders.php owner prepare error: " .
        $conn->error
    );

    respond_json([
        "success" => false,
        "message" => "Unable to verify the owner account."
    ], 500);
}

$ownerStmt->bind_param(
    "ii",
    $user_id,
    $restaurant_id
);

$ownerStmt->execute();

$ownerResult = $ownerStmt->get_result();
$ownerExists = $ownerResult->fetch_assoc();

$ownerStmt->close();

if (!$ownerExists) {
    respond_json([
        "success" => false,
        "message" => "Invalid owner restaurant session."
    ], 403);
}

/* =========================================================
   LOAD RECENT ORDERS WITH ITEMS

   One query is used instead of running another query
   separately for every order.
========================================================= */

$stmt = $conn->prepare("
    SELECT
        o.order_id,
        o.customer_name,
        o.total_amount,
        o.payment_method,
        o.order_status,
        o.address,
        o.created_at,

        GROUP_CONCAT(
            CONCAT(
                oi.quantity,
                'x ',
                COALESCE(
                    oi.product_name,
                    'Unknown Item'
                )
            )
            ORDER BY oi.order_item_id ASC
            SEPARATOR '|||'
        ) AS order_items

    FROM tbl_orders o

    LEFT JOIN tbl_order_items oi
        ON oi.order_id = o.order_id

    WHERE o.restaurant_id = ?

    GROUP BY
        o.order_id,
        o.customer_name,
        o.total_amount,
        o.payment_method,
        o.order_status,
        o.address,
        o.created_at

    ORDER BY o.created_at DESC

    LIMIT 5
");

if (!$stmt) {
    error_log(
        "get_recent_orders.php orders prepare error: " .
        $conn->error
    );

    respond_json([
        "success" => false,
        "message" => "Unable to load recent orders."
    ], 500);
}

$stmt->bind_param(
    "i",
    $restaurant_id
);

$stmt->execute();

$result = $stmt->get_result();

$orders = [];

while ($row = $result->fetch_assoc()) {
    $items = [];

    if (
        isset($row["order_items"]) &&
        trim((string) $row["order_items"]) !== ""
    ) {
        $items = explode(
            "|||",
            (string) $row["order_items"]
        );
    }

    $statusRaw = strtolower(
        trim(
            (string) (
                $row["order_status"] ?? "pending"
            )
        )
    );

    $statusLabels = [
        "pending" => "Pending",
        "order_received" => "Order Received",
        "preparing" => "Preparing",
        "ready" => "Ready",
        "assigned" => "Assigned",
        "out_for_delivery" => "Out for Delivery",
        "picked_up_by_customer" =>
            "Picked Up by Customer",
        "completed" => "Completed",
        "done" => "Completed",
        "cancelled" => "Cancelled"
    ];

    $status =
        $statusLabels[$statusRaw] ??
        ucwords(
            str_replace(
                "_",
                " ",
                $statusRaw
            )
        );

    $orders[] = [
        "id" =>
            "ORD-" . (int) $row["order_id"],

        "order_id" =>
            (int) $row["order_id"],

        "customer" =>
            trim(
                (string) (
                    $row["customer_name"] ??
                    "Unknown Customer"
                )
            ),

        "items" => $items,

        "total" =>
            round(
                (float) (
                    $row["total_amount"] ?? 0
                ),
                2
            ),

        "payment" =>
            trim(
                (string) (
                    $row["payment_method"] ??
                    "N/A"
                )
            ),

        "status" => $status,

        "status_raw" => $statusRaw,

        "date" =>
            $row["created_at"] ?? null,

        "address" =>
            trim(
                (string) (
                    $row["address"] ??
                    "N/A"
                )
            )
    ];
}

$stmt->close();

respond_json($orders);