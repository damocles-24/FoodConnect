<?php

header(
    "Content-Type: application/json; charset=utf-8"
);

header(
    "Cache-Control: no-store, no-cache, must-revalidate, max-age=0"
);

header("Pragma: no-cache");

error_reporting(
    E_ALL &
    ~E_NOTICE &
    ~E_WARNING
);

ini_set(
    "display_errors",
    "0"
);

session_set_cookie_params(
    0,
    "/FoodConnect",
    "",
    false,
    true
);

require_once __DIR__ .
    "/session_config.php";

require_once __DIR__ .
    "/db.php";

/* =========================================================
   JSON RESPONSE
========================================================= */

function respond_json(
    array $data,
    int $statusCode = 200
): void {
    http_response_code(
        $statusCode
    );

    echo json_encode(
        $data,
        JSON_UNESCAPED_UNICODE
    );

    exit;
}

/* =========================================================
   REQUIRE POST
========================================================= */

$requestMethod = strtoupper(
    (string) (
        $_SERVER["REQUEST_METHOD"]
        ?? ""
    )
);

if ($requestMethod !== "POST") {
    respond_json([
        "success" => false,
        "message" =>
            "This action is not available."
    ], 405);
}

/* =========================================================
   DATABASE CONNECTION
========================================================= */

if (
    !isset($conn) ||
    !($conn instanceof mysqli)
) {
    respond_json([
        "success" => false,
        "message" =>
            "Service is temporarily unavailable. Please try again shortly."
    ], 500);
}

$conn->set_charset(
    "utf8mb4"
);

/* =========================================================
   ADMIN AUTHENTICATION
========================================================= */

$adminId = (int) (
    $_SESSION["user_id"]
    ?? 0
);

$sessionRole = strtolower(
    trim(
        (string) (
            $_SESSION["role"]
            ?? ""
        )
    )
);

if (
    $adminId <= 0 ||
    $sessionRole !== "admin"
) {
    respond_json([
        "success" => false,
        "message" =>
            "Administrator authentication is required."
    ], 401);
}

