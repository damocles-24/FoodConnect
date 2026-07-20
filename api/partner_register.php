<?php

header("Content-Type: application/json; charset=utf-8");

require_once __DIR__ . "/db.php";
require_once __DIR__ . "/mailer.php";

function respond_json(
    bool $success,
    string $message,
    int $statusCode = 200
): void {
    http_response_code($statusCode);

    echo json_encode([
        "success" => $success,
        "message" => $message
    ]);

    exit;
}

$rawInput = file_get_contents("php://input");
$data = json_decode($rawInput, true);

if (!is_array($data)) {
    respond_json(
        false,
        "Invalid request data.",
        400
    );
}

$fullName = trim(
    (string) ($data["full_name"] ?? "")
);

$email = strtolower(trim(
    (string) ($data["email"] ?? "")
));

$contactNumber = trim(
    (string) ($data["contact_number"] ?? "")
);

$password = (string) (
    $data["password"] ?? ""
);

$restaurantName = trim(
    (string) ($data["restaurant_name"] ?? "")
);

$restaurantAddress = trim(
    (string) ($data["restaurant_address"] ?? "")
);

$restaurantContact = trim(
    (string) ($data["restaurant_contact"] ?? "")
);

$cuisine = trim(
    (string) ($data["cuisine"] ?? "")
);

/* =========================================================
   VALIDATION
   ========================================================= */

if (
    $fullName === "" ||
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

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    respond_json(
        false,
        "Please enter a valid email address.",
        422
    );
}

if (strlen($password) < 8) {
    respond_json(
        false,
        "Password must contain at least 8 characters.",
        422
    );
}

/* =========================================================
   DUPLICATE EMAIL CHECK
   ========================================================= */

$checkStmt = $conn->prepare("
    SELECT user_id
    FROM tbl_users
    WHERE email = ?
    LIMIT 1
");

if (!$checkStmt) {
    respond_json(
        false,
        "Unable to validate the email address.",
        500
    );
}

$checkStmt->bind_param(
    "s",
    $email
);

$checkStmt->execute();

$existingUser =
    $checkStmt
        ->get_result()
        ->fetch_assoc();

$checkStmt->close();

if ($existingUser) {
    respond_json(
        false,
        "This email address is already registered.",
        409
    );
}

/* =========================================================
   PREPARE ACCOUNT DATA
   ========================================================= */

$role = "owner";

$passwordHash = password_hash(
    $password,
    PASSWORD_DEFAULT
);

$verificationToken =
    bin2hex(random_bytes(32));

$verificationExpiresAt = date(
    "Y-m-d H:i:s",
    time() + 86400
);

try {
    $conn->begin_transaction();

    /* =====================================================
       CREATE OWNER ACCOUNT
       ===================================================== */

    $userStmt = $conn->prepare("
        INSERT INTO tbl_users (
            restaurant_id,
            role,
            full_name,
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
        "sssssss",
        $role,
        $fullName,
        $email,
        $contactNumber,
        $passwordHash,
        $verificationToken,
        $verificationExpiresAt
    );

    if (!$userStmt->execute()) {
        throw new RuntimeException(
            "Unable to create owner account."
        );
    }

    $ownerId = (int) $conn->insert_id;

    $userStmt->close();

    /* =====================================================
       CREATE PARTNER APPLICATION
       ===================================================== */

    $applicationStmt = $conn->prepare("
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
        throw new RuntimeException(
            "Unable to create partner application."
        );
    }

    $applicationStmt->close();

    $conn->commit();
} catch (Throwable $error) {
    $conn->rollback();

    error_log(
        "partner_register.php error: " .
        $error->getMessage()
    );

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
    "http://localhost/FoodConnect/api/verify.php?token=" .
    urlencode($verificationToken);

$safeName = htmlspecialchars(
    $fullName,
    ENT_QUOTES,
    "UTF-8"
);

$safeRestaurantName = htmlspecialchars(
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
        Verify your email address to continue with
        your restaurant setup.
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

$emailSent = sendBrevoSMTP(
    $email,
    "Verify your FoodConnect partner application",
    $emailBody
);

if (!$emailSent) {
    respond_json(
        false,
        "Your application was saved, but the verification email could not be sent.",
        500
    );
}

respond_json(
    true,
    "Application submitted successfully. Please check your email for the verification link.",
    201
);