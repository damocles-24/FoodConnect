<?php

header(
    "Content-Type: application/json; charset=utf-8"
);

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
        JSON_UNESCAPED_UNICODE |
        JSON_UNESCAPED_SLASHES
    );

    exit;
}

/* =========================================================
   PREPARE STATEMENT
========================================================= */

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

/* =========================================================
   REQUEST METHOD
========================================================= */

if (
    strtoupper(
        (string) (
            $_SERVER["REQUEST_METHOD"] ?? ""
        )
    ) !== "GET"
) {
    respond_json([
        "success" => false,
        "message" => "Method not allowed."
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
        "message" => "Unauthorized access."
    ], 401);
}

$user_id = (int) $_SESSION["user_id"];

$restaurant_id = (int) (
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
    $user_id <= 0 ||
    $restaurant_id <= 0 ||
    $role !== "owner"
) {
    respond_json([
        "success" => false,
        "message" =>
            "Owner access is required."
    ], 403);
}

/* =========================================================
   VERIFY OWNER AND RESTAURANT
========================================================= */

$ownerStmt = prepare_or_fail(
    $conn,
    "
        SELECT
            u.user_id
        FROM tbl_users u

        INNER JOIN tbl_restaurants r
            ON r.owner_id = u.user_id

        WHERE u.user_id = ?
          AND r.restaurant_id = ?
          AND LOWER(u.role) = 'owner'

        LIMIT 1
    "
);

$ownerStmt->bind_param(
    "ii",
    $user_id,
    $restaurant_id
);

$ownerStmt->execute();

$ownerResult =
    $ownerStmt->get_result();

$ownerExists =
    $ownerResult->fetch_assoc();

$ownerStmt->close();

if (!$ownerExists) {
    respond_json([
        "success" => false,
        "message" =>
            "Invalid owner restaurant session."
    ], 403);
}

/* =========================================================
   PERFORMANCE RANGE

   daily   = today
   weekly  = last 7 days
   monthly = last 30 days
========================================================= */

$range = strtolower(
    trim(
        (string) (
            $_GET["range"] ?? "weekly"
        )
    )
);

