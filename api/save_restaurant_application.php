<?php

header(
    "Content-Type: application/json; charset=utf-8"
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
    "/FoodConnect",
    "",
    false,
    true
);

require_once __DIR__ . "/session_config.php";

require_once __DIR__ . "/db.php";

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

function clean_text(
    array $data,
    string $key
): string {
    return trim(
        (string) ($data[$key] ?? "")
    );
}

/* =========================================================
   OWNER AUTHENTICATION
   ========================================================= */

if (empty($_SESSION["user_id"])) {
    respond_json(
        [
            "success" => false,
            "message" => "Please log in as a restaurant owner."
        ],
        401
    );
}

$role =
    strtolower(
        trim(
            (string) ($_SESSION["role"] ?? "")
        )
    );

if ($role !== "owner") {
    respond_json(
        [
            "success" => false,
            "message" => "Only restaurant owners can save this setup."
        ],
        403
    );
}

$ownerId =
    (int) $_SESSION["user_id"];

/* =========================================================
   READ REQUEST DATA
   ========================================================= */

$rawInput =
    file_get_contents("php://input");

$data =
    json_decode(
        $rawInput,
        true
    );

if (!is_array($data)) {
    respond_json(
        [
            "success" => false,
            "message" => "Invalid request data."
        ],
        400
    );
}

$action =
    ($data["action"] ?? "save") === "submit"
        ? "submit"
        : "save";

$restaurantName =
    clean_text(
        $data,
        "restaurant_name"
    );

$restaurantAddress =
    clean_text(
        $data,
        "restaurant_address"
    );

$restaurantContact =
    clean_text(
        $data,
        "restaurant_contact"
    );

$cuisine =
    clean_text(
        $data,
        "cuisine"
    );

$restaurantDescription =
    clean_text(
        $data,
        "restaurant_description"
    );

$businessEmail =
    strtolower(
        clean_text(
            $data,
            "business_email"
        )
    );

$province =
    clean_text(
        $data,
        "province"
    );

$cityMunicipality =
    clean_text(
        $data,
        "city_municipality"
    );

$barangay =
    clean_text(
        $data,
        "barangay"
    );

$postalCode =
    clean_text(
        $data,
        "postal_code"
    );

$minimumOrder =
    max(
        0,
        (float) (
            $data["minimum_order"] ?? 0
        )
    );

$deliveryFee =
    max(
        0,
        (float) (
            $data["delivery_fee"] ?? 0
        )
    );

$businessHours =
    $data["business_hours"] ?? [];

$requestedDeliveryOptions =
    $data["delivery_options"] ?? [];

if (!is_array($businessHours)) {
    $businessHours = [];
}

if (!is_array($requestedDeliveryOptions)) {
    $requestedDeliveryOptions = [];
}

$allowedDeliveryOptions = [
    "pickup",
    "restaurant_delivery",
    "foodconnect_delivery"
];

$deliveryOptions =
    array_values(
        array_unique(
            array_intersect(
                $requestedDeliveryOptions,
                $allowedDeliveryOptions
            )
        )
    );

/* =========================================================
   BASIC VALIDATION
   ========================================================= */

if (
    $restaurantName === "" ||
    $restaurantAddress === "" ||
    $restaurantContact === "" ||
    $cuisine === ""
) {
    respond_json(
        [
            "success" => false,
            "message" =>
                "Complete the required restaurant information."
        ],
        422
    );
}

if (
    $businessEmail !== "" &&
    !filter_var(
        $businessEmail,
        FILTER_VALIDATE_EMAIL
    )
) {
    respond_json(
        [
            "success" => false,
            "message" =>
                "Enter a valid business email address."
        ],
        422
    );
}

if (
    $postalCode !== "" &&
    !preg_match(
        "/^[0-9]{4,10}$/",
        $postalCode
    )
) {
    respond_json(
        [
            "success" => false,
            "message" =>
                "Enter a valid postal code."
        ],
        422
    );
}

if (
    $action === "submit" &&
    count($deliveryOptions) === 0
) {
    respond_json(
        [
            "success" => false,
            "message" =>
                "Select at least one ordering or delivery option."
        ],
        422
    );
}

/* =========================================================
   VALIDATE BUSINESS HOURS
   ========================================================= */

$allowedDays = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday"
];

$cleanBusinessHours = [];

foreach ($allowedDays as $day) {
    $dayData =
        $businessHours[$day] ?? [];

    $isClosed =
        !empty($dayData["closed"]);

    $openingTime =
        trim(
            (string) (
                $dayData["open"] ?? ""
            )
        );

    $closingTime =
        trim(
            (string) (
                $dayData["close"] ?? ""
            )
        );

    if (
        !$isClosed &&
        (
            !preg_match(
                "/^[0-2][0-9]:[0-5][0-9]$/",
                $openingTime
            ) ||
            !preg_match(
                "/^[0-2][0-9]:[0-5][0-9]$/",
                $closingTime
            )
        )
    ) {
        respond_json(
            [
                "success" => false,
                "message" =>
                    "Enter valid opening and closing times for {$day}."
            ],
            422
        );
    }

    $cleanBusinessHours[$day] = [
        "closed" => $isClosed,
        "open" =>
            $isClosed
                ? null
                : $openingTime,

        "close" =>
            $isClosed
                ? null
                : $closingTime
    ];
}

