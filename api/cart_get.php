<?php

header("Content-Type: application/json; charset=utf-8");

error_reporting(E_ALL);
ini_set("display_errors", "0");

session_set_cookie_params(
    0,
    "/FoodConnect",
    "",
    false,
    true
);

session_start();

require_once __DIR__ . "/db.php";

/* =========================================================
   JSON RESPONSE
========================================================= */

function respond_json($arr, $code = 200)
{
    http_response_code($code);
    echo json_encode($arr);
    exit;
}

/* =========================================================
   DECODE FLAT ID ARRAY

   Supports:
   []
   [1, 2]
   "[1,2]"
========================================================= */

function decode_id_array($value)
{
    if ($value === null || $value === "") {
        return [];
    }

    if (is_string($value)) {
        $decoded = json_decode($value, true);
    } else {
        $decoded = $value;
    }

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

    $ids = array_values(
        array_unique($ids)
    );

    sort($ids, SORT_NUMERIC);

    return $ids;
}

/* =========================================================
   AUTHENTICATION
========================================================= */

if (empty($_SESSION["user_id"])) {
    respond_json([
        "success" => false,
        "message" => "Please login first.",
        "items" => [],
        "total_items" => 0,
        "total_price" => 0
    ], 401);
}

$user_id = (int)$_SESSION["user_id"];

/* =========================================================
   LOAD CART ITEMS
========================================================= */

