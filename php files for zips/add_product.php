<?php

header("Content-Type: application/json; charset=utf-8");
header(
    "Cache-Control: no-store, no-cache, must-revalidate, max-age=0"
);

require_once __DIR__ . "/session_config.php";
require_once __DIR__ . "/db.php";
require_once __DIR__ . "/product_image_helper.php";

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
    ) !== "POST"
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
        "message" => "Unauthorized. Please login first."
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
   VERIFY RESTAURANT OWNERSHIP
========================================================= */

$ownerStmt = $conn->prepare("
    SELECT
        r.restaurant_id
    FROM tbl_restaurants r
    INNER JOIN tbl_users u
        ON u.user_id = r.owner_id
    WHERE r.restaurant_id = ?
      AND r.owner_id = ?
      AND LOWER(u.role) = 'owner'
    LIMIT 1
");

if (!$ownerStmt) {
    error_log(
        "add_product.php owner prepare error: " .
        $conn->error
    );

    respond_json([
        "success" => false,
        "message" => "Unable to verify the owner account."
    ], 500);
}

$ownerStmt->bind_param(
    "ii",
    $restaurant_id,
    $user_id
);

$ownerStmt->execute();

$ownerExists = $ownerStmt
    ->get_result()
    ->fetch_assoc();

$ownerStmt->close();

if (!$ownerExists) {
    respond_json([
        "success" => false,
        "message" => "Invalid owner restaurant session."
    ], 403);
}

/* =========================================================
   READ MULTIPART FORM DATA
========================================================= */

$data = $_POST;

if (
    !is_array($data) ||
    empty($data)
) {
    respond_json([
        "success" => false,
        "message" =>
            "Product form data is required."
    ], 400);
}

/* =========================================================
   VALIDATE PRODUCT DATA
========================================================= */

$product_name = trim(
    (string) ($data["product_name"] ?? "")
);

$category = trim(
    (string) ($data["category"] ?? "")
);

$size = trim(
    (string) ($data["size"] ?? "")
);

$price = filter_var(
    $data["price"] ?? null,
    FILTER_VALIDATE_FLOAT
);

$stock = filter_var(
    $data["stock"] ?? null,
    FILTER_VALIDATE_INT
);

$discount_type = strtolower(
    trim(
        (string) (
            $data["discount_type"] ??
            "none"
        )
    )
);

$discount_value = filter_var(
    $data["discount_value"] ?? 0,
    FILTER_VALIDATE_FLOAT
);

$discount_schedule = strtolower(
    trim(
        (string) (
            $data["discount_schedule"] ??
            "permanent"
        )
    )
);

$discount_start_raw = trim(
    (string) (
        $data["discount_start"] ?? ""
    )
);

$discount_end_raw = trim(
    (string) (
        $data["discount_end"] ?? ""
    )
);

$discount_status_raw = strtolower(
    trim(
        (string) (
            $data["discount_status"] ??
            "inactive"
        )
    )
);

if ($product_name === "") {
    respond_json([
        "success" => false,
        "message" => "Product name is required."
    ], 422);
}

if (mb_strlen($product_name) > 150) {
    respond_json([
        "success" => false,
        "message" => "Product name is too long."
    ], 422);
}

if ($category === "") {
    respond_json([
        "success" => false,
        "message" => "Product category is required."
    ], 422);
}

if (mb_strlen($category) > 50) {
    respond_json([
        "success" => false,
        "message" =>
            "Product category cannot exceed 50 characters."
    ], 422);
}

/*
 * Variant / size is optional.
 *
 * Examples:
 * Regular, Large, Hot, Iced.
 */
if (mb_strlen($size) > 20) {
    respond_json([
        "success" => false,
        "message" =>
            "Variant or size cannot exceed 20 characters."
    ], 422);
}

if (
    $price === false ||
    $price <= 0
) {
    respond_json([
        "success" => false,
        "message" => "Price must be greater than zero."
    ], 422);
}

if (
    $stock === false ||
    $stock < 0
) {
    respond_json([
        "success" => false,
        "message" => "Stock cannot be negative."
    ], 422);
}

$price = round(
    (float) $price,
    2
);

$stock = (int) $stock;

$requestedStatus = trim(
    (string) ($data["status"] ?? "Available")
);

$statusMap = [
    "available" => "Available",
    "unavailable" => "Unavailable"
];

$statusKey = strtolower(
    $requestedStatus
);

if (!isset($statusMap[$statusKey])) {
    respond_json([
        "success" => false,
        "message" =>
            "Availability must be Available or Unavailable."
    ], 422);
}

$status = $statusMap[$statusKey];

/* =========================================================
   VALIDATE PRODUCT DISCOUNT
========================================================= */

$allowedDiscountTypes = [
    "none",
    "percentage",
    "fixed"
];

if (
    !in_array(
        $discount_type,
        $allowedDiscountTypes,
        true
    )
) {
    respond_json([
        "success" => false,
        "message" =>
            "Invalid discount type."
    ], 422);
}

$allowedDiscountSchedules = [
    "permanent",
    "scheduled"
];

if (
    !in_array(
        $discount_schedule,
        $allowedDiscountSchedules,
        true
    )
) {
    respond_json([
        "success" => false,
        "message" =>
            "Invalid discount duration."
    ], 422);
}

$discountStatusMap = [
    "active" => "Active",
    "inactive" => "Inactive"
];

if (
    !isset(
        $discountStatusMap[
            $discount_status_raw
        ]
    )
) {
    respond_json([
        "success" => false,
        "message" =>
            "Promo status must be Active or Inactive."
    ], 422);
}

$discount_status =
    $discountStatusMap[
        $discount_status_raw
    ];

if (
    $discount_value === false ||
    $discount_value < 0
) {
    respond_json([
        "success" => false,
        "message" =>
            "Discount value cannot be negative."
    ], 422);
}

$discount_value = round(
    (float) $discount_value,
    2
);

$discount_start = null;
$discount_end = null;

if ($discount_type === "none") {
    $discount_value = 0.00;
    $discount_schedule = "permanent";
    $discount_status = "Inactive";
} else {
    if ($discount_value <= 0) {
        respond_json([
            "success" => false,
            "message" =>
                "Discount value must be greater than zero."
        ], 422);
    }

    if (
        $discount_type ===
            "percentage" &&
        $discount_value > 100
    ) {
        respond_json([
            "success" => false,
            "message" =>
                "Percentage discount cannot exceed 100%."
        ], 422);
    }

    if (
        $discount_type ===
            "fixed" &&
        $discount_value > $price
    ) {
        respond_json([
            "success" => false,
            "message" =>
                "Fixed discount cannot exceed the regular product price."
        ], 422);
    }

    if (
        $discount_schedule ===
        "scheduled"
    ) {
        if (
            $discount_start_raw === "" ||
            $discount_end_raw === ""
        ) {
            respond_json([
                "success" => false,
                "message" =>
                    "Start and end dates are required for a scheduled promo."
            ], 422);
        }

        $discountStartObject =
    DateTime::createFromFormat(
        "Y-m-d\TH:i",
        $discount_start_raw
    );

$startErrors =
    DateTime::getLastErrors();

if ($startErrors === false) {
    $startErrors = [
        "warning_count" => 0,
        "error_count" => 0
    ];
}

if (
    !$discountStartObject ||
    $startErrors["warning_count"] > 0 ||
    $startErrors["error_count"] > 0
) {
    respond_json([
        "success" => false,
        "message" =>
            "Invalid promo start date."
    ], 422);
}

$discountEndObject =
    DateTime::createFromFormat(
        "Y-m-d\TH:i",
        $discount_end_raw
    );

$endErrors =
    DateTime::getLastErrors();

if ($endErrors === false) {
    $endErrors = [
        "warning_count" => 0,
        "error_count" => 0
    ];
}

if (
    !$discountEndObject ||
    $endErrors["warning_count"] > 0 ||
    $endErrors["error_count"] > 0
) {
    respond_json([
        "success" => false,
        "message" =>
            "Invalid promo end date."
    ], 422);
}

if (
    $discountEndObject <=
    $discountStartObject
) {
    respond_json([
        "success" => false,
        "message" =>
            "Promo end date must be later than its start date."
    ], 422);
}

$discount_start =
    $discountStartObject->format(
        "Y-m-d H:i:s"
    );

$discount_end =
    $discountEndObject->format(
        "Y-m-d H:i:s"
    );

        $startErrors =
            DateTime::getLastErrors();

        if (
            $startErrors === false
        ) {
            $startErrors = [
                "warning_count" => 0,
                "error_count" => 0
            ];
        }

        if (
            !$discountStartObject ||
            $startErrors["warning_count"] > 0 ||
            $startErrors["error_count"] > 0
        ) {
            respond_json([
                "success" => false,
                "message" =>
                    "Invalid promo start date."
            ], 422);
        }

        $endErrors =
            DateTime::getLastErrors();

        if (
            $endErrors === false
        ) {
            $endErrors = [
                "warning_count" => 0,
                "error_count" => 0
            ];
        }

        if (
            !$discountEndObject ||
            $endErrors["warning_count"] > 0 ||
            $endErrors["error_count"] > 0
        ) {
            respond_json([
                "success" => false,
                "message" =>
                    "Invalid promo end date."
            ], 422);
        }

        if (
            $discountEndObject <=
            $discountStartObject
        ) {
            respond_json([
                "success" => false,
                "message" =>
                    "Promo end date must be later than its start date."
            ], 422);
        }

        $discount_start =
            $discountStartObject
                ->format(
                    "Y-m-d H:i:s"
                );

        $discount_end =
            $discountEndObject
                ->format(
                    "Y-m-d H:i:s"
                );
    }
}

/* =========================================================
   SAVE OPTIONAL PRODUCT IMAGE
========================================================= */

$image_path = null;

if (
    isset($_FILES["product_image"]) &&
    (
        $_FILES["product_image"]["error"] ??
        UPLOAD_ERR_NO_FILE
    ) !== UPLOAD_ERR_NO_FILE
) {
    try {
        $image_path =
            save_product_image(
                $_FILES["product_image"],
                $restaurant_id
            );
    } catch (RuntimeException $error) {
        respond_json([
            "success" => false,
            "message" =>
                $error->getMessage()
        ], 422);
    }
}

/* =========================================================
   CHECK DUPLICATE PRODUCT

   Products with the same name, category, and size are treated
   as duplicates within the same restaurant.
========================================================= */

$duplicateStmt = $conn->prepare("
    SELECT
        product_id
    FROM tbl_products
    WHERE restaurant_id = ?
      AND LOWER(TRIM(product_name)) =
          LOWER(TRIM(?))
      AND LOWER(TRIM(category)) =
          LOWER(TRIM(?))
      AND LOWER(
          TRIM(
              COALESCE(size, '')
          )
      ) = LOWER(TRIM(?))
    LIMIT 1
");

if (!$duplicateStmt) {
    error_log(
        "add_product.php duplicate prepare error: " .
        $conn->error
    );

    respond_json([
        "success" => false,
        "message" => "Unable to validate the product."
    ], 500);
}

$duplicateStmt->bind_param(
    "isss",
    $restaurant_id,
    $product_name,
    $category,
    $size
);

$duplicateStmt->execute();

$duplicateProduct = $duplicateStmt
    ->get_result()
    ->fetch_assoc();

$duplicateStmt->close();

if ($duplicateProduct) {
    delete_product_image(
        $image_path
    );

    respond_json([
        "success" => false,
        "message" =>
            "A product with the same name, category, and variant already exists."
    ], 409);
}

/* =========================================================
   INSERT PRODUCT AND ACTIVITY LOG

   Both records must succeed together. If activity logging
   fails, the product insert is rolled back.
========================================================= */

$conn->begin_transaction();

$stmt = $conn->prepare("
    INSERT INTO tbl_products (
        restaurant_id,
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
    )
    VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?
    )
");

if (!$stmt) {
    $conn->rollback();

    delete_product_image(
        $image_path
    );

    error_log(
        "add_product.php insert prepare error: " .
        $conn->error
    );

    respond_json([
        "success" => false,
        "message" => "Unable to prepare the product."
    ], 500);
}

$stmt->bind_param(
    "isssdisssdssss",
    $restaurant_id,
    $product_name,
    $category,
    $size,
    $price,
    $stock,
    $status,
    $image_path,
    $discount_type,
    $discount_value,
    $discount_schedule,
    $discount_start,
    $discount_end,
    $discount_status
);

if (!$stmt->execute()) {
    error_log(
        "add_product.php insert execute error: " .
        $stmt->error
    );

    $stmt->close();

    $conn->rollback();

    delete_product_image(
        $image_path
    );

    respond_json([
        "success" => false,
        "message" =>
            "Failed to add product."
    ], 500);
}

$product_id = (int) $stmt->insert_id;

$stmt->close();

/* =========================================================
   PRODUCT ADDED ACTIVITY
========================================================= */

$productLabel =
    '"' . $product_name . '"';

if ($size !== "") {
    $productLabel .=
        " (" . $size . ")";
}

$categoryLabel =
    $category !== ""
        ? $category
        : "Uncategorized";

$promotionDescription =
    "No promotion";

if (
    $discount_type === "percentage" &&
    $discount_value > 0
) {
    $promotionDescription =
        number_format(
            $discount_value,
            2
        ) .
        "% discount";
} elseif (
    $discount_type === "fixed" &&
    $discount_value > 0
) {
    $promotionDescription =
        "₱" .
        number_format(
            $discount_value,
            2
        ) .
        " fixed discount";
}

$actionTitle =
    "Product Added";

$actionDescription =
    "Product: " .
    $product_name .
    "\n" .

    "Category: " .
    $categoryLabel .
    "\n" .

    (
        $size !== ""
            ? "Variant: " .
                $size .
                "\n"
            : ""
    ) .

    "Price: ₱" .
    number_format(
        $price,
        2
    ) .
    "\n" .

    "Initial Stock: " .
    number_format(
        $stock
    ) .
    "\n" .

    "Status: " .
    $status .
    "\n" .

    "Promotion: " .
    (
        $promotionDescription ===
        "No promotion"
            ? "None"
            : $promotionDescription
    );

$logStmt = $conn->prepare("
    INSERT INTO tbl_activity_logs (
        restaurant_id,
        user_id,
        user_role,
        action_type,
        action_title,
        action_description
    )
    VALUES (
        ?,
        ?,
        ?,
        'product',
        ?,
        ?
    )
");

if (!$logStmt) {
    $conn->rollback();

    delete_product_image(
        $image_path
    );

    error_log(
        "add_product.php activity prepare error: " .
        $conn->error
    );

    respond_json([
        "success" => false,
        "message" =>
            "The product could not be saved completely. Please try again."
    ], 500);
}

$logStmt->bind_param(
    "iisss",
    $restaurant_id,
    $user_id,
    $role,
    $actionTitle,
    $actionDescription
);

if (!$logStmt->execute()) {
    error_log(
        "add_product.php activity execute error: " .
        $logStmt->error
    );

    $logStmt->close();

    $conn->rollback();

    delete_product_image(
        $image_path
    );

    respond_json([
        "success" => false,
        "message" =>
            "The product could not be saved completely. Please try again."
    ], 500);
}

$logStmt->close();

$conn->commit();

respond_json([
    "success" => true,
    "message" => "Product added successfully.",
    "product_id" => $product_id,
    "product" => [
        "id" => $product_id,
        "product_id" => $product_id,
        "name" => $product_name,
        "product_name" => $product_name,
        "category" => $category,
        "size" => $size,
        "price" => $price,
        "stock" => $stock,
         "status" => $status,
        "image_path" => $image_path,

        "discount_type" =>
            $discount_type,

        "discount_value" =>
            $discount_value,

        "discount_schedule" =>
            $discount_schedule,

        "discount_start" =>
            $discount_start,

        "discount_end" =>
            $discount_end,

        "discount_status" =>
            $discount_status
            ]
], 201);