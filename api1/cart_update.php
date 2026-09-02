<?php
header("Content-Type: application/json; charset=utf-8");

error_reporting(E_ALL);
ini_set("display_errors", 0);

session_set_cookie_params(0, "/FoodConnect", "", false, true);
require_once __DIR__ . "/session_config.php";

require_once __DIR__ . "/db.php";
require_once __DIR__ . "/addon_helper.php";

function respond_json($arr, $code = 200) {
    http_response_code($code);
    echo json_encode($arr);
    exit;
}

function rollback_and_respond($conn, $arr, $code = 400) {
    $conn->rollback();
    respond_json($arr, $code);
}

function decode_addon_ids($value) {
    if (empty($value)) {
        return [];
    }

    $decoded = json_decode($value, true);

    if (!is_array($decoded)) {
        return [];
    }

    $ids = [];

    foreach ($decoded as $id) {
        $id = (int)$id;

        if ($id > 0) {
            $ids[] = $id;
        }
    }

    $ids = array_values(array_unique($ids));
    sort($ids, SORT_NUMERIC);

    return $ids;
}

if (empty($_SESSION["user_id"])) {
    respond_json([
        "success" => false,
        "message" => "Please login first."
    ], 401);
}

$data = json_decode(file_get_contents("php://input"), true);

if (!is_array($data)) {
    respond_json([
        "success" => false,
        "message" => "Invalid JSON request."
    ], 400);
}

$user_id = (int)$_SESSION["user_id"];
$cart_id = (int)($data["cart_id"] ?? 0);
$quantity = (int)($data["quantity"] ?? 0);

if ($cart_id <= 0) {
    respond_json([
        "success" => false,
        "message" => "Invalid cart ID."
    ], 400);
}

if ($quantity > 99) {
    respond_json([
        "success" => false,
        "message" => "Maximum quantity is 99."
    ], 400);
}

