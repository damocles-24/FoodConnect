<?php

header(
    "Content-Type: application/json; charset=utf-8"
);

header(
    "Cache-Control: no-store, no-cache, must-revalidate, max-age=0"
);

header("Pragma: no-cache");
header("Expires: 0");

error_reporting(
    E_ALL & ~E_NOTICE & ~E_WARNING
);

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
   REQUEST METHOD
========================================================= */

if (
    strtoupper(
        $_SERVER["REQUEST_METHOD"] ?? ""
    ) !== "GET"
) {
    respond_json([
        "success" => false,
        "message" =>
            "Only GET requests are allowed.",
        "products" => []
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
            "Database connection is unavailable.",
        "products" => []
    ], 500);
}

$conn->set_charset("utf8mb4");

/* =========================================================
   RESTAURANT
========================================================= */

/*
 * Current restaurant page example:
 *
 * restaurant.html?restaurant_id={restaurant_id}
 *
 * When the dynamic restaurant storefront is implemented,
 * this same endpoint will continue working because every
 * restaurant page will provide its own restaurant_id.
 */

$restaurant_id = filter_input(
    INPUT_GET,
    "restaurant_id",
    FILTER_VALIDATE_INT
);

$restaurant_id = (int)$restaurant_id;

if ($restaurant_id <= 0) {
    respond_json([
        "success" => false,
        "message" =>
            "A valid restaurant ID is required.",
        "products" => []
    ], 422);
}

/* =========================================================
   LIMIT
========================================================= */

$limit = filter_input(
    INPUT_GET,
    "limit",
    FILTER_VALIDATE_INT
);

$limit = (int)$limit;

if ($limit <= 0) {
    $limit = 4;
}

/*
 * Prevent an excessive public request.
 */
$limit = min($limit, 12);

/* =========================================================
   NORMALIZE POPULAR PRODUCT ROW
========================================================= */

function normalize_popular_product(
    array $row,
    bool $isFallback = false
): array {
    $productIds = [];

    $rawProductIds = trim(
        (string)(
            $row["product_ids"] ?? ""
        )
    );

    if ($rawProductIds !== "") {
        foreach (
            explode(",", $rawProductIds)
            as $productId
        ) {
            $productId = (int)$productId;

            if ($productId > 0) {
                $productIds[] = $productId;
            }
        }
    }

    $productIds = array_values(
        array_unique($productIds)
    );

    return [
        "product_name" =>
            trim(
                (string)(
                    $row["product_name"] ??
                    "Product"
                )
            ),

        "category" =>
            trim(
                (string)(
                    $row["category"] ??
                    "Uncategorized"
                )
            ),

        "product_ids" =>
            $productIds,

        "total_sold" =>
            max(
                0,
                (int)(
                    $row["total_sold"] ?? 0
                )
            ),

        "order_count" =>
            max(
                0,
                (int)(
                    $row["order_count"] ?? 0
                )
            ),

        "is_fallback" =>
            $isFallback
    ];
}

/* =========================================================
   LOAD POPULAR PRODUCTS
========================================================= */

