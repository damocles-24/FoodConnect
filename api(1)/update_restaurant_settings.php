<?php

header(
    "Content-Type: application/json; charset=utf-8"
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
            "message" => "Unauthorized access."
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
                "Invalid restaurant session."
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

$contact_number = preg_replace(
    "/\D+/",
    "",
    (string) (
        $data["contact_number"] ?? ""
    )
) ?? "";

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
        "/^09\d{9}$/",
        $contact_number
    )
) {
    respond_json(
        [
            "success" => false,
            "message" =>
                "Enter a valid 11-digit Philippine mobile number starting with 09."
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
    $delivery_fee > 999
) {
    respond_json(
        [
            "success" => false,
            "message" =>
                "Delivery fee must be from ₱0.00 to ₱999.00."
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
    $sql = "
        UPDATE tbl_restaurants
        SET
            name = ?,
            logo_path = ?,
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
        throw new Exception(
            $conn->error
        );
    }

    $stmt->bind_param(
        "sssssdsii",
        $name,
        $logo_path,
        $address,
        $contact_number,
        $opening_hours,
        $delivery_fee,
        $business_status,
        $restaurant_id,
        $owner_id
    );

    $stmt->execute();

    if ($stmt->affected_rows === 0) {
        $check_sql = "
            SELECT restaurant_id
            FROM tbl_restaurants
            WHERE restaurant_id = ?
              AND owner_id = ?
            LIMIT 1
        ";

        $check_stmt =
            $conn->prepare($check_sql);

        if (!$check_stmt) {
            throw new Exception(
                $conn->error
            );
        }

        $check_stmt->bind_param(
            "ii",
            $restaurant_id,
            $owner_id
        );

        $check_stmt->execute();

        $check_result =
            $check_stmt->get_result();

        if ($check_result->num_rows === 0) {
            respond_json(
                [
                    "success" => false,
                    "message" =>
                        "You are not allowed to update this restaurant."
                ],
                403
            );
        }
    }

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

            "address" =>
                $address,

            "contact_number" =>
                $contact_number,

            "opening_hours" =>
                $opening_hours,

            "delivery_fee" =>
                $delivery_fee,

            "business_status" =>
                $business_status
        ]
    ]);

} catch (Throwable $error) {
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