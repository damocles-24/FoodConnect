<?php

header(
    "Content-Type: application/json; charset=utf-8"
);

header(
    "Cache-Control: no-store, no-cache, must-revalidate, max-age=0"
);

session_set_cookie_params(
    0,
    "/FoodConnect",
    "",
    false,
    true
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
        JSON_UNESCAPED_UNICODE
    );

    exit;
}

/* =========================================================
   DATABASE CONNECTION CHECK
========================================================= */

if (
    !isset($conn) ||
    !($conn instanceof mysqli)
) {
    respond_json([
        "success" => false,
        "message" =>
            "Database connection is unavailable.",
        "notifications" => [],
        "unread_count" => 0
    ], 500);
}

/* =========================================================
   AUTHENTICATION
========================================================= */

if (
    empty($_SESSION["user_id"]) ||
    empty($_SESSION["restaurant_id"])
) {
    $conn->close();

    respond_json([
        "success" => false,
        "message" =>
            "Unauthorized access.",
        "notifications" => [],
        "unread_count" => 0
    ], 401);
}

$user_id =
    (int)$_SESSION["user_id"];

$restaurant_id =
    (int)$_SESSION["restaurant_id"];

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
    $conn->close();

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
   - New customer orders
   - Customer cancellations
   - Low-stock notifications
   - Out-of-stock notifications

   Excluded:
   - Restaurant cancellation notifications
   - Cashier's own cancellation action
========================================================= */

$sql = "
    SELECT
        activity_logs.log_id,
        activity_logs.action_type,
        activity_logs.action_title,
        activity_logs.action_description,
        activity_logs.created_at,

        CASE
            WHEN notification_reads.notification_read_id
                IS NULL
            THEN 0
            ELSE 1
        END AS is_read

    FROM tbl_activity_logs AS activity_logs

    LEFT JOIN tbl_notification_reads AS notification_reads
        ON notification_reads.log_id =
            activity_logs.log_id

       AND notification_reads.user_id = ?

       AND notification_reads.restaurant_id =
            activity_logs.restaurant_id

    WHERE activity_logs.restaurant_id = ?

      AND (
            activity_logs.action_title LIKE
                '%New Customer Order%'

            OR activity_logs.action_title =
                'Customer Cancelled Order'

            OR activity_logs.action_title LIKE
                '%Low Stock%'

            OR activity_logs.action_title LIKE
                '%Out of Stock%'
      )

    ORDER BY
        activity_logs.created_at DESC,
        activity_logs.log_id DESC

    LIMIT 30
";

$stmt = $conn->prepare($sql);

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

/* =========================================================
   BIND PARAMETERS
========================================================= */

if (
    !$stmt->bind_param(
        "ii",
        $user_id,
        $restaurant_id
    )
) {
    error_log(
        "FoodConnect cashier notification bind error: " .
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

/* =========================================================
   EXECUTE QUERY
========================================================= */

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

if (!$result) {
    error_log(
        "FoodConnect cashier notification result error: " .
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

/* =========================================================
   BUILD RESPONSE
========================================================= */

$notifications = [];
$unread_count = 0;

while (
    $row = $result->fetch_assoc()
) {
    $log_id = (int)(
        $row["log_id"] ?? 0
    );

    $is_read = (int)(
        $row["is_read"] ?? 0
    );

    if ($is_read === 0) {
        $unread_count++;
    }

    $notifications[] = [
        "log_id" =>
            $log_id,

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
            $is_read
    ];
}

/* =========================================================
   CLEANUP
========================================================= */

$result->free();
$stmt->close();
$conn->close();

/* =========================================================
   SUCCESS RESPONSE
========================================================= */

respond_json([
    "success" => true,
    "notifications" =>
        $notifications,
    "unread_count" =>
        $unread_count
]);