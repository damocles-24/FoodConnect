<?php
header("Content-Type: application/json; charset=utf-8");
header("Cache-Control: no-store, no-cache, must-revalidate");
header("Pragma: no-cache");

error_reporting(E_ALL & ~E_NOTICE & ~E_WARNING);
ini_set("display_errors", "0");

require_once __DIR__ . "/session_config.php";
require_once __DIR__ . "/db.php";
require_once __DIR__ . "/mailer.php";
require_once __DIR__ . "/url_helper.php";
require_once __DIR__ . "/name_helper.php";

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

if (
    empty($_SESSION["user_id"]) ||
    strtolower(trim((string)($_SESSION["role"] ?? ""))) !== "admin"
) {
    respond_json([
        "success" => false,
        "message" => "Administrator authentication is required."
    ], 401);
}

$adminId = (int)$_SESSION["user_id"];
if ($adminId <= 0) {
    respond_json([
        "success" => false,
        "message" => "Invalid administrator session."
    ], 401);
}

$input = json_decode(file_get_contents("php://input"), true);
if (!is_array($input)) {
    respond_json([
        "success" => false,
        "message" => "Invalid request data."
    ], 400);
}

$requestId = (int)($input["request_id"] ?? 0);
$decision = strtolower(trim((string)($input["decision"] ?? "")));
$rejectionReason = trim((string)($input["rejection_reason"] ?? ""));

if ($requestId <= 0) {
    respond_json([
        "success" => false,
        "message" => "Invalid verification resend request."
    ], 422);
}

if (!in_array($decision, ["send", "reject"], true)) {
    respond_json([
        "success" => false,
        "message" => "Select a valid request decision."
    ], 422);
}

if ($decision === "reject") {
    if (strlen($rejectionReason) < 10) {
        respond_json([
            "success" => false,
            "message" => "Enter a clear rejection reason with at least 10 characters."
        ], 422);
    }

    if (strlen($rejectionReason) > 500) {
        respond_json([
            "success" => false,
            "message" => "The rejection reason is too long."
        ], 422);
    }
}