try {
    $conn->begin_transaction();

    /*
     * Lock the cart row and verify that it belongs
     * to the currently logged-in customer.
     */
    $cartStmt = $conn->prepare("
        SELECT
            cart_id,
            restaurant_id,
            product_id,
            addon_ids_json AS addon_ids,
            quantity
        FROM tbl_cart
        WHERE cart_id = ?
          AND user_id = ?
        LIMIT 1
        FOR UPDATE
    ");

    if (!$cartStmt) {
        throw new Exception("Unable to prepare cart lookup.");
    }

    $cartStmt->bind_param("ii", $cart_id, $user_id);

    if (!$cartStmt->execute()) {
        throw new Exception("Unable to execute cart lookup.");
    }

    $cartResult = $cartStmt->get_result();
    $cartItem = $cartResult->fetch_assoc();

    $cartStmt->close();

    if (!$cartItem) {
        rollback_and_respond($conn, [
            "success" => false,
            "message" => "Cart item not found."
        ], 404);
    }

    /*
     * Quantity zero or below removes the item.
     */
    if ($quantity <= 0) {
        $deleteStmt = $conn->prepare("
            DELETE FROM tbl_cart
            WHERE cart_id = ?
              AND user_id = ?
        ");

        if (!$deleteStmt) {
            throw new Exception("Unable to prepare cart removal.");
        }

        $deleteStmt->bind_param("ii", $cart_id, $user_id);

        if (!$deleteStmt->execute()) {
            throw new Exception("Unable to remove cart item.");
        }

        $deleteStmt->close();

        $conn->commit();

        respond_json([
            "success" => true,
            "message" => "Item removed."
        ]);
    }

    $restaurant_id = (int)$cartItem["restaurant_id"];
    $product_id = (int)$cartItem["product_id"];
    $addon_ids = decode_addon_ids($cartItem["addon_ids"]);

    /*
     * Retrieve and lock the authoritative base product.
     */
    $productStmt = $conn->prepare("
        SELECT
            product_id,
            restaurant_id,
            product_name,
            size,
            price,
            stock,
            status
        FROM tbl_products
        WHERE product_id = ?
          AND restaurant_id = ?
        LIMIT 1
        FOR UPDATE
    ");

    if (!$productStmt) {
        throw new Exception("Unable to prepare product lookup.");
    }

    $productStmt->bind_param(
        "ii",
        $product_id,
        $restaurant_id
    );

    if (!$productStmt->execute()) {
        throw new Exception("Unable to execute product lookup.");
    }

    $productResult = $productStmt->get_result();
    $product = $productResult->fetch_assoc();

    $productStmt->close();

    if (!$product) {
        rollback_and_respond($conn, [
            "success" => false,
            "message" => "The selected product no longer exists."
        ], 404);
    }

    $base_price = (float)$product["price"];
    $product_stock = (int)$product["stock"];
    $product_status = strtolower(trim((string)$product["status"]));

    if ($product_status !== "available" || $product_stock <= 0) {
        rollback_and_respond($conn, [
            "success" => false,
            "message" => $product["product_name"] . " is unavailable."
        ], 409);
    }

    if ($quantity > $product_stock) {
        rollback_and_respond($conn, [
            "success" => false,
            "message" =>
                "Only " . $product_stock . " stock available for " .
                $product["product_name"] . ".",
            "available_stock" => $product_stock
        ], 409);
    }

    /*
     * Validate every selected add-on using the restaurant
     * stored in the cart row.
     */
    $addon_total = 0.00;
    $validated_addons = [];

    if (!empty($addon_ids)) {
       $addonStmt = $conn->prepare("
    SELECT
        product_id,
        product_name,
        price,
        status
    FROM tbl_products
    WHERE product_id = ?
      AND restaurant_id = ?
      AND item_type = 'add_on'
    LIMIT 1
    FOR UPDATE
");

        if (!$addonStmt) {
            throw new Exception("Unable to prepare add-on lookup.");
        }

        foreach ($addon_ids as $addon_id) {
            $addonStmt->bind_param(
                "ii",
                $addon_id,
                $restaurant_id
            );

            if (!$addonStmt->execute()) {
                $addonStmt->close();
                throw new Exception("Unable to execute add-on lookup.");
            }

            $addonResult = $addonStmt->get_result();
            $addon = $addonResult->fetch_assoc();

            if (!$addon) {
                $addonStmt->close();

                rollback_and_respond($conn, [
                    "success" => false,
                    "message" =>
                        "One or more selected add-ons are invalid."
                ], 400);
            }

            $addon_status = strtolower(
                trim((string)$addon["status"])
            );

            if ($addon_status !== "available") {
                $addonStmt->close();

                rollback_and_respond($conn, [
                    "success" => false,
                    "message" =>
                        $addon["product_name"] .
                        " is currently unavailable."
                ], 409);
            }

            if (
                !product_allows_addon(
                    $conn,
                    $restaurant_id,
                    (int)$cartItem["product_id"],
                    (int)$addon["product_id"]
                )
            ) {
                $addonStmt->close();

                rollback_and_respond($conn, [
                    "success" => false,
                    "message" =>
                        "This add-on is not available for the selected menu item."
                ], 400);
            }

            $addon_price = (float)$addon["price"];

            $addon_total += $addon_price;

            $validated_addons[] = [
                "product_id" => (int)$addon["product_id"],
                "name" => $addon["product_name"],
                "price" => round($addon_price, 2)
            ];
        }

        $addonStmt->close();
    }

    /*
     * Authoritative backend calculation.
     */
    $unit_price = $base_price + $addon_total;
    $subtotal = $unit_price * $quantity;

    $updateStmt = $conn->prepare("
        UPDATE tbl_cart
        SET
            quantity = ?,
            price_at_time = ?,
            subtotal = ?
        WHERE cart_id = ?
          AND user_id = ?
          AND restaurant_id = ?
    ");

    if (!$updateStmt) {
        throw new Exception("Unable to prepare quantity update.");
    }

    $updateStmt->bind_param(
        "iddiii",
        $quantity,
        $unit_price,
        $subtotal,
        $cart_id,
        $user_id,
        $restaurant_id
    );

    if (!$updateStmt->execute()) {
        throw new Exception("Unable to update cart quantity.");
    }

    if ($updateStmt->affected_rows < 0) {
        throw new Exception("Cart quantity update failed.");
    }

    $updateStmt->close();

    $conn->commit();

    respond_json([
        "success" => true,
        "message" => "Quantity updated.",
        "cart_id" => $cart_id,
        "quantity" => $quantity,
        "base_price" => round($base_price, 2),
        "addon_total" => round($addon_total, 2),
        "unit_price" => round($unit_price, 2),
        "subtotal" => round($subtotal, 2),
        "addons" => $validated_addons
    ]);

} catch (Throwable $e) {
    $conn->rollback();

    error_log(
        "cart_update.php error for user " .
        $user_id . ": " .
        $e->getMessage()
    );

    respond_json([
        "success" => false,
        "message" => "Unable to update the cart quantity."
    ], 500);
}