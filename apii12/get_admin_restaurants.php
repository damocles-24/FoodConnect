<?php

header("Content-Type: application/json; charset=utf-8");
header("Cache-Control: no-store");

error_reporting(E_ALL & ~E_NOTICE & ~E_WARNING);
ini_set("display_errors", "0");

session_set_cookie_params(
    0,
    "/",
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
        status,
        is_verified
    FROM tbl_users
    WHERE user_id = ?
    LIMIT 1
");

if (!$adminStmt) {
    error_log(
        "get_admin_restaurants admin prepare error: " .
        $conn->error
    );

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
   SEARCH
========================================================= */

$search = trim(
    (string) ($_GET["search"] ?? "")
);

$searchPattern =
    "%" . $search . "%";

/* =========================================================
   RESTAURANT QUERY
========================================================= */

$sql = "
    SELECT
        r.restaurant_id,
        r.name,
        r.address,
        r.contact_number,
        r.opening_hours,
        r.delivery_fee,
        r.business_status,
        r.owner_id,

        TRIM(CONCAT_WS(' ', NULLIF(TRIM(owner.first_name), ''), NULLIF(TRIM(owner.middle_name), ''), NULLIF(TRIM(owner.last_name), ''))) AS owner_name,
        owner.email AS owner_email,
        owner.contact_number AS owner_contact,
        owner.status AS owner_status,

        (
            SELECT COUNT(*)
            FROM tbl_users staff_user
            WHERE
                staff_user.restaurant_id = r.restaurant_id
                AND staff_user.role IN (
                    'cashier',
                    'delivery_staff',
                    'staff'
                )
        ) AS staff_count,

        (
            SELECT COUNT(*)
            FROM tbl_orders order_count
            WHERE
                order_count.restaurant_id = r.restaurant_id
        ) AS total_orders,

        (
            SELECT COUNT(*)
            FROM tbl_orders active_order
            WHERE
                active_order.restaurant_id = r.restaurant_id
                AND active_order.order_status NOT IN (
                    'completed',
                    'cancelled'
                )
        ) AS active_orders,

        (
            SELECT COALESCE(
                SUM(completed_order.total_amount),
                0
            )
            FROM tbl_orders completed_order
            WHERE
                completed_order.restaurant_id = r.restaurant_id
                AND completed_order.order_status = 'completed'
        ) AS total_sales

    FROM tbl_restaurants r

    INNER JOIN tbl_users owner
        ON owner.user_id = r.owner_id
        AND owner.role = 'owner'
";

if ($search !== "") {
    $sql .= "
        WHERE
            r.name LIKE ?
            OR r.address LIKE ?
            OR TRIM(CONCAT_WS(' ', NULLIF(TRIM(owner.first_name), ''), NULLIF(TRIM(owner.middle_name), ''), NULLIF(TRIM(owner.last_name), ''))) LIKE ?
            OR owner.email LIKE ?
    ";
}

$sql .= "
    ORDER BY
        r.name ASC,
        r.restaurant_id ASC
";

$stmt = $conn->prepare($sql);

if (!$stmt) {
    error_log(
        "get_admin_restaurants prepare error: " .
        $conn->error
    );

    respond_json([
        "success" => false,
        "message" => "Unable to load restaurants."
    ], 500);
}

if ($search !== "") {
    $stmt->bind_param(
        "ssss",
        $searchPattern,
        $searchPattern,
        $searchPattern,
        $searchPattern
    );
}

$stmt->execute();

$result =
    $stmt->get_result();

$restaurants = [];

while ($row = $result->fetch_assoc()) {
    $restaurants[] = [
        "restaurant_id" =>
            (int) $row["restaurant_id"],

        "name" =>
            $row["name"],

        "address" =>
            $row["address"],

        "contact_number" =>
            $row["contact_number"],

        "opening_hours" =>
            $row["opening_hours"],

        "delivery_fee" =>
            (float) $row["delivery_fee"],

        "business_status" =>
            $row["business_status"],

        "owner_id" =>
            (int) $row["owner_id"],

        "owner_name" =>
            $row["owner_name"],

        "owner_email" =>
            $row["owner_email"],

        "owner_contact" =>
            $row["owner_contact"],

        "owner_status" =>
            (int) $row["owner_status"],

        "staff_count" =>
            (int) $row["staff_count"],

        "total_orders" =>
            (int) $row["total_orders"],

        "active_orders" =>
            (int) $row["active_orders"],

        "total_sales" =>
            (float) $row["total_sales"]
    ];
}

$stmt->close();

/* =========================================================
   SUMMARY COUNTS
========================================================= */

$summary = [
    "total_restaurants" => 0,
    "open_restaurants" => 0,
    "closed_restaurants" => 0,
    "temporarily_unavailable" => 0
];

$summaryResult = $conn->query("
    SELECT
        COUNT(*) AS total_restaurants,

        COALESCE(
            SUM(
                CASE
                    WHEN LOWER(TRIM(business_status)) = 'open'
                    THEN 1
                    ELSE 0
                END
            ),
            0
        ) AS open_restaurants,

        COALESCE(
            SUM(
                CASE
                    WHEN LOWER(TRIM(business_status)) = 'closed'
                    THEN 1
                    ELSE 0
                END
            ),
            0
        ) AS closed_restaurants,

        COALESCE(
            SUM(
                CASE
                    WHEN LOWER(TRIM(business_status)) IN (
                        'temporarily unavailable',
                        'temporary unavailable',
                        'unavailable'
                    )
                    THEN 1
                    ELSE 0
                END
            ),
            0
        ) AS temporarily_unavailable

    FROM tbl_restaurants
");

if (!$summaryResult) {
    error_log(
        "get_admin_restaurants summary query error: " .
        $conn->error
    );

    respond_json([
        "success" => false,
        "message" => "Unable to load restaurant summary."
    ], 500);
}

$summaryRow = $summaryResult->fetch_assoc();

$summary = [
    "total_restaurants" =>
        (int) ($summaryRow["total_restaurants"] ?? 0),

    "open_restaurants" =>
        (int) ($summaryRow["open_restaurants"] ?? 0),

    "closed_restaurants" =>
        (int) ($summaryRow["closed_restaurants"] ?? 0),

    "temporarily_unavailable" =>
        (int) ($summaryRow["temporarily_unavailable"] ?? 0)
];

respond_json([
    "success" => true,
    "restaurants" => $restaurants,
    "summary" => $summary
]);