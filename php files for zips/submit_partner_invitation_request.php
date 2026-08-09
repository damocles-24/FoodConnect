<?php

header(
    "Content-Type: application/json; charset=utf-8"
);

header(
    "Cache-Control: no-store, no-cache, must-revalidate"
);

header("Pragma: no-cache");

error_reporting(
    E_ALL &
    ~E_NOTICE &
    ~E_WARNING
);

ini_set(
    "display_errors",
    "0"
);

require_once __DIR__ . "/db.php";

/* =========================================================
   JSON RESPONSE
========================================================= */

function respond_json(
    bool $success,
    string $message,
    int $statusCode = 200,
    array $extra = []
): void {
    http_response_code($statusCode);

    echo json_encode(
        array_merge(
            [
                "success" => $success,
                "message" => $message
            ],
            $extra
        ),
        JSON_UNESCAPED_UNICODE
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
    respond_json(
        false,
        "Method not allowed.",
        405
    );
}

/* =========================================================
   READ JSON INPUT
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
        false,
        "Invalid request data.",
        400
    );
}

/* =========================================================
   INPUT VALUES
========================================================= */

$fullName =
    trim(
        (string) (
            $data["full_name"] ?? ""
        )
    );

$email =
    strtolower(
        trim(
            (string) (
                $data["email"] ?? ""
            )
        )
    );

$contactNumber =
    trim(
        (string) (
            $data["contact_number"] ?? ""
        )
    );

$intendedRestaurant =
    trim(
        (string) (
            $data["intended_restaurant"] ?? ""
        )
    );

$businessAddress =
    trim(
        (string) (
            $data["business_address"] ?? ""
        )
    );

$message =
    trim(
        (string) (
            $data["message"] ?? ""
        )
    );

/* =========================================================
   REQUIRED FIELD VALIDATION
========================================================= */

if (
    $fullName === "" ||
    $email === "" ||
    $contactNumber === "" ||
    $intendedRestaurant === "" ||
    $businessAddress === ""
) {
    respond_json(
        false,
        "Please complete all required fields.",
        422
    );
}

/* =========================================================
   LENGTH VALIDATION
========================================================= */

if (mb_strlen($fullName) > 120) {
    respond_json(
        false,
        "Full name must not exceed 120 characters.",
        422
    );
}

if (mb_strlen($email) > 190) {
    respond_json(
        false,
        "Email address is too long.",
        422
    );
}

if (mb_strlen($contactNumber) > 30) {
    respond_json(
        false,
        "Contact number must not exceed 30 characters.",
        422
    );
}

if (
    mb_strlen(
        $intendedRestaurant
    ) > 180
) {
    respond_json(
        false,
        "Restaurant name must not exceed 180 characters.",
        422
    );
}

if (
    mb_strlen(
        $businessAddress
    ) > 255
) {
    respond_json(
        false,
        "Business address must not exceed 255 characters.",
        422
    );
}

if (mb_strlen($message) > 2000) {
    respond_json(
        false,
        "Message must not exceed 2,000 characters.",
        422
    );
}

/* =========================================================
   EMAIL VALIDATION
========================================================= */

if (
    !filter_var(
        $email,
        FILTER_VALIDATE_EMAIL
    )
) {
    respond_json(
        false,
        "Enter a valid email address.",
        422
    );
}

/* =========================================================
   CONTACT NUMBER VALIDATION
========================================================= */

if (
    !preg_match(
        '/^[0-9+\-\s()]{7,30}$/',
        $contactNumber
    )
) {
    respond_json(
        false,
        "Enter a valid contact number.",
        422
    );
}

/* =========================================================
   CHECK EXISTING USER ACCOUNT
========================================================= */

$userStmt =
    $conn->prepare("
        SELECT
            user_id,
            role

        FROM tbl_users

        WHERE LOWER(email) = ?

        LIMIT 1
    ");

if (!$userStmt) {
    error_log(
        "submit_partner_invitation_request user prepare error: " .
        $conn->error
    );

    respond_json(
        false,
        "Unable to submit your request at this time.",
        500
    );
}

$userStmt->bind_param(
    "s",
    $email
);

if (!$userStmt->execute()) {
    error_log(
        "submit_partner_invitation_request user execute error: " .
        $userStmt->error
    );

    $userStmt->close();

    respond_json(
        false,
        "Unable to submit your request at this time.",
        500
    );
}

$userResult =
    $userStmt->get_result();

$existingUser =
    $userResult->fetch_assoc();

$userStmt->close();

if ($existingUser) {
    $existingRole =
        strtolower(
            trim(
                (string) (
                    $existingUser["role"] ?? ""
                )
            )
        );

    if ($existingRole === "owner") {
        respond_json(
            false,
            "An owner account already exists for this email address. Please use the owner login page.",
            409
        );
    }

    respond_json(
        false,
        "This email address is already registered in FoodConnect.",
        409
    );
}

/* =========================================================
   CHECK EXISTING REQUEST
========================================================= */

$requestStmt =
    $conn->prepare("
        SELECT
            request_id,
            request_status

        FROM tbl_partner_invitation_requests

        WHERE LOWER(email) = ?

        ORDER BY request_id DESC

        LIMIT 1
    ");

if (!$requestStmt) {
    error_log(
        "submit_partner_invitation_request duplicate prepare error: " .
        $conn->error
    );

    respond_json(
        false,
        "Unable to submit your request at this time.",
        500
    );
}

$requestStmt->bind_param(
    "s",
    $email
);

if (!$requestStmt->execute()) {
    error_log(
        "submit_partner_invitation_request duplicate execute error: " .
        $requestStmt->error
    );

    $requestStmt->close();

    respond_json(
        false,
        "Unable to submit your request at this time.",
        500
    );
}

$requestResult =
    $requestStmt->get_result();

$existingRequest =
    $requestResult->fetch_assoc();

$requestStmt->close();

if ($existingRequest) {
    $requestStatus =
        strtolower(
            trim(
                (string) (
                    $existingRequest["request_status"] ?? ""
                )
            )
        );

    if ($requestStatus === "pending") {
        respond_json(
            false,
            "You already have a pending partner request. Please wait for the administrator's review.",
            409
        );
    }

    if ($requestStatus === "approved") {
        respond_json(
            false,
            "Your partner request has already been approved. Please check your email for the owner registration instructions.",
            409
        );
    }
}

/* =========================================================
   CREATE PARTNER INVITATION REQUEST
========================================================= */

$insertStmt =
    $conn->prepare("
        INSERT INTO tbl_partner_invitation_requests (
            full_name,
            email,
            contact_number,
            intended_restaurant,
            business_address,
            message,
            request_status
        )
        VALUES (
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            'pending'
        )
    ");

if (!$insertStmt) {
    error_log(
        "submit_partner_invitation_request insert prepare error: " .
        $conn->error
    );

    respond_json(
        false,
        "Unable to submit your request at this time.",
        500
    );
}

$insertStmt->bind_param(
    "ssssss",
    $fullName,
    $email,
    $contactNumber,
    $intendedRestaurant,
    $businessAddress,
    $message
);

if (!$insertStmt->execute()) {
    error_log(
        "submit_partner_invitation_request insert execute error: " .
        $insertStmt->error
    );

    $insertStmt->close();

    respond_json(
        false,
        "Unable to submit your request at this time.",
        500
    );
}

$requestId =
    (int) $insertStmt->insert_id;

$insertStmt->close();

/* =========================================================
   SUCCESS RESPONSE
========================================================= */

respond_json(
    true,
    "Your FoodConnect partner request has been submitted successfully. Please wait for the administrator's review.",
    201,
    [
        "request_id" => $requestId,
        "request_status" => "pending"
    ]
);