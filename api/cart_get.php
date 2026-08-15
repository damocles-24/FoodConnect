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

require_once __DIR__ . "/session_config.php";

require_once __DIR__ . "/db.php";

/*
 * Product promotion schedules use Philippine local time.
 */
$promotionTimezone =
    new DateTimeZone(
        "Asia/Manila"
    );

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
        p.price AS regular_base_price,
        p.stock,
        p.status,
        p.image_path,

        p.discount_type,
        p.discount_value,
        p.discount_schedule,
        p.discount_start,
        p.discount_end,
        p.discount_status

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
        status

    FROM tbl_products

    WHERE product_id = ?
      AND restaurant_id = ?
      AND item_type = 'add_on'

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
   PREPARE CART PRICE REFRESH

   Used when a promotion starts, ends, or changes while an
   item is already stored in the customer's cart.
========================================================= */

$cartPriceUpdateStmt =
    $conn->prepare("
        UPDATE tbl_cart

        SET
            price_at_time = ?,
            subtotal = ?

        WHERE cart_id = ?
          AND user_id = ?

        LIMIT 1
    ");

if (!$cartPriceUpdateStmt) {
    error_log(
        "cart_get.php price update prepare error: " .
        $conn->error
    );

    $cartStmt->close();
    $addonStmt->close();
    $comboOptionStmt->close();

    respond_json([
        "success" => false,
        "message" =>
            "Unable to prepare cart price validation.",
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
$total_discount_savings = 0.00;
$has_price_changes = false;

$cart_restaurant_id = 0;
$has_mixed_restaurants = false;

while ($row = $cartResult->fetch_assoc()) {
    $cart_id = (int)$row["cart_id"];
    $restaurant_id = (int)$row["restaurant_id"];
    $product_id = (int)$row["product_id"];
    $quantity = (int)$row["quantity"];

    if ($cart_restaurant_id === 0) {
    $cart_restaurant_id =
        $restaurant_id;

} elseif (
    $cart_restaurant_id !==
    $restaurant_id
) {
    $has_mixed_restaurants = true;
}

        $regular_base_price = round(
        max(
            0,
            (float)(
                $row[
                    "regular_base_price"
                ] ?? 0
            )
        ),
        2
    );

    $stored_unit_price = round(
        max(
            0,
            (float)(
                $row[
                    "price_at_time"
                ] ?? 0
            )
        ),
        2
    );

    $stored_subtotal = round(
        max(
            0,
            (float)(
                $row["subtotal"] ?? 0
            )
        ),
        2
    );

    $stock =
        (int)($row["stock"] ?? 0);

    if (
        $cart_id <= 0 ||
        $restaurant_id <= 0 ||
        $product_id <= 0 ||
        $quantity < 1
    ) {
        continue;
    }

        /* =====================================================
       CURRENT PRODUCT PROMOTION
    ===================================================== */

    $discount_type = strtolower(
        trim(
            (string)(
                $row["discount_type"] ??
                "none"
            )
        )
    );

    if (
        !in_array(
            $discount_type,
            [
                "none",
                "percentage",
                "fixed"
            ],
            true
        )
    ) {
        $discount_type = "none";
    }

    $discount_value = round(
        max(
            0,
            (float)(
                $row["discount_value"] ??
                0
            )
        ),
        2
    );

    $discount_schedule = strtolower(
        trim(
            (string)(
                $row["discount_schedule"] ??
                "permanent"
            )
        )
    );

    if (
        !in_array(
            $discount_schedule,
            [
                "permanent",
                "scheduled"
            ],
            true
        )
    ) {
        $discount_schedule =
            "permanent";
    }

    $discount_start =
        $row["discount_start"] ??
        null;

    $discount_end =
        $row["discount_end"] ??
        null;

    if (
        $discount_start === "" ||
        $discount_start ===
            "0000-00-00 00:00:00"
    ) {
        $discount_start = null;
    }

    if (
        $discount_end === "" ||
        $discount_end ===
            "0000-00-00 00:00:00"
    ) {
        $discount_end = null;
    }

    $discount_status =
        strtolower(
            trim(
                (string)(
                    $row["discount_status"] ??
                    "inactive"
                )
            )
        ) === "active"
            ? "Active"
            : "Inactive";

    $is_discount_active = false;

    $currentDateTime =
        new DateTime(
            "now",
            $promotionTimezone
        );

    if (
        $discount_type !== "none" &&
        $discount_value > 0 &&
        $discount_status === "Active"
    ) {
        if (
            $discount_schedule ===
            "permanent"
        ) {
            $is_discount_active = true;
        } elseif (
            $discount_schedule ===
                "scheduled" &&
            $discount_start !== null &&
            $discount_end !== null
        ) {
            try {
                $discountStartObject =
                    new DateTime(
                        $discount_start,
                        $promotionTimezone
                    );

                $discountEndObject =
                    new DateTime(
                        $discount_end,
                        $promotionTimezone
                    );

                $is_discount_active =
                    $currentDateTime >=
                        $discountStartObject &&
                    $currentDateTime <=
                        $discountEndObject;
            } catch (Throwable $error) {
                $is_discount_active = false;
            }
        }
    }

    $base_price =
        $regular_base_price;

    if ($is_discount_active) {
        if (
            $discount_type ===
            "percentage"
        ) {
            $base_price =
                $regular_base_price -
                (
                    $regular_base_price *
                    $discount_value /
                    100
                );
        } elseif (
            $discount_type ===
            "fixed"
        ) {
            $base_price =
                $regular_base_price -
                $discount_value;
        }

        $base_price = round(
            max(
                0,
                $base_price
            ),
            2
        );
    }

    $discount_savings = round(
        max(
            0,
            $regular_base_price -
            $base_price
        ),
        2
    );

    $discount_label = "";

    if ($is_discount_active) {
        if (
            $discount_type ===
            "percentage"
        ) {
            $discount_label =
                (
                    floor($discount_value) ==
                    $discount_value
                )
                    ? number_format(
                        $discount_value,
                        0
                    ) . "% OFF"
                    : number_format(
                        $discount_value,
                        2
                    ) . "% OFF";
        } elseif (
            $discount_type ===
            "fixed"
        ) {
            $discount_label =
                "₱" .
                number_format(
                    $discount_value,
                    2
                ) .
                " OFF";
        }
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
                null,

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

            $unit_price = round(
        max(
            0,
            $unit_price
        ),
        2
    );

    $subtotal = round(
        max(
            0,
            $subtotal
        ),
        2
    );

    /* =====================================================
       REFRESH STALE CART PRICE
    ===================================================== */

    $price_changed =
        abs(
            $stored_unit_price -
            $unit_price
        ) >= 0.01 ||
        abs(
            $stored_subtotal -
            $subtotal
        ) >= 0.01;

    if ($price_changed) {
        $cartPriceUpdateStmt
            ->bind_param(
                "ddii",
                $unit_price,
                $subtotal,
                $cart_id,
                $user_id
            );

        if (
            !$cartPriceUpdateStmt
                ->execute()
        ) {
            error_log(
                "cart_get.php price refresh error for cart ID " .
                $cart_id .
                ": " .
                $cartPriceUpdateStmt->error
            );
        }
    }

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

                "regular_base_price" =>
            round(
                $regular_base_price,
                2
            ),

        "base_price" =>
            round(
                $base_price,
                2
            ),

        "final_base_price" =>
            round(
                $base_price,
                2
            ),

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
            $discount_status,

        "is_discount_active" =>
            $is_discount_active,

        "discount_savings" =>
            round(
                $discount_savings,
                2
            ),

        "discount_label" =>
            $discount_label,

        "price_changed" =>
            $price_changed,

        "image_path" =>
            $row["image_path"] ??
            null,

        "image" =>
            $row["image_path"] ??
            null,

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

    $total_discount_savings +=
        $discount_savings *
        $quantity;

    if ($price_changed) {
        $has_price_changes = true;
    }
}

/* =========================================================
   CLEAN UP
========================================================= */

$cartStmt->close();
$addonStmt->close();
$comboOptionStmt->close();
$cartPriceUpdateStmt->close();

/* =========================================================
   LOAD RESTAURANT DELIVERY FEE

   This value is only for displaying the current restaurant
   delivery fee in the cart. checkout.php will retrieve and
   validate it again before creating the order.
========================================================= */

$delivery_fee = 0.00;

/*
 * Backward-compatible default for restaurants created before
 * configurable order types were added.
 */
$order_types = [
    "dine-in",
    "takeout",
    "delivery"
];

if (
    $cart_restaurant_id > 0 &&
    !$has_mixed_restaurants
) {
    $restaurantStmt = $conn->prepare("
        SELECT
            delivery_fee,
            order_types_json

        FROM tbl_restaurants

        WHERE restaurant_id = ?

        LIMIT 1
    ");

    if (!$restaurantStmt) {
        error_log(
            "cart_get.php restaurant query prepare error: " .
            $conn->error
        );

        respond_json([
            "success" => false,
            "message" =>
                "Unable to load restaurant pricing.",
            "items" => [],
            "total_items" => 0,
            "total_price" => 0,
            "subtotal" => 0,
            "delivery_fee" => 0
        ], 500);
    }

    $restaurantStmt->bind_param(
        "i",
        $cart_restaurant_id
    );

    if (!$restaurantStmt->execute()) {
        error_log(
            "cart_get.php restaurant query execute error: " .
            $restaurantStmt->error
        );

        $restaurantStmt->close();

        respond_json([
            "success" => false,
            "message" =>
                "Unable to load restaurant pricing.",
            "items" => [],
            "total_items" => 0,
            "total_price" => 0,
            "subtotal" => 0,
            "delivery_fee" => 0
        ], 500);
    }

    $restaurantResult =
        $restaurantStmt->get_result();

    $restaurantRow =
        $restaurantResult->fetch_assoc();

    $restaurantStmt->close();

    if ($restaurantRow) {
        $delivery_fee = max(
            0,
            (float)(
                $restaurantRow["delivery_fee"] ?? 0
            )
        );

        $decodedOrderTypes = json_decode(
            (string)(
                $restaurantRow["order_types_json"] ?? ""
            ),
            true
        );

        if (is_array($decodedOrderTypes)) {
            $allowedOrderTypes = [
                "dine-in",
                "takeout",
                "delivery"
            ];

            $cleanOrderTypes = array_values(
                array_unique(
                    array_intersect(
                        $decodedOrderTypes,
                        $allowedOrderTypes
                    )
                )
            );

            if (!empty($cleanOrderTypes)) {
                $order_types = $cleanOrderTypes;
            }
        }
    }
}

/* =========================================================
   FINAL RESPONSE
========================================================= */

respond_json([
    "success" => true,

    "restaurant_id" =>
        $cart_restaurant_id > 0
            ? $cart_restaurant_id
            : null,

    "items" => $items,

    "total_items" =>
        $total_items,

    /*
     * Preserve total_price for compatibility with existing
     * JavaScript. It currently represents the item subtotal.
     */
    "total_price" =>
        round($total_price, 2),

       "subtotal" =>
        round(
            $total_price,
            2
        ),

    "total_discount_savings" =>
        round(
            $total_discount_savings,
            2
        ),

    "prices_updated" =>
        $has_price_changes,

    "delivery_fee" =>
        round(
            $delivery_fee,
            2
        ),

    "order_types" =>
        $order_types
]);