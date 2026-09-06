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

    $sessionCookieName =
        session_name();

    /*
     * Clear the current FoodConnect session cookie using the
     * configured path.
     */
    setcookie(
        $sessionCookieName,
        "",
        [
            "expires" => time() - 3600,
            "path" =>
                $params["path"] ??
                "/",
            "domain" =>
                $params["domain"] ?? "",
            "secure" =>
                $params["secure"] ?? false,
            "httponly" =>
                $params["httponly"] ?? true,
            "samesite" =>
                $params["samesite"] ?? "Lax"
        ]
    );

    /*
     * Older/local FoodConnect sessions may have been created
     * with path "/". Clearing both paths prevents an old session
     * cookie from making the homepage think the owner is still
     * logged in after Logout.
     */
    setcookie(
        $sessionCookieName,
        "",
        [
            "expires" => time() - 3600,
            "path" => "/",
            "domain" =>
                $params["domain"] ?? "",
            "secure" =>
                $params["secure"] ?? false,
            "httponly" =>
                $params["httponly"] ?? true,
            "samesite" =>
                $params["samesite"] ?? "Lax"
        ]
    );
}

session_destroy();

setcookie(
    "remember_me",
    "",
    [
        "expires" => time() - 3600,
        "path" => "/",
        "domain" => "",
        "secure" => false,
        "httponly" => true,
        "samesite" => "Lax"
    ]
);

/*
 * IMPORTANT:
 * Do NOT clear FOODCONNECT_OWNER_TRUST here.
 *
 * Logout ends the active session, but "Trust this device for
 * 30 days" remains valid. On the next intentional owner login,
 * email + password are still required; a valid trusted device
 * may then skip the emailed verification code.
 */

header(
    "Location: /"
);

exit;