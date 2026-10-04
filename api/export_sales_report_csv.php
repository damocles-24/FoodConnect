<?php

require_once __DIR__ . "/session_config.php";
require_once __DIR__ . "/db.php";

/* =========================================================
   PER-RESTAURANT SALES REPORT CSV EXPORT

   Rules:
   - Owner only
   - Uses restaurant_id from the authenticated session
   - Never accepts restaurant_id from the browser
   - Matches the Sales Report periods
   - Exports completed sales only so totals represent real sales
========================================================= */

function fail_export(
    string $message,
    int $statusCode = 400
): void {
    http_response_code($statusCode);
    header("Content-Type: text/plain; charset=utf-8");
    header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
    echo $message;
    exit;
}

function prepare_or_fail(
    mysqli $conn,
    string $sql
): mysqli_stmt {
    $stmt = $conn->prepare($sql);

    if (!$stmt) {
        throw new RuntimeException(
            "SQL prepare failed: " .
            $conn->error
        );
    }

    return $stmt;
}

/*
 * Prevent spreadsheet applications from treating user text
 * as a formula when the CSV is opened.
 */
function csv_safe_text($value): string
{
    $text = (string) ($value ?? "");

    if (
        $text !== "" &&
        preg_match('/^[=+\-@]/', $text)
    ) {
        return "'" . $text;
    }

    return $text;
}


