<?php
header("Content-Type: application/json; charset=utf-8");
require_once __DIR__ . "/db.php";
require_once __DIR__ . "/rate_limit.php";
require_once __DIR__ . "/mailer.php";
require_once __DIR__ . "/url_helper.php";

function signup_respond(array $data, int $statusCode = 200): void
{
    http_response_code($statusCode);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

if (strtoupper((string)($_SERVER["REQUEST_METHOD"] ?? "")) !== "POST") {
    signup_respond(["error" => "This action is not available."], 405);
}

$input = json_decode(file_get_contents("php://input"), true);
if (!is_array($input)) {
    signup_respond(["error" => "Invalid request data."], 400);
}

$firstName = trim((string)($input["first_name"] ?? ""));
$middleName = trim((string)($input["middle_name"] ?? ""));
$lastName = trim((string)($input["last_name"] ?? ""));
$email = strtolower(trim((string)($input["email"] ?? "")));
$password = (string)($input["password"] ?? "");
$confirm = (string)($input["confirm"] ?? "");
$role = "customer";

$fullName = trim(implode(" ", array_filter([
    $firstName,
    $middleName,
    $lastName
], static fn($part) => $part !== "")));

if ($firstName === "" || $lastName === "" || $email === "" || $password === "" || $confirm === "") {
    signup_respond(["error" => "Please fill in all required fields."], 400);
}

if (mb_strlen($firstName) < 2 || mb_strlen($lastName) < 2) {
    signup_respond(["error" => "Please enter a valid first name and last name."], 422);
}

if (
    mb_strlen($firstName) > 100 ||
    mb_strlen($middleName) > 100 ||
    mb_strlen($lastName) > 100 ||
    mb_strlen($fullName) > 150
) {
    signup_respond(["error" => "Please enter a shorter name."], 422);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL) || mb_strlen($email) > 150) {
    signup_respond(["error" => "Please enter a valid email address."], 422);
}

rate_limit_enforce(
    $conn,
    "customer-signup",
    rate_limit_identifier(rate_limit_client_ip(), $email),
    5,
    3600,
    1800,
    "Too many signup attempts. Please wait before trying again."
);

if ($password !== $confirm) {
    signup_respond(["error" => "Passwords do not match."], 400);
}

if (
    strlen($password) < 8 ||
    !preg_match('/[A-Za-z]/', $password) ||
    !preg_match('/\d/', $password)
) {
    signup_respond([
        "error" => "Password must contain at least 8 characters, one letter, and one number."
    ], 422);
}

$check = $conn->prepare("SELECT user_id FROM tbl_users WHERE LOWER(email) = ? LIMIT 1");
if (!$check) {
    error_log("signup.php duplicate check prepare error: " . $conn->error);
    signup_respond(["error" => "Unable to create the account right now."], 500);
}

$check->bind_param("s", $email);
if (!$check->execute()) {
    error_log("signup.php duplicate check execute error: " . $check->error);
    $check->close();
    signup_respond(["error" => "Unable to create the account right now."], 500);
}

if ($check->get_result()->fetch_assoc()) {
    $check->close();
    signup_respond(["error" => "Email already exists"], 409);
}
$check->close();

$hash = password_hash($password, PASSWORD_DEFAULT);
if ($hash === false) {
    signup_respond(["error" => "Unable to securely process the password."], 500);
}

$token = bin2hex(random_bytes(16));
$expiresAt = date("Y-m-d H:i:s", time() + (24 * 60 * 60));

$stmt = $conn->prepare("
    INSERT INTO tbl_users (
        restaurant_id,
        role,
        first_name,
        middle_name,
        last_name,
        full_name,
        email,
        password_hash,
        status,
        is_verified,
        verification_token,
        verification_expires_at
    )
    VALUES (NULL, ?, ?, ?, ?, ?, ?, ?, 1, 0, ?, ?)
");

if (!$stmt) {
    error_log("signup.php insert prepare error: " . $conn->error);
    signup_respond(["error" => "Unable to create the account right now."], 500);
}

$stmt->bind_param(
    "sssssssss",
    $role,
    $firstName,
    $middleName,
    $lastName,
    $fullName,
    $email,
    $hash,
    $token,
    $expiresAt
);

if (!$stmt->execute()) {
    $errno = (int)$stmt->errno;
    error_log("signup.php insert execute error: " . $stmt->error);
    $stmt->close();

    if ($errno === 1062) {
        signup_respond(["error" => "Email already exists"], 409);
    }

    signup_respond(["error" => "Unable to create the account right now."], 500);
}
$stmt->close();

try {
    $verifyLink = foodconnect_url("api/verify.php", ["token" => $token]);
} catch (Throwable $error) {
    error_log("signup.php URL generation error: " . $error->getMessage());
    signup_respond([
        "success" => true,
        "email_sent" => false,
        "message" => "Account created. Please use Resend Verification to receive a verification email."
    ], 201);
}

$safeName = htmlspecialchars($fullName, ENT_QUOTES, "UTF-8");
$safeVerifyLink = htmlspecialchars($verifyLink, ENT_QUOTES, "UTF-8");

$htmlBody = "
<!doctype html>
<html>
<body style='margin:0;background:#f6f7fb;font-family:Arial,Helvetica,sans-serif;'>
<table width='100%' cellpadding='0' cellspacing='0' style='padding:24px'>
<tr><td align='center'>
<table width='520' cellpadding='0' cellspacing='0' style='background:#ffffff;border-radius:16px;padding:28px;box-shadow:0 8px 30px rgba(0,0,0,.06)'>
<tr><td align='center' style='padding-bottom:10px'><div style='font-size:22px;font-weight:bold;color:#ff7a00'>FoodConnect</div></td></tr>
<tr><td style='font-size:20px;font-weight:bold;padding-top:8px'>Verify your email</td></tr>
<tr><td style='color:#444;padding-top:12px;line-height:1.6'>Hi {$safeName},<br><br>Thanks for signing up to FoodConnect. Please verify your email to activate your account.</td></tr>
<tr><td align='center' style='padding:28px 0'><a href='{$safeVerifyLink}' style='background:#ff7a00;color:#ffffff;text-decoration:none;padding:14px 22px;border-radius:12px;font-weight:bold;display:inline-block'>Verify Email</a></td></tr>
<tr><td style='color:#666;font-size:13px;line-height:1.6'>If the button doesn’t work, copy and paste this link into your browser:<br><br><span style='word-break:break-all;color:#ff7a00'>{$safeVerifyLink}</span></td></tr>
<tr><td style='padding-top:22px;color:#999;font-size:12px'>If you didn’t create this account, you can safely ignore this email.</td></tr>
</table>
<div style='padding-top:16px;color:#999;font-size:12px'>© " . date("Y") . " FoodConnect</div>
</td></tr></table>
</body>
</html>";

$emailSent = sendBrevoSMTP($email, "Verify your FoodConnect account", $htmlBody);

if (!$emailSent) {
    signup_respond([
        "success" => true,
        "email_sent" => false,
        "message" => "Account created, but the verification email could not be sent. Please use Resend Verification."
    ], 201);
}

signup_respond([
    "success" => true,
    "email_sent" => true,
    "message" => "Account created. Please check your email to verify your account."
], 201);
