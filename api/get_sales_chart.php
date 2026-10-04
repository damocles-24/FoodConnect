<?php

header(
    "Content-Type: application/json; charset=utf-8"
);

header(
    "Cache-Control: no-store, no-cache, must-revalidate, max-age=0"
);

require_once __DIR__ . "/session_config.php";
require_once __DIR__ . "/db.php";

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

/* =========================================================
   REQUEST METHOD
========================================================= */

if (
    strtoupper(
        (string) (
            $_SERVER[
                "REQUEST_METHOD"
            ] ?? ""
        )
    ) !== "GET"
) {
    respond_json([
        "success" => false,
        "message" =>
            "This action is not available."
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
            "Your session has expired or you do not have access. Please log in again."
    ], 401);
}

$userId =
    (int) $_SESSION["user_id"];

$restaurantId =
    (int) $_SESSION[
        "restaurant_id"
    ];

$role =
    strtolower(
        trim(
            (string) (
                $_SESSION["role"] ??
                ""
            )
        )
    );

if (
    $userId <= 0 ||
    $restaurantId <= 0 ||
    $role !== "owner"
) {
    respond_json([
        "success" => false,
        "message" =>
            "Owner access is required."
    ], 403);
}

/* =========================================================
   RANGE
========================================================= */

function parse_chart_date(
    string $value,
    DateTimeZone $timezone
): ?DateTimeImmutable {
    if (
        !preg_match(
            '/^\\d{4}-\\d{2}-\\d{2}$/',
            $value
        )
    ) {
        return null;
    }

    $date = DateTimeImmutable::createFromFormat(
        '!Y-m-d',
        $value,
        $timezone
    );

    $errors = DateTimeImmutable::getLastErrors();

    if (
        !$date ||
        (
            is_array($errors) &&
            (
                ($errors['warning_count'] ?? 0) > 0 ||
                ($errors['error_count'] ?? 0) > 0
            )
        ) ||
        $date->format('Y-m-d') !== $value
    ) {
        return null;
    }

    return $date;
}

$range =
    strtolower(
        trim(
            (string) (
                $_GET["range"] ??
                "weekly"
            )
        )
    );

$allowedRanges = [
    "daily",
    "weekly",
    "monthly",
    "custom"
];

if (
    !in_array(
        $range,
        $allowedRanges,
        true
    )
) {
    $range = "weekly";
}

$timezone = new DateTimeZone(
    "Asia/Manila"
);

if ($range === "custom") {
    $fromValue = trim(
        (string) (
            $_GET["from"] ?? ""
        )
    );

    $toValue = trim(
        (string) (
            $_GET["to"] ?? ""
        )
    );

    $startDate = parse_chart_date(
        $fromValue,
        $timezone
    );

    $lastDate = parse_chart_date(
        $toValue,
        $timezone
    );

    if (!$startDate || !$lastDate) {
        respond_json([
            "success" => false,
            "message" =>
                "Choose valid From and To dates."
        ], 422);
    }

    if ($startDate > $lastDate) {
        respond_json([
            "success" => false,
            "message" =>
                "The From date cannot be later than the To date."
        ], 422);
    }

    $today = new DateTimeImmutable(
        "today",
        $timezone
    );

    if ($lastDate > $today) {
        respond_json([
            "success" => false,
            "message" =>
                "The To date cannot be later than today."
        ], 422);
    }

    $days =
        (int) (
            $startDate
                ->diff($lastDate)
                ->days
        ) + 1;

    if ($days > 366) {
        respond_json([
            "success" => false,
            "message" =>
                "Custom sales reports can cover up to 366 days at a time."
        ], 422);
    }

    $endDate =
        $lastDate->modify(
            "+1 day"
        );

} else {
    switch ($range) {
        case "daily":
            $days = 1;
            break;

        case "monthly":
            $days = 30;
            break;

        case "weekly":
        default:
            $days = 7;
            break;
    }

    $startDate =
        (new DateTimeImmutable(
            "today",
            $timezone
        ))
            ->modify(
                "-" .
                ($days - 1) .
                " days"
            );

    $endDate =
        $startDate->modify(
            "+" . $days . " days"
        );
}

/* =========================================================
   LOAD COMPLETED SALES

   The query returns only existing sales dates.
   Missing dates are filled with zero below.
========================================================= */

$startDateSql =
    $startDate->format(
        "Y-m-d H:i:s"
    );

$endDateSql =
    $endDate->format(
        "Y-m-d H:i:s"
    );

$stmt =
    $conn->prepare("
        SELECT
            DATE(created_at)
                AS sales_date,

            COALESCE(
                SUM(total_amount),
                0
            ) AS total

        FROM tbl_orders

        WHERE restaurant_id = ?
          AND order_status =
                'completed'
          AND created_at >= ?
          AND created_at < ?

        GROUP BY
            DATE(created_at)

        ORDER BY
            DATE(created_at)
    ");

if (!$stmt) {
    error_log(
        "get_sales_chart.php prepare error: " .
        $conn->error
    );

    $conn->close();

    respond_json([
        "success" => false,
        "message" =>
            "Unable to prepare the sales chart."
    ], 500);
}

$stmt->bind_param(
    "iss",
    $restaurantId,
    $startDateSql,
    $endDateSql
);

if (!$stmt->execute()) {
    error_log(
        "get_sales_chart.php execute error: " .
        $stmt->error
    );

    $stmt->close();
    $conn->close();

    respond_json([
        "success" => false,
        "message" =>
            "Unable to load the sales chart."
    ], 500);
}

$result =
    $stmt->get_result();

$salesByDate = [];

while (
    $row =
        $result->fetch_assoc()
) {
    $salesByDate[
        $row["sales_date"]
    ] =
        round(
            (float) $row["total"],
            2
        );
}

$stmt->close();
$conn->close();

/* =========================================================
   FILL MISSING DATES
========================================================= */

$data = [];

for (
    $index = 0;
    $index < $days;
    $index++
) {
    $date =
        $startDate->modify(
            "+" .
            $index .
            " days"
        );

    $dateKey =
        $date->format(
            "Y-m-d"
        );

    if ($range === "daily") {
        $label = "Today";
    } elseif ($range === "weekly") {
        $label =
            $date->format(
                "D"
            );
    } else {
        $label =
            $date->format(
                "M j"
            );
    }

    $data[] = [
        "date" =>
            $dateKey,

        "label" =>
            $label,

        "total" =>
            $salesByDate[
                $dateKey
            ] ?? 0.0
    ];
}

respond_json(
    $data
);