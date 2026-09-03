<?php

header("Content-Type: application/json; charset=utf-8");
header("Cache-Control: no-store, no-cache, must-revalidate");
header("Pragma: no-cache");

error_reporting(E_ALL & ~E_NOTICE & ~E_WARNING);
ini_set("display_errors", "0");

session_set_cookie_params(
    0,
    "/",
    "",
    false,
    true
);

require_once __DIR__ . "/session_config.php";

require_once __DIR__ . "/db.php";
require_once __DIR__ . "/config.php";

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
    string $ipAddress,
    string $attemptType
): int {
    $stmt = $conn->prepare("
        SELECT COUNT(*) AS failed_count
        FROM tbl_admin_login_attempts
        WHERE identifier_hash = ?
          AND ip_address = ?
          AND attempt_type = ?
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
        "sss",
        $identifierHash,
        $ipAddress,
        $attemptType
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
    string $attemptType,
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
        VALUES (?, ?, ?, ?)
    ");

    if (!$stmt) {
        return;
    }

    $stmt->bind_param(
        "sssi",
        $identifierHash,
        $ipAddress,
        $attemptType,
        $successfulValue
    );

    $stmt->execute();
    $stmt->close();
}

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

$accessCode = trim(
    (string) (
        $input["access_code"]
        ?? ""
    )
);

if ($accessCode === "") {
    respond_json([
        "success" => false,
        "message" =>
            "Enter the administrator access code."
    ], 400);
}

if (strlen($accessCode) > 100) {
    respond_json([
        "success" => false,
        "message" =>
            "Invalid administrator access code."
    ], 403);
}

$storedCode =
    defined(
        "ADMIN_PORTAL_ACCESS_CODE"
    )
        ? trim(
            (string)
            ADMIN_PORTAL_ACCESS_CODE
        )
        : "";

if ($storedCode === "") {
    error_log(
        "ADMIN_PORTAL_ACCESS_CODE is not configured."
    );

    respond_json([
        "success" => false,
        "message" =>
            "Administrator access is unavailable."
    ], 500);
}

$ipAddress =
    get_client_ip();

$identifierHash =
    hash(
        "sha256",
        "admin-access:" . $ipAddress
    );

$failedAttempts = 0;

try {
    $failedAttempts =
        count_failed_attempts(
            $conn,
            $identifierHash,
            $ipAddress,
            "access_code"
        );
} catch (Throwable $error) {
    error_log(
        "verify_admin_access.php attempt check error: " .
        $error->getMessage()
    );

    respond_json([
        "success" => false,
        "message" =>
            "Unable to verify administrator access."
    ], 500);
}

if ($failedAttempts >= 5) {
    respond_json([
        "success" => false,
        "message" =>
            "Too many failed attempts. Try again after 15 minutes."
    ], 429);
}

if (
    !hash_equals(
        $storedCode,
        $accessCode
    )
) {
    unset(
        $_SESSION["admin_access_verified"],
        $_SESSION["admin_access_verified_at"]
    );

    record_attempt(
        $conn,
        $identifierHash,
        $ipAddress,
        "access_code",
        false
    );

    respond_json([
        "success" => false,
        "message" =>
            "Invalid administrator access code."
    ], 403);
}

record_attempt(
    $conn,
    $identifierHash,
    $ipAddress,
    "access_code",
    true
);

$_SESSION["admin_access_verified"] =
    true;

$_SESSION["admin_access_verified_at"] =
    time();

session_write_close();

respond_json([
    "success" => true,
    "message" =>
        "Administrator access verified."
]);