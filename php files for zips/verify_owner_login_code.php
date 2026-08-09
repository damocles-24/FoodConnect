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

$requestMethod =
    strtoupper(
        (string) (
            $_SERVER["REQUEST_METHOD"]
            ?? ""
        )
    );

if ($requestMethod !== "POST") {
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
   READ REQUEST
   ========================================================= */

$rawInput =
    file_get_contents(
        "php://input"
    );

$input =
    json_decode(
        $rawInput,
        true
    );

if (!is_array($input)) {
    respond_json(
        [
            "success" => false,
            "message" =>
                "Invalid request data."
        ],
        400
    );
}

$code =
    trim(
        (string) (
            $input["code"]
            ?? ""
        )
    );

$trustDevice =
    filter_var(
        $input["trust_device"]
        ?? false,
        FILTER_VALIDATE_BOOLEAN
    );

if (
    !preg_match(
        "/^[0-9]{6}$/",
        $code
    )
) {
    respond_json(
        [
            "success" => false,
            "message" =>
                "Enter the 6-digit verification code."
        ],
        422
    );
}

/* =========================================================
   CHECK PENDING OWNER LOGIN
   ========================================================= */

$pendingLogin =
    $_SESSION["pending_owner_login"]
    ?? null;

if (!is_array($pendingLogin)) {
    respond_json(
        [
            "success" => false,
            "message" =>
                "Your owner login verification session has expired. Please log in again.",
            "login_required" => true
        ],
        401
    );
}

/* =========================================================
   CHECK CODE EXPIRATION
   ========================================================= */

$codeExpiresAt =
    (int) (
        $pendingLogin["expires_at"]
        ?? 0
    );

if (
    $codeExpiresAt <= 0 ||
    time() > $codeExpiresAt
) {
    unset(
        $_SESSION["pending_owner_login"]
    );

    respond_json(
        [
            "success" => false,
            "message" =>
                "The verification code has expired. Please log in again.",
            "login_required" => true
        ],
        401
    );
}

/* =========================================================
   CHECK ATTEMPTS
   ========================================================= */

$attempts =
    (int) (
        $pendingLogin["attempts"]
        ?? 0
    );

if ($attempts >= 5) {
    unset(
        $_SESSION["pending_owner_login"]
    );

    respond_json(
        [
            "success" => false,
            "message" =>
                "Too many incorrect attempts. Please log in again to receive a new code.",
            "login_required" => true
        ],
        429
    );
}

/* =========================================================
   VERIFY CODE
   ========================================================= */

$codeHash =
    (string) (
        $pendingLogin["code_hash"]
        ?? ""
    );

$codeIsValid =
    $codeHash !== "" &&
    password_verify(
        $code,
        $codeHash
    );

if (!$codeIsValid) {
    $attempts++;

    $_SESSION[
        "pending_owner_login"
    ]["attempts"] =
        $attempts;

    $remainingAttempts =
        max(
            0,
            5 - $attempts
        );

    if ($remainingAttempts <= 0) {
        unset(
            $_SESSION["pending_owner_login"]
        );

        respond_json(
            [
                "success" => false,
                "message" =>
                    "Too many incorrect attempts. Please log in again.",
                "login_required" => true
            ],
            429
        );
    }

    respond_json(
        [
            "success" => false,
            "message" =>
                "Incorrect verification code. {$remainingAttempts} attempt(s) remaining."
        ],
        401
    );
}

/* =========================================================
   GET PENDING OWNER VALUES
   ========================================================= */

$userId =
    (int) (
        $pendingLogin["user_id"]
        ?? 0
    );

$restaurantId =
    !empty(
        $pendingLogin["restaurant_id"]
    )
        ? (int) $pendingLogin[
            "restaurant_id"
        ]
        : null;

$fullName =
    trim(
        (string) (
            $pendingLogin["full_name"]
            ?? ""
        )
    );

$email =
    strtolower(
        trim(
            (string) (
                $pendingLogin["email"]
                ?? ""
            )
        )
    );

$redirectUrl =
    trim(
        (string) (
            $pendingLogin["redirect_url"]
            ?? "/FoodConnect/frontend/html/index.html"
        )
    );

$onboardingRequired =
    (bool) (
        $pendingLogin[
            "onboarding_required"
        ]
        ?? false
    );

$applicationStatus =
    $pendingLogin[
        "application_status"
    ] ?? null;

/* =========================================================
   VALIDATE PENDING OWNER
   ========================================================= */

if ($userId <= 0) {
    unset(
        $_SESSION["pending_owner_login"]
    );

    respond_json(
        [
            "success" => false,
            "message" =>
                "Invalid owner verification session. Please log in again.",
            "login_required" => true
        ],
        401
    );
}

/* =========================================================
   OPTIONAL TRUSTED DEVICE
   ========================================================= */

$trustedDeviceCreated =
    false;

if ($trustDevice) {
    $selector = "";
    $token = "";

    try {

        $selector =
            bin2hex(
                random_bytes(16)
            );

        $token =
            bin2hex(
                random_bytes(32)
            );
    } catch (Throwable $error) {
        error_log(
            "verify_owner_login_code.php token generation error: " .
            $error->getMessage()
        );

        respond_json(
            [
                "success" => false,
                "message" =>
                    "Unable to prepare the trusted device."
            ],
            500
        );
    }

    $tokenHash =
        hash(
            "sha256",
            $token
        );

    $trustedExpiresTimestamp =
        time() +
        (
            30 *
            24 *
            60 *
            60
        );

    $trustedExpiresAt =
        date(
            "Y-m-d H:i:s",
            $trustedExpiresTimestamp
        );

    /* =====================================================
       REMOVE EXPIRED TRUSTED DEVICES
       ===================================================== */

    $cleanupStmt =
        $conn->prepare("
            DELETE FROM
                tbl_owner_trusted_devices
            WHERE
                expires_at <= NOW()
        ");

    if ($cleanupStmt) {
        if (!$cleanupStmt->execute()) {
            error_log(
                "verify_owner_login_code.php cleanup execute error: " .
                $cleanupStmt->error
            );
        }

        $cleanupStmt->close();
    } else {
        error_log(
            "verify_owner_login_code.php cleanup prepare error: " .
            $conn->error
        );
    }

    /* =====================================================
       SAVE TRUSTED DEVICE
       ===================================================== */

    $trustedStmt =
        $conn->prepare("
            INSERT INTO
                tbl_owner_trusted_devices
            (
                owner_id,
                selector,
                token_hash,
                expires_at
            )
            VALUES (?, ?, ?, ?)
        ");

    if (!$trustedStmt) {
        error_log(
            "verify_owner_login_code.php trusted-device prepare error: " .
            $conn->error
        );

        respond_json(
            [
                "success" => false,
                "message" =>
                    "Unable to save the trusted device."
            ],
            500
        );
    }

    $trustedStmt->bind_param(
        "isss",
        $userId,
        $selector,
        $tokenHash,
        $trustedExpiresAt
    );

    if (!$trustedStmt->execute()) {
        error_log(
            "verify_owner_login_code.php trusted-device execute error: " .
            $trustedStmt->error
        );

        $trustedStmt->close();

        respond_json(
            [
                "success" => false,
                "message" =>
                    "Unable to save the trusted device."
            ],
            500
        );
    }

    $trustedStmt->close();

    /* =====================================================
       CREATE TRUSTED-DEVICE COOKIE
       ===================================================== */

    $cookieValue =
        $selector .
        ":" .
        $token;

    $isHttps =
        !empty(
            $_SERVER["HTTPS"]
        ) &&
        strtolower(
            (string) $_SERVER["HTTPS"]
        ) !== "off";

    $cookiePath = "/FoodConnect";

if (PHP_VERSION_ID >= 70300) {
    $cookieCreated =
        setcookie(
            "FOODCONNECT_OWNER_TRUST",
            $cookieValue,
            [
                "expires" => $trustedExpiresTimestamp,
                "path" => $cookiePath,
                "secure" => $isHttps,
                "httponly" => true,
                "samesite" => "Lax"
            ]
        );
} else {
    $cookieCreated =
        setcookie(
            "FOODCONNECT_OWNER_TRUST",
            $cookieValue,
            $trustedExpiresTimestamp,
            $cookiePath . "; SameSite=Lax",
            "",
            $isHttps,
            true
        );
}

    if (!$cookieCreated) {
    /*
    Remove the unusable database token, but allow the
    verified owner to continue logging in normally.
    */

    $deleteStmt =
        $conn->prepare("
            DELETE FROM
                tbl_owner_trusted_devices
            WHERE
                selector = ?
            LIMIT 1
        ");

    if ($deleteStmt) {
        $deleteStmt->bind_param(
            "s",
            $selector
        );

        $deleteStmt->execute();
        $deleteStmt->close();
    }

    error_log(
        "verify_owner_login_code.php failed to create trusted-device cookie."
    );

    $trustedDeviceCreated =
        false;
} else {
    $trustedDeviceCreated =
        true;
}
}

/* =========================================================
   REMOVE PENDING LOGIN

   The verification code cannot be reused after this point.
   ========================================================= */

unset(
    $_SESSION["pending_owner_login"]
);

/* =========================================================
   CREATE AUTHENTICATED OWNER SESSION
   ========================================================= */

session_regenerate_id(
    true
);

$_SESSION["user_id"] =
    $userId;

$_SESSION["role"] =
    "owner";

$_SESSION["restaurant_id"] =
    $restaurantId;

$_SESSION["full_name"] =
    $fullName;

$_SESSION["logged_in"] =
    true;

$_SESSION["authenticated_at"] =
    time();

$_SESSION["owner_email_verified_at"] =
    time();

$_SESSION["owner_trusted_device"] =
    $trustedDeviceCreated;

session_write_close();

/* =========================================================
   RESPONSE
   ========================================================= */

respond_json(
    [
        "success" => true,

        "message" =>
            $trustedDeviceCreated
                ? "Owner identity verified. This device will be trusted for 30 days."
                : "Owner identity verified successfully.",

        "trusted_device" =>
            $trustedDeviceCreated,

        "redirect_url" =>
            $redirectUrl,

        "onboarding_required" =>
            $onboardingRequired,

        "application_status" =>
            $applicationStatus,

        "user" => [
            "user_id" =>
                $userId,

            "restaurant_id" =>
                $restaurantId,

            "role" =>
                "owner",

            "full_name" =>
                $fullName,

            "email" =>
                $email
        ]
    ]
);