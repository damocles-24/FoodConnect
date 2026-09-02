<?php

date_default_timezone_set(
    "Asia/Manila"
);

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
require_once __DIR__ . "/rate_limit.php";
require_once __DIR__ . "/ph_phone.php";
require_once __DIR__ . "/addon_helper.php";

/* =========================================================
   JSON RESPONSE
========================================================= */

function respond_json(
    array $data,
    int $statusCode = 200
): void {
    http_response_code($statusCode);
    echo json_encode($data);
    exit;
}

/* =========================================================
   DECODE STORED ID ARRAY

   Supports:
   null
   ""
   []
   "[1,2]"
========================================================= */

function decode_id_array($raw): array
{
    if (
        $raw === null ||
        $raw === "" ||
        $raw === "[]"
    ) {
        return [];
    }

    if (is_string($raw)) {
        $raw = json_decode($raw, true);
    }

    if (!is_array($raw)) {
        return [];
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
   ENCODE VALIDATED ID ARRAY
========================================================= */

function encode_id_array(array $ids): string
{
    $json = json_encode(
        array_values($ids),
        JSON_UNESCAPED_UNICODE
    );

    if ($json === false) {
        throw new RuntimeException(
            "Unable to encode selected IDs."
        );
    }

    return $json;
}

/* =========================================================
   PRODUCT STATUS CHECK
========================================================= */

function status_is_available($status): bool
{
    return strtolower(
        trim((string)$status)
    ) === "available";
}

/* =========================================================
   AUTHENTICATION
========================================================= */

if (empty($_SESSION["user_id"])) {
    respond_json([
        "success" => false,
        "message" => "Please login first."
    ], 401);
}

$user_id = (int)$_SESSION["user_id"];

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
        "message" => "Invalid checkout request."
    ], 400);
}

rate_limit_enforce(
    $conn,
    "customer-checkout",
    rate_limit_identifier(
        (string)$user_id,
        rate_limit_client_ip()
    ),
    8,
    60,
    60,
    "Too many order submissions. Please wait one minute and try again."
);

$order_type = strtolower(
    trim(
        (string)(
            $data["order_type"] ?? ""
        )
    )
);

/*
 * Support both:
 *
 * takeout
 * take-out
 */
if ($order_type === "take-out") {
    $order_type = "takeout";
}

$customer_name = trim(
    (string)(
        $data["customer_name"] ?? ""
    )
);

$contact_number = trim(
    (string)(
        $data["contact_number"] ?? ""
    )
);

$contact_number_raw = $contact_number;
$contact_number = normalize_ph_mobile($contact_number_raw);

$payment_method = trim(
    (string)(
        $data["payment_method"] ?? ""
    )
);

$address = trim(
    (string)(
        $data["address"] ?? ""
    )
);

$landmark = trim(
    (string)(
        $data["landmark"] ?? ""
    )
);

$customer_latitude =
    $data["customer_latitude"] ?? null;

$customer_longitude =
    $data["customer_longitude"] ?? null;

$table_number = trim(
    (string)(
        $data["table_number"] ?? ""
    )
);


$notes = trim(
    (string)(
        $data["notes"] ?? ""
    )
);

/* =========================================================
   ORDER TYPE VALIDATION
========================================================= */

$allowedTypes = [
    "dine-in",
    "takeout",
    "delivery"
];

if (
    !in_array(
        $order_type,
        $allowedTypes,
        true
    )
) {
    respond_json([
        "success" => false,
        "message" => "Invalid order type."
    ], 400);
}

/* =========================================================
   CUSTOMER NAME
========================================================= */

