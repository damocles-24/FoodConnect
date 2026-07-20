<?php
header("Content-Type: application/json; charset=utf-8");

session_set_cookie_params(0, "/FoodConnect", "", false, true);
session_start();

require_once __DIR__ . "/db.php";

function respond_json($data, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode($data);
    exit;
}

if (
    empty($_SESSION["user_id"]) ||
    empty($_SESSION["restaurant_id"])
) {
    respond_json([
        "success" => false,
        "message" => "Unauthorized access.",
        "logs" => []
    ], 401);
}

$user_id = (int) $_SESSION["user_id"];
$restaurant_id = (int) $_SESSION["restaurant_id"];

$sql = "
    SELECT
        al.log_id,
        al.restaurant_id,
        al.user_id,
        al.user_role,
        al.action_type,
        al.action_title,
        al.action_description,
        al.created_at,

        CASE
            WHEN nr.notification_read_id IS NULL THEN 0
            ELSE 1
        END AS is_read

    FROM tbl_activity_logs AS al

    LEFT JOIN tbl_notification_reads AS nr
        ON nr.log_id = al.log_id
        AND nr.user_id = ?
        AND nr.restaurant_id = al.restaurant_id

    WHERE al.restaurant_id = ?

    ORDER BY al.created_at DESC
    LIMIT 100
";

$stmt = $conn->prepare($sql);

if (!$stmt) {
    error_log(
        "get_activity_logs.php prepare error: " .
        $conn->error
    );

    respond_json([
        "success" => false,
        "message" => "Unable to load activity logs.",
        "logs" => []
    ], 500);
}

$stmt->bind_param(
    "ii",
    $user_id,
    $restaurant_id
);

if (!$stmt->execute()) {
    error_log(
        "get_activity_logs.php execute error: " .
        $stmt->error
    );

    $stmt->close();
    $conn->close();

    respond_json([
        "success" => false,
        "message" => "Unable to execute activity log query.",
        "logs" => []
    ], 500);
}

$result = $stmt->get_result();

if (!$result) {
    error_log(
        "get_activity_logs.php result error: " .
        $stmt->error
    );

    $stmt->close();
    $conn->close();

    respond_json([
        "success" => false,
        "message" => "Unable to retrieve activity logs.",
        "logs" => []
    ], 500);
}

$logs = [];

while ($row = $result->fetch_assoc()) {
    $row["log_id"] = (int) $row["log_id"];
    $row["restaurant_id"] =
        (int) $row["restaurant_id"];

    $row["user_id"] =
        $row["user_id"] !== null
            ? (int) $row["user_id"]
            : null;

    $row["is_read"] = (int) $row["is_read"];

    $logs[] = $row;
}

$stmt->close();
$conn->close();

respond_json([
    "success" => true,
    "logs" => $logs
]);