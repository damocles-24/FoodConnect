<?php

header(
    "Content-Type: application/json; charset=utf-8"
);

header(
    "Cache-Control: no-store, no-cache, must-revalidate, max-age=0"
);

require_once __DIR__ . "/db.php";

/*
 * Promotion dates are entered and stored
 * using Philippine local time.
 */
$promotionTimezone =
    new DateTimeZone(
        "Asia/Manila"
    );

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
   RESTAURANT ID
========================================================= */

$restaurant_id = filter_input(
    INPUT_GET,
    "restaurant_id",
    FILTER_VALIDATE_INT
);

if (
    $restaurant_id === false ||
    $restaurant_id === null ||
    $restaurant_id <= 0
) {
    respond_json([
        "success" => false,
        "message" => "Invalid restaurant ID."
    ], 422);
}

/* =========================================================
   VERIFY RESTAURANT
========================================================= */

$restaurantStmt = $conn->prepare("
    SELECT
        r.restaurant_id,
        r.name,
        r.business_status

    FROM tbl_restaurants AS r

    INNER JOIN tbl_users AS owner
        ON owner.user_id = r.owner_id
        AND owner.role = 'owner'
        AND owner.status = 1
        AND owner.is_verified = 1

    WHERE r.restaurant_id = ?

    LIMIT 1
");

if (!$restaurantStmt) {
    error_log(
        "get_public_products.php restaurant prepare error: " .
        $conn->error
    );

    respond_json([
        "success" => false,
        "message" => "Unable to load the restaurant."
    ], 500);
}

$restaurantStmt->bind_param(
    "i",
    $restaurant_id
);

$restaurantStmt->execute();

$restaurant = $restaurantStmt
    ->get_result()
    ->fetch_assoc();

$restaurantStmt->close();

if (!$restaurant) {
    respond_json([
        "success" => false,
        "message" =>
            "This restaurant is currently unavailable on FoodConnect.",
        "products" => []
    ], 404);
}

$business_status = trim(
    (string) (
        $restaurant["business_status"] ??
        "Closed"
    )
);

$is_accepting_orders =
    strtolower($business_status) === "open";

/* =========================================================
   LOAD PUBLIC PRODUCTS
========================================================= */

$stmt = $conn->prepare("
    SELECT
        product_id,
        product_name,
        category,
        size,
        price,
        stock,
        status,
        image_path,
        discount_type,
        discount_value,
        discount_schedule,
        discount_start,
        discount_end,
        discount_status
    FROM tbl_products
    WHERE restaurant_id = ?
    ORDER BY product_id DESC
");

if (!$stmt) {
    error_log(
        "get_public_products.php products prepare error: " .
        $conn->error
    );

    respond_json([
        "success" => false,
        "message" => "Unable to load products."
    ], 500);
}

$stmt->bind_param(
    "i",
    $restaurant_id
);

if (!$stmt->execute()) {
    error_log(
        "get_public_products.php execute error: " .
        $stmt->error
    );

    $stmt->close();

    respond_json([
        "success" => false,
        "message" => "Unable to load products."
    ], 500);
}

$result = $stmt->get_result();

$products = [];

while ($row = $result->fetch_assoc()) {
    $productId = (int) (
        $row["product_id"] ?? 0
    );

    $stock = max(
        0,
        (int) (
            $row["stock"] ?? 0
        )
    );

    $regularPrice = round(
        max(
            0,
            (float) (
                $row["price"] ?? 0
            )
        ),
        2
    );

    /* =====================================================
       PRODUCT STATUS
    ===================================================== */

    $statusValue = strtolower(
        trim(
            (string) (
                $row["status"] ??
                "unavailable"
            )
        )
    );

    $status =
        $statusValue === "available"
            ? "Available"
            : "Unavailable";

    /* =====================================================
       PRODUCT IMAGE
    ===================================================== */

    $imagePath = trim(
        (string) (
            $row["image_path"] ?? ""
        )
    );

    if ($imagePath === "") {
        $imagePath = null;
    }

    /* =====================================================
       DISCOUNT TYPE
    ===================================================== */

    $discountType = strtolower(
        trim(
            (string) (
                $row["discount_type"] ??
                "none"
            )
        )
    );

    if (
        !in_array(
            $discountType,
            [
                "none",
                "percentage",
                "fixed"
            ],
            true
        )
    ) {
        $discountType = "none";
    }

    $discountValue = round(
        max(
            0,
            (float) (
                $row["discount_value"] ??
                0
            )
        ),
        2
    );

    /* =====================================================
       DISCOUNT SCHEDULE
    ===================================================== */

    $discountSchedule = strtolower(
        trim(
            (string) (
                $row["discount_schedule"] ??
                "permanent"
            )
        )
    );

    if (
        !in_array(
            $discountSchedule,
            [
                "permanent",
                "scheduled"
            ],
            true
        )
    ) {
        $discountSchedule =
            "permanent";
    }

    $discountStart =
        $row["discount_start"] ??
        null;

    $discountEnd =
        $row["discount_end"] ??
        null;

    if (
        $discountStart === "" ||
        $discountStart ===
            "0000-00-00 00:00:00"
    ) {
        $discountStart = null;
    }

    if (
        $discountEnd === "" ||
        $discountEnd ===
            "0000-00-00 00:00:00"
    ) {
        $discountEnd = null;
    }

    /* =====================================================
       DISCOUNT STATUS
    ===================================================== */

    $discountStatusValue =
        strtolower(
            trim(
                (string) (
                    $row["discount_status"] ??
                    "inactive"
                )
            )
        );

    $discountStatus =
        $discountStatusValue === "active"
            ? "Active"
            : "Inactive";

    /* =====================================================
       DETERMINE ACTIVE PROMOTION
    ===================================================== */

    $isDiscountActive = false;

    $currentDateTime =
        new DateTime(
            "now",
            $promotionTimezone
        );

    if (
        $discountType !== "none" &&
        $discountValue > 0 &&
        $discountStatus === "Active"
    ) {
        if (
            $discountSchedule ===
            "permanent"
        ) {
            $isDiscountActive = true;
        } elseif (
            $discountSchedule ===
                "scheduled" &&
            $discountStart !== null &&
            $discountEnd !== null
        ) {
            try {
                $discountStartObject =
                    new DateTime(
                        $discountStart,
                        $promotionTimezone
                    );

                $discountEndObject =
                    new DateTime(
                        $discountEnd,
                        $promotionTimezone
                    );

                $isDiscountActive =
                    $currentDateTime >=
                        $discountStartObject &&
                    $currentDateTime <=
                        $discountEndObject;
            } catch (Exception $error) {
                $isDiscountActive = false;
            }
        }
    }

    /* =====================================================
       CALCULATE FINAL CUSTOMER PRICE
    ===================================================== */

    $finalPrice = $regularPrice;

    if ($isDiscountActive) {
        if (
            $discountType ===
            "percentage"
        ) {
            $finalPrice =
                $regularPrice -
                (
                    $regularPrice *
                    $discountValue /
                    100
                );
        } elseif (
            $discountType === "fixed"
        ) {
            $finalPrice =
                $regularPrice -
                $discountValue;
        }

        $finalPrice = round(
            max(
                0,
                $finalPrice
            ),
            2
        );
    }

    $discountSavings =
        $isDiscountActive
            ? round(
                max(
                    0,
                    $regularPrice -
                    $finalPrice
                ),
                2
            )
            : 0.00;

    /* =====================================================
       PUBLIC RESPONSE
    ===================================================== */

    $products[] = [
        "id" =>
            $productId,

        "product_id" =>
            $productId,

        "name" =>
            (string) (
                $row["product_name"] ??
                "Unnamed Product"
            ),

        "product_name" =>
            (string) (
                $row["product_name"] ??
                "Unnamed Product"
            ),

        "category" =>
            (string) (
                $row["category"] ??
                "Uncategorized"
            ),

        "size" =>
            (string) (
                $row["size"] ?? ""
            ),

        "price" =>
            $regularPrice,

        "regular_price" =>
            $regularPrice,

        "final_price" =>
            $finalPrice,

        "discounted_price" =>
            $finalPrice,

        "discount_savings" =>
            $discountSavings,

        "discount_type" =>
            $discountType,

        "discount_value" =>
            $discountValue,

        "discount_schedule" =>
            $discountSchedule,

        "discount_start" =>
            $discountStart,

        "discount_end" =>
            $discountEnd,

        "discount_status" =>
            $discountStatus,

        "is_discount_active" =>
            $isDiscountActive,

        "stock" =>
            $stock,

        "status" =>
            $status,

        "image_path" =>
            $imagePath,

        "image" =>
            $imagePath
    ];
}

$stmt->close();

respond_json([
    "success" => true,

    "restaurant" => [
        "restaurant_id" =>
            (int) $restaurant["restaurant_id"],

        "name" =>
            (string) $restaurant["name"],

        "business_status" =>
            $business_status,

        "is_accepting_orders" =>
            $is_accepting_orders
    ],

    "products" =>
        $products
]);