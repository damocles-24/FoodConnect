<?php

header("Content-Type: application/json; charset=utf-8");
header("Cache-Control: no-store, no-cache, must-revalidate");
header("Pragma: no-cache");

error_reporting(E_ALL & ~E_NOTICE & ~E_WARNING);
ini_set("display_errors", "0");

/* =========================================================
   SESSION AND DATABASE CONFIGURATION
   ========================================================= */

require_once __DIR__ . "/session_config.php";
require_once __DIR__ . "/db.php";

/* =========================================================
   RESPONSE HELPER
   ========================================================= */

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

/* =========================================================
   REQUIRE POST REQUEST
   ========================================================= */

if (
    strtoupper(
        (string) ($_SERVER["REQUEST_METHOD"] ?? "")
    ) !== "POST"
) {
    respond_json(
        [
            "success" => false,
            "message" => "Method not allowed."
        ],
        405
    );
}

/* =========================================================
   READ REQUEST DATA
   ========================================================= */

$rawInput =
    file_get_contents("php://input");

$input =
    json_decode(
        $rawInput,
        true
    );

if (!is_array($input)) {
    respond_json(
        [
            "success" => false,
            "message" => "Invalid request data."
        ],
        400
    );
}

$email = strtolower(
    trim(
        (string) ($input["email"] ?? "")
    )
);

$password =
    (string) ($input["password"] ?? "");

if ($email === "" || $password === "") {
    respond_json(
        [
            "success" => false,
            "message" =>
                "Enter your owner email and password."
        ],
        400
    );
}

if (
    !filter_var(
        $email,
        FILTER_VALIDATE_EMAIL
    )
) {
    respond_json(
        [
            "success" => false,
            "message" =>
                "Enter a valid email address."
        ],
        422
    );
}

/* =========================================================
   FIND OWNER ACCOUNT
   ========================================================= */

