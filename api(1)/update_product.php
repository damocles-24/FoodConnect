<?php

header(
    "Content-Type: application/json; charset=utf-8"
);

header(
    "Cache-Control: no-store, no-cache, must-revalidate, max-age=0"
);

require_once __DIR__ . "/session_config.php";
require_once __DIR__ . "/db.php";
require_once __DIR__ . "/product_image_helper.php";

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
        (string) (
            $_SERVER["REQUEST_METHOD"] ?? ""
        )
    ) !== "POST"
) {
    respond_json([
        "success" => false,
        "message" => "Method not allowed."
    ], 405);
}

/* =========================================================
   AUTHENTICATION
========================================================= */

$user_id = (int) (
    $_SESSION["user_id"] ?? 0
);

$restaurant_id = (int) (
    $_SESSION["restaurant_id"] ?? 0
);

$role = strtolower(
    trim(
        (string) (
            $_SESSION["role"] ?? ""
        )
    )
);

if (
    $user_id <= 0 ||
    $restaurant_id <= 0
) {
    respond_json([
        "success" => false,
        "message" =>
            "Unauthorized. Please login first."
    ], 401);
}

if ($role !== "owner") {
    respond_json([
        "success" => false,
        "message" =>
            "Owner access is required."
    ], 403);
}

/* =========================================================
   VERIFY RESTAURANT OWNERSHIP
========================================================= */

