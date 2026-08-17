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
        full_name,
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

/* =========================================================
   VERIFY RESTAURANT
========================================================= */

$restaurantStmt = $conn->prepare("
    SELECT
        r.restaurant_id,
        r.name,
        r.owner_id,
        r.business_status,

        owner.full_name AS owner_name,
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
   CHECK ACTIVE ORDERS BEFORE DEACTIVATION
========================================================= */

if ($action === "deactivate") {
    $activeOrderStmt = $conn->prepare("
        SELECT
            COUNT(*) AS active_orders

        FROM tbl_orders

        WHERE restaurant_id = ?

        AND order_status NOT IN (
            'completed',
            'cancelled'
        )
    ");

    if (!$activeOrderStmt) {
        respond_json([
            "success" => false,
            "message" =>
                "Unable to check active orders."
        ], 500);
    }

    $activeOrderStmt->bind_param(
        "i",
        $restaurantId
    );

    if (!$activeOrderStmt->execute()) {
        $activeOrderStmt->close();

        respond_json([
            "success" => false,
            "message" =>
                "Unable to check active orders."
        ], 500);
    }

    $activeOrderRow =
        $activeOrderStmt
            ->get_result()
            ->fetch_assoc();

    $activeOrderStmt->close();

    $activeOrders =
        (int) (
            $activeOrderRow["active_orders"]
            ?? 0
        );

    if ($activeOrders > 0) {
        respond_json([
            "success" => false,

            "message" =>
                "This restaurant still has active orders. Complete or cancel them before deactivating the restaurant.",

            "active_orders" =>
                $activeOrders
        ], 409);
    }
}



/* =========================================================
   UPDATE RESTAURANT ACCESS
========================================================= */

$conn->begin_transaction();

try {
    if ($action === "deactivate") {
        /*
        |--------------------------------------------------------------------------
        | Close restaurant
        |--------------------------------------------------------------------------
        */

        $closeStmt = $conn->prepare("
            UPDATE tbl_restaurants

            SET business_status = 'Closed'

            WHERE restaurant_id = ?

            LIMIT 1
        ");

        if (!$closeStmt) {
            throw new RuntimeException(
                "Unable to prepare restaurant closure: " .
                $conn->error
            );
        }

        $closeStmt->bind_param(
            "i",
            $restaurantId
        );

        if (!$closeStmt->execute()) {
            $closeError =
                $closeStmt->error;

            $closeStmt->close();

            throw new RuntimeException(
                "Unable to close restaurant: " .
                $closeError
            );
        }

        $closeStmt->close();

        /*
        |--------------------------------------------------------------------------
        | Deactivate owner, cashiers and delivery staff
        |--------------------------------------------------------------------------
        */

        $usersStmt = $conn->prepare("
            UPDATE tbl_users

            SET status = 0

            WHERE (
                user_id = ?

                OR restaurant_id = ?
            )

            AND role IN (
                'owner',
                'cashier',
                'delivery_staff'
            )
        ");

        if (!$usersStmt) {
            throw new RuntimeException(
                "Unable to prepare restaurant user deactivation: " .
                $conn->error
            );
        }

        $usersStmt->bind_param(
            "ii",
            $ownerId,
            $restaurantId
        );

        if (!$usersStmt->execute()) {
            $usersError =
                $usersStmt->error;

            $usersStmt->close();

            throw new RuntimeException(
                "Unable to deactivate restaurant users: " .
                $usersError
            );
        }

        $affectedUsers =
            $usersStmt->affected_rows;

        $usersStmt->close();

        $actionTitle =
            "Restaurant Deactivated";

        $description =
            $admin["full_name"] .
            " deactivated " .
            $restaurant["name"] .
            " from FoodConnect. The restaurant was hidden from customers and " .
            $affectedUsers .
            " owner or staff account(s) were deactivated.";
    } else {
        /*
        |--------------------------------------------------------------------------
        | Reactivate owner only
        |--------------------------------------------------------------------------
        |
        | Staff remain inactive until the owner reviews them.
        |--------------------------------------------------------------------------
        */

        $ownerStmt = $conn->prepare("
            UPDATE tbl_users

            SET status = 1

            WHERE user_id = ?

            AND role = 'owner'

            LIMIT 1
        ");

        if (!$ownerStmt) {
            throw new RuntimeException(
                "Unable to prepare owner reactivation: " .
                $conn->error
            );
        }

        $ownerStmt->bind_param(
            "i",
            $ownerId
        );

        if (!$ownerStmt->execute()) {
            $ownerError =
                $ownerStmt->error;

            $ownerStmt->close();

            throw new RuntimeException(
                "Unable to reactivate owner: " .
                $ownerError
            );
        }

        $ownerStmt->close();

        /*
        |--------------------------------------------------------------------------
        | Keep restaurant closed until owner manually opens it
        |--------------------------------------------------------------------------
        */

        $closedStmt = $conn->prepare("
            UPDATE tbl_restaurants

            SET business_status = 'Closed'

            WHERE restaurant_id = ?

            LIMIT 1
        ");

        if (!$closedStmt) {
            throw new RuntimeException(
                "Unable to prepare restaurant status reset: " .
                $conn->error
            );
        }

        $closedStmt->bind_param(
            "i",
            $restaurantId
        );

        if (!$closedStmt->execute()) {
            $closedError =
                $closedStmt->error;

            $closedStmt->close();

            throw new RuntimeException(
                "Unable to reset restaurant status: " .
                $closedError
            );
        }

        $closedStmt->close();

        $actionTitle =
            "Restaurant Reactivated";

        $description =
            $admin["full_name"] .
            " restored FoodConnect access for " .
            $restaurant["name"] .
            ". The owner account was reactivated. Staff remain inactive until reviewed.";
    }

    /*
    |--------------------------------------------------------------------------
    | Save activity log
    |--------------------------------------------------------------------------
    */

    $logStmt = $conn->prepare("
        INSERT INTO tbl_activity_logs (
            restaurant_id,
            user_id,
            user_role,
            action_type,
            action_title,
            action_description
        )
        VALUES (
            ?,
            ?,
            'admin',
            'restaurant_access',
            ?,
            ?
        )
    ");

    if (!$logStmt) {
        throw new RuntimeException(
            "Unable to prepare activity log: " .
            $conn->error
        );
    }

    $logStmt->bind_param(
        "iiss",
        $restaurantId,
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
        "update_admin_restaurant_access transaction error: " .
        $error->getMessage()
    );

    respond_json([
        "success" => false,
        "message" =>
            "Unable to update restaurant access."
    ], 500);
}

/* =========================================================
   SUCCESS RESPONSE
========================================================= */

respond_json([
    "success" => true,

    "message" =>
        $action === "deactivate"
            ? $restaurant["name"] .
              " was deactivated successfully."
            : $restaurant["name"] .
              " was reactivated successfully. The owner must review staff accounts and reopen the restaurant.",

    "restaurant_id" =>
        $restaurantId,

    "access_status" =>
        $action === "deactivate"
            ? "inactive"
            : "active"
]);