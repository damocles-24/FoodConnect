<?php

header(
    "Content-Type: application/json; charset=utf-8"
);

header(
    "Cache-Control: no-store, no-cache, must-revalidate, max-age=0"
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

require_once __DIR__ . "/session_config.php";
require_once __DIR__ . "/db.php";
require_once __DIR__ . "/rate_limit.php";
require_once __DIR__ . "/mailer.php";

/* =========================================================
   RESPONSE HELPER
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

/* =========================================================
   REQUIRE POST
   ========================================================= */

if (
    strtoupper(
        (string) (
            $_SERVER["REQUEST_METHOD"]
            ?? ""
        )
    ) !== "POST"
) {
    respond_json(
        [
            "success" => false,
            "message" => "This action is not available."
        ],
        405
    );
}

/* =========================================================
   CHECK PENDING LOGIN
   ========================================================= */

$pendingLogin =
    $_SESSION["pending_owner_login"]
    ?? null;

if (!is_array($pendingLogin)) {
    respond_json(
        [
            "success" => false,
            "message" =>
                "Your login verification session has expired. Please log in again.",
            "login_required" => true
        ],
        401
    );
}

$lastSentAt =
    (int) (
        $pendingLogin["last_sent_at"]
        ?? 0
    );

$secondsSinceLastSend =
    time() - $lastSentAt;

if (
    $lastSentAt > 0 &&
    $secondsSinceLastSend < 60
) {
    $waitSeconds =
        60 -
        $secondsSinceLastSend;

    respond_json(
        [
            "success" => false,
            "message" =>
                "Please wait {$waitSeconds} second(s) before requesting another code.",
            "retry_after" =>
                $waitSeconds
        ],
        429
    );
}

$email =
    (string) (
        $pendingLogin["email"]
        ?? ""
    );

$fullName =
    (string) (
        $pendingLogin["full_name"]
        ?? "Restaurant Owner"
    );

if (
    $email === "" ||
    !filter_var(
        $email,
        FILTER_VALIDATE_EMAIL
    )
) {
    unset(
        $_SESSION["pending_owner_login"]
    );

    respond_json(
        [
            "success" => false,
            "message" =>
                "Invalid verification session. Please log in again.",
            "login_required" => true
        ],
        401
    );
}

rate_limit_enforce(
    $conn,
    "owner-otp-resend",
    rate_limit_identifier(
        rate_limit_client_ip(),
        strtolower($email)
    ),
    3,
    600,
    600,
    "Too many verification-code requests. Please wait 10 minutes and try again."
);

/* =========================================================
   CREATE NEW CODE
   ========================================================= */

$newCode =
    (string) random_int(
        100000,
        999999
    );

$newCodeHash =
    password_hash(
        $newCode,
        PASSWORD_DEFAULT
    );

if ($newCodeHash === false) {
    respond_json(
        [
            "success" => false,
            "message" =>
                "Unable to prepare a new verification code."
        ],
        500
    );
}

$safeOwnerName =
    htmlspecialchars(
        $fullName,
        ENT_QUOTES,
        "UTF-8"
    );

$safeCode =
    htmlspecialchars(
        $newCode,
        ENT_QUOTES,
        "UTF-8"
    );

$emailBody = "
<!DOCTYPE html>
<html lang=\"en\">
<head>
    <meta charset=\"UTF-8\">
</head>

<body
    style=\"
        margin: 0;
        padding: 24px;
        background: #f4f6f8;
        font-family: Arial, sans-serif;
        color: #1f2937;
    \"
>
    <div
        style=\"
            max-width: 520px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 14px;
            padding: 32px;
        \"
    >
        <h2>
            New FoodConnect Login Code
        </h2>

        <p>
            Hello {$safeOwnerName},
        </p>

        <p>
            Your new restaurant owner login code is:
        </p>

        <div
            style=\"
                margin: 24px 0;
                padding: 18px;
                text-align: center;
                background: #f3f4f6;
                border-radius: 10px;
                font-size: 32px;
                font-weight: bold;
                letter-spacing: 8px;
            \"
        >
            {$safeCode}
        </div>

        <p>
            This code expires in 5 minutes. Your previous code
            is no longer valid.
        </p>
    </div>
</body>
</html>
";

$emailSent =
    sendBrevoSMTP(
        $email,
        "Your New FoodConnect Owner Login Code",
        $emailBody
    );

if (!$emailSent) {
    respond_json(
        [
            "success" => false,
            "message" =>
                "FoodConnect could not send a new code. Please try again."
        ],
        500
    );
}

/*
Only replace the stored code after the new email was sent
successfully.
*/

$_SESSION[
    "pending_owner_login"
]["code_hash"] =
    $newCodeHash;

$_SESSION[
    "pending_owner_login"
]["expires_at"] =
    time() + 300;

$_SESSION[
    "pending_owner_login"
]["attempts"] =
    0;

$_SESSION[
    "pending_owner_login"
]["last_sent_at"] =
    time();

session_write_close();

respond_json(
    [
        "success" => true,
        "message" =>
            "A new verification code was sent to your email.",
        "expires_in" =>
            300
    ]
);