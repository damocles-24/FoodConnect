<?php

header("Content-Type: application/json; charset=utf-8");

error_reporting(E_ALL & ~E_NOTICE & ~E_WARNING);
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

function respond_json($data, $statusCode = 200)
{
    http_response_code($statusCode);
    echo json_encode($data);
    exit;
}

/* =========================================================
   AUTHENTICATION AND AUTHORIZATION
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
    trim((string) ($_SESSION["role"] ?? ""))
);

if ($role !== "owner") {
    respond_json([
        "success" => false,
        "message" => "Only the restaurant owner can restock products."
    ], 403);
}

if ($restaurant_id <= 0) {
    respond_json([
        "success" => false,
        "message" => "Invalid restaurant session."
    ], 400);
}

/* =========================================================
   REQUEST VALIDATION
========================================================= */

$rawInput = file_get_contents("php://input");
$data = json_decode($rawInput, true);

if (!is_array($data)) {
    respond_json([
        "success" => false,
        "message" => "Invalid JSON request body."
    ], 400);
}

$product_id = (int) ($data["product_id"] ?? 0);
$quantity = (int) ($data["quantity"] ?? 0);

if ($product_id <= 0) {
    respond_json([
        "success" => false,
        "message" => "Invalid product ID."
    ], 400);
}

if ($quantity <= 0) {
    respond_json([
        "success" => false,
        "message" => "Restock quantity must be greater than zero."
    ], 400);
}

/*
 * Prevent unreasonable values that may overflow stock
 * or result from accidental input.
 */
if ($quantity > 100000) {
    respond_json([
        "success" => false,
        "message" => "Restock quantity is too large."
    ], 400);
}

/* =========================================================
   TRANSACTION
========================================================= */

$conn->begin_transaction();

try {

    /*
     * Lock and validate the product before updating it.
     * restaurant_id ensures strict restaurant isolation.
     */
    $checkStmt = $conn->prepare("
        SELECT
            product_id,
            product_name,
            stock
        FROM tbl_products
        WHERE product_id = ?
          AND restaurant_id = ?
        LIMIT 1
        FOR UPDATE
    ");

    if (!$checkStmt) {
        throw new Exception(
            "Unable to prepare product validation."
        );
    }

    $checkStmt->bind_param(
        "ii",
        $product_id,
        $restaurant_id
    );

    if (!$checkStmt->execute()) {
        throw new Exception(
            "Unable to validate the selected product."
        );
    }

    $result = $checkStmt->get_result();
    $product = $result->fetch_assoc();

    $checkStmt->close();

    if (!$product) {
        throw new Exception(
            "Product not found or does not belong to this restaurant."
        );
    }

    $updateStmt = $conn->prepare("
        UPDATE tbl_products
        SET
            stock = stock + ?,
            status = 'Available'
        WHERE product_id = ?
          AND restaurant_id = ?
    ");

    if (!$updateStmt) {
        throw new Exception(
            "Unable to prepare stock update."
        );
    }

    $updateStmt->bind_param(
        "iii",
        $quantity,
        $product_id,
        $restaurant_id
    );

    if (!$updateStmt->execute()) {
        throw new Exception(
            "Unable to update product stock."
        );
    }

    if ($updateStmt->affected_rows !== 1) {
        throw new Exception(
            "The product stock was not updated."
        );
    }

    $updateStmt->close();

    /*
     * Record the stock change when tbl_stock_logs
     * supports these columns in the current schema.
     */
    $logStmt = $conn->prepare("
        INSERT INTO tbl_stock_logs (
            restaurant_id,
            product_id,
            user_id,
            action_type,
            quantity,
            description,
            created_at
        )
        VALUES (?, ?, ?, 'restock', ?, ?, NOW())
    ");

    if ($logStmt) {
        $description =
            "Restocked " .
            $product["product_name"] .
            " by " .
            $quantity .
            " unit(s).";

        $logStmt->bind_param(
            "iiiis",
            $restaurant_id,
            $product_id,
            $user_id,
            $quantity,
            $description
        );

        $logStmt->execute();
        $logStmt->close();
    }

    $conn->commit();

    respond_json([
        "success" => true,
        "message" => "Stock updated successfully.",
        "product_id" => $product_id,
        "quantity_added" => $quantity,
        "new_stock" =>
            (int) $product["stock"] + $quantity
    ]);

} catch (Exception $e) {

    $conn->rollback();

    error_log(
        "Restock product failed: " .
        $e->getMessage()
    );

    respond_json([
        "success" => false,
        "message" => $e->getMessage()
    ], 400);
}