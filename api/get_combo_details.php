<?php

header("Content-Type: application/json; charset=utf-8");

error_reporting(E_ALL & ~E_NOTICE & ~E_WARNING);
ini_set("display_errors", "0");

session_set_cookie_params(0, "/FoodConnect", "", false, true);
require_once __DIR__ . "/session_config.php";

require_once __DIR__ . "/db.php";

function respond_json($data, $statusCode = 200)
{
    http_response_code($statusCode);
    echo json_encode($data);
    exit;
}

if (empty($_SESSION["user_id"])) {
    respond_json([
        "success" => false,
        "message" => "Please login first."
    ], 401);
}

$product_id = isset($_GET["product_id"])
    ? (int) $_GET["product_id"]
    : 0;

if ($product_id <= 0) {
    respond_json([
        "success" => false,
        "message" => "Invalid product ID."
    ], 400);
}

/* =========================================================
   LOAD SELLABLE PRODUCT AND COMBO HEADER
========================================================= */

$comboStmt = $conn->prepare("
    SELECT
        c.combo_id,
        c.restaurant_id,
        c.product_id,
        c.combo_name,
        c.combo_price,
        c.is_active,

        p.product_name,
        p.category,
        p.size,
        p.price,
        p.status

    FROM tbl_combos c

    INNER JOIN tbl_products p
        ON p.product_id = c.product_id
       AND p.restaurant_id = c.restaurant_id

    WHERE c.product_id = ?
      AND c.is_active = 1

    LIMIT 1
");

if (!$comboStmt) {
    respond_json([
        "success" => false,
        "message" => "Unable to prepare combo lookup."
    ], 500);
}

$comboStmt->bind_param("i", $product_id);

if (!$comboStmt->execute()) {
    $comboStmt->close();

    respond_json([
        "success" => false,
        "message" => "Unable to load combo information."
    ], 500);
}

$comboResult = $comboStmt->get_result();
$combo = $comboResult->fetch_assoc();

$comboStmt->close();

if (!$combo) {
    respond_json([
        "success" => true,
        "is_combo" => false,
        "combo" => null
    ]);
}

$combo_id = (int) $combo["combo_id"];
$restaurant_id = (int) $combo["restaurant_id"];

/* =========================================================
   LOAD FIXED COMPONENTS
========================================================= */

$componentStmt = $conn->prepare("
    SELECT
        ci.combo_item_id,
        ci.product_id,
        ci.quantity,

        p.product_name,
        p.category,
        p.size,
        p.stock,
        p.status

    FROM tbl_combo_items ci

    INNER JOIN tbl_products p
        ON p.product_id = ci.product_id
       AND p.restaurant_id = ?

    WHERE ci.combo_id = ?

    ORDER BY
        ci.combo_item_id ASC
");

if (!$componentStmt) {
    respond_json([
        "success" => false,
        "message" => "Unable to prepare combo components."
    ], 500);
}

$componentStmt->bind_param(
    "ii",
    $restaurant_id,
    $combo_id
);

if (!$componentStmt->execute()) {
    $componentStmt->close();

    respond_json([
        "success" => false,
        "message" => "Unable to load combo components."
    ], 500);
}

$componentResult = $componentStmt->get_result();
$components = [];

while ($component = $componentResult->fetch_assoc()) {
    $components[] = [
        "combo_item_id" =>
            (int) $component["combo_item_id"],

        "product_id" =>
            (int) $component["product_id"],

        "product_name" =>
            $component["product_name"],

        "category" =>
            $component["category"],

        "size" =>
            $component["size"] ?? "",

        "required_quantity" =>
            (int) $component["quantity"],

        "stock" =>
            (int) $component["stock"],

        "status" =>
            $component["status"]
    ];
}

$componentStmt->close();

/* =========================================================
   LOAD CHOICE GROUPS
========================================================= */

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
");

if (!$groupStmt) {
    respond_json([
        "success" => false,
        "message" => "Unable to prepare combo choices."
    ], 500);
}

$groupStmt->bind_param("i", $combo_id);

if (!$groupStmt->execute()) {
    $groupStmt->close();

    respond_json([
        "success" => false,
        "message" => "Unable to load combo choices."
    ], 500);
}

$groupResult = $groupStmt->get_result();
$choiceGroups = [];

$optionStmt = $conn->prepare("
    SELECT
        o.choice_option_id,
        o.product_id,
        o.price_adjustment,

        p.product_name,
        p.category,
        p.size,
        p.stock,
        p.status

    FROM tbl_combo_choice_options o

    INNER JOIN tbl_products p
        ON p.product_id = o.product_id
       AND p.restaurant_id = ?

    WHERE o.choice_group_id = ?
      AND o.is_active = 1

    ORDER BY
        p.product_name ASC,
        p.size ASC,
        p.product_id ASC
");

if (!$optionStmt) {
    $groupStmt->close();

    respond_json([
        "success" => false,
        "message" => "Unable to prepare combo choice options."
    ], 500);
}

while ($group = $groupResult->fetch_assoc()) {
    $choice_group_id =
        (int) $group["choice_group_id"];

    $optionStmt->bind_param(
        "ii",
        $restaurant_id,
        $choice_group_id
    );

    if (!$optionStmt->execute()) {
        continue;
    }

    $optionResult = $optionStmt->get_result();
    $options = [];

    while ($option = $optionResult->fetch_assoc()) {
        $stock = (int) $option["stock"];

        $status = strtolower(
            trim((string) $option["status"])
        );

        $available =
            $stock > 0 &&
            $status === "available";

        $options[] = [
            "choice_option_id" =>
                (int) $option["choice_option_id"],

            "product_id" =>
                (int) $option["product_id"],

            "product_name" =>
                $option["product_name"],

            "category" =>
                $option["category"],

            "size" =>
                $option["size"] ?? "",

            "price_adjustment" =>
                (float) $option["price_adjustment"],

            "stock" =>
                $stock,

            "status" =>
                $option["status"],

            "available" =>
                $available
        ];
    }

    $choiceGroups[] = [
        "choice_group_id" =>
            $choice_group_id,

        "group_name" =>
            $group["group_name"],

        "min_select" =>
            (int) $group["min_select"],

        "max_select" =>
            (int) $group["max_select"],

        "is_required" =>
            (int) $group["is_required"] === 1,

        "options" =>
            $options
    ];
}

$groupStmt->close();
$optionStmt->close();

/* =========================================================
   CALCULATE COMBO AVAILABILITY
========================================================= */

$available = true;
$maxPackages = null;

/*
 * Fixed components limit.
 */
foreach ($components as $component) {
    $requiredQuantity =
        (int) $component["required_quantity"];

    $componentStock =
        (int) $component["stock"];

    $componentStatus = strtolower(
        trim((string) $component["status"])
    );

    if (
        $requiredQuantity <= 0 ||
        $componentStatus !== "available"
    ) {
        $available = false;
        $maxPackages = 0;
        break;
    }

    $possiblePackages = (int) floor(
        $componentStock / $requiredQuantity
    );

    if ($possiblePackages <= 0) {
        $available = false;
    }

    if (
        $maxPackages === null ||
        $possiblePackages < $maxPackages
    ) {
        $maxPackages = $possiblePackages;
    }
}

/*
 * Each required choice group must contain at least one
 * currently available option.
 */
if ($available) {
    foreach ($choiceGroups as $group) {
        if (!$group["is_required"]) {
            continue;
        }

        $availableOptionStocks = [];

        foreach ($group["options"] as $option) {
            if ($option["available"]) {
                $availableOptionStocks[] =
                    (int) $option["stock"];
            }
        }

        if (count($availableOptionStocks) === 0) {
            $available = false;
            $maxPackages = 0;
            break;
        }

        /*
         * Because BlackHabit requires one selection per group,
         * the largest available option stock is the practical
         * package limit before the customer chooses.
         */
        $groupMaximum = max($availableOptionStocks);

        if (
            $maxPackages === null ||
            $groupMaximum < $maxPackages
        ) {
            $maxPackages = $groupMaximum;
        }
    }
}

if ($maxPackages === null) {
    $maxPackages = 0;
}

respond_json([
    "success" => true,
    "is_combo" => true,

    "combo" => [
        "combo_id" =>
            $combo_id,

        "restaurant_id" =>
            $restaurant_id,

        "product_id" =>
            (int) $combo["product_id"],

        "combo_name" =>
            $combo["combo_name"],

        "combo_price" =>
            (float) $combo["combo_price"],

        "category" =>
            $combo["category"],

        "size" =>
            $combo["size"] ?? "",

        "available" =>
            $available,

        "max_packages" =>
            $maxPackages,

        "components" =>
            $components,

        "choice_groups" =>
            $choiceGroups
    ]
]);