$accountStmt = $conn->prepare("
    SELECT
        user_id,
        restaurant_id,
        role,
        full_name,
        email,
        password_hash,
        status,
        is_verified
    FROM tbl_users
    WHERE email = ?
    LIMIT 1
");

if (!$accountStmt) {
    error_log(
        "owner_login.php account prepare error: " .
        $conn->error
    );

    respond_json(
        [
            "success" => false,
            "message" =>
                "Unable to process the owner login."
        ],
        500
    );
}

$accountStmt->bind_param(
    "s",
    $email
);

if (!$accountStmt->execute()) {
    error_log(
        "owner_login.php account execute error: " .
        $accountStmt->error
    );

    $accountStmt->close();

    respond_json(
        [
            "success" => false,
            "message" =>
                "Unable to process the owner login."
        ],
        500
    );
}

$user =
    $accountStmt
        ->get_result()
        ->fetch_assoc();

$accountStmt->close();

/*
Use one generic message when either the email or password is
incorrect. This prevents revealing whether an email exists.
*/

if (
    !$user ||
    !password_verify(
        $password,
        (string) $user["password_hash"]
    )
) {
    respond_json(
        [
            "success" => false,
            "message" =>
                "Invalid email or password."
        ],
        401
    );
}

/* =========================================================
   OWNER ROLE VALIDATION
   ========================================================= */

$role = strtolower(
    trim(
        (string) $user["role"]
    )
);

if ($role !== "owner") {
    respond_json(
        [
            "success" => false,
            "message" =>
                "This login option is for restaurant owners only."
        ],
        403
    );
}

if ((int) $user["status"] !== 1) {
    respond_json(
        [
            "success" => false,
            "message" =>
                "Your owner account is currently disabled."
        ],
        403
    );
}

if ((int) $user["is_verified"] !== 1) {
    respond_json(
        [
            "success" => false,
            "message" =>
                "Verify your email before logging in."
        ],
        403
    );
}

/* =========================================================
   OWNER ACCOUNT VALUES
   ========================================================= */

$userId =
    (int) $user["user_id"];

$restaurantId =
    !empty($user["restaurant_id"])
        ? (int) $user["restaurant_id"]
        : null;

$restaurant = null;

/* =========================================================
   CHECK FOR OWNER RESTAURANT

   This checks tbl_restaurants through owner_id instead of
   trusting only tbl_users.restaurant_id. This supports older
   accounts whose restaurant_id may not yet be synchronized.
   ========================================================= */

$restaurantStmt = $conn->prepare("
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

if (!$restaurantStmt) {
    error_log(
        "owner_login.php restaurant prepare error: " .
        $conn->error
    );

    respond_json(
        [
            "success" => false,
            "message" =>
                "Unable to check the restaurant account."
        ],
        500
    );
}

$restaurantStmt->bind_param(
    "i",
    $userId
);

if (!$restaurantStmt->execute()) {
    error_log(
        "owner_login.php restaurant execute error: " .
        $restaurantStmt->error
    );

    $restaurantStmt->close();

    respond_json(
        [
            "success" => false,
            "message" =>
                "Unable to check the restaurant account."
        ],
        500
    );
}

$restaurant =
    $restaurantStmt
        ->get_result()
        ->fetch_assoc();

$restaurantStmt->close();

/* =========================================================
   SYNCHRONIZE RESTAURANT ID
   ========================================================= */

if ($restaurant) {
    $restaurantId =
        (int) $restaurant["restaurant_id"];

    $storedRestaurantId =
        !empty($user["restaurant_id"])
            ? (int) $user["restaurant_id"]
            : null;

    if (
        $storedRestaurantId === null ||
        $storedRestaurantId !== $restaurantId
    ) {
        $syncStmt = $conn->prepare("
            UPDATE tbl_users
            SET restaurant_id = ?
            WHERE user_id = ?
            LIMIT 1
        ");

        if (!$syncStmt) {
            error_log(
                "owner_login.php sync prepare error: " .
                $conn->error
            );
        } else {
            $syncStmt->bind_param(
                "ii",
                $restaurantId,
                $userId
            );

            if (!$syncStmt->execute()) {
                error_log(
                    "owner_login.php sync execute error: " .
                    $syncStmt->error
                );
            }

            $syncStmt->close();
        }
    }
}

/* =========================================================
   GET LATEST PARTNER APPLICATION
   ========================================================= */

$application = null;
$applicationStatus = null;
$rejectionReason = null;

$applicationStmt = $conn->prepare("
    SELECT
        application_id,
        restaurant_name,
        application_status,
        rejection_reason,
        submitted_at,
        reviewed_at,
        reviewed_by,
        created_at,
        updated_at
    FROM tbl_partner_applications
    WHERE owner_id = ?
    ORDER BY application_id DESC
    LIMIT 1
");

if (!$applicationStmt) {
    error_log(
        "owner_login.php application prepare error: " .
        $conn->error
    );
} else {
    $applicationStmt->bind_param(
        "i",
        $userId
    );

    if (!$applicationStmt->execute()) {
        error_log(
            "owner_login.php application execute error: " .
            $applicationStmt->error
        );
    } else {
        $application =
            $applicationStmt
                ->get_result()
                ->fetch_assoc();

        if ($application) {
            $applicationStatus = strtolower(
                trim(
                    (string) $application["application_status"]
                )
            );

            $rejectionReason =
                $application["rejection_reason"];
        }
    }

    $applicationStmt->close();
}

/* =========================================================
   DETERMINE OWNER DESTINATION
   ========================================================= */

if ($restaurantId !== null && $restaurantId > 0) {
    $redirectUrl =
        "/FoodConnect/frontend/html/owner_dashboard_BH.html";

    $onboardingRequired =
        false;
} else {
    /*
    The restaurant setup page handles:

    email_pending:
        Owner should normally verify the email first.

    draft:
        Owner can continue restaurant setup.

    submitted:
        Page becomes read-only while awaiting review.

    rejected:
        Owner can edit and resubmit.

    approved without restaurant:
        Treat as onboarding until the admin approval process
        creates the final tbl_restaurants record.
    */

    $redirectUrl =
        "/FoodConnect/frontend/html/create_restaurant.html";

    $onboardingRequired =
        true;
}

/* =========================================================
   CREATE AUTHENTICATED OWNER SESSION
   ========================================================= */

session_regenerate_id(true);

$_SESSION["user_id"] =
    $userId;

$_SESSION["role"] =
    "owner";

$_SESSION["restaurant_id"] =
    $restaurantId;

$_SESSION["full_name"] =
    (string) $user["full_name"];

   $_SESSION["logged_in"] = true;
$_SESSION["authenticated_at"] = time();


/*
|--------------------------------------------------------------------------
| Save the authenticated owner session before returning the response
|--------------------------------------------------------------------------
*/

session_write_close();

/* =========================================================
   FORMAT RESPONSE
   ========================================================= */

$response = [
    "success" => true,
    "message" => "Owner login successful.",
    "redirect_url" => $redirectUrl,
    "onboarding_required" => $onboardingRequired,

    "user" => [
        "user_id" =>
            $userId,

        "restaurant_id" =>
            $restaurantId,

        "role" =>
            "owner",

        "full_name" =>
            $user["full_name"],

        "email" =>
            $user["email"]
    ],

    "restaurant" =>
        $restaurant
            ? [
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
                    (int) $restaurant["owner_id"]
            ]
            : null,

    "application" =>
        $application
            ? [
                "application_id" =>
                    (int) $application["application_id"],

                "restaurant_name" =>
                    $application["restaurant_name"],

                "status" =>
                    $applicationStatus,

                "rejection_reason" =>
                    $rejectionReason,

                "submitted_at" =>
                    $application["submitted_at"],

                "reviewed_at" =>
                    $application["reviewed_at"],

                "reviewed_by" =>
                    !empty($application["reviewed_by"])
                        ? (int) $application["reviewed_by"]
                        : null,

                "created_at" =>
                    $application["created_at"],

                "updated_at" =>
                    $application["updated_at"]
            ]
            : null
];

respond_json(
    $response
);