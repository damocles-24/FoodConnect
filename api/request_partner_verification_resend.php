<?php
header("Content-Type: application/json; charset=utf-8");
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Pragma: no-cache");

error_reporting(E_ALL & ~E_NOTICE & ~E_WARNING);
ini_set("display_errors", "0");

require_once __DIR__ . "/session_config.php";
require_once __DIR__ . "/db.php";
require_once __DIR__ . "/rate_limit.php";

function respond_json(array $data, int $statusCode = 200): void
{
    http_response_code($statusCode);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

if (strtoupper((string)($_SERVER["REQUEST_METHOD"] ?? "")) !== "POST") {
    header("Allow: POST");
    respond_json([
        "success" => false,
        "message" => "This action is not available."
    ], 405);
}

$input = json_decode(file_get_contents("php://input"), true);
if (!is_array($input)) {
    $input = [];
}

$sessionUserId = (int)($_SESSION["user_id"] ?? 0);
$sessionRole = strtolower(trim((string)($_SESSION["role"] ?? "")));
$authenticatedApplicant =
    $sessionUserId > 0 &&
    in_array($sessionRole, ["partner_applicant", "owner"], true);

$email = strtolower(trim((string)($input["email"] ?? "")));

if (!$authenticatedApplicant) {
    if ($email === "" || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        respond_json([
            "success" => false,
            "message" => "Enter the email address used for your partner application."
        ], 422);
    }

    if (strlen($email) > 150) {
        respond_json([
            "success" => false,
            "message" => "The email address is too long."
        ], 422);
    }
}

$safePublicMessage =
    "If an email-pending partner application exists for that address, the request will be sent to the FoodConnect administrator for review.";

try {
    $conn->begin_transaction();

    if ($authenticatedApplicant) {
        $ownerStmt = $conn->prepare("
            SELECT
                u.user_id,
                u.email,
                u.role,
                u.is_verified,
                pa.application_id,
                pa.application_status
            FROM tbl_users u
            INNER JOIN tbl_partner_applications pa
                ON pa.owner_id = u.user_id
            WHERE u.user_id = ?
              AND u.role = 'owner'
            ORDER BY pa.application_id DESC
            LIMIT 1
            FOR UPDATE
        ");

        if (!$ownerStmt) {
            throw new RuntimeException("Unable to prepare partner verification request lookup.");
        }

        $ownerStmt->bind_param("i", $sessionUserId);
    } else {
        $ownerStmt = $conn->prepare("
            SELECT
                u.user_id,
                u.email,
                u.role,
                u.is_verified,
                pa.application_id,
                pa.application_status
            FROM tbl_users u
            INNER JOIN tbl_partner_applications pa
                ON pa.owner_id = u.user_id
            WHERE u.email = ?
              AND u.role = 'owner'
            ORDER BY pa.application_id DESC
            LIMIT 1
            FOR UPDATE
        ");

        if (!$ownerStmt) {
            throw new RuntimeException("Unable to prepare partner verification request lookup.");
        }

        $ownerStmt->bind_param("s", $email);
    }

    if (!$ownerStmt->execute()) {
        throw new RuntimeException("Unable to check the partner application.");
    }

    $owner = $ownerStmt->get_result()->fetch_assoc();
    $ownerStmt->close();

    if (!$owner) {
        $conn->commit();

        respond_json([
            "success" => true,
            "message" => $safePublicMessage,
            "request_pending" => true,
            "request_status" => "pending"
        ]);
    }

    $email = strtolower(trim((string)$owner["email"]));

    rate_limit_enforce(
        $conn,
        "partner-verification-resend-request",
        rate_limit_identifier(rate_limit_client_ip(), $email),
        4,
        3600,
        1800,
        "Too many verification resend requests. Please wait before trying again."
    );

    $isVerified = (int)($owner["is_verified"] ?? 0) === 1;
    $applicationStatus = strtolower(trim((string)($owner["application_status"] ?? "")));

    if ($isVerified || $applicationStatus !== "email_pending") {
        $conn->commit();

        if ($authenticatedApplicant) {
            respond_json([
                "success" => true,
                "message" => "Your partner email no longer needs verification.",
                "request_pending" => false,
                "request_status" => "not_needed"
            ]);
        }

        respond_json([
            "success" => true,
            "message" => $safePublicMessage,
            "request_pending" => true,
            "request_status" => "pending"
        ]);
    }

    $applicationId = (int)$owner["application_id"];
    $ownerId = (int)$owner["user_id"];

    $latestStmt = $conn->prepare("
        SELECT
            request_id,
            request_status,
            rejection_reason,
            requested_at,
            reviewed_at,
            sent_at,
            updated_at
        FROM tbl_partner_verification_resend_requests
        WHERE application_id = ?
          AND owner_id = ?
        ORDER BY request_id DESC
        LIMIT 1
        FOR UPDATE
    ");

    if (!$latestStmt) {
        throw new RuntimeException("Unable to prepare verification resend request status.");
    }

    $latestStmt->bind_param("ii", $applicationId, $ownerId);
    $latestStmt->execute();
    $latest = $latestStmt->get_result()->fetch_assoc();
    $latestStmt->close();

    if ($latest) {
        $latestStatus = strtolower((string)$latest["request_status"]);

        if (in_array($latestStatus, ["pending", "processing", "send_failed"], true)) {
            $conn->commit();

            $message = $safePublicMessage;
            if ($authenticatedApplicant) {
                $message = $latestStatus === "send_failed"
                    ? "The administrator approved your request, but email delivery failed. FoodConnect can retry it from the admin panel; you do not need to submit another request."
                    : "Your verification-email request is already waiting for FoodConnect administrator action.";
            }

            respond_json([
                "success" => true,
                "message" => $message,
                "request_pending" => true,
                "request_status" => $latestStatus,
                "request_id" => (int)$latest["request_id"]
            ]);
        }

        if ($latestStatus === "sent" && !empty($latest["sent_at"])) {
            $sentAt = strtotime((string)$latest["sent_at"]);
            if ($sentAt !== false && $sentAt >= time() - 86400) {
                $conn->commit();

                respond_json([
                    "success" => true,
                    "message" => $authenticatedApplicant
                        ? "A new verification email was already sent. Check your Inbox and Spam/Junk folder. The link is valid for 24 hours."
                        : $safePublicMessage,
                    "request_pending" => false,
                    "request_status" => "sent",
                    "request_id" => (int)$latest["request_id"]
                ]);
            }
        }

        if ($latestStatus === "rejected" && !empty($latest["reviewed_at"])) {
            $reviewedAt = strtotime((string)$latest["reviewed_at"]);
            if ($reviewedAt !== false && $reviewedAt >= time() - 86400) {
                $conn->commit();

                respond_json([
                    "success" => true,
                    "message" => $authenticatedApplicant
                        ? "Your latest verification-email request was not approved. Contact the FoodConnect administrator if you still need a new link."
                        : $safePublicMessage,
                    "request_pending" => false,
                    "request_status" => "rejected",
                    "request_id" => (int)$latest["request_id"]
                ]);
            }
        }
    }

    $insertStmt = $conn->prepare("
        INSERT INTO tbl_partner_verification_resend_requests (
            application_id,
            owner_id,
            requested_email,
            request_status,
            requested_at
        ) VALUES (?, ?, ?, 'pending', NOW())
    ");

    if (!$insertStmt) {
        throw new RuntimeException("Unable to prepare verification resend request creation.");
    }

    $insertStmt->bind_param("iis", $applicationId, $ownerId, $email);

    if (!$insertStmt->execute()) {
        throw new RuntimeException("Unable to save the verification resend request.");
    }

    $requestId = (int)$conn->insert_id;
    $insertStmt->close();

    $conn->commit();

    respond_json([
        "success" => true,
        "message" => $authenticatedApplicant
            ? "Request submitted. A FoodConnect administrator must approve it before a new verification email is sent."
            : $safePublicMessage,
        "request_pending" => true,
        "request_status" => "pending",
        "request_id" => $authenticatedApplicant ? $requestId : null
    ], 201);
} catch (Throwable $error) {
    try {
        $conn->rollback();
    } catch (Throwable $rollbackError) {
        error_log("request_partner_verification_resend rollback error: " . $rollbackError->getMessage());
    }

    error_log("request_partner_verification_resend.php error: " . $error->getMessage());

    respond_json([
        "success" => false,
        "message" => "Unable to submit the verification resend request right now. Please try again shortly."
    ], 500);
}
