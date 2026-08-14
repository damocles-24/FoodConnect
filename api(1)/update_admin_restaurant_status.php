<?php

header("Content-Type: application/json; charset=utf-8");
header("Cache-Control: no-store");

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

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    respond_json([
        "success" => false,
        "message" => "Method not allowed."
    ], 405);
}

/* =========================================================
   ADMIN AUTHENTICATION
========================================================= */

if (empty($_SESSION["user_id"])) {
    respond_json([
        "success" => false,
        "message" => "Administrator authentication is required."
    ], 401);
}

$adminId = (int) $_SESSION["user_id"];

$adminStmt = $conn->prepare("
    SELECT
        user_id,
        role,
        full_name,
        status,
        is_verified
    FROM tbl_users
    WHERE user_id = ?
    LIMIT 1
");

if (!$adminStmt) {
    respond_json([
        "success" => false,
        "message" => "Unable to verify administrator account."
    ], 500);
}

$adminStmt->bind_param(
    "i",
    $adminId
);

$adminStmt->execute();

$admin =
    $adminStmt
        ->get_result()
        ->fetch_assoc();

$adminStmt->close();

if (
    !$admin ||
    strtolower((string) $admin["role"]) !== "admin" ||
    (int) $admin["status"] !== 1 ||
    (int) $admin["is_verified"] !== 1
) {
    $_SESSION = [];
    session_destroy();

    respond_json([
        "success" => false,
        "message" => "Administrator authentication is required."
    ], 401);
}

/* =========================================================
   REQUEST DATA
========================================================= */

$input =
    json_decode(
        file_get_contents("php://input"),
        true
    );

if (!is_array($input)) {
    $input = $_POST;
}

$restaurantId =
    (int) ($input["restaurant_id"] ?? 0);

$businessStatus = trim(
    (string) ($input["business_status"] ?? "")
);

$allowedStatuses = [
    "Open",
    "Closed",
    "Temporarily Unavailable"
];

if ($restaurantId <= 0) {
    respond_json([
        "success" => false,
        "message" => "Invalid restaurant."
    ], 422);
}

if (
    !in_array(
        $businessStatus,
        $allowedStatuses,
        true
    )
) {
    respond_json([
        "success" => false,
        "message" => "Invalid restaurant status."
    ], 422);
}

/* =========================================================
   VERIFY RESTAURANT
========================================================= */

$restaurantStmt = $conn->prepare("
    SELECT
        restaurant_id,
        name,
        business_status
    FROM tbl_restaurants
    WHERE restaurant_id = ?
    LIMIT 1
");

if (!$restaurantStmt) {
    respond_json([
        "success" => false,
        "message" => "Unable to verify restaurant."
    ], 500);
}

$restaurantStmt->bind_param(
    "i",
    $restaurantId
);

$restaurantStmt->execute();

$restaurant =
    $restaurantStmt
        ->get_result()
        ->fetch_assoc();

$restaurantStmt->close();

if (!$restaurant) {
    respond_json([
        "success" => false,
        "message" => "Restaurant not found."
    ], 404);
}

$oldStatus =
    $restaurant["business_status"];

if ($oldStatus === $businessStatus) {
    respond_json([
        "success" => true,
        "message" => "Restaurant status is already updated.",
        "business_status" => $businessStatus
    ]);
}

/* =========================================================
   UPDATE STATUS
========================================================= */

$updateStmt = $conn->prepare("
    UPDATE tbl_restaurants
    SET business_status = ?
    WHERE restaurant_id = ?
    LIMIT 1
");

if (!$updateStmt) {
    error_log(
        "update_admin_restaurant_status prepare error: " .
        $conn->error
    );

    respond_json([
        "success" => false,
        "message" => "Unable to update restaurant status."
    ], 500);
}

$updateStmt->bind_param(
    "si",
    $businessStatus,
    $restaurantId
);

if (!$updateStmt->execute()) {
    error_log(
        "update_admin_restaurant_status execute error: " .
        $updateStmt->error
    );

    $updateStmt->close();

    respond_json([
        "success" => false,
        "message" => "Unable to update restaurant status."
    ], 500);
}

$updateStmt->close();

/* =========================================================
   ACTIVITY LOG
========================================================= */

$actionTitle =
    "Restaurant Status Updated";

$description =
    $admin["full_name"] .
    " changed " .
    $restaurant["name"] .
    " from " .
    $oldStatus .
    " to " .
    $businessStatus .
    ".";

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
        'admin',
        'restaurant_status',
        ?,
        ?
    )
");

if (!$logStmt) {
    error_log(
        "update_admin_restaurant_status activity log prepare error: " .
        $conn->error
    );

    respond_json([
        "success" => false,
        "message" =>
            "The restaurant status was updated, but the activity log could not be saved."
    ], 500);
}

$logStmt->bind_param(
    "iiss",
    $restaurantId,
    $adminId,
    $actionTitle,
    $description
);

if (!$logStmt->execute()) {
    error_log(
        "update_admin_restaurant_status activity log execute error: " .
        $logStmt->error
    );

    $logStmt->close();

    respond_json([
        "success" => false,
        "message" =>
            "The restaurant status was updated, but the activity log could not be saved."
    ], 500);
}

$logStmt->close();

respond_json([
    "success" => true,
    "message" =>
        "Restaurant status updated successfully.",
    "business_status" =>
        $businessStatus
]);/* =========================================================
   ACTIVITY LOG
========================================================= */

$actionTitle =
    "Restaurant Status Updated";

$description =
    $admin["full_name"] .
    " changed " .
    $restaurant["name"] .
    " from " .
    $oldStatus .
    " to " .
    $businessStatus .
    ".";

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
        'admin',
        'restaurant_status',
        ?,
        ?
    )
");

if (!$logStmt) {
    error_log(
        "update_admin_restaurant_status activity log prepare error: " .
        $conn->error
    );

    respond_json([
        "success" => false,
        "message" =>
            "The restaurant status was updated, but the activity log could not be saved."
    ], 500);
}

$logStmt->bind_param(
    "iiss",
    $restaurantId,
    $adminId,
    $actionTitle,
    $description
);

if (!$logStmt->execute()) {
    error_log(
        "update_admin_restaurant_status activity log execute error: " .
        $logStmt->error
    );

    $logStmt->close();

    respond_json([
        "success" => false,
        "message" =>
            "The restaurant status was updated, but the activity log could not be saved."
    ], 500);
}

$logStmt->close();

respond_json([
    "success" => true,
    "message" =>
        "Restaurant status updated successfully.",
    "business_status" =>
        $businessStatus
]);