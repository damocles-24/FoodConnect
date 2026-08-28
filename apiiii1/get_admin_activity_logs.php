<?php

header("Content-Type: application/json; charset=utf-8");
header("Cache-Control: no-store, no-cache, must-revalidate");
header("Pragma: no-cache");

error_reporting(E_ALL & ~E_NOTICE & ~E_WARNING);
ini_set("display_errors", "0");

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

/* =========================================================
   ADMIN AUTHORIZATION
========================================================= */

$adminId =
    isset($_SESSION["user_id"])
        ? (int) $_SESSION["user_id"]
        : 0;

$adminRole =
    isset($_SESSION["role"])
        ? strtolower(trim((string) $_SESSION["role"]))
        : "";

if (
    $adminId <= 0 ||
    $adminRole !== "admin"
) {
    respond_json([
        "success" => false,
        "message" => "Your session has expired or you do not have access. Please log in again.",
        "logs" => []
    ], 401);
}

/* =========================================================
   OPTIONAL FILTERS
========================================================= */

$search =
    isset($_GET["search"])
        ? trim((string) $_GET["search"])
        : "";

$actionType =
    isset($_GET["action_type"])
        ? trim((string) $_GET["action_type"])
        : "";

$limit =
    isset($_GET["limit"])
        ? (int) $_GET["limit"]
        : 100;

if ($limit < 1) {
    $limit = 100;
}

if ($limit > 500) {
    $limit = 500;
}

/* =========================================================
   BASE QUERY
========================================================= */

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

        COALESCE(
            TRIM(CONCAT_WS(' ', NULLIF(TRIM(administrator.first_name), ''), NULLIF(TRIM(administrator.middle_name), ''), NULLIF(TRIM(administrator.last_name), ''))),
            'System Administrator'
        ) AS administrator_name,

        administrator.email AS administrator_email,

        restaurant.name AS restaurant_name

    FROM tbl_activity_logs AS al

    LEFT JOIN tbl_users AS administrator
        ON administrator.user_id = al.user_id

    LEFT JOIN tbl_restaurants AS restaurant
        ON restaurant.restaurant_id = al.restaurant_id

WHERE LOWER(TRIM(al.user_role)) = 'admin'";

$parameterTypes = "";
$parameters = [];

if ($actionType !== "") {
    $sql .= "
        AND al.action_type = ?
    ";

    $parameterTypes .= "s";
    $parameters[] = $actionType;
}

if ($search !== "") {
    $searchPattern = "%" . $search . "%";

    $sql .= "
        AND (
            al.action_title LIKE ?
            OR al.action_description LIKE ?
            OR TRIM(CONCAT_WS(' ', NULLIF(TRIM(administrator.first_name), ''), NULLIF(TRIM(administrator.middle_name), ''), NULLIF(TRIM(administrator.last_name), ''))) LIKE ?
            OR administrator.email LIKE ?
            OR restaurant.name LIKE ?
            OR al.user_role LIKE ?
            OR al.action_type LIKE ?
        )
    ";

    $parameterTypes .= "sssssss";

    $parameters[] = $searchPattern;
    $parameters[] = $searchPattern;
    $parameters[] = $searchPattern;
    $parameters[] = $searchPattern;
    $parameters[] = $searchPattern;
    $parameters[] = $searchPattern;
    $parameters[] = $searchPattern;
}

$sql .= "
    ORDER BY
        al.created_at DESC,
        al.log_id DESC

    LIMIT ?
";

$parameterTypes .= "i";
$parameters[] = $limit;

/* =========================================================
   PREPARE QUERY
========================================================= */

$stmt = $conn->prepare($sql);

if (!$stmt) {
    error_log(
        "get_admin_activity_logs prepare error: " .
        $conn->error
    );

    respond_json([
        "success" => false,
        "message" => "Unable to prepare activity logs.",
        "logs" => []
    ], 500);
}

$stmt->bind_param(
    $parameterTypes,
    ...$parameters
);

if (!$stmt->execute()) {
    error_log(
        "get_admin_activity_logs execute error: " .
        $stmt->error
    );

    $stmt->close();
    $conn->close();

    respond_json([
        "success" => false,
        "message" => "Unable to load activity logs.",
        "logs" => []
    ], 500);
}

$result = $stmt->get_result();

if (!$result) {
    error_log(
        "get_admin_activity_logs result error: " .
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

/* =========================================================
   FORMAT RESPONSE
========================================================= */

$logs = [];

while ($row = $result->fetch_assoc()) {
    $restaurantId =
        $row["restaurant_id"] !== null
            ? (int) $row["restaurant_id"]
            : null;

    $userId =
        $row["user_id"] !== null
            ? (int) $row["user_id"]
            : null;

    $restaurantName =
        isset($row["restaurant_name"])
            ? trim((string) $row["restaurant_name"])
            : "";

    $targetName =
        $restaurantName !== ""
            ? $restaurantName
            : "Platform";

    $logs[] = [
        "log_id" =>
            (int) $row["log_id"],

        "restaurant_id" =>
            $restaurantId,

        "user_id" =>
            $userId,

        "user_role" =>
            $row["user_role"],

        "action_type" =>
            $row["action_type"],

        "action_title" =>
            $row["action_title"],

        "action_description" =>
            $row["action_description"],

        "administrator_name" =>
            $row["administrator_name"],

        "administrator_email" =>
            $row["administrator_email"],

        "restaurant_name" =>
            $restaurantName !== ""
                ? $restaurantName
                : null,

        "target_name" =>
            $targetName,

        "created_at" =>
            $row["created_at"]
    ];
}

$stmt->close();
$conn->close();

respond_json([
    "success" => true,
    "count" => count($logs),
    "logs" => $logs
]);