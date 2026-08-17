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

/* =========================================================
   SESSION, DATABASE, AND MAIL CONFIGURATION
   ========================================================= */

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
   EMAIL MASKING
   ========================================================= */

function mask_email_address(
    string $email
): string {
    $parts =
        explode(
            "@",
            $email,
            2
        );

    if (count($parts) !== 2) {
        return $email;
    }

    [$localPart, $domain] =
        $parts;

    $localLength =
        strlen(
            $localPart
        );

    if ($localLength <= 2) {
        $maskedLocal =
            substr(
                $localPart,
                0,
                1
            ) .
            "*";
    } else {
        $maskedLocal =
            substr(
                $localPart,
                0,
                2
            ) .
            str_repeat(
                "*",
                max(
                    1,
                    $localLength - 2
                )
            );
    }

    return
        $maskedLocal .
        "@" .
        $domain;
}

/* =========================================================
   HTTPS CHECK
   ========================================================= */

function request_is_https(): bool
{
    return
        !empty(
            $_SERVER["HTTPS"]
        ) &&
        strtolower(
            (string) $_SERVER["HTTPS"]
        ) !== "off";
}

/* =========================================================
   REMOVE TRUSTED-DEVICE COOKIE
   ========================================================= */

function clear_owner_trusted_cookie(): void
{
    setcookie(
        "FOODCONNECT_OWNER_TRUST",
        "",
        [
            "expires" =>
                time() - 3600,

            "path" =>
                "/FoodConnect",

            "secure" =>
                request_is_https(),

            "httponly" =>
                true,

            "samesite" =>
                "Lax"
        ]
    );
}

/* =========================================================
   REQUIRE POST REQUEST
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
                "This action is not available."
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

$email =
    strtolower(
        trim(
            (string) (
                $input["email"]
                ?? ""
            )
        )
    );

$password =
    (string) (
        $input["password"]
        ?? ""
    );

if (
    $email === "" ||
    $password === ""
) {
    respond_json(
        [
            "success" => false,
            "message" =>
                "Enter your owner email and password."
        ],
        400
    );
}

if (
    !filter_var(
        $email,
        FILTER_VALIDATE_EMAIL
    )
) {
    respond_json(
        [
            "success" => false,
            "message" =>
                "Enter a valid email address."
        ],
        422
    );
}

rate_limit_enforce(
    $conn,
    "owner-login",
    rate_limit_identifier(
        rate_limit_client_ip(),
        $email
    ),
    8,
    900,
    900,
    "Too many owner login attempts. Please wait 15 minutes and try again."
);

/* =========================================================
   FIND OWNER ACCOUNT
   ========================================================= */

