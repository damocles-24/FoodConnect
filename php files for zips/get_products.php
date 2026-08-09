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

if (
    $user_id <= 0 ||
    $restaurant_id <= 0
) {
    respond_json([
        "success" => false,
        "message" => "Invalid restaurant session."
    ], 403);
}

/* =========================================================
   LOAD PRODUCTS
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
        "get_products.php prepare error: " .
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
        "get_products.php execute error: " .
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
    $productId =
        (int) ($row["product_id"] ?? 0);

    $productName = trim(
        (string) (
            $row["product_name"] ??
            "Unnamed Product"
        )
    );

    $category = trim(
        (string) (
            $row["category"] ??
            "Uncategorized"
        )
    );

    $size = trim(
        (string) (
            $row["size"] ?? ""
        )
    );

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

    $imagePath = trim(
        (string) (
            $row["image_path"] ?? ""
        )
    );

    if ($imagePath === "") {
        $imagePath = null;
    }

    $discountType = strtolower(
    trim(
        (string) (
            $row["discount_type"] ??
            "none"
        )
    )
);

$allowedDiscountTypes = [
    "none",
    "percentage",
    "fixed"
];

if (
    !in_array(
        $discountType,
        $allowedDiscountTypes,
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
    $discountStatusValue ===
        "active"
        ? "Active"
        : "Inactive";

        $isDiscountActive = false;

/*
 * Product promotion dates are entered and stored
 * using Philippine local time.
 */
$promotionTimezone =
    new DateTimeZone(
        "Asia/Manila"
    );

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

$regularPrice = round(
    (float) (
        $row["price"] ?? 0
    ),
    2
);

$finalPrice = $regularPrice;
$discountSavings = 0.00;

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
        $discountType ===
        "fixed"
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

    $discountSavings = round(
        max(
            0,
            $regularPrice -
            $finalPrice
        ),
        2
    );
}

    $products[] = [
        "id" => $productId,
        "product_id" => $productId,

        "product_name" => $productName,

        "category" => $category,
        "size" => $size,
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

        "stock" => max(
            0,
            (int) (
                $row["stock"] ?? 0
            )
        ),

        "status" =>
    $status,

"image_path" =>
    $imagePath,

"image" =>
    $imagePath,

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
    $isDiscountActive
    ];
}

$stmt->close();

respond_json($products);