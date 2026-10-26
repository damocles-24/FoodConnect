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

if (
    strtoupper(
        (string) (
            $_SERVER["REQUEST_METHOD"]
            ?? ""
        )
    ) !== "POST"
) {
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
        TRIM(CONCAT_WS(' ', NULLIF(TRIM(first_name), ''), NULLIF(TRIM(middle_name), ''), NULLIF(TRIM(last_name), ''))) AS display_name,
        role,
        status,
        is_verified

    FROM tbl_users

    WHERE user_id = ?

    LIMIT 1
");

if (!$adminStmt) {
    error_log(
        "update_admin_restaurant_access admin prepare error: " .
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
        "update_admin_restaurant_access admin execute error: " .
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
            "Your administrator account is invalid or inactive."
    ], 403);
}

/* =========================================================
   REQUEST DATA
========================================================= */

$input =
    json_decode(
        file_get_contents(
            "php://input"
        ),
        true
    );

if (!is_array($input)) {
    $input = $_POST;
}

$restaurantId = filter_var(
    $input["restaurant_id"] ?? null,
    FILTER_VALIDATE_INT
);

$action = strtolower(
    trim(
        (string) (
            $input["action"]
            ?? ""
        )
    )
);

if (
    $restaurantId === false ||
    $restaurantId === null ||
    $restaurantId <= 0
) {
    respond_json([
        "success" => false,
        "message" =>
            "A valid restaurant is required."
    ], 422);
}

if (
    !in_array(
        $action,
        [
            "deactivate",
            "reactivate"
        ],
        true
    )
) {
    respond_json([
        "success" => false,
        "message" =>
            "Invalid restaurant access action."
    ], 422);
}

/* The owner account status changes with restaurant access, so a recorded
   administrator reason is mandatory (same rules as Platform Users). */

$reasonCheck = fc_status_validate_reason(
    "owner",
    $action,
    $input["reason"] ?? "",
    $input["note"] ?? ""
);

if (!$reasonCheck["ok"]) {
    respond_json([
        "success" => false,
        "message" => $reasonCheck["message"],
        "field" => "reason"
    ], 422);
}

/* =========================================================
   VERIFY RESTAURANT
========================================================= */

