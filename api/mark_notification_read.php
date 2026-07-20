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
        "message" => "Unauthorized access."
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
            "You are not authorized to update notifications."
    ], 403);
}

/* =========================================================
   REQUEST
========================================================= */

$data = json_decode(
    file_get_contents("php://input"),
    true
);

if (!is_array($data)) {
    respond_json([
        "success" => false,
        "message" => "Invalid request."
    ], 400);
}

$log_id = (int)(
    $data["log_id"] ?? 0
);

if ($log_id <= 0) {
    respond_json([
        "success" => false,
        "message" =>
            "Invalid notification."
    ], 400);
}

/* =========================================================
   VERIFY VISIBLE CASHIER NOTIFICATION

   This prevents marking unrelated activity logs as
   cashier notifications.
========================================================= */

$checkStmt = $conn->prepare("
    SELECT
        log_id

    FROM tbl_activity_logs

    WHERE log_id = ?
      AND restaurant_id = ?
      AND (
            action_type = 'order'

            OR action_title LIKE
                '%Cancelled%'

            OR action_title LIKE
                '%Low Stock%'

            OR action_title LIKE
                '%Out of Stock%'
      )

    LIMIT 1
");

if (!$checkStmt) {
    $conn->close();

    respond_json([
        "success" => false,
        "message" =>
            "Unable to verify notification."
    ], 500);
}

$checkStmt->bind_param(
    "ii",
    $log_id,
    $restaurant_id
);

if (!$checkStmt->execute()) {
    $checkStmt->close();
    $conn->close();

    respond_json([
        "success" => false,
        "message" =>
            "Unable to verify notification."
    ], 500);
}

$result = $checkStmt->get_result();
$notification = $result->fetch_assoc();

$checkStmt->close();

if (!$notification) {
    $conn->close();

    respond_json([
        "success" => false,
        "message" =>
            "Notification not found."
    ], 404);
}

/* =========================================================
   MARK AS READ

   INSERT IGNORE prevents duplicate read records.
========================================================= */

$insertStmt = $conn->prepare("
    INSERT IGNORE INTO
        tbl_notification_reads (
            log_id,
            user_id,
            restaurant_id
        )

    VALUES (?, ?, ?)
");

if (!$insertStmt) {
    $conn->close();

    respond_json([
        "success" => false,
        "message" =>
            "Unable to prepare notification update."
    ], 500);
}

$insertStmt->bind_param(
    "iii",
    $log_id,
    $user_id,
    $restaurant_id
);

if (!$insertStmt->execute()) {
    $insertStmt->close();
    $conn->close();

    respond_json([
        "success" => false,
        "message" =>
            "Unable to mark notification as read."
    ], 500);
}

$insertStmt->close();
$conn->close();

respond_json([
    "success" => true,
    "message" =>
        "Notification marked as read.",
    "log_id" =>
        $log_id
]);