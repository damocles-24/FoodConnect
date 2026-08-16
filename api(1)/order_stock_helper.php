<?php

/*
|--------------------------------------------------------------------------
| FoodConnect Order Stock Helper
|--------------------------------------------------------------------------
|
| Restores exactly what checkout.php deducts:
|
| Normal product:
|   - product stock
|   - selected add-ons
|
| Combo product:
|   - fixed combo components
|   - selected combo choices
|   - selected add-ons
|
| The combo parent product is NOT restored because checkout.php does not
| deduct its stock.
|
*/

function decode_order_ids($raw): array
{
    if (
        $raw === null ||
        $raw === "" ||
        $raw === "[]" ||
        strtolower(trim((string)$raw)) === "null"
    ) {
        return [];
    }

    if (is_string($raw)) {
        $decoded = json_decode($raw, true);
    } else {
        $decoded = $raw;
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

/*
|--------------------------------------------------------------------------
| Restore one product stock
|--------------------------------------------------------------------------
*/

function restore_product_stock(
    mysqli_stmt $restoreStockStmt,
    int $productId,
    int $restaurantId,
    int $quantity,
    string $description
): void {
    if (
        $productId <= 0 ||
        $restaurantId <= 0 ||
        $quantity <= 0
    ) {
        throw new RuntimeException(
            "Invalid stock restoration information for " .
            $description .
            "."
        );
    }

    $restoreStockStmt->bind_param(
        "iii",
        $quantity,
        $productId,
        $restaurantId
    );

    if (!$restoreStockStmt->execute()) {
        throw new RuntimeException(
            "Unable to restore stock for " .
            $description .
            "."
        );
    }

    if ($restoreStockStmt->affected_rows !== 1) {
        throw new RuntimeException(
            "The stock for " .
            $description .
            " could not be restored."
        );
    }
}

/*
|--------------------------------------------------------------------------
| Restore all stocks used by an order
|--------------------------------------------------------------------------
|
| Important:
| The caller must already have an active database transaction.
|
*/

function restore_order_stock(
    mysqli $conn,
    int $orderId,
    int $restaurantId
): array {
    if ($orderId <= 0) {
        throw new RuntimeException(
            "Invalid order ID for stock restoration."
        );
    }

    if ($restaurantId <= 0) {
        throw new RuntimeException(
            "Invalid restaurant ID for stock restoration."
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Lock order items
    |--------------------------------------------------------------------------
    */

    $getItemsStmt = $conn->prepare("
        SELECT
            order_item_id,
            product_id,
            combo_id,
            quantity,
            product_name,
            addon_ids_json,
            combo_choice_ids_json

        FROM tbl_order_items

        WHERE order_id = ?

        ORDER BY
            product_id ASC,
            order_item_id ASC

        FOR UPDATE
    ");

    if (!$getItemsStmt) {
        throw new RuntimeException(
            "Unable to prepare order-item stock restoration."
        );
    }

    $getItemsStmt->bind_param(
        "i",
        $orderId
    );

    if (!$getItemsStmt->execute()) {
        $getItemsStmt->close();

        throw new RuntimeException(
            "Unable to load restorable order items."
        );
    }

    $itemsResult =
        $getItemsStmt->get_result();

    $orderItems = [];

    while (
        $item =
            $itemsResult->fetch_assoc()
    ) {
        $orderItems[] = $item;
    }

    $getItemsStmt->close();

    if (count($orderItems) === 0) {
        throw new RuntimeException(
            "The order has no restorable items."
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Prepared statements
    |--------------------------------------------------------------------------
    */

    $restoreStockStmt = $conn->prepare("
        UPDATE tbl_products

        SET
            stock = stock + ?,
            status = 'Available'

        WHERE product_id = ?
          AND restaurant_id = ?
    ");

    if (!$restoreStockStmt) {
        throw new RuntimeException(
            "Unable to prepare product stock restoration."
        );
    }

    $comboComponentStmt = $conn->prepare("
        SELECT
            ci.product_id,
            ci.quantity AS required_quantity,
            p.product_name

        FROM tbl_combo_items ci

        INNER JOIN tbl_products p
            ON p.product_id = ci.product_id
           AND p.restaurant_id = ?

        WHERE ci.combo_id = ?

        ORDER BY ci.product_id ASC
    ");

    if (!$comboComponentStmt) {
        $restoreStockStmt->close();

        throw new RuntimeException(
            "Unable to prepare combo component restoration."
        );
    }

    $comboChoiceStmt = $conn->prepare("
        SELECT
            o.choice_option_id,
            o.product_id,
            p.product_name,
            p.size

        FROM tbl_combo_choice_options o

        INNER JOIN tbl_combo_choice_groups g
            ON g.choice_group_id = o.choice_group_id
           AND g.combo_id = ?

        INNER JOIN tbl_products p
            ON p.product_id = o.product_id
           AND p.restaurant_id = ?

        WHERE o.choice_option_id = ?

        LIMIT 1
    ");

    if (!$comboChoiceStmt) {
        $restoreStockStmt->close();
        $comboComponentStmt->close();

        throw new RuntimeException(
            "Unable to prepare combo option restoration."
        );
    }

    $summary = [
        "normal_products" => 0,
        "combo_components" => 0,
        "combo_choices" => 0,
        "addons" => 0
    ];

    try {
        foreach ($orderItems as $item) {
            $productId = (int)(
                $item["product_id"] ?? 0
            );

            $comboId =
                $item["combo_id"] !== null
                    ? (int)$item["combo_id"]
                    : 0;

            $quantity = (int)(
                $item["quantity"] ?? 0
            );

            $productName = trim(
                (string)(
                    $item["product_name"] ??
                    "ordered product"
                )
            );

            if (
                $productId <= 0 ||
                $quantity <= 0
            ) {
                throw new RuntimeException(
                    "An order item contains invalid stock information."
                );
            }

            $isCombo = $comboId > 0;

            /*
            |--------------------------------------------------------------------------
            | Normal product
            |--------------------------------------------------------------------------
            */

            if (!$isCombo) {
                restore_product_stock(
                    $restoreStockStmt,
                    $productId,
                    $restaurantId,
                    $quantity,
                    $productName
                );

                $summary["normal_products"] +=
                    $quantity;
            }

            /*
            |--------------------------------------------------------------------------
            | Combo fixed components
            |--------------------------------------------------------------------------
            */

            if ($isCombo) {
                $comboComponentStmt->bind_param(
                    "ii",
                    $restaurantId,
                    $comboId
                );

                if (
                    !$comboComponentStmt->execute()
                ) {
                    throw new RuntimeException(
                        "Unable to load combo components for restoration."
                    );
                }

                $componentResult =
                    $comboComponentStmt->get_result();

                $componentCount = 0;

                while (
                    $component =
                        $componentResult->fetch_assoc()
                ) {
                    $componentCount++;

                    $componentProductId = (int)(
                        $component["product_id"] ?? 0
                    );

                    $requiredPerPackage = (int)(
                        $component["required_quantity"] ?? 0
                    );

                    $componentName = trim(
                        (string)(
                            $component["product_name"] ??
                            "combo component"
                        )
                    );

                    if (
                        $componentProductId <= 0 ||
                        $requiredPerPackage <= 0
                    ) {
                        throw new RuntimeException(
                            "A combo component contains invalid stock information."
                        );
                    }

                    $restoreQuantity =
                        $requiredPerPackage *
                        $quantity;

                    restore_product_stock(
                        $restoreStockStmt,
                        $componentProductId,
                        $restaurantId,
                        $restoreQuantity,
                        $componentName
                    );

                    $summary["combo_components"] +=
                        $restoreQuantity;
                }

                if ($componentCount === 0) {
                    throw new RuntimeException(
                        "The combo has no restorable components."
                    );
                }

                /*
                |--------------------------------------------------------------------------
                | Selected combo choices
                |--------------------------------------------------------------------------
                */

                $comboChoiceIds =
                    decode_order_ids(
                        $item[
                            "combo_choice_ids_json"
                        ] ?? null
                    );

                foreach (
                    $comboChoiceIds
                    as $choiceOptionId
                ) {
                    $comboChoiceStmt->bind_param(
                        "iii",
                        $comboId,
                        $restaurantId,
                        $choiceOptionId
                    );

                    if (
                        !$comboChoiceStmt->execute()
                    ) {
                        throw new RuntimeException(
                            "Unable to validate a saved combo option."
                        );
                    }

                    $choiceResult =
                        $comboChoiceStmt->get_result();

                    $choice =
                        $choiceResult->fetch_assoc();

                    if (!$choice) {
                        throw new RuntimeException(
                            "A saved combo option does not belong to this order's combo."
                        );
                    }

                    $choiceProductId = (int)(
                        $choice["product_id"] ?? 0
                    );

                    $choiceName = trim(
                        (string)(
                            $choice["product_name"] ??
                            "combo option"
                        )
                    );

                    $choiceSize = trim(
                        (string)(
                            $choice["size"] ?? ""
                        )
                    );

                    if ($choiceSize !== "") {
                        $choiceName .=
                            " - " .
                            $choiceSize;
                    }

                    restore_product_stock(
                        $restoreStockStmt,
                        $choiceProductId,
                        $restaurantId,
                        $quantity,
                        $choiceName
                    );

                    $summary["combo_choices"] +=
                        $quantity;
                }
            }

            /*
            |--------------------------------------------------------------------------
            | Add-ons
            |--------------------------------------------------------------------------
            | Add-ons do not carry stock or quantity, so cancellation does not
            | restore add-on inventory.
            */
        }

    } finally {
        $restoreStockStmt->close();
        $comboComponentStmt->close();
        $comboChoiceStmt->close();
    }

    return $summary;
}