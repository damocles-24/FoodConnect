<?php

header(
    "Content-Type: application/json; charset=utf-8"
);

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
            $_SERVER["REQUEST_METHOD"] ?? ""
        )
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

$user_id = (int) (
    $_SESSION["user_id"] ?? 0
);

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
    $restaurant_id <= 0
) {
    respond_json([
        "success" => false,
        "message" =>
            "Unauthorized. Please login first."
    ], 401);
}

if ($role !== "owner") {
    respond_json([
        "success" => false,
        "message" =>
            "Owner access is required."
    ], 403);
}

/* =========================================================
   VERIFY RESTAURANT OWNERSHIP
========================================================= */

$ownerStmt = $conn->prepare("
    SELECT
        restaurant_id
    FROM tbl_restaurants
    WHERE restaurant_id = ?
      AND owner_id = ?
    LIMIT 1
");

if (!$ownerStmt) {
    error_log(
        "update_product.php owner prepare error: " .
        $conn->error
    );

    respond_json([
        "success" => false,
        "message" =>
            "Unable to verify restaurant ownership."
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
        "message" =>
            "Invalid owner restaurant session."
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

$product_id = filter_var(
    $data["product_id"] ?? null,
    FILTER_VALIDATE_INT
);

$product_name = trim(
    (string) (
        $data["product_name"] ?? ""
    )
);

$category = trim(
    (string) (
        $data["category"] ?? ""
    )
);

$size = trim(
    (string) (
        $data["size"] ?? ""
    )
);

$price = filter_var(
    $data["price"] ?? null,
    FILTER_VALIDATE_FLOAT
);

$stock = filter_var(
    $data["stock"] ?? null,
    FILTER_VALIDATE_INT
);

$requestedStatus = trim(
    (string) (
        $data["status"] ?? "Available"
    )
);

$removeImage =
    (string) (
        $data["remove_image"] ?? "0"
    ) === "1";

if (
    $product_id === false ||
    $product_id <= 0
) {
    respond_json([
        "success" => false,
        "message" =>
            "A valid product ID is required."
    ], 422);
}

if ($product_name === "") {
    respond_json([
        "success" => false,
        "message" =>
            "Product name is required."
    ], 422);
}

if (
    mb_strlen($product_name) > 150
) {
    respond_json([
        "success" => false,
        "message" =>
            "Product name cannot exceed 150 characters."
    ], 422);
}

if ($category === "") {
    respond_json([
        "success" => false,
        "message" =>
            "Product category is required."
    ], 422);
}

if (mb_strlen($category) > 50) {
    respond_json([
        "success" => false,
        "message" =>
            "Product category cannot exceed 50 characters."
    ], 422);
}

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
        "message" =>
            "Price must be greater than zero."
    ], 422);
}

if (
    $stock === false ||
    $stock < 0
) {
    respond_json([
        "success" => false,
        "message" =>
            "Stock cannot be negative."
    ], 422);
}

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

$price = round(
    (float) $price,
    2
);

$stock = (int) $stock;

/* =========================================================
   VERIFY PRODUCT OWNERSHIP
========================================================= */

$productStmt = $conn->prepare("
    SELECT
        product_id,
        image_path
    FROM tbl_products
    WHERE product_id = ?
      AND restaurant_id = ?
    LIMIT 1
");

if (!$productStmt) {
    error_log(
        "update_product.php product prepare error: " .
        $conn->error
    );

    respond_json([
        "success" => false,
        "message" =>
            "Unable to verify the product."
    ], 500);
}

$productStmt->bind_param(
    "ii",
    $product_id,
    $restaurant_id
);

$productStmt->execute();

$productExists = $productStmt
    ->get_result()
    ->fetch_assoc();

$productStmt->close();

if (!$productExists) {
    respond_json([
        "success" => false,
        "message" =>
            "Product not found for this restaurant."
    ], 404);
}

$oldImagePath =
    $productExists["image_path"] ??
    null;

$newImagePath =
    $oldImagePath;

$uploadedNewImage = false;

/* =========================================================
   PROCESS IMAGE CHANGE
========================================================= */

if (
    isset($_FILES["product_image"]) &&
    (
        $_FILES["product_image"]["error"] ??
        UPLOAD_ERR_NO_FILE
    ) !== UPLOAD_ERR_NO_FILE
) {
    try {
        $newImagePath =
            save_product_image(
                $_FILES["product_image"],
                $restaurant_id
            );

        $uploadedNewImage = true;
    } catch (RuntimeException $error) {
        respond_json([
            "success" => false,
            "message" =>
                $error->getMessage()
        ], 422);
    }
} elseif ($removeImage) {
    $newImagePath = null;
}

/* =========================================================
   CHECK DUPLICATE PRODUCT
========================================================= */

$duplicateStmt = $conn->prepare("
    SELECT
        product_id
    FROM tbl_products
    WHERE restaurant_id = ?
      AND product_id <> ?
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
    if ($uploadedNewImage) {
        delete_product_image(
            $newImagePath
        );
    }

    error_log(
        "update_product.php duplicate prepare error: " .
        $conn->error
    );

    respond_json([
        "success" => false,
        "message" =>
            "Unable to validate duplicate products."
    ], 500);
}

$duplicateStmt->bind_param(
    "iisss",
    $restaurant_id,
    $product_id,
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
    if ($uploadedNewImage) {
        delete_product_image(
            $newImagePath
        );
    }

    respond_json([
        "success" => false,
        "message" =>
            "A product with the same name, category, and variant already exists."
    ], 409);
}

/* =========================================================
   UPDATE PRODUCT
========================================================= */

$stmt = $conn->prepare("
    UPDATE tbl_products
    SET
        product_name = ?,
        category = ?,
        size = ?,
        price = ?,
        stock = ?,
        status = ?,
        image_path = ?
    WHERE product_id = ?
      AND restaurant_id = ?
");

if (!$stmt) {
    if ($uploadedNewImage) {
        delete_product_image(
            $newImagePath
        );
    }

    error_log(
        "update_product.php update prepare error: " .
        $conn->error
    );

    respond_json([
        "success" => false,
        "message" =>
            "Unable to prepare the product update."
    ], 500);
}

$stmt->bind_param(
    "sssdissii",
    $product_name,
    $category,
    $size,
    $price,
    $stock,
    $status,
    $newImagePath,
    $product_id,
    $restaurant_id
);

if (!$stmt->execute()) {
    error_log(
        "update_product.php execute error: " .
        $stmt->error
    );

    $stmt->close();

    if ($uploadedNewImage) {
        delete_product_image(
            $newImagePath
        );
    }

    respond_json([
        "success" => false,
        "message" =>
            "Failed to update product."
    ], 500);
}

$stmt->close();

/* =========================================================
   DELETE OLD IMAGE AFTER SUCCESS
========================================================= */

if (
    (
        $uploadedNewImage ||
        $removeImage
    ) &&
    !empty($oldImagePath)
) {
    delete_product_image(
        $oldImagePath
    );
}

/* =========================================================
   SUCCESS RESPONSE
========================================================= */

respond_json([
    "success" => true,
    "message" =>
        "Product updated successfully.",
    "product" => [
        "product_id" => $product_id,
        "id" => $product_id,
        "product_name" => $product_name,
        "name" => $product_name,
        "category" => $category,
        "size" => $size,
        "price" => $price,
        "stock" => $stock,
        "status" => $status,
        "image_path" => $newImagePath,
        "image" => $newImagePath
    ]
]);