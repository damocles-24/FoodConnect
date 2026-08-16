<?php

header(
    "Content-Type: application/json; charset=utf-8"
);

header(
    "Cache-Control: no-store, no-cache, must-revalidate"
);

require_once __DIR__ . "/session_config.php";
require_once __DIR__ . "/db.php";

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
   POST ONLY
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
   OWNER AUTHENTICATION
========================================================= */

$ownerId =
    (int) (
        $_SESSION["user_id"]
        ?? 0
    );

$restaurantId =
    (int) (
        $_SESSION["restaurant_id"]
        ?? 0
    );

$role =
    strtolower(
        trim(
            (string) (
                $_SESSION["role"]
                ?? ""
            )
        )
    );

if (
    $ownerId <= 0 ||
    $restaurantId <= 0 ||
    $role !== "owner"
) {
    respond_json([
        "success" => false,
        "message" =>
            "Owner authentication is required."
    ], 401);
}

/* =========================================================
   SUBMISSION TRANSACTION
========================================================= */

$conn->begin_transaction();

try {
    /* =====================================================
       VERIFY AND LOCK RESTAURANT
    ===================================================== */

    $restaurantStmt =
        $conn->prepare("
            SELECT
                restaurant_id,
                name,
                setup_completed,
                customer_visibility
            FROM tbl_restaurants
            WHERE restaurant_id = ?
              AND owner_id = ?
            LIMIT 1
            FOR UPDATE
        ");

    if (!$restaurantStmt) {
        throw new RuntimeException(
            "Unable to verify the restaurant."
        );
    }

    $restaurantStmt->bind_param(
        "ii",
        $restaurantId,
        $ownerId
    );

    if (!$restaurantStmt->execute()) {
        throw new RuntimeException(
            "Unable to verify the restaurant."
        );
    }

    $restaurant =
        $restaurantStmt
            ->get_result()
            ->fetch_assoc();

    $restaurantStmt->close();

    if (!$restaurant) {
        throw new DomainException(
            "The restaurant could not be found."
        );
    }

    if (
        (int) $restaurant["setup_completed"] !== 1
    ) {
        throw new DomainException(
            "Complete the restaurant setup before applying to go live."
        );
    }

    $visibility =
        strtolower(
            trim(
                (string) (
                    $restaurant["customer_visibility"]
                    ?? ""
                )
            )
        );

    if ($visibility === "visible") {
        throw new DomainException(
            "Your restaurant is already live."
        );
    }

    /* =====================================================
       REQUIRE AT LEAST ONE PRODUCT
    ===================================================== */

    $productStmt =
        $conn->prepare("
            SELECT COUNT(*) AS product_count
            FROM tbl_products
            WHERE restaurant_id = ?
              AND item_type = 'menu_item'
        ");

    if (!$productStmt) {
        throw new RuntimeException(
            "Unable to check the restaurant products."
        );
    }

    $productStmt->bind_param(
        "i",
        $restaurantId
    );

    if (!$productStmt->execute()) {
        throw new RuntimeException(
            "Unable to check the restaurant products."
        );
    }

    $productResult =
        $productStmt
            ->get_result()
            ->fetch_assoc();

    $productStmt->close();

    $productCount =
        (int) (
            $productResult["product_count"]
            ?? 0
        );

    if ($productCount < 1) {
        throw new DomainException(
            "Add at least one product before applying to go live."
        );
    }

    /* =====================================================
       LOCK APPLICATION
    ===================================================== */

    $applicationStmt =
        $conn->prepare("
            SELECT
                application_id,
                application_status
            FROM tbl_partner_applications
            WHERE owner_id = ?
            ORDER BY application_id DESC
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
        $ownerId
    );

    if (!$applicationStmt->execute()) {
        throw new RuntimeException(
            "Unable to load the restaurant application."
        );
    }

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

    $applicationId =
        (int) $application["application_id"];

    $currentStatus =
        strtolower(
            trim(
                (string) (
                    $application["application_status"]
                    ?? ""
                )
            )
        );

    if ($currentStatus === "submitted") {
        throw new DomainException(
            "Your go-live application is already under administrator review."
        );
    }

    if ($currentStatus === "approved") {
        throw new DomainException(
            "Your restaurant application has already been approved."
        );
    }

    if ($currentStatus === "rejected") {
        throw new DomainException(
            "This restaurant application was permanently rejected."
        );
    }

    if (
        !in_array(
            $currentStatus,
            [
                "draft",
                "needs_changes"
            ],
            true
        )
    ) {
        throw new DomainException(
            "The restaurant application cannot currently be submitted."
        );
    }

    /* =====================================================
       SUBMIT FOR ADMIN REVIEW
    ===================================================== */

    $submitStmt =
        $conn->prepare("
            UPDATE tbl_partner_applications
            SET
                application_status = 'submitted',
                rejection_reason = NULL,
                submitted_at = NOW(),
                reviewed_at = NULL,
                reviewed_by = NULL
            WHERE application_id = ?
              AND owner_id = ?
              AND application_status IN (
                  'draft',
                  'needs_changes'
              )
            LIMIT 1
        ");

    if (!$submitStmt) {
        throw new RuntimeException(
            "Unable to submit the go-live application."
        );
    }

    $submitStmt->bind_param(
        "ii",
        $applicationId,
        $ownerId
    );

    if (!$submitStmt->execute()) {
        throw new RuntimeException(
            "Unable to submit the go-live application."
        );
    }

    if ($submitStmt->affected_rows !== 1) {
        $submitStmt->close();

        throw new RuntimeException(
            "The application status changed before submission was completed."
        );
    }

    $submitStmt->close();

    /* =====================================================
       ACTIVITY LOG
    ===================================================== */

    $actionTitle =
        "Go-Live Application Submitted";

    $description =
        "The owner submitted \"" .
        trim(
            (string) $restaurant["name"]
        ) .
        "\" for administrator review.";

    $logStmt =
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
                'owner',
                'restaurant_application',
                ?,
                ?
            )
        ");

    if (!$logStmt) {
        throw new RuntimeException(
            "Unable to record the application submission."
        );
    }

    $logStmt->bind_param(
        "iiss",
        $restaurantId,
        $ownerId,
        $actionTitle,
        $description
    );

    if (!$logStmt->execute()) {
        throw new RuntimeException(
            "Unable to record the application submission."
        );
    }

    $logStmt->close();

    $conn->commit();

    respond_json([
        "success" => true,

        "application_id" =>
            $applicationId,

        "application_status" =>
            "submitted",

        "customer_visibility" =>
            "Hidden",

        "message" =>
            "Your restaurant was submitted for administrator review."
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
        "submit_restaurant_go_live.php error: " .
        $error->getMessage()
    );

    respond_json([
        "success" => false,
        "message" =>
            "Unable to submit the restaurant for review."
    ], 500);
}