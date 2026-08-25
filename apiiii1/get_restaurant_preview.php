<?php

header(
    "Content-Type: application/json; charset=utf-8"
);

header(
    "Cache-Control: no-store, no-cache, must-revalidate, max-age=0"
);

require_once __DIR__ . "/session_config.php";
require_once __DIR__ . "/db.php";

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

if (
    strtoupper(
        (string) (
            $_SERVER["REQUEST_METHOD"] ?? ""
        )
    ) !== "GET"
) {
    respond_json(
        [
            "success" => false,
            "message" => "This action is not available."
        ],
        405
    );
}

$userId =
    (int) (
        $_SESSION["user_id"] ?? 0
    );

$role =
    strtolower(
        trim(
            (string) (
                $_SESSION["role"] ?? ""
            )
        )
    );

if ($userId <= 0) {
    respond_json(
        [
            "success" => false,
            "message" =>
                "Please log in to preview this restaurant."
        ],
        401
    );
}

$previewMode =
    strtolower(
        trim(
            (string) (
                $_GET["mode"] ?? "owner"
            )
        )
    );

if (
    !in_array(
        $previewMode,
        [
            "owner",
            "admin"
        ],
        true
    )
) {
    respond_json(
        [
            "success" => false,
            "message" =>
                "Invalid restaurant preview mode."
        ],
        422
    );
}

if (
    $previewMode === "owner" &&
    $role !== "owner"
) {
    respond_json(
        [
            "success" => false,
            "message" =>
                "Only restaurant owners can access this preview."
        ],
        403
    );
}

if (
    $previewMode === "admin" &&
    $role !== "admin"
) {
    respond_json(
        [
            "success" => false,
            "message" =>
                "Only administrators can access this preview."
        ],
        403
    );
}

$applicationId = 0;

if ($previewMode === "admin") {
    $applicationId =
        filter_input(
            INPUT_GET,
            "application_id",
            FILTER_VALIDATE_INT
        );

    if (
        $applicationId === false ||
        $applicationId === null ||
        $applicationId <= 0
    ) {
        respond_json(
            [
                "success" => false,
                "message" =>
                    "Invalid restaurant application ID."
            ],
            422
        );
    }
}

if ($previewMode === "owner") {
  $stmt =
    $conn->prepare("
        SELECT
            pa.application_id,
            pa.owner_id,

            u.restaurant_id,

            pa.restaurant_name,
            pa.restaurant_address,
            pa.restaurant_contact,
            pa.cuisine,
            pa.restaurant_description,
            pa.logo_path,
            pa.business_email,
            pa.province,
            pa.city_municipality,
            pa.barangay,
            pa.postal_code,
            pa.business_hours_json,
            pa.order_types_json,
            pa.delivery_fee,
            pa.application_status

        FROM tbl_partner_applications AS pa

        INNER JOIN tbl_users AS u
            ON u.user_id = pa.owner_id

        WHERE pa.owner_id = ?

        ORDER BY pa.application_id DESC

        LIMIT 1
    ");

    if (!$stmt) {
        error_log(
            "get_restaurant_preview.php owner prepare error: " .
            $conn->error
        );

        respond_json(
            [
                "success" => false,
                "message" =>
                    "Unable to prepare the restaurant preview."
            ],
            500
        );
    }

    $stmt->bind_param(
        "i",
        $userId
    );
} else {
   $stmt =
    $conn->prepare("
        SELECT
            pa.application_id,
            pa.owner_id,

            u.restaurant_id,

            pa.restaurant_name,
            pa.restaurant_address,
            pa.restaurant_contact,
            pa.cuisine,
            pa.restaurant_description,
            pa.logo_path,
            pa.business_email,
            pa.province,
            pa.city_municipality,
            pa.barangay,
            pa.postal_code,
            pa.business_hours_json,
            pa.order_types_json,
            pa.delivery_fee,
            pa.application_status

        FROM tbl_partner_applications AS pa

        INNER JOIN tbl_users AS u
            ON u.user_id = pa.owner_id

        WHERE pa.application_id = ?

        LIMIT 1
    ");

    if (!$stmt) {
        error_log(
            "get_restaurant_preview.php admin prepare error: " .
            $conn->error
        );

        respond_json(
            [
                "success" => false,
                "message" =>
                    "Unable to prepare the restaurant preview."
            ],
            500
        );
    }

    $stmt->bind_param(
        "i",
        $applicationId
    );
}

if (!$stmt->execute()) {
    error_log(
        "get_restaurant_preview.php execute error: " .
        $stmt->error
    );

    $stmt->close();

    respond_json(
        [
            "success" => false,
            "message" =>
                "Unable to load the restaurant preview."
        ],
        500
    );
}

$application =
    $stmt
        ->get_result()
        ->fetch_assoc();

$stmt->close();

if (!$application) {
    respond_json(
        [
            "success" => false,
            "message" =>
                "Restaurant application not found."
        ],
        404
    );
}

function decode_json_array(
    $value
): array {
    if (
        !is_string($value) ||
        trim($value) === ""
    ) {
        return [];
    }

    $decoded =
        json_decode(
            $value,
            true
        );

    return is_array($decoded)
        ? $decoded
        : [];
}

function build_complete_address(
    array $application
): string {
    $parts = [
        $application["restaurant_address"] ?? "",
        $application["barangay"] ?? "",
        $application["city_municipality"] ?? "",
        $application["province"] ?? "",
        $application["postal_code"] ?? ""
    ];

    $cleanedParts = [];

    foreach ($parts as $part) {
        $part =
            trim(
                (string) $part
            );

        if ($part !== "") {
            $cleanedParts[] =
                $part;
        }
    }

    return implode(
        ", ",
        $cleanedParts
    );
}

respond_json(
    [
        "success" => true,
        "preview_mode" =>
            $previewMode,

        "restaurant" => [
            "application_id" =>
                (int) $application["application_id"],

            "restaurant_id" =>
    isset(
        $application["restaurant_id"]
    )
        ? (int) $application["restaurant_id"]
        : 0,

            "name" =>
                (string) (
                    $application["restaurant_name"] ??
                    "Restaurant"
                ),

            "cuisine" =>
                (string) (
                    $application["cuisine"] ?? ""
                ),

            "description" =>
                (string) (
                    $application["restaurant_description"] ?? ""
                ),

            "logo_path" =>
                (string) (
                    $application["logo_path"] ?? ""
                ),

            "address" =>
                build_complete_address(
                    $application
                ),

            "contact_number" =>
                (string) (
                    $application["restaurant_contact"] ?? ""
                ),

            "business_email" =>
                (string) (
                    $application["business_email"] ?? ""
                ),

            "business_hours" =>
                decode_json_array(
                    $application["business_hours_json"] ?? ""
                ),

            "delivery_options" =>
                decode_json_array(
                    $application["order_types_json"] ?? ""
                ),

            "delivery_fee" =>
                round(
                    (float) (
                        $application["delivery_fee"] ?? 0
                    ),
                    2
                ),

            "business_status" =>
                "Preview",

            "application_status" =>
                (string) (
                    $application["application_status"] ?? "draft"
                ),

            "is_accepting_orders" =>
                false,

            "is_preview" =>
                true
        ]
    ]
);