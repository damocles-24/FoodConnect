<?php

header("Content-Type: application/json; charset=utf-8");
header("Cache-Control: no-store, no-cache, must-revalidate");
header("Pragma: no-cache");

error_reporting(E_ALL & ~E_NOTICE & ~E_WARNING);
ini_set("display_errors", "0");

require_once __DIR__ . "/session_config.php";
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

if (
    strtoupper(
        (string) ($_SERVER["REQUEST_METHOD"] ?? "")
    ) !== "POST"
) {
    respond_json([
        "success" => false,
        "message" => "Method not allowed."
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
    (string) ($input["access_code"] ?? "")
);

if ($accessCode === "") {
    respond_json([
        "success" => false,
        "message" => "Enter the partner portal access code."
    ], 400);
}

$storedCode =
    defined("PARTNER_PORTAL_ACCESS_CODE")
        ? trim(
            (string) PARTNER_PORTAL_ACCESS_CODE
        )
        : "";

if ($storedCode === "") {
    error_log(
        "PARTNER_PORTAL_ACCESS_CODE is not configured."
    );

    respond_json([
        "success" => false,
        "message" => "Partner portal access is unavailable."
    ], 500);
}

if (!hash_equals($storedCode, $accessCode)) {
    unset(
        $_SESSION["partner_access_verified"],
        $_SESSION["partner_access_verified_at"]
    );

    respond_json([
        "success" => false,
        "message" => "Invalid partner portal access code."
    ], 403);
}

$_SESSION["partner_access_verified"] = true;
$_SESSION["partner_access_verified_at"] = time();

/*
|--------------------------------------------------------------------------
| Force PHP to save the temporary verification before owner_login.php runs
|--------------------------------------------------------------------------
*/

session_write_close();

respond_json([
    "success" => true,
    "message" => "Partner portal access verified."
]);