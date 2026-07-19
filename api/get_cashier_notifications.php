<?php

header("Content-Type: application/json; charset=utf-8");
header(
    "Cache-Control: no-store, no-cache, must-revalidate, max-age=0"
);

session_set_cookie_params(
    0,
    "/capshit",
    "",
    false,
    true
);

session_start();

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
        JSON_UNESCAPED_UNICODE
    );

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
        "message" => "Unauthorized access.",
        "notifications" => [],
        "unread_count" => 0
    ], 401);
}

$user_id = (int)$_SESSION["user_id"];
$restaurant_id = (int)$_SESSION["restaurant_id"];

$role = strtolower(
    trim(
        (string)(
            $_SESSION["role"] ?? ""
        )
    )
);

if (
    !in_array(
        $role,
        ["cashier", "owner"],
        true
    )
) {
    respond_json([
        "success" => false,
        "message" =>
            "You are not authorized to view cashier notifications.",
        "notifications" => [],
        "unread_count" => 0
    ], 403);
}

/* =========================================================
   NOTIFICATIONS QUERY

   Included:
   - new customer orders
   - cancellations performed by customers
   - low stock
   - out of stock

   Excluded:
   - Restaurant Cancelled Order
   - cashier's own cancellation action
========================================================= */

$stmt = $conn->prepare("
    SELECT
        logs.log_id,
        logs.action_type,
        logs.action_title,
        logs.action_description,
        logs.created_at,

        CASE
            WHEN reads.notification_read_id IS NULL
                THEN 0
            ELSE 1
        END AS is_read

    FROM tbl_activity_logs logs

    LEFT JOIN tbl_notification_reads reads
        ON reads.log_id = logs.log_id
       AND reads.user_id = ?
       AND reads.restaurant_id =
            logs.restaurant_id

    WHERE logs.restaurant_id = ?
      AND (
            logs.action_title LIKE
                '%New Customer Order%'

            OR logs.action_title =
                'Customer Cancelled Order'

            OR logs.action_title LIKE
                '%Low Stock%'

            OR logs.action_title LIKE
                '%Out of Stock%'
      )

    ORDER BY
        logs.created_at DESC,
        logs.log_id DESC

    LIMIT 30
");

if (!$stmt) {
    error_log(
        "FoodConnect cashier notification prepare error: " .
        $conn->error
    );

    $conn->close();

    respond_json([
        "success" => false,
        "message" =>
            "Unable to load notifications.",
        "notifications" => [],
        "unread_count" => 0
    ], 500);
}

$stmt->bind_param(
    "ii",
    $user_id,
    $restaurant_id
);

if (!$stmt->execute()) {
    error_log(
        "FoodConnect cashier notification execute error: " .
        $stmt->error
    );

    $stmt->close();
    $conn->close();

    respond_json([
        "success" => false,
        "message" =>
            "Unable to load notifications.",
        "notifications" => [],
        "unread_count" => 0
    ], 500);
}

$result = $stmt->get_result();

$notifications = [];
$unread_count = 0;

while ($row = $result->fetch_assoc()) {
    $row["log_id"] = (int)(
        $row["log_id"] ?? 0
    );

    $row["is_read"] = (int)(
        $row["is_read"] ?? 0
    );

    if ($row["is_read"] === 0) {
        $unread_count++;
    }

    $notifications[] = [
        "log_id" =>
            $row["log_id"],

        "action_type" =>
            trim(
                (string)(
                    $row["action_type"] ?? ""
                )
            ),

        "action_title" =>
            trim(
                (string)(
                    $row["action_title"] ?? ""
                )
            ),

        "action_description" =>
            trim(
                (string)(
                    $row["action_description"] ?? ""
                )
            ),

        "created_at" =>
            $row["created_at"] ?? null,

        "is_read" =>
            $row["is_read"]
    ];
}

$stmt->close();
$conn->close();

respond_json([
    "success" => true,
    "notifications" => $notifications,
    "unread_count" => $unread_count
]);