$cartStmt = $conn->prepare("
    SELECT
        c.cart_id,
        c.user_id,
        c.restaurant_id,
        c.product_id,
        c.addon_ids,
        c.combo_choice_ids_json,
        c.quantity,
        c.price_at_time,
        c.subtotal,

        p.product_name,
        p.category,
        p.size,
        p.price AS base_price,
        p.stock,
        p.status

    FROM tbl_cart c

    INNER JOIN tbl_products p
        ON p.product_id = c.product_id
       AND p.restaurant_id = c.restaurant_id

    WHERE c.user_id = ?

    ORDER BY c.cart_id DESC
");

if (!$cartStmt) {
    error_log(
        "cart_get.php cart query prepare error: " .
        $conn->error
    );

    respond_json([
        "success" => false,
        "message" => "Unable to prepare cart query.",
        "items" => [],
        "total_items" => 0,
        "total_price" => 0
    ], 500);
}

$cartStmt->bind_param(
    "i",
    $user_id
);

if (!$cartStmt->execute()) {
    error_log(
        "cart_get.php cart query execute error: " .
        $cartStmt->error
    );

    $cartStmt->close();

    respond_json([
        "success" => false,
        "message" => "Unable to load cart.",
        "items" => [],
        "total_items" => 0,
        "total_price" => 0
    ], 500);
}

$cartResult = $cartStmt->get_result();

/* =========================================================
   PREPARE ADD-ON LOOKUP

   Each add-on must:
   - belong to the same restaurant
   - exist in tbl_products
   - belong to an add-on category
========================================================= */

$addonStmt = $conn->prepare("
    SELECT
        product_id,
        product_name,
        price,
        stock,
        status

    FROM tbl_products

    WHERE product_id = ?
      AND restaurant_id = ?
      AND (
            LOWER(category) LIKE '%add-on%'
         OR LOWER(category) LIKE '%addon%'
      )

    LIMIT 1
");

if (!$addonStmt) {
    error_log(
        "cart_get.php add-on query prepare error: " .
        $conn->error
    );

    $cartStmt->close();

    respond_json([
        "success" => false,
        "message" => "Unable to prepare add-on query.",
        "items" => [],
        "total_items" => 0,
        "total_price" => 0
    ], 500);
}

/* =========================================================
   PREPARE COMBO OPTION LOOKUP

   Validates that the selected choice option:
   - belongs to the combo represented by the cart product
   - belongs to the same restaurant
   - belongs to an active group
   - belongs to an active combo
   - is an active choice option
========================================================= */

$comboOptionStmt = $conn->prepare("
    SELECT
        o.choice_option_id,
        o.choice_group_id,
        o.product_id,
        o.price_adjustment,

        g.group_name,

        p.product_name,
        p.size,
        p.stock,
        p.status

    FROM tbl_combo_choice_options o

    INNER JOIN tbl_combo_choice_groups g
        ON g.choice_group_id = o.choice_group_id
       AND g.is_active = 1

    INNER JOIN tbl_combos c
        ON c.combo_id = g.combo_id
       AND c.restaurant_id = ?
       AND c.product_id = ?
       AND c.is_active = 1

    INNER JOIN tbl_products p
        ON p.product_id = o.product_id
       AND p.restaurant_id = c.restaurant_id

    WHERE o.choice_option_id = ?
      AND o.is_active = 1

    LIMIT 1
");

if (!$comboOptionStmt) {
    error_log(
        "cart_get.php combo option query prepare error: " .
        $conn->error
    );

    $cartStmt->close();
    $addonStmt->close();

    respond_json([
        "success" => false,
        "message" => "Unable to prepare combo option query.",
        "items" => [],
        "total_items" => 0,
        "total_price" => 0
    ], 500);
}

/* =========================================================
   BUILD CART RESPONSE
========================================================= */

$items = [];

$total_items = 0;
$total_price = 0.00;

while ($row = $cartResult->fetch_assoc()) {
    $cart_id = (int)$row["cart_id"];
    $restaurant_id = (int)$row["restaurant_id"];
    $product_id = (int)$row["product_id"];
    $quantity = (int)$row["quantity"];

    $base_price = (float)$row["base_price"];
    $stock = (int)$row["stock"];

    if (
        $cart_id <= 0 ||
        $restaurant_id <= 0 ||
        $product_id <= 0 ||
        $quantity < 1
    ) {
        continue;
    }

    /* =====================================================
       BASE OR SIZE TEXT
    ===================================================== */

    $base_text = trim(
        (string)($row["size"] ?? "")
    );

    if ($base_text === "") {
        $base_text = "Default";
    }

    /* =====================================================
       LOAD ADD-ONS
    ===================================================== */

    $addon_ids = decode_id_array(
        $row["addon_ids"] ?? null
    );

    $addons = [];
    $addon_names = [];
    $addon_total = 0.00;

    foreach ($addon_ids as $addon_id) {
        $addonStmt->bind_param(
            "ii",
            $addon_id,
            $restaurant_id
        );

        if (!$addonStmt->execute()) {
            error_log(
                "cart_get.php add-on lookup error for ID " .
                $addon_id .
                ": " .
                $addonStmt->error
            );

            continue;
        }

        $addonResult = $addonStmt->get_result();
        $addon = $addonResult->fetch_assoc();

        if (!$addon) {
            continue;
        }

        $addon_price = (float)$addon["price"];

        $addon_name = trim(
            (string)$addon["product_name"]
        );

        $addons[] = [
            "product_id" =>
                (int)$addon["product_id"],

            "name" =>
                $addon_name,

            "price" =>
                round($addon_price, 2),

            "stock" =>
                (int)$addon["stock"],

            "status" =>
                $addon["status"]
        ];

        if ($addon_name !== "") {
            $addon_names[] = $addon_name;
        }

        $addon_total += $addon_price;
    }

    $addon_text = !empty($addon_names)
        ? implode(", ", $addon_names)
        : "No Add-on";

    /* =====================================================
       LOAD COMBO CHOICES

       combo_choice_ids_json contains choice_option_id values.
    ===================================================== */

    $combo_choice_ids = decode_id_array(
        $row["combo_choice_ids_json"] ?? null
    );

    $combo_choices = [];
    $combo_choice_names = [];

    $combo_choice_price_adjustment = 0.00;

    foreach (
        $combo_choice_ids
        as $choice_option_id
    ) {
        $comboOptionStmt->bind_param(
            "iii",
            $restaurant_id,
            $product_id,
            $choice_option_id
        );

        if (!$comboOptionStmt->execute()) {
            error_log(
                "cart_get.php combo option lookup error for ID " .
                $choice_option_id .
                ": " .
                $comboOptionStmt->error
            );

            continue;
        }

        $comboOptionResult =
            $comboOptionStmt->get_result();

        $comboOption =
            $comboOptionResult->fetch_assoc();

        if (!$comboOption) {
            continue;
        }

        $product_name = trim(
            (string)$comboOption["product_name"]
        );

        $size = trim(
            (string)($comboOption["size"] ?? "")
        );

        $choice_text = $product_name;

        if ($size !== "") {
            $choice_text .= " - " . $size;
        }

        $price_adjustment = (float)(
            $comboOption["price_adjustment"] ?? 0
        );

        $combo_choices[] = [
            "choice_option_id" =>
                (int)$comboOption["choice_option_id"],

            "choice_group_id" =>
                (int)$comboOption["choice_group_id"],

            "group_name" =>
                $comboOption["group_name"],

            "product_id" =>
                (int)$comboOption["product_id"],

            "product_name" =>
                $product_name,

            "size" =>
                $size,

            "text" =>
                $choice_text,

            "price_adjustment" =>
                round($price_adjustment, 2),

            "stock" =>
                (int)$comboOption["stock"],

            "status" =>
                $comboOption["status"]
        ];

        if ($choice_text !== "") {
            $combo_choice_names[] =
                $choice_text;
        }

        $combo_choice_price_adjustment +=
            $price_adjustment;
    }

    $combo_choice_text =
        !empty($combo_choice_names)
            ? implode(
                ", ",
                $combo_choice_names
            )
            : "";

    /* =====================================================
       AUTHORITATIVE DISPLAY PRICE

       This does not trust browser prices.

       Unit price:
       base price
       + combo option price adjustments
       + add-on prices
    ===================================================== */

    $unit_price =
        $base_price +
        $combo_choice_price_adjustment +
        $addon_total;

    $subtotal =
        $unit_price *
        $quantity;

    /* =====================================================
       RESPONSE ITEM
    ===================================================== */

    $items[] = [
        "cart_id" =>
            $cart_id,

        "restaurant_id" =>
            $restaurant_id,

        "product_id" =>
            $product_id,

        "product_name" =>
            $row["product_name"],

        "category" =>
            $row["category"],

        "base_text" =>
            $base_text,

        "base_price" =>
            round($base_price, 2),

        "addon_ids" =>
            $addon_ids,

        "addons" =>
            $addons,

        "addon_text" =>
            $addon_text,

        "addon_total" =>
            round($addon_total, 2),

        "combo_choice_ids" =>
            $combo_choice_ids,

        "combo_choice_ids_json" =>
            $row["combo_choice_ids_json"] ?? "[]",

        "combo_choices" =>
            $combo_choices,

        "combo_choice_text" =>
            $combo_choice_text,

        "combo_choice_price_adjustment" =>
            round(
                $combo_choice_price_adjustment,
                2
            ),

        "price" =>
            round($unit_price, 2),

        "unit_price" =>
            round($unit_price, 2),

        "quantity" =>
            $quantity,

        "subtotal" =>
            round($subtotal, 2),

        "stock" =>
            $stock,

        "status" =>
            $row["status"]
    ];

    $total_items += $quantity;
    $total_price += $subtotal;
}

/* =========================================================
   CLEAN UP
========================================================= */

$cartStmt->close();
$addonStmt->close();
$comboOptionStmt->close();

/* =========================================================
   FINAL RESPONSE
========================================================= */

respond_json([
    "success" => true,
    "items" => $items,
    "total_items" => $total_items,
    "total_price" => round($total_price, 2)
]);