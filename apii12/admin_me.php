<?php

header("Content-Type: application/json; charset=utf-8");
header("Cache-Control: no-store");

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
require_once __DIR__ . "/name_helper.php";

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

if (empty($_SESSION["user_id"])) {
    respond_json([
        "logged_in" => false
    ], 401);
}

$userId =
    (int) $_SESSION["user_id"];

$stmt = $conn->prepare("
    SELECT
        user_id,
        role,
        first_name,
        middle_name,
        last_name,
        email,
        status,
        is_verified
    FROM tbl_users
    WHERE user_id = ?
    LIMIT 1
");

if (!$stmt) {
    respond_json([
        "logged_in" => false,
        "message" => "Unable to verify administrator session."
    ], 500);
}

$stmt->bind_param("i", $userId);

$stmt->execute();

$user =
    $stmt
        ->get_result()
        ->fetch_assoc();

$stmt->close();

if (
    !$user ||
    strtolower((string) $user["role"]) !== "admin" ||
    (int) $user["status"] !== 1 ||
    (int) $user["is_verified"] !== 1
) {
    $_SESSION = [];

    session_destroy();

    respond_json([
        "logged_in" => false
    ], 401);
}

$displayName = formatUserName($user);

$_SESSION["role"] = "admin";
$_SESSION["restaurant_id"] = null;
$_SESSION["display_name"] = $displayName;

respond_json([
    "logged_in" => true,

    "user" => [
        "user_id" =>
            (int) $user["user_id"],

        "role" =>
            "admin",

        "restaurant_id" =>
            null,

        "first_name" =>
            (string)($user["first_name"] ?? ""),

        "middle_name" =>
            (string)($user["middle_name"] ?? ""),

        "last_name" =>
            (string)($user["last_name"] ?? ""),

        "display_name" =>
            $displayName,

        "email" =>
            $user["email"]
    ]
]);