if ($customer_name === "") {
    $userStmt = $conn->prepare("
        SELECT
            TRIM(CONCAT_WS(' ', NULLIF(TRIM(first_name), ''), NULLIF(TRIM(middle_name), ''), NULLIF(TRIM(last_name), ''))) AS display_name

        FROM tbl_users

        WHERE user_id = ?

        LIMIT 1
    ");

    if (!$userStmt) {
        respond_json([
            "success" => false,
            "message" =>
                "Unable to verify customer information."
        ], 500);
    }

    $userStmt->bind_param(
        "i",
        $user_id
    );

    if (!$userStmt->execute()) {
        $userStmt->close();

        respond_json([
            "success" => false,
            "message" =>
                "Unable to verify customer information."
        ], 500);
    }

    $userResult =
        $userStmt->get_result();

    $userRow =
        $userResult->fetch_assoc();

    $userStmt->close();

    $customer_name = trim(
        (string)(
            $userRow["display_name"] ?? ""
        )
    );

    if ($customer_name === "") {
        $customer_name =
            "Walk-in Customer";
    }
}

/* =========================================================
   CONTACT NUMBER
========================================================= */

if (
    $contact_number === ""
) {
    respond_json([
        "success" => false,
        "message" =>
            "Enter a valid Philippine mobile number starting with 9."
    ], 400);
}

/* =========================================================
   ORDER-TYPE FIELDS
========================================================= */

if ($order_type === "delivery") {
    $allowedPaymentMethods = [
        "Cash on Delivery",
        "PayMongo QR Ph"
    ];

    if (!in_array($payment_method, $allowedPaymentMethods, true)) {
        respond_json([
            "success" => false,
            "message" => "Select a valid delivery payment method."
        ], 400);
    }

    if ($address === "") {
        respond_json([
            "success" => false,
            "message" =>
                "Address is required for delivery."
        ], 400);
    }

    if (
        !is_numeric($customer_latitude) ||
        !is_numeric($customer_longitude)
    ) {
        respond_json([
            "success" => false,
            "message" =>
                "Please select a valid delivery location on the map."
        ], 400);
    }

    $customer_latitude =
        (float)$customer_latitude;

    $customer_longitude =
        (float)$customer_longitude;

    if (
        $customer_latitude < -90 ||
        $customer_latitude > 90
    ) {
        respond_json([
            "success" => false,
            "message" =>
                "Invalid delivery latitude."
        ], 400);
    }

    if (
        $customer_longitude < -180 ||
        $customer_longitude > 180
    ) {
        respond_json([
            "success" => false,
            "message" =>
                "Invalid delivery longitude."
        ], 400);
    }

    $table_number = "";

} elseif ($order_type === "takeout") {
    $allowedPaymentMethods = [
        "Cash",
        "PayMongo QR Ph"
    ];

    if (!in_array($payment_method, $allowedPaymentMethods, true)) {
        respond_json([
            "success" => false,
            "message" => "Select a valid takeout payment method."
        ], 400);
    }

        $address = "";
    $landmark = "";
    $customer_latitude = null;
    $customer_longitude = null;
    $table_number = "";

} else {
    /*
     * Dine-in
     */
    $allowedPaymentMethods = [
        "Cash",
        "PayMongo QR Ph"
    ];

    if (!in_array($payment_method, $allowedPaymentMethods, true)) {
        respond_json([
            "success" => false,
            "message" => "Select a valid dine-in payment method."
        ], 400);
    }

      $address = "";
    $landmark = "";
    $customer_latitude = null;
    $customer_longitude = null;
}

/* =========================================================
   START TRANSACTION
========================================================= */

$conn->begin_transaction();

try {

    /* =====================================================
       LOAD AND LOCK CUSTOMER CART

       combo_choice_ids_json is now included.
    ===================================================== */

    $cartStmt = $conn->prepare("
        SELECT
            cart_id,
            restaurant_id,
            product_id,
            addon_ids_json AS addon_ids,
            combo_choice_ids_json,
            quantity

        FROM tbl_cart

        WHERE user_id = ?

        ORDER BY
            restaurant_id ASC,
            product_id ASC,
            cart_id ASC

        FOR UPDATE
    ");

    if (!$cartStmt) {
        throw new RuntimeException(
            "Unable to prepare cart validation."
        );
    }

    $cartStmt->bind_param(
        "i",
        $user_id
    );

    if (!$cartStmt->execute()) {
        $cartStmt->close();

        throw new RuntimeException(
            "Unable to load the cart."
        );
    }

    $cartResult =
        $cartStmt->get_result();

    $rawCartItems = [];

    while (
        $row =
            $cartResult->fetch_assoc()
    ) {
        $rawCartItems[] = $row;
    }

    $cartStmt->close();

    if (count($rawCartItems) === 0) {
        throw new RuntimeException(
            "Cart is empty."
        );
    }

    $restaurant_id = 0;

    $validatedItems = [];

    $total = 0.00;

    /* =====================================================
       VALIDATE EACH CART ITEM
    ===================================================== */

    foreach (
        $rawCartItems
        as $cartItem
    ) {
        $cart_id = (int)(
            $cartItem["cart_id"] ?? 0
        );

        $cartRestaurantId = (int)(
            $cartItem["restaurant_id"] ?? 0
        );

        $product_id = (int)(
            $cartItem["product_id"] ?? 0
        );

        $quantity = (int)(
            $cartItem["quantity"] ?? 0
        );

        if (
            $cart_id <= 0 ||
            $cartRestaurantId <= 0 ||
            $product_id <= 0 ||
            $quantity < 1 ||
            $quantity > 99
        ) {
            throw new RuntimeException(
                "An invalid cart item was found."
            );
        }

        /*
         * The entire cart must belong to one restaurant.
         */
        if ($restaurant_id === 0) {
            $restaurant_id =
                $cartRestaurantId;

        } elseif (
            $restaurant_id !==
            $cartRestaurantId
        ) {
            throw new RuntimeException(
                "Products from different restaurants cannot be checked out together."
            );
        }

        /* =================================================
           LOAD AND LOCK BASE PRODUCT
        ================================================= */

       $productStmt = $conn->prepare("
    SELECT
        product_id,
        restaurant_id,
        product_name,
        category,
        size,
        price,
        stock,
        status,

        discount_type,
        discount_value,
        discount_schedule,
        discount_start,
        discount_end,
        discount_status

    FROM tbl_products

    WHERE product_id = ?
      AND restaurant_id = ?

    LIMIT 1

    FOR UPDATE
");

        if (!$productStmt) {
            throw new RuntimeException(
                "Unable to prepare product validation."
            );
        }

        $productStmt->bind_param(
            "ii",
            $product_id,
            $restaurant_id
        );

        if (!$productStmt->execute()) {
            $productStmt->close();

            throw new RuntimeException(
                "Unable to validate a product."
            );
        }

        $productResult =
            $productStmt->get_result();

        $product =
            $productResult->fetch_assoc();

        $productStmt->close();

        if (!$product) {
            throw new RuntimeException(
                "A product in your cart no longer exists."
            );
        }

        $productName = trim(
            (string)(
                $product["product_name"] ??
                "Product"
            )
        );

        $productSize = trim(
            (string)(
                $product["size"] ?? ""
            )
        );

       /* =================================================
   AUTHORITATIVE PRODUCT PROMOTION PRICE
================================================= */

$regularBasePrice = round(
    max(
        0,
        (float)(
            $product["price"] ?? 0
        )
    ),
    2
);

$discountType = strtolower(
    trim(
        (string)(
            $product["discount_type"] ??
            "none"
        )
    )
);

if (
    !in_array(
        $discountType,
        [
            "none",
            "percentage",
            "fixed"
        ],
        true
    )
) {
    $discountType = "none";
}

$discountValue = round(
    max(
        0,
        (float)(
            $product["discount_value"] ??
            0
        )
    ),
    2
);

$discountSchedule = strtolower(
    trim(
        (string)(
            $product["discount_schedule"] ??
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
    $product["discount_start"] ??
    null;

$discountEnd =
    $product["discount_end"] ??
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

$discountStatus =
    strtolower(
        trim(
            (string)(
                $product["discount_status"] ??
                "inactive"
            )
        )
    ) === "active"
        ? "Active"
        : "Inactive";

$isDiscountActive = false;

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

        } catch (Throwable $error) {
            $isDiscountActive = false;
        }
    }
}

$basePrice =
    $regularBasePrice;

if ($isDiscountActive) {
    if (
        $discountType ===
        "percentage"
    ) {
        /*
         * Defensive protection in case invalid data
         * reaches checkout.
         */
        $safePercentage =
            min(
                100,
                $discountValue
            );

        $basePrice =
            $regularBasePrice -
            (
                $regularBasePrice *
                $safePercentage /
                100
            );

    } elseif (
        $discountType === "fixed"
    ) {
        $safeFixedDiscount =
            min(
                $regularBasePrice,
                $discountValue
            );

        $basePrice =
            $regularBasePrice -
            $safeFixedDiscount;
    }

    $basePrice = round(
        max(
            0,
            $basePrice
        ),
        2
    );
}

$discountSavings = round(
    max(
        0,
        $regularBasePrice -
        $basePrice
    ),
    2
);

$baseStock = (int)(
    $product["stock"] ?? 0
);

$baseStatus =
    $product["status"] ?? "";

        /* =================================================
           DETECT COMBO
        ================================================= */

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
            throw new RuntimeException(
                "Unable to prepare combo validation."
            );
        }

        $comboStmt->bind_param(
            "ii",
            $restaurant_id,
            $product_id
        );

        if (!$comboStmt->execute()) {
            $comboStmt->close();

            throw new RuntimeException(
                "Unable to validate the selected combo."
            );
        }

        $comboResult =
            $comboStmt->get_result();

        $combo =
            $comboResult->fetch_assoc();

        $comboStmt->close();

        $isCombo =
            is_array($combo);

        $combo_id = $isCombo
            ? (int)$combo["combo_id"]
            : null;

        if (
            $isCombo &&
            (int)$combo["is_active"] !== 1
        ) {
            throw new RuntimeException(
                "This combo is currently unavailable."
            );
        }

        if (!$isCombo) {
            /*
             * Normal products use their own stock.
             */
            if (
                !status_is_available($baseStatus) ||
                $baseStock < $quantity
            ) {
                throw new RuntimeException(
                    $productName .
                    " no longer has enough stock."
                );
            }
        }

        /* =================================================
           COMBO COMPONENTS AND CHOICES
        ================================================= */

        $comboComponents = [];
        $comboChoices = [];
        $comboChoiceTextParts = [];

        $comboChoicePriceAdjustment = 0.00;

        $comboChoiceIds = decode_id_array(
            $cartItem["combo_choice_ids_json"] ?? null
        );

        if ($isCombo) {

            /* =============================================
               LOAD AND VALIDATE FIXED COMBO COMPONENTS
            ============================================= */

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
                throw new RuntimeException(
                    "Unable to prepare combo components."
                );
            }

            $componentStmt->bind_param(
                "ii",
                $restaurant_id,
                $combo_id
            );

            if (!$componentStmt->execute()) {
                $componentStmt->close();

                throw new RuntimeException(
                    "Unable to validate combo components."
                );
            }

            $componentResult =
                $componentStmt->get_result();

            while (
                $component =
                    $componentResult->fetch_assoc()
            ) {
                $requiredPerPackage = (int)(
                    $component["required_quantity"] ?? 0
                );

                $componentStock = (int)(
                    $component["stock"] ?? 0
                );

                $requiredTotal =
                    $requiredPerPackage *
                    $quantity;

                if (
                    $requiredPerPackage <= 0 ||
                    !status_is_available(
                        $component["status"] ?? ""
                    ) ||
                    $componentStock < $requiredTotal
                ) {
                    $componentStmt->close();

                    throw new RuntimeException(
                        "Not enough stock for " .
                        ($component["product_name"] ??
                            "a combo component") .
                        " to prepare this combo quantity."
                    );
                }

                $comboComponents[] = [
                    "product_id" => (int)(
                        $component["product_id"] ?? 0
                    ),

                    "product_name" => trim(
                        (string)(
                            $component["product_name"] ??
                            "Combo component"
                        )
                    ),

                    /*
                     * This already includes ordered quantity.
                     *
                     * Example:
                     * component quantity = 2
                     * cart quantity = 3
                     * required total = 6
                     */
                    "required_total" =>
                        $requiredTotal
                ];
            }

            $componentStmt->close();

            if (count($comboComponents) === 0) {
                throw new RuntimeException(
                    "This combo has no configured components."
                );
            }

            /* =============================================
               LOAD ACTIVE COMBO CHOICE GROUPS
            ============================================= */

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
                throw new RuntimeException(
                    "Unable to prepare combo choice groups."
                );
            }

            $groupStmt->bind_param(
                "i",
                $combo_id
            );

            if (!$groupStmt->execute()) {
                $groupStmt->close();

                throw new RuntimeException(
                    "Unable to load combo choice groups."
                );
            }

            $groupResult =
                $groupStmt->get_result();

            $groups = [];

            while (
                $group =
                    $groupResult->fetch_assoc()
            ) {
                $groupId = (int)(
                    $group["choice_group_id"] ?? 0
                );

                if ($groupId <= 0) {
                    continue;
                }

                $groups[$groupId] = [
                    "choice_group_id" =>
                        $groupId,

                    "group_name" => trim(
                        (string)(
                            $group["group_name"] ??
                            "Combo choice"
                        )
                    ),

                    "min_select" => max(
                        0,
                        (int)(
                            $group["min_select"] ?? 0
                        )
                    ),

                    "max_select" => max(
                        0,
                        (int)(
                            $group["max_select"] ?? 0
                        )
                    ),

                    "is_required" =>
                        (int)(
                            $group["is_required"] ?? 0
                        ) === 1,

                    "selected" => []
                ];
            }

            $groupStmt->close();

            /* =============================================
               VALIDATE EVERY SELECTED COMBO OPTION

               Stored IDs are choice_option_id values.
            ============================================= */

            if (!empty($comboChoiceIds)) {
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
                    throw new RuntimeException(
                        "Unable to prepare combo option validation."
                    );
                }

                foreach (
                    $comboChoiceIds
                    as $choiceOptionId
                ) {
                    $optionStmt->bind_param(
                        "iii",
                        $combo_id,
                        $restaurant_id,
                        $choiceOptionId
                    );

                    if (!$optionStmt->execute()) {
                        $optionStmt->close();

                        throw new RuntimeException(
                            "Unable to validate a combo option."
                        );
                    }

                    $optionResult =
                        $optionStmt->get_result();

                    $option =
                        $optionResult->fetch_assoc();

                    if (!$option) {
                        $optionStmt->close();

                        throw new RuntimeException(
                            "One or more combo selections are invalid."
                        );
                    }

                    $groupId = (int)(
                        $option["choice_group_id"] ?? 0
                    );

                    if (
                        $groupId <= 0 ||
                        !isset($groups[$groupId])
                    ) {
                        $optionStmt->close();

                        throw new RuntimeException(
                            "A selected option does not belong to this combo."
                        );
                    }

                    $optionStock = (int)(
                        $option["stock"] ?? 0
                    );

                    if (
                        !status_is_available(
                            $option["status"] ?? ""
                        ) ||
                        $optionStock < $quantity
                    ) {
                        $optionStmt->close();

                        throw new RuntimeException(
                            trim(
                                (string)(
                                    $option["product_name"] ??
                                    "The selected combo option"
                                )
                            ) .
                            " does not have enough stock for this combo quantity."
                        );
                    }

                    $optionProductName = trim(
                        (string)(
                            $option["product_name"] ??
                            "Combo option"
                        )
                    );

                    $optionSize = trim(
                        (string)(
                            $option["size"] ?? ""
                        )
                    );

                    $optionText =
                        $optionProductName;

                    if ($optionSize !== "") {
                        $optionText .=
                            " - " .
                            $optionSize;
                    }

                    $validatedChoice = [
                        "choice_option_id" => (int)(
                            $option["choice_option_id"] ?? 0
                        ),

                        "choice_group_id" =>
                            $groupId,

                        "product_id" => (int)(
                            $option["product_id"] ?? 0
                        ),

                        "product_name" =>
                            $optionProductName,

                        "size" =>
                            $optionSize,

                        "text" =>
                            $optionText,

                        "price_adjustment" => (float)(
                            $option["price_adjustment"] ?? 0
                        )
                    ];

                    $groups[
                        $groupId
                    ]["selected"][] =
                        $validatedChoice;
                }

                $optionStmt->close();
            }

            /* =============================================
               ENFORCE GROUP MINIMUM AND MAXIMUM RULES
            ============================================= */

            foreach (
                $groups
                as $group
            ) {
                $selectedCount = count(
                    $group["selected"]
                );

                $minimum = max(
                    0,
                    (int)$group["min_select"]
                );

                $maximum = max(
                    $minimum,
                    (int)$group["max_select"]
                );

                if (
                    $selectedCount < $minimum ||
                    $selectedCount > $maximum
                ) {
                    throw new RuntimeException(
                        $group["group_name"] .
                        " requires between " .
                        $minimum .
                        " and " .
                        $maximum .
                        " selection(s)."
                    );
                }

                if (
                    $group["is_required"] &&
                    $selectedCount < $minimum
                ) {
                    throw new RuntimeException(
                        $group["group_name"] .
                        " is required."
                    );
                }

                foreach (
                    $group["selected"]
                    as $selectedChoice
                ) {
                    $comboChoices[] =
                        $selectedChoice;

                    $comboChoiceTextParts[] =
                        $selectedChoice["text"];

                    $comboChoicePriceAdjustment +=
                        (float)(
                            $selectedChoice[
                                "price_adjustment"
                            ] ?? 0
                        );
                }
            }

            /*
             * A combo without choice groups must reject
             * unexpected combo option IDs.
             */
            if (
                count($groups) === 0 &&
                !empty($comboChoiceIds)
            ) {
                throw new RuntimeException(
                    "This combo does not accept selectable options."
                );
            }

        } elseif (!empty($comboChoiceIds)) {
            /*
             * Normal products cannot accept fake combo IDs.
             */
            throw new RuntimeException(
                "This product does not accept combo selections."
            );
        }

        /* =================================================
           VALIDATE ADD-ONS
        ================================================= */

        $addonIds = decode_id_array(
            $cartItem["addon_ids"] ?? null
        );

        $validatedAddons = [];
        $addonTextParts = [];

        $addonUnitTotal = 0.00;

        foreach ($addonIds as $addonId) {
            $addonStmt = $conn->prepare("
                SELECT
                    product_id,
                    product_name,
                    category,
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
                throw new RuntimeException(
                    "Unable to prepare add-on validation."
                );
            }

            $addonStmt->bind_param(
                "ii",
                $addonId,
                $restaurant_id
            );

            if (!$addonStmt->execute()) {
                $addonStmt->close();

                throw new RuntimeException(
                    "Unable to validate an add-on."
                );
            }

            $addonResult =
                $addonStmt->get_result();

            $addon =
                $addonResult->fetch_assoc();

            $addonStmt->close();

            if (!$addon) {
                throw new RuntimeException(
                    "A selected add-on no longer exists."
                );
            }

            $addonName = trim(
                (string)(
                    $addon["product_name"] ??
                    "Add-on"
                )
            );

            if (
                !status_is_available(
                    $addon["status"] ?? ""
                )
            ) {
                throw new RuntimeException(
                    $addonName .
                    " is currently unavailable."
                );
            }

            if (
                !product_allows_addon(
                    $conn,
                    $restaurant_id,
                    $product_id,
                    (int)$addon["product_id"]
                )
            ) {
                throw new RuntimeException(
                    "This add-on is not available for the selected menu item."
                );
            }

            $addonPrice = (float)(
                $addon["price"] ?? 0
            );

            $validatedAddons[] = [
                "product_id" => (int)(
                    $addon["product_id"] ?? 0
                ),

                "product_name" =>
                    $addonName,

                "price" =>
                    $addonPrice
            ];

            $addonTextParts[] =
                $addonName;

            $addonUnitTotal +=
                $addonPrice;
        }

        /* =================================================
           AUTHORITATIVE BACKEND PRICE
        ================================================= */

        $unitPrice = round(
    max(
        0,
        $basePrice +
        $comboChoicePriceAdjustment +
        $addonUnitTotal
    ),
    2
);

$lineSubtotal = round(
    $unitPrice *
    $quantity,
    2
);

$total +=
    $lineSubtotal;

        /* =================================================
           SAVE VALIDATED ITEM IN MEMORY

           Nothing is inserted yet.
        ================================================= */

        $validatedItems[] = [
            "cart_id" =>
                $cart_id,

            "product_id" =>
                $product_id,

            "product_name" =>
                $productName,

            "size" =>
                $productSize,

            "quantity" =>
                $quantity,

            "combo_id" =>
                $combo_id,

            "is_combo" =>
                $isCombo,

            "combo_components" =>
                $comboComponents,

            "combo_choices" =>
                $comboChoices,

            "combo_choice_ids" =>
                $comboChoiceIds,

            "combo_choice_text" =>
                implode(
                    ", ",
                    $comboChoiceTextParts
                ),

            "addons" =>
                $validatedAddons,

            "addon_ids" =>
                $addonIds,

            "addon_text" =>
                !empty($addonTextParts)
                    ? implode(
                        ", ",
                        $addonTextParts
                    )
                    : "No Add-on",

            "regular_base_price" =>
    $regularBasePrice,

"discounted_base_price" =>
    $basePrice,

"discount_type" =>
    $discountType,

"discount_value" =>
    $discountValue,

"discount_savings" =>
    $discountSavings,

"is_discount_active" =>
    $isDiscountActive,

"unit_price" =>
    $unitPrice,

"subtotal" =>
    $lineSubtotal
        ];
    }

    if ($restaurant_id <= 0) {
        throw new RuntimeException(
            "Unable to determine the restaurant."
        );
    }

    /* =====================================================
       RESTAURANT ORDER TYPE AVAILABILITY

       Never rely only on the checkout dropdown. The backend
       verifies that this restaurant actually enabled the
       requested Dine-in, Takeout, or Delivery service.
    ===================================================== */

    $orderTypesStmt = $conn->prepare("
        SELECT
            order_types_json

        FROM tbl_restaurants

        WHERE restaurant_id = ?

        LIMIT 1
    ");

    if (!$orderTypesStmt) {
        throw new RuntimeException(
            "Unable to validate restaurant order types."
        );
    }

    $orderTypesStmt->bind_param(
        "i",
        $restaurant_id
    );

    if (!$orderTypesStmt->execute()) {
        $orderTypesStmt->close();

        throw new RuntimeException(
            "Unable to validate restaurant order types."
        );
    }

    $orderTypesRow =
        $orderTypesStmt
            ->get_result()
            ->fetch_assoc();

    $orderTypesStmt->close();

    if (!$orderTypesRow) {
        throw new RuntimeException(
            "The selected restaurant no longer exists."
        );
    }

    /*
     * Backward-compatible fallback for existing restaurants.
     * The migration also fills these records with all three
     * order types, but this keeps checkout safe if a legacy
     * NULL/invalid value is encountered.
     */
    $restaurantOrderTypes = [
        "dine-in",
        "takeout",
        "delivery"
    ];

    $decodedRestaurantOrderTypes = json_decode(
        (string)(
            $orderTypesRow["order_types_json"] ?? ""
        ),
        true
    );

    if (is_array($decodedRestaurantOrderTypes)) {
        $cleanRestaurantOrderTypes = array_values(
            array_unique(
                array_intersect(
                    $decodedRestaurantOrderTypes,
                    $allowedTypes
                )
            )
        );

        if (!empty($cleanRestaurantOrderTypes)) {
            $restaurantOrderTypes =
                $cleanRestaurantOrderTypes;
        }
    }

    if (
        !in_array(
            $order_type,
            $restaurantOrderTypes,
            true
        )
    ) {
        throw new DomainException(
            "This order type is not available for this restaurant."
        );
    }

        /* =====================================================
       DELIVERY RIDER AVAILABILITY

       Delivery orders are accepted only when the restaurant
       currently has at least one available internal rider.

       Internal riders must:
       - belong to this restaurant
       - have role = delivery_staff
       - have status = 1
       - have no active delivery assignment
    ===================================================== */

    if ($order_type === "delivery") {
        $availableRiderStmt = $conn->prepare("
            SELECT
                riders.user_id

            FROM tbl_users AS riders

            WHERE riders.restaurant_id = ?
              AND riders.role = 'delivery_staff'
              AND riders.status = 1

              AND NOT EXISTS (
                    SELECT
                        1

                    FROM tbl_delivery_assignments
                        AS assignments

                    WHERE assignments.delivery_staff_id =
                            riders.user_id

                      AND assignments.restaurant_id =
                            riders.restaurant_id

                      AND assignments.delivery_status
                            NOT IN (
                                'completed',
                                'cancelled'
                            )
              )

            ORDER BY riders.user_id ASC

            LIMIT 1

            FOR UPDATE
        ");

        if (!$availableRiderStmt) {
            throw new RuntimeException(
                "Unable to prepare delivery availability validation."
            );
        }

        $availableRiderStmt->bind_param(
            "i",
            $restaurant_id
        );

        if (!$availableRiderStmt->execute()) {
            $availableRiderStmt->close();

            throw new RuntimeException(
                "Unable to verify delivery availability."
            );
        }

        $availableRiderResult =
            $availableRiderStmt->get_result();

        $availableRider =
            $availableRiderResult->fetch_assoc();

        $availableRiderStmt->close();

        if (!$availableRider) {
            throw new RuntimeException(
                "No delivery rider is currently available for this restaurant. Please choose Takeout or Dine-in."
            );
        }
    }
    
    /* =====================================================
       LOCK RESTAURANT FOR QUEUE GENERATION
    ===================================================== */

    $restaurantLockStmt = $conn->prepare("
    SELECT
        r.restaurant_id,
        r.delivery_fee,
        r.business_status,
        r.setup_completed,
        r.customer_visibility,
        owner.status AS owner_status,
        owner.is_verified AS owner_is_verified

    FROM tbl_restaurants AS r

    INNER JOIN tbl_users AS owner
        ON owner.user_id = r.owner_id
        AND owner.role = 'owner'

    WHERE r.restaurant_id = ?

    LIMIT 1

    FOR UPDATE
");

    if (!$restaurantLockStmt) {
        throw new RuntimeException(
            "Unable to prepare restaurant validation."
        );
    }

    $restaurantLockStmt->bind_param(
        "i",
        $restaurant_id
    );

    if (!$restaurantLockStmt->execute()) {
        $restaurantLockStmt->close();

        throw new RuntimeException(
            "Unable to validate the restaurant."
        );
    }

    $restaurantLockResult =
        $restaurantLockStmt->get_result();

    $restaurantRow =
        $restaurantLockResult->fetch_assoc();

    $restaurantLockStmt->close();

    if (!$restaurantRow) {
        throw new RuntimeException(
            "The selected restaurant no longer exists."
        );
    }

    if (
    (int) (
        $restaurantRow["owner_status"]
        ?? 0
    ) !== 1 ||
    (int) (
        $restaurantRow["owner_is_verified"]
        ?? 0
    ) !== 1
) {
    throw new RuntimeException(
        "This restaurant is currently unavailable on FoodConnect."
    );
}

if (
    (int) (
        $restaurantRow["setup_completed"]
        ?? 0
    ) !== 1 ||
    strcasecmp(
        trim((string)($restaurantRow["customer_visibility"] ?? "Hidden")),
        "Visible"
    ) !== 0
) {
    throw new RuntimeException(
        "This restaurant is not currently available for public ordering."
    );
}

if (
    strtolower(
        trim(
            (string) (
                $restaurantRow["business_status"]
                ?? "Closed"
            )
        )
    ) !== "open"
) {
    throw new RuntimeException(
        "This restaurant is not currently accepting orders."
    );
}

    /* =====================================================
   AUTHORITATIVE ORDER TOTAL

   Product prices were already validated from the database.

   Delivery fee:
   - comes directly from tbl_restaurants
   - is added only for delivery
   - is never trusted from JavaScript
===================================================== */

$subtotal = round(
    $total,
    2
);

$delivery_fee = 0.00;

if ($order_type === "delivery") {
    $delivery_fee = max(
        0,
        (float)(
            $restaurantRow["delivery_fee"] ?? 0
        )
    );
}

$total = round(
    $subtotal +
    $delivery_fee,
    2
);

    /* =====================================================
       GENERATE DAILY RESTAURANT QUEUE NUMBER
    ===================================================== */

    $queueStmt = $conn->prepare("
        SELECT
            COALESCE(
                MAX(queue_number),
                0
            ) + 1 AS next_queue

        FROM tbl_orders

        WHERE restaurant_id = ?
          AND DATE(created_at) = CURDATE()
    ");

    if (!$queueStmt) {
        throw new RuntimeException(
            "Unable to prepare the queue number."
        );
    }

    $queueStmt->bind_param(
        "i",
        $restaurant_id
    );

    if (!$queueStmt->execute()) {
        $queueStmt->close();

        throw new RuntimeException(
            "Unable to generate the queue number."
        );
    }

    $queueResult =
        $queueStmt->get_result();

    $queueRow =
        $queueResult->fetch_assoc();

    $queueStmt->close();

    $queue_number = (int)(
        $queueRow["next_queue"] ?? 1
    );

    if ($queue_number <= 0) {
        $queue_number = 1;
    }

    /* =====================================================
       CREATE ORDER HEADER
    ===================================================== */

    $order_qr_token = bin2hex(
    random_bytes(32)
);

/*
 * Dine-in and Takeout QR codes expire
 * exactly 20 minutes after checkout.
 *
 * Delivery orders do not use cashier QR
 * verification, so their expiration stays NULL.
 */
$order_qr_expires_at = null;

$normalizedQrOrderType = strtolower(
    trim($order_type)
);

if ($normalizedQrOrderType === "take-out") {
    $normalizedQrOrderType = "takeout";
}

if (
    in_array(
        $normalizedQrOrderType,
        [
            "dine-in",
            "dinein",
            "takeout"
        ],
        true
    )
) {
    $order_qr_expires_at =
        date(
            "Y-m-d H:i:s",
            time() + (20 * 60)
        );
}

$payment_status =
    $payment_method === "PayMongo QR Ph"
        ? "pending"
        : "cash_pending";

   $insertOrderStmt = $conn->prepare("
        INSERT INTO tbl_orders (
        queue_number,
        order_qr_token,
        qr_expires_at,
        restaurant_id,
        user_id,
        customer_name,
        contact_number,
        order_type,
        payment_method,
        payment_status,
        address,
        landmark,
        customer_latitude,
        customer_longitude,
        table_number,
        notes,
        order_status,
        subtotal,
        delivery_fee,
        total_amount
    )
       VALUES (
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        
        ?,
        'pending',
        ?,
        ?,
        ?
    )
");

if (!$insertOrderStmt) {
    throw new RuntimeException(
        "Unable to prepare the order."
    );
}

$insertOrderStmt->bind_param(
"issiisssssssddssddd",
    $queue_number,
    $order_qr_token,
    $order_qr_expires_at,
    $restaurant_id,
    $user_id,
    $customer_name,
    $contact_number,
    $order_type,
    $payment_method,
    $payment_status,
    $address,
    $landmark,
    $customer_latitude,
    $customer_longitude,
    $table_number,
    $notes,
    $subtotal,
    $delivery_fee,
    $total
);

    if (!$insertOrderStmt->execute()) {
        $insertOrderStmt->close();

        throw new RuntimeException(
            "Unable to create the order."
        );
    }

    $order_id = (int)(
        $insertOrderStmt->insert_id
    );

    $insertOrderStmt->close();

    if ($order_id <= 0) {
        throw new RuntimeException(
            "Unable to determine the new order."
        );
    }

    /* =====================================================
       PREPARE STOCK DEDUCTION

       Used for:
       - normal products
       - combo fixed components
       - selected combo options
       - add-ons
    ===================================================== */

    $deductStockStmt = $conn->prepare("
        UPDATE tbl_products

        SET
            stock = stock - ?,

            status = CASE
                WHEN stock - ? <= 0
                    THEN 'Unavailable'
                ELSE status
            END

        WHERE product_id = ?
          AND restaurant_id = ?
          AND stock >= ?
          AND LOWER(status) = 'available'
    ");

    if (!$deductStockStmt) {
        throw new RuntimeException(
            "Unable to prepare stock deduction."
        );
    }

    /* =====================================================
       PREPARE ORDER ITEM INSERT

       Stores combo selections permanently.
    ===================================================== */

    $insertItemStmt = $conn->prepare("
    INSERT INTO tbl_order_items (
        order_id,
        product_id,
        combo_id,
        quantity,
        price,
        regular_price,
        discount_type,
        discount_value,
        discount_savings,
        discount_applied,
        product_name,
        variant_text,
        addon_text,
        addon_ids_json,
        combo_choice_text,
        combo_choice_ids_json
    )
    VALUES (
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?
    )
");

    if (!$insertItemStmt) {
        $deductStockStmt->close();

        throw new RuntimeException(
            "Unable to prepare order items."
        );
    }

    /* =====================================================
       PROCESS EVERY VALIDATED ITEM
    ===================================================== */

    foreach (
        $validatedItems
        as $item
    ) {
        $product_id = (int)(
            $item["product_id"] ?? 0
        );

        $quantity = (int)(
            $item["quantity"] ?? 0
        );

        $isCombo = (bool)(
            $item["is_combo"] ?? false
        );

        if (
            $product_id <= 0 ||
            $quantity <= 0
        ) {
            throw new RuntimeException(
                "An invalid validated item was found."
            );
        }

        /* =================================================
           NORMAL PRODUCT STOCK

           Combo parent products do not use their own stock.
           Their availability comes from components and choices.
        ================================================= */

        if (!$isCombo) {
            $deductQuantity =
                $quantity;

            $deductStockStmt->bind_param(
                "iiiii",
                $deductQuantity,
                $deductQuantity,
                $product_id,
                $restaurant_id,
                $deductQuantity
            );

            if (!$deductStockStmt->execute()) {
                throw new RuntimeException(
                    "Unable to deduct product stock."
                );
            }

            if (
                $deductStockStmt->affected_rows !== 1
            ) {
                throw new RuntimeException(
                    ($item["product_name"] ??
                        "A product") .
                    " no longer has enough stock."
                );
            }
        }

        /* =================================================
           COMBO FIXED COMPONENT STOCK
        ================================================= */

        if ($isCombo) {
            foreach (
                $item["combo_components"] ?? []
                as $component
            ) {
                $componentProductId = (int)(
                    $component["product_id"] ?? 0
                );

                $requiredTotal = (int)(
                    $component["required_total"] ?? 0
                );

                if (
                    $componentProductId <= 0 ||
                    $requiredTotal <= 0
                ) {
                    throw new RuntimeException(
                        "An invalid combo component was found."
                    );
                }

                $deductStockStmt->bind_param(
                    "iiiii",
                    $requiredTotal,
                    $requiredTotal,
                    $componentProductId,
                    $restaurant_id,
                    $requiredTotal
                );

                if (!$deductStockStmt->execute()) {
                    throw new RuntimeException(
                        "Unable to deduct combo component stock."
                    );
                }

                if (
                    $deductStockStmt->affected_rows !== 1
                ) {
                    throw new RuntimeException(
                        ($component["product_name"] ??
                            "A combo component") .
                        " no longer has enough stock."
                    );
                }
            }

            /* =============================================
               SELECTED COMBO OPTION STOCK

               Each selected option is needed once per
               ordered combo quantity.
            ============================================= */

            foreach (
                $item["combo_choices"] ?? []
                as $choice
            ) {
                $choiceProductId = (int)(
                    $choice["product_id"] ?? 0
                );

                if ($choiceProductId <= 0) {
                    throw new RuntimeException(
                        "An invalid combo option was found."
                    );
                }

                $deductStockStmt->bind_param(
                    "iiiii",
                    $quantity,
                    $quantity,
                    $choiceProductId,
                    $restaurant_id,
                    $quantity
                );

                if (!$deductStockStmt->execute()) {
                    throw new RuntimeException(
                        "Unable to deduct combo option stock."
                    );
                }

                if (
                    $deductStockStmt->affected_rows !== 1
                ) {
                    throw new RuntimeException(
                        ($choice["product_name"] ??
                            "A combo option") .
                        " no longer has enough stock."
                    );
                }
            }
        }

        /* =================================================
           ADD-ONS HAVE NO STOCK / QUANTITY

           Add-ons affect price and the saved order description only.
           They are intentionally not deducted from inventory.
        ================================================= */

        /* =================================================
           PREPARE ORDER ITEM VALUES
        ================================================= */

        $comboIdValue =
            !empty($item["combo_id"])
                ? (int)$item["combo_id"]
                : null;

        $productName = trim(
            (string)(
                $item["product_name"] ??
                "Item"
            )
        );

        $baseText = trim(
            (string)(
                $item["size"] ?? ""
            )
        );

        $addonText = trim(
            (string)(
                $item["addon_text"] ??
                "No Add-on"
            )
        );

        if ($addonText === "") {
            $addonText = "No Add-on";
        }

        $comboChoiceText = trim(
            (string)(
                $item["combo_choice_text"] ??
                ""
            )
        );

        $unitPrice = round(
    max(
        0,
        (float)(
            $item["unit_price"] ?? 0
        )
    ),
    2
);

$regularPriceSnapshot = round(
    max(
        0,
        (float)(
            $item[
                "regular_base_price"
            ] ?? $unitPrice
        )
    ),
    2
);

$discountTypeSnapshot = strtolower(
    trim(
        (string)(
            $item[
                "discount_type"
            ] ?? "none"
        )
    )
);

if (
    !in_array(
        $discountTypeSnapshot,
        [
            "none",
            "percentage",
            "fixed"
        ],
        true
    )
) {
    $discountTypeSnapshot = "none";
}

$discountValueSnapshot = round(
    max(
        0,
        (float)(
            $item[
                "discount_value"
            ] ?? 0
        )
    ),
    2
);

$discountSavingsSnapshot = round(
    max(
        0,
        (float)(
            $item[
                "discount_savings"
            ] ?? 0
        )
    ),
    2
);

$discountAppliedSnapshot =
    !empty(
        $item[
            "is_discount_active"
        ]
    ) &&
    $discountSavingsSnapshot > 0
        ? 1
        : 0;

$addonIdsJson = encode_id_array(
            $item["addon_ids"] ?? []
        );

        $comboChoiceIdsJson = encode_id_array(
            $item["combo_choice_ids"] ?? []
        );

        /* =================================================
           INSERT ORDER ITEM

           combo_id is nullable, so bind it as an integer
           variable with null allowed by mysqli.
        ================================================= */

        $insertItemStmt->bind_param(
    "iiiiddsddissssss",
    $order_id,
    $product_id,
    $comboIdValue,
    $quantity,
    $unitPrice,
    $regularPriceSnapshot,
    $discountTypeSnapshot,
    $discountValueSnapshot,
    $discountSavingsSnapshot,
    $discountAppliedSnapshot,
    $productName,
    $baseText,
    $addonText,
    $addonIdsJson,
    $comboChoiceText,
    $comboChoiceIdsJson
);

        if (!$insertItemStmt->execute()) {
            throw new RuntimeException(
                "Unable to save an order item."
            );
        }
    }

    $deductStockStmt->close();
    $insertItemStmt->close();

        /* =====================================================
       CLEAR THIS CUSTOMER'S CART
    ===================================================== */

    $clearCartStmt = $conn->prepare("
        DELETE FROM tbl_cart

        WHERE user_id = ?
          AND restaurant_id = ?
    ");

    if (!$clearCartStmt) {
        throw new RuntimeException(
            "Unable to prepare cart clearing."
        );
    }

    $clearCartStmt->bind_param(
        "ii",
        $user_id,
        $restaurant_id
    );

    if (!$clearCartStmt->execute()) {
        $clearCartStmt->close();

        throw new RuntimeException(
            "Unable to clear the cart."
        );
    }

    $clearCartStmt->close();

    /* =====================================================
       COMMIT ORDER, STOCK, ITEMS, AND CART CLEARING
    ===================================================== */

    $conn->commit();

    /* =====================================================
       ACTIVITY LOG

       Logging happens after commit. A logging failure must
       not cancel an already successful customer order.
    ===================================================== */

    /*
     * PayMongo orders are not announced to the cashier until
     * PayMongo has actually confirmed payment. The webhook /
     * return-sync creates this same New Customer Order log
     * after payment is confirmed.
     */
    if ($payment_method !== "PayMongo QR Ph") {
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
            'customer',
            'order',
            ?,
            ?
        )
    ");

    if ($logStmt) {
        $logTitle =
            "New Customer Order";

        $logDescription =
            $customer_name .
            " placed Order #" .
            $order_id .
            " / Queue #" .
            $queue_number .
            ".";

        $logStmt->bind_param(
            "iiss",
            $restaurant_id,
            $user_id,
            $logTitle,
            $logDescription
        );

        if (!$logStmt->execute()) {
            error_log(
                "FoodConnect activity log error: " .
                $logStmt->error
            );
        }

        $logStmt->close();
    }
    }

    /* =====================================================
       SUCCESS RESPONSE
    ===================================================== */

   respond_json([
    "success" => true,
    "message" =>
        "Checkout successful.",

    "order_id" =>
        $order_id,

    "queue_number" =>
        $queue_number,

        "order_qr_token" =>
    $order_qr_token,

"order_qr_value" =>
    "FOODCONNECT_ORDER:" .
    $order_qr_token,

"qr_expires_at" =>
    $order_qr_expires_at,

"payment_method" =>
        $payment_method,

"payment_status" =>
        $payment_status,

"payment_required" =>
        $payment_method === "PayMongo QR Ph",

"payment_requires_qr_first" =>
        $payment_method === "PayMongo QR Ph" &&
        in_array(
            $normalizedQrOrderType,
            ["dine-in", "dinein", "takeout"],
            true
        ),

"subtotal" =>
        round($subtotal, 2),

    "delivery_fee" =>
        round($delivery_fee, 2),

    "total_amount" =>
        round($total, 2)
]);

} catch (Throwable $exception) {

    /*
     * Roll back only when the transaction is still active.
     * This protects against an error after a successful commit.
     */
    try {
        $conn->rollback();
    } catch (Throwable $rollbackException) {
        error_log(
            "FoodConnect rollback error: " .
            $rollbackException->getMessage()
        );
    }

    error_log(
        "FoodConnect checkout error: " .
        $exception->getMessage()
    );

    $customerMessage =
        $exception->getMessage();

    /*
     * Only return validation messages created by this file.
     * Raw SQL and database errors remain in the PHP log.
     */
    $safeExactMessages = [
        "Cart is empty.",
        "An invalid cart item was found.",
        "An invalid validated item was found.",
        "An invalid combo component was found.",
        "An invalid combo option was found.",
        "An invalid add-on was found.",
        "Unable to determine the restaurant.",
        "This order type is not available for this restaurant.",
        "No delivery rider is currently available for this restaurant. Please choose Takeout or Dine-in.",
        "Products from different restaurants cannot be checked out together.",
        "A product in your cart no longer exists.",
        "This combo is currently unavailable.",
        "This combo has no configured components.",
        "One or more combo selections are invalid.",
        "A selected option does not belong to this combo.",
        "This combo does not accept selectable options.",
        "This product does not accept combo selections.",
        "A selected add-on no longer exists.",
        "The selected restaurant no longer exists."
    ];

    $isSafeMessage =
        in_array(
            $customerMessage,
            $safeExactMessages,
            true
        ) ||

        strpos(
            $customerMessage,
            "does not have enough stock"
        ) !== false ||

        strpos(
            $customerMessage,
            "no longer has enough stock"
        ) !== false ||

        strpos(
            $customerMessage,
            "requires between"
        ) !== false ||

        strpos(
            $customerMessage,
            " is required."
        ) !== false;

    respond_json([
        "success" => false,
        "message" => $isSafeMessage
            ? $customerMessage
            : "Checkout failed. Please try again."
    ], 400);
}