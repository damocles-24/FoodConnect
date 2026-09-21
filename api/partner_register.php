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

require_once __DIR__ . "/session_config.php";
require_once __DIR__ . "/db.php";
require_once __DIR__ . "/rate_limit.php";
require_once __DIR__ . "/ph_phone.php";
require_once __DIR__ . "/mailer.php";
require_once __DIR__ . "/url_helper.php";
require_once __DIR__ . "/name_helper.php";

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
        "This action is not available.",
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

$firstName = trim((string)($data["first_name"] ?? ""));
$middleName = trim((string)($data["middle_name"] ?? ""));
$lastName = trim((string)($data["last_name"] ?? ""));

$fullName = formatUserName([
    "first_name" => $firstName,
    "middle_name" => $middleName,
    "last_name" => $lastName
]);

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

$password =
    (string) (
        $data["password"] ?? ""
    );

$restaurantName =
    trim(
        (string) (
            $data["restaurant_name"] ?? ""
        )
    );

$restaurantAddress =
    trim(
        (string) (
            $data["restaurant_address"] ?? ""
        )
    );

$restaurantContact =
    trim(
        (string) (
            $data["restaurant_contact"] ?? ""
        )
    );

$cuisine =
    trim(
        (string) (
            $data["cuisine"] ?? ""
        )
    );

$contactNumberRaw = $contactNumber;
$restaurantContactRaw = $restaurantContact;
$contactNumber = normalize_ph_mobile($contactNumberRaw);
$restaurantContact = normalize_ph_mobile($restaurantContactRaw);

if ($contactNumberRaw !== "" && $contactNumber === "") {
    respond_json(false, "Enter a valid Philippine mobile number for your personal contact.", 422);
}

if ($restaurantContactRaw !== "" && $restaurantContact === "") {
    respond_json(false, "Enter a valid Philippine mobile number for the restaurant contact.", 422);
}

/* =========================================================
   REQUIRED FIELD VALIDATION
========================================================= */

if (
    $firstName === "" ||
    $lastName === "" ||
    $email === "" ||
    $contactNumber === "" ||
    $password === "" ||
    $restaurantName === "" ||
    $restaurantAddress === "" ||
    $restaurantContact === "" ||
    $cuisine === ""
) {
    respond_json(
        false,
        "Please complete all required fields.",
        422
    );
}

if (strlen($firstName) > 100 || strlen($middleName) > 100 || strlen($lastName) > 100) {
    respond_json(false, "Owner name fields must not exceed 100 characters.", 422);
}

if (
    !filter_var(
        $email,
        FILTER_VALIDATE_EMAIL
    )
) {
    respond_json(
        false,
        "Please enter a valid email address.",
        422
    );
}

if (
    strlen($password) < 8
) {
    respond_json(
        false,
        "Password must contain at least 8 characters.",
        422
    );
}

/* =========================================================
   PREPARE ACCOUNT DATA
========================================================= */

$role = "owner";

$passwordHash =
    password_hash(
        $password,
        PASSWORD_DEFAULT
    );

$verificationToken =
    bin2hex(
        random_bytes(32)
    );

$verificationExpiresAt =
    date(
        "Y-m-d H:i:s",
        time() + 86400
    );

/* =========================================================
   DATABASE TRANSACTION
========================================================= */

rate_limit_enforce(
    $conn,
    "partner-registration",
    rate_limit_identifier(
        rate_limit_client_ip(),
        $email
    ),
    4,
    3600,
    1800,
    "Too many partner registration attempts. Please wait before trying again."
);

