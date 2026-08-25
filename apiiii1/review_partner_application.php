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
        "message" => "This action is not available."
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
    "request_changes",
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
    in_array(
        $decision,
        [
            "request_changes",
            "reject"
        ],
        true
    ) &&
    strlen($rejectionReason) < 10
) {
    respond_json([
        "success" => false,
        "message" =>
            "Enter a clear review reason with at least 10 characters."
    ], 422);
}

if (strlen($rejectionReason) > 1000) {
    respond_json([
        "success" => false,
        "message" =>
            "The review reason is too long."
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
                logo_path,
                business_email,
                province,
                city_municipality,
                barangay,
                postal_code,
                business_hours_json,
                order_types_json,
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
            COALESCE(NULLIF(TRIM(CONCAT_WS(' ', NULLIF(TRIM(first_name), ''), NULLIF(TRIM(middle_name), ''), NULLIF(TRIM(last_name), ''))), ''), NULLIF(TRIM(full_name), ''), '') AS full_name,
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
   REQUEST APPLICATION CHANGES
===================================================== */

if ($decision === "request_changes") {
    $changesStmt =
        $conn->prepare("
            UPDATE tbl_partner_applications
            SET
                application_status = 'needs_changes',
                rejection_reason = ?,
                reviewed_at = NOW(),
                reviewed_by = ?
            WHERE application_id = ?
              AND application_status = 'submitted'
            LIMIT 1
        ");

    if (!$changesStmt) {
        throw new RuntimeException(
            "Unable to request application changes."
        );
    }

    $changesStmt->bind_param(
        "sii",
        $rejectionReason,
        $adminId,
        $applicationId
    );

    if (!$changesStmt->execute()) {
        throw new RuntimeException(
            "Unable to request application changes."
        );
    }

    if (
        $changesStmt->affected_rows !== 1
    ) {
        $changesStmt->close();

        throw new RuntimeException(
            "The application status changed before the review was completed."
        );
    }

    $changesStmt->close();

    /*
    |--------------------------------------------------------------------------
    | Commit before sending notification email
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

    $safeReviewReason =
        nl2br(
            escape_html(
                $rejectionReason
            )
        );

    $changesSubject =
        "Changes Requested for Your FoodConnect Restaurant Application";

    $changesBody = "
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
                color: #d97706;
            \">
                Application Changes Requested
            </h2>

            <p>
                Hello {$safeOwnerName},
            </p>

            <p>
                Your FoodConnect application for
                <strong>{$safeRestaurantName}</strong>
                requires some changes before it can be approved.
            </p>

            <div style=\"
                margin: 20px 0;
                padding: 16px;
                border-left: 4px solid #d97706;
                background: #fffbeb;
            \">
                <strong>Administrator's feedback:</strong>

                <div style=\"margin-top: 8px;\">
                    {$safeReviewReason}
                </div>
            </div>

            <p>
                Please log in through the FoodConnect Partner Portal,
                update the required information and submit the
                application again for review.
            </p>

            <p>
                Your owner account and saved application remain active.
            </p>

            <p style=\"margin-top: 28px;\">
                Thank you,<br>
                <strong>FoodConnect Support</strong>
            </p>
        </div>
    ";

    $emailSent = sendBrevoSMTP(
        $ownerEmail,
        $changesSubject,
        $changesBody
    );

    respond_json([
        "success" => true,

        "decision" =>
            "needs_changes",

        "email_sent" =>
            $emailSent,

        "message" =>
            $emailSent
                ? "Application changes requested successfully. The owner was notified by email."
                : "Application changes requested successfully, but the notification email could not be sent."
    ]);
}

/* =====================================================
   PERMANENTLY REJECT APPLICATION
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

    if (
        $rejectStmt->affected_rows !== 1
    ) {
        $rejectStmt->close();

        throw new RuntimeException(
            "The application status changed before the review was completed."
        );
    }

    $rejectStmt->close();

    

    /*
    |--------------------------------------------------------------------------
    | Commit before sending notification email
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
        "Your FoodConnect Restaurant Application Was Rejected";

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
                Restaurant Application Rejected
            </h2>

            <p>
                Hello {$safeOwnerName},
            </p>

            <p>
                Your FoodConnect application for
                <strong>{$safeRestaurantName}</strong>
                has been rejected.
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
                This decision closes the current restaurant
                application. It can no longer be edited or
                resubmitted through the Partner Portal.
            </p>

            <p>
                Your FoodConnect user account remains available,
                but this restaurant application will remain
                permanently read-only.
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
                ? "Restaurant application rejected permanently. The owner was notified by email."
                : "Restaurant application rejected permanently, but the notification email could not be sent."
    ]);
}

 /* =====================================================
   LOAD EXISTING PRIVATE RESTAURANT
===================================================== */

$restaurantId =
    (int) (
        $owner["restaurant_id"]
        ?? 0
    );

if ($restaurantId <= 0) {
    throw new DomainException(
        "The owner does not have a completed private restaurant setup."
    );
}

$restaurantStmt =
    $conn->prepare("
        SELECT
            restaurant_id,
            owner_id,
            name,
            customer_visibility,
            setup_completed
        FROM tbl_restaurants
        WHERE restaurant_id = ?
          AND owner_id = ?
        LIMIT 1
        FOR UPDATE
    ");

if (!$restaurantStmt) {
    throw new RuntimeException(
        "Unable to verify the private restaurant."
    );
}

$restaurantStmt->bind_param(
    "ii",
    $restaurantId,
    $ownerId
);

if (!$restaurantStmt->execute()) {
    throw new RuntimeException(
        "Unable to verify the private restaurant."
    );
}

$existingRestaurant =
    $restaurantStmt
        ->get_result()
        ->fetch_assoc();

$restaurantStmt->close();

if (!$existingRestaurant) {
    throw new DomainException(
        "The owner's private restaurant could not be found."
    );
}

if (
    (int) (
        $existingRestaurant["setup_completed"]
        ?? 0
    ) !== 1
) {
    throw new DomainException(
        "The restaurant setup must be completed before approval."
    );
}

$restaurantName =
    trim(
        (string) (
            $existingRestaurant["name"]
            ?? $application["restaurant_name"]
            ?? "Restaurant"
        )
    );

/* =====================================================
   MAKE RESTAURANT VISIBLE
===================================================== */

$publishStmt =
    $conn->prepare("
        UPDATE tbl_restaurants
        SET
            customer_visibility = 'Visible',
            business_status = 'Closed'
        WHERE restaurant_id = ?
          AND owner_id = ?
        LIMIT 1
    ");

if (!$publishStmt) {
    throw new RuntimeException(
        "Unable to publish the approved restaurant."
    );
}

$publishStmt->bind_param(
    "ii",
    $restaurantId,
    $ownerId
);

if (!$publishStmt->execute()) {
    throw new RuntimeException(
        "Unable to publish the approved restaurant."
    );
}

$publishStmt->close();

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

    /* =====================================================
   LOG APPLICATION APPROVAL
===================================================== */

$approveActionTitle =
    "Restaurant Approved";

$approveDescription =
    "The go-live application for \"" .
    $restaurantName .
    "\" owned by " .
    $ownerName .
    " was approved. Restaurant ID " .
    $restaurantId .
    " is now visible to customers.";

$approveLogStmt =
    $conn->prepare("
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
            'restaurant_application',
            ?,
            ?
        )
    ");

if (!$approveLogStmt) {
    throw new RuntimeException(
        "Unable to create the application approval log."
    );
}

$approveLogStmt->bind_param(
    "iiss",
    $restaurantId,
    $adminId,
    $approveActionTitle,
    $approveDescription
);

if (!$approveLogStmt->execute()) {
    $approveLogStmt->close();

    throw new RuntimeException(
        "Unable to save the application approval log."
    );
}

$approveLogStmt->close();

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
           Your restaurant has passed the FoodConnect review
           and is now visible to customers.
        </div>

        <p>
           You may now access your Owner Dashboard and open the
           restaurant when you are ready to begin accepting orders.
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