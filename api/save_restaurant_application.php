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

/* =========================================================
   RESPONSE HELPERS
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
        JSON_UNESCAPED_UNICODE
    );

    exit;
}

function clean_text(
    array $data,
    string $key
): string {
    return trim(
        (string) (
            $data[$key] ?? ""
        )
    );
}

function validation_response(
    array $errors,
    string $message =
        "Complete the required restaurant information."
): void {
    respond_json(
        [
            "success" => false,
            "message" => $message,
            "errors" => $errors
        ],
        422
    );
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
                "Only restaurant owners can save this setup."
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
   REQUEST METHOD
   ========================================================= */

if (
    ($_SERVER["REQUEST_METHOD"] ?? "")
    !== "POST"
) {
    respond_json(
        [
            "success" => false,
            "message" =>
                "Method not allowed."
        ],
        405
    );
}

/* =========================================================
   READ REQUEST DATA
   ========================================================= */

$rawInput =
    file_get_contents(
        "php://input"
    );

$data =
    json_decode(
        $rawInput,
        true
    );

if (!is_array($data)) {
    respond_json(
        [
            "success" => false,
            "message" =>
                "Invalid request data."
        ],
        400
    );
}

$action =
    ($data["action"] ?? "save")
        === "submit"
            ? "submit"
            : "save";

/* =========================================================
   CLEAN FORM VALUES
   ========================================================= */

$logoPath =
    clean_text(
        $data,
        "logo_path"
    );

$restaurantName =
    clean_text(
        $data,
        "restaurant_name"
    );

$cuisine =
    clean_text(
        $data,
        "cuisine"
    );

$restaurantContact =
    clean_text(
        $data,
        "restaurant_contact"
    );

$businessEmail =
    strtolower(
        clean_text(
            $data,
            "business_email"
        )
    );

$restaurantDescription =
    clean_text(
        $data,
        "restaurant_description"
    );

