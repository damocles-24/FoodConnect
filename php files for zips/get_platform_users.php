<?php

header(
    "Content-Type: application/json; charset=utf-8"
);

header(
    "Cache-Control: no-store, no-cache, must-revalidate, max-age=0"
);

header("Pragma: no-cache");

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
   REQUIRE GET
========================================================= */

$requestMethod = strtoupper(
    (string) (
        $_SERVER["REQUEST_METHOD"]
        ?? ""
    )
);

if ($requestMethod !== "GET") {
    respond_json([
        "success" => false,
        "message" => "Method not allowed."
    ], 405);
}

/* =========================================================
   DATABASE CONNECTION
========================================================= */

if (
    !isset($conn) ||
    !($conn instanceof mysqli)
) {
    respond_json([
        "success" => false,
        "message" =>
            "Database connection is unavailable."
    ], 500);
}

$conn->set_charset("utf8mb4");

/* =========================================================
   ADMIN AUTHENTICATION
========================================================= */

$adminId = (int) (
    $_SESSION["user_id"]
    ?? 0
);

$sessionRole = strtolower(
    trim(
        (string) (
            $_SESSION["role"]
            ?? ""
        )
    )
);

if (
    $adminId <= 0 ||
    $sessionRole !== "admin"
) {
    respond_json([
        "success" => false,
        "message" =>
            "Administrator authentication is required."
    ], 401);
}

/* =========================================================
   VERIFY CURRENT ADMIN
========================================================= */

$adminStmt = $conn->prepare("
    SELECT
        user_id,
        role,
        status

    FROM tbl_users

    WHERE user_id = ?

    LIMIT 1
");

if (!$adminStmt) {
    respond_json([
        "success" => false,
        "message" =>
            "Unable to prepare administrator verification: " .
            $conn->error
    ], 500);
}

$adminStmt->bind_param(
    "i",
    $adminId
);

if (!$adminStmt->execute()) {
    $error =
        $adminStmt->error;

    $adminStmt->close();

    respond_json([
        "success" => false,
        "message" =>
            "Unable to verify administrator: " .
            $error
    ], 500);
}

$adminResult =
    $adminStmt->get_result();

$admin =
    $adminResult->fetch_assoc();

$adminStmt->close();

if (
    !$admin ||
    strtolower(
        trim(
            (string) $admin["role"]
        )
    ) !== "admin" ||
    (int) $admin["status"] !== 1
) {
    respond_json([
        "success" => false,
        "message" =>
            "Your administrator account is invalid or inactive."
    ], 403);
}

/* =========================================================
   FILTERS
========================================================= */

$search = trim(
    (string) (
        $_GET["search"]
        ?? ""
    )
);

$role = strtolower(
    trim(
        (string) (
            $_GET["role"]
            ?? "all"
        )
    )
);

$status = strtolower(
    trim(
        (string) (
            $_GET["status"]
            ?? "all"
        )
    )
);

if (mb_strlen($search) > 100) {
    respond_json([
        "success" => false,
        "message" =>
            "Search text must not exceed 100 characters."
    ], 422);
}

$allowedRoles = [
    "all",
    "owner",
    "cashier",
    "delivery_staff"
];

if (
    !in_array(
        $role,
        $allowedRoles,
        true
    )
) {
    respond_json([
        "success" => false,
        "message" =>
            "Invalid user role filter."
    ], 422);
}

$allowedStatuses = [
    "all",
    "active",
    "inactive"
];

if (
    !in_array(
        $status,
        $allowedStatuses,
        true
    )
) {
    respond_json([
        "success" => false,
        "message" =>
            "Invalid account status filter."
    ], 422);
}

/* =========================================================
   BUILD FILTER QUERY
========================================================= */

$whereConditions = [
    "u.role IN (
        'owner',
        'cashier',
        'delivery_staff'
    )",

    "u.is_verified = 1"
];

$parameterTypes = "";
$parameterValues = [];

if ($role !== "all") {
    $whereConditions[] =
        "u.role = ?";

    $parameterTypes .= "s";
    $parameterValues[] = $role;
}

if ($status === "active") {
    $whereConditions[] =
        "u.status = 1";
}

if ($status === "inactive") {
    $whereConditions[] =
        "u.status = 0";
}

if ($search !== "") {
    $searchValue =
        "%" . $search . "%";

    $whereConditions[] = "
        (
            u.full_name LIKE ?

            OR u.email LIKE ?

            OR COALESCE(
                u.contact_number,
                ''
            ) LIKE ?

            OR COALESCE(
                r.name,
                ''
            ) LIKE ?
        )
    ";

    $parameterTypes .= "ssss";

    $parameterValues[] =
        $searchValue;

    $parameterValues[] =
        $searchValue;

    $parameterValues[] =
        $searchValue;

    $parameterValues[] =
        $searchValue;
}

$whereSql = implode(
    " AND ",
    $whereConditions
);

/* =========================================================
   LOAD USERS

   Important:
   tbl_restaurants uses the column `name`,
   not `restaurant_name`.
========================================================= */

