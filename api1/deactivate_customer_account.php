<?php
header("Content-Type: application/json; charset=utf-8");
require_once __DIR__ . "/session_config.php";
require_once __DIR__ . "/db.php";

function respond(array $data, int $status = 200): void
{
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function clearCustomerSession(): void
{
    $_SESSION = [];

    if (ini_get("session.use_cookies")) {
        $params = session_get_cookie_params();

        setcookie(
            session_name(),
            "",
            [
                "expires" => time() - 3600,
                "path" => $params["path"] ?? "/FoodConnect",
                "domain" => $params["domain"] ?? "",
                "secure" => $params["secure"] ?? false,
                "httponly" => $params["httponly"] ?? true,
                "samesite" => $params["samesite"] ?? "Lax"
            ]
        );
    }

    session_destroy();

    setcookie(
        "remember_me",
        "",
        [
            "expires" => time() - 3600,
            "path" => "/FoodConnect",
            "domain" => "",
            "secure" => false,
            "httponly" => true,
            "samesite" => "Lax"
        ]
    );
}

$userId = isset($_SESSION["user_id"]) ? (int) $_SESSION["user_id"] : 0;
$role = strtolower(trim((string) ($_SESSION["role"] ?? "")));

if ($userId <= 0 || $role !== "customer") {
    respond(
        ["success" => false, "message" => "Please log in as a customer."],
        401
    );
}

$data = json_decode(file_get_contents("php://input"), true);

if (!is_array($data)) {
    respond(["success" => false, "message" => "Please check the information and try again."], 400);
}

$password = (string) ($data["password"] ?? "");

if ($password === "") {
    respond([
        "success" => false,
        "message" => "Enter your current password to confirm deactivation."
    ], 400);
}

$stmt = $conn->prepare("
    SELECT password_hash
    FROM tbl_users
    WHERE user_id = ?
      AND role = 'customer'
      AND status = 1
    LIMIT 1
");

if (!$stmt) {
    respond(
        ["success" => false, "message" => "Unable to verify your account."],
        500
    );
}

$stmt->bind_param("i", $userId);
$stmt->execute();

$user = $stmt->get_result()->fetch_assoc();
$stmt->close();

if (!$user) {
    respond(
        ["success" => false, "message" => "Customer account was not found."],
        404
    );
}

if (!password_verify($password, $user["password_hash"])) {
    respond([
        "success" => false,
        "message" => "Password is incorrect."
    ], 403);
}

$update = $conn->prepare("
    UPDATE tbl_users
    SET
        status = 0,
        remember_token_hash = NULL,
        remember_token_expires = NULL
    WHERE user_id = ?
      AND role = 'customer'
      AND status = 1
    LIMIT 1
");

if (!$update) {
    respond(
        ["success" => false, "message" => "Unable to deactivate your account."],
        500
    );
}

$update->bind_param("i", $userId);
$update->execute();

if ($update->affected_rows !== 1) {
    $update->close();

    respond(
        ["success" => false, "message" => "Unable to deactivate your account."],
        500
    );
}

$update->close();

clearCustomerSession();

respond([
    "success" => true,
    "message" => "Your account has been deactivated."
]);