$restaurantAddress =
    clean_text(
        $data,
        "restaurant_address"
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

/* =========================================================
   MONEY VALUES
   ========================================================= */

$minimumOrderRaw =
    $data["minimum_order"] ?? 0;

$deliveryFeeRaw =
    $data["delivery_fee"] ?? 0;

$minimumOrder =
    is_numeric($minimumOrderRaw)
        ? (float) $minimumOrderRaw
        : 0;

$deliveryFee =
    is_numeric($deliveryFeeRaw)
        ? (float) $deliveryFeeRaw
        : 0;

$minimumOrder =
    max(
        0,
        round(
            $minimumOrder,
            2
        )
    );

$deliveryFee =
    max(
        0,
        round(
            $deliveryFee,
            2
        )
    );

/* =========================================================
   BUSINESS HOURS AND SERVICES
   ========================================================= */

$businessHours =
    $data["business_hours"] ?? [];

$requestedDeliveryOptions =
    $data["delivery_options"] ?? [];

if (!is_array($businessHours)) {
    $businessHours = [];
}

if (
    !is_array(
        $requestedDeliveryOptions
    )
) {
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
   LOGO PATH VALIDATION
   ========================================================= */

if (
    $logoPath !== "" &&
    !preg_match(
        "#^uploads/restaurant_logos/owner_" .
        preg_quote(
            (string) $ownerId,
            "#"
        ) .
        "/restaurant_logo_[A-Za-z0-9_\\-]+\\.(jpg|png|webp)$#i",
        $logoPath
    )
) {
    respond_json(
        [
            "success" => false,
            "message" =>
                "The restaurant logo path is invalid."
        ],
        422
    );
}

/* =========================================================
   REQUIRED FIELD VALIDATION
   ========================================================= */

$errors = [];

if ($restaurantName === "") {
    $errors["restaurant_name"] =
        "Restaurant name is required.";
}

if ($cuisine === "") {
    $errors["cuisine"] =
        "Restaurant type or cuisine is required.";
}

if ($restaurantContact === "") {
    $errors["restaurant_contact"] =
        "Business contact number is required.";
}

if ($businessEmail === "") {
    $errors["business_email"] =
        "Business email is required.";
} elseif (
    !filter_var(
        $businessEmail,
        FILTER_VALIDATE_EMAIL
    )
) {
    $errors["business_email"] =
        "Enter a valid business email address.";
}

if ($restaurantAddress === "") {
    $errors["restaurant_address"] =
        "Street address is required.";
}

if ($province === "") {
    $errors["province"] =
        "Province is required.";
}

if ($cityMunicipality === "") {
    $errors["city_municipality"] =
        "City or municipality is required.";
}

if ($barangay === "") {
    $errors["barangay"] =
        "Barangay is required.";
}

if (
    $postalCode !== "" &&
    !preg_match(
        "/^[0-9]{4,10}$/",
        $postalCode
    )
) {
    $errors["postal_code"] =
        "Postal code must contain 4 to 10 digits.";
}

if (!empty($errors)) {
    validation_response(
        $errors
    );
}

/* =========================================================
   DELIVERY OPTION VALIDATION
   ========================================================= */

if (
    $action === "submit" &&
    count($deliveryOptions) === 0
) {
    validation_response(
        [
            "delivery_options" =>
                "Select at least one order service."
        ],
        "Select at least one order service."
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

$validTimePattern =
    "/^(?:[01][0-9]|2[0-3]):[0-5][0-9]$/";

$cleanBusinessHours = [];
$businessHoursErrors = [];

foreach ($allowedDays as $day) {
    $dayData =
        $businessHours[$day] ?? [];

    if (!is_array($dayData)) {
        $dayData = [];
    }

    $isClosed =
        !empty(
            $dayData["closed"]
        );

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

    if (!$isClosed) {
        if (
            $openingTime === "" ||
            $closingTime === ""
        ) {
            $businessHoursErrors[] =
                "Enter opening and closing times for {$day}.";
        } elseif (
            !preg_match(
                $validTimePattern,
                $openingTime
            ) ||
            !preg_match(
                $validTimePattern,
                $closingTime
            )
        ) {
            $businessHoursErrors[] =
                "Enter valid opening and closing times for {$day}.";
        } elseif (
            $openingTime ===
            $closingTime
        ) {
            $businessHoursErrors[] =
                "{$day}'s opening and closing times cannot be the same.";
        }
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

if (!empty($businessHoursErrors)) {
    validation_response(
        [
            "business_hours" =>
                $businessHoursErrors[0]
        ],
        $businessHoursErrors[0]
    );
}

/* =========================================================
   ENCODE JSON VALUES
   ========================================================= */

$businessHoursJson =
    json_encode(
        $cleanBusinessHours,
        JSON_UNESCAPED_UNICODE
    );

$deliveryOptionsJson =
    json_encode(
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
            "message" =>
                "Unable to process restaurant settings."
        ],
        500
    );
}

/* =========================================================
   CHECK EXISTING RESTAURANT
   ========================================================= */

$restaurantStmt =
    $conn->prepare("
        SELECT
            restaurant_id
        FROM tbl_restaurants
        WHERE owner_id = ?
        LIMIT 1
    ");

if (!$restaurantStmt) {
    error_log(
        "save_restaurant_application restaurant prepare error: " .
        $conn->error
    );

    respond_json(
        [
            "success" => false,
            "message" =>
                "Unable to validate restaurant ownership."
        ],
        500
    );
}

$restaurantStmt->bind_param(
    "i",
    $ownerId
);

if (
    !$restaurantStmt->execute()
) {
    error_log(
        "save_restaurant_application restaurant execute error: " .
        $restaurantStmt->error
    );

    $restaurantStmt->close();

    respond_json(
        [
            "success" => false,
            "message" =>
                "Unable to validate restaurant ownership."
        ],
        500
    );
}

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
   FIND OWNER APPLICATION
   ========================================================= */

$applicationStmt =
    $conn->prepare("
        SELECT
            application_id,
            application_status
        FROM tbl_partner_applications
        WHERE owner_id = ?
        ORDER BY application_id DESC
        LIMIT 1
    ");

if (!$applicationStmt) {
    error_log(
        "save_restaurant_application application prepare error: " .
        $conn->error
    );

    respond_json(
        [
            "success" => false,
            "message" =>
                "Unable to locate the restaurant application."
        ],
        500
    );
}

$applicationStmt->bind_param(
    "i",
    $ownerId
);

if (
    !$applicationStmt->execute()
) {
    error_log(
        "save_restaurant_application application execute error: " .
        $applicationStmt->error
    );

    $applicationStmt->close();

    respond_json(
        [
            "success" => false,
            "message" =>
                "Unable to locate the restaurant application."
        ],
        500
    );
}

$application =
    $applicationStmt
        ->get_result()
        ->fetch_assoc();

$applicationStmt->close();

if (!$application) {
    respond_json(
        [
            "success" => false,
            "message" =>
                "No restaurant application was found."
        ],
        404
    );
}

$currentStatus =
    strtolower(
        trim(
            (string) (
                $application[
                    "application_status"
                ] ?? ""
            )
        )
    );

$editableStatuses = [
    "draft",
    "needs_changes"
];

if (
    !in_array(
        $currentStatus,
        $editableStatuses,
        true
    )
) {
    $statusMessage =
        "This restaurant application can no longer be edited.";

    if ($currentStatus === "submitted") {
        $statusMessage =
            "Your restaurant application is currently under administrator review.";
    } elseif (
        $currentStatus === "approved"
    ) {
        $statusMessage =
            "Your restaurant application has already been approved.";
    } elseif (
        $currentStatus === "rejected"
    ) {
        $statusMessage =
            "This restaurant application was permanently rejected and can no longer be edited or resubmitted.";
    }

    respond_json(
        [
            "success" => false,
            "message" =>
                $statusMessage
        ],
        409
    );
}

$applicationId =
    (int) $application[
        "application_id"
    ];

$newStatus =
    $action === "submit"
        ? "submitted"
        : "draft";

$submittedAt =
    $action === "submit"
        ? date(
            "Y-m-d H:i:s"
        )
        : null;

/* =========================================================
   UPDATE APPLICATION
   ========================================================= */

$stmt =
    $conn->prepare("
        UPDATE tbl_partner_applications
                SET
            restaurant_name = ?,
            restaurant_address = ?,
            restaurant_contact = ?,
            cuisine = ?,
            restaurant_description = ?,
            logo_path = ?,
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
        "save_restaurant_application update prepare error: " .
        $conn->error
    );

    respond_json(
        [
            "success" => false,
            "message" =>
                "Unable to prepare the restaurant application update."
        ],
        500
    );
}

$stmt->bind_param(
    "sssssssssssssddssii",
    $restaurantName,
    $restaurantAddress,
    $restaurantContact,
    $cuisine,
    $restaurantDescription,
    $logoPath,
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
        "save_restaurant_application update execute error: " .
        $stmt->error
    );

    $stmt->close();

    respond_json(
        [
            "success" => false,
            "message" =>
                "Unable to save the restaurant application."
        ],
        500
    );
}

$stmt->close();

/* =========================================================
   SUCCESS RESPONSE
   ========================================================= */

respond_json(
    [
        "success" => true,

        "message" =>
            $action === "submit"
                ? "Restaurant application submitted successfully."
                : "Restaurant application draft saved successfully.",

        "status" =>
            $newStatus,

        "application_id" =>
            $applicationId
    ]
);