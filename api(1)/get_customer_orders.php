<?php

header(
    "Content-Type: application/json; charset=utf-8"
);

header(
    "Cache-Control: no-store, no-cache, must-revalidate, max-age=0"
);

header("Pragma: no-cache");
header("Expires: 0");

error_reporting(
    E_ALL &
    ~E_NOTICE &
    ~E_WARNING
);

ini_set(
    "display_errors",
    "0"
);

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
    http_response_code(
        $statusCode
    );

    echo json_encode(
        $data,
        JSON_UNESCAPED_UNICODE |
        JSON_UNESCAPED_SLASHES
    );

    exit;
}

/* =========================================================
   REQUEST METHOD
========================================================= */

if (
    strtoupper(
        $_SERVER["REQUEST_METHOD"] ?? ""
    ) !== "GET"
) {
    respond_json([
        "success" => false,
        "message" =>
            "Only GET requests are allowed."
    ], 405);
}

/* =========================================================
   AUTHENTICATION
========================================================= */

$customerId = (int)(
    $_SESSION["user_id"] ?? 0
);

$role = strtolower(
    trim(
        (string)(
            $_SESSION["role"] ?? ""
        )
    )
);

if ($customerId <= 0) {
    respond_json([
        "success" => false,
        "message" =>
            "Unauthorized access. Please log in again."
    ], 401);
}

if (
    $role !== "" &&
    $role !== "customer"
) {
    respond_json([
        "success" => false,
        "message" =>
            "This order history endpoint is only available to customers."
    ], 403);
}

/* =========================================================
   DATABASE CONNECTION
========================================================= */

if (
    !isset($conn) ||
    !($conn instanceof mysqli)
) {
    respond_json([
        "success" => false,
        "message" =>
            "Database connection is unavailable."
    ], 500);
}

$conn->set_charset(
    "utf8mb4"
);

/* =========================================================
   LOAD CUSTOMER ORDERS
========================================================= */