$adminStmt = $conn->prepare("
    SELECT
        user_id,
        restaurant_id,
        role,
        TRIM(CONCAT_WS(' ', NULLIF(TRIM(first_name), ''), NULLIF(TRIM(middle_name), ''), NULLIF(TRIM(last_name), ''))) AS display_name,
        status,
        is_verified

    FROM tbl_users

    WHERE user_id = ?

    LIMIT 1
");

if (!$adminStmt) {
    error_log(
        "update_platform_user_status admin prepare error: " .
        $conn->error
    );

    respond_json([
        "success" => false,
        "message" =>
            "Unable to verify administrator account."
    ], 500);
}

$adminStmt->bind_param(
    "i",
    $adminId
);

if (!$adminStmt->execute()) {
    error_log(
        "update_platform_user_status admin execute error: " .
        $adminStmt->error
    );

    $adminStmt->close();

    respond_json([
        "success" => false,
        "message" =>
            "Unable to verify administrator account."
    ], 500);
}

$admin =
    $adminStmt
        ->get_result()
        ->fetch_assoc();

$adminStmt->close();

if (
    !$admin ||
    strtolower(
        trim(
            (string) $admin["role"]
        )
    ) !== "admin" ||
    (int) $admin["status"] !== 1 ||
    (int) $admin["is_verified"] !== 1
) {
    respond_json([
        "success" => false,
        "message" =>
            "Your administrator account is invalid, inactive, or unverified."
    ], 403);
}

/* =========================================================
   REQUEST DATA
========================================================= */

$rawInput =
    file_get_contents(
        "php://input"
    );

$input =
    json_decode(
        $rawInput,
        true
    );

if (!is_array($input)) {
    $input = $_POST;
}

$userId = filter_var(
    $input["user_id"] ?? null,
    FILTER_VALIDATE_INT
);

$status = filter_var(
    $input["status"] ?? null,
    FILTER_VALIDATE_INT
);

if (
    $userId === false ||
    $userId === null ||
    $userId <= 0
) {
    respond_json([
        "success" => false,
        "message" =>
            "A valid platform user is required."
    ], 422);
}

if (
    $status === false ||
    $status === null ||
    !in_array(
        $status,
        [
            0,
            1
        ],
        true
    )
) {
    respond_json([
        "success" => false,
        "message" =>
            "The account status must be active or inactive."
    ], 422);
}

/* =========================================================
   PROTECT CURRENT ADMIN
========================================================= */

if (
    $userId === $adminId &&
    $status === 0
) {
    respond_json([
        "success" => false,
        "message" =>
            "You cannot deactivate your currently logged-in administrator account."
    ], 403);
}

/* =========================================================
   VERIFY TARGET USER
========================================================= */

$userStmt = $conn->prepare("
    SELECT
        user_id,
        restaurant_id,
        role,
        TRIM(CONCAT_WS(' ', NULLIF(TRIM(first_name), ''), NULLIF(TRIM(middle_name), ''), NULLIF(TRIM(last_name), ''))) AS display_name,
        email,
        status,
        is_verified

    FROM tbl_users

    WHERE user_id = ?

    LIMIT 1
");

if (!$userStmt) {
    error_log(
        "update_platform_user_status user prepare error: " .
        $conn->error
    );

    respond_json([
        "success" => false,
        "message" =>
            "Unable to verify the platform user."
    ], 500);
}

$userStmt->bind_param(
    "i",
    $userId
);

if (!$userStmt->execute()) {
    error_log(
        "update_platform_user_status user execute error: " .
        $userStmt->error
    );

    $userStmt->close();

    respond_json([
        "success" => false,
        "message" =>
            "Unable to verify the platform user."
    ], 500);
}

$targetUser =
    $userStmt
        ->get_result()
        ->fetch_assoc();

$userStmt->close();

if (!$targetUser) {
    respond_json([
        "success" => false,
        "message" =>
            "Platform user not found."
    ], 404);
}

$targetRole = strtolower(
    trim(
        (string) $targetUser["role"]
    )
);


$allowedTargetRoles = [
    "owner",
    "cashier",
    "delivery_staff"
];

if (
    !in_array(
        $targetRole,
        $allowedTargetRoles,
        true
    )
) {
    respond_json([
        "success" => false,
        "message" =>
            "Only restaurant owners and restaurant staff can be managed from Platform Users."
    ], 403);
}

if (
    (int) $targetUser["is_verified"] !== 1
) {
    respond_json([
        "success" => false,
        "message" =>
            "Unverified accounts cannot be managed from Platform Users."
    ], 403);
}

$oldStatus =
    (int) $targetUser["status"];

if ($oldStatus === $status) {
    respond_json([
        "success" => true,
        "message" =>
            $status === 1
                ? "The user account is already active."
                : "The user account is already inactive.",

        "user_id" =>
            $userId,

        "status" =>
            $status
    ]);
}

/* =========================================================
   UPDATE USER AND CREATE LOG

   Both actions use one transaction so the status update
   is rolled back if the activity log cannot be saved.
========================================================= */

$conn->begin_transaction();

try {
    $updateStmt = $conn->prepare("
        UPDATE tbl_users

        SET status = ?

        WHERE user_id = ?

        LIMIT 1
    ");

    if (!$updateStmt) {
        throw new RuntimeException(
            "Unable to prepare user status update: " .
            $conn->error
        );
    }

    $updateStmt->bind_param(
        "ii",
        $status,
        $userId
    );

    if (!$updateStmt->execute()) {
        $updateError =
            $updateStmt->error;

        $updateStmt->close();

        throw new RuntimeException(
            "Unable to update user status: " .
            $updateError
        );
    }

    if (
        $updateStmt->affected_rows !== 1
    ) {
        $updateStmt->close();

        throw new RuntimeException(
            "The user account was not updated."
        );
    }

    $updateStmt->close();

    /*
    |--------------------------------------------------------------------------
    | Activity log
    |--------------------------------------------------------------------------
    |
    | The uploaded database uses:
    | user_id and user_role
    |
    | It does not use:
    | created_by and actor_role
    |
    | restaurant_id is required by the current table. Platform-level accounts
    | without a restaurant use 0.
    |
    */

    $logRestaurantId =
        $targetUser["restaurant_id"] !== null
            ? (int) $targetUser["restaurant_id"]
            : 0;

    $oldStatusLabel =
        $oldStatus === 1
            ? "Active"
            : "Inactive";

    $newStatusLabel =
        $status === 1
            ? "Active"
            : "Inactive";

    $actionTitle =
        $status === 1
            ? "Platform User Activated"
            : "Platform User Deactivated";

    $description =
        $admin["display_name"] .
        " changed " .
        $targetUser["display_name"] .
        " (" .
        $targetUser["email"] .
        ", " .
        ucwords(
            str_replace(
                "_",
                " ",
                $targetRole
            )
        ) .
        ") from " .
        $oldStatusLabel .
        " to " .
        $newStatusLabel .
        ".";

    $logStmt = $conn->prepare("
        INSERT INTO tbl_activity_logs (
            restaurant_id,
            user_id,
            user_role,
            action_type,
            action_title,
            action_description
        )
        VALUES (?, ?, 'admin', 'account_status', ?, ?)
    ");

    if (!$logStmt) {
        throw new RuntimeException(
            "Unable to prepare activity log: " .
            $conn->error
        );
    }

    $logStmt->bind_param(
        "iiss",
        $logRestaurantId,
        $adminId,
        $actionTitle,
        $description
    );

    if (!$logStmt->execute()) {
        $logError =
            $logStmt->error;

        $logStmt->close();

        throw new RuntimeException(
            "Unable to save activity log: " .
            $logError
        );
    }

    $logStmt->close();

    $conn->commit();
} catch (Throwable $error) {
    $conn->rollback();

    error_log(
        "update_platform_user_status transaction error: " .
        $error->getMessage()
    );

    respond_json([
        "success" => false,
        "message" =>
            "Unable to update the platform user account."
    ], 500);
}

/* =========================================================
   SUCCESS RESPONSE
========================================================= */

respond_json([
    "success" => true,

    "message" =>
        $status === 1
            ? $targetUser["display_name"] .
              " was activated successfully."
            : $targetUser["display_name"] .
              " was deactivated successfully.",

    "user_id" =>
        $userId,

    "status" =>
        $status
]);