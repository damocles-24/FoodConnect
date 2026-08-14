<?php

header("Content-Type: application/json; charset=utf-8");

error_reporting(E_ALL & ~E_NOTICE & ~E_WARNING);
ini_set("display_errors", "0");

require_once __DIR__ . "/session_config.php";

require_once __DIR__ . "/db.php";

function respond_json(
    array $data,
    int $statusCode = 200
): void {
    http_response_code($statusCode);

    echo json_encode(
        $data,
        JSON_UNESCAPED_UNICODE
    );

    exit;
}

function respond_not_logged_in(): void
{
    respond_json([
        "logged_in" => false
    ]);
}

function clear_authentication(): void
{
    $_SESSION = [];

    if (session_status() === PHP_SESSION_ACTIVE) {
        session_destroy();
    }
}

function get_restaurant_for_owner(
    mysqli $conn,
    int $ownerId
): ?array {
    $stmt = $conn->prepare("
        SELECT
            restaurant_id,
            name,
            address,
            contact_number,
            opening_hours,
            delivery_fee,
            business_status,
            owner_id
        FROM tbl_restaurants
        WHERE owner_id = ?
        ORDER BY restaurant_id ASC
        LIMIT 1
    ");

    if (!$stmt) {
        return null;
    }

    $stmt->bind_param(
        "i",
        $ownerId
    );

    $stmt->execute();

    $restaurant =
        $stmt
            ->get_result()
            ->fetch_assoc();

    $stmt->close();

    return $restaurant ?: null;
}

function get_restaurant_by_id(
    mysqli $conn,
    int $restaurantId
): ?array {
    if ($restaurantId <= 0) {
        return null;
    }

    $stmt = $conn->prepare("
        SELECT
            restaurant_id,
            name,
            address,
            contact_number,
            opening_hours,
            delivery_fee,
            business_status,
            owner_id
        FROM tbl_restaurants
        WHERE restaurant_id = ?
        LIMIT 1
    ");

    if (!$stmt) {
        return null;
    }

    $stmt->bind_param(
        "i",
        $restaurantId
    );

    $stmt->execute();

    $restaurant =
        $stmt
            ->get_result()
            ->fetch_assoc();

    $stmt->close();

    return $restaurant ?: null;
}

function get_owner_application(
    mysqli $conn,
    int $ownerId
): ?array {
    $stmt = $conn->prepare("
        SELECT
            application_id,
            restaurant_name,
            application_status,
            rejection_reason,
            submitted_at,
            reviewed_at
        FROM tbl_partner_applications
        WHERE owner_id = ?
        ORDER BY application_id DESC
        LIMIT 1
    ");

    if (!$stmt) {
        return null;
    }

    $stmt->bind_param(
        "i",
        $ownerId
    );

    $stmt->execute();

    $application =
        $stmt
            ->get_result()
            ->fetch_assoc();

    $stmt->close();

    if (!$application) {
        return null;
    }

    return [
        "application_id" =>
            (int) $application["application_id"],

        "restaurant_name" =>
            $application["restaurant_name"],

        "status" =>
            strtolower(
                trim(
                    (string) $application["application_status"]
                )
            ),

        "rejection_reason" =>
            $application["rejection_reason"],

        "submitted_at" =>
            $application["submitted_at"],

        "reviewed_at" =>
            $application["reviewed_at"]
    ];
}

function sync_owner_restaurant(
    mysqli $conn,
    int $ownerId,
    int $restaurantId
): void {
    $stmt = $conn->prepare("
        UPDATE tbl_users
        SET restaurant_id = ?
        WHERE user_id = ?
        LIMIT 1
    ");

    if (!$stmt) {
        return;
    }

    $stmt->bind_param(
        "ii",
        $restaurantId,
        $ownerId
    );

    $stmt->execute();
    $stmt->close();
}

function format_restaurant(
    ?array $restaurant
): ?array {
    if (!$restaurant) {
        return null;
    }

    return [
        "restaurant_id" =>
            (int) $restaurant["restaurant_id"],

        "name" =>
            $restaurant["name"],

        "address" =>
            $restaurant["address"],

        "contact_number" =>
            $restaurant["contact_number"],

        "opening_hours" =>
            $restaurant["opening_hours"],

        "delivery_fee" =>
            (float) $restaurant["delivery_fee"],

        "business_status" =>
            $restaurant["business_status"],

        "owner_id" =>
            !empty($restaurant["owner_id"])
                ? (int) $restaurant["owner_id"]
                : null
    ];
}

function build_logged_in_response(
    mysqli $conn,
    array $user
): array {
    $userId =
        (int) $user["user_id"];

    $role = strtolower(
        trim(
            (string) $user["role"]
        )
    );

    $restaurantId =
        !empty($user["restaurant_id"])
            ? (int) $user["restaurant_id"]
            : null;

    $restaurant = null;
    $application = null;
    $onboardingRequired = false;
    $ownerRedirectUrl = null;

    if ($role === "owner") {
        $restaurant =
            get_restaurant_for_owner(
                $conn,
                $userId
            );

        if ($restaurant) {
            $restaurantId =
                (int) $restaurant["restaurant_id"];

            sync_owner_restaurant(
                $conn,
                $userId,
                $restaurantId
            );

            $_SESSION["restaurant_id"] =
                $restaurantId;

            $ownerRedirectUrl =
                "/FoodConnect/frontend/html/owner_dashboard.html";
        } else {
            $restaurantId = null;

            $_SESSION["restaurant_id"] =
                null;

            $application =
                get_owner_application(
                    $conn,
                    $userId
                );

            $onboardingRequired = true;

            $ownerRedirectUrl =
                "/FoodConnect/frontend/html/create_restaurant.html";
        }
    } elseif (
        in_array(
            $role,
            [
                "cashier",
                "delivery_staff",
                "staff"
            ],
            true
        ) &&
        $restaurantId !== null
    ) {
        $restaurant =
            get_restaurant_by_id(
                $conn,
                $restaurantId
            );
    }

    return [
        "logged_in" => true,

        "user" => [
            "user_id" =>
                $userId,

            "role" =>
                $role,

            "restaurant_id" =>
                $restaurantId,

            "full_name" =>
                $user["full_name"],

            "email" =>
                $user["email"]
        ],

        "restaurant" =>
            format_restaurant(
                $restaurant
            ),

        "application" =>
            $application,

        "onboarding_required" =>
            $onboardingRequired,

        "owner_redirect_url" =>
            $ownerRedirectUrl
    ];
}

/* =========================================================
   LOAD USER BY SESSION
   ========================================================= */

function load_user_by_id(
    mysqli $conn,
    int $userId
): ?array {
    $stmt = $conn->prepare("
        SELECT
            user_id,
            role,
            restaurant_id,
            full_name,
            email,
            status,
            is_verified
        FROM tbl_users
        WHERE user_id = ?
        LIMIT 1
    ");

    if (!$stmt) {
        return null;
    }

    $stmt->bind_param(
        "i",
        $userId
    );

    $stmt->execute();

    $user =
        $stmt
            ->get_result()
            ->fetch_assoc();

    $stmt->close();

    return $user ?: null;
}

/* =========================================================
   1. EXISTING SESSION
   ========================================================= */

if (!empty($_SESSION["user_id"])) {
    $userId =
        (int) $_SESSION["user_id"];

    $user =
        load_user_by_id(
            $conn,
            $userId
        );

    if (
        !$user ||
        (int) $user["status"] !== 1 ||
        (int) $user["is_verified"] !== 1
    ) {
        clear_authentication();
        respond_not_logged_in();
    }

    $_SESSION["role"] =
        $user["role"];

    $_SESSION["restaurant_id"] =
        !empty($user["restaurant_id"])
            ? (int) $user["restaurant_id"]
            : null;

    $_SESSION["full_name"] =
        $user["full_name"];

    respond_json(
        build_logged_in_response(
            $conn,
            $user
        )
    );
}

/* =========================================================
   2. REMEMBER-ME COOKIE
   ========================================================= */

if (empty($_COOKIE["remember_me"])) {
    respond_not_logged_in();
}

$rememberCookie =
    (string) $_COOKIE["remember_me"];

$parts =
    explode(
        ":",
        $rememberCookie,
        2
    );

if (count($parts) !== 2) {
    respond_not_logged_in();
}

$userId =
    (int) $parts[0];

$rawToken =
    (string) $parts[1];

if ($userId <= 0 || $rawToken === "") {
    respond_not_logged_in();
}

$stmt = $conn->prepare("
    SELECT
        user_id,
        role,
        restaurant_id,
        full_name,
        email,
        status,
        is_verified,
        remember_token_hash,
        remember_token_expires
    FROM tbl_users
    WHERE user_id = ?
    LIMIT 1
");

if (!$stmt) {
    respond_not_logged_in();
}

$stmt->bind_param(
    "i",
    $userId
);

$stmt->execute();

$user =
    $stmt
        ->get_result()
        ->fetch_assoc();

$stmt->close();

if (
    !$user ||
    (int) $user["status"] !== 1 ||
    (int) $user["is_verified"] !== 1
) {
    respond_not_logged_in();
}

if (
    empty($user["remember_token_expires"]) ||
    strtotime($user["remember_token_expires"]) < time()
) {
    respond_not_logged_in();
}

if (
    empty($user["remember_token_hash"]) ||
    !password_verify(
        $rawToken,
        $user["remember_token_hash"]
    )
) {
    respond_not_logged_in();
}

/* =========================================================
   RESTORE SESSION
   ========================================================= */

session_regenerate_id(true);

$_SESSION["user_id"] =
    (int) $user["user_id"];

$_SESSION["role"] =
    $user["role"];

$_SESSION["restaurant_id"] =
    !empty($user["restaurant_id"])
        ? (int) $user["restaurant_id"]
        : null;

$_SESSION["full_name"] =
    $user["full_name"];

respond_json(
    build_logged_in_response(
        $conn,
        $user
    )
);