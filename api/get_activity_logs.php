<?php

header(
    "Content-Type: application/json; charset=utf-8"
);

header(
    "Cache-Control: no-store, no-cache, must-revalidate, max-age=0"
);

header(
    "Pragma: no-cache"
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
    http_response_code(
        $statusCode
    );

    echo json_encode(
        $data,
        JSON_UNESCAPED_UNICODE |
        JSON_UNESCAPED_SLASHES
    );

    exit;
}


function parse_activity_filter_date(
    string $value,
    string $label
): ?DateTimeImmutable {
    $value = trim($value);

    if ($value === "") {
        return null;
    }

    $timezone = new DateTimeZone(
        "Asia/Manila"
    );

    $date = DateTimeImmutable::createFromFormat(
        "!Y-m-d",
        $value,
        $timezone
    );

    $errors = DateTimeImmutable::getLastErrors();

    if (
        !$date ||
        (
            is_array($errors) &&
            (
                ($errors["warning_count"] ?? 0) > 0 ||
                ($errors["error_count"] ?? 0) > 0
            )
        ) ||
        $date->format("Y-m-d") !== $value
    ) {
        respond_json([
            "success" => false,
            "message" =>
                "Choose a valid {$label} date.",
            "logs" => []
        ], 422);
    }

    return $date;
}

/* =========================================================
   REQUEST METHOD

   This endpoint only reads activity logs,
   so it must accept GET requests.
========================================================= */

if (
    strtoupper(
        (string) (
            $_SERVER["REQUEST_METHOD"] ??
            ""
        )
    ) !== "GET"
) {
    respond_json([
        "success" => false,
        "message" =>
            "This action is not available.",
        "logs" => []
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
        "message" =>
            "Your session has expired or you do not have access. Please log in again.",
        "logs" => []
    ], 401);
}

$user_id =
    (int) $_SESSION["user_id"];

$restaurant_id =
    (int) $_SESSION["restaurant_id"];

$user_role =
    strtolower(
        trim(
            (string) (
                $_SESSION["role"] ??
                ""
            )
        )
    );

if (
    $user_id <= 0 ||
    $restaurant_id <= 0 ||
    $user_role === ""
) {
    respond_json([
        "success" => false,
        "message" =>
            "Invalid user session.",
        "logs" => []
    ], 401);
}

/* =========================================================
   AUTHORIZED DASHBOARD ROLES

   Owners are the primary users of this endpoint.
   Admin support is preserved if needed later.
========================================================= */

$allowedRoles = [
    "owner",
    "admin"
];

if (
    !in_array(
        $user_role,
        $allowedRoles,
        true
    )
) {
    respond_json([
        "success" => false,
        "message" =>
            "You are not authorized to view activity logs.",
        "logs" => []
    ], 403);
}

/* =========================================================
   OPTIONAL DATE RANGE
========================================================= */

$dateFrom = parse_activity_filter_date(
    (string) ($_GET["date_from"] ?? ""),
    "From"
);

$dateTo = parse_activity_filter_date(
    (string) ($_GET["date_to"] ?? ""),
    "To"
);

if (
    $dateFrom &&
    $dateTo &&
    $dateFrom > $dateTo
) {
    respond_json([
        "success" => false,
        "message" =>
            "The From date cannot be later than the To date.",
        "logs" => []
    ], 422);
}

$today = new DateTimeImmutable(
    "today",
    new DateTimeZone("Asia/Manila")
);

if ($dateTo && $dateTo > $today) {
    respond_json([
        "success" => false,
        "message" =>
            "The To date cannot be later than today.",
        "logs" => []
    ], 422);
}

/* =========================================================
   LOAD RESTAURANT ACTIVITY LOGS

   Restaurant isolation:
   Only logs belonging to the restaurant stored
   in the current authenticated session are returned.

   Routine "New Customer Order" logs are excluded
   because Activity Logs are intended for:
   - accountability
   - manual actions
   - financial impact
   - security
   - exceptions
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

        CASE
            WHEN nr.notification_read_id IS NULL
                THEN 0
            ELSE 1
        END AS is_read

    FROM tbl_activity_logs AS al

    LEFT JOIN tbl_notification_reads AS nr
        ON nr.log_id = al.log_id
        AND nr.user_id = ?
        AND nr.restaurant_id = al.restaurant_id

    WHERE al.restaurant_id = ?

      AND NOT (
          LOWER(
              TRIM(
                  al.action_type
              )
          ) = 'order'

          AND LOWER(
              TRIM(
                  al.action_title
              )
          ) = 'new customer order'
      )
";

$parameterTypes = "ii";
$parameters = [
    $user_id,
    $restaurant_id
];

if ($dateFrom) {
    $sql .= "
        AND al.created_at >= ?
    ";

    $parameterTypes .= "s";
    $parameters[] =
        $dateFrom->format(
            "Y-m-d 00:00:00"
        );
}

if ($dateTo) {
    $dateToExclusive =
        $dateTo->modify("+1 day");

    $sql .= "
        AND al.created_at < ?
    ";

    $parameterTypes .= "s";
    $parameters[] =
        $dateToExclusive->format(
            "Y-m-d 00:00:00"
        );
}

$sql .= "
    ORDER BY
        al.created_at DESC,
        al.log_id DESC

    LIMIT 100
";

$stmt =
    $conn->prepare(
        $sql
    );

if (!$stmt) {
    error_log(
        "get_activity_logs.php prepare error: " .
        $conn->error
    );

    $conn->close();

    respond_json([
        "success" => false,
        "message" =>
            "Unable to prepare the activity log query.",
        "logs" => []
    ], 500);
}

$stmt->bind_param(
    $parameterTypes,
    ...$parameters
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
        "message" =>
            "Unable to load activity logs.",
        "logs" => []
    ], 500);
}

$result =
    $stmt->get_result();

if (!$result) {
    error_log(
        "get_activity_logs.php result error: " .
        $stmt->error
    );

    $stmt->close();
    $conn->close();

    respond_json([
        "success" => false,
        "message" =>
            "Unable to retrieve activity logs.",
        "logs" => []
    ], 500);
}

/* =========================================================
   FORMAT RESULTS
========================================================= */

$logs = [];

while (
    $row =
        $result->fetch_assoc()
) {
    $row["log_id"] =
        (int) $row["log_id"];

    $row["restaurant_id"] =
        (int) $row["restaurant_id"];

    $row["user_id"] =
        $row["user_id"] !== null
            ? (int) $row["user_id"]
            : null;

    $row["user_role"] =
        (string) (
            $row["user_role"] ??
            "system"
        );

    $row["action_type"] =
        (string) (
            $row["action_type"] ??
            "system"
        );

    $row["action_title"] =
        (string) (
            $row["action_title"] ??
            "Activity Recorded"
        );

    $row["action_description"] =
        (string) (
            $row["action_description"] ??
            "No additional details."
        );

    $row["is_read"] =
        (int) $row["is_read"];

    $logs[] =
        $row;
}

$stmt->close();
$conn->close();

/* =========================================================
   RESPONSE
========================================================= */

respond_json([
    "success" => true,
    "logs" => $logs
]);