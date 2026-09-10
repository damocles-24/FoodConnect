<?php

function normalize_product_image_path(
    ?string $imagePath
): ?string {
    $imagePath = trim(
        (string) $imagePath
    );

    if ($imagePath === "") {
        return null;
    }

    /*
     * Support legacy rows created while FoodConnect lived in
     * /FoodConnect. Production now serves public_html as the
     * domain root, so the browser URL must begin with /uploads.
     */
    if (
        preg_match(
            '~^https?://[^/]+(?P<path>/.*)$~i',
            $imagePath,
            $matches
        )
    ) {
        $candidate =
            (string) (
                $matches["path"] ?? ""
            );

        if (
            preg_match(
                '~^/(?:FoodConnect/)?uploads/product_images/~i',
                $candidate
            )
        ) {
            $imagePath = $candidate;
        }
    }

    $imagePath = preg_replace(
        '~^/FoodConnect(?=/uploads/product_images/)~i',
        '',
        $imagePath
    );

    $imagePath = preg_replace(
        '~^FoodConnect(?=/uploads/product_images/)~i',
        '',
        $imagePath
    );

    if (
        strpos(
            $imagePath,
            "uploads/product_images/"
        ) === 0
    ) {
        $imagePath =
            "/" . $imagePath;
    }

    return $imagePath;
}

function save_product_image(
    array $file,
    int $restaurantId
): string {
    if (
        empty($file["tmp_name"]) ||
        !isset($file["error"])
    ) {
        throw new RuntimeException(
            "No product image was uploaded."
        );
    }

    if (
        $file["error"] !==
        UPLOAD_ERR_OK
    ) {
        throw new RuntimeException(
            "The product image upload failed."
        );
    }

    $maxSize = 2 * 1024 * 1024;

    if (
        (int) $file["size"] >
        $maxSize
    ) {
        throw new RuntimeException(
            "Product image cannot exceed 2 MB."
        );
    }

    $finfo = new finfo(
        FILEINFO_MIME_TYPE
    );

    $mime = $finfo->file(
        $file["tmp_name"]
    );

    $extensions = [
        "image/jpeg" => "jpg",
        "image/png" => "png",
        "image/webp" => "webp"
    ];

    if (
        !isset(
            $extensions[$mime]
        )
    ) {
        throw new RuntimeException(
            "Product image must be JPG, PNG, or WEBP."
        );
    }

    if (
        getimagesize(
            $file["tmp_name"]
        ) === false
    ) {
        throw new RuntimeException(
            "The uploaded file is not a valid image."
        );
    }

    $rootDirectory =
        dirname(__DIR__);

    $relativeDirectory =
        "uploads/product_images/" .
        "restaurant_" .
        $restaurantId;

    $absoluteDirectory =
        $rootDirectory .
        "/" .
        $relativeDirectory;

    if (
        !is_dir(
            $absoluteDirectory
        ) &&
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

    $filename =
        "product_" .
        bin2hex(
            random_bytes(16)
        ) .
        "." .
        $extensions[$mime];

    $absolutePath =
        $absoluteDirectory .
        "/" .
        $filename;

    if (
        !move_uploaded_file(
            $file["tmp_name"],
            $absolutePath
        )
    ) {
        throw new RuntimeException(
            "Unable to save the product image."
        );
    }

    return
        "/" .
        $relativeDirectory .
        "/" .
        $filename;
}

function delete_product_image(
    ?string $imagePath
): void {
    $imagePath =
        normalize_product_image_path(
            $imagePath
        );

    $allowedPrefix =
        "/uploads/product_images/";

if (
    $imagePath === "" ||
    strpos(
        $imagePath,
        $allowedPrefix
    ) !== 0
) {
    return;
}

    $relativePath =
        substr(
            $imagePath,
            strlen(
                "/"
            )
        );

    $absolutePath =
        dirname(__DIR__) .
        "/" .
        $relativePath;

    if (
        is_file(
            $absolutePath
        )
    ) {
        unlink(
            $absolutePath
        );
    }
}