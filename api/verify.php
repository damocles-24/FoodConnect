<?php
require_once __DIR__ . "/session_config.php";
require_once __DIR__ . "/db.php";
require_once __DIR__ . "/name_helper.php";
require_once __DIR__ . "/url_helper.php";

/*
 * Verification links must never be cached. This also prevents a browser from
 * reusing an older redirect/page after a deployment.
 */
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Pragma: no-cache");
header("Expires: 0");

$token = trim(
    (string) ($_GET["token"] ?? "")
);

/*
 * Build canonical URLs through url_helper.php. On foodconnect.store this
 * resolves from the domain root (no legacy /FoodConnect prefix). The version
 * parameter is unique per request so verified.html cannot be served from an
 * old cached copy after deployment.
 */
$verificationPageVersion = (string) time();

$customerSuccessUrl = foodconnect_url(
    "frontend/html/verified.html",
    [
        "status" => "ok",
        "v" => $verificationPageVersion,
    ]
);

$ownerSuccessUrl = foodconnect_url(
    "frontend/html/create_restaurant.html"
);

$expiredUrl = foodconnect_url(
    "frontend/html/verified.html",
    [
        "status" => "expired",
        "v" => $verificationPageVersion,
    ]
);

$ownerExpiredUrl = foodconnect_url(
    "frontend/html/partner_apply.html",
    [
        "verification" => "expired",
        "v" => $verificationPageVersion,
    ]
);

$badUrl = foodconnect_url(
    "frontend/html/verified.html",
    [
        "status" => "bad",
        "v" => $verificationPageVersion,
    ]
);

function redirect_to(string $url): void
{
    header(
        "Location: " . $url,
        true,
        302
    );

    exit;
}

if ($token === "") {
    redirect_to($badUrl);
}

/* =========================================================
   FIND VERIFICATION TOKEN
   ========================================================= */

$stmt = $conn->prepare("
    SELECT
        user_id,
        restaurant_id,
        role,
        first_name,
        middle_name,
        last_name,
        status,
        verification_expires_at
    FROM tbl_users
    WHERE verification_token = ?
    LIMIT 1
");

if (!$stmt) {
    redirect_to($badUrl);
}

$stmt->bind_param(
    "s",
    $token
);

if (!$stmt->execute()) {
    $stmt->close();
    redirect_to($badUrl);
}

$user =
    $stmt
        ->get_result()
        ->fetch_assoc();

$stmt->close();

if (!$user) {
    redirect_to($badUrl);
}

/* =========================================================
   CHECK TOKEN EXPIRATION
   ========================================================= */

$expiresAt =
    $user["verification_expires_at"] ?? null;

$userId =
    (int) $user["user_id"];

$role =
    strtolower(
        trim(
            (string) $user["role"]
        )
    );

if (
    !empty($expiresAt) &&
    strtotime($expiresAt) < time()
) {
    redirect_to(
        $role === "owner"
            ? $ownerExpiredUrl
            : $expiredUrl
    );
}

try {
    $conn->begin_transaction();

    /* =====================================================
       VERIFY AND ACTIVATE ACCOUNT
       ===================================================== */

    $updateUser = $conn->prepare("
        UPDATE tbl_users
        SET
            is_verified = 1,
            status = 1,
            verification_token = NULL,
            verification_expires_at = NULL
        WHERE user_id = ?
        LIMIT 1
    ");

    if (!$updateUser) {
        throw new RuntimeException(
            "Unable to prepare account verification."
        );
    }

    $updateUser->bind_param(
        "i",
        $userId
    );

    if (!$updateUser->execute()) {
        throw new RuntimeException(
            "Unable to verify the account."
        );
    }

    $updateUser->close();

    /* =====================================================
       MOVE OWNER APPLICATION TO DRAFT
       ===================================================== */

    if ($role === "owner") {
        $updateApplication = $conn->prepare("
            UPDATE tbl_partner_applications
            SET
                application_status = 'draft',
                rejection_reason = NULL
            WHERE owner_id = ?
              AND application_status = 'email_pending'
            LIMIT 1
        ");

        if (!$updateApplication) {
            throw new RuntimeException(
                "Unable to prepare partner application."
            );
        }

        $updateApplication->bind_param(
            "i",
            $userId
        );

        if (!$updateApplication->execute()) {
            throw new RuntimeException(
                "Unable to update partner application."
            );
        }

        $updateApplication->close();

        /*
         * If the owner verified using an older still-valid link before the
         * administrator handled a resend request, close only those active
         * resend requests. Sent/rejected rows remain as an audit trail.
         */
        $closeResendRequests = $conn->prepare("
            UPDATE tbl_partner_verification_resend_requests
            SET
                request_status = 'cancelled',
                reviewed_at = COALESCE(reviewed_at, NOW()),
                rejection_reason = COALESCE(
                    rejection_reason,
                    'Email verified before a resend was needed.'
                )
            WHERE owner_id = ?
              AND request_status IN ('pending', 'processing', 'send_failed')
        ");

        if ($closeResendRequests) {
            $closeResendRequests->bind_param(
                "i",
                $userId
            );

            $closeResendRequests->execute();
            $closeResendRequests->close();
        }
    }

    $conn->commit();
} catch (Throwable $error) {
    $conn->rollback();

    error_log(
        "verify.php error: " .
        $error->getMessage()
    );

    redirect_to($badUrl);
}

/* =========================================================
   AUTOMATIC LOGIN AFTER VERIFICATION
   ========================================================= */

session_regenerate_id(true);

$_SESSION["user_id"] =
    $userId;

$_SESSION["role"] =
    $role;

$_SESSION["restaurant_id"] =
    !empty($user["restaurant_id"])
        ? (int) $user["restaurant_id"]
        : null;

$_SESSION["display_name"] =
    formatUserName($user);

/*
 * Make sure the session is written before the browser is redirected to the
 * frontend. This removes a race where the next page can load before the
 * verified login session is persisted on some hosting setups.
 */
session_write_close();

/* =========================================================
   REDIRECT BASED ON ROLE
   ========================================================= */

if ($role === "owner") {
    redirect_to($ownerSuccessUrl);
}

redirect_to($customerSuccessUrl);
