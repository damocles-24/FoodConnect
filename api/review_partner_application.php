<?php

header(
    "Content-Type: application/json; charset=utf-8"
);

header(
    "Cache-Control: no-store, no-cache, must-revalidate"
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

require_once __DIR__ . "/session_config.php";
require_once __DIR__ . "/db.php";
require_once __DIR__ . "/mailer.php";

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

function escape_html(
    string $value
): string {
    return htmlspecialchars(
        $value,
        ENT_QUOTES,
        "UTF-8"
    );
}

function generate_staff_access_code(): string
{
    return strtoupper(
        bin2hex(
            random_bytes(6)
        )
    );
}

/* =========================================================
   POST REQUEST ONLY
========================================================= */

if (
    strtoupper(
        (string) (
            $_SERVER["REQUEST_METHOD"]
            ?? ""
        )
    ) !== "POST"
) {
    header("Allow: POST");

    respond_json([
        "success" => false,
        "message" => "Method not allowed."
    ], 405);
}

/* =========================================================
   ADMIN AUTHENTICATION
========================================================= */

if (
    empty($_SESSION["user_id"]) ||
    strtolower(
        trim(
            (string) (
                $_SESSION["role"]
                ?? ""
            )
        )
    ) !== "admin"
) {
    respond_json([
        "success" => false,
        "message" =>
            "Administrator authentication is required."
    ], 401);
}

$adminId =
    (int) $_SESSION["user_id"];

if ($adminId <= 0) {
    respond_json([
        "success" => false,
        "message" =>
            "Invalid administrator session."
    ], 401);
}

/* =========================================================
   READ REQUEST DATA
========================================================= */

$input = json_decode(
    file_get_contents("php://input"),
    true
);

if (!is_array($input)) {
    respond_json([
        "success" => false,
        "message" => "Invalid request data."
    ], 400);
}

$applicationId =
    (int) (
        $input["application_id"]
        ?? 0
    );

$decision =
    strtolower(
        trim(
            (string) (
                $input["decision"]
                ?? ""
            )
        )
    );

$rejectionReason =
    trim(
        (string) (
            $input["rejection_reason"]
            ?? ""
        )
    );

if ($applicationId <= 0) {
    respond_json([
        "success" => false,
        "message" =>
            "Invalid restaurant application."
    ], 422);
}

$allowedDecisions = [
    "approve",
    "reject"
];

if (
    !in_array(
        $decision,
        $allowedDecisions,
        true
    )
) {
    respond_json([
        "success" => false,
        "message" =>
            "Select a valid review decision."
    ], 422);
}

if (
    $decision === "reject" &&
    strlen($rejectionReason) < 10
) {
    respond_json([
        "success" => false,
        "message" =>
            "Enter a clear rejection reason with at least 10 characters."
    ], 422);
}

if (strlen($rejectionReason) > 1000) {
    respond_json([
        "success" => false,
        "message" =>
            "The rejection reason is too long."
    ], 422);
}

/* =========================================================
   VERIFY CURRENT ADMIN ACCOUNT
========================================================= */

$adminStmt = $conn->prepare("
    SELECT
        user_id,
        role,
        status,
        is_verified
    FROM tbl_users
    WHERE user_id = ?
    LIMIT 1
");

if (!$adminStmt) {
    respond_json([
        "success" => false,
        "message" =>
            "Unable to verify administrator access."
    ], 500);
}

$adminStmt->bind_param(
    "i",
    $adminId
);

$adminStmt->execute();

$admin =
    $adminStmt
        ->get_result()
        ->fetch_assoc();

$adminStmt->close();

if (
    !$admin ||
    strtolower(
        (string) $admin["role"]
    ) !== "admin" ||
    (int) $admin["status"] !== 1 ||
    (int) $admin["is_verified"] !== 1
) {
    respond_json([
        "success" => false,
        "message" =>
            "Administrator access is no longer valid."
    ], 403);
}

/* =========================================================
   BEGIN REVIEW TRANSACTION
========================================================= */

$conn->begin_transaction();

try {
    /* =====================================================
       LOCK APPLICATION
    ===================================================== */

    $applicationStmt =
        $conn->prepare("
            SELECT
                application_id,
                owner_id,
                restaurant_name,
                restaurant_address,
                restaurant_contact,
                cuisine,
                restaurant_description,
                business_email,
                province,
                city_municipality,
                barangay,
                postal_code,
                business_hours_json,
                delivery_options_json,
                minimum_order,
                delivery_fee,
                application_status
            FROM tbl_partner_applications
            WHERE application_id = ?
            LIMIT 1
            FOR UPDATE
        ");

    if (!$applicationStmt) {
        throw new RuntimeException(
            "Unable to load the restaurant application."
        );
    }

    $applicationStmt->bind_param(
        "i",
        $applicationId
    );

    $applicationStmt->execute();

    $application =
        $applicationStmt
            ->get_result()
            ->fetch_assoc();

    $applicationStmt->close();

    if (!$application) {
        throw new DomainException(
            "Restaurant application not found."
        );
    }

    $currentStatus =
        strtolower(
            trim(
                (string)
                $application[
                    "application_status"
                ]
            )
        );

    if ($currentStatus !== "submitted") {
        throw new DomainException(
            "Only submitted applications can be reviewed."
        );
    }

    $ownerId =
        (int) $application["owner_id"];

    if ($ownerId <= 0) {
        throw new DomainException(
            "The application owner is invalid."
        );
    }

    /* =====================================================
       LOCK OWNER ACCOUNT
    ===================================================== */

    $ownerStmt =
    $conn->prepare("
        SELECT
            user_id,
            restaurant_id,
            full_name,
            email,
            role,
            status,
            is_verified

        FROM tbl_users

        WHERE user_id = ?

        LIMIT 1

        FOR UPDATE
    ");

    if (!$ownerStmt) {
        throw new RuntimeException(
            "Unable to verify the restaurant owner."
        );
    }

    $ownerStmt->bind_param(
        "i",
        $ownerId
    );

    $ownerStmt->execute();

    $owner =
        $ownerStmt
            ->get_result()
            ->fetch_assoc();

    $ownerStmt->close();

    if (!$owner) {
        throw new DomainException(
            "The restaurant owner account was not found."
        );
    }

    if (
        strtolower(
            (string) $owner["role"]
        ) !== "owner"
    ) {
        throw new DomainException(
            "The application account is not a restaurant owner."
        );
    }

    if (
        (int) $owner["status"] !== 1 ||
        (int) $owner["is_verified"] !== 1
    ) {
        throw new DomainException(
            "The owner account must be active and verified."
        );
    }

    $ownerName =
    trim(
        (string) (
            $owner["full_name"]
            ?? ""
        )
    );

$ownerEmail =
    trim(
        (string) (
            $owner["email"]
            ?? ""
        )
    );

if ($ownerName === "") {
    $ownerName =
        "Restaurant Owner";
}

if (
    !filter_var(
        $ownerEmail,
        FILTER_VALIDATE_EMAIL
    )
) {
    throw new DomainException(
        "The restaurant owner does not have a valid email address."
    );
}

    /* =====================================================
       REJECT APPLICATION
    ===================================================== */

    if ($decision === "reject") {
        $rejectStmt =
            $conn->prepare("
                UPDATE tbl_partner_applications
                SET
                    application_status = 'rejected',
                    rejection_reason = ?,
                    reviewed_at = NOW(),
                    reviewed_by = ?
                WHERE application_id = ?
                  AND application_status = 'submitted'
                LIMIT 1
            ");

        if (!$rejectStmt) {
            throw new RuntimeException(
                "Unable to reject the application."
            );
        }

        $rejectStmt->bind_param(
            "sii",
            $rejectionReason,
            $adminId,
            $applicationId
        );

        if (!$rejectStmt->execute()) {
            throw new RuntimeException(
                "Unable to reject the application."
            );
        }

        if ($rejectStmt->affected_rows !== 1) {
            $rejectStmt->close();

            throw new RuntimeException(
                "The application status changed before the review was completed."
            );
        }

        $rejectStmt->close();

/*
|--------------------------------------------------------------------------
| Commit rejection before sending email
|--------------------------------------------------------------------------
*/

$conn->commit();

$safeOwnerName =
    escape_html(
        $ownerName
    );

$safeRestaurantName =
    escape_html(
        (string) $application[
            "restaurant_name"
        ]
    );

$safeRejectionReason =
    nl2br(
        escape_html(
            $rejectionReason
        )
    );

$rejectionSubject =
    "Update on Your FoodConnect Restaurant Application";

$rejectionBody = "
    <div style=\"
        max-width: 620px;
        margin: 0 auto;
        padding: 28px;
        font-family: Arial, sans-serif;
        color: #1f2937;
        line-height: 1.6;
    \">
        <h2 style=\"
            margin: 0 0 18px;
            color: #c62828;
        \">
            Restaurant Application Update
        </h2>

        <p>
            Hello {$safeOwnerName},
        </p>

        <p>
            Your FoodConnect application for
            <strong>{$safeRestaurantName}</strong>
            requires changes before it can be approved.
        </p>

        <div style=\"
            margin: 20px 0;
            padding: 16px;
            border-left: 4px solid #c62828;
            background: #fff5f5;
        \">
            <strong>Administrator's reason:</strong>

            <div style=\"margin-top: 8px;\">
                {$safeRejectionReason}
            </div>
        </div>

        <p>
            Please log in through the FoodConnect Partner Portal,
            review your application, make the required corrections,
            and submit it again.
        </p>

        <p>
            Your owner account remains active and verified.
        </p>

        <p style=\"margin-top: 28px;\">
            Thank you,<br>
            <strong>FoodConnect Support</strong>
        </p>
    </div>
";

$emailSent = sendBrevoSMTP(
    $ownerEmail,
    $rejectionSubject,
    $rejectionBody
);

respond_json([
    "success" => true,

    "decision" =>
        "rejected",

    "email_sent" =>
        $emailSent,

    "message" =>
        $emailSent
            ? "Restaurant application rejected successfully. The owner was notified by email."
            : "Restaurant application rejected successfully, but the notification email could not be sent."
]);
    }

    /* =====================================================
       CHECK EXISTING RESTAURANT
    ===================================================== */

    if (
        !empty(
            $owner["restaurant_id"]
        )
    ) {
        throw new DomainException(
            "This owner already has a linked restaurant."
        );
    }

    $existingRestaurantStmt =
        $conn->prepare("
            SELECT restaurant_id
            FROM tbl_restaurants
            WHERE owner_id = ?
            LIMIT 1
            FOR UPDATE
        ");

    if (!$existingRestaurantStmt) {
        throw new RuntimeException(
            "Unable to verify existing restaurants."
        );
    }

    $existingRestaurantStmt->bind_param(
        "i",
        $ownerId
    );

    $existingRestaurantStmt->execute();

    $existingRestaurant =
        $existingRestaurantStmt
            ->get_result()
            ->fetch_assoc();

    $existingRestaurantStmt->close();

    if ($existingRestaurant) {
        throw new DomainException(
            "This owner already has an approved restaurant."
        );
    }

    /* =====================================================
       CREATE RESTAURANT
    ===================================================== */

    $restaurantName =
        trim(
            (string)
            $application["restaurant_name"]
        );

    $restaurantAddress =
        trim(
            (string)
            $application["restaurant_address"]
        );

    $restaurantContact =
        trim(
            (string)
            $application["restaurant_contact"]
        );

    $deliveryFee =
        max(
            0,
            (float)
            $application["delivery_fee"]
        );

    $openingHours =
        "Configured during partner application";

    $businessStatus =
        "Closed";

    $staffAccessCode =
        generate_staff_access_code();

    $createRestaurantStmt =
        $conn->prepare("
            INSERT INTO tbl_restaurants (
                name,
                address,
                contact_number,
                opening_hours,
                delivery_fee,
                business_status,
                owner_id,
                staff_access_code
            )
            VALUES (
                ?,
                ?,
                ?,
                ?,
                ?,
                ?,
                ?,
                ?
            )
        ");

    if (!$createRestaurantStmt) {
        throw new RuntimeException(
            "Unable to create the approved restaurant."
        );
    }

        $createRestaurantStmt->bind_param(
        "ssssdsis",
        $restaurantName,
        $restaurantAddress,
        $restaurantContact,
        $openingHours,
        $deliveryFee,
        $businessStatus,
        $ownerId,
        $staffAccessCode
    );

        if (
        !$createRestaurantStmt->execute()
    ) {
        throw new RuntimeException(
            "Unable to create the approved restaurant."
        );
    }

    $restaurantId =
        (int) $conn->insert_id;

    $createRestaurantStmt->close();

    if ($restaurantId <= 0) {
        throw new RuntimeException(
            "The restaurant account was not created correctly."
        );
    }

    /* =====================================================
       LINK RESTAURANT TO OWNER
    ===================================================== */

    $linkOwnerStmt =
        $conn->prepare("
            UPDATE tbl_users
            SET restaurant_id = ?
            WHERE user_id = ?
              AND restaurant_id IS NULL
            LIMIT 1
        ");

    if (!$linkOwnerStmt) {
        throw new RuntimeException(
            "Unable to link the restaurant to its owner."
        );
    }

    $linkOwnerStmt->bind_param(
        "ii",
        $restaurantId,
        $ownerId
    );

    if (!$linkOwnerStmt->execute()) {
        throw new RuntimeException(
            "Unable to link the restaurant to its owner."
        );
    }

    if ($linkOwnerStmt->affected_rows !== 1) {
        $linkOwnerStmt->close();

        throw new RuntimeException(
            "The owner account could not be linked to the restaurant."
        );
    }

    $linkOwnerStmt->close();

    /* =====================================================
       APPROVE APPLICATION
    ===================================================== */

    $approveStmt =
        $conn->prepare("
            UPDATE tbl_partner_applications
            SET
                application_status = 'approved',
                rejection_reason = NULL,
                reviewed_at = NOW(),
                reviewed_by = ?
            WHERE application_id = ?
              AND application_status = 'submitted'
            LIMIT 1
        ");

    if (!$approveStmt) {
        throw new RuntimeException(
            "Unable to complete the application approval."
        );
    }

    $approveStmt->bind_param(
        "ii",
        $adminId,
        $applicationId
    );

    if (!$approveStmt->execute()) {
        throw new RuntimeException(
            "Unable to complete the application approval."
        );
    }

    if ($approveStmt->affected_rows !== 1) {
        $approveStmt->close();

        throw new RuntimeException(
            "The application status changed before approval was completed."
        );
    }

    $approveStmt->close();

/*
|--------------------------------------------------------------------------
| Commit approval before sending email
|--------------------------------------------------------------------------
*/

$conn->commit();

$safeOwnerName =
    escape_html(
        $ownerName
    );

$safeRestaurantName =
    escape_html(
        $restaurantName
    );

$approvalSubject =
    "Your FoodConnect Restaurant Application Has Been Approved";

$approvalBody = "
    <div style=\"
        max-width: 620px;
        margin: 0 auto;
        padding: 28px;
        font-family: Arial, sans-serif;
        color: #1f2937;
        line-height: 1.6;
    \">
        <h2 style=\"
            margin: 0 0 18px;
            color: #238636;
        \">
            Restaurant Application Approved
        </h2>

        <p>
            Hello {$safeOwnerName},
        </p>

        <p>
            Great news! Your FoodConnect application for
            <strong>{$safeRestaurantName}</strong>
            has been approved by the FoodConnect administrator.
        </p>

        <div style=\"
            margin: 20px 0;
            padding: 16px;
            border-left: 4px solid #238636;
            background: #f0fff4;
        \">
            Your restaurant account has been created and linked
            to your Owner account.
        </div>

        <p>
            You may now log in through the FoodConnect Partner Portal
            and access your Owner Dashboard.
        </p>

        <p>
            Before accepting customer orders, please:
        </p>

        <ul>
            <li>Review your restaurant information</li>
            <li>Add or review your products</li>
            <li>Create and review staff accounts</li>
            <li>Confirm your delivery settings</li>
            <li>Open the restaurant when everything is ready</li>
        </ul>

        <p>
            For safety, your restaurant is initially set to
            <strong>Closed</strong>. It will not accept new orders
            until you manually open it from the Owner Dashboard.
        </p>

        <p style=\"margin-top: 28px;\">
            Welcome to FoodConnect,<br>
            <strong>FoodConnect Support</strong>
        </p>
    </div>
";

$emailSent = sendBrevoSMTP(
    $ownerEmail,
    $approvalSubject,
    $approvalBody
);

respond_json([
    "success" => true,

    "decision" =>
        "approved",

    "restaurant_id" =>
        $restaurantId,

    "email_sent" =>
        $emailSent,

    "message" =>
        $emailSent
            ? "Restaurant application approved successfully. The owner was notified by email."
            : "Restaurant application approved successfully, but the notification email could not be sent."
]);

} catch (DomainException $error) {
    $conn->rollback();

    respond_json([
        "success" => false,
        "message" =>
            $error->getMessage()
    ], 409);
} catch (Throwable $error) {
    $conn->rollback();

    error_log(
        "review_partner_application.php error: " .
        $error->getMessage()
    );

    respond_json([
        "success" => false,
        "message" =>
            "Unable to complete the restaurant application review."
    ], 500);
}