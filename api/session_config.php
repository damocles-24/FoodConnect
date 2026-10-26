<?php

date_default_timezone_set(
    "Asia/Manila"
);

if (session_status() !== PHP_SESSION_ACTIVE) {
    ini_set(
        "session.use_strict_mode",
        "1"
    );

    ini_set(
        "session.use_only_cookies",
        "1"
    );

    ini_set(
        "session.use_trans_sid",
        "0"
    );

    ini_set(
        "session.cookie_samesite",
        "Lax"
    );

    session_name(
        "FOODCONNECT_SESSION"
    );

    /*
    Compatible with older PHP/XAMPP versions:
    lifetime, path, domain, secure, httponly
    */
    $isHttps =
        (!empty($_SERVER["HTTPS"]) && strtolower((string)$_SERVER["HTTPS"]) !== "off") ||
        ((string)($_SERVER["SERVER_PORT"] ?? "") === "443");

    session_set_cookie_params(
        0,
        "/",
        "",
        $isHttps,
        true
    );

    session_start();
}

/*
 * Active-account guard.
 *
 * A login session (or remembered login) must stop working as soon as the
 * account is deactivated, deleted, or - for cashier / delivery staff - while
 * their restaurant's owner account is inactive (restaurant suspended).
 * Staff account statuses are NOT changed by a suspension; they are only
 * blocked while it lasts and work again after the owner is reactivated.
 *
 * The session is simply emptied, so every protected endpoint answers with its
 * normal "please log in" response while public endpoints keep working.
 * Runs at file scope on purpose so the shared $conn from db.php is reused.
 */
if (!empty($_SESSION["user_id"]) && !defined("FOODCONNECT_SKIP_ACCOUNT_GUARD")) {
    try {
        require_once __DIR__ . "/db.php";

        if (isset($conn) && $conn instanceof mysqli) {
            $fcGuardUserId = (int)$_SESSION["user_id"];
            $fcGuardStmt = $conn->prepare("
                SELECT u.status, u.role, o.status AS owner_status
                FROM tbl_users u
                LEFT JOIN tbl_restaurants r ON r.restaurant_id = u.restaurant_id
                LEFT JOIN tbl_users o ON o.user_id = r.owner_id
                WHERE u.user_id = ?
                LIMIT 1
            ");

            if ($fcGuardStmt) {
                $fcGuardStmt->bind_param("i", $fcGuardUserId);

                if ($fcGuardStmt->execute()) {
                    $fcGuardRow = $fcGuardStmt->get_result()->fetch_assoc();

                    /*
                     * A restaurant-partner applicant who has not verified their email
                     * yet legitimately has status 0 and a deliberately restricted
                     * "partner_applicant" session (see partner_register.php /
                     * owner_login.php). That onboarding session must keep working; it
                     * cannot reach normal owner endpoints because its role is not "owner".
                     */
                    $fcGuardOnboarding =
                        !empty($_SESSION["partner_application_only"]) &&
                        strtolower((string)($_SESSION["role"] ?? "")) === "partner_applicant";

                    $fcGuardInactive =
                        !$fcGuardRow ||
                        (!$fcGuardOnboarding && (int)$fcGuardRow["status"] !== 1);

                    if (
                        !$fcGuardInactive &&
                        in_array(strtolower((string)$fcGuardRow["role"]), ["cashier", "delivery_staff", "delivery_coordinator"], true) &&
                        $fcGuardRow["owner_status"] !== null &&
                        (int)$fcGuardRow["owner_status"] !== 1
                    ) {
                        $fcGuardInactive = true;
                    }

                    if ($fcGuardInactive) {
                        $_SESSION = [];
                        $GLOBALS["foodconnect_session_deactivated"] = true;
                    }
                }

                $fcGuardStmt->close();
            }
        }
    } catch (Throwable $fcGuardError) {
        error_log("FoodConnect account guard: " . $fcGuardError->getMessage());
    }

    unset($fcGuardUserId, $fcGuardStmt, $fcGuardRow, $fcGuardInactive, $fcGuardOnboarding, $fcGuardError);
}
