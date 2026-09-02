<?php
declare(strict_types=1);

/**
 * FoodConnect add-on helpers.
 * Add-ons are priced/available extras and NEVER participate in stock.
 */

function normalize_addon_ids($raw): array
{
    if (is_string($raw)) {
        $decoded = json_decode($raw, true);
        $raw = is_array($decoded) ? $decoded : [];
    }

    if (!is_array($raw)) {
        return [];
    }

    $ids = [];
    foreach ($raw as $value) {
        $id = filter_var($value, FILTER_VALIDATE_INT);
        if ($id !== false && $id > 0) {
            $ids[(int)$id] = (int)$id;
        }
    }
    return array_values($ids);
}

function get_product_group(mysqli $conn, int $restaurantId, int $productId): ?array
{
    $stmt = $conn->prepare("
        SELECT product_id, product_name, category, item_type
        FROM tbl_products
        WHERE product_id = ?
          AND restaurant_id = ?
        LIMIT 1
    ");
    if (!$stmt) {
        throw new RuntimeException("Unable to load the menu item.");
    }
    $stmt->bind_param("ii", $productId, $restaurantId);
    $stmt->execute();
    $row = $stmt->get_result()->fetch_assoc();
    $stmt->close();
    return $row ?: null;
}

function replace_product_group_addons(
    mysqli $conn,
    int $restaurantId,
    string $productName,
    string $productCategory,
    array $addonIds
): void {
    $addonIds = normalize_addon_ids($addonIds);

    if ($addonIds) {
        $check = $conn->prepare("
            SELECT product_id
            FROM tbl_products
            WHERE product_id = ?
              AND restaurant_id = ?
              AND item_type = 'add_on'
            LIMIT 1
        ");
        if (!$check) {
            throw new RuntimeException("Unable to validate selected add-ons.");
        }

        foreach ($addonIds as $addonId) {
            $check->bind_param("ii", $addonId, $restaurantId);
            $check->execute();
            if (!$check->get_result()->fetch_assoc()) {
                $check->close();
                throw new DomainException("One or more selected add-ons are invalid.");
            }
        }
        $check->close();
    }

    $delete = $conn->prepare("
        DELETE FROM tbl_product_addon_links
        WHERE restaurant_id = ?
          AND LOWER(TRIM(product_name)) = LOWER(TRIM(?))
          AND LOWER(TRIM(product_category)) = LOWER(TRIM(?))
    ");
    if (!$delete) {
        throw new RuntimeException("Unable to update product add-ons.");
    }
    $delete->bind_param("iss", $restaurantId, $productName, $productCategory);
    $delete->execute();
    $delete->close();

    if (!$addonIds) {
        return;
    }

    $insert = $conn->prepare("
        INSERT IGNORE INTO tbl_product_addon_links (
            restaurant_id,
            product_name,
            product_category,
            addon_product_id
        )
        VALUES (?, ?, ?, ?)
    ");
    if (!$insert) {
        throw new RuntimeException("Unable to save product add-ons.");
    }

    foreach ($addonIds as $addonId) {
        $insert->bind_param(
            "issi",
            $restaurantId,
            $productName,
            $productCategory,
            $addonId
        );
        if (!$insert->execute()) {
            $insert->close();
            throw new RuntimeException("Unable to save product add-ons.");
        }
    }
    $insert->close();
}

function product_allows_addon(
    mysqli $conn,
    int $restaurantId,
    int $productId,
    int $addonId
): bool {
    $stmt = $conn->prepare("
        SELECT 1
        FROM tbl_products p
        INNER JOIN tbl_product_addon_links l
            ON l.restaurant_id = p.restaurant_id
           AND LOWER(TRIM(l.product_name)) = LOWER(TRIM(p.product_name))
           AND LOWER(TRIM(l.product_category)) = LOWER(TRIM(p.category))
        INNER JOIN tbl_products a
            ON a.product_id = l.addon_product_id
           AND a.restaurant_id = p.restaurant_id
           AND a.item_type = 'add_on'
        WHERE p.product_id = ?
          AND p.restaurant_id = ?
          AND p.item_type = 'menu_item'
          AND a.product_id = ?
        LIMIT 1
    ");
    if (!$stmt) {
        throw new RuntimeException("Unable to validate the selected add-on.");
    }
    $stmt->bind_param("iii", $productId, $restaurantId, $addonId);
    $stmt->execute();
    $ok = (bool)$stmt->get_result()->fetch_assoc();
    $stmt->close();
    return $ok;
}
