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
   ROLLBACK RESPONSE
========================================================= */

function rollback_and_respond(
    $conn,
    $arr,
    $code = 400
) {
    $conn->rollback();
    respond_json($arr, $code);
}

/* =========================================================
   NORMALIZE ARRAY OF IDS

   Accepts:
   []
   [1, 2]
   "[1,2]"
========================================================= */

function normalize_id_array($raw, $label)
{
    if (is_string($raw)) {
        $trimmed = trim($raw);

        if ($trimmed === "") {
            $raw = [];
        } else {
            $decoded = json_decode(
                $trimmed,
                true
            );

            if (!is_array($decoded)) {
                respond_json([
                    "success" => false,
                    "message" =>
                        "Invalid " .
                        $label .
                        "."
                ], 400);
            }

            $raw = $decoded;
        }
    }

    if (!is_array($raw)) {
        respond_json([
            "success" => false,
            "message" =>
                "Invalid " .
                $label .
                "."
        ], 400);
    }

    $ids = [];

    foreach ($raw as $id) {
        $id = (int)$id;

        if ($id > 0) {
            $ids[] = $id;
        }
    }

    $ids = array_values(
        array_unique($ids)
    );

    sort(
        $ids,
        SORT_NUMERIC
    );

    return $ids;
}

/* =========================================================
   ENCODE IDS
========================================================= */

function encode_ids($ids, $label)
{
    $json = json_encode(
        array_values($ids)
    );

    if ($json === false) {
        respond_json([
            "success" => false,
            "message" =>
                "Unable to encode " .
                $label .
                "."
        ], 500);
    }

    return $json;
}

/* =========================================================
   AUTHENTICATION
========================================================= */

if (empty($_SESSION["user_id"])) {
    respond_json([
        "success" => false,
        "message" => "Login required."
    ], 401);
}

/* =========================================================
   REQUEST DATA
========================================================= */

$data = json_decode(
    file_get_contents("php://input"),
    true
);

if (!is_array($data)) {
    respond_json([
        "success" => false,
        "message" => "Invalid JSON request."
    ], 400);
}

$user_id = (int)$_SESSION["user_id"];

$product_id = (int)(
    $data["product_id"] ?? 0
);

$quantity = (int)(
    $data["quantity"] ?? 1
);

$addon_ids = normalize_id_array(
    $data["addon_ids"] ?? [],
    "add-on selection"
);

$combo_choice_ids = normalize_id_array(
    $data["combo_choice_ids"] ?? [],
    "combo selection"
);

$addon_ids_json = encode_ids(
    $addon_ids,
    "add-on selection"
);

$combo_choice_ids_json = encode_ids(
    $combo_choice_ids,
    "combo selection"
);

/* =========================================================
   BASIC VALIDATION
========================================================= */

if ($product_id <= 0) {
    respond_json([
        "success" => false,
        "message" => "Invalid product."
    ], 400);
}

if (
    $quantity < 1 ||
    $quantity > 99
) {
    respond_json([
        "success" => false,
        "message" =>
            "Quantity must be between 1 and 99."
    ], 400);
}

/* =========================================================
   TRANSACTION
========================================================= */

$conn->begin_transaction();

