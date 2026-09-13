<?php
header("Content-Type: application/json; charset=utf-8");
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Pragma: no-cache");

error_reporting(E_ALL & ~E_NOTICE & ~E_WARNING);
ini_set("display_errors", "0");

require_once __DIR__ . "/session_config.php";
require_once __DIR__ . "/db.php";
require_once __DIR__ . "/rate_limit.php";
require_once __DIR__ . "/name_helper.php";

function staff_login_respond(array $payload, int $code = 200): void
{
    http_response_code($code);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function clear_staff_password_change_session(): void
{
    unset(
        $_SESSION["staff_password_change_user_id"],
        $_SESSION["staff_password_change_restaurant_id"],
        $_SESSION["staff_password_change_role"],
        $_SESSION["staff_password_change_display_name"],
        $_SESSION["staff_password_change_password_fingerprint"],
        $_SESSION["staff_password_change_started_at"]
    );
}

if (strtoupper((string)($_SERVER["REQUEST_METHOD"] ?? "")) !== "POST") {
    staff_login_respond([
        "success" => false,
        "message" => "This action is not available."
    ], 405);
}

if (empty($_SESSION["staff_access_verified"])) {
    staff_login_respond([
        "success" => false,
        "message" => "Staff access code required."
    ], 403);
}

$accessRestaurantId = (int)($_SESSION["staff_access_restaurant_id"] ?? 0);
if ($accessRestaurantId <= 0) {
    staff_login_respond([
        "success" => false,
        "message" => "Please verify the restaurant staff access code first."
    ], 403);
}

$input = json_decode(file_get_contents("php://input"), true);
if (!is_array($input)) {
    staff_login_respond([
        "success" => false,
        "message" => "Invalid request data."
    ], 400);
}

$email = strtolower(trim((string)($input["email"] ?? "")));
$password = (string)($input["password"] ?? "");

if ($email === "" || $password === "") {
    staff_login_respond([
        "success" => false,
        "message" => "Please enter email and password."
    ], 400);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    staff_login_respond([
        "success" => false,
        "message" => "Enter a valid staff email address."
    ], 422);
}

rate_limit_enforce(
    $conn,
    "staff-login",
    rate_limit_identifier(rate_limit_client_ip(), $email),
    10,
    900,
    900,
    "Too many staff login attempts. Please wait 15 minutes and try again."
);

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
        must_change_password,
        status,
        is_verified
    FROM tbl_users
    WHERE email = ?
    LIMIT 1
");

if (!$stmt) {
    error_log("staff_login.php prepare error: " . $conn->error);
    staff_login_respond([
        "success" => false,
        "message" => "Unable to sign in right now. Please try again."
    ], 500);
}

$stmt->bind_param("s", $email);
if (!$stmt->execute()) {
    error_log("staff_login.php execute error: " . $stmt->error);
    $stmt->close();
    staff_login_respond([
        "success" => false,
        "message" => "Unable to sign in right now. Please try again."
    ], 500);
}

$user = $stmt->get_result()->fetch_assoc();
$stmt->close();

if (!$user || !password_verify($password, (string)$user["password_hash"])) {
    staff_login_respond([
        "success" => false,
        "message" => "Invalid email or password."
    ], 401);
}

if ((int)$user["status"] !== 1) {
    staff_login_respond([
        "success" => false,
        "message" => "This staff account is disabled. Contact your restaurant owner."
    ], 403);
}

$role = strtolower(trim((string)$user["role"]));
$allowedRoles = ["cashier", "delivery_staff", "delivery_coordinator"];

if (!in_array($role, $allowedRoles, true)) {
    staff_login_respond([
        "success" => false,
        "message" => "Use the correct FoodConnect portal for this account."
    ], 403);
}

if ((int)$user["restaurant_id"] !== $accessRestaurantId) {
    staff_login_respond([
        "success" => false,
        "message" => "This staff account does not belong to the selected restaurant."
    ], 403);
}

$displayName = formatUserName($user);
$mustChangePassword = (int)($user["must_change_password"] ?? 0) === 1;

/*
 * Regenerate the identifier before promoting either a temporary-password
 * session or a normal authenticated staff session.
 */
@session_regenerate_id(true);

/* Never leave a previously authenticated account active during this login. */
unset(
    $_SESSION["user_id"],
    $_SESSION["role"],
    $_SESSION["restaurant_id"],
    $_SESSION["display_name"]
);

clear_staff_password_change_session();

if ($mustChangePassword) {
    /*
     * IMPORTANT: do not create the normal dashboard session yet. This blocks
     * direct navigation to the cashier/delivery dashboard until the temporary
     * password is replaced.
     */
    $_SESSION["staff_password_change_user_id"] = (int)$user["user_id"];
    $_SESSION["staff_password_change_restaurant_id"] = (int)$user["restaurant_id"];
    $_SESSION["staff_password_change_role"] = $role;
    $_SESSION["staff_password_change_display_name"] = $displayName;
    $_SESSION["staff_password_change_password_fingerprint"] =
        hash("sha256", (string)$user["password_hash"]);
    $_SESSION["staff_password_change_started_at"] = time();

    staff_login_respond([
        "success" => true,
        "message" => "Temporary password accepted. Create a new private password to continue.",
        "must_change_password" => true,
        "user" => [
            "user_id" => (int)$user["user_id"],
            "restaurant_id" => (int)$user["restaurant_id"],
            "role" => $role,
            "first_name" => (string)($user["first_name"] ?? ""),
            "middle_name" => (string)($user["middle_name"] ?? ""),
            "last_name" => (string)($user["last_name"] ?? ""),
            "display_name" => $displayName,
            "email" => (string)$user["email"]
        ]
    ]);
}

$_SESSION["user_id"] = (int)$user["user_id"];
$_SESSION["role"] = $role;
$_SESSION["restaurant_id"] = (int)$user["restaurant_id"];
$_SESSION["display_name"] = $displayName;

staff_login_respond([
    "success" => true,
    "message" => "Staff login successful.",
    "must_change_password" => false,
    "user" => [
        "user_id" => (int)$user["user_id"],
        "restaurant_id" => (int)$user["restaurant_id"],
        "role" => $role,
        "first_name" => (string)($user["first_name"] ?? ""),
        "middle_name" => (string)($user["middle_name"] ?? ""),
        "last_name" => (string)($user["last_name"] ?? ""),
        "display_name" => $displayName,
        "email" => (string)$user["email"]
    ]
]);
