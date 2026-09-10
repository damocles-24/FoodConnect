<?php

header(
    "Content-Type: application/json; charset=utf-8"
);

require_once __DIR__ . "/session_config.php";
require_once __DIR__ . "/db.php";
require_once __DIR__ . "/ph_phone.php";
require_once __DIR__ . "/delivery_pricing_helper.php";

/* =========================================================
   JSON RESPONSE
========================================================= */

function respond_json(
    array $data,
    int $statusCode = 200
): never {
    http_response_code($statusCode);

    echo json_encode(
        $data,
        JSON_UNESCAPED_UNICODE |
        JSON_UNESCAPED_SLASHES
    );

    exit;
}

/* =========================================================
   SESSION VALIDATION
========================================================= */

if (!isset($_SESSION["user_id"])) {
    respond_json(
        [
            "success" => false,
            "message" => "Your session has expired or you do not have access. Please log in again."
        ],
        401
    );
}

$owner_id =
    (int) $_SESSION["user_id"];

$restaurant_id =
    isset($_SESSION["restaurant_id"])
        ? (int) $_SESSION["restaurant_id"]
        : 0;

if ($restaurant_id <= 0) {
    respond_json(
        [
            "success" => false,
            "message" =>
                "Your restaurant session has expired. Please log in again."
        ],
        403
    );
}

/* =========================================================
   REQUEST DATA
========================================================= */

$data = json_decode(
    file_get_contents("php://input"),
    true
);

if (!is_array($data)) {
    respond_json(
        [
            "success" => false,
            "message" =>
                "Invalid settings request."
        ],
        400
    );
}

/* =========================================================
   NORMALIZATION
========================================================= */

function normalize_single_line_text(
    string $value
): string {
    return trim(
        preg_replace(
            "/\s+/u",
            " ",
            $value
        ) ?? ""
    );
}

$name = normalize_single_line_text(
    (string) (
        $data["name"] ?? ""
    )
);

$address = trim(
    (string) (
        $data["address"] ?? ""
    )
);

$address = preg_replace(
    "/[ \t]+/u",
    " ",
    $address
) ?? "";

$contact_number = normalize_ph_mobile($data["contact_number"] ?? "");

$opening_hours =
    normalize_single_line_text(
        (string) (
            $data["opening_hours"] ?? ""
        )
    );

$delivery_fee =
    isset($data["delivery_fee"])
        ? (float) $data["delivery_fee"]
        : 0;

try {
    $deliveryPricing =
        fc_delivery_pricing_normalize(
            $data,
            $delivery_fee,
            true
        );
} catch (InvalidArgumentException $error) {
    respond_json(
        [
            "success" => false,
            "message" =>
                $error->getMessage()
        ],
        422
    );
}

$delivery_fee =
    (float) $deliveryPricing["legacy_fee"];

$deliveryPricingType =
    (string) $deliveryPricing["pricing_type"];

$business_status = trim(
    (string) (
        $data["business_status"] ??
        "Open"
    )
);

$logo_path = trim(
    (string) (
        $data["logo_path"] ?? ""
    )
);

$banner_path = trim(
    (string) (
        $data["banner_path"] ?? ""
    )
);

/* =========================================================
   FIELD VALIDATION
========================================================= */

$allowed_status = [
    "Open",
    "Closed",
    "Temporarily Unavailable"
];

if (
    $name === "" ||
    mb_strlen($name) < 2 ||
    mb_strlen($name) > 150
) {
    respond_json(
        [
            "success" => false,
            "message" =>
                "Enter a valid restaurant name."
        ],
        422
    );
}

if (
    !preg_match(
        "/^\+639\d{9}$/",
        $contact_number
    )
)
{
    respond_json(
        [
            "success" => false,
            "message" =>
                "Enter a valid Philippine mobile number starting with 9."
        ],
        422
    );
}

if (
    $address === "" ||
    mb_strlen($address) < 10 ||
    mb_strlen($address) > 255
) {
    respond_json(
        [
            "success" => false,
            "message" =>
                "Enter a complete restaurant address."
        ],
        422
    );
}

if (
    $opening_hours === "" ||
    mb_strlen($opening_hours) < 5 ||
    mb_strlen($opening_hours) > 100
) {
    respond_json(
        [
            "success" => false,
            "message" =>
                "Enter clear and valid opening hours."
        ],
        422
    );
}

if (
    !is_finite($delivery_fee) ||
    $delivery_fee < 0 ||
    $delivery_fee > 9999
) {
    respond_json(
        [
            "success" => false,
            "message" =>
                "Delivery fee must be from ₱0.00 to ₱9,999.00."
        ],
        422
    );
}

if (
    !in_array(
        $business_status,
        $allowed_status,
        true
    )
) {
    respond_json(
        [
            "success" => false,
            "message" =>
                "Invalid business availability status."
        ],
        422
    );
}

/* =========================================================
   LOGO VALIDATION
========================================================= */

