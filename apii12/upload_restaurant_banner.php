<?php

header(
    "Content-Type: application/json; charset=utf-8"
);

header(
    "Cache-Control: no-store, no-cache, must-revalidate"
);

header(
    "Pragma: no-cache"
);

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
    "/",
    "",
    false,
    true
);

require_once __DIR__ . "/session_config.php";

function respond_json(
    array $data,
    int $statusCode = 200
): void {
    http_response_code(
        $statusCode
    );

    echo json_encode(
        $data,
        JSON_UNESCAPED_UNICODE
    );

    exit;
}

/* =========================================================
   OWNER AUTHENTICATION
   ========================================================= */

if (empty($_SESSION["user_id"])) {
    respond_json(
        [
            "success" => false,
            "message" =>
                "Please log in as a restaurant owner."
        ],
        401
    );
}

$role =
    strtolower(
        trim(
            (string) (
                $_SESSION["role"] ?? ""
            )
        )
    );

if ($role !== "owner") {
    respond_json(
        [
            "success" => false,
            "message" =>
                "Only restaurant owners can upload a restaurant banner."
        ],
        403
    );
}

$ownerId =
    (int) $_SESSION["user_id"];

if ($ownerId <= 0) {
    respond_json(
        [
            "success" => false,
            "message" =>
                "Invalid restaurant owner session."
        ],
        401
    );
}

/* =========================================================
   POST REQUEST ONLY
   ========================================================= */

if (
    strtoupper(
        (string) (
            $_SERVER["REQUEST_METHOD"] ?? ""
        )
    ) !== "POST"
) {
    header(
        "Allow: POST"
    );

    respond_json(
        [
            "success" => false,
            "message" =>
                "This action is not available."
        ],
        405
    );
}

/* =========================================================
   VALIDATE UPLOAD
   ========================================================= */

if (
    !isset(
        $_FILES["restaurant_banner"]
    )
) {
    respond_json(
        [
            "success" => false,
            "message" =>
                "Select a restaurant banner to upload."
        ],
        422
    );
}

$bannerFile =
    $_FILES["restaurant_banner"];

$uploadError =
    (int) (
        $bannerFile["error"] ??
        UPLOAD_ERR_NO_FILE
    );

if ($uploadError !== UPLOAD_ERR_OK) {
    $message =
        "The restaurant banner could not be uploaded.";

    if (
        $uploadError ===
        UPLOAD_ERR_INI_SIZE ||
        $uploadError ===
        UPLOAD_ERR_FORM_SIZE
    ) {
        $message =
            "The selected banner is too large.";
    }

    if (
        $uploadError ===
        UPLOAD_ERR_NO_FILE
    ) {
        $message =
            "Select a restaurant banner to upload.";
    }

    respond_json(
        [
            "success" => false,
            "message" => $message
        ],
        422
    );
}

$temporaryPath =
    (string) (
        $bannerFile["tmp_name"] ?? ""
    );

$originalName =
    (string) (
        $bannerFile["name"] ?? ""
    );

$fileSize =
    (int) (
        $bannerFile["size"] ?? 0
    );

if (
    $temporaryPath === "" ||
    !is_uploaded_file(
        $temporaryPath
    )
) {
    respond_json(
        [
            "success" => false,
            "message" =>
                "The uploaded banner file is invalid."
        ],
        422
    );
}

/* =========================================================
   FILE SIZE LIMIT
   ========================================================= */

$maximumFileSize =
    2 * 1024 * 1024;

if (
    $fileSize <= 0 ||
    $fileSize > $maximumFileSize
) {
    respond_json(
        [
            "success" => false,
            "message" =>
                "The restaurant banner must not exceed 2 MB."
        ],
        422
    );
}

/* =========================================================
   MIME TYPE VALIDATION
   ========================================================= */

$fileInfo =
    new finfo(
        FILEINFO_MIME_TYPE
    );

$mimeType =
    $fileInfo->file(
        $temporaryPath
    );

$allowedTypes = [
    "image/jpeg" => "jpg",
    "image/png" => "png",
    "image/webp" => "webp"
];

if (
    !isset(
        $allowedTypes[$mimeType]
    )
) {
    respond_json(
        [
            "success" => false,
            "message" =>
                "Only JPG, PNG, and WEBP banner files are allowed."
        ],
        422
    );
}

/* =========================================================
   IMAGE VALIDATION
   ========================================================= */

$imageInformation =
    @getimagesize(
        $temporaryPath
    );

if ($imageInformation === false) {
    respond_json(
        [
            "success" => false,
            "message" =>
                "The selected file is not a valid image."
        ],
        422
    );
}

$imageWidth =
    (int) (
        $imageInformation[0] ?? 0
    );

$imageHeight =
    (int) (
        $imageInformation[1] ?? 0
    );

if (
    $imageWidth <= 0 ||
    $imageHeight <= 0
) {
    respond_json(
        [
            "success" => false,
            "message" =>
                "The selected banner has invalid dimensions."
        ],
        422
    );
}

/* =========================================================
   CREATE OWNER UPLOAD DIRECTORY
   ========================================================= */

$projectRoot =
    dirname(
        __DIR__
    );

$relativeDirectory =
    "uploads/restaurant_banners/owner_" .
    $ownerId;

$absoluteDirectory =
    $projectRoot .
    DIRECTORY_SEPARATOR .
    str_replace(
        "/",
        DIRECTORY_SEPARATOR,
        $relativeDirectory
    );

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
    respond_json(
        [
            "success" => false,
            "message" =>
                "Unable to create the restaurant banner folder."
        ],
        500
    );
}

/* =========================================================
   GENERATE SAFE FILE NAME
   ========================================================= */

$extension =
    $allowedTypes[$mimeType];

$randomName =
    bin2hex(
        random_bytes(8)
    );

$fileName =
    "restaurant_banner_" .
    date("Ymd_His") .
    "_" .
    $randomName .
    "." .
    $extension;

$absolutePath =
    $absoluteDirectory .
    DIRECTORY_SEPARATOR .
    $fileName;

$relativePath =
    $relativeDirectory .
    "/" .
    $fileName;

/* =========================================================
   MOVE UPLOADED FILE
   ========================================================= */

if (
    !move_uploaded_file(
        $temporaryPath,
        $absolutePath
    )
) {
    respond_json(
        [
            "success" => false,
            "message" =>
                "Unable to save the restaurant banner."
        ],
        500
    );
}

/* =========================================================
   SUCCESS RESPONSE
   ========================================================= */

respond_json(
    [
        "success" => true,
        "message" =>
            "Restaurant banner uploaded successfully.",
        "banner_path" =>
            $relativePath,
        "banner_url" =>
            "/" .
            $relativePath,
        "original_name" =>
            $originalName
    ]
);