try {

    $orderStmt = $conn->prepare("
        SELECT
            o.order_id,
            o.order_qr_token,
            o.queue_number,
            o.restaurant_id,
            o.user_id,
            o.customer_name,
            o.contact_number,
            o.order_type,
            o.order_status,
            o.qr_verified_at,
            o.qr_expires_at,
            o.cancellation_reason,
            o.cancelled_by,
            o.cancelled_at
                AS order_cancelled_at,
            o.subtotal,
            o.delivery_fee,
            o.total_amount,
           o.payment_method,
            o.address,
            o.landmark,
            o.customer_latitude,
            o.customer_longitude,
            o.table_number,
            o.pickup_time,
            o.notes,
            o.created_at,

            r.name
                AS restaurant_name,
            r.address
                AS restaurant_address,
            r.contact_number
                AS restaurant_contact_number,
            r.delivery_fee
                AS restaurant_delivery_fee,
            r.business_status,

            da.assignment_id,
            da.rider_id,
            da.assigned_by,
            da.assignment_type,
            da.delivery_status,
            da.delivery_fee
                AS assigned_delivery_fee,
            da.rider_payment,
            da.assigned_at,
            da.accepted_at,
            da.picked_up_at,
            da.out_for_delivery_at,
            da.completed_at,
            da.cancelled_at
                AS delivery_cancelled_at,
            da.created_at
                AS delivery_created_at,
            da.updated_at
                AS delivery_updated_at,

            rider.full_name
                AS rider_name,
            rider.contact_number
                AS rider_contact_number

        FROM tbl_orders o

        INNER JOIN tbl_restaurants r
            ON r.restaurant_id =
               o.restaurant_id

        LEFT JOIN tbl_delivery_assignments da
            ON da.order_id =
               o.order_id
           AND da.restaurant_id =
               o.restaurant_id

        LEFT JOIN tbl_users rider
            ON rider.user_id =
               da.rider_id

        WHERE o.user_id = ?

        ORDER BY
            o.created_at DESC,
            o.order_id DESC
    ");

    if (!$orderStmt) {
        throw new RuntimeException(
            "Unable to prepare customer orders query: " .
            $conn->error
        );
    }

    $orderStmt->bind_param(
        "i",
        $customerId
    );

    if (!$orderStmt->execute()) {
        throw new RuntimeException(
            "Unable to execute customer orders query: " .
            $orderStmt->error
        );
    }

    $orderResult =
        $orderStmt->get_result();

    $orders = [];
    $orderIds = [];

    while (
        $row =
        $orderResult->fetch_assoc()
    ) {
        $orderId = (int)(
            $row["order_id"] ?? 0
        );

        if ($orderId <= 0) {
            continue;
        }

        $orderIds[] =
            $orderId;

        $delivery = null;

        if (
            !empty(
                $row["assignment_id"]
            )
        ) {
            $delivery = [
                "assignment_id" =>
                    (int)$row[
                        "assignment_id"
                    ],

                "order_id" =>
                    $orderId,

                "restaurant_id" =>
                    (int)$row[
                        "restaurant_id"
                    ],

                "rider_id" =>
                    $row["rider_id"] !== null
                        ? (int)$row[
                            "rider_id"
                        ]
                        : null,

                "rider_name" =>
                    $row["rider_name"] !== null
                        ? (string)$row[
                            "rider_name"
                        ]
                        : null,

                "rider_contact_number" =>
                    $row[
                        "rider_contact_number"
                    ] !== null
                        ? (string)$row[
                            "rider_contact_number"
                        ]
                        : null,

                "assigned_by" =>
                    $row["assigned_by"] !== null
                        ? (int)$row[
                            "assigned_by"
                        ]
                        : null,

                "assignment_type" =>
                    (string)(
                        $row[
                            "assignment_type"
                        ] ?? ""
                    ),

                "delivery_status" =>
                    (string)(
                        $row[
                            "delivery_status"
                        ] ?? ""
                    ),

                "delivery_fee" =>
                    number_format(
                        (float)(
                            $row[
                                "assigned_delivery_fee"
                            ] ?? 0
                        ),
                        2,
                        ".",
                        ""
                    ),

                "rider_payment" =>
                    number_format(
                        (float)(
                            $row[
                                "rider_payment"
                            ] ?? 0
                        ),
                        2,
                        ".",
                        ""
                    ),

                "assigned_at" =>
                    $row["assigned_at"],

                "accepted_at" =>
                    $row["accepted_at"],

                "picked_up_at" =>
                    $row["picked_up_at"],

                "out_for_delivery_at" =>
                    $row[
                        "out_for_delivery_at"
                    ],

                "completed_at" =>
                    $row["completed_at"],

                "cancelled_at" =>
                    $row[
                        "delivery_cancelled_at"
                    ],

                "created_at" =>
                    $row[
                        "delivery_created_at"
                    ],

                "updated_at" =>
                    $row[
                        "delivery_updated_at"
                    ]
            ];
        }

        $orderType = strtolower(
            trim(
                (string)(
                    $row[
                        "order_type"
                    ] ?? ""
                )
            )
        );

        $orderStatus = strtolower(
            trim(
                (string)(
                    $row[
                        "order_status"
                    ] ?? ""
                )
            )
        );

        $qrVerified =
            !empty(
                $row[
                    "qr_verified_at"
                ]
            );

        $qrExpiresAt =
            $row[
                "qr_expires_at"
            ] ?? null;

        $qrExpirationTimestamp =
            $qrExpiresAt
                ? strtotime(
                    (string)$qrExpiresAt
                )
                : false;

        $qrExpired =
            !$qrVerified &&
            $qrExpirationTimestamp !== false &&
            $qrExpirationTimestamp <=
                time();

        $requiresQr =
            in_array(
                $orderType,
                [
                    "dine-in",
                    "dinein",
                    "takeout",
                    "take-out"
                ],
                true
            );

        $canReturnQr =
            !$qrVerified &&
            !$qrExpired &&
            $requiresQr &&
            $orderStatus !==
                "cancelled" &&
            !empty(
                $row[
                    "order_qr_token"
                ]
            );

        $orders[$orderId] = [
            "order_id" =>
                $orderId,

            "queue_number" =>
                $row[
                    "queue_number"
                ] !== null
                    ? (int)$row[
                        "queue_number"
                    ]
                    : null,

            "restaurant_id" =>
                (int)$row[
                    "restaurant_id"
                ],

            "user_id" =>
                (int)$row[
                    "user_id"
                ],

            "customer_name" =>
                (string)(
                    $row[
                        "customer_name"
                    ] ?? ""
                ),

            "contact_number" =>
                (string)(
                    $row[
                        "contact_number"
                    ] ?? ""
                ),

            "order_type" =>
                (string)(
                    $row[
                        "order_type"
                    ] ?? ""
                ),

            "order_status" =>
                (string)(
                    $row[
                        "order_status"
                    ] ?? ""
                ),

            "order_qr_token" =>
                $canReturnQr
                    ? (string)$row[
                        "order_qr_token"
                    ]
                    : null,

            "order_qr_value" =>
                $canReturnQr
                    ? (
                        "FOODCONNECT_ORDER:" .
                        (string)$row[
                            "order_qr_token"
                        ]
                    )
                    : null,

            "qr_verified_at" =>
                $row[
                    "qr_verified_at"
                ] ?? null,

            "qr_expires_at" =>
                $qrExpiresAt,

            "qr_expired" =>
                $qrExpired,

            "qr_verified" =>
                $qrVerified,

            "cancellation_reason" =>
                $row[
                    "cancellation_reason"
                ],

            "cancelled_by" =>
                $row[
                    "cancelled_by"
                ],

            "cancelled_at" =>
                $row[
                    "order_cancelled_at"
                ],

            "subtotal" =>
                number_format(
                    (float)(
                        $row[
                            "subtotal"
                        ] ?? 0
                    ),
                    2,
                    ".",
                    ""
                ),

            "delivery_fee" =>
                number_format(
                    (float)(
                        $row[
                            "delivery_fee"
                        ] ?? 0
                    ),
                    2,
                    ".",
                    ""
                ),

            "total_amount" =>
                number_format(
                    (float)(
                        $row[
                            "total_amount"
                        ] ?? 0
                    ),
                    2,
                    ".",
                    ""
                ),

            "payment_method" =>
                $row[
                    "payment_method"
                ],

                        "address" =>
                    $row["address"],

                "landmark" =>
                    $row["landmark"],

                "customer_latitude" =>
                    $row["customer_latitude"] !== null
                        ? (float)$row["customer_latitude"]
                        : null,

                "customer_longitude" =>
                    $row["customer_longitude"] !== null
                        ? (float)$row["customer_longitude"]
                        : null,

                "table_number" =>
                    $row[
                        "table_number"
                    ],

            "pickup_time" =>
                $row[
                    "pickup_time"
                ],

            "notes" =>
                $row["notes"],

            "created_at" =>
                $row[
                    "created_at"
                ],

            "restaurant_name" =>
                (string)(
                    $row[
                        "restaurant_name"
                    ] ?? "Restaurant"
                ),

            "restaurant" => [
                "restaurant_id" =>
                    (int)$row[
                        "restaurant_id"
                    ],

                "name" =>
                    (string)(
                        $row[
                            "restaurant_name"
                        ] ?? "Restaurant"
                    ),

                "address" =>
                    $row[
                        "restaurant_address"
                    ],

                "contact_number" =>
                    $row[
                        "restaurant_contact_number"
                    ],

                "delivery_fee" =>
                    number_format(
                        (float)(
                            $row[
                                "restaurant_delivery_fee"
                            ] ?? 0
                        ),
                        2,
                        ".",
                        ""
                    ),

                "business_status" =>
                    $row[
                        "business_status"
                    ]
            ],

            "delivery" =>
                $delivery,

            "items" =>
                []
        ];
    }

    $orderStmt->close();

    /* =====================================================
       LOAD ORDER ITEMS
    ===================================================== */

    if (
        count($orderIds) > 0
    ) {
        $placeholders =
            implode(
                ",",
                array_fill(
                    0,
                    count($orderIds),
                    "?"
                )
            );

        $itemSql = "
            SELECT
                oi.order_item_id,
                oi.order_id,
                oi.product_id,
                oi.combo_id,
                oi.quantity,
                oi.price,
                oi.regular_price,
                oi.discount_type,
                oi.discount_value,
                oi.discount_savings,
                oi.discount_applied,
                oi.product_name,
                oi.base_text,
                oi.combo_choice_text,
                oi.combo_choice_ids_json,
                oi.addon_text,
                oi.addon_ids_json,

                p.product_name
                    AS current_product_name,
                p.category,
                p.size,
                p.restaurant_id
                    AS product_restaurant_id

            FROM tbl_order_items oi

            LEFT JOIN tbl_products p
                ON p.product_id =
                   oi.product_id

            INNER JOIN tbl_orders o
                ON o.order_id =
                   oi.order_id

            WHERE oi.order_id IN (
                " . $placeholders . "
            )
              AND o.user_id = ?

            ORDER BY
                oi.order_id DESC,
                oi.order_item_id ASC
        ";

        $itemStmt =
            $conn->prepare(
                $itemSql
            );

        if (!$itemStmt) {
            throw new RuntimeException(
                "Unable to prepare order items query: " .
                $conn->error
            );
        }

        $bindTypes =
            str_repeat(
                "i",
                count($orderIds) + 1
            );

        $bindValues =
            $orderIds;

        $bindValues[] =
            $customerId;

        $bindReferences = [];
        $bindReferences[] =
            $bindTypes;

        foreach (
            $bindValues as
            $index => $value
        ) {
            $bindValues[$index] =
                (int)$value;

            $bindReferences[] =
                &$bindValues[$index];
        }

        call_user_func_array(
            [
                $itemStmt,
                "bind_param"
            ],
            $bindReferences
        );

        if (!$itemStmt->execute()) {
            throw new RuntimeException(
                "Unable to execute order items query: " .
                $itemStmt->error
            );
        }

        $itemResult =
            $itemStmt->get_result();

        while (
            $item =
            $itemResult->fetch_assoc()
        ) {
            $orderId = (int)(
                $item[
                    "order_id"
                ] ?? 0
            );

            if (
                $orderId <= 0 ||
                !isset(
                    $orders[
                        $orderId
                    ]
                )
            ) {
                continue;
            }

            $savedProductName =
                trim(
                    (string)(
                        $item[
                            "product_name"
                        ] ?? ""
                    )
                );

            $currentProductName =
                trim(
                    (string)(
                        $item[
                            "current_product_name"
                        ] ?? ""
                    )
                );

            $displayProductName =
                $savedProductName !== ""
                    ? $savedProductName
                    : (
                        $currentProductName !== ""
                            ? $currentProductName
                            : "Product"
                    );

            $quantity = max(
                1,
                (int)(
                    $item[
                        "quantity"
                    ] ?? 1
                )
            );

            $unitPrice = round(
    max(
        0,
        (float)(
            $item[
                "price"
            ] ?? 0
        )
    ),
    2
);

$regularPrice = round(
    max(
        0,
        (float)(
            $item[
                "regular_price"
            ] ?? $unitPrice
        )
    ),
    2
);

$discountType = strtolower(
    trim(
        (string)(
            $item[
                "discount_type"
            ] ?? "none"
        )
    )
);

$discountValue = round(
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

$discountSavings = round(
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

$discountApplied =
    (int)(
        $item[
            "discount_applied"
        ] ?? 0
    ) === 1 &&
    $discountSavings > 0;

            $orders[
                $orderId
            ]["items"][] = [
                "order_item_id" =>
                    (int)$item[
                        "order_item_id"
                    ],

                "order_id" =>
                    $orderId,

                "product_id" =>
                    $item[
                        "product_id"
                    ] !== null
                        ? (int)$item[
                            "product_id"
                        ]
                        : null,

                "combo_id" =>
                    $item[
                        "combo_id"
                    ] !== null
                        ? (int)$item[
                            "combo_id"
                        ]
                        : null,

                "product_name" =>
                    $displayProductName,

                "category" =>
                    $item["category"],

                "size" =>
                    $item["size"],

                "quantity" =>
                    $quantity,

                "price" =>
    number_format(
        $unitPrice,
        2,
        ".",
        ""
    ),

"regular_price" =>
    number_format(
        $regularPrice,
        2,
        ".",
        ""
    ),

"discount_type" =>
    $discountType,

"discount_value" =>
    number_format(
        $discountValue,
        2,
        ".",
        ""
    ),

"discount_savings" =>
    number_format(
        $discountSavings,
        2,
        ".",
        ""
    ),

"discount_applied" =>
    $discountApplied,

"subtotal" =>
                    number_format(
                        $unitPrice *
                        $quantity,
                        2,
                        ".",
                        ""
                    ),

                "base_text" =>
                    $item[
                        "base_text"
                    ],

                "combo_choice_text" =>
                    $item[
                        "combo_choice_text"
                    ],

                "combo_choice_ids_json" =>
                    $item[
                        "combo_choice_ids_json"
                    ],

                "addon_text" =>
                    $item[
                        "addon_text"
                    ],

                "addon_ids_json" =>
                    $item[
                        "addon_ids_json"
                    ]
            ];
        }

        $itemStmt->close();
    }

    $responseOrders =
        array_values(
            $orders
        );

    respond_json([
        "success" => true,

        "message" =>
            "Customer orders loaded successfully.",

        "customer_id" =>
            $customerId,

        "count" =>
            count(
                $responseOrders
            ),

        "orders" =>
            $responseOrders
    ]);

} catch (
    Throwable $exception
) {
    error_log(
        "FoodConnect get customer orders error: " .
        $exception->getMessage()
    );

    respond_json([
        "success" => false,
        "message" =>
            "Unable to load your orders. Please try again."
    ], 500);
}