$restaurantStmt = $conn->prepare("
    SELECT
        r.restaurant_id,
        r.name,
        r.owner_id,
        r.business_status,

        TRIM(CONCAT_WS(' ', NULLIF(TRIM(owner.first_name), ''), NULLIF(TRIM(owner.middle_name), ''), NULLIF(TRIM(owner.last_name), ''))) AS owner_name,
        owner.email AS owner_email,
        owner.status AS owner_status

    FROM tbl_restaurants AS r

    INNER JOIN tbl_users AS owner
        ON owner.user_id = r.owner_id
        AND owner.role = 'owner'

    WHERE r.restaurant_id = ?

    LIMIT 1
");

if (!$restaurantStmt) {
    error_log(
        "update_admin_restaurant_access restaurant prepare error: " .
        $conn->error
    );

    respond_json([
        "success" => false,
        "message" =>
            "Unable to verify restaurant."
    ], 500);
}

$restaurantStmt->bind_param(
    "i",
    $restaurantId
);

if (!$restaurantStmt->execute()) {
    error_log(
        "update_admin_restaurant_access restaurant execute error: " .
        $restaurantStmt->error
    );

    $restaurantStmt->close();

    respond_json([
        "success" => false,
        "message" =>
            "Unable to verify restaurant."
    ], 500);
}

$restaurant =
    $restaurantStmt
        ->get_result()
        ->fetch_assoc();

$restaurantStmt->close();

if (!$restaurant) {
    respond_json([
        "success" => false,
        "message" =>
            "Restaurant not found."
    ], 404);
}

$ownerId =
    (int) $restaurant["owner_id"];

$ownerStatus =
    (int) $restaurant["owner_status"];

/* =========================================================
   ACTIVE ORDERS / DELIVERIES

   The check that blocks deactivation while the restaurant still has
   active orders or unfinished deliveries now lives in
   fc_change_account_status() (account_status_helper.php). It runs
   inside the same locked transaction as the status change, so an
   order created at the same moment cannot slip through, and it is
   shared with every other endpoint that can deactivate an owner.
========================================================= */

/* =========================================================
   UPDATE RESTAURANT ACCESS

   Only the OWNER account status changes (through the shared
   helper: locked, validated, recorded in the history table).
   Cashier and delivery staff accounts are NEVER modified here;
   while the owner is inactive the restaurant is suspended and
   staff are blocked by the session guard without any change to
   their own status. The restaurant is kept Temporarily
   Unavailable in both directions (the owner reopens it).
========================================================= */

$newOwnerStatus = $action === "deactivate" ? 0 : 1;

$restaurantName = (string) $restaurant["name"];
$adminName = (string) $admin["display_name"];

$setRestaurantUnavailable = function (
    mysqli $db,
    array $ownerRow,
    int $statusAfter
) use (
    $restaurantId,
    $adminId,
    $action,
    $restaurantName,
    $adminName,
    $reasonCheck
): void {
    $closeStmt = $db->prepare("
        UPDATE tbl_restaurants
        SET business_status = 'Temporarily Unavailable'
        WHERE restaurant_id = ?
          AND business_status <> 'Temporarily Unavailable'
        LIMIT 1
    ");

    if (!$closeStmt) {
        throw new RuntimeException("Unable to prepare restaurant closure: " . $db->error);
    }

    $closeStmt->bind_param("i", $restaurantId);

    if (!$closeStmt->execute()) {
        $closeError = $closeStmt->error;
        $closeStmt->close();
        throw new RuntimeException("Unable to close restaurant: " . $closeError);
    }

    $closeStmt->close();

    $actionTitle = $action === "deactivate"
        ? "Restaurant Deactivated"
        : "Restaurant Reactivated";

    $reasonText = $reasonCheck["reason"]
        . ($reasonCheck["note"] !== "" ? " - " . $reasonCheck["note"] : "");

    $description = $action === "deactivate"
        ? $adminName . " deactivated " . $restaurantName
            . " from FoodConnect. The restaurant was hidden from customers and the owner account was deactivated."
            . " Staff account statuses were not changed. Reason: " . $reasonText
        : $adminName . " restored FoodConnect access for " . $restaurantName
            . ". The owner account was reactivated and the restaurant stays temporarily unavailable until the owner reopens it."
            . " Staff account statuses were not changed. Reason: " . $reasonText;

    $logStmt = $db->prepare("
        INSERT INTO tbl_activity_logs (
            restaurant_id, user_id, user_role, action_type, action_title, action_description
        ) VALUES (?, ?, 'admin', 'restaurant_access', ?, ?)
    ");

    if (!$logStmt) {
        throw new RuntimeException("Unable to prepare activity log: " . $db->error);
    }

    $logStmt->bind_param("iiss", $restaurantId, $adminId, $actionTitle, $description);

    if (!$logStmt->execute()) {
        $logError = $logStmt->error;
        $logStmt->close();
        throw new RuntimeException("Unable to save activity log: " . $logError);
    }

    $logStmt->close();
};

$result = fc_change_account_status(
    $conn,
    $ownerId,
    $newOwnerStatus,
    [
        "actor" => [
            "user_id" => $adminId,
            "role" => "admin",
            "restaurant_id" => null
        ],
        "actor_name" => $adminName,
        "reason" => $reasonCheck["reason"],
        "note" => $reasonCheck["note"],
        "activity_log" => false,
        "extra_in_transaction" => $setRestaurantUnavailable
    ]
);

if (!$result["success"]) {
    respond_json([
        "success" => false,
        "message" => $result["message"],
        "field" => $result["field"] ?? null,
        "code" => $result["code"] ?? null,
        "blockers" => $result["blockers"] ?? null,
        "active_orders" => isset($result["blockers"]["active_orders"])
            ? (int) $result["blockers"]["active_orders"]
            : null
    ], (int) $result["http"]);
}

$alreadyInRequestedState = empty($result["changed"]);

if ($alreadyInRequestedState && $action === "deactivate") {
    /* Owner was already inactive (for example deactivated from Platform
       Users). No new status history is written, but the restaurant must
       still be hidden from customers. */
    $conn->begin_transaction();

    try {
        $setRestaurantUnavailable($conn, [], 0);
        $conn->commit();
    } catch (Throwable $error) {
        $conn->rollback();

        error_log(
            "update_admin_restaurant_access closure error: " .
            $error->getMessage()
        );

        respond_json([
            "success" => false,
            "message" => "Unable to update restaurant access."
        ], 500);
    }
}

/* =========================================================
   SUCCESS RESPONSE
========================================================= */

respond_json([
    "success" => true,

    "changed" => !$alreadyInRequestedState,

    "message" =>
        $action === "deactivate"
            ? $restaurantName .
              " was deactivated successfully."
            : $restaurantName .
              " was reactivated successfully. The owner must reopen the restaurant.",

    "restaurant_id" =>
        $restaurantId,

    "access_status" =>
        $action === "deactivate"
            ? "inactive"
            : "active"
]);