try {

    /*
     * Popularity is based only on successfully finished
     * orders.
     *
     * Supported final statuses:
     * - completed
     * - delivered
     * - picked_up_by_customer
     *
     * Cancelled and unfinished orders are excluded.
     *
     * Product variants are grouped using:
     * - restaurant_id
     * - category
     * - product_name
     */

    $popularSql = "
        SELECT
            p.product_name,
            p.category,

            GROUP_CONCAT(
                DISTINCT p.product_id
                ORDER BY p.product_id ASC
            ) AS product_ids,

           SUM(
    CASE
        WHEN oi.quantity > 0
            THEN oi.quantity
        ELSE 0
    END
) AS total_sold,

            COUNT(
                DISTINCT o.order_id
            ) AS order_count

        FROM tbl_order_items oi

        INNER JOIN tbl_orders o
            ON o.order_id =
               oi.order_id

        INNER JOIN tbl_products p
            ON p.product_id =
               oi.product_id

        WHERE o.restaurant_id = ?
          AND p.restaurant_id = ?

          AND oi.quantity > 0

          AND LOWER(
              TRIM(o.order_status)
          ) IN (
              'completed',
              'delivered',
              'picked_up_by_customer'
          )

          AND LOWER(
              TRIM(p.category)
          ) NOT LIKE '%add-on%'

          AND LOWER(
              TRIM(p.category)
          ) NOT LIKE '%addon%'

        GROUP BY
            p.restaurant_id,
            LOWER(TRIM(p.category)),
            LOWER(TRIM(p.product_name))

        ORDER BY
            total_sold DESC,
            order_count DESC,
            p.product_name ASC

        LIMIT ?
    ";

    $popularStmt = $conn->prepare(
        $popularSql
    );

    if (!$popularStmt) {
        throw new RuntimeException(
            "Unable to prepare popular products query: " .
            $conn->error
        );
    }

    $popularStmt->bind_param(
        "iii",
        $restaurant_id,
        $restaurant_id,
        $limit
    );

    if (!$popularStmt->execute()) {
        throw new RuntimeException(
            "Unable to load popular products: " .
            $popularStmt->error
        );
    }

    $popularResult =
        $popularStmt->get_result();

    $products = [];

    while (
        $row =
        $popularResult->fetch_assoc()
    ) {
        $products[] =
            normalize_popular_product(
                $row,
                false
            );
    }

    $popularStmt->close();

    /* =====================================================
       FALLBACK FOR RESTAURANTS WITH NO COMPLETED SALES
    ===================================================== */

    if (count($products) === 0) {

        /*
         * Show the newest available product groups instead
         * of leaving the section empty.
         */

        $fallbackSql = "
            SELECT
                p.product_name,
                p.category,

                GROUP_CONCAT(
                    DISTINCT p.product_id
                    ORDER BY p.product_id ASC
                ) AS product_ids,

                0 AS total_sold,
                0 AS order_count,

                MAX(p.product_id)
                    AS newest_product_id

            FROM tbl_products p

            WHERE p.restaurant_id = ?

              AND p.stock > 0

              AND LOWER(
                  TRIM(p.status)
              ) = 'available'

              AND LOWER(
                  TRIM(p.category)
              ) NOT LIKE '%add-on%'

              AND LOWER(
                  TRIM(p.category)
              ) NOT LIKE '%addon%'

            GROUP BY
                p.restaurant_id,
                LOWER(TRIM(p.category)),
                LOWER(TRIM(p.product_name))

            ORDER BY
                newest_product_id DESC

            LIMIT ?
        ";

        $fallbackStmt = $conn->prepare(
            $fallbackSql
        );

        if (!$fallbackStmt) {
            throw new RuntimeException(
                "Unable to prepare fallback products query: " .
                $conn->error
            );
        }

        $fallbackStmt->bind_param(
            "ii",
            $restaurant_id,
            $limit
        );

        if (!$fallbackStmt->execute()) {
            throw new RuntimeException(
                "Unable to load fallback products: " .
                $fallbackStmt->error
            );
        }

        $fallbackResult =
            $fallbackStmt->get_result();

        while (
            $row =
            $fallbackResult->fetch_assoc()
        ) {
            $products[] =
                normalize_popular_product(
                    $row,
                    true
                );
        }

        $fallbackStmt->close();
    }

   $usingFallback =
    count($products) > 0 &&
    $products[0]["is_fallback"] === true;

respond_json([
    "success" => true,

    "restaurant_id" =>
        $restaurant_id,

    "source" =>
        $usingFallback
            ? "fallback"
            : "sales",

    "products" =>
        $products
]);

} catch (Throwable $error) {

    error_log(
        "get_popular_products.php: " .
        $error->getMessage()
    );

    respond_json([
        "success" => false,
        "message" =>
            "Unable to load popular products.",
        "products" => []
    ], 500);
}