function parse_export_date(
    string $value,
    DateTimeZone $timezone
): ?DateTimeImmutable {
    if (
        !preg_match(
            '/^\d{4}-\d{2}-\d{2}$/',
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

function format_export_period_label(
    DateTimeImmutable $from,
    DateTimeImmutable $to
): string {
    if (
        $from->format('Y-m-d') ===
        $to->format('Y-m-d')
    ) {
        return $from->format('M j, Y');
    }

    return
        $from->format('M j, Y') .
        ' – ' .
        $to->format('M j, Y');
}

if (
    strtoupper(
        (string) (
            $_SERVER["REQUEST_METHOD"] ?? ""
        )
    ) !== "GET"
) {
    fail_export(
        "This action is not available.",
        405
    );
}

$userId =
    (int) (
        $_SESSION["user_id"] ?? 0
    );

$restaurantId =
    (int) (
        $_SESSION["restaurant_id"] ?? 0
    );

$role = strtolower(
    trim(
        (string) (
            $_SESSION["role"] ?? ""
        )
    )
);

if (
    $userId <= 0 ||
    $restaurantId <= 0
) {
    fail_export(
        "Your session has expired or you do not have access. Please log in again.",
        401
    );
}

if ($role !== "owner") {
    fail_export(
        "Owner access is required.",
        403
    );
}

$range = strtolower(
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

$reportTimezone =
    new DateTimeZone(
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

    $fromDate = parse_export_date(
        $fromValue,
        $reportTimezone
    );

    $toDate = parse_export_date(
        $toValue,
        $reportTimezone
    );

    if (!$fromDate || !$toDate) {
        fail_export(
            "Choose valid From and To dates.",
            422
        );
    }

    if ($fromDate > $toDate) {
        fail_export(
            "The From date cannot be later than the To date.",
            422
        );
    }

    $today = new DateTimeImmutable(
        "today",
        $reportTimezone
    );

    if ($toDate > $today) {
        fail_export(
            "The To date cannot be later than today.",
            422
        );
    }

    $days =
        (int) (
            $fromDate
                ->diff($toDate)
                ->days
        ) + 1;

    if ($days > 366) {
        fail_export(
            "Custom sales reports can cover up to 366 days at a time.",
            422
        );
    }

    $toExclusive =
        $toDate->modify(
            "+1 day"
        );

    $fromSql =
        $fromDate->format(
            "Y-m-d 00:00:00"
        );

    $toExclusiveSql =
        $toExclusive->format(
            "Y-m-d 00:00:00"
        );

    $dateCondition = "
        o.created_at >= '{$fromSql}'
        AND o.created_at < '{$toExclusiveSql}'
    ";

    $rangeLabel =
        format_export_period_label(
            $fromDate,
            $toDate
        );

    $filenameRange =
        "from_" .
        $fromDate->format("Y-m-d") .
        "_to_" .
        $toDate->format("Y-m-d");

} else {
    switch ($range) {
        case "daily":
            $dateCondition = "
                o.created_at >= CURDATE()
                AND o.created_at <
                    DATE_ADD(
                        CURDATE(),
                        INTERVAL 1 DAY
                    )
            ";

            $rangeLabel = "Today";
            $filenameRange = "today";
            break;

        case "monthly":
            $dateCondition = "
                o.created_at >=
                    DATE_SUB(
                        CURDATE(),
                        INTERVAL 29 DAY
                    )
                AND o.created_at <
                    DATE_ADD(
                        CURDATE(),
                        INTERVAL 1 DAY
                    )
            ";

            $rangeLabel = "Last 30 Days";
            $filenameRange = "last_30_days";
            break;

        case "weekly":
        default:
            $dateCondition = "
                o.created_at >=
                    DATE_SUB(
                        CURDATE(),
                        INTERVAL 6 DAY
                    )
                AND o.created_at <
                    DATE_ADD(
                        CURDATE(),
                        INTERVAL 1 DAY
                    )
            ";

            $rangeLabel = "Last 7 Days";
            $filenameRange = "last_7_days";
            break;
    }
}

try {
    /* =====================================================
       VERIFY OWNER OWNS THE SESSION RESTAURANT
    ===================================================== */

    $ownerStmt = prepare_or_fail(
        $conn,
        "
           SELECT
    r.name AS restaurant_name
            FROM tbl_users u

            INNER JOIN tbl_restaurants r
                ON r.owner_id = u.user_id

            WHERE u.user_id = ?
              AND r.restaurant_id = ?
              AND LOWER(u.role) = 'owner'
              AND u.status = 1

            LIMIT 1
        "
    );

    $ownerStmt->bind_param(
        "ii",
        $userId,
        $restaurantId
    );

    $ownerStmt->execute();

    $restaurant =
        $ownerStmt
            ->get_result()
            ->fetch_assoc();

    $ownerStmt->close();

    if (!$restaurant) {
        fail_export(
            "Invalid owner restaurant session.",
            403
        );
    }

    $restaurantName = trim(
        (string) (
            $restaurant["restaurant_name"] ??
            "Restaurant"
        )
    );

    if ($restaurantName === "") {
        $restaurantName = "Restaurant";
    }

    /* =====================================================
       FETCH COMPLETED SALES FOR THIS RESTAURANT ONLY
    ===================================================== */

    $salesStmt = prepare_or_fail(
        $conn,
        "
            SELECT
                o.order_id,
                o.queue_number,
                o.created_at,
                o.order_type,
                o.customer_name,
                o.payment_method,
                o.order_status,
                o.subtotal,
                o.delivery_fee,
                o.total_amount
            FROM tbl_orders o
            WHERE o.restaurant_id = ?
              AND o.order_status = 'completed'
              AND {$dateCondition}
            ORDER BY
                o.created_at ASC,
                o.order_id ASC
        "
    );

    $salesStmt->bind_param(
        "i",
        $restaurantId
    );

    $salesStmt->execute();
    $salesResult = $salesStmt->get_result();

    /* =====================================================
       DOWNLOAD HEADERS
    ===================================================== */

    $safeFilenameRestaurant =
        preg_replace(
            '/[^A-Za-z0-9_-]+/',
            '_',
            $restaurantName
        );

    $safeFilenameRestaurant =
        trim(
            (string) $safeFilenameRestaurant,
            "_"
        );

    if ($safeFilenameRestaurant === "") {
        $safeFilenameRestaurant = "restaurant";
    }

    $filename = sprintf(
        "%s_sales_report_%s_%s.csv",
        $safeFilenameRestaurant,
        $filenameRange,
        date("Y-m-d")
    );

    header("Content-Type: text/csv; charset=UTF-8");
    header(
        'Content-Disposition: attachment; filename="' .
        $filename .
        '"'
    );
    header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
    header("Pragma: no-cache");

    $output = fopen(
        "php://output",
        "w"
    );

    if ($output === false) {
        throw new RuntimeException(
            "Unable to create CSV output."
        );
    }

    /* UTF-8 BOM helps Excel display names correctly. */
    fwrite(
        $output,
        "\xEF\xBB\xBF"
    );

    fputcsv(
        $output,
        [
            "Restaurant",
            "Report Period",
            "Order ID",
            "Queue Number",
            "Date",
            "Order Type",
            "Customer",
            "Payment Method",
            "Status",
            "Subtotal",
            "Delivery Fee",
            "Total Amount"
        ]
    );

    while (
        $row =
            $salesResult->fetch_assoc()
    ) {
        fputcsv(
            $output,
            [
                csv_safe_text(
                    $restaurantName
                ),
                $rangeLabel,
                (int) $row["order_id"],
                $row["queue_number"] !== null
                    ? (int) $row["queue_number"]
                    : "",
                (string) $row["created_at"],
                csv_safe_text(
                    ucwords(
                        str_replace(
                            "_",
                            " ",
                            (string) $row["order_type"]
                        )
                    )
                ),
                csv_safe_text(
                    $row["customer_name"]
                ),
                csv_safe_text(
                    $row["payment_method"]
                ),
                "Completed",
                number_format(
                    (float) $row["subtotal"],
                    2,
                    ".",
                    ""
                ),
                number_format(
                    (float) $row["delivery_fee"],
                    2,
                    ".",
                    ""
                ),
                number_format(
                    (float) $row["total_amount"],
                    2,
                    ".",
                    ""
                )
            ]
        );
    }

    fclose($output);
    $salesStmt->close();
    $conn->close();
    exit;

} catch (Throwable $error) {
    error_log(
        "export_sales_report_csv.php error: " .
        $error->getMessage()
    );

    fail_export(
        "Failed to export the sales report.",
        500
    );
}
