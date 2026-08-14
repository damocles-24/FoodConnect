<?php

require_once __DIR__ . "/session_config.php";
require_once __DIR__ . "/db.php";

$userId =
    !empty($_SESSION["user_id"])
        ? (int) $_SESSION["user_id"]
        : 0;

if ($userId > 0) {
    $stmt = $conn->prepare("
        UPDATE tbl_users
        SET
            remember_token_hash = NULL,
            remember_token_expires = NULL
        WHERE user_id = ?
        LIMIT 1
    ");

    if ($stmt) {
        $stmt->bind_param("i", $userId);
        $stmt->execute();
        $stmt->close();
    }
}

$_SESSION = [];

if (ini_get("session.use_cookies")) {
    $params =
        session_get_cookie_params();

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

header(
    "Location: /FoodConnect/frontend/html/index.html"
);

exit;