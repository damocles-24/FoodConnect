<?php

header("Content-Type: application/json; charset=utf-8");

error_reporting(E_ALL & ~E_NOTICE & ~E_WARNING);
ini_set("display_errors", "0");

session_set_cookie_params(
    0,
    "/FoodConnect",
    "",
    false,
    true
);

require_once __DIR__ . "/session_config.php";

require_once __DIR__ . "/db.php";
require_once __DIR__ . "/rate_limit.php";
require_once __DIR__ . "/name_helper.php";

function respond_json(array $data, int $statusCode = 200): void
{
    http_response_code($statusCode);

    echo json_encode(
        $data,
        JSON_UNESCAPED_UNICODE
    );

    exit;
}

$input = json_decode(
    file_get_contents("php://input"),
    true
);

if (!is_array($input)) {
    respond_json(
        [
            "error" => "Invalid request data."
        ],
        400
    );
}

$email = strtolower(
    trim(
        (string) ($input["email"] ?? "")
    )
);

$password =
    (string) ($input["password"] ?? "");

$remember =
    !empty($input["remember"]);

if ($email === "" || $password === "") {
    respond_json(
        [
            "error" => "Please enter email and password."
        ],
        400
    );
}

rate_limit_enforce(
    $conn,
    "customer-login",
    rate_limit_identifier(
        rate_limit_client_ip(),
        $email
    ),
    10,
    900,
    900,
    "Too many login attempts. Please wait 15 minutes and try again."
);

/* =========================================================
   FIND USER
   ========================================================= */

$stmt = $conn->prepare("
    SELECT
        user_id,
        restaurant_id,
        role,
        first_name,
        middle_name,
        last_name,
        email,
        password_hash,
        status,
        is_verified
    FROM tbl_users
    WHERE email = ?
    LIMIT 1
");

if (!$stmt) {
    error_log(
        "login.php prepare error: " .
        $conn->error
    );

    respond_json(
        [
            "error" => "Server error. Please try again."
        ],
        500
    );
}

$stmt->bind_param(
    "s",
    $email
);

$stmt->execute();

$user =
    $stmt
        ->get_result()
        ->fetch_assoc();

$stmt->close();

if (
    !$user ||
    !password_verify(
        $password,
        $user["password_hash"]
    )
) {
    respond_json(
        [
            "error" => "Invalid email or password."
        ],
        401
    );
}

/* =========================================================
   CUSTOMER LOGIN ONLY
   ========================================================= */

$role = strtolower(
    trim(
        (string) $user["role"]
    )
);

if ($role !== "customer") {
    respond_json(
        [
            "error" =>
                "This login page is for customers only. " .
                "Restaurant owners and staff must use the Staff Portal."
        ],
        403
    );
}

if ((int) $user["status"] !== 1) {
    respond_json(
        [
            "error" => "Your account is deactivated.",
            "deactivated" => true,
            "reactivation_available" => true
        ],
        403
    );
}

if ((int) $user["is_verified"] !== 1) {
    respond_json(
        [
            "error" => "Please verify your email first."
        ],
        403
    );
}

/* =========================================================
   CREATE SESSION
   ========================================================= */

session_regenerate_id(true);

$userId =
    (int) $user["user_id"];

$restaurantId =
    !empty($user["restaurant_id"])
        ? (int) $user["restaurant_id"]
        : null;

$_SESSION["user_id"] =
    $userId;

$_SESSION["role"] =
    $role;

$_SESSION["restaurant_id"] =
    $restaurantId;

$displayName = formatUserName($user);

$_SESSION["display_name"] =
    $displayName;

/* =========================================================
   REMEMBER ME
   ========================================================= */

if ($remember) {
    try {
        $rawToken =
            bin2hex(
                random_bytes(32)
            );
    } catch (Throwable $error) {
        error_log(
            "Remember token generation error: " .
            $error->getMessage()
        );

        respond_json(
            [
                "error" => "Unable to create the login session."
            ],
            500
        );
    }

    $tokenHash =
        password_hash(
            $rawToken,
            PASSWORD_DEFAULT
        );

    $expiresTimestamp =
        time() +
        (30 * 24 * 60 * 60);

    $expiresDateTime =
        date(
            "Y-m-d H:i:s",
            $expiresTimestamp
        );

    $updateToken = $conn->prepare("
        UPDATE tbl_users
        SET
            remember_token_hash = ?,
            remember_token_expires = ?
        WHERE user_id = ?
        LIMIT 1
    ");

    if (!$updateToken) {
        error_log(
            "Remember token prepare error: " .
            $conn->error
        );

        respond_json(
            [
                "error" => "Server error. Please try again."
            ],
            500
        );
    }

    $updateToken->bind_param(
        "ssi",
        $tokenHash,
        $expiresDateTime,
        $userId
    );

    if (!$updateToken->execute()) {
        error_log(
            "Remember token execute error: " .
            $updateToken->error
        );

        $updateToken->close();

        respond_json(
            [
                "error" => "Server error. Please try again."
            ],
            500
        );
    }

    $updateToken->close();

    $cookieValue =
        $userId . ":" . $rawToken;

    setcookie(
        "remember_me",
        $cookieValue,
        [
            "expires" => $expiresTimestamp,
            "path" => "/FoodConnect",
            "secure" => false,
            "httponly" => true,
            "samesite" => "Lax"
        ]
    );
} else {
    $clearToken = $conn->prepare("
        UPDATE tbl_users
        SET
            remember_token_hash = NULL,
            remember_token_expires = NULL
        WHERE user_id = ?
        LIMIT 1
    ");

    if ($clearToken) {
        $clearToken->bind_param(
            "i",
            $userId
        );

        $clearToken->execute();
        $clearToken->close();
    }

    setcookie(
        "remember_me",
        "",
        [
            "expires" => time() - 3600,
            "path" => "/FoodConnect",
            "secure" => false,
            "httponly" => true,
            "samesite" => "Lax"
        ]
    );
}

/* =========================================================
   RESPONSE
   ========================================================= */

respond_json([
    "success" => true,
    "message" => "Login successful!",
    "user" => [
        "user_id" => $userId,
        "role" => $role,
        "restaurant_id" => $restaurantId,
        "first_name" => (string)($user["first_name"] ?? ""),
        "middle_name" => (string)($user["middle_name"] ?? ""),
        "last_name" => (string)($user["last_name"] ?? ""),
        "display_name" => $displayName,
        "email" => $user["email"]
    ]
]);