<?php

declare(strict_types=1);

header("Content-Type: application/json; charset=utf-8");
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");

require_once __DIR__ . "/session_config.php";
require_once __DIR__ . "/db.php";

function respond_json(array $data, int $statusCode = 200): void
{
    http_response_code($statusCode);
    echo json_encode(
        $data,
        JSON_UNESCAPED_UNICODE |
        JSON_UNESCAPED_SLASHES
    );
    exit;
}

if (
    strtoupper((string)($_SERVER["REQUEST_METHOD"] ?? "")) !== "POST"
) {
    respond_json([
        "success" => false,
        "message" => "This action is not available."
    ], 405);
}

if (
    empty($_SESSION["user_id"]) ||
    empty($_SESSION["restaurant_id"])
) {
    respond_json([
        "success" => false,
        "message" => "Unauthorized. Please login first."
    ], 401);
}

$userId = (int)$_SESSION["user_id"];
$restaurantId = (int)$_SESSION["restaurant_id"];
$role = strtolower(trim((string)($_SESSION["role"] ?? "")));

if (
    $userId <= 0 ||
    $restaurantId <= 0 ||
    $role !== "owner"
) {
    respond_json([
        "success" => false,
        "message" => "Owner access is required."
    ], 403);
}

/* Verify restaurant isolation and ownership. */
$ownerStmt = $conn->prepare("
    SELECT r.restaurant_id
    FROM tbl_restaurants r
    INNER JOIN tbl_users u
        ON u.user_id = r.owner_id
    WHERE r.restaurant_id = ?
      AND r.owner_id = ?
      AND LOWER(u.role) = 'owner'
    LIMIT 1
");

if (!$ownerStmt) {
    respond_json([
        "success" => false,
        "message" => "Unable to verify the owner account."
    ], 500);
}

$ownerStmt->bind_param("ii", $restaurantId, $userId);
$ownerStmt->execute();
$owner = $ownerStmt->get_result()->fetch_assoc();
$ownerStmt->close();

if (!$owner) {
    respond_json([
        "success" => false,
        "message" => "Invalid owner restaurant session."
    ], 403);
}

$productName = trim((string)($_POST["product_name"] ?? ""));
$category = trim((string)($_POST["category"] ?? ""));
$descriptionRaw = trim((string)($_POST["description"] ?? ""));
$description = $descriptionRaw === "" ? null : $descriptionRaw;
$variantsRaw = trim((string)($_POST["variants_json"] ?? ""));

if ($productName === "" || mb_strlen($productName) > 150) {
    respond_json([
        "success" => false,
        "message" => "Enter a valid product name."
    ], 422);
}

if ($category === "" || mb_strlen($category) > 50) {
    respond_json([
        "success" => false,
        "message" => "Enter a valid product category."
    ], 422);
}

if (mb_strlen($descriptionRaw) > 1000) {
    respond_json([
        "success" => false,
        "message" => "Product description cannot exceed 1000 characters."
    ], 422);
}

$variants = json_decode($variantsRaw, true);

if (!is_array($variants)) {
    respond_json([
        "success" => false,
        "message" => "Variant data is invalid."
    ], 422);
}

if (count($variants) < 2 || count($variants) > 12) {
    respond_json([
        "success" => false,
        "message" => "Add between 2 and 12 variants."
    ], 422);
}

$cleanVariants = [];
$seenLabels = [];

foreach ($variants as $index => $variant) {
    if (!is_array($variant)) {
        respond_json([
            "success" => false,
            "message" => "One or more variants are invalid."
        ], 422);
    }

    $label = trim((string)($variant["label"] ?? ""));
    $priceRaw = $variant["price"] ?? null;
    $stockRaw = $variant["stock"] ?? null;
    $statusRaw = strtolower(trim((string)($variant["status"] ?? "available")));

    if ($label === "" || mb_strlen($label) > 20) {
        respond_json([
            "success" => false,
            "message" =>
                "Every variant needs a label of 20 characters or fewer."
        ], 422);
    }

    $labelKey = mb_strtolower(
        preg_replace('/\s+/', ' ', $label)
    );

    if (isset($seenLabels[$labelKey])) {
        respond_json([
            "success" => false,
            "message" => "Duplicate variant: " . $label . "."
        ], 422);
    }

    $seenLabels[$labelKey] = true;

    $price = filter_var(
        $priceRaw,
        FILTER_VALIDATE_FLOAT
    );

    $stock = filter_var(
        $stockRaw,
        FILTER_VALIDATE_INT
    );

    if (
        $price === false ||
        (float)$price <= 0 ||
        (float)$price > 99999999.99
    ) {
        respond_json([
            "success" => false,
            "message" =>
                $label . ": price must be between PHP 0.01 and PHP 99,999,999.99."
        ], 422);
    }

    if ($stock === false || (int)$stock < 0) {
        respond_json([
            "success" => false,
            "message" =>
                $label . ": stock must be zero or a positive whole number."
        ], 422);
    }

    $statusMap = [
        "available" => "Available",
        "unavailable" => "Unavailable"
    ];

    if (!isset($statusMap[$statusRaw])) {
        respond_json([
            "success" => false,
            "message" =>
                $label . ": invalid availability status."
        ], 422);
    }

    $cleanVariants[] = [
        "label" => $label,
        "price" => round((float)$price, 2),
        "stock" => (int)$stock,
        "status" => $statusMap[$statusRaw]
    ];
}

/* Promotion shared across variants at creation time. */
$discountType = strtolower(
    trim((string)($_POST["discount_type"] ?? "none"))
);

$discountValue = filter_var(
    $_POST["discount_value"] ?? 0,
    FILTER_VALIDATE_FLOAT
);

$discountSchedule = strtolower(
    trim((string)($_POST["discount_schedule"] ?? "permanent"))
);

$discountStatusRaw = strtolower(
    trim((string)($_POST["discount_status"] ?? "inactive"))
);

$discountStartRaw = trim(
    (string)($_POST["discount_start"] ?? "")
);

$discountEndRaw = trim(
    (string)($_POST["discount_end"] ?? "")
);

if (
    !in_array(
        $discountType,
        ["none", "percentage", "fixed"],
        true
    )
) {
    respond_json([
        "success" => false,
        "message" => "Invalid discount type."
    ], 422);
}

if (
    !in_array(
        $discountSchedule,
        ["permanent", "scheduled"],
        true
    )
) {
    respond_json([
        "success" => false,
        "message" => "Invalid discount duration."
    ], 422);
}

$statusMap = [
    "active" => "Active",
    "inactive" => "Inactive"
];

if (!isset($statusMap[$discountStatusRaw])) {
    respond_json([
        "success" => false,
        "message" => "Promo status must be Active or Inactive."
    ], 422);
}

$discountStatus = $statusMap[$discountStatusRaw];

if ($discountValue === false || (float)$discountValue < 0) {
    respond_json([
        "success" => false,
        "message" => "Discount value cannot be negative."
    ], 422);
}

$discountValue = round((float)$discountValue, 2);
$discountStart = null;
$discountEnd = null;

if ($discountType === "none") {
    $discountValue = 0.00;
    $discountSchedule = "permanent";
    $discountStatus = "Inactive";
} else {
    if ($discountValue <= 0) {
        respond_json([
            "success" => false,
            "message" => "Discount value must be greater than zero."
        ], 422);
    }

    if (
        $discountType === "percentage" &&
        $discountValue > 100
    ) {
        respond_json([
            "success" => false,
            "message" => "Percentage discount cannot exceed 100%."
        ], 422);
    }

    if ($discountType === "fixed") {
        $minimumPrice = min(
            array_column(
                $cleanVariants,
                "price"
            )
        );

        if ($discountValue > $minimumPrice) {
            respond_json([
                "success" => false,
                "message" =>
                    "Fixed discount cannot exceed the lowest variant price."
            ], 422);
        }
    }

    if ($discountSchedule === "scheduled") {
        $startObject = DateTime::createFromFormat(
            "Y-m-d\TH:i",
            $discountStartRaw
        );

        $endObject = DateTime::createFromFormat(
            "Y-m-d\TH:i",
            $discountEndRaw
        );

        if (!$startObject || !$endObject) {
            respond_json([
                "success" => false,
                "message" =>
                    "Valid promo start and end dates are required."
            ], 422);
        }

        if ($endObject <= $startObject) {
            respond_json([
                "success" => false,
                "message" =>
                    "Promo end date must be later than its start date."
            ], 422);
        }

        $discountStart = $startObject->format(
            "Y-m-d H:i:s"
        );

        $discountEnd = $endObject->format(
            "Y-m-d H:i:s"
        );
    }
}

/* Validate optional image once, then copy it to one unique file per variant. */
$imageFile = $_FILES["product_image"] ?? null;
$imageExtension = null;

if (
    is_array($imageFile) &&
    ($imageFile["error"] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_NO_FILE
) {
    if (($imageFile["error"] ?? -1) !== UPLOAD_ERR_OK) {
        respond_json([
            "success" => false,
            "message" => "The product image upload failed."
        ], 422);
    }

    if ((int)($imageFile["size"] ?? 0) > 2 * 1024 * 1024) {
        respond_json([
            "success" => false,
            "message" => "Product image cannot exceed 2 MB."
        ], 422);
    }

    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mime = $finfo->file(
        (string)$imageFile["tmp_name"]
    );

    $extensions = [
        "image/jpeg" => "jpg",
        "image/png" => "png",
        "image/webp" => "webp"
    ];

    if (
        !isset($extensions[$mime]) ||
        getimagesize(
            (string)$imageFile["tmp_name"]
        ) === false
    ) {
        respond_json([
            "success" => false,
            "message" =>
                "Product image must be a valid JPG, PNG, or WEBP image."
        ], 422);
    }

    $imageExtension = $extensions[$mime];
}

/* Validate duplicates before creating anything. */
$duplicateStmt = $conn->prepare("
    SELECT product_id
    FROM tbl_products
    WHERE restaurant_id = ?
      AND LOWER(TRIM(product_name)) = LOWER(TRIM(?))
      AND LOWER(TRIM(category)) = LOWER(TRIM(?))
      AND LOWER(TRIM(COALESCE(size, ''))) = LOWER(TRIM(?))
    LIMIT 1
");

if (!$duplicateStmt) {
    respond_json([
        "success" => false,
        "message" => "Unable to validate existing product variants."
    ], 500);
}

foreach ($cleanVariants as $variant) {
    $label = $variant["label"];

    $duplicateStmt->bind_param(
        "isss",
        $restaurantId,
        $productName,
        $category,
        $label
    );

    $duplicateStmt->execute();

    if (
        $duplicateStmt
            ->get_result()
            ->fetch_assoc()
    ) {
        $duplicateStmt->close();

        respond_json([
            "success" => false,
            "message" =>
                "Variant \"" . $label . "\" already exists for this product."
        ], 409);
    }
}

$duplicateStmt->close();

$createdImageAbsolutePaths = [];
$createdProductIds = [];

$conn->begin_transaction();

try {
    $insertStmt = $conn->prepare("
        INSERT INTO tbl_products (
            restaurant_id,
            product_name,
            category,
            description,
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
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");

    if (!$insertStmt) {
        throw new RuntimeException(
            "Unable to prepare variant insertion."
        );
    }

    $rootDirectory = dirname(__DIR__);

    $relativeDirectory =
        "uploads/product_images/restaurant_" .
        $restaurantId;

    $absoluteDirectory =
        $rootDirectory . "/" .
        $relativeDirectory;

    if (
        $imageExtension !== null &&
        !is_dir($absoluteDirectory) &&
        !mkdir(
            $absoluteDirectory,
            0755,
            true
        )
    ) {
        throw new RuntimeException(
            "Unable to create the product image directory."
        );
    }

    foreach ($cleanVariants as $variant) {
        $imagePath = null;

        if ($imageExtension !== null) {
            $filename =
                "product_" .
                bin2hex(random_bytes(16)) .
                "." .
                $imageExtension;

            $absolutePath =
                $absoluteDirectory .
                "/" .
                $filename;

            if (
                !copy(
                    (string)$imageFile["tmp_name"],
                    $absolutePath
                )
            ) {
                throw new RuntimeException(
                    "Unable to save a variant image."
                );
            }

            $createdImageAbsolutePaths[] =
                $absolutePath;

            $imagePath =
                "/FoodConnect/" .
                $relativeDirectory .
                "/" .
                $filename;
        }

        $label = $variant["label"];
        $price = $variant["price"];
        $stock = $variant["stock"];
        $status = $variant["status"];

        $insertStmt->bind_param(
            "issssdisssdssss",
            $restaurantId,
            $productName,
            $category,
            $description,
            $label,
            $price,
            $stock,
            $status,
            $imagePath,
            $discountType,
            $discountValue,
            $discountSchedule,
            $discountStart,
            $discountEnd,
            $discountStatus
        );

        if (!$insertStmt->execute()) {
            throw new RuntimeException(
                "Unable to save variant \"" .
                $label .
                "\"."
            );
        }

        $createdProductIds[] =
            (int)$insertStmt->insert_id;
    }

    $insertStmt->close();

    $variantDescription =
        implode(
            ", ",
            array_map(
                static function (array $variant): string {
                    return
                        $variant["label"] .
                        " ₱" .
                        number_format(
                            (float)$variant["price"],
                            2
                        ) .
                        " (stock " .
                        (int)$variant["stock"] .
                        ")";
                },
                $cleanVariants
            )
        );

    $logTitle =
        "Product Variants Added";

    $logDescription =
        "Product: " .
        $productName .
        "\nCategory: " .
        $category .
        "\nVariants: " .
        $variantDescription;

    $logStmt = $conn->prepare("
        INSERT INTO tbl_activity_logs (
            restaurant_id,
            user_id,
            user_role,
            action_type,
            action_title,
            action_description
        )
        VALUES (?, ?, ?, 'product', ?, ?)
    ");

    if (!$logStmt) {
        throw new RuntimeException(
            "Unable to prepare product activity."
        );
    }

    $logStmt->bind_param(
        "iisss",
        $restaurantId,
        $userId,
        $role,
        $logTitle,
        $logDescription
    );

    if (!$logStmt->execute()) {
        throw new RuntimeException(
            "Unable to save product activity."
        );
    }

    $logStmt->close();

    $conn->commit();

    respond_json([
        "success" => true,
        "message" =>
            "Product added with " .
            count($cleanVariants) .
            " variants.",
        "product_ids" =>
            $createdProductIds,
        "variant_count" =>
            count($cleanVariants)
    ]);
} catch (Throwable $error) {
    $conn->rollback();

    foreach (
        $createdImageAbsolutePaths
        as $path
    ) {
        if (is_file($path)) {
            @unlink($path);
        }
    }

    error_log(
        "add_product_variants.php error: " .
        $error->getMessage()
    );

    respond_json([
        "success" => false,
        "message" =>
            "The product variants could not be saved completely. No partial variants were kept."
    ], 500);
}
