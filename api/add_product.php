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
   READ JSON BODY
========================================================= */

$rawInput = file_get_contents("php://input");

if (
    $rawInput === false ||
    trim($rawInput) === ""
) {
    respond_json([
        "success" => false,
        "message" => "Request data is required."
    ], 400);
}

$data = json_decode(
    $rawInput,
    true
);

if (
    !is_array($data) ||
    json_last_error() !== JSON_ERROR_NONE
) {
    respond_json([
        "success" => false,
        "message" => "Invalid JSON request."
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

if (mb_strlen($category) > 100) {
    respond_json([
        "success" => false,
        "message" => "Product category is too long."
    ], 422);
}

if ($size === "") {
    respond_json([
        "success" => false,
        "message" => "Product size is required."
    ], 422);
}

if (mb_strlen($size) > 100) {
    respond_json([
        "success" => false,
        "message" => "Product size is too long."
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

$status = $stock > 0
    ? "Available"
    : "Unavailable";

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
      AND LOWER(TRIM(product_name)) = LOWER(TRIM(?))
      AND LOWER(TRIM(category)) = LOWER(TRIM(?))
      AND LOWER(TRIM(size)) = LOWER(TRIM(?))
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
    respond_json([
        "success" => false,
        "message" =>
            "A product with the same name, category, and size already exists."
    ], 409);
}

/* =========================================================
   INSERT PRODUCT
========================================================= */

$stmt = $conn->prepare("
    INSERT INTO tbl_products (
        restaurant_id,
        product_name,
        category,
        size,
        price,
        stock,
        status
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
");

if (!$stmt) {
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
    "isssdis",
    $restaurant_id,
    $product_name,
    $category,
    $size,
    $price,
    $stock,
    $status
);

if (!$stmt->execute()) {
    error_log(
        "add_product.php insert execute error: " .
        $stmt->error
    );

    $stmt->close();

    respond_json([
        "success" => false,
        "message" => "Failed to add product."
    ], 500);
}

$product_id = (int) $stmt->insert_id;

$stmt->close();

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
        "status" => $status
    ]
], 201);