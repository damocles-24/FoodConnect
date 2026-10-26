<?php
header("Content-Type: application/json; charset=utf-8");

error_reporting(E_ALL & ~E_NOTICE & ~E_WARNING);
ini_set("display_errors", "0");

require_once __DIR__ . "/session_config.php";
require_once __DIR__ . "/db.php";
require_once __DIR__ . "/account_status_helper.php";

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

/* The reason was captured with the code request and bound to this user_id. A
   request started before reasons became mandatory has none and must restart. */
$reasonCheck = fc_status_validate_reason(
    "customer",
    "reactivate",
    $pending["reason"] ?? "",
    $pending["note"] ?? ""
);

if (!$reasonCheck["ok"]) {
    unset($_SESSION["customer_reactivation"]);

    respond_json(
        ["error" => "Start account reactivation again and select a reason."],
        400
    );
}

/* Status, reason columns and the history row commit together, only now that the
   emailed code has been verified. */
$result = fc_change_account_status(
    $conn,
    $userId,
    1,
    [
        "actor" => [
            "user_id" => $userId,
            "role" => "customer",
            "restaurant_id" => null
        ],
        "reason" => $reasonCheck["reason"],
        "note" => $reasonCheck["note"]
    ]
);

if (!$result["success"]) {
    respond_json(
        ["error" => $result["message"]],
        (int) $result["http"]
    );
}

unset($_SESSION["customer_reactivation"]);

respond_json([
    "success" => true,
    "message" => "Your FoodConnect account is active again."
]);