$businessHoursJson = json_encode(
    $cleanBusinessHours,
    JSON_UNESCAPED_UNICODE
);

$deliveryOptionsJson = json_encode(
    $deliveryOptions,
    JSON_UNESCAPED_UNICODE
);

if (
    $businessHoursJson === false ||
    $deliveryOptionsJson === false
) {
    respond_json(
        [
            "success" => false,
            "message" => "Unable to process restaurant settings."
        ],
        500
    );
}

/* =========================================================
   CHECK IF OWNER ALREADY HAS AN APPROVED RESTAURANT
   ========================================================= */

$restaurantStmt = $conn->prepare("
    SELECT restaurant_id
    FROM tbl_restaurants
    WHERE owner_id = ?
    LIMIT 1
");

if (!$restaurantStmt) {
    respond_json(
        [
            "success" => false,
            "message" => "Unable to validate restaurant ownership."
        ],
        500
    );
}

$restaurantStmt->bind_param(
    "i",
    $ownerId
);

$restaurantStmt->execute();

$existingRestaurant =
    $restaurantStmt
        ->get_result()
        ->fetch_assoc();

$restaurantStmt->close();

if ($existingRestaurant) {
    respond_json(
        [
            "success" => false,
            "message" =>
                "Your account already has an approved restaurant."
        ],
        409
    );
}

/* =========================================================
   FIND EDITABLE APPLICATION
   ========================================================= */

$applicationStmt = $conn->prepare("
    SELECT
        application_id,
        application_status
    FROM tbl_partner_applications
    WHERE owner_id = ?
    ORDER BY application_id DESC
    LIMIT 1
");

if (!$applicationStmt) {
    respond_json(
        [
            "success" => false,
            "message" => "Unable to locate the restaurant application."
        ],
        500
    );
}

$applicationStmt->bind_param(
    "i",
    $ownerId
);

$applicationStmt->execute();

$application =
    $applicationStmt
        ->get_result()
        ->fetch_assoc();

$applicationStmt->close();

if (!$application) {
    respond_json(
        [
            "success" => false,
            "message" => "No restaurant application was found."
        ],
        404
    );
}

$currentStatus =
    strtolower(
        trim(
            (string) $application["application_status"]
        )
    );

$editableStatuses = [
    "draft",
    "rejected"
];

if (
    !in_array(
        $currentStatus,
        $editableStatuses,
        true
    )
) {
    respond_json(
        [
            "success" => false,
            "message" =>
                "This restaurant application can no longer be edited."
        ],
        409
    );
}

$applicationId =
    (int) $application["application_id"];

$newStatus =
    $action === "submit"
        ? "submitted"
        : "draft";

$submittedAt =
    $action === "submit"
        ? date("Y-m-d H:i:s")
        : null;

/* =========================================================
   UPDATE APPLICATION
   ========================================================= */

$stmt = $conn->prepare("
    UPDATE tbl_partner_applications
    SET
        restaurant_name = ?,
        restaurant_address = ?,
        restaurant_contact = ?,
        cuisine = ?,
        restaurant_description = ?,
        business_email = ?,
        province = ?,
        city_municipality = ?,
        barangay = ?,
        postal_code = ?,
        business_hours_json = ?,
        delivery_options_json = ?,
        minimum_order = ?,
        delivery_fee = ?,
        application_status = ?,
        rejection_reason = NULL,
        submitted_at = ?
    WHERE application_id = ?
      AND owner_id = ?
    LIMIT 1
");

if (!$stmt) {
    error_log(
        "save_restaurant_application prepare error: " .
        $conn->error
    );

    respond_json(
        [
            "success" => false,
            "message" =>
                "Database migration is required before saving."
        ],
        500
    );
}

$stmt->bind_param(
    "ssssssssssssddssii",
    $restaurantName,
    $restaurantAddress,
    $restaurantContact,
    $cuisine,
    $restaurantDescription,
    $businessEmail,
    $province,
    $cityMunicipality,
    $barangay,
    $postalCode,
    $businessHoursJson,
    $deliveryOptionsJson,
    $minimumOrder,
    $deliveryFee,
    $newStatus,
    $submittedAt,
    $applicationId,
    $ownerId
);

if (!$stmt->execute()) {
    error_log(
        "save_restaurant_application execute error: " .
        $stmt->error
    );

    $stmt->close();

    respond_json(
        [
            "success" => false,
            "message" => "Unable to save the restaurant setup."
        ],
        500
    );
}

$stmt->close();

respond_json([
    "success" => true,
    "status" => $newStatus,
    "message" =>
        $action === "submit"
            ? "Restaurant application submitted for administrator review."
            : "Restaurant setup draft saved successfully."
]);