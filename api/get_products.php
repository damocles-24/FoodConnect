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

   Products are isolated using the restaurant ID stored
   in the authenticated session.
========================================================= */

$stmt = $conn->prepare("
    SELECT
        product_id,
        product_name,
        category,
        size,
        price,
        stock,
        status
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

    $status = strtolower(
        trim(
            (string) (
                $row["status"] ??
                "inactive"
            )
        )
    );

    $products[] = [
        /*
         * Keep both field names because the existing
         * Owner Dashboard may use either format.
         */
        "id" => $productId,
        "product_id" => $productId,

        "name" => $productName,
        "product_name" => $productName,

        "category" => $category,
        "size" => $size,

        "price" => round(
            (float) (
                $row["price"] ?? 0
            ),
            2
        ),

        "stock" => max(
            0,
            (int) (
                $row["stock"] ?? 0
            )
        ),

        "status" => $status
    ];
}

$stmt->close();

/*
 * Keep the successful response as a plain array
 * for compatibility with the current JavaScript.
 */
respond_json($products);