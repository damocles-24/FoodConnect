<?php

header(
    "Content-Type: application/json; charset=utf-8"
);

header(
    "Cache-Control: no-store"
);

error_reporting(
    E_ALL &
    ~E_NOTICE &
    ~E_WARNING
);

ini_set(
    "display_errors",
    "0"
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
   ADMIN AUTHENTICATION
========================================================= */

if (
    empty($_SESSION["user_id"]) ||
    strtolower(
        (string) (
            $_SESSION["role"] ?? ""
        )
    ) !== "admin"
) {
    respond_json(
        [
            "success" => false,
            "message" =>
                "Administrator authentication is required."
        ],
        401
    );
}

$adminId =
    (int) $_SESSION["user_id"];

$adminStmt =
    $conn->prepare("
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
        "get_partner_invitation_requests admin prepare error: " .
        $conn->error
    );

    respond_json(
        [
            "success" => false,
            "message" =>
                "Unable to verify administrator session."
        ],
        500
    );
}

$adminStmt->bind_param(
    "i",
    $adminId
);

if (!$adminStmt->execute()) {
    error_log(
        "get_partner_invitation_requests admin execute error: " .
        $adminStmt->error
    );

    $adminStmt->close();

    respond_json(
        [
            "success" => false,
            "message" =>
                "Unable to verify administrator session."
        ],
        500
    );
}

$admin =
    $adminStmt
        ->get_result()
        ->fetch_assoc();

$adminStmt->close();

if (
    !$admin ||
    strtolower(
        (string) (
            $admin["role"] ?? ""
        )
    ) !== "admin" ||
    (int) (
        $admin["status"] ?? 0
    ) !== 1 ||
    (int) (
        $admin["is_verified"] ?? 0
    ) !== 1
) {
    $_SESSION = [];

    session_destroy();

    respond_json(
        [
            "success" => false,
            "message" =>
                "Administrator authentication is required."
        ],
        401
    );
}

/* =========================================================
   STATUS FILTER
========================================================= */

$status =
    strtolower(
        trim(
            (string) (
                $_GET["status"] ?? "all"
            )
        )
    );

$allowedStatuses = [
    "all",
    "pending",
    "approved",
    "rejected"
];

if (
    !in_array(
        $status,
        $allowedStatuses,
        true
    )
) {
    $status = "all";
}

/* =========================================================
   SEARCH FILTER
========================================================= */

$search =
    trim(
        (string) (
            $_GET["search"] ?? ""
        )
    );

if (mb_strlen($search) > 190) {
    $search =
        mb_substr(
            $search,
            0,
            190
        );
}

/* =========================================================
   BUILD QUERY
========================================================= */

$sql = "
    SELECT
        pir.request_id,
        pir.full_name,
        pir.email,
        pir.contact_number,
        pir.intended_restaurant,
        pir.business_address,
        pir.message,
        pir.request_status,
        pir.reviewed_by,
        pir.reviewed_at,
        pir.rejection_reason,
        pir.created_at,
        pir.updated_at,

        reviewer.full_name AS reviewer_name

    FROM tbl_partner_invitation_requests pir

    LEFT JOIN tbl_users reviewer
        ON reviewer.user_id = pir.reviewed_by
";

$whereConditions = [];
$parameterTypes = "";
$parameterValues = [];

if ($status !== "all") {
    $whereConditions[] =
        "pir.request_status = ?";

    $parameterTypes .= "s";
    $parameterValues[] = $status;
}

if ($search !== "") {
    $whereConditions[] = "
        (
            pir.full_name LIKE ?
            OR pir.email LIKE ?
            OR pir.contact_number LIKE ?
            OR pir.intended_restaurant LIKE ?
            OR pir.business_address LIKE ?
        )
    ";

    $searchValue =
        "%" . $search . "%";

    $parameterTypes .= "sssss";

    $parameterValues[] = $searchValue;
    $parameterValues[] = $searchValue;
    $parameterValues[] = $searchValue;
    $parameterValues[] = $searchValue;
    $parameterValues[] = $searchValue;
}

if (!empty($whereConditions)) {
    $sql .=
        " WHERE " .
        implode(
            " AND ",
            $whereConditions
        );
}

$sql .= "
    ORDER BY
        CASE pir.request_status
            WHEN 'pending' THEN 1
            WHEN 'approved' THEN 2
            WHEN 'rejected' THEN 3
            ELSE 4
        END,
        pir.created_at DESC,
        pir.request_id DESC
";

/* =========================================================
   LOAD REQUESTS
========================================================= */

$stmt =
    $conn->prepare($sql);

if (!$stmt) {
    error_log(
        "get_partner_invitation_requests prepare error: " .
        $conn->error
    );

    respond_json(
        [
            "success" => false,
            "message" =>
                "Unable to load partner requests."
        ],
        500
    );
}

if ($parameterTypes !== "") {
    $stmt->bind_param(
        $parameterTypes,
        ...$parameterValues
    );
}

if (!$stmt->execute()) {
    error_log(
        "get_partner_invitation_requests execute error: " .
        $stmt->error
    );

    $stmt->close();

    respond_json(
        [
            "success" => false,
            "message" =>
                "Unable to load partner requests."
        ],
        500
    );
}

$result =
    $stmt->get_result();

$requests = [];

while (
    $row =
        $result->fetch_assoc()
) {
    $requests[] = [
        "request_id" =>
            (int) $row["request_id"],

        "full_name" =>
            (string) $row["full_name"],

        "email" =>
            (string) $row["email"],

        "contact_number" =>
            (string) (
                $row["contact_number"] ?? ""
            ),

        "intended_restaurant" =>
            (string) $row["intended_restaurant"],

        "business_address" =>
            (string) (
                $row["business_address"] ?? ""
            ),

        "message" =>
            (string) (
                $row["message"] ?? ""
            ),

        "request_status" =>
            strtolower(
                (string) $row["request_status"]
            ),

        "reviewed_by" =>
            !empty($row["reviewed_by"])
                ? (int) $row["reviewed_by"]
                : null,

        "reviewer_name" =>
            $row["reviewer_name"],

        "reviewed_at" =>
            $row["reviewed_at"],

        "rejection_reason" =>
            $row["rejection_reason"],

        "created_at" =>
            $row["created_at"],

        "updated_at" =>
            $row["updated_at"]
    ];
}

$stmt->close();

/* =========================================================
   SUMMARY COUNTS
========================================================= */

$summary = [
    "all" => 0,
    "pending" => 0,
    "approved" => 0,
    "rejected" => 0
];

$countResult =
    $conn->query("
        SELECT
            request_status,
            COUNT(*) AS total

        FROM tbl_partner_invitation_requests

        GROUP BY request_status
    ");

if ($countResult) {
    while (
        $countRow =
            $countResult->fetch_assoc()
    ) {
        $countStatus =
            strtolower(
                (string) (
                    $countRow["request_status"] ?? ""
                )
            );

        $countTotal =
            (int) (
                $countRow["total"] ?? 0
            );

        if (
            array_key_exists(
                $countStatus,
                $summary
            )
        ) {
            $summary[$countStatus] =
                $countTotal;
        }

        $summary["all"] +=
            $countTotal;
    }
}

/* =========================================================
   SUCCESS RESPONSE
========================================================= */

respond_json(
    [
        "success" => true,

        "summary" =>
            $summary,

        "requests" =>
            $requests
    ]
);