$adminStmt = $conn->prepare("
    SELECT user_id, role, status, is_verified
    FROM tbl_users
    WHERE user_id = ?
    LIMIT 1
");

if (!$adminStmt) {
    respond_json([
        "success" => false,
        "message" => "Unable to verify administrator access."
    ], 500);
}

$adminStmt->bind_param("i", $adminId);
$adminStmt->execute();
$admin = $adminStmt->get_result()->fetch_assoc();
$adminStmt->close();

if (
    !$admin ||
    strtolower((string)$admin["role"]) !== "admin" ||
    (int)$admin["status"] !== 1 ||
    (int)$admin["is_verified"] !== 1
) {
    respond_json([
        "success" => false,
        "message" => "Administrator access is no longer valid."
    ], 403);
}

if ($decision === "reject") {
    try {
        $conn->begin_transaction();

        $requestStmt = $conn->prepare("
            SELECT
                r.request_id,
                r.application_id,
                r.owner_id,
                r.request_status,
                pa.application_status,
                u.is_verified
            FROM tbl_partner_verification_resend_requests r
            INNER JOIN tbl_partner_applications pa
                ON pa.application_id = r.application_id
            INNER JOIN tbl_users u
                ON u.user_id = r.owner_id
            WHERE r.request_id = ?
            LIMIT 1
            FOR UPDATE
        ");

        if (!$requestStmt) {
            throw new RuntimeException("Unable to load the verification resend request.");
        }

        $requestStmt->bind_param("i", $requestId);
        $requestStmt->execute();
        $request = $requestStmt->get_result()->fetch_assoc();
        $requestStmt->close();

        if (!$request) {
            throw new DomainException("Verification resend request not found.");
        }

        $requestStatus = strtolower((string)$request["request_status"]);

        if (!in_array($requestStatus, ["pending", "send_failed"], true)) {
            throw new DomainException("This verification resend request has already been handled.");
        }

        if (
            strtolower((string)$request["application_status"]) !== "email_pending" ||
            (int)$request["is_verified"] === 1
        ) {
            $cancelStmt = $conn->prepare("
                UPDATE tbl_partner_verification_resend_requests
                SET request_status = 'cancelled', reviewed_at = NOW(), reviewed_by = ?
                WHERE request_id = ?
                LIMIT 1
            ");

            if ($cancelStmt) {
                $cancelStmt->bind_param("ii", $adminId, $requestId);
                $cancelStmt->execute();
                $cancelStmt->close();
            }

            $conn->commit();

            respond_json([
                "success" => true,
                "message" => "The owner is no longer waiting for email verification, so this resend request was closed."
            ]);
        }

        $rejectStmt = $conn->prepare("
            UPDATE tbl_partner_verification_resend_requests
            SET
                request_status = 'rejected',
                rejection_reason = ?,
                reviewed_at = NOW(),
                reviewed_by = ?
            WHERE request_id = ?
            LIMIT 1
        ");

        if (!$rejectStmt) {
            throw new RuntimeException("Unable to prepare request rejection.");
        }

        $rejectStmt->bind_param("sii", $rejectionReason, $adminId, $requestId);
        $rejectStmt->execute();
        $rejectStmt->close();

        $conn->commit();

        respond_json([
            "success" => true,
            "message" => "Verification resend request rejected."
        ]);
    } catch (DomainException $error) {
        try { $conn->rollback(); } catch (Throwable $ignored) {}
        respond_json([
            "success" => false,
            "message" => $error->getMessage()
        ], 409);
    } catch (Throwable $error) {
        try { $conn->rollback(); } catch (Throwable $ignored) {}
        error_log("review_partner_verification_resend_request reject error: " . $error->getMessage());
        respond_json([
            "success" => false,
            "message" => "Unable to reject the verification resend request right now."
        ], 500);
    }
}

/* =========================================================
   SEND A NEW VERIFICATION EMAIL AFTER ADMIN APPROVAL
========================================================= */

$ownerData = null;
$verificationToken = "";
$verificationExpiresAt = "";

try {
    $conn->begin_transaction();

    $requestStmt = $conn->prepare("
        SELECT
            r.request_id,
            r.application_id,
            r.owner_id,
            r.request_status,
            r.updated_at,
            pa.restaurant_name,
            pa.application_status,
            u.email,
            u.first_name,
            u.middle_name,
            u.last_name,
            u.role,
            u.is_verified
        FROM tbl_partner_verification_resend_requests r
        INNER JOIN tbl_partner_applications pa
            ON pa.application_id = r.application_id
        INNER JOIN tbl_users u
            ON u.user_id = r.owner_id
        WHERE r.request_id = ?
        LIMIT 1
        FOR UPDATE
    ");

    if (!$requestStmt) {
        throw new RuntimeException("Unable to load the verification resend request.");
    }

    $requestStmt->bind_param("i", $requestId);
    $requestStmt->execute();
    $request = $requestStmt->get_result()->fetch_assoc();
    $requestStmt->close();

    if (!$request) {
        throw new DomainException("Verification resend request not found.");
    }

    $requestStatus = strtolower((string)$request["request_status"]);

    if ($requestStatus === "sent") {
        $conn->commit();
        respond_json([
            "success" => true,
            "message" => "The new verification email has already been sent for this request."
        ]);
    }

    if ($requestStatus === "processing") {
        $updatedAt = strtotime((string)($request["updated_at"] ?? ""));
        if ($updatedAt !== false && $updatedAt >= time() - 600) {
            throw new DomainException("This resend request is already being processed by an administrator.");
        }
    }

    if (!in_array($requestStatus, ["pending", "send_failed", "processing"], true)) {
        throw new DomainException("This verification resend request has already been handled.");
    }

    if (
        strtolower((string)$request["role"]) !== "owner" ||
        strtolower((string)$request["application_status"]) !== "email_pending" ||
        (int)$request["is_verified"] === 1
    ) {
        $cancelStmt = $conn->prepare("
            UPDATE tbl_partner_verification_resend_requests
            SET request_status = 'cancelled', reviewed_at = NOW(), reviewed_by = ?
            WHERE request_id = ?
            LIMIT 1
        ");

        if ($cancelStmt) {
            $cancelStmt->bind_param("ii", $adminId, $requestId);
            $cancelStmt->execute();
            $cancelStmt->close();
        }

        $conn->commit();
        respond_json([
            "success" => true,
            "message" => "The owner is no longer waiting for email verification, so this resend request was closed."
        ]);
    }

    $verificationToken = bin2hex(random_bytes(32));
    $verificationExpiresAt = date("Y-m-d H:i:s", time() + 86400);
    $ownerId = (int)$request["owner_id"];

    $userUpdate = $conn->prepare("
        UPDATE tbl_users
        SET verification_token = ?, verification_expires_at = ?
        WHERE user_id = ?
          AND is_verified = 0
        LIMIT 1
    ");

    if (!$userUpdate) {
        throw new RuntimeException("Unable to prepare the new verification token.");
    }

    $userUpdate->bind_param("ssi", $verificationToken, $verificationExpiresAt, $ownerId);

    if (!$userUpdate->execute() || $userUpdate->affected_rows < 1) {
        $userUpdate->close();
        throw new DomainException("The owner is no longer waiting for email verification.");
    }

    $userUpdate->close();

    $processingStmt = $conn->prepare("
        UPDATE tbl_partner_verification_resend_requests
        SET
            request_status = 'processing',
            rejection_reason = NULL,
            reviewed_by = ?
        WHERE request_id = ?
        LIMIT 1
    ");

    if (!$processingStmt) {
        throw new RuntimeException("Unable to prepare resend processing state.");
    }

    $processingStmt->bind_param("ii", $adminId, $requestId);
    $processingStmt->execute();
    $processingStmt->close();

    $ownerData = [
        "email" => (string)$request["email"],
        "name" => formatUserName($request),
        "restaurant_name" => (string)$request["restaurant_name"]
    ];

    $conn->commit();
} catch (DomainException $error) {
    try { $conn->rollback(); } catch (Throwable $ignored) {}
    respond_json([
        "success" => false,
        "message" => $error->getMessage()
    ], 409);
} catch (Throwable $error) {
    try { $conn->rollback(); } catch (Throwable $ignored) {}
    error_log("review_partner_verification_resend_request prepare-send error: " . $error->getMessage());
    respond_json([
        "success" => false,
        "message" => "Unable to prepare the verification resend right now."
    ], 500);
}

$verificationLink = foodconnect_verification_url($verificationToken);
$safeName = htmlspecialchars($ownerData["name"] ?: "Restaurant Partner", ENT_QUOTES, "UTF-8");
$safeRestaurantName = htmlspecialchars($ownerData["restaurant_name"], ENT_QUOTES, "UTF-8");

$emailBody = "
<!doctype html>
<html>
<body style='margin:0;padding:0;background:#fff8f1;font-family:Arial,Helvetica,sans-serif;'>
<table width='100%' cellpadding='0' cellspacing='0' style='padding:32px 15px;'>
<tr><td align='center'>
<table width='560' cellpadding='0' cellspacing='0' style='width:100%;max-width:560px;background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 12px 35px rgba(52,69,77,.12);'>
<tr><td align='center' style='padding:28px;background:#fff4e8;'>
<div style='font-size:26px;font-weight:800;'><span style='color:#f58220;'>Food</span><span style='color:#43b047;'>Connect</span></div>
<div style='margin-top:6px;color:#71828a;font-size:13px;'>Restaurant Partner Program</div>
</td></tr>
<tr><td style='padding:32px;'>
<h2 style='margin:0;color:#2f4149;font-size:22px;'>New partner verification link</h2>
<p style='margin-top:18px;color:#455a64;font-size:15px;line-height:1.7;'>Hi {$safeName},</p>
<p style='color:#455a64;font-size:15px;line-height:1.7;'>The FoodConnect administrator approved your request for a new email verification link for <strong>{$safeRestaurantName}</strong>.</p>
<p style='color:#455a64;font-size:15px;line-height:1.7;'>Use the button below to verify your email and continue your restaurant application.</p>
<div style='padding:24px 0;text-align:center;'>
<a href='{$verificationLink}' style='display:inline-block;padding:14px 24px;color:#ffffff;background:#f58220;border-radius:11px;font-size:14px;font-weight:bold;text-decoration:none;'>Verify Partner Email</a>
</div>
<p style='color:#71828a;font-size:12px;line-height:1.6;'>This verification link expires after 24 hours. Older verification links are no longer valid.</p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>
";

$emailSent = false;

try {
    $emailSent = sendBrevoSMTP(
        $ownerData["email"],
        "New FoodConnect partner verification link",
        $emailBody
    );
} catch (Throwable $mailError) {
    error_log(
        "Partner verification resend email error for request {$requestId}: " .
        $mailError->getMessage()
    );

    $emailSent = false;
}

if (!$emailSent) {
    $failedStmt = $conn->prepare("
        UPDATE tbl_partner_verification_resend_requests
        SET request_status = 'send_failed'
        WHERE request_id = ?
          AND request_status = 'processing'
        LIMIT 1
    ");

    if ($failedStmt) {
        $failedStmt->bind_param("i", $requestId);
        $failedStmt->execute();
        $failedStmt->close();
    }

    respond_json([
        "success" => false,
        "message" => "The request was approved, but FoodConnect could not send the email. The request remains available for retry."
    ], 502);
}

$sentStmt = $conn->prepare("
    UPDATE tbl_partner_verification_resend_requests
    SET
        request_status = 'sent',
        reviewed_at = NOW(),
        sent_at = NOW(),
        reviewed_by = ?,
        rejection_reason = NULL
    WHERE request_id = ?
      AND request_status = 'processing'
    LIMIT 1
");

if (!$sentStmt) {
    error_log("Verification email sent but request finalization prepare failed for request {$requestId}: " . $conn->error);
    respond_json([
        "success" => true,
        "message" => "Verification email sent successfully. The request audit status could not be finalized automatically, so please refresh before retrying."
    ]);
}

$sentStmt->bind_param("ii", $adminId, $requestId);
$sentStmt->execute();
$sentStmt->close();

respond_json([
    "success" => true,
    "message" => "A new 24-hour verification email was sent to the registered partner email."
]);