if ($logo_path !== "") {
    $expected_directory =
        "uploads/restaurant_logos/owner_" .
        $owner_id .
        "/";

    if (
        strpos(
            $logo_path,
            $expected_directory
        ) !== 0 ||
        strpos(
            $logo_path,
            ".."
        ) !== false
    ) {
        respond_json(
            [
                "success" => false,
                "message" =>
                    "The selected restaurant logo is invalid."
            ],
            422
        );
    }

    $allowed_logo_extensions = [
        "jpg",
        "jpeg",
        "png",
        "webp"
    ];

    $logo_extension = strtolower(
        pathinfo(
            $logo_path,
            PATHINFO_EXTENSION
        )
    );

    if (
        !in_array(
            $logo_extension,
            $allowed_logo_extensions,
            true
        )
    ) {
        respond_json(
            [
                "success" => false,
                "message" =>
                    "The restaurant logo must be a JPG, PNG, or WEBP image."
            ],
            422
        );
    }

    $absolute_logo_path =
        dirname(__DIR__) .
        DIRECTORY_SEPARATOR .
        str_replace(
            "/",
            DIRECTORY_SEPARATOR,
            $logo_path
        );

    if (!is_file($absolute_logo_path)) {
        respond_json(
            [
                "success" => false,
                "message" =>
                    "The uploaded restaurant logo could not be found."
            ],
            422
        );
    }
}

/* =========================================================
   UPDATE RESTAURANT SETTINGS
========================================================= */

try {
    /* Verify ownership before geocoding or writing anything. */
    $ownershipStmt = $conn->prepare("
        SELECT restaurant_id
        FROM tbl_restaurants
        WHERE restaurant_id = ?
          AND owner_id = ?
        LIMIT 1
    ");

    if (!$ownershipStmt) {
        throw new RuntimeException("Unable to verify restaurant ownership.");
    }

    $ownershipStmt->bind_param(
        "ii",
        $restaurant_id,
        $owner_id
    );

    $ownershipStmt->execute();
    $ownership =
        $ownershipStmt
            ->get_result()
            ->fetch_assoc();
    $ownershipStmt->close();

    if (!$ownership) {
        respond_json(
            [
                "success" => false,
                "message" =>
                    "You are not allowed to update this restaurant."
            ],
            403
        );
    }

    $restaurantPricingLatitude = null;
    $restaurantPricingLongitude = null;

    if ($deliveryPricingType !== "fixed") {
        try {
            $pricingCoordinates =
                fc_delivery_pricing_geocode_address(
                    $address
                );

            $restaurantPricingLatitude =
                (float) $pricingCoordinates["latitude"];

            $restaurantPricingLongitude =
                (float) $pricingCoordinates["longitude"];
        } catch (RuntimeException $geocodeError) {
            respond_json(
                [
                    "success" => false,
                    "message" =>
                        $geocodeError->getMessage()
                ],
                422
            );
        }
    }

    $conn->begin_transaction();

    $sql = "
        UPDATE tbl_restaurants
        SET
            name = ?,
            logo_path = ?,
            banner_path = ?,
            address = ?,
            contact_number = ?,
            opening_hours = ?,
            delivery_fee = ?,
            business_status = ?
        WHERE restaurant_id = ?
          AND owner_id = ?
    ";

    $stmt = $conn->prepare($sql);

    if (!$stmt) {
        throw new RuntimeException(
            $conn->error
        );
    }

    $stmt->bind_param(
        "ssssssdsii",
        $name,
        $logo_path,
        $banner_path,
        $address,
        $contact_number,
        $opening_hours,
        $delivery_fee,
        $business_status,
        $restaurant_id,
        $owner_id
    );

    if (!$stmt->execute()) {
        $message = $stmt->error;
        $stmt->close();
        throw new RuntimeException($message);
    }

    $stmt->close();

    fc_delivery_pricing_upsert_active(
        $conn,
        $restaurant_id,
        $deliveryPricing,
        $restaurantPricingLatitude,
        $restaurantPricingLongitude
    );

    $conn->commit();

    respond_json([
        "success" => true,
        "message" =>
            "Restaurant settings updated successfully.",
        "restaurant" => [
            "restaurant_id" =>
                $restaurant_id,
            "name" =>
                $name,
            "logo_path" =>
                $logo_path,
            "banner_path" =>
                $banner_path,
            "address" =>
                $address,
            "contact_number" =>
                $contact_number,
            "opening_hours" =>
                $opening_hours,
            "delivery_fee" =>
                $delivery_fee,
            "delivery_pricing_type" =>
                $deliveryPricingType,
            "delivery_pricing" =>
                json_decode(
                    (string) $deliveryPricing["pricing_json"],
                    true
                ),
            "business_status" =>
                $business_status
        ]
    ]);

} catch (Throwable $error) {
    try {
        $conn->rollback();
    } catch (Throwable $rollbackError) {
        error_log(
            "Update restaurant settings rollback failed: " .
            $rollbackError->getMessage()
        );
    }

    error_log(
        "Update restaurant settings failed: " .
        $error->getMessage()
    );

    respond_json(
        [
            "success" => false,
            "message" =>
                "Failed to update restaurant settings."
        ],
        500
    );
}
