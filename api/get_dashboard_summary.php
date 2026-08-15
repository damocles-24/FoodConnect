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
   REQUEST METHOD
========================================================= */

if (
    strtoupper(
        (string) ($_SERVER["REQUEST_METHOD"] ?? "")
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
$restaurant_id = (int) $_SESSION["restaurant_id"];

$role = strtolower(
    trim(
        (string) ($_SESSION["role"] ?? "")
    )
);

if (
    $user_id <= 0 ||
    $restaurant_id <= 0 ||
    $role !== "owner"
) {
    respond_json([
        "success" => false,
        "message" => "Owner access is required."
    ], 403);
}

/* =========================================================
   VERIFY OWNER AND RESTAURANT
========================================================= */

$ownerStmt = $conn->prepare("
    SELECT
    u.user_id,
    u.full_name,

    r.restaurant_id,
    r.name AS restaurant_name,
    r.business_status,
    r.customer_visibility,
    r.setup_completed,
    r.description,
    r.logo_path,
    r.address,
    r.contact_number,
    r.opening_hours,
    r.delivery_fee,

    pa.application_id,
    pa.application_status,
    pa.rejection_reason

FROM tbl_users u

INNER JOIN tbl_restaurants r
    ON r.restaurant_id = u.restaurant_id

LEFT JOIN tbl_partner_applications pa
    ON pa.owner_id = u.user_id
    WHERE u.user_id = ?
      AND u.restaurant_id = ?
      AND LOWER(u.role) = 'owner'
      AND u.status = 1
      AND r.owner_id = u.user_id
    LIMIT 1
");

if (!$ownerStmt) {
    error_log(
        "get_dashboard_summary.php owner prepare error: " .
        $conn->error
    );

    respond_json([
        "success" => false,
        "message" => "Unable to verify the owner account."
    ], 500);
}

$ownerStmt->bind_param(
    "ii",
    $user_id,
    $restaurant_id
);

$ownerStmt->execute();

$owner = $ownerStmt
    ->get_result()
    ->fetch_assoc();

$ownerStmt->close();

if (!$owner) {
    respond_json([
        "success" => false,
        "message" => "Invalid owner restaurant session."
    ], 403);
}

/* =========================================================
   SUMMARY QUERY
========================================================= */

$summaryStmt = $conn->prepare("
    SELECT
        COALESCE(
            SUM(
                CASE
                    WHEN order_status = 'completed'
                     AND DATE(created_at) = CURDATE()
                    THEN total_amount
                    ELSE 0
                END
            ),
            0
        ) AS sales_today,

        COUNT(*) AS total_orders,

        SUM(
            CASE
                WHEN order_status = 'pending'
                THEN 1
                ELSE 0
            END
        ) AS pending_orders,

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
                    ELSE NULL
                END
            ),
            0
        ) AS average_order_value

    FROM tbl_orders
    WHERE restaurant_id = ?
");

if (!$summaryStmt) {
    error_log(
        "get_dashboard_summary.php summary prepare error: " .
        $conn->error
    );

    respond_json([
        "success" => false,
        "message" => "Unable to load dashboard summary."
    ], 500);
}

$summaryStmt->bind_param(
    "i",
    $restaurant_id
);

$summaryStmt->execute();

$summary = $summaryStmt
    ->get_result()
    ->fetch_assoc();

$summaryStmt->close();

/* =========================================================
   TOTAL PRODUCTS
========================================================= */

$productStmt = $conn->prepare("
    SELECT
        COUNT(*) AS total_products,
        COUNT(DISTINCT NULLIF(TRIM(category), '')) AS total_categories,
        SUM(CASE WHEN status = 'Available' THEN 1 ELSE 0 END) AS available_products,
        SUM(CASE WHEN status = 'Available' AND stock > 0 AND stock <= 5 THEN 1 ELSE 0 END) AS low_stock_products,
        SUM(CASE WHEN stock <= 0 THEN 1 ELSE 0 END) AS out_of_stock_products,
        SUM(CASE WHEN status = 'Available' AND stock > 0 THEN 1 ELSE 0 END) AS orderable_products
    FROM tbl_products
    WHERE restaurant_id = ?
      AND item_type = 'menu_item'
");

if (!$productStmt) {
    error_log(
        "get_dashboard_summary.php product prepare error: " .
        $conn->error
    );

    respond_json([
        "success" => false,
        "message" => "Unable to load product total."
    ], 500);
}

$productStmt->bind_param(
    "i",
    $restaurant_id
);

$productStmt->execute();

$productSummary = $productStmt
    ->get_result()
    ->fetch_assoc();

$productStmt->close();


/* =========================================================
   STAFF SUMMARY
========================================================= */

$staffStmt = $conn->prepare("
    SELECT
        COUNT(*) AS total_staff,
        SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) AS active_staff
    FROM tbl_users
    WHERE restaurant_id = ?
      AND LOWER(role) NOT IN ('owner', 'customer', 'admin')
");

if (!$staffStmt) {
    error_log(
        "get_dashboard_summary.php staff prepare error: " .
        $conn->error
    );

    respond_json([
        "success" => false,
        "message" => "Unable to load staff summary."
    ], 500);
}

$staffStmt->bind_param("i", $restaurant_id);
$staffStmt->execute();
$staffSummary = $staffStmt->get_result()->fetch_assoc();
$staffStmt->close();

/* =========================================================
   READINESS CHECKLIST
========================================================= */

$restaurantInfoReady =
    (int) ($owner["setup_completed"] ?? 0) === 1 &&
    trim((string) ($owner["restaurant_name"] ?? "")) !== "" &&
    trim((string) ($owner["address"] ?? "")) !== "" &&
    trim((string) ($owner["contact_number"] ?? "")) !== "";

$openingHours = trim((string) ($owner["opening_hours"] ?? ""));
$hoursReady =
    $openingHours !== "" &&
    !in_array(
        strtolower($openingHours),
        [
            "configured in restaurant setup",
            "configured during partner application"
        ],
        true
    );

$categoryReady = (int) ($productSummary["total_categories"] ?? 0) > 0;
$productReady = (int) ($productSummary["total_products"] ?? 0) > 0;
$stockReady = (int) ($productSummary["orderable_products"] ?? 0) > 0;
$deliveryReady =
    isset($owner["delivery_fee"]) &&
    (float) $owner["delivery_fee"] >= 0;
$staffReady = (int) ($staffSummary["total_staff"] ?? 0) > 0;

$readinessItems = [
    [
        "key" => "restaurant_information",
        "label" => "Restaurant information completed",
        "description" => "Restaurant name, address, contact number, and setup must be completed.",
        "completed" => $restaurantInfoReady,
        "required" => true,
        "target_section" => "settingsSection"
    ],
    [
        "key" => "operating_hours",
        "label" => "Operating hours configured",
        "description" => "Add the actual days and hours when your restaurant accepts orders.",
        "completed" => $hoursReady,
        "required" => true,
        "target_section" => "settingsSection"
    ],
    [
        "key" => "category",
        "label" => "At least one category added",
        "description" => "Categories organise menu items such as Meals, Drinks, Snacks, or Desserts.",
        "completed" => $categoryReady,
        "required" => true,
        "target_section" => "productsSection"
    ],
    [
        "key" => "product",
        "label" => "At least one product added",
        "description" => "Customers need at least one menu item before the restaurant can be reviewed.",
        "completed" => $productReady,
        "required" => true,
        "target_section" => "productsSection"
    ],
    [
        "key" => "stock",
        "label" => "At least one product is orderable",
        "description" => "An orderable product must be Available and have stock greater than zero.",
        "completed" => $stockReady,
        "required" => true,
        "target_section" => "inventorySection"
    ],
    [
        "key" => "delivery",
        "label" => "Delivery settings configured",
        "description" => "Review the delivery fee and restaurant fulfilment settings.",
        "completed" => $deliveryReady,
        "required" => true,
        "target_section" => "settingsSection"
    ],
    [
        "key" => "staff",
        "label" => "Staff setup completed",
        "description" => "Optional during setup. Staff accounts can also be added after approval.",
        "completed" => $staffReady,
        "required" => false,
        "target_section" => "usersSection"
    ]
];

$requiredCount = 0;
$requiredCompleted = 0;
$blockers = [];

foreach ($readinessItems as $item) {
    if (!empty($item["required"])) {
        $requiredCount++;

        if (!empty($item["completed"])) {
            $requiredCompleted++;
        } else {
            $blockers[] = $item["label"];
        }
    }
}

$readyToApply = $requiredCount > 0 && $requiredCompleted === $requiredCount;
$readinessPercent = $requiredCount > 0
    ? (int) round(($requiredCompleted / $requiredCount) * 100)
    : 0;

/* =========================================================
   BEST-SELLING PRODUCT
========================================================= */

$bestSeller = "-";

$bestSellerStmt = $conn->prepare("
    SELECT
        oi.product_name,
        SUM(oi.quantity) AS total_quantity
    FROM tbl_order_items oi
    INNER JOIN tbl_orders o
        ON o.order_id = oi.order_id
    WHERE o.restaurant_id = ?
      AND o.order_status = 'completed'
    GROUP BY oi.product_name
    ORDER BY total_quantity DESC
    LIMIT 1
");

if ($bestSellerStmt) {
    $bestSellerStmt->bind_param(
        "i",
        $restaurant_id
    );

    $bestSellerStmt->execute();

    $bestSellerRow = $bestSellerStmt
        ->get_result()
        ->fetch_assoc();

    if (
        !empty(
            $bestSellerRow["product_name"]
        )
    ) {
        $bestSeller =
            $bestSellerRow["product_name"];
    }

    $bestSellerStmt->close();
}

/* =========================================================
   RESPONSE
========================================================= */

respond_json([
    "success" => true,

  "restaurant" => [
    "restaurant_id" =>
        $restaurant_id,

    "restaurant_name" =>
        $owner["restaurant_name"],

    "owner_name" =>
        $owner["full_name"],

    "business_status" =>
        $owner["business_status"],

    "customer_visibility" =>
        $owner["customer_visibility"],

    "setup_completed" =>
        (int) $owner["setup_completed"],

    "application_id" =>
        isset($owner["application_id"])
            ? (int) $owner["application_id"]
            : null,

    "application_status" =>
        strtolower(
            trim(
                (string) (
                    $owner["application_status"]
                    ?? "draft"
                )
            )
        ),

    "rejection_reason" =>
        $owner["rejection_reason"]
        ?? null
],

    "salesToday" =>
        (float) (
            $summary["sales_today"] ?? 0
        ),

    "totalOrders" =>
        (int) (
            $summary["total_orders"] ?? 0
        ),

    "pendingOrders" =>
        (int) (
            $summary["pending_orders"] ?? 0
        ),

    "completedOrders" =>
        (int) (
            $summary["completed_orders"] ?? 0
        ),

    "cancelledOrders" =>
        (int) (
            $summary["cancelled_orders"] ?? 0
        ),

    "averageOrderValue" =>
        (float) (
            $summary["average_order_value"] ?? 0
        ),

    "bestSeller" =>
        $bestSeller,

    "totalProducts" =>
        (int) (
            $productSummary["total_products"] ?? 0
        ),

    "availableProducts" =>
        (int) ($productSummary["available_products"] ?? 0),

    "lowStockProducts" =>
        (int) ($productSummary["low_stock_products"] ?? 0),

    "outOfStockProducts" =>
        (int) ($productSummary["out_of_stock_products"] ?? 0),

    "activeStaff" =>
        (int) ($staffSummary["active_staff"] ?? 0),

    "totalStaff" =>
        (int) ($staffSummary["total_staff"] ?? 0),

    "readiness" => [
        "ready_to_apply" => $readyToApply,
        "percentage" => $readinessPercent,
        "required_completed" => $requiredCompleted,
        "required_total" => $requiredCount,
        "blockers" => $blockers,
        "items" => $readinessItems
    ]
]);