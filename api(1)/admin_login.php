<?php

header("Content-Type: application/json; charset=utf-8");
header("Cache-Control: no-store, no-cache, must-revalidate");
header("Pragma: no-cache");

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

function get_client_ip(): string
{
    return substr(
        (string) (
            $_SERVER["REMOTE_ADDR"]
            ?? "unknown"
        ),
        0,
        45
    );
}

function count_failed_attempts(
    mysqli $conn,
    string $identifierHash,
    string $ipAddress
): int {
    $stmt = $conn->prepare("
        SELECT COUNT(*) AS failed_count
        FROM tbl_admin_login_attempts
        WHERE identifier_hash = ?
          AND ip_address = ?
          AND attempt_type = 'credentials'
          AND was_successful = 0
          AND attempted_at >=
              DATE_SUB(NOW(), INTERVAL 15 MINUTE)
    ");

    if (!$stmt) {
        throw new RuntimeException(
            "Unable to check login attempts."
        );
    }

    $stmt->bind_param(
        "ss",
        $identifierHash,
        $ipAddress
    );

    $stmt->execute();

    $row =
        $stmt
            ->get_result()
            ->fetch_assoc();

    $stmt->close();

    return (int) (
        $row["failed_count"]
        ?? 0
    );
}

function record_attempt(
    mysqli $conn,
    string $identifierHash,
    string $ipAddress,
    bool $successful
): void {
    $successfulValue =
        $successful ? 1 : 0;

    $stmt = $conn->prepare("
        INSERT INTO tbl_admin_login_attempts (
            identifier_hash,
            ip_address,
            attempt_type,
            was_successful
        )
        VALUES (
            ?,
            ?,
            'credentials',
            ?
        )
    ");

    if (!$stmt) {
        return;
    }

    $stmt->bind_param(
        "ssi",
        $identifierHash,
        $ipAddress,
        $successfulValue
    );

    $stmt->execute();
    $stmt->close();
}

/* =========================================================
   POST REQUEST ONLY
   ========================================================= */

if (
    strtoupper(
        (string) (
            $_SERVER["REQUEST_METHOD"]
            ?? ""
        )
    ) !== "POST"
) {
    header("Allow: POST");

    respond_json([
        "success" => false,
        "message" => "This action is not available."
    ], 405);
}

/* =========================================================
   REQUIRE ADMIN ACCESS CODE
   ========================================================= */

$adminAccessVerified =
    !empty(
        $_SESSION[
            "admin_access_verified"
        ]
    );

$adminAccessVerifiedAt =
    (int) (
        $_SESSION[
            "admin_access_verified_at"
        ]
        ?? 0
    );

$adminAccessExpired =
    $adminAccessVerifiedAt <= 0 ||
    (
        time() -
        $adminAccessVerifiedAt
    ) > 600;

if (
    !$adminAccessVerified ||
    $adminAccessExpired
) {
    unset(
        $_SESSION[
            "admin_access_verified"
        ],
        $_SESSION[
            "admin_access_verified_at"
        ]
    );

    respond_json([
        "success" => false,
        "message" =>
            "Administrator access-code verification is required."
    ], 403);
}

/* =========================================================
   READ REQUEST
   ========================================================= */

$input = json_decode(
    file_get_contents("php://input"),
    true
);

if (!is_array($input)) {
    respond_json([
        "success" => false,
        "message" => "Invalid request data."
    ], 400);
}

$email = strtolower(
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

if ($email === "" || $password === "") {
    respond_json([
        "success" => false,
        "message" =>
            "Enter your administrator email and password."
    ], 400);
}

if (
    !filter_var(
        $email,
        FILTER_VALIDATE_EMAIL
    )
) {
    respond_json([
        "success" => false,
        "message" =>
            "Invalid email or password."
    ], 401);
}

/* =========================================================
   RATE LIMIT
   ========================================================= */

$ipAddress =
    get_client_ip();

$identifierHash =
    hash(
        "sha256",
        "admin-login:" . $email
    );

$failedAttempts = 0;

try {
    $failedAttempts =
        count_failed_attempts(
            $conn,
            $identifierHash,
            $ipAddress
        );
} catch (Throwable $error) {
    error_log(
        "admin_login.php attempt check error: " .
        $error->getMessage()
    );

    respond_json([
        "success" => false,
        "message" =>
            "Unable to process administrator login."
    ], 500);
}

if ($failedAttempts >= 5) {
    respond_json([
        "success" => false,
        "message" =>
            "Too many failed login attempts. Try again after 15 minutes."
    ], 429);
}

/* =========================================================
   FIND DATABASE ACCOUNT
   ========================================================= */

$stmt = $conn->prepare("
    SELECT
        user_id,
        restaurant_id,
        role,
        full_name,
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
        "admin_login.php prepare error: " .
        $conn->error
    );

    respond_json([
        "success" => false,
        "message" =>
            "Unable to process administrator login."
    ], 500);
}

$stmt->bind_param(
    "s",
    $email
);

if (!$stmt->execute()) {
    error_log(
        "admin_login.php execute error: " .
        $stmt->error
    );

    $stmt->close();

    respond_json([
        "success" => false,
        "message" =>
            "Unable to process administrator login."
    ], 500);
}

$user =
    $stmt
        ->get_result()
        ->fetch_assoc();

$stmt->close();

/* =========================================================
   VERIFY CREDENTIALS
   ========================================================= */

if (
    !$user ||
    !password_verify(
        $password,
        (string) (
            $user["password_hash"]
            ?? ""
        )
    )
) {
    record_attempt(
        $conn,
        $identifierHash,
        $ipAddress,
        false
    );

    respond_json([
        "success" => false,
        "message" =>
            "Invalid email or password."
    ], 401);
}

$role = strtolower(
    trim(
        (string) $user["role"]
    )
);

if (
    $role !== "admin" ||
    (int) $user["status"] !== 1 ||
    (int) $user["is_verified"] !== 1
) {
    record_attempt(
        $conn,
        $identifierHash,
        $ipAddress,
        false
    );

    respond_json([
        "success" => false,
        "message" =>
            "Invalid email or password."
    ], 403);
}

record_attempt(
    $conn,
    $identifierHash,
    $ipAddress,
    true
);

/* =========================================================
   CREATE ADMIN SESSION
   ========================================================= */

session_regenerate_id(true);

$_SESSION["user_id"] =
    (int) $user["user_id"];

$_SESSION["role"] =
    "admin";

$_SESSION["restaurant_id"] =
    null;

$_SESSION["full_name"] =
    (string) $user["full_name"];

$_SESSION["admin_authenticated_at"] =
    time();

/*
The access code is consumed after a successful login.
*/

unset(
    $_SESSION[
        "admin_access_verified"
    ],
    $_SESSION[
        "admin_access_verified_at"
    ]
);

respond_json([
    "success" => true,
    "message" =>
        "Administrator login successful.",

    "redirect_url" =>
        "/FoodConnect/frontend/html/admin.html",

    "user" => [
        "user_id" =>
            (int) $user["user_id"],

        "restaurant_id" =>
            null,

        "role" =>
            "admin",

        "full_name" =>
            $user["full_name"],

        "email" =>
            $user["email"]
    ]
]);