try {

    /* =====================================================
       LOAD SELLABLE PRODUCT
    ===================================================== */

    $productStmt = $conn->prepare("
        SELECT
            product_id,
            restaurant_id,
            product_name,
            category,
            size,
            price,
            stock,
            status

        FROM tbl_products

        WHERE product_id = ?

        LIMIT 1

        FOR UPDATE
    ");

    if (!$productStmt) {
        throw new Exception(
            "Unable to prepare product lookup."
        );
    }

    $productStmt->bind_param(
        "i",
        $product_id
    );

    if (!$productStmt->execute()) {
        throw new Exception(
            "Unable to load the selected product."
        );
    }

    $productResult =
        $productStmt->get_result();

    $product =
        $productResult->fetch_assoc();

    $productStmt->close();

    if (!$product) {
        rollback_and_respond(
            $conn,
            [
                "success" => false,
                "message" => "Product not found."
            ],
            404
        );
    }

    $restaurant_id = (int)(
        $product["restaurant_id"] ?? 0
    );

    $product_name = trim(
        (string)(
            $product["product_name"] ??
            "Product"
        )
    );

    $base_price = (float)(
        $product["price"] ?? 0
    );

    $product_stock = (int)(
        $product["stock"] ?? 0
    );

    $product_status = strtolower(
        trim(
            (string)(
                $product["status"] ?? ""
            )
        )
    );

    if ($restaurant_id <= 0) {
        rollback_and_respond(
            $conn,
            [
                "success" => false,
                "message" =>
                    "Product has an invalid restaurant."
            ],
            400
        );
    }

    /* =====================================================
       DETECT COMBO OR BUNDLE
    ===================================================== */

    $comboStmt = $conn->prepare("
        SELECT
            combo_id,
            combo_name,
            combo_price,
            is_active

        FROM tbl_combos

        WHERE restaurant_id = ?
          AND product_id = ?

        LIMIT 1

        FOR UPDATE
    ");

    if (!$comboStmt) {
        throw new Exception(
            "Unable to prepare combo lookup."
        );
    }

    $comboStmt->bind_param(
        "ii",
        $restaurant_id,
        $product_id
    );

    if (!$comboStmt->execute()) {
        throw new Exception(
            "Unable to validate the selected combo."
        );
    }

    $comboResult =
        $comboStmt->get_result();

    $combo =
        $comboResult->fetch_assoc();

    $comboStmt->close();

    $is_combo = is_array($combo);

    $combo_id = $is_combo
        ? (int)$combo["combo_id"]
        : 0;

    if (
        $is_combo &&
        (int)$combo["is_active"] !== 1
    ) {
        rollback_and_respond(
            $conn,
            [
                "success" => false,
                "message" =>
                    "This combo is currently unavailable."
            ],
            409
        );
    }

    /*
     * Normal products use their own stock.
     *
     * Combo products derive availability from:
     *
     * fixed component stock
     * selected combo option stock
     */
    if (!$is_combo) {

        if (
            $product_status !== "available" ||
            $product_stock <= 0
        ) {
            rollback_and_respond(
                $conn,
                [
                    "success" => false,
                    "message" =>
                        "This product is currently unavailable."
                ],
                409
            );
        }

        /*
         * A normal product must not accept fake
         * combo option IDs.
         */
        if (!empty($combo_choice_ids)) {
            rollback_and_respond(
                $conn,
                [
                    "success" => false,
                    "message" =>
                        "This product does not accept combo selections."
                ],
                400
            );
        }
    }

    /* =====================================================
       RESTAURANT ISOLATION
    ===================================================== */

    $restaurantStmt = $conn->prepare("
        SELECT restaurant_id

        FROM tbl_cart

        WHERE user_id = ?

        ORDER BY cart_id ASC

        LIMIT 1

        FOR UPDATE
    ");

    if (!$restaurantStmt) {
        throw new Exception(
            "Unable to prepare restaurant validation."
        );
    }

    $restaurantStmt->bind_param(
        "i",
        $user_id
    );

    if (!$restaurantStmt->execute()) {
        throw new Exception(
            "Unable to validate the current cart."
        );
    }

    $restaurantResult =
        $restaurantStmt->get_result();

    $existingCart =
        $restaurantResult->fetch_assoc();

    $restaurantStmt->close();

    if (
        $existingCart &&
        (int)$existingCart["restaurant_id"]
            !== $restaurant_id
    ) {
        rollback_and_respond(
            $conn,
            [
                "success" => false,
                "message" =>
                    "Your cart contains items from another restaurant. " .
                    "Clear your cart before ordering from this restaurant."
            ],
            409
        );
    }

    /* =====================================================
       COMBO COMPONENTS AND CHOICE VALIDATION
    ===================================================== */

    $validated_combo_choices = [];

    $choice_price_adjustment = 0.00;

    $combo_components = [];

    if ($is_combo) {

        /* =================================================
           LOAD FIXED COMBO COMPONENTS
        ================================================= */

        $componentStmt = $conn->prepare("
            SELECT
                ci.product_id,
                ci.quantity AS required_quantity,

                p.product_name,
                p.stock,
                p.status

            FROM tbl_combo_items ci

            INNER JOIN tbl_products p
                ON p.product_id = ci.product_id
               AND p.restaurant_id = ?

            WHERE ci.combo_id = ?

            ORDER BY ci.product_id ASC

            FOR UPDATE
        ");

        if (!$componentStmt) {
            throw new Exception(
                "Unable to prepare combo components."
            );
        }

        $componentStmt->bind_param(
            "ii",
            $restaurant_id,
            $combo_id
        );

        if (!$componentStmt->execute()) {
            throw new Exception(
                "Unable to validate combo components."
            );
        }

        $componentResult =
            $componentStmt->get_result();

        while (
            $component =
                $componentResult->fetch_assoc()
        ) {
            $combo_components[] = [
                "product_id" =>
                    (int)$component["product_id"],

                "product_name" =>
                    $component["product_name"],

                "required_quantity" =>
                    (int)$component[
                        "required_quantity"
                    ],

                "stock" =>
                    (int)$component["stock"],

                "status" =>
                    strtolower(
                        trim(
                            (string)$component[
                                "status"
                            ]
                        )
                    )
            ];
        }

        $componentStmt->close();

        if (count($combo_components) === 0) {
            rollback_and_respond(
                $conn,
                [
                    "success" => false,
                    "message" =>
                        "This combo has no configured components."
                ],
                409
            );
        }

        /* =================================================
           LOAD COMBO CHOICE GROUPS
        ================================================= */

        $groupStmt = $conn->prepare("
            SELECT
                choice_group_id,
                group_name,
                min_select,
                max_select,
                is_required

            FROM tbl_combo_choice_groups

            WHERE combo_id = ?
              AND is_active = 1

            ORDER BY choice_group_id ASC

            FOR UPDATE
        ");

        if (!$groupStmt) {
            throw new Exception(
                "Unable to prepare combo choice groups."
            );
        }

        $groupStmt->bind_param(
            "i",
            $combo_id
        );

        if (!$groupStmt->execute()) {
            throw new Exception(
                "Unable to load combo choice groups."
            );
        }

        $groupResult =
            $groupStmt->get_result();

        $choice_groups = [];

        while (
            $group =
                $groupResult->fetch_assoc()
        ) {
            $group_id =
                (int)$group["choice_group_id"];

            $choice_groups[$group_id] = [
                "choice_group_id" =>
                    $group_id,

                "group_name" =>
                    $group["group_name"],

                "min_select" =>
                    (int)$group["min_select"],

                "max_select" =>
                    (int)$group["max_select"],

                "is_required" =>
                    (int)$group[
                        "is_required"
                    ] === 1,

                "selected" =>
                    []
            ];
        }

        $groupStmt->close();

        /* =================================================
           VALIDATE SELECTED COMBO OPTIONS
        ================================================= */

        if (!empty($combo_choice_ids)) {

            $optionStmt = $conn->prepare("
                SELECT
                    o.choice_option_id,
                    o.choice_group_id,
                    o.product_id,
                    o.price_adjustment,

                    p.product_name,
                    p.size,
                    p.stock,
                    p.status

                FROM tbl_combo_choice_options o

                INNER JOIN tbl_combo_choice_groups g
                    ON g.choice_group_id =
                        o.choice_group_id
                   AND g.combo_id = ?
                   AND g.is_active = 1

                INNER JOIN tbl_products p
                    ON p.product_id =
                        o.product_id
                   AND p.restaurant_id = ?

                WHERE o.choice_option_id = ?
                  AND o.is_active = 1

                LIMIT 1

                FOR UPDATE
            ");

            if (!$optionStmt) {
                throw new Exception(
                    "Unable to prepare combo option validation."
                );
            }

            foreach (
                $combo_choice_ids
                as $choice_option_id
            ) {
                $optionStmt->bind_param(
                    "iii",
                    $combo_id,
                    $restaurant_id,
                    $choice_option_id
                );

                if (!$optionStmt->execute()) {
                    throw new Exception(
                        "Unable to validate a combo option."
                    );
                }

                $optionResult =
                    $optionStmt->get_result();

                $option =
                    $optionResult->fetch_assoc();

                if (!$option) {
                    $optionStmt->close();

                    rollback_and_respond(
                        $conn,
                        [
                            "success" => false,
                            "message" =>
                                "One or more combo selections are invalid."
                        ],
                        400
                    );
                }

                $group_id = (int)(
                    $option["choice_group_id"] ?? 0
                );

                if (
                    !isset(
                        $choice_groups[$group_id]
                    )
                ) {
                    $optionStmt->close();

                    rollback_and_respond(
                        $conn,
                        [
                            "success" => false,
                            "message" =>
                                "A selected option does not belong to this combo."
                        ],
                        400
                    );
                }

                $choice_groups[
                    $group_id
                ]["selected"][] = [
                    "choice_option_id" =>
                        (int)$option[
                            "choice_option_id"
                        ],

                    "product_id" =>
                        (int)$option[
                            "product_id"
                        ],

                    "product_name" =>
                        $option[
                            "product_name"
                        ],

                    "size" =>
                        $option["size"] ?? "",

                    "price_adjustment" =>
                        (float)$option[
                            "price_adjustment"
                        ],

                    "stock" =>
                        (int)$option["stock"],

                    "status" =>
                        strtolower(
                            trim(
                                (string)$option[
                                    "status"
                                ]
                            )
                        )
                ];
            }

            $optionStmt->close();
        }

        /* =================================================
           ENFORCE CHOICE GROUP RULES
        ================================================= */

        foreach (
            $choice_groups
            as $group
        ) {
            $selected_count =
                count($group["selected"]);

            $minimum = max(
                0,
                (int)$group["min_select"]
            );

            $maximum = max(
                $minimum,
                (int)$group["max_select"]
            );

            if (
                $group["is_required"] &&
                $selected_count < $minimum
            ) {
                rollback_and_respond(
                    $conn,
                    [
                        "success" => false,
                        "message" =>
                            $group["group_name"] .
                            " is required."
                    ],
                    400
                );
            }

            if (
                $selected_count < $minimum ||
                $selected_count > $maximum
            ) {
                rollback_and_respond(
                    $conn,
                    [
                        "success" => false,
                        "message" =>
                            $group["group_name"] .
                            " requires between " .
                            $minimum .
                            " and " .
                            $maximum .
                            " selection(s)."
                    ],
                    400
                );
            }

            foreach (
                $group["selected"]
                as $selected
            ) {
                $validated_combo_choices[] =
                    $selected;

                $choice_price_adjustment +=
                    (float)$selected[
                        "price_adjustment"
                    ];
            }
        }

        /*
         * B1T1 bundles do not have selectable
         * choice groups.
         */
        if (
            count($choice_groups) === 0 &&
            !empty($combo_choice_ids)
        ) {
            rollback_and_respond(
                $conn,
                [
                    "success" => false,
                    "message" =>
                        "This combo does not accept selectable options."
                ],
                400
            );
        }
    }

    /* =====================================================
       VALIDATE ADD-ONS
    ===================================================== */

    $addon_total = 0.00;

    $validated_addons = [];

    if (!empty($addon_ids)) {

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
                    LOWER(category)
                        LIKE '%add-on%'
                 OR LOWER(category)
                        LIKE '%addon%'
              )

            LIMIT 1

            FOR UPDATE
        ");

        if (!$addonStmt) {
            throw new Exception(
                "Unable to prepare add-on lookup."
            );
        }

        foreach (
            $addon_ids
            as $addon_id
        ) {
            $addonStmt->bind_param(
                "ii",
                $addon_id,
                $restaurant_id
            );

            if (!$addonStmt->execute()) {
                throw new Exception(
                    "Unable to validate an add-on."
                );
            }

            $addonResult =
                $addonStmt->get_result();

            $addon =
                $addonResult->fetch_assoc();

            if (!$addon) {
                $addonStmt->close();

                rollback_and_respond(
                    $conn,
                    [
                        "success" => false,
                        "message" =>
                            "One or more selected add-ons are invalid."
                    ],
                    400
                );
            }

            $validated_addons[] = [
                "product_id" =>
                    (int)$addon["product_id"],

                "name" =>
                    $addon["product_name"],

                "price" =>
                    (float)$addon["price"],

                "stock" =>
                    (int)$addon["stock"],

                "status" =>
                    strtolower(
                        trim(
                            (string)$addon[
                                "status"
                            ]
                        )
                    )
            ];

            $addon_total +=
                (float)$addon["price"];
        }

        $addonStmt->close();
    }

    /* =====================================================
       FIND IDENTICAL CART ROW

       Different combo choices must remain separate rows.
    ===================================================== */

    $checkStmt = $conn->prepare("
        SELECT
            cart_id,
            quantity

        FROM tbl_cart

        WHERE user_id = ?
          AND restaurant_id = ?
          AND product_id = ?
          AND COALESCE(
                addon_ids,
                '[]'
              ) = ?
          AND COALESCE(
                combo_choice_ids_json,
                '[]'
              ) = ?

        LIMIT 1

        FOR UPDATE
    ");

    if (!$checkStmt) {
        throw new Exception(
            "Unable to prepare cart lookup."
        );
    }

    $checkStmt->bind_param(
        "iiiss",
        $user_id,
        $restaurant_id,
        $product_id,
        $addon_ids_json,
        $combo_choice_ids_json
    );

    if (!$checkStmt->execute()) {
        throw new Exception(
            "Unable to check the current cart item."
        );
    }

    $checkResult =
        $checkStmt->get_result();

    $existingItem =
        $checkResult->fetch_assoc();

    $checkStmt->close();

    $existing_quantity = $existingItem
        ? (int)$existingItem["quantity"]
        : 0;

    $final_quantity =
        $existing_quantity +
        $quantity;

    if ($final_quantity > 99) {
        rollback_and_respond(
            $conn,
            [
                "success" => false,
                "message" =>
                    "Maximum cart quantity is 99."
            ],
            400
        );
    }

    /* =====================================================
       STOCK VALIDATION FOR FINAL CART QUANTITY
    ===================================================== */

    if (!$is_combo) {

        if (
            $product_status !== "available" ||
            $product_stock < $final_quantity
        ) {
            rollback_and_respond(
                $conn,
                [
                    "success" => false,
                    "message" =>
                        "Only " .
                        $product_stock .
                        " item(s) of " .
                        $product_name .
                        " are available."
                ],
                409
            );
        }

    } else {

        /*
         * Validate every fixed component.
         *
         * Example:
         * B1T1 quantity 2
         * required component quantity 2
         * total required = 4
         */
        foreach (
            $combo_components
            as $component
        ) {
            $required_per_package =
                (int)$component[
                    "required_quantity"
                ];

            $required_total =
                $required_per_package *
                $final_quantity;

            if (
                $required_per_package <= 0 ||
                $component["status"]
                    !== "available" ||
                (int)$component["stock"]
                    < $required_total
            ) {
                rollback_and_respond(
                    $conn,
                    [
                        "success" => false,
                        "message" =>
                            "Not enough stock for " .
                            $component[
                                "product_name"
                            ] .
                            " to prepare this combo quantity."
                    ],
                    409
                );
            }
        }

        /*
         * Each chosen drink is required once
         * for every combo package.
         */
        foreach (
            $validated_combo_choices
            as $choice
        ) {
            if (
                $choice["status"]
                    !== "available" ||
                (int)$choice["stock"]
                    < $final_quantity
            ) {
                rollback_and_respond(
                    $conn,
                    [
                        "success" => false,
                        "message" =>
                            $choice[
                                "product_name"
                            ] .
                            " does not have enough stock for this combo quantity."
                    ],
                    409
                );
            }
        }
    }

    /*
     * Selected add-ons are also required once
     * per ordered quantity.
     */
    foreach (
        $validated_addons
        as $addon
    ) {
        if (
            $addon["status"]
                !== "available" ||
            (int)$addon["stock"]
                < $final_quantity
        ) {
            rollback_and_respond(
                $conn,
                [
                    "success" => false,
                    "message" =>
                        $addon["name"] .
                        " does not have enough stock for this quantity."
                ],
                409
            );
        }
    }

    /* =====================================================
       AUTHORITATIVE BACKEND PRICE
    ===================================================== */

    $unit_price =
        $base_price +
        $choice_price_adjustment +
        $addon_total;

    $subtotal =
        $unit_price *
        $final_quantity;

    /* =====================================================
       UPDATE EXISTING IDENTICAL CART ROW
    ===================================================== */

    if ($existingItem) {

        $cart_id =
            (int)$existingItem["cart_id"];

        $updateStmt = $conn->prepare("
            UPDATE tbl_cart

            SET
                quantity = ?,
                price_at_time = ?,
                subtotal = ?,
                updated_at = CURRENT_TIMESTAMP

            WHERE cart_id = ?
              AND user_id = ?
              AND restaurant_id = ?
        ");

        if (!$updateStmt) {
            throw new Exception(
                "Unable to prepare cart update."
            );
        }

        $updateStmt->bind_param(
            "iddiii",
            $final_quantity,
            $unit_price,
            $subtotal,
            $cart_id,
            $user_id,
            $restaurant_id
        );

        if (!$updateStmt->execute()) {
            throw new Exception(
                "Unable to update the cart item."
            );
        }

        $updateStmt->close();

        $conn->commit();

        respond_json([
            "success" => true,
            "message" => "Cart updated.",

            "cart_id" =>
                $cart_id,

            "quantity" =>
                $final_quantity,

            "is_combo" =>
                $is_combo,

            "combo_id" =>
                $combo_id > 0
                    ? $combo_id
                    : null,

            "base_price" =>
                round(
                    $base_price,
                    2
                ),

            "choice_price_adjustment" =>
                round(
                    $choice_price_adjustment,
                    2
                ),

            "addon_total" =>
                round(
                    $addon_total,
                    2
                ),

            "unit_price" =>
                round(
                    $unit_price,
                    2
                ),

            "subtotal" =>
                round(
                    $subtotal,
                    2
                ),

            "combo_choices" =>
                $validated_combo_choices,

            "addons" =>
                $validated_addons
        ]);
    }

    /* =====================================================
       INSERT NEW CART ROW
    ===================================================== */

    $insertStmt = $conn->prepare("
        INSERT INTO tbl_cart (
            user_id,
            restaurant_id,
            product_id,
            addon_ids,
            combo_choice_ids_json,
            quantity,
            price_at_time,
            subtotal
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ");

    if (!$insertStmt) {
        throw new Exception(
            "Unable to prepare cart insert."
        );
    }

    $new_subtotal =
        $unit_price *
        $quantity;

    $insertStmt->bind_param(
        "iiissidd",
        $user_id,
        $restaurant_id,
        $product_id,
        $addon_ids_json,
        $combo_choice_ids_json,
        $quantity,
        $unit_price,
        $new_subtotal
    );

    if (!$insertStmt->execute()) {
        throw new Exception(
            "Unable to add the product to the cart."
        );
    }

    $new_cart_id =
        (int)$insertStmt->insert_id;

    $insertStmt->close();

    $conn->commit();

    respond_json([
        "success" => true,
        "message" => "Added to cart.",

        "cart_id" =>
            $new_cart_id,

        "quantity" =>
            $quantity,

        "is_combo" =>
            $is_combo,

        "combo_id" =>
            $combo_id > 0
                ? $combo_id
                : null,

        "base_price" =>
            round(
                $base_price,
                2
            ),

        "choice_price_adjustment" =>
            round(
                $choice_price_adjustment,
                2
            ),

        "addon_total" =>
            round(
                $addon_total,
                2
            ),

        "unit_price" =>
            round(
                $unit_price,
                2
            ),

        "subtotal" =>
            round(
                $new_subtotal,
                2
            ),

        "combo_choices" =>
            $validated_combo_choices,

        "addons" =>
            $validated_addons
    ]);

} catch (Throwable $e) {

    $conn->rollback();

    error_log(
        "cart_add.php error: " .
        $e->getMessage()
    );

    respond_json([
        "success" => false,
        "message" =>
            "Unable to add the product to your cart."
    ], 500);
}