<?php
header("Content-Type: application/json; charset=utf-8");

error_reporting(E_ALL & ~E_NOTICE & ~E_WARNING);
ini_set("display_errors", "0");

require_once __DIR__ . "/session_config.php";
require_once __DIR__ . "/db.php";

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

$code = preg_replace(
    '/\D+/',
    '',
    (string) ($input["code"] ?? "")
);

$pending = $_SESSION["customer_reactivation"] ?? null;

if (!is_array($pending)) {
    respond_json(
        ["error" => "Start account reactivation again."],
        400
    );
}

if ((int) ($pending["expires_at"] ?? 0) < time()) {
    unset($_SESSION["customer_reactivation"]);

    respond_json(
        ["error" => "The verification code expired. Request a new code."],
        410
    );
}

$attempts = (int) ($pending["attempts"] ?? 0);

if ($attempts >= 5) {
    unset($_SESSION["customer_reactivation"]);

    respond_json(
        ["error" => "Too many incorrect attempts. Request a new code."],
        429
    );
}

if (!preg_match('/^\d{6}$/', $code)) {
    respond_json(
        ["error" => "Enter the 6-digit verification code."],
        400
    );
}

if (!password_verify($code, (string) ($pending["code_hash"] ?? ""))) {
    $_SESSION["customer_reactivation"]["attempts"] = $attempts + 1;

    respond_json(
        ["error" => "Incorrect verification code."],
        403
    );
}

$userId = (int) ($pending["user_id"] ?? 0);

if ($userId <= 0) {
    unset($_SESSION["customer_reactivation"]);

    respond_json(
        ["error" => "Invalid reactivation request."],
        400
    );
}

$stmt = $conn->prepare("
    UPDATE tbl_users
    SET
        status = 1,
        remember_token_hash = NULL,
        remember_token_expires = NULL
    WHERE user_id = ?
      AND role = 'customer'
      AND status = 0
    LIMIT 1
");

if (!$stmt) {
    respond_json(
        ["error" => "Unable to reactivate your account."],
        500
    );
}

$stmt->bind_param("i", $userId);
$stmt->execute();

$affectedRows = $stmt->affected_rows;
$stmt->close();

if ($affectedRows !== 1) {
    $check = $conn->prepare("
        SELECT status
        FROM tbl_users
        WHERE user_id = ?
          AND role = 'customer'
        LIMIT 1
    ");

    if (!$check) {
        respond_json(
            ["error" => "Unable to confirm account status."],
            500
        );
    }

    $check->bind_param("i", $userId);
    $check->execute();

    $row = $check->get_result()->fetch_assoc();
    $check->close();

    if (!$row || (int) $row["status"] !== 1) {
        respond_json(
            ["error" => "Unable to reactivate your account."],
            500
        );
    }
}

unset($_SESSION["customer_reactivation"]);

respond_json([
    "success" => true,
    "message" => "Your FoodConnect account is active again."
]);