$allowedRanges = [
    "daily",
    "weekly",
    "monthly"
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

switch ($range) {
    case "daily":
        $orderDateCondition = "
            o.created_at >= CURDATE()
            AND o.created_at <
                DATE_ADD(
                    CURDATE(),
                    INTERVAL 1 DAY
                )
        ";

        $deliveryDateCondition = "
            da.assigned_at >= CURDATE()
            AND da.assigned_at <
                DATE_ADD(
                    CURDATE(),
                    INTERVAL 1 DAY
                )
        ";

        $rangeLabel = "Today";
        break;

    case "monthly":
        $orderDateCondition = "
            o.created_at >=
                DATE_SUB(
                    NOW(),
                    INTERVAL 30 DAY
                )
        ";

        $deliveryDateCondition = "
            da.assigned_at >=
                DATE_SUB(
                    NOW(),
                    INTERVAL 30 DAY
                )
        ";

        $rangeLabel = "Last 30 Days";
        break;

    case "weekly":
    default:
        $orderDateCondition = "
            o.created_at >=
                DATE_SUB(
                    NOW(),
                    INTERVAL 7 DAY
                )
        ";

        $deliveryDateCondition = "
            da.assigned_at >=
                DATE_SUB(
                    NOW(),
                    INTERVAL 7 DAY
                )
        ";

        $rangeLabel = "Last 7 Days";
        break;
}

/* =========================================================
   SALES REPORT
========================================================= */

try {

    /* =====================================================
       SALES SUMMARY

       The existing summary remains all-time.
    ===================================================== */

    $summaryStmt = prepare_or_fail(
        $conn,
        "
            SELECT
                COALESCE(
                    SUM(
                        CASE
                            WHEN order_status = 'completed'
                            THEN total_amount
                            ELSE 0
                        END
                    ),
                    0
                ) AS total_revenue,

                COUNT(*) AS total_orders,

                SUM(
                    CASE
                        WHEN order_status = 'completed'
                        THEN 1
                        ELSE 0
                    END
                ) AS completed_orders,

                SUM(
                    CASE
                        WHEN order_status = 'cancelled'
                        THEN 1
                        ELSE 0
                    END
                ) AS cancelled_orders,

                COALESCE(
                    AVG(
                        CASE
                            WHEN order_status = 'completed'
                            THEN total_amount
                        END
                    ),
                    0
                ) AS average_order_value

            FROM tbl_orders

            WHERE restaurant_id = ?
        "
    );

    $summaryStmt->bind_param(
        "i",
        $restaurant_id
    );

    $summaryStmt->execute();

    $summary =
        $summaryStmt
            ->get_result()
            ->fetch_assoc();

    $summaryStmt->close();

    /* =====================================================
       BEST-SELLING PRODUCTS
    ===================================================== */

    $bestProductStmt = prepare_or_fail(
        $conn,
        "
            SELECT
                COALESCE(
                    p.product_name,
                    oi.product_name,
                    'Unknown Product'
                ) AS product_name,

                COALESCE(
                    p.size,
                    ''
                ) AS size,

                SUM(
                    oi.quantity
                ) AS total_sold,

                SUM(
                    oi.quantity * oi.price
                ) AS total_sales

            FROM tbl_order_items oi

            INNER JOIN tbl_orders o
                ON o.order_id = oi.order_id

            LEFT JOIN tbl_products p
                ON p.product_id = oi.product_id

            WHERE o.restaurant_id = ?
              AND o.order_status = 'completed'

            GROUP BY
                p.product_id,
                product_name,
                size

            ORDER BY
                total_sold DESC,
                total_sales DESC

            LIMIT 5
        "
    );

    $bestProductStmt->bind_param(
        "i",
        $restaurant_id
    );

    $bestProductStmt->execute();

    $bestProducts =
        $bestProductStmt
            ->get_result()
            ->fetch_all(
                MYSQLI_ASSOC
            );

    $bestProductStmt->close();

    /* =====================================================
       BEST-SELLING CATEGORIES
    ===================================================== */

    $bestCategoryStmt = prepare_or_fail(
        $conn,
        "
            SELECT
                COALESCE(
                    p.category,
                    'Uncategorized'
                ) AS category,

                SUM(
                    oi.quantity
                ) AS total_sold,

                SUM(
                    oi.quantity * oi.price
                ) AS total_sales

            FROM tbl_order_items oi

            INNER JOIN tbl_orders o
                ON o.order_id = oi.order_id

            LEFT JOIN tbl_products p
                ON p.product_id = oi.product_id

            WHERE o.restaurant_id = ?
              AND o.order_status = 'completed'

            GROUP BY
                category

            ORDER BY
                total_sold DESC,
                total_sales DESC

            LIMIT 5
        "
    );

    $bestCategoryStmt->bind_param(
        "i",
        $restaurant_id
    );

    $bestCategoryStmt->execute();

    $bestCategories =
        $bestCategoryStmt
            ->get_result()
            ->fetch_all(
                MYSQLI_ASSOC
            );

    $bestCategoryStmt->close();

    /* =====================================================
       CASHIER PERFORMANCE

       Orders are attributed using:
       tbl_orders.processed_by_cashier_id
    ===================================================== */

    $cashierSql = "
        SELECT
            u.user_id AS cashier_id,
            u.full_name AS cashier_name,
            u.status AS account_status,

            COUNT(
                o.order_id
            ) AS handled_orders,

            SUM(
                CASE
                    WHEN o.order_status = 'completed'
                    THEN 1
                    ELSE 0
                END
            ) AS completed_orders,

            COALESCE(
                SUM(
                    CASE
                        WHEN o.order_status = 'completed'
                        THEN o.total_amount
                        ELSE 0
                    END
                ),
                0
            ) AS total_sales_handled,

            SUM(
                CASE
                    WHEN o.order_status = 'cancelled'
                    THEN 1
                    ELSE 0
                END
            ) AS cancelled_orders,

            COALESCE(
                AVG(
                    CASE
                        WHEN o.order_status = 'completed'
                        THEN o.total_amount
                    END
                ),
                0
            ) AS average_order_value

        FROM tbl_users u

        LEFT JOIN tbl_orders o
            ON o.processed_by_cashier_id =
                u.user_id

           AND o.restaurant_id =
                u.restaurant_id

           AND {$orderDateCondition}

        WHERE u.restaurant_id = ?
          AND LOWER(u.role) = 'cashier'

        GROUP BY
            u.user_id,
            u.full_name,
            u.status

        ORDER BY
            total_sales_handled DESC,
            completed_orders DESC,
            u.full_name ASC
    ";

    $cashierStmt = prepare_or_fail(
        $conn,
        $cashierSql
    );

    $cashierStmt->bind_param(
        "i",
        $restaurant_id
    );

    $cashierStmt->execute();

    $cashierRows =
        $cashierStmt
            ->get_result()
            ->fetch_all(
                MYSQLI_ASSOC
            );

    $cashierStmt->close();

    $cashierPerformance = [];

    foreach ($cashierRows as $row) {
        $cashierPerformance[] = [
            "cashier_id" =>
                (int) $row["cashier_id"],

            "cashier_name" =>
                (string) $row["cashier_name"],

            "account_status" =>
                (int) $row["account_status"],

            "handled_orders" =>
                (int) $row["handled_orders"],

            "completed_orders" =>
                (int) $row["completed_orders"],

            "total_sales_handled" =>
                round(
                    (float) $row[
                        "total_sales_handled"
                    ],
                    2
                ),

            "cancelled_orders" =>
                (int) $row["cancelled_orders"],

            "average_order_value" =>
                round(
                    (float) $row[
                        "average_order_value"
                    ],
                    2
                )
        ];
    }

    /* =====================================================
       DELIVERY PERFORMANCE

       Delivery assignments are attributed using:
       tbl_delivery_assignments.rider_id
    ===================================================== */

    $deliverySql = "
        SELECT
            u.user_id AS rider_id,
            u.full_name AS rider_name,
            u.status AS account_status,

            COUNT(
                da.assignment_id
            ) AS assigned_deliveries,

            SUM(
                CASE
                    WHEN da.delivery_status = 'completed'
                    THEN 1
                    ELSE 0
                END
            ) AS completed_deliveries,

            SUM(
                CASE
                    WHEN da.delivery_status = 'cancelled'
                    THEN 1
                    ELSE 0
                END
            ) AS failed_cancelled_deliveries,

            COALESCE(
                SUM(
                    CASE
                        WHEN da.delivery_status = 'completed'
                         AND LOWER(
                            TRIM(
                                o.payment_method
                            )
                         ) IN (
                            'cod',
                            'cash on delivery'
                         )
                        THEN o.total_amount
                        ELSE 0
                    END
                ),
                0
            ) AS cod_amount_handled,

            CASE
                WHEN COUNT(
                    da.assignment_id
                ) = 0
                THEN 0

                ELSE ROUND(
                    (
                        SUM(
                            CASE
                                WHEN da.delivery_status =
                                    'completed'
                                THEN 1
                                ELSE 0
                            END
                        ) /
                        COUNT(
                            da.assignment_id
                        )
                    ) * 100,
                    2
                )
            END AS completion_rate

        FROM tbl_users u

        LEFT JOIN tbl_delivery_assignments da
            ON da.rider_id = u.user_id

           AND da.restaurant_id =
                u.restaurant_id

           AND {$deliveryDateCondition}

        LEFT JOIN tbl_orders o
            ON o.order_id = da.order_id

           AND o.restaurant_id =
                da.restaurant_id

        WHERE u.restaurant_id = ?
          AND LOWER(u.role) =
                'delivery_staff'

        GROUP BY
            u.user_id,
            u.full_name,
            u.status

        ORDER BY
            completed_deliveries DESC,
            completion_rate DESC,
            u.full_name ASC
    ";

    $deliveryStmt = prepare_or_fail(
        $conn,
        $deliverySql
    );

    $deliveryStmt->bind_param(
        "i",
        $restaurant_id
    );

    $deliveryStmt->execute();

    $deliveryRows =
        $deliveryStmt
            ->get_result()
            ->fetch_all(
                MYSQLI_ASSOC
            );

    $deliveryStmt->close();

    $deliveryPerformance = [];

    foreach ($deliveryRows as $row) {
        $deliveryPerformance[] = [
            "rider_id" =>
                (int) $row["rider_id"],

            "rider_name" =>
                (string) $row["rider_name"],

            "account_status" =>
                (int) $row["account_status"],

            "assigned_deliveries" =>
                (int) $row[
                    "assigned_deliveries"
                ],

            "completed_deliveries" =>
                (int) $row[
                    "completed_deliveries"
                ],

            "failed_cancelled_deliveries" =>
                (int) $row[
                    "failed_cancelled_deliveries"
                ],

            "cod_amount_handled" =>
                round(
                    (float) $row[
                        "cod_amount_handled"
                    ],
                    2
                ),

            "completion_rate" =>
                round(
                    (float) $row[
                        "completion_rate"
                    ],
                    2
                )
        ];
    }

    /* =====================================================
       RESPONSE
    ===================================================== */

    respond_json([
        "success" => true,

        "performanceRange" => [
            "value" => $range,
            "label" => $rangeLabel
        ],

        "summary" => [
            "total_revenue" =>
                round(
                    (float) (
                        $summary[
                            "total_revenue"
                        ] ?? 0
                    ),
                    2
                ),

            "total_orders" =>
                (int) (
                    $summary[
                        "total_orders"
                    ] ?? 0
                ),

            "completed_orders" =>
                (int) (
                    $summary[
                        "completed_orders"
                    ] ?? 0
                ),

            "cancelled_orders" =>
                (int) (
                    $summary[
                        "cancelled_orders"
                    ] ?? 0
                ),

            "average_order_value" =>
                round(
                    (float) (
                        $summary[
                            "average_order_value"
                        ] ?? 0
                    ),
                    2
                )
        ],

        "bestProducts" =>
            $bestProducts,

        "bestCategories" =>
            $bestCategories,

        "cashierPerformance" =>
            $cashierPerformance,

        "deliveryPerformance" =>
            $deliveryPerformance
    ]);

} catch (Throwable $error) {
    error_log(
        "get_sales_report.php error: " .
        $error->getMessage()
    );

    respond_json([
        "success" => false,
        "message" =>
            "Failed to load the sales report."
    ], 500);

} finally {
    $conn->close();
}