$ownerStmt = $conn->prepare("
    SELECT
        restaurant_id
    FROM tbl_restaurants
    WHERE restaurant_id = ?
      AND owner_id = ?
    LIMIT 1
");

if (!$ownerStmt) {
    error_log(
        "update_product.php owner prepare error: " .
        $conn->error
    );

    respond_json([
        "success" => false,
        "message" =>
            "Unable to verify restaurant ownership."
    ], 500);
}

$ownerStmt->bind_param(
    "ii",
    $restaurant_id,
    $user_id
);

$ownerStmt->execute();

$ownerExists = $ownerStmt
    ->get_result()
    ->fetch_assoc();

$ownerStmt->close();

if (!$ownerExists) {
    respond_json([
        "success" => false,
        "message" =>
            "Invalid owner restaurant session."
    ], 403);
}

/* =========================================================
   READ MULTIPART FORM DATA
========================================================= */

$data = $_POST;

if (
    !is_array($data) ||
    empty($data)
) {
    respond_json([
        "success" => false,
        "message" =>
            "Product form data is required."
    ], 400);
}

/* =========================================================
   VALIDATE PRODUCT DATA
========================================================= */

$product_id = filter_var(
    $data["product_id"] ?? null,
    FILTER_VALIDATE_INT
);

$product_name = trim(
    (string) (
        $data["product_name"] ?? ""
    )
);

$category = trim(
    (string) (
        $data["category"] ?? ""
    )
);

$size = trim(
    (string) (
        $data["size"] ?? ""
    )
);

$price = filter_var(
    $data["price"] ?? null,
    FILTER_VALIDATE_FLOAT
);

$stock = filter_var(
    $data["stock"] ?? null,
    FILTER_VALIDATE_INT
);

$requestedStatus = trim(
    (string) (
        $data["status"] ?? "Available"
    )
);

$discount_type = strtolower(
    trim(
        (string) (
            $data["discount_type"] ??
            "none"
        )
    )
);

$discount_value = filter_var(
    $data["discount_value"] ?? 0,
    FILTER_VALIDATE_FLOAT
);

$discount_schedule = strtolower(
    trim(
        (string) (
            $data["discount_schedule"] ??
            "permanent"
        )
    )
);

$discount_start_raw = trim(
    (string) (
        $data["discount_start"] ?? ""
    )
);

$discount_end_raw = trim(
    (string) (
        $data["discount_end"] ?? ""
    )
);

$discount_status_raw = strtolower(
    trim(
        (string) (
            $data["discount_status"] ??
            "inactive"
        )
    )
);

$removeImage =
    (string) (
        $data["remove_image"] ?? "0"
    ) === "1";

if (
    $product_id === false ||
    $product_id <= 0
) {
    respond_json([
        "success" => false,
        "message" =>
            "A valid product ID is required."
    ], 422);
}

if ($product_name === "") {
    respond_json([
        "success" => false,
        "message" =>
            "Product name is required."
    ], 422);
}

if (
    mb_strlen($product_name) > 150
) {
    respond_json([
        "success" => false,
        "message" =>
            "Product name cannot exceed 150 characters."
    ], 422);
}

if ($category === "") {
    respond_json([
        "success" => false,
        "message" =>
            "Product category is required."
    ], 422);
}

if (mb_strlen($category) > 50) {
    respond_json([
        "success" => false,
        "message" =>
            "Product category cannot exceed 50 characters."
    ], 422);
}

if (mb_strlen($size) > 20) {
    respond_json([
        "success" => false,
        "message" =>
            "Variant or size cannot exceed 20 characters."
    ], 422);
}

if (
    $price === false ||
    $price <= 0
) {
    respond_json([
        "success" => false,
        "message" =>
            "Price must be greater than zero."
    ], 422);
}

if (
    $stock === false ||
    $stock < 0
) {
    respond_json([
        "success" => false,
        "message" =>
            "Stock cannot be negative."
    ], 422);
}

$statusMap = [
    "available" => "Available",
    "unavailable" => "Unavailable"
];

$statusKey = strtolower(
    $requestedStatus
);

if (!isset($statusMap[$statusKey])) {
    respond_json([
        "success" => false,
        "message" =>
            "Availability must be Available or Unavailable."
    ], 422);
}

$status = $statusMap[$statusKey];

$price = round(
    (float) $price,
    2
);

$stock = (int) $stock;

/* =========================================================
   VALIDATE DISCOUNT
========================================================= */

$allowedDiscountTypes = [
    "none",
    "percentage",
    "fixed"
];

if (
    !in_array(
        $discount_type,
        $allowedDiscountTypes,
        true
    )
) {
    respond_json([
        "success" => false,
        "message" =>
            "Invalid discount type."
    ], 422);
}

if (
    $discount_value === false
) {
    respond_json([
        "success" => false,
        "message" =>
            "Discount value must be a valid number."
    ], 422);
}

$discount_value = round(
    max(
        0,
        (float) $discount_value
    ),
    2
);

$allowedSchedules = [
    "permanent",
    "scheduled"
];

if (
    !in_array(
        $discount_schedule,
        $allowedSchedules,
        true
    )
) {
    respond_json([
        "success" => false,
        "message" =>
            "Invalid promotion schedule."
    ], 422);
}

$discountStatusMap = [
    "active" => "Active",
    "inactive" => "Inactive"
];

if (
    !isset(
        $discountStatusMap[
            $discount_status_raw
        ]
    )
) {
    respond_json([
        "success" => false,
        "message" =>
            "Promotion status must be Active or Inactive."
    ], 422);
}

$discount_status =
    $discountStatusMap[
        $discount_status_raw
    ];

$discount_start = null;
$discount_end = null;

if ($discount_type === "none") {
    $discount_value = 0;
    $discount_schedule =
        "permanent";
    $discount_status =
        "Inactive";
} else {
    if ($discount_value <= 0) {
        respond_json([
            "success" => false,
            "message" =>
                "Discount value must be greater than zero."
        ], 422);
    }

    if (
        $discount_type ===
            "percentage" &&
        $discount_value > 100
    ) {
        respond_json([
            "success" => false,
            "message" =>
                "Percentage discount cannot exceed 100%."
        ], 422);
    }

    if (
        $discount_type === "fixed" &&
        $discount_value > $price
    ) {
        respond_json([
            "success" => false,
            "message" =>
                "Fixed discount cannot exceed the regular product price."
        ], 422);
    }

    if (
        $discount_schedule ===
        "scheduled"
    ) {
        if (
            $discount_start_raw === "" ||
            $discount_end_raw === ""
        ) {
            respond_json([
                "success" => false,
                "message" =>
                    "Scheduled promotions require both start and end dates."
            ], 422);
        }

        $startTimestamp = strtotime(
            $discount_start_raw
        );

        $endTimestamp = strtotime(
            $discount_end_raw
        );

        if (
            $startTimestamp === false ||
            $endTimestamp === false
        ) {
            respond_json([
                "success" => false,
                "message" =>
                    "Invalid promotion date or time."
            ], 422);
        }

        if (
            $endTimestamp <=
            $startTimestamp
        ) {
            respond_json([
                "success" => false,
                "message" =>
                    "Promotion end date must be later than the start date."
            ], 422);
        }

        $discount_start = date(
            "Y-m-d H:i:s",
            $startTimestamp
        );

        $discount_end = date(
            "Y-m-d H:i:s",
            $endTimestamp
        );
    }
}

/* =========================================================
   VERIFY PRODUCT, UPDATE, AND RECORD ACTIVITY

   The product update and activity log are saved in one
   transaction. If either operation fails, both are rolled
   back.
========================================================= */

$conn->begin_transaction();

$newImagePath = null;
$oldImagePath = null;
$uploadedNewImage = false;

try {

    /* =====================================================
       LOCK AND LOAD CURRENT PRODUCT VALUES
    ===================================================== */

    $productStmt = $conn->prepare("
        SELECT
            product_id,
            product_name,
            category,
            size,
            price,
            stock,
            status,
            image_path,
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
            "Unable to prepare product verification."
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
            "Unable to load the current product."
        );
    }

    $productExists = $productStmt
        ->get_result()
        ->fetch_assoc();

    $productStmt->close();

    if (!$productExists) {
        $conn->rollback();

        respond_json([
            "success" => false,
            "message" =>
                "Product not found for this restaurant."
        ], 404);
    }

    $oldImagePath =
        $productExists["image_path"] ??
        null;

    $newImagePath =
        $oldImagePath;

    /* =====================================================
       PROCESS IMAGE CHANGE
    ===================================================== */

    if (
        isset($_FILES["product_image"]) &&
        (
            $_FILES["product_image"]["error"] ??
            UPLOAD_ERR_NO_FILE
        ) !== UPLOAD_ERR_NO_FILE
    ) {
        try {
            $newImagePath =
                save_product_image(
                    $_FILES["product_image"],
                    $restaurant_id
                );

            $uploadedNewImage = true;

        } catch (RuntimeException $error) {
            throw new RuntimeException(
                $error->getMessage()
            );
        }

    } elseif ($removeImage) {
        $newImagePath = null;
    }

    /* =====================================================
       CHECK DUPLICATE PRODUCT
    ===================================================== */

    $duplicateStmt = $conn->prepare("
        SELECT
            product_id
        FROM tbl_products
        WHERE restaurant_id = ?
          AND product_id <> ?
          AND LOWER(TRIM(product_name)) =
              LOWER(TRIM(?))
          AND LOWER(TRIM(category)) =
              LOWER(TRIM(?))
          AND LOWER(
              TRIM(
                  COALESCE(size, '')
              )
          ) = LOWER(TRIM(?))
        LIMIT 1
    ");

    if (!$duplicateStmt) {
        throw new RuntimeException(
            "Unable to validate duplicate products."
        );
    }

    $duplicateStmt->bind_param(
        "iisss",
        $restaurant_id,
        $product_id,
        $product_name,
        $category,
        $size
    );

    if (!$duplicateStmt->execute()) {
        $duplicateStmt->close();

        throw new RuntimeException(
            "Unable to validate duplicate products."
        );
    }

    $duplicateProduct =
        $duplicateStmt
            ->get_result()
            ->fetch_assoc();

    $duplicateStmt->close();

    if ($duplicateProduct) {
        if ($uploadedNewImage) {
            delete_product_image(
                $newImagePath
            );
        }

        $conn->rollback();

        respond_json([
            "success" => false,
            "message" =>
                "A product with the same name, category, and variant already exists."
        ], 409);
    }

    /* =====================================================
       BUILD CHANGE SUMMARY
    ===================================================== */

    $changes = [];

    $oldProductName =
        trim(
            (string) (
                $productExists["product_name"] ??
                ""
            )
        );

    $oldCategory =
        trim(
            (string) (
                $productExists["category"] ??
                ""
            )
        );

    $oldSize =
        trim(
            (string) (
                $productExists["size"] ??
                ""
            )
        );

    $oldPrice =
        round(
            (float) (
                $productExists["price"] ??
                0
            ),
            2
        );

    $oldStock =
        (int) (
            $productExists["stock"] ??
            0
        );

    $oldStatus =
        trim(
            (string) (
                $productExists["status"] ??
                ""
            )
        );

    $oldDiscountType =
        strtolower(
            trim(
                (string) (
                    $productExists["discount_type"] ??
                    "none"
                )
            )
        );

    $oldDiscountValue =
        round(
            (float) (
                $productExists["discount_value"] ??
                0
            ),
            2
        );

    $oldDiscountSchedule =
        strtolower(
            trim(
                (string) (
                    $productExists["discount_schedule"] ??
                    "permanent"
                )
            )
        );

    $oldDiscountStart =
        $productExists["discount_start"] ??
        null;

    $oldDiscountEnd =
        $productExists["discount_end"] ??
        null;

    $oldDiscountStatus =
        trim(
            (string) (
                $productExists["discount_status"] ??
                "Inactive"
            )
        );

    if ($oldProductName !== $product_name) {
        $changes[] =
            'Name: "' .
            $oldProductName .
            '" → "' .
            $product_name .
            '"';
    }

    if ($oldCategory !== $category) {
        $changes[] =
            "Category: " .
            (
                $oldCategory !== ""
                    ? $oldCategory
                    : "Uncategorized"
            ) .
            " → " .
            $category;
    }

    if ($oldSize !== $size) {
        $changes[] =
            "Variant: " .
            (
                $oldSize !== ""
                    ? $oldSize
                    : "None"
            ) .
            " → " .
            (
                $size !== ""
                    ? $size
                    : "None"
            );
    }

    if (abs($oldPrice - $price) >= 0.01) {
        $changes[] =
            "Price: ₱" .
            number_format(
                $oldPrice,
                2
            ) .
            " → ₱" .
            number_format(
                $price,
                2
            );
    }

    if ($oldStock !== $stock) {
        $changes[] =
            "Stock: " .
            number_format(
                $oldStock
            ) .
            " → " .
            number_format(
                $stock
            );
    }

    if (
        strtolower($oldStatus) !==
        strtolower($status)
    ) {
        $changes[] =
            "Status: " .
            (
                $oldStatus !== ""
                    ? $oldStatus
                    : "Unknown"
            ) .
            " → " .
            $status;
    }

    $formatPromotion = static function (
        string $type,
        float $value,
        string $schedule,
        ?string $start,
        ?string $end,
        string $promoStatus
    ): string {
        if (
            $type === "none" ||
            $value <= 0
        ) {
            return "None";
        }

        if ($type === "percentage") {
            $label =
                number_format(
                    $value,
                    2
                ) .
                "% discount";
        } else {
            $label =
                "₱" .
                number_format(
                    $value,
                    2
                ) .
                " fixed discount";
        }

        $label .=
            " (" .
            $promoStatus;

        if (
            $schedule === "scheduled" &&
            $start &&
            $end
        ) {
            $label .=
                ", scheduled " .
                $start .
                " to " .
                $end;
        } else {
            $label .=
                ", permanent";
        }

        return $label . ")";
    };

    $oldPromotion =
        $formatPromotion(
            $oldDiscountType,
            $oldDiscountValue,
            $oldDiscountSchedule,
            $oldDiscountStart,
            $oldDiscountEnd,
            $oldDiscountStatus
        );

    $newPromotion =
        $formatPromotion(
            $discount_type,
            $discount_value,
            $discount_schedule,
            $discount_start,
            $discount_end,
            $discount_status
        );

    if ($oldPromotion !== $newPromotion) {
        $changes[] =
            "Promotion: " .
            $oldPromotion .
            " → " .
            $newPromotion;
    }

    $oldImageValue =
        trim(
            (string) (
                $oldImagePath ??
                ""
            )
        );

    $newImageValue =
        trim(
            (string) (
                $newImagePath ??
                ""
            )
        );

    if ($oldImageValue !== $newImageValue) {
        if (
            $oldImageValue === "" &&
            $newImageValue !== ""
        ) {
            $changes[] =
                "Product image added.";
        } elseif (
            $oldImageValue !== "" &&
            $newImageValue === ""
        ) {
            $changes[] =
                "Product image removed.";
        } else {
            $changes[] =
                "Product image replaced.";
        }
    }

    /* =====================================================
       NO CHANGES
    ===================================================== */

    if (!$changes) {
        if ($uploadedNewImage) {
            delete_product_image(
                $newImagePath
            );
        }

        $conn->rollback();

        respond_json([
            "success" => true,
            "message" =>
                "No product changes were detected.",
            "no_changes" => true,
            "product" => [
                "product_id" =>
                    $product_id
            ]
        ]);
    }

    /* =====================================================
       UPDATE PRODUCT
    ===================================================== */

    $stmt = $conn->prepare("
        UPDATE tbl_products
        SET
            product_name = ?,
            category = ?,
            size = ?,
            price = ?,
            stock = ?,
            status = ?,
            image_path = ?,
            discount_type = ?,
            discount_value = ?,
            discount_schedule = ?,
            discount_start = ?,
            discount_end = ?,
            discount_status = ?
        WHERE product_id = ?
          AND restaurant_id = ?
    ");

    if (!$stmt) {
        throw new RuntimeException(
            "Unable to prepare the product update."
        );
    }

    $stmt->bind_param(
        "sssdisssdssssii",
        $product_name,
        $category,
        $size,
        $price,
        $stock,
        $status,
        $newImagePath,
        $discount_type,
        $discount_value,
        $discount_schedule,
        $discount_start,
        $discount_end,
        $discount_status,
        $product_id,
        $restaurant_id
    );

    if (!$stmt->execute()) {
        $stmt->close();

        throw new RuntimeException(
            "Failed to update product."
        );
    }

    if ($stmt->affected_rows !== 1) {
        $stmt->close();

        throw new RuntimeException(
            "The product was not updated."
        );
    }

    $stmt->close();

    /* =====================================================
       PRODUCT UPDATED ACTIVITY
    ===================================================== */

    $actionTitle =
        "Product Updated";

    $actionDescription =
        "Product: " .
        $product_name .
        "\nChanges:\n" .
        implode(
            "\n",
            $changes
        );

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
            ?,
            'product',
            ?,
            ?
        )
    ");

    if (!$logStmt) {
        throw new RuntimeException(
            "Unable to prepare the product activity log."
        );
    }

    $logStmt->bind_param(
        "iisss",
        $restaurant_id,
        $user_id,
        $role,
        $actionTitle,
        $actionDescription
    );

    if (!$logStmt->execute()) {
        $logStmt->close();

        throw new RuntimeException(
            "Unable to record the product update."
        );
    }

    $logStmt->close();

    $conn->commit();

    /* =====================================================
       DELETE REPLACED IMAGE AFTER COMMIT
    ===================================================== */

    if (
        (
            $uploadedNewImage ||
            $removeImage
        ) &&
        !empty($oldImagePath) &&
        $oldImagePath !== $newImagePath
    ) {
        delete_product_image(
            $oldImagePath
        );
    }

    respond_json([
        "success" => true,
        "message" =>
            "Product updated successfully.",
        "no_changes" => false,
        "changes" => $changes,
        "product" => [
            "product_id" =>
                $product_id,

            "id" =>
                $product_id,

            "product_name" =>
                $product_name,

            "name" =>
                $product_name,

            "category" =>
                $category,

            "size" =>
                $size,

            "price" =>
                $price,

            "stock" =>
                $stock,

            "status" =>
                $status,

            "image_path" =>
                $newImagePath,

            "image" =>
                $newImagePath,

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
                $discount_status
        ]
    ]);

} catch (Throwable $error) {

    try {
        $conn->rollback();
    } catch (Throwable $rollbackError) {
        error_log(
            "update_product.php rollback error: " .
            $rollbackError->getMessage()
        );
    }

    if ($uploadedNewImage) {
        delete_product_image(
            $newImagePath
        );
    }

    error_log(
        "update_product.php error: " .
        $error->getMessage()
    );

    respond_json([
        "success" => false,
        "message" =>
            "Unable to update the product completely. Please try again."
    ], 500);
}

/* =========================================================
   PROCESS IMAGE CHANGE
========================================================= */

if (
    isset($_FILES["product_image"]) &&
    (
        $_FILES["product_image"]["error"] ??
        UPLOAD_ERR_NO_FILE
    ) !== UPLOAD_ERR_NO_FILE
) {
    try {
        $newImagePath =
            save_product_image(
                $_FILES["product_image"],
                $restaurant_id
            );

        $uploadedNewImage = true;
    } catch (RuntimeException $error) {
        respond_json([
            "success" => false,
            "message" =>
                $error->getMessage()
        ], 422);
    }
} elseif ($removeImage) {
    $newImagePath = null;
}

/* =========================================================
   CHECK DUPLICATE PRODUCT
========================================================= */

$duplicateStmt = $conn->prepare("
    SELECT
        product_id
    FROM tbl_products
    WHERE restaurant_id = ?
      AND product_id <> ?
      AND LOWER(TRIM(product_name)) =
          LOWER(TRIM(?))
      AND LOWER(TRIM(category)) =
          LOWER(TRIM(?))
      AND LOWER(
          TRIM(
              COALESCE(size, '')
          )
      ) = LOWER(TRIM(?))
    LIMIT 1
");

if (!$duplicateStmt) {
    if ($uploadedNewImage) {
        delete_product_image(
            $newImagePath
        );
    }

    error_log(
        "update_product.php duplicate prepare error: " .
        $conn->error
    );

    respond_json([
        "success" => false,
        "message" =>
            "Unable to validate duplicate products."
    ], 500);
}

$duplicateStmt->bind_param(
    "iisss",
    $restaurant_id,
    $product_id,
    $product_name,
    $category,
    $size
);

$duplicateStmt->execute();

$duplicateProduct = $duplicateStmt
    ->get_result()
    ->fetch_assoc();

$duplicateStmt->close();

if ($duplicateProduct) {
    if ($uploadedNewImage) {
        delete_product_image(
            $newImagePath
        );
    }

    respond_json([
        "success" => false,
        "message" =>
            "A product with the same name, category, and variant already exists."
    ], 409);
}

/* =========================================================
   UPDATE PRODUCT
========================================================= */

$stmt = $conn->prepare("
    UPDATE tbl_products
    SET
        product_name = ?,
        category = ?,
        size = ?,
        price = ?,
        stock = ?,
        status = ?,
        image_path = ?,
        discount_type = ?,
        discount_value = ?,
        discount_schedule = ?,
        discount_start = ?,
        discount_end = ?,
        discount_status = ?
    WHERE product_id = ?
      AND restaurant_id = ?
");

if (!$stmt) {
    if ($uploadedNewImage) {
        delete_product_image(
            $newImagePath
        );
    }

    error_log(
        "update_product.php update prepare error: " .
        $conn->error
    );

    respond_json([
        "success" => false,
        "message" =>
            "Unable to prepare the product update."
    ], 500);
}

$stmt->bind_param(
    "sssdisssdssssii",
    $product_name,
    $category,
    $size,
    $price,
    $stock,
    $status,
    $newImagePath,
    $discount_type,
    $discount_value,
    $discount_schedule,
    $discount_start,
    $discount_end,
    $discount_status,
    $product_id,
    $restaurant_id
);

if (!$stmt->execute()) {
    error_log(
        "update_product.php execute error: " .
        $stmt->error
    );

    $stmt->close();

    if ($uploadedNewImage) {
        delete_product_image(
            $newImagePath
        );
    }

    respond_json([
        "success" => false,
        "message" =>
            "Failed to update product."
    ], 500);
}

$stmt->close();

/* =========================================================
   DELETE OLD IMAGE AFTER SUCCESS
========================================================= */

if (
    (
        $uploadedNewImage ||
        $removeImage
    ) &&
    !empty($oldImagePath)
) {
    delete_product_image(
        $oldImagePath
    );
}

/* =========================================================
   SUCCESS RESPONSE
========================================================= */

respond_json([
    "success" => true,
    "message" =>
        "Product updated successfully.",
    "product" => [
        "product_id" => $product_id,
        "id" => $product_id,
        "product_name" => $product_name,
        "name" => $product_name,
        "category" => $category,
        "size" => $size,
        "price" => $price,
        "stock" => $stock,
                "status" => $status,
        "image_path" => $newImagePath,
        "image" => $newImagePath,
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
            $discount_status
    ]
]);