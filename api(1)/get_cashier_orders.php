<?php

header(
    "Content-Type: application/json; charset=utf-8"
);

header(
    "Cache-Control: no-store, no-cache, must-revalidate, max-age=0"
);

header("Pragma: no-cache");
header("Expires: 0");
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

function respond_json(
    array $data,
    int $statusCode = 200
): void {
    http_response_code($statusCode);

    echo json_encode(
        $data,
        JSON_UNESCAPED_UNICODE
    );

    exit;
}

/* =========================================================
   NORMALIZE SAVED ADD-ON TEXT
========================================================= */

function normalize_addon_text($value): string
{
    $text = trim((string)$value);

    if (
        $text === "" ||
        $text === "[]" ||
        strtolower($text) === "null"
    ) {
        return "No Add-on";
    }

    return $text;
}

/* =========================================================
   NORMALIZE SAVED COMBO TEXT
========================================================= */

function normalize_combo_choice_text($value): string
{
    $text = trim((string)$value);

    if (
        $text === "" ||
        $text === "[]" ||
        strtolower($text) === "null"
    ) {
        return "";
    }

    return $text;
}

/* =========================================================
   NORMALIZE SAVED JSON IDS
========================================================= */

function normalize_ids_json($value): string
{
    $text = trim((string)$value);

    if (
        $text === "" ||
        strtolower($text) === "null"
    ) {
        return "[]";
    }

    $decoded = json_decode($text, true);

    if (!is_array($decoded)) {
        return "[]";
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

    $json = json_encode(
        $ids,
        JSON_UNESCAPED_UNICODE
    );

    return $json !== false
        ? $json
        : "[]";
}

/* =========================================================
   AUTHENTICATION
========================================================= */

if (empty($_SESSION["user_id"])) {
    respond_json([
        "success" => false,
        "message" => "Unauthorized access."
    ], 401);
}

$user_id = (int)$_SESSION["user_id"];

$role = strtolower(
    trim(
        (string)(
            $_SESSION["role"] ?? ""
        )
    )
);

$allowedRoles = [
    "cashier",
    "owner"
];

if (!in_array($role, $allowedRoles, true)) {
    respond_json([
        "success" => false,
        "message" =>
            "You are not authorized to view cashier orders."
    ], 403);
}

/* =========================================================
   RESTAURANT VALIDATION
========================================================= */

$restaurant_id = (int)(
    $_SESSION["restaurant_id"] ?? 0
);

if ($restaurant_id <= 0) {
    respond_json([
        "success" => false,
        "message" =>
            "Invalid or missing restaurant information."
    ], 400);
}

/* =========================================================
   ORDERS QUERY
========================================================= */

$sql = "
    SELECT
        o.order_id,
        o.queue_number,
        o.restaurant_id,
        r.name AS restaurant_name,
        o.customer_name,
        o.contact_number,
        o.order_type,
        o.order_status,
        o.qr_verified_at,
        o.cancellation_reason,
        o.cancelled_by,
        o.cancelled_at,
        o.total_amount,
        r.delivery_fee,
        o.payment_method,
        o.address,
        o.landmark,
        o.table_number,
        o.pickup_time,
        o.notes,
        o.created_at,

        oi.order_item_id,
        oi.product_id,
        oi.combo_id,
        oi.quantity,
        oi.price,
        oi.product_name,
        oi.base_text,
        oi.addon_text,
        oi.addon_ids_json,
        oi.combo_choice_text,
        oi.combo_choice_ids_json

        FROM tbl_orders AS o

INNER JOIN tbl_restaurants AS r
    ON r.restaurant_id = o.restaurant_id

LEFT JOIN tbl_order_items AS oi
    ON oi.order_id = o.order_id

    WHERE o.restaurant_id = ?
  AND (
        LOWER(TRIM(o.order_type)) = 'delivery'

        OR (
            LOWER(TRIM(o.order_type)) IN (
                'dine-in',
                'dinein',
                'takeout',
                'take-out'
            )

            AND o.qr_verified_at IS NOT NULL
        )
      )

    ORDER BY
        o.created_at ASC,
        o.order_id ASC,
        oi.order_item_id ASC
";

$stmt = $conn->prepare($sql);

if (!$stmt) {
    error_log(
        "FoodConnect cashier order prepare error: " .
        $conn->error
    );

    respond_json([
        "success" => false,
        "message" =>
            "Unable to load cashier orders."
    ], 500);
}

$stmt->bind_param(
    "i",
    $restaurant_id
);

if (!$stmt->execute()) {
    error_log(
        "FoodConnect cashier order execute error: " .
        $stmt->error
    );

    $stmt->close();

    respond_json([
        "success" => false,
        "message" =>
            "Unable to load cashier orders."
    ], 500);
}

$result = $stmt->get_result();

$orders = [];

/* =========================================================
   GROUP ORDER ROWS
========================================================= */

while ($row = $result->fetch_assoc()) {
    $order_id = (int)(
        $row["order_id"] ?? 0
    );

    if ($order_id <= 0) {
        continue;
    }

    if (!isset($orders[$order_id])) {
        $orders[$order_id] = [
            "order_id" =>
                $order_id,

            "queue_number" =>
                $row["queue_number"] !== null
                    ? (int)$row["queue_number"]
                    : null,

            "restaurant_id" =>
                (int)$row["restaurant_id"],

            "restaurant_name" =>
                trim(
                    (string)(
                        $row["restaurant_name"] ?? ""
                    )
                ),

            "customer_name" =>
                trim(
                    (string)(
                        $row["customer_name"] ?? ""
                    )
                ),

            "contact_number" =>
                trim(
                    (string)(
                        $row["contact_number"] ?? ""
                    )
                ),

            "order_type" =>
                trim(
                    (string)(
                        $row["order_type"] ?? ""
                    )
                ),

            "order_status" =>
                trim(
                    (string)(
                        $row["order_status"] ?? ""
                    )
                ),

            "qr_verified_at" =>
                $row["qr_verified_at"] ?? null,

            "qr_verified" =>
                !empty($row["qr_verified_at"]),

            "cancellation_reason" =>

                trim(
                    (string)(
                        $row["cancellation_reason"] ?? ""
                    )
                ),

            "cancelled_by" =>
                trim(
                    (string)(
                        $row["cancelled_by"] ?? ""
                    )
                ),

            "cancelled_at" =>
                $row["cancelled_at"] ?? null,

            "total_amount" =>
                round(
                    (float)(
                        $row["total_amount"] ?? 0
                    ),
                    2
                ),

                "delivery_fee" =>
    round(
        (float)(
            $row["delivery_fee"] ?? 0
        ),
        2
    ),

            "payment_method" =>
                trim(
                    (string)(
                        $row["payment_method"] ?? ""
                    )
                ),

            "address" =>
                trim(
                    (string)(
                        $row["address"] ?? ""
                    )
                ),

            "landmark" =>
                trim(
                    (string)(
                        $row["landmark"] ?? ""
                    )
                ),

            "table_number" =>
                trim(
                    (string)(
                        $row["table_number"] ?? ""
                    )
                ),

            "pickup_time" =>
                trim(
                    (string)(
                        $row["pickup_time"] ?? ""
                    )
                ),

            "notes" =>
                trim(
                    (string)(
                        $row["notes"] ?? ""
                    )
                ),

            "created_at" =>
                $row["created_at"],

            "items" => []
        ];
    }

    $order_item_id = (int)(
        $row["order_item_id"] ?? 0
    );

    if ($order_item_id <= 0) {
        continue;
    }

    $quantity = max(
        0,
        (int)(
            $row["quantity"] ?? 0
        )
    );

    $unitPrice = max(
        0,
        (float)(
            $row["price"] ?? 0
        )
    );

    $comboChoiceText =
        normalize_combo_choice_text(
            $row["combo_choice_text"] ?? ""
        );

    $orders[$order_id]["items"][] = [
        "order_item_id" =>
            $order_item_id,

        "product_id" =>
            $row["product_id"] !== null
                ? (int)$row["product_id"]
                : null,

        "combo_id" =>
            $row["combo_id"] !== null
                ? (int)$row["combo_id"]
                : null,

        "is_combo" =>
            $row["combo_id"] !== null &&
            (int)$row["combo_id"] > 0,

        "quantity" =>
            $quantity,

        "price" =>
            round($unitPrice, 2),

        "unit_price" =>
            round($unitPrice, 2),

        "subtotal" =>
            round(
                $unitPrice * $quantity,
                2
            ),

        "product_name" =>
            trim(
                (string)(
                    $row["product_name"] ?? "Item"
                )
            ),

        "base_text" =>
            trim(
                (string)(
                    $row["base_text"] ?? ""
                )
            ),

        "addon_text" =>
            normalize_addon_text(
                $row["addon_text"] ?? ""
            ),

        "addon_ids_json" =>
            normalize_ids_json(
                $row["addon_ids_json"] ?? "[]"
            ),

        "combo_choice_text" =>
            $comboChoiceText,

        "combo_choice_ids_json" =>
            normalize_ids_json(
                $row["combo_choice_ids_json"] ?? "[]"
            ),

        "has_combo_choice" =>
            $comboChoiceText !== ""
    ];
}

$stmt->close();
$conn->close();

/* =========================================================
   RESPONSE
========================================================= */

respond_json([
    "success" => true,
    "orders" => array_values($orders)
]);