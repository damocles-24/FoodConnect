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
     * Latest FoodConnect database schema:
     *
     * tbl_orders.order_status supports:
     * pending, preparing, ready, assigned,
     * out_for_delivery, completed, cancelled.
     *
     * Therefore only `completed` is a valid finished-sale
     * status for Popular Products.
     *
     * We also explicitly keep only current menu items that
     * customers can actually order.
     */

    $safeLimit =
        max(
            1,
            min(
                (int)$limit,
                12
            )
        );

    $popularSql = "
        SELECT
            MIN(p.product_name)
                AS product_name,

            MIN(p.category)
                AS category,

            GROUP_CONCAT(
                DISTINCT p.product_id
                ORDER BY p.product_id ASC
            ) AS product_ids,

            SUM(oi.quantity)
                AS total_sold,

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

          AND o.order_status =
              'completed'

          AND oi.quantity > 0

          AND p.item_type =
              'menu_item'

          AND p.stock > 0

          AND p.status =
              'Available'

        GROUP BY
            LOWER(
                TRIM(p.category)
            ),
            LOWER(
                TRIM(p.product_name)
            )

        ORDER BY
            total_sold DESC,
            order_count DESC,
            product_name ASC

        LIMIT {$safeLimit}
    ";

    $popularStmt =
        $conn->prepare(
            $popularSql
        );

    if (!$popularStmt) {
        throw new RuntimeException(
            "Unable to prepare popular products query: " .
            $conn->error
        );
    }

    $popularStmt->bind_param(
        "ii",
        $restaurant_id,
        $restaurant_id
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

    /*
     * Fallback:
     * If this restaurant has no completed sales yet,
     * recommend its newest currently-orderable menu items.
     */
    if (count($products) === 0) {

        $fallbackSql = "
            SELECT
                MIN(p.product_name)
                    AS product_name,

                MIN(p.category)
                    AS category,

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

              AND p.item_type =
                  'menu_item'

              AND p.stock > 0

              AND p.status =
                  'Available'

            GROUP BY
                LOWER(
                    TRIM(p.category)
                ),
                LOWER(
                    TRIM(p.product_name)
                )

            ORDER BY
                newest_product_id DESC

            LIMIT {$safeLimit}
        ";

        $fallbackStmt =
            $conn->prepare(
                $fallbackSql
            );

        if (!$fallbackStmt) {
            throw new RuntimeException(
                "Unable to prepare fallback products query: " .
                $conn->error
            );
        }

        $fallbackStmt->bind_param(
            "i",
            $restaurant_id
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

    $remoteAddress =
        $_SERVER["REMOTE_ADDR"] ?? "";

    $serverName =
        strtolower(
            (string)(
                $_SERVER["SERVER_NAME"] ?? ""
            )
        );

    $isLocalDebug =
        in_array(
            $remoteAddress,
            [
                "127.0.0.1",
                "::1"
            ],
            true
        ) ||
        in_array(
            $serverName,
            [
                "localhost",
                "127.0.0.1"
            ],
            true
        );

    $response = [
        "success" => false,
        "message" =>
            "Unable to load popular products.",
        "products" => []
    ];

    /*
     * Never expose SQL details on live hosting.
     * This field appears only on localhost.
     */
    if ($isLocalDebug) {
        $response["debug_error"] =
            $error->getMessage();
    }

    respond_json(
        $response,
        500
    );
}