$usersSql = "
    SELECT
        u.user_id,
        u.restaurant_id,
        u.role,
        u.full_name,
        u.email,
        u.contact_number,
        u.address,
        u.status,
        u.is_verified,
        u.created_at,

        COALESCE(
            r.name,
            ''
        ) AS restaurant_name

    FROM tbl_users AS u

    LEFT JOIN tbl_restaurants AS r
        ON r.restaurant_id =
           u.restaurant_id

    WHERE {$whereSql}

    ORDER BY
        u.created_at DESC,
        u.user_id DESC
";

$usersStmt =
    $conn->prepare(
        $usersSql
    );

if (!$usersStmt) {
    respond_json([
        "success" => false,
        "message" =>
            "Unable to prepare platform users query: " .
            $conn->error
    ], 500);
}

/*
|--------------------------------------------------------------------------
| Bind dynamic filters
|--------------------------------------------------------------------------
*/

if (
    $parameterTypes !== "" &&
    count($parameterValues) > 0
) {
    $bindValues = [
        $parameterTypes
    ];

    foreach (
        $parameterValues as $index =>
        $parameterValue
    ) {
        $bindValues[] =
            &$parameterValues[$index];
    }

    if (
        !call_user_func_array(
            [
                $usersStmt,
                "bind_param"
            ],
            $bindValues
        )
    ) {
        $error =
            $usersStmt->error;

        $usersStmt->close();

        respond_json([
            "success" => false,
            "message" =>
                "Unable to bind platform user filters: " .
                $error
        ], 500);
    }
}

if (!$usersStmt->execute()) {
    $error =
        $usersStmt->error;

    $usersStmt->close();

    respond_json([
        "success" => false,
        "message" =>
            "Unable to load platform users: " .
            $error
    ], 500);
}

$usersResult =
    $usersStmt->get_result();

$users = [];

while (
    $row =
        $usersResult->fetch_assoc()
) {
    $userId =
        (int) $row["user_id"];

    $userRole = strtolower(
        trim(
            (string) $row["role"]
        )
    );

    $users[] = [
        "user_id" =>
            $userId,

        "restaurant_id" =>
            $row["restaurant_id"] !== null
                ? (int) $row["restaurant_id"]
                : null,

        "role" =>
            $userRole,

        "full_name" =>
            (string) $row["full_name"],

        "email" =>
            (string) $row["email"],

        "contact_number" =>
            (string) (
                $row["contact_number"]
                ?? ""
            ),

        "address" =>
            (string) (
                $row["address"]
                ?? ""
            ),

        "status" =>
            (int) (
                $row["status"]
                ?? 0
            ),

        "is_verified" =>
            (int) (
                $row["is_verified"]
                ?? 0
            ),

        "restaurant_name" =>
            (string) (
                $row["restaurant_name"]
                ?? ""
            ),

        "created_at" =>
            (string) (
                $row["created_at"]
                ?? ""
            ),

        "is_current_admin" =>
            $userId === $adminId
    ];
}

$usersStmt->close();

/* =========================================================
   PLATFORM USER SUMMARY
========================================================= */

$summarySql = "
    SELECT
        COUNT(*) AS total_users,

        COALESCE(
            SUM(
                CASE
                    WHEN status = 1
                    THEN 1
                    ELSE 0
                END
            ),
            0
        ) AS active_users,

        COALESCE(
            SUM(
                CASE
                    WHEN status = 0
                    THEN 1
                    ELSE 0
                END
            ),
            0
        ) AS inactive_users,

        COALESCE(
            SUM(
                CASE
                    WHEN role = 'owner'
                    THEN 1
                    ELSE 0
                END
            ),
            0
        ) AS owners,

        COALESCE(
            SUM(
                CASE
                    WHEN role IN (
                        'cashier',
                        'delivery_staff'
                    )
                    THEN 1
                    ELSE 0
                END
            ),
            0
        ) AS restaurant_staff

    FROM tbl_users

    WHERE role IN (
        'owner',
        'cashier',
        'delivery_staff'
    )

    AND is_verified = 1
";

$summaryResult =
    $conn->query(
        $summarySql
    );

if (!$summaryResult) {
    respond_json([
        "success" => false,
        "message" =>
            "Unable to load platform user summary: " .
            $conn->error
    ], 500);
}

$summaryRow =
    $summaryResult->fetch_assoc();

/* =========================================================
   SUCCESS RESPONSE
========================================================= */

respond_json([
    "success" => true,

    "message" =>
        "Platform users loaded successfully.",

    "current_admin_id" =>
        $adminId,

    "filters" => [
        "search" =>
            $search,

        "role" =>
            $role,

        "status" =>
            $status
    ],

    "summary" => [
        "total_users" =>
            (int) (
                $summaryRow["total_users"]
                ?? 0
            ),

        "active_users" =>
            (int) (
                $summaryRow["active_users"]
                ?? 0
            ),

        "inactive_users" =>
            (int) (
                $summaryRow["inactive_users"]
                ?? 0
            ),

        "owners" =>
    (int) (
        $summaryRow["owners"]
        ?? 0
    ),

"restaurant_staff" =>
    (int) (
        $summaryRow["restaurant_staff"]
        ?? 0
    )
    ],

    "users" =>
        $users
]);