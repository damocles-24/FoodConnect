<?php

session_set_cookie_params(
    0,
    "/FoodConnect",
    "",
    false,
    true
);

require_once __DIR__ . "/session_config.php";

require_once __DIR__ . "/db.php";
require_once __DIR__ . "/name_helper.php";

$token = trim(
    (string) ($_GET["token"] ?? "")
);

$customerSuccessUrl =
    "/FoodConnect/frontend/html/verified.html?status=ok";

$ownerSuccessUrl =
    "/FoodConnect/frontend/html/create_restaurant.html";

$expiredUrl =
    "/FoodConnect/frontend/html/verified.html?status=expired";

$badUrl =
    "/FoodConnect/frontend/html/verified.html?status=bad";

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

$stmt->execute();

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

if (
    !empty($expiresAt) &&
    strtotime($expiresAt) < time()
) {
    redirect_to($expiredUrl);
}

$userId =
    (int) $user["user_id"];

$role =
    strtolower(
        trim(
            (string) $user["role"]
        )
    );

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

/* =========================================================
   REDIRECT BASED ON ROLE
   ========================================================= */

if ($role === "owner") {
    redirect_to($ownerSuccessUrl);
}

redirect_to($customerSuccessUrl);