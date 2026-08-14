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

function generate_staff_access_code(): string
{
    return strtoupper(
        bin2hex(
            random_bytes(6)
        )
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

$taxRegistrationType =
    strtolower(
        clean_text(
            $data,
            "tax_registration_type"
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

// Minimum order is no longer part of FoodConnect onboarding.
// Keep the existing database column for backward compatibility,
// but reset it to zero whenever this setup is saved.
$minimumOrder = 0.0;

$deliveryFeeRaw =
    $data["delivery_fee"] ?? 0;

$deliveryFee =
    is_numeric($deliveryFeeRaw)
        ? (float) $deliveryFeeRaw
        : 0;

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
    "dine-in",
    "takeout",
    "delivery"
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

if (!in_array("delivery", $deliveryOptions, true)) {
    $deliveryFee = 0.0;
}

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

if (
    !in_array(
        $taxRegistrationType,
        ["vat", "non_vat"],
        true
    )
) {
    $errors["tax_registration_type"] =
        "Select VAT-Registered or Non-VAT Registered.";
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
                "Select at least one order type."
        ],
        "Select at least one order type."
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

$isCompletingSetup =
    $action === "submit";

$newStatus =
    "draft";

$restaurantId =
    0;

/* =========================================================
   SAVE APPLICATION AND COMPLETE PRIVATE SETUP
========================================================= */

$conn->begin_transaction();

try {
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
                tax_registration_type = ?,
                province = ?,
                city_municipality = ?,
                barangay = ?,
                postal_code = ?,
                business_hours_json = ?,
                delivery_options_json = ?,
                minimum_order = ?,
                delivery_fee = ?,
                application_status = 'draft',
                rejection_reason = NULL,
                submitted_at = NULL,
                reviewed_at = NULL,
                reviewed_by = NULL
            WHERE application_id = ?
              AND owner_id = ?
            LIMIT 1
        ");

    if (!$stmt) {
        throw new RuntimeException(
            "Unable to prepare the restaurant setup update."
        );
    }

    $stmt->bind_param(
        "ssssssssssssssddii",
        $restaurantName,
        $restaurantAddress,
        $restaurantContact,
        $cuisine,
        $restaurantDescription,
        $logoPath,
        $businessEmail,
        $taxRegistrationType,
        $province,
        $cityMunicipality,
        $barangay,
        $postalCode,
        $businessHoursJson,
        $deliveryOptionsJson,
        $minimumOrder,
        $deliveryFee,
        $applicationId,
        $ownerId
    );

    if (!$stmt->execute()) {
        throw new RuntimeException(
            "Unable to save the restaurant setup."
        );
    }

    $stmt->close();

    /* =====================================================
       COMPLETE PRIVATE RESTAURANT SETUP
    ===================================================== */

    if ($isCompletingSetup) {
        $ownerStmt =
            $conn->prepare("
                SELECT
                    user_id,
                    restaurant_id,
                    role,
                    status,
                    is_verified
                FROM tbl_users
                WHERE user_id = ?
                LIMIT 1
                FOR UPDATE
            ");

        if (!$ownerStmt) {
            throw new RuntimeException(
                "Unable to verify the restaurant owner."
            );
        }

        $ownerStmt->bind_param(
            "i",
            $ownerId
        );

        if (!$ownerStmt->execute()) {
            throw new RuntimeException(
                "Unable to verify the restaurant owner."
            );
        }

        $owner =
            $ownerStmt
                ->get_result()
                ->fetch_assoc();

        $ownerStmt->close();

        if (
            !$owner ||
            strtolower(
                trim(
                    (string) $owner["role"]
                )
            ) !== "owner" ||
            (int) $owner["status"] !== 1 ||
            (int) $owner["is_verified"] !== 1
        ) {
            throw new DomainException(
                "The restaurant owner account is not active and verified."
            );
        }

        if (
            !empty(
                $owner["restaurant_id"]
            )
        ) {
            throw new DomainException(
                "Your owner account already has a restaurant."
            );
        }

        $existingRestaurantStmt =
            $conn->prepare("
                SELECT restaurant_id
                FROM tbl_restaurants
                WHERE owner_id = ?
                LIMIT 1
                FOR UPDATE
            ");

        if (!$existingRestaurantStmt) {
            throw new RuntimeException(
                "Unable to check existing restaurants."
            );
        }

        $existingRestaurantStmt->bind_param(
            "i",
            $ownerId
        );

        if (
            !$existingRestaurantStmt->execute()
        ) {
            throw new RuntimeException(
                "Unable to check existing restaurants."
            );
        }

        $existingRestaurant =
            $existingRestaurantStmt
                ->get_result()
                ->fetch_assoc();

        $existingRestaurantStmt->close();

        if ($existingRestaurant) {
            throw new DomainException(
                "Your owner account already has a restaurant."
            );
        }

        $staffAccessCode =
            generate_staff_access_code();

        $openingHours =
            "Configured in restaurant setup";

        $businessStatus =
            "Closed";

        $customerVisibility =
            "Hidden";

        $createRestaurantStmt =
            $conn->prepare("
                INSERT INTO tbl_restaurants (
                    name,
                    description,
                    logo_path,
                    address,
                    contact_number,
                    opening_hours,
                    delivery_fee,
                    tax_registration_type,
                    order_types_json,
                    business_status,
                    owner_id,
                    staff_access_code,
                    setup_completed,
                    customer_visibility
                )
                VALUES (
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    1,
                    ?
                )
            ");

        if (!$createRestaurantStmt) {
            throw new RuntimeException(
                "Unable to create the private restaurant."
            );
        }

        $createRestaurantStmt->bind_param(
            "ssssssdsssiss",
            $restaurantName,
            $restaurantDescription,
            $logoPath,
            $restaurantAddress,
            $restaurantContact,
            $openingHours,
            $deliveryFee,
            $taxRegistrationType,
            $deliveryOptionsJson,
            $businessStatus,
            $ownerId,
            $staffAccessCode,
            $customerVisibility
        );

        if (
            !$createRestaurantStmt->execute()
        ) {
            throw new RuntimeException(
                "Unable to create the private restaurant."
            );
        }

        $restaurantId =
            (int) $conn->insert_id;

        $createRestaurantStmt->close();

        if ($restaurantId <= 0) {
            throw new RuntimeException(
                "The private restaurant was not created correctly."
            );
        }

        $linkOwnerStmt =
            $conn->prepare("
                UPDATE tbl_users
                SET restaurant_id = ?
                WHERE user_id = ?
                  AND restaurant_id IS NULL
                LIMIT 1
            ");

        if (!$linkOwnerStmt) {
            throw new RuntimeException(
                "Unable to link the restaurant to its owner."
            );
        }

        $linkOwnerStmt->bind_param(
            "ii",
            $restaurantId,
            $ownerId
        );

        if (!$linkOwnerStmt->execute()) {
            throw new RuntimeException(
                "Unable to link the restaurant to its owner."
            );
        }

        if (
            $linkOwnerStmt->affected_rows !== 1
        ) {
            $linkOwnerStmt->close();

            throw new RuntimeException(
                "The restaurant could not be linked to the owner."
            );
        }

        $linkOwnerStmt->close();
    }

    $conn->commit();

    respond_json([
        "success" => true,

        "message" =>
            $isCompletingSetup
                ? "Restaurant setup completed successfully."
                : "Restaurant setup draft saved successfully.",

        "status" =>
            $isCompletingSetup
                ? "setup_completed"
                : "draft",

        "application_id" =>
            $applicationId,

        "restaurant_id" =>
            $restaurantId,

        "customer_visibility" =>
            $isCompletingSetup
                ? "Hidden"
                : null
    ]);
} catch (DomainException $error) {
    $conn->rollback();

    respond_json([
        "success" => false,
        "message" =>
            $error->getMessage()
    ], 409);
    
} catch (Throwable $error) {
    $conn->rollback();

    error_log(
        "save_restaurant_application.php error: " .
        $error->getMessage()
    );

    respond_json([
        "success" => false,
        "message" =>
            "Unable to save the restaurant setup."
    ], 500);
}

