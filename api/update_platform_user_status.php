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

require_once __DIR__ .
    "/session_config.php";

require_once __DIR__ .
    "/db.php";

require_once __DIR__ .
    "/mailer.php";

require_once __DIR__ .
    "/account_status_helper.php";

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
   CHANGE STATUS (owners only; reason required)

   Permission rules, reason validation, locking, history and
   the activity log all live in account_status_helper.php so
   no endpoint can bypass them.
========================================================= */

/*
 * Reactivating an owner must never reopen their restaurant by itself: reopening is
 * the owner's own decision (same rule as Restaurant Access). A restaurant that was
 * left "Open" when the owner was deactivated is therefore set to "Temporarily
 * Unavailable" in the same transaction. Restaurants that are already unavailable
 * are not touched; orders and payments are never touched. While the owner is
 * inactive the restaurant is hidden from customers anyway, so deactivation needs
 * no change here.
 */
$keepRestaurantsClosedOnReactivation = function (
    mysqli $db,
    array $ownerRow,
    int $statusAfter
) use ($adminId): void {
    if ($statusAfter !== 1) {
        return;
    }

    $ownerUserId = (int) $ownerRow["user_id"];

    $find = $db->prepare("
        SELECT restaurant_id, name
        FROM tbl_restaurants
        WHERE owner_id = ?
          AND business_status <> 'Temporarily Unavailable'
    ");

    if (!$find) {
        throw new RuntimeException("prepare restaurants: " . $db->error);
    }

    $find->bind_param("i", $ownerUserId);

    if (!$find->execute()) {
        throw new RuntimeException("execute failed: " . $find->error);
    }

    $open = [];
    $rows = $find->get_result();

    while ($rows && ($row = $rows->fetch_assoc())) {
        $open[] = $row;
    }

    $find->close();

    foreach ($open as $restaurant) {
        $restaurantId = (int) $restaurant["restaurant_id"];

        $close = $db->prepare("
            UPDATE tbl_restaurants
            SET business_status = 'Temporarily Unavailable'
            WHERE restaurant_id = ?
              AND business_status <> 'Temporarily Unavailable'
            LIMIT 1
        ");

        if (!$close) {
            throw new RuntimeException("prepare close: " . $db->error);
        }

        $close->bind_param("i", $restaurantId);

        if (!$close->execute()) {
            throw new RuntimeException("execute failed: " . $close->error);
        }

        $close->close();

        $title = "Restaurant Kept Closed";
        $description = "The owner account was reactivated by an administrator. "
            . (string) $restaurant["name"]
            . " stays temporarily unavailable until the owner reopens it.";

        $log = $db->prepare("
            INSERT INTO tbl_activity_logs (restaurant_id, user_id, user_role, action_type, action_title, action_description)
            VALUES (?, ?, 'admin', 'restaurant_access', ?, ?)
        ");

        if (!$log) {
            throw new RuntimeException("prepare log: " . $db->error);
        }

        $log->bind_param("iiss", $restaurantId, $adminId, $title, $description);

        if (!$log->execute()) {
            throw new RuntimeException("execute failed: " . $log->error);
        }

        $log->close();
    }
};

$result = fc_change_account_status(
    $conn,
    (int) $userId,
    (int) $status,
    [
        "actor" => [
            "user_id" => $adminId,
            "role" => "admin",
            "restaurant_id" => null
        ],
        "actor_name" => (string) $admin["display_name"],
        "reason" => $input["reason"] ?? "",
        "note" => $input["note"] ?? "",
        "activity_log" => true,
        "extra_in_transaction" => $keepRestaurantsClosedOnReactivation
    ]
);

if (!$result["success"]) {
    respond_json([
        "success" => false,
        "message" => $result["message"],
        "field" => $result["field"] ?? null,
        "code" => $result["code"] ?? null,
        "blockers" => $result["blockers"] ?? null
    ], (int) $result["http"]);
}

$targetUser = $result["target"];

if (empty($result["changed"])) {
    respond_json([
        "success" => true,
        "changed" => false,
        "message" => $result["message"],
        "user_id" => (int) $userId,
        "status" => (int) $status
    ]);
}

/* =========================================================
   OWNER EMAIL NOTIFICATION (after the change is committed)
========================================================= */

if (!empty($targetUser["email"])) {
    $emailSubject =
        $status === 1
            ? "FoodConnect Owner Account Reactivated"
            : "FoodConnect Owner Account Deactivated";

    $safeName = htmlspecialchars(
        (string) $targetUser["display_name"],
        ENT_QUOTES,
        "UTF-8"
    );

    $statusMessage =
        $status === 1
            ? "Your FoodConnect restaurant owner account has been reactivated. You may now access your owner portal again."
            : "Your FoodConnect restaurant owner account has been deactivated.";

    $reasonText = (string) ($result["reason"] ?? "");

    if (($result["note"] ?? "") !== "") {
        $reasonText .= " - " . $result["note"];
    }

    $emailBody = ""
        . "<div style=\"font-family:Arial,sans-serif;color:#1c2434;\">"
        . "<h2>FoodConnect Account Update</h2>"
        . "<p>Hello {$safeName},</p>"
        . "<p>{$statusMessage}</p>"
        . "<p><strong>Reason:</strong><br>"
        . nl2br(htmlspecialchars($reasonText, ENT_QUOTES, "UTF-8"))
        . "</p>"
        . "<p>FoodConnect Administration Team</p></div>";

    if (!sendBrevoSMTP((string) $targetUser["email"], $emailSubject, $emailBody)) {
        error_log(
            "Owner status email failed for user_id: " . (int) $userId
        );
    }
}

respond_json([
    "success" => true,
    "changed" => true,
    "message" =>
        $status === 1
            ? $targetUser["display_name"] . " was reactivated successfully. Their restaurant stays temporarily unavailable until the owner reopens it."
            : $targetUser["display_name"] . " was deactivated successfully.",
    "user_id" => (int) $userId,
    "status" => (int) $status
]);
