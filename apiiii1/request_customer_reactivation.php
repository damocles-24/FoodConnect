<?php
header("Content-Type: application/json; charset=utf-8");

error_reporting(E_ALL & ~E_NOTICE & ~E_WARNING);
ini_set("display_errors", "0");

require_once __DIR__ . "/session_config.php";
require_once __DIR__ . "/db.php";
require_once __DIR__ . "/rate_limit.php";
require_once __DIR__ . "/mailer.php";

function respond_json(array $data, int $statusCode = 200): void
{
    http_response_code($statusCode);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

$input = json_decode(file_get_contents("php://input"), true);

if (!is_array($input)) {
    respond_json(["error" => "Invalid request data."], 400);
}

$email = strtolower(trim((string) ($input["email"] ?? "")));
$password = (string) ($input["password"] ?? "");

if (!filter_var($email, FILTER_VALIDATE_EMAIL) || $password === "") {
    respond_json(
        ["error" => "Enter your email and password again."],
        400
    );
}

rate_limit_enforce(
    $conn,
    "customer-reactivation-request",
    rate_limit_identifier(rate_limit_client_ip(), $email),
    3,
    900,
    900,
    "Too many reactivation requests. Please wait 15 minutes and try again."
);

$stmt = $conn->prepare("
    SELECT
        user_id,
        role,
        COALESCE(NULLIF(TRIM(CONCAT_WS(' ', NULLIF(TRIM(first_name), ''), NULLIF(TRIM(middle_name), ''), NULLIF(TRIM(last_name), ''))), ''), NULLIF(TRIM(full_name), ''), '') AS full_name,
        email,
        password_hash,
        status,
        is_verified
    FROM tbl_users
    WHERE email = ?
    LIMIT 1
");

if (!$stmt) {
    respond_json(
        ["error" => "Unable to start account reactivation."],
        500
    );
}

$stmt->bind_param("s", $email);
$stmt->execute();

$user = $stmt->get_result()->fetch_assoc();
$stmt->close();

if (
    !$user ||
    strtolower(trim((string) $user["role"])) !== "customer" ||
    !password_verify($password, $user["password_hash"])
) {
    respond_json(
        ["error" => "Invalid email or password."],
        401
    );
}

if ((int) $user["status"] === 1) {
    respond_json(
        ["error" => "This customer account is already active."],
        409
    );
}

if ((int) $user["is_verified"] !== 1) {
    respond_json(
        ["error" => "Verify your email address first."],
        403
    );
}

try {
    $code = (string) random_int(100000, 999999);
} catch (Throwable $error) {
    error_log("Reactivation code generation failed: " . $error->getMessage());

    respond_json(
        ["error" => "Unable to create a verification code."],
        500
    );
}

$_SESSION["customer_reactivation"] = [
    "user_id" => (int) $user["user_id"],
    "email" => (string) $user["email"],
    "code_hash" => password_hash($code, PASSWORD_DEFAULT),
    "expires_at" => time() + 600,
    "attempts" => 0,
    "last_sent_at" => time()
];

$escapedName = htmlspecialchars(
    (string) $user["full_name"],
    ENT_QUOTES,
    "UTF-8"
);

$escapedCode = htmlspecialchars(
    $code,
    ENT_QUOTES,
    "UTF-8"
);

$subject = "FoodConnect Account Reactivation Code";

$htmlBody = "
    <div style='font-family:Arial,sans-serif;color:#1f2937;line-height:1.6'>
        <h2 style='color:#f78021;margin-bottom:8px'>
            Reactivate your FoodConnect account
        </h2>

        <p>Hello {$escapedName},</p>

        <p>
            Use the verification code below to reactivate your customer account.
        </p>

        <div style='font-size:30px;font-weight:700;letter-spacing:8px;
                    padding:14px 18px;background:#fff4eb;border-radius:10px;
                    display:inline-block;color:#d85d0a'>
            {$escapedCode}
        </div>

        <p style='margin-top:16px'>
            This code expires in 10 minutes.
        </p>

        <p>
            If you did not request account reactivation, you can ignore this email.
        </p>
    </div>
";

if (!sendBrevoSMTP((string) $user["email"], $subject, $htmlBody)) {
    unset($_SESSION["customer_reactivation"]);

    respond_json(
        ["error" => "Unable to send the verification code. Please try again."],
        500
    );
}

respond_json([
    "success" => true,
    "message" => "A 6-digit verification code was sent to your email."
]);