try {
    $conn->begin_transaction();

    /* =====================================================
       DUPLICATE EMAIL CHECK
    ===================================================== */

    $checkStmt =
        $conn->prepare("
            SELECT user_id

            FROM tbl_users

            WHERE email = ?

            LIMIT 1
        ");

    if (!$checkStmt) {
        throw new RuntimeException(
            "Unable to validate the email address."
        );
    }

    $checkStmt->bind_param(
        "s",
        $email
    );

    if (!$checkStmt->execute()) {
        $checkStmt->close();

        throw new RuntimeException(
            "Unable to validate the email address."
        );
    }

    $existingUser =
        $checkStmt
            ->get_result()
            ->fetch_assoc();

    $checkStmt->close();

    if ($existingUser) {
        $conn->rollback();

        respond_json(
            false,
            "This email address is already registered.",
            409
        );
    }

    /* =====================================================
       CREATE OWNER ACCOUNT
    ===================================================== */

    $userStmt =
        $conn->prepare("
            INSERT INTO tbl_users (
                restaurant_id,
                role,
                first_name,
                middle_name,
                last_name,
                email,
                contact_number,
                password_hash,
                status,
                is_verified,
                verification_token,
                verification_expires_at
            )

            VALUES (
                NULL,
                ?,
                ?,
                ?,
                ?,
                ?,
                ?,
                ?,
                0,
                0,
                ?,
                ?
            )
        ");

    if (!$userStmt) {
        throw new RuntimeException(
            "Unable to prepare owner account creation."
        );
    }

    $userStmt->bind_param(
        "sssssssss",
        $role,
        $firstName,
        $middleName,
        $lastName,
        $email,
        $contactNumber,
        $passwordHash,
        $verificationToken,
        $verificationExpiresAt
    );

    if (!$userStmt->execute()) {
        $userStmt->close();

        throw new RuntimeException(
            "Unable to create owner account."
        );
    }

    $ownerId =
        (int) $conn->insert_id;

    $userStmt->close();

    /* =====================================================
       CREATE PARTNER APPLICATION
    ===================================================== */

    $applicationStmt =
        $conn->prepare("
            INSERT INTO tbl_partner_applications (
                owner_id,
                restaurant_name,
                restaurant_address,
                restaurant_contact,
                cuisine,
                application_status
            )

            VALUES (
                ?,
                ?,
                ?,
                ?,
                ?,
                'email_pending'
            )
        ");

    if (!$applicationStmt) {
        throw new RuntimeException(
            "Unable to prepare partner application."
        );
    }

    $applicationStmt->bind_param(
        "issss",
        $ownerId,
        $restaurantName,
        $restaurantAddress,
        $restaurantContact,
        $cuisine
    );

    if (!$applicationStmt->execute()) {
        $applicationStmt->close();

        throw new RuntimeException(
            "Unable to create partner application."
        );
    }

    $applicationId =
        (int) $conn->insert_id;

    $applicationStmt->close();

    $conn->commit();

    /* =====================================================
       CREATE RESTRICTED ONBOARDING SESSION

       The application is safely committed before any session is created.
       This session intentionally uses role=partner_applicant, not owner, so
       normal owner APIs remain blocked until email verification succeeds.
       The applicant may only use endpoints that explicitly allow the
       restricted onboarding role.
    ===================================================== */

    session_regenerate_id(true);

    $_SESSION = [];

    $_SESSION["user_id"] =
        $ownerId;

    $_SESSION["role"] =
        "partner_applicant";

    $_SESSION["account_role"] =
        "owner";

    $_SESSION["restaurant_id"] =
        null;

    $_SESSION["display_name"] =
        $fullName;

    $_SESSION["logged_in"] =
        true;

    $_SESSION["authenticated_at"] =
        time();

    $_SESSION["partner_application_only"] =
        true;

    session_write_close();
} catch (Throwable $error) {
    if ($conn->errno === 0) {
        /*
         * The transaction may still be active even when
         * no MySQL connection error is reported.
         */
    }

    try {
        $conn->rollback();
    } catch (Throwable $rollbackError) {
        error_log(
            "partner_register rollback error: " .
            $rollbackError->getMessage()
        );
    }

    error_log(
        "partner_register.php error: " .
        $error->getMessage()
    );

    $errorMessage =
        $error->getMessage();

    respond_json(
        false,
        "Unable to submit the partner application.",
        500
    );
}


/* =========================================================
   EMAIL VERIFICATION
========================================================= */

$verificationLink =
    foodconnect_verification_url(
        $verificationToken
    );

$safeName =
    htmlspecialchars(
        $fullName,
        ENT_QUOTES,
        "UTF-8"
    );

$safeRestaurantName =
    htmlspecialchars(
        $restaurantName,
        ENT_QUOTES,
        "UTF-8"
    );

$emailBody = "
<!DOCTYPE html>
<html>
<body style='
    margin:0;
    padding:0;
    background:#fff8f1;
    font-family:Arial,Helvetica,sans-serif;
'>

<table
    width='100%'
    cellpadding='0'
    cellspacing='0'
    style='padding:32px 15px;'
>
<tr>
<td align='center'>

<table
    width='560'
    cellpadding='0'
    cellspacing='0'
    style='
        width:100%;
        max-width:560px;
        background:#ffffff;
        border-radius:18px;
        overflow:hidden;
        box-shadow:0 12px 35px rgba(52,69,77,.12);
    '
>

<tr>
<td
    align='center'
    style='
        padding:28px;
        background:#fff4e8;
    '
>
    <div style='
        font-size:26px;
        font-weight:800;
    '>
        <span style='color:#f58220;'>Food</span><span style='color:#43b047;'>Connect</span>
    </div>

    <div style='
        margin-top:6px;
        color:#71828a;
        font-size:13px;
    '>
        Restaurant Partner Program
    </div>
</td>
</tr>

<tr>
<td style='padding:32px;'>

    <h2 style='
        margin:0;
        color:#2f4149;
        font-size:22px;
    '>
        Verify your partner email
    </h2>

    <p style='
        margin-top:18px;
        color:#455a64;
        font-size:15px;
        line-height:1.7;
    '>
        Hi {$safeName},
    </p>

    <p style='
        color:#455a64;
        font-size:15px;
        line-height:1.7;
    '>
        Thank you for applying to register
        <strong>{$safeRestaurantName}</strong>
        as a FoodConnect restaurant partner.
    </p>

    <p style='
        color:#455a64;
        font-size:15px;
        line-height:1.7;
    '>
        You can continue filling in your restaurant setup now.
        Verify your email address before completing the setup
        and sending it for FoodConnect review.
    </p>

    <div style='
        padding:24px 0;
        text-align:center;
    '>
        <a
            href='{$verificationLink}'
            style='
                display:inline-block;
                padding:14px 24px;
                color:#ffffff;
                background:#f58220;
                border-radius:11px;
                font-size:14px;
                font-weight:bold;
                text-decoration:none;
            '
        >
            Verify Partner Email
        </a>
    </div>

    <p style='
        color:#71828a;
        font-size:12px;
        line-height:1.6;
    '>
        This verification link expires after 24 hours.
    </p>

</td>
</tr>

</table>

</td>
</tr>
</table>

</body>
</html>
";

/* =========================================================
   SEND VERIFICATION EMAIL
========================================================= */

$emailSent = false;

try {
    $emailSent =
        sendBrevoSMTP(
            $email,
            "Verify your FoodConnect partner application",
            $emailBody
        );
} catch (Throwable $mailError) {
    error_log(
        "partner_register verification email error: " .
        $mailError->getMessage()
    );

    $emailSent = false;
}

if (!$emailSent) {
    /*
     * The account and application were already committed successfully. Do
     * not make the browser think registration failed and tempt the applicant
     * to submit a duplicate application. The restricted onboarding session
     * remains valid so the applicant can continue setup and request an
     * administrator-approved replacement email from the wizard.
     */
    respond_json(
        true,
        "Your application was saved. The first verification email could not be delivered, but you can continue restaurant setup and request a new verification email from the FoodConnect administrator.",
        201,
        [
            "application_saved" => true,
            "application_id" => $applicationId,
            "application_status" => "email_pending",
            "restricted_onboarding" => true,
            "verification_email_sent" => false,
            "redirect_url" => "/frontend/html/create_restaurant.html"
        ]
    );
}

/* =========================================================
   SUCCESS RESPONSE
========================================================= */

respond_json(
    true,
    "Application submitted successfully. Check your email for the verification link. You can continue setting up your restaurant while verification is pending.",
    201,
    [
        "application_saved" => true,
        "application_id" => $applicationId,
        "application_status" => "email_pending",
        "restricted_onboarding" => true,
        "verification_email_sent" => true,
        "redirect_url" => "/frontend/html/create_restaurant.html"
    ]
);