$accountStmt =
    $conn->prepare("
        SELECT
            user_id,
            restaurant_id,
            role,
            full_name,
            email,
            password_hash,
            status,
            is_verified
        FROM
            tbl_users
        WHERE
            email = ?
        LIMIT 1
    ");

if (!$accountStmt) {
    error_log(
        "owner_login.php account prepare error: " .
        $conn->error
    );

    respond_json(
        [
            "success" => false,
            "message" =>
                "Unable to process the owner login."
        ],
        500
    );
}

$accountStmt->bind_param(
    "s",
    $email
);

if (!$accountStmt->execute()) {
    error_log(
        "owner_login.php account execute error: " .
        $accountStmt->error
    );

    $accountStmt->close();

    respond_json(
        [
            "success" => false,
            "message" =>
                "Unable to process the owner login."
        ],
        500
    );
}

$user =
    $accountStmt
        ->get_result()
        ->fetch_assoc();

$accountStmt->close();

/*
Use one generic message when either the email or password
is incorrect. This avoids revealing whether an email exists.
*/

if (
    !$user ||
    !password_verify(
        $password,
        (string) $user[
            "password_hash"
        ]
    )
) {
    respond_json(
        [
            "success" => false,
            "message" =>
                "Invalid email or password."
        ],
        401
    );
}

/* =========================================================
   OWNER ROLE AND STATUS VALIDATION
   ========================================================= */

$role =
    strtolower(
        trim(
            (string) $user["role"]
        )
    );

if ($role !== "owner") {
    respond_json(
        [
            "success" => false,
            "message" =>
                "This login option is for restaurant owners only."
        ],
        403
    );
}

if ((int) $user["status"] !== 1) {
    respond_json(
        [
            "success" => false,
            "message" =>
                "Your owner account is currently disabled."
        ],
        403
    );
}

if ((int) $user["is_verified"] !== 1) {
    respond_json(
        [
            "success" => false,
            "message" =>
                "Verify your email before logging in."
        ],
        403
    );
}

/* =========================================================
   OWNER ACCOUNT VALUES
   ========================================================= */

$userId =
    (int) $user["user_id"];

$restaurantId =
    !empty(
        $user["restaurant_id"]
    )
        ? (int) $user[
            "restaurant_id"
        ]
        : null;

$restaurant =
    null;

/* =========================================================
   CHECK FOR OWNER RESTAURANT
   ========================================================= */

$restaurantStmt =
    $conn->prepare("
        SELECT
            restaurant_id,
            name,
            address,
            contact_number,
            opening_hours,
            delivery_fee,
            business_status,
            owner_id
        FROM
            tbl_restaurants
        WHERE
            owner_id = ?
        ORDER BY
            restaurant_id ASC
        LIMIT 1
    ");

if (!$restaurantStmt) {
    error_log(
        "owner_login.php restaurant prepare error: " .
        $conn->error
    );

    respond_json(
        [
            "success" => false,
            "message" =>
                "Unable to check the restaurant account."
        ],
        500
    );
}

$restaurantStmt->bind_param(
    "i",
    $userId
);

if (!$restaurantStmt->execute()) {
    error_log(
        "owner_login.php restaurant execute error: " .
        $restaurantStmt->error
    );

    $restaurantStmt->close();

    respond_json(
        [
            "success" => false,
            "message" =>
                "Unable to check the restaurant account."
        ],
        500
    );
}

$restaurant =
    $restaurantStmt
        ->get_result()
        ->fetch_assoc();

$restaurantStmt->close();

/* =========================================================
   SYNCHRONIZE RESTAURANT ID
   ========================================================= */

if ($restaurant) {
    $restaurantId =
        (int) $restaurant[
            "restaurant_id"
        ];

    $storedRestaurantId =
        !empty(
            $user["restaurant_id"]
        )
            ? (int) $user[
                "restaurant_id"
            ]
            : null;

    if (
        $storedRestaurantId === null ||
        $storedRestaurantId !==
            $restaurantId
    ) {
        $syncStmt =
            $conn->prepare("
                UPDATE
                    tbl_users
                SET
                    restaurant_id = ?
                WHERE
                    user_id = ?
                LIMIT 1
            ");

        if (!$syncStmt) {
            error_log(
                "owner_login.php sync prepare error: " .
                $conn->error
            );
        } else {
            $syncStmt->bind_param(
                "ii",
                $restaurantId,
                $userId
            );

            if (
                !$syncStmt->execute()
            ) {
                error_log(
                    "owner_login.php sync execute error: " .
                    $syncStmt->error
                );
            }

            $syncStmt->close();
        }
    }
}

/* =========================================================
   GET LATEST PARTNER APPLICATION
   ========================================================= */

$application =
    null;

$applicationStatus =
    null;

$rejectionReason =
    null;

$applicationStmt =
    $conn->prepare("
        SELECT
            application_id,
            restaurant_name,
            application_status,
            rejection_reason,
            submitted_at,
            reviewed_at,
            reviewed_by,
            created_at,
            updated_at
        FROM
            tbl_partner_applications
        WHERE
            owner_id = ?
        ORDER BY
            application_id DESC
        LIMIT 1
    ");

if (!$applicationStmt) {
    error_log(
        "owner_login.php application prepare error: " .
        $conn->error
    );
} else {
    $applicationStmt->bind_param(
        "i",
        $userId
    );

    if (
        !$applicationStmt->execute()
    ) {
        error_log(
            "owner_login.php application execute error: " .
            $applicationStmt->error
        );
    } else {
        $application =
            $applicationStmt
                ->get_result()
                ->fetch_assoc();

        if ($application) {
            $applicationStatus =
                strtolower(
                    trim(
                        (string) $application[
                            "application_status"
                        ]
                    )
                );

            $rejectionReason =
                $application[
                    "rejection_reason"
                ];
        }
    }

    $applicationStmt->close();
}

/* =========================================================
   DETERMINE OWNER DESTINATION
   ========================================================= */

if (
    $restaurantId !== null &&
    $restaurantId > 0
) {
    $redirectUrl =
        "/FoodConnect/frontend/html/owner_dashboard.html";

    $onboardingRequired =
        false;
} else {
    $redirectUrl =
        "/FoodConnect/frontend/html/create_restaurant.html";

    $onboardingRequired =
        true;
}

/* =========================================================
   REMOVE EXPIRED TRUSTED DEVICES
   ========================================================= */

$cleanupStmt =
    $conn->prepare("
        DELETE FROM
            tbl_owner_trusted_devices
        WHERE
            expires_at <= NOW()
    ");

if ($cleanupStmt) {
    if (
        !$cleanupStmt->execute()
    ) {
        error_log(
            "owner_login.php trusted cleanup execute error: " .
            $cleanupStmt->error
        );
    }

    $cleanupStmt->close();
} else {
    error_log(
        "owner_login.php trusted cleanup prepare error: " .
        $conn->error
    );
}

/* =========================================================
   CHECK TRUSTED OWNER DEVICE
   ========================================================= */

$trustedCookie =
    trim(
        (string) (
            $_COOKIE[
                "FOODCONNECT_OWNER_TRUST"
            ]
            ?? ""
        )
    );

if ($trustedCookie !== "") {
    $cookieParts =
        explode(
            ":",
            $trustedCookie,
            2
        );

    $trustedSelector =
        "";

    $trustedToken =
        "";

    if (
        count($cookieParts) === 2
    ) {
        $trustedSelector =
            strtolower(
                trim(
                    (string) $cookieParts[0]
                )
            );

        $trustedToken =
            strtolower(
                trim(
                    (string) $cookieParts[1]
                )
            );
    }

    $selectorIsValid =
        preg_match(
            "/^[a-f0-9]{32}$/",
            $trustedSelector
        ) === 1;

    $tokenIsValid =
        preg_match(
            "/^[a-f0-9]{64}$/",
            $trustedToken
        ) === 1;

    if (
        $selectorIsValid &&
        $tokenIsValid
    ) {
        $trustedStmt =
            $conn->prepare("
                SELECT
                    trusted_device_id,
                    owner_id,
                    token_hash,
                    expires_at
                FROM
                    tbl_owner_trusted_devices
                WHERE
                    selector = ?
                LIMIT 1
            ");

        if (!$trustedStmt) {
            error_log(
                "owner_login.php trusted-device prepare error: " .
                $conn->error
            );
        } else {
            $trustedStmt->bind_param(
                "s",
                $trustedSelector
            );

            if (
                !$trustedStmt->execute()
            ) {
                error_log(
                    "owner_login.php trusted-device execute error: " .
                    $trustedStmt->error
                );
            } else {
                $trustedDevice =
                    $trustedStmt
                        ->get_result()
                        ->fetch_assoc();

                if ($trustedDevice) {
                    $storedOwnerId =
                        (int) $trustedDevice[
                            "owner_id"
                        ];

                    $storedTokenHash =
                        (string) $trustedDevice[
                            "token_hash"
                        ];

                    $storedExpiresAt =
                        strtotime(
                            (string) $trustedDevice[
                                "expires_at"
                            ]
                        );

                    $providedTokenHash =
                        hash(
                            "sha256",
                            $trustedToken
                        );

                    $ownerMatches =
                        $storedOwnerId ===
                        $userId;

                    $tokenMatches =
                        $storedTokenHash !== "" &&
                        hash_equals(
                            $storedTokenHash,
                            $providedTokenHash
                        );

                    $tokenNotExpired =
                        $storedExpiresAt !== false &&
                        $storedExpiresAt >
                            time();

                    if (
                        $ownerMatches &&
                        $tokenMatches &&
                        $tokenNotExpired
                    ) {
                        $trustedDeviceId =
                            (int) $trustedDevice[
                                "trusted_device_id"
                            ];

                        $updateTrustedStmt =
                            $conn->prepare("
                                UPDATE
                                    tbl_owner_trusted_devices
                                SET
                                    last_used_at = NOW()
                                WHERE
                                    trusted_device_id = ?
                                LIMIT 1
                            ");

                        if (
                            $updateTrustedStmt
                        ) {
                            $updateTrustedStmt
                                ->bind_param(
                                    "i",
                                    $trustedDeviceId
                                );

                            if (
                                !$updateTrustedStmt
                                    ->execute()
                            ) {
                                error_log(
                                    "owner_login.php trusted update error: " .
                                    $updateTrustedStmt
                                        ->error
                                );
                            }

                            $updateTrustedStmt
                                ->close();
                        }

                        unset(
                            $_SESSION[
                                "pending_owner_login"
                            ]
                        );

                        session_regenerate_id(
                            true
                        );

                        $_SESSION["user_id"] =
                            $userId;

                        $_SESSION["role"] =
                            "owner";

                        $_SESSION[
                            "restaurant_id"
                        ] =
                            $restaurantId;

                        $_SESSION["full_name"] =
                            (string) $user[
                                "full_name"
                            ];

                        $_SESSION["logged_in"] =
                            true;

                        $_SESSION[
                            "authenticated_at"
                        ] =
                            time();

                        $_SESSION[
                            "owner_email_verified_at"
                        ] =
                            time();

                        $_SESSION[
                            "owner_trusted_device"
                        ] =
                            true;

                        $trustedStmt->close();

                        session_write_close();

                        respond_json(
                            [
                                "success" =>
                                    true,

                                "verification_required" =>
                                    false,

                                "trusted_device" =>
                                    true,

                                "message" =>
                                    "Trusted device recognized. Redirecting to your owner account.",

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
                                        (string) $user[
                                            "full_name"
                                        ],

                                    "email" =>
                                        (string) $user[
                                            "email"
                                        ]
                                ]
                            ]
                        );
                    }
                }
            }

            $trustedStmt->close();
        }
    }

    /*
    The cookie is malformed, invalid, expired, or belongs
    to another owner. Remove it and continue with OTP.
    */

    if ($selectorIsValid) {
        $deleteInvalidStmt =
            $conn->prepare("
                DELETE FROM
                    tbl_owner_trusted_devices
                WHERE
                    selector = ?
                LIMIT 1
            ");

        if ($deleteInvalidStmt) {
            $deleteInvalidStmt
                ->bind_param(
                    "s",
                    $trustedSelector
                );

            if (
                !$deleteInvalidStmt
                    ->execute()
            ) {
                error_log(
                    "owner_login.php invalid trusted-device deletion error: " .
                    $deleteInvalidStmt
                        ->error
                );
            }

            $deleteInvalidStmt
                ->close();
        }
    }

    clear_owner_trusted_cookie();
}

/* =========================================================
   GENERATE OWNER LOGIN VERIFICATION CODE
   ========================================================= */

$verificationCode = "";

try {
    $verificationCode =
        (string) random_int(
            100000,
            999999
        );
} catch (Throwable $error) {
    error_log(
        "owner_login.php verification-code generation error: " .
        $error->getMessage()
    );

    respond_json(
        [
            "success" => false,
            "message" =>
                "Unable to prepare owner verification."
        ],
        500
    );
}

$verificationCodeHash =
    password_hash(
        $verificationCode,
        PASSWORD_DEFAULT
    );

if ($verificationCodeHash === false) {
    error_log(
        "owner_login.php failed to hash login code."
    );

    respond_json(
        [
            "success" => false,
            "message" =>
                "Unable to prepare owner verification."
        ],
        500
    );
}

/* =========================================================
   CREATE PENDING OWNER LOGIN
   ========================================================= */

session_regenerate_id(
    true
);

unset(
    $_SESSION["user_id"],
    $_SESSION["role"],
    $_SESSION["restaurant_id"],
    $_SESSION["full_name"],
    $_SESSION["logged_in"],
    $_SESSION["authenticated_at"],
    $_SESSION["owner_email_verified_at"],
    $_SESSION["owner_trusted_device"]
);

$_SESSION["pending_owner_login"] = [
    "user_id" =>
        $userId,

    "restaurant_id" =>
        $restaurantId,

    "full_name" =>
        (string) $user[
            "full_name"
        ],

    "email" =>
        (string) $user[
            "email"
        ],

    "code_hash" =>
        $verificationCodeHash,

    "expires_at" =>
        time() + 300,

    "attempts" =>
        0,

    "last_sent_at" =>
        time(),

    "redirect_url" =>
        $redirectUrl,

    "onboarding_required" =>
        $onboardingRequired,

    "application_status" =>
        $applicationStatus
];

/* =========================================================
   SEND VERIFICATION EMAIL
   ========================================================= */

$safeOwnerName =
    htmlspecialchars(
        (string) $user[
            "full_name"
        ],
        ENT_QUOTES,
        "UTF-8"
    );

$safeCode =
    htmlspecialchars(
        $verificationCode,
        ENT_QUOTES,
        "UTF-8"
    );

$emailSubject =
    "Your FoodConnect Owner Login Code";

$emailBody = "
<!DOCTYPE html>
<html lang=\"en\">
<head>
    <meta charset=\"UTF-8\">
    <meta
        name=\"viewport\"
        content=\"width=device-width, initial-scale=1.0\"
    >
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
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
        \"
    >
        <h2
            style=\"
                margin-top: 0;
                margin-bottom: 12px;
            \"
        >
            FoodConnect Owner Login
        </h2>

        <p>
            Hello {$safeOwnerName},
        </p>

        <p>
            Use the verification code below to complete your
            restaurant owner login:
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
            This code expires in <strong>5 minutes</strong>
            and can only be used once.
        </p>

        <p
            style=\"
                color: #6b7280;
                font-size: 14px;
            \"
        >
            If you did not attempt to log in, do not share this
            code with anyone. You may safely ignore this email.
        </p>
    </div>
</body>
</html>
";

$emailSent =
    sendBrevoSMTP(
        (string) $user["email"],
        $emailSubject,
        $emailBody
    );

if (!$emailSent) {
    unset(
        $_SESSION["pending_owner_login"]
    );

    session_write_close();

    respond_json(
        [
            "success" => false,
            "message" =>
                "Your password was correct, but FoodConnect could not send the verification email. Please try again."
        ],
        500
    );
}

session_write_close();

/* =========================================================
   RESPONSE
   ========================================================= */

respond_json(
    [
        "success" => true,

        "verification_required" =>
            true,

        "message" =>
            "A 6-digit verification code was sent to your registered email address.",

        "masked_email" =>
            mask_email_address(
                (string) $user[
                    "email"
                ]
            ),

        "expires_in" =>
            300
    ]
);