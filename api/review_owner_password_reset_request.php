<?php

header("Content-Type: application/json; charset=utf-8");
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Pragma: no-cache");

error_reporting(E_ALL & ~E_NOTICE & ~E_WARNING);
ini_set("display_errors", "0");

require_once __DIR__ . "/session_config.php";
require_once __DIR__ . "/db.php";
require_once __DIR__ . "/rate_limit.php";
require_once __DIR__ . "/mailer.php";

function owner_reset_review_respond(array $payload, int $code = 200): void
{
    http_response_code($code);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function build_owner_temporary_password_email(
    string $ownerName,
    string $restaurantName,
    string $temporaryPassword
): string {
    $safeOwnerName = htmlspecialchars(
        $ownerName !== "" ? $ownerName : "Restaurant Owner",
        ENT_QUOTES,
        "UTF-8"
    );

    $safeRestaurantName = htmlspecialchars(
        $restaurantName !== "" ? $restaurantName : "your restaurant",
        ENT_QUOTES,
        "UTF-8"
    );

    $safeTemporaryPassword = htmlspecialchars(
        $temporaryPassword,
        ENT_QUOTES,
        "UTF-8"
    );

    return <<<HTML
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>FoodConnect Owner Password Recovery</title>
</head>
<body style="margin:0;padding:0;background:#f5f6f8;font-family:Arial,sans-serif;color:#1f2937;">
  <div style="max-width:640px;margin:0 auto;padding:28px 16px;">
    <div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:16px;padding:28px;">
      <div style="font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#ff8a00;margin-bottom:8px;">
        Owner Account Recovery
      </div>
      <h2 style="margin:0 0 14px;font-size:24px;color:#1f2937;">Password reset approved</h2>
      <p style="margin:0 0 14px;line-height:1.65;">Hello {$safeOwnerName},</p>
      <p style="margin:0 0 18px;line-height:1.65;">
        A FoodConnect administrator approved the password recovery request for
        <strong>{$safeRestaurantName}</strong>. Your previous owner password has been replaced with the temporary password below.
      </p>

      <div style="margin:18px 0;padding:16px;border:1px solid #ffd08a;border-radius:12px;background:#fff8ed;">
        <div style="font-size:12px;font-weight:700;color:#6b7280;margin-bottom:8px;">Temporary password</div>
        <div style="font-family:Consolas,Monaco,monospace;font-size:20px;font-weight:700;letter-spacing:.04em;overflow-wrap:anywhere;color:#111827;">{$safeTemporaryPassword}</div>
      </div>

      <p style="margin:0 0 12px;line-height:1.65;">
        Sign in to the FoodConnect Owner Portal using your registered owner email and this temporary password. You will be required to create a new private password before normal owner verification continues.
      </p>
      <p style="margin:0 0 12px;line-height:1.65;">
        For security, do not forward this email or share the temporary password with anyone.
      </p>
      <p style="margin:18px 0 0;font-size:13px;line-height:1.6;color:#6b7280;">
        If you did not request this recovery, contact the FoodConnect administrator immediately.
      </p>
    </div>
  </div>
</body>
</html>
HTML;
}

function generate_owner_temporary_password(int $length = 14): string
{
    $length = max(12, $length);

    $upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
    $lower = "abcdefghijkmnopqrstuvwxyz";
    $digits = "23456789";
    $symbols = "!@#$%";
    $all = $upper . $lower . $digits . $symbols;

    $characters = [
        $upper[random_int(0, strlen($upper) - 1)],
        $lower[random_int(0, strlen($lower) - 1)],
        $digits[random_int(0, strlen($digits) - 1)],
        $symbols[random_int(0, strlen($symbols) - 1)]
    ];

    while (count($characters) < $length) {
        $characters[] = $all[random_int(0, strlen($all) - 1)];
    }

    for ($i = count($characters) - 1; $i > 0; $i--) {
        $j = random_int(0, $i);
        $tmp = $characters[$i];
        $characters[$i] = $characters[$j];
        $characters[$j] = $tmp;
    }

    return implode("", $characters);
}

if (strtoupper((string)($_SERVER["REQUEST_METHOD"] ?? "")) !== "POST") {
    owner_reset_review_respond([
        "success" => false,
        "message" => "This action is not available."
    ], 405);
}

$adminId = (int)($_SESSION["user_id"] ?? 0);
$sessionRole = strtolower(trim((string)($_SESSION["role"] ?? "")));

if ($adminId <= 0 || $sessionRole !== "admin") {
    owner_reset_review_respond([
        "success" => false,
        "message" => "Administrator authentication is required."
    ], 401);
}

$adminStmt = $conn->prepare("
    SELECT user_id, role, full_name, status, is_verified
    FROM tbl_users
    WHERE user_id = ?
    LIMIT 1
");

if (!$adminStmt) {
    owner_reset_review_respond([
        "success" => false,
        "message" => "Unable to verify the administrator account."
    ], 500);
}

$adminStmt->bind_param("i", $adminId);
$adminStmt->execute();
$admin = $adminStmt->get_result()->fetch_assoc();
$adminStmt->close();

if (
    !$admin ||
    strtolower(trim((string)$admin["role"])) !== "admin" ||
    (int)$admin["status"] !== 1 ||
    (int)$admin["is_verified"] !== 1
) {
    owner_reset_review_respond([
        "success" => false,
        "message" => "Your administrator account is invalid or inactive."
    ], 403);
}

$input = json_decode(file_get_contents("php://input"), true);
if (!is_array($input)) {
    owner_reset_review_respond([
        "success" => false,
        "message" => "Invalid request data."
    ], 400);
}

$requestId = filter_var($input["request_id"] ?? null, FILTER_VALIDATE_INT);
$action = strtolower(trim((string)($input["action"] ?? "")));
$reviewNote = trim((string)($input["review_note"] ?? ""));

if ($requestId === false || $requestId === null || $requestId <= 0) {
    owner_reset_review_respond([
        "success" => false,
        "message" => "Select a valid recovery request."
    ], 422);
}

if (!in_array($action, ["approve", "reject"], true)) {
    owner_reset_review_respond([
        "success" => false,
        "message" => "Choose whether to approve or reject the recovery request."
    ], 422);
}

if (mb_strlen($reviewNote) > 500) {
    owner_reset_review_respond([
        "success" => false,
        "message" => "Review note must not exceed 500 characters."
    ], 422);
}

if ($action === "reject" && mb_strlen($reviewNote) < 3) {
    owner_reset_review_respond([
        "success" => false,
        "message" => "Enter a short reason for rejecting the request."
    ], 422);
}

rate_limit_enforce(
    $conn,
    "admin-owner-password-reset-review",
    rate_limit_identifier((string)$adminId, rate_limit_client_ip()),
    30,
    900,
    900,
    "Too many password recovery actions. Please wait and try again."
);

try {
    $conn->begin_transaction();

    $requestStmt = $conn->prepare("
        SELECT
            req.request_id,
            req.owner_id,
            req.restaurant_id,
            req.request_status,
            req.submitted_restaurant_name,
            owner.full_name AS owner_name,
            owner.email AS owner_email,
            owner.role AS owner_role,
            owner.status AS owner_status,
            owner.is_verified AS owner_is_verified,
            COALESCE(r.name, req.submitted_restaurant_name) AS restaurant_name
        FROM tbl_owner_password_reset_requests AS req
        INNER JOIN tbl_users AS owner
            ON owner.user_id = req.owner_id
        LEFT JOIN tbl_restaurants AS r
            ON r.restaurant_id = req.restaurant_id
        WHERE req.request_id = ?
        LIMIT 1
        FOR UPDATE
    ");

    if (!$requestStmt) {
        throw new RuntimeException("Unable to prepare recovery request review.");
    }

    $requestStmt->bind_param("i", $requestId);
    $requestStmt->execute();
    $request = $requestStmt->get_result()->fetch_assoc();
    $requestStmt->close();

    if (!$request) {
        $conn->rollback();
        owner_reset_review_respond([
            "success" => false,
            "message" => "The password recovery request was not found."
        ], 404);
    }

    if ((string)$request["request_status"] !== "pending") {
        $conn->rollback();
        owner_reset_review_respond([
            "success" => false,
            "message" => "This password recovery request has already been reviewed."
        ], 409);
    }

    $ownerId = (int)$request["owner_id"];
    $restaurantId = (int)($request["restaurant_id"] ?? 0);
    $ownerName = trim((string)$request["owner_name"]);
    $restaurantName = trim((string)$request["restaurant_name"]);

    if (strtolower(trim((string)$request["owner_role"])) !== "owner") {
        throw new RuntimeException("Recovery target is not an owner account.");
    }

    if ($action === "reject") {
        $rejectStmt = $conn->prepare("
            UPDATE tbl_owner_password_reset_requests
            SET request_status = 'rejected',
                review_note = ?,
                reviewed_by = ?,
                reviewed_at = NOW()
            WHERE request_id = ?
              AND request_status = 'pending'
        ");

        if (!$rejectStmt) {
            throw new RuntimeException("Unable to prepare request rejection.");
        }

        $rejectStmt->bind_param("sii", $reviewNote, $adminId, $requestId);
        $rejectStmt->execute();
        $rejectStmt->close();

        if ($restaurantId > 0) {
            $logDescription =
                (string)$admin["full_name"] .
                " rejected the owner password recovery request for " .
                ($restaurantName !== "" ? $restaurantName : $ownerName) .
                ". Reason: " . $reviewNote;

            $logStmt = $conn->prepare("
                INSERT INTO tbl_activity_logs (
                    restaurant_id,
                    user_id,
                    user_role,
                    action_type,
                    action_title,
                    action_description
                ) VALUES (?, ?, 'admin', 'owner_password_reset', 'Owner Password Reset Rejected', ?)
            ");

            if ($logStmt) {
                $logStmt->bind_param("iis", $restaurantId, $adminId, $logDescription);
                $logStmt->execute();
                $logStmt->close();
            }
        }

        $conn->commit();

        owner_reset_review_respond([
            "success" => true,
            "message" => "The owner password recovery request was rejected.",
            "request_id" => (int)$requestId,
            "request_status" => "rejected"
        ]);
    }

    if ((int)$request["owner_status"] !== 1 || (int)$request["owner_is_verified"] !== 1) {
        $conn->rollback();
        owner_reset_review_respond([
            "success" => false,
            "message" => "This owner account is inactive or unverified. Resolve the account status before issuing a temporary password."
        ], 409);
    }

    $temporaryPassword = generate_owner_temporary_password(14);
    $passwordHash = password_hash($temporaryPassword, PASSWORD_DEFAULT);

    if ($passwordHash === false) {
        throw new RuntimeException("Unable to securely generate the temporary password.");
    }

    $ownerUpdateStmt = $conn->prepare("
        UPDATE tbl_users
        SET password_hash = ?,
            must_change_password = 1,
            remember_token_hash = NULL,
            remember_token_expires = NULL,
            reset_token_hash = NULL,
            reset_token_expires = NULL
        WHERE user_id = ?
          AND role = 'owner'
          AND status = 1
          AND is_verified = 1
    ");

    if (!$ownerUpdateStmt) {
        throw new RuntimeException("Unable to prepare the owner password reset.");
    }

    $ownerUpdateStmt->bind_param("si", $passwordHash, $ownerId);
    $ownerUpdateStmt->execute();

    if ((int)$ownerUpdateStmt->affected_rows !== 1) {
        $ownerUpdateStmt->close();
        throw new RuntimeException("The owner account could not be updated.");
    }

    $ownerUpdateStmt->close();

    /* Revoke remembered owner browsers. The temporary password must be used again. */
    $trustedDeleteStmt = $conn->prepare("
        DELETE FROM tbl_owner_trusted_devices
        WHERE owner_id = ?
    ");

    if ($trustedDeleteStmt) {
        $trustedDeleteStmt->bind_param("i", $ownerId);
        $trustedDeleteStmt->execute();
        $trustedDeleteStmt->close();
    }

    $approvalNote = $reviewNote !== ""
        ? $reviewNote
        : "Temporary password issued and emailed automatically to the registered owner email.";

    $approveStmt = $conn->prepare("
        UPDATE tbl_owner_password_reset_requests
        SET request_status = 'approved',
            review_note = ?,
            reviewed_by = ?,
            reviewed_at = NOW()
        WHERE request_id = ?
          AND request_status = 'pending'
    ");

    if (!$approveStmt) {
        throw new RuntimeException("Unable to prepare request approval.");
    }

    $approveStmt->bind_param("sii", $approvalNote, $adminId, $requestId);
    $approveStmt->execute();
    $approveStmt->close();

    /* Any stale duplicate pending request for this owner becomes superseded. */
    $supersedeStmt = $conn->prepare("
        UPDATE tbl_owner_password_reset_requests
        SET request_status = 'rejected',
            review_note = 'Superseded by an approved password recovery request.',
            reviewed_by = ?,
            reviewed_at = NOW()
        WHERE owner_id = ?
          AND request_id <> ?
          AND request_status = 'pending'
    ");

    if ($supersedeStmt) {
        $supersedeStmt->bind_param("iii", $adminId, $ownerId, $requestId);
        $supersedeStmt->execute();
        $supersedeStmt->close();
    }

    if ($restaurantId > 0) {
        $logDescription =
            (string)$admin["full_name"] .
            " approved the owner password recovery request for " .
            ($restaurantName !== "" ? $restaurantName : $ownerName) .
            ". A temporary password was issued and sent automatically to the registered owner email. The owner must create a new private password at the next login.";

        $logStmt = $conn->prepare("
            INSERT INTO tbl_activity_logs (
                restaurant_id,
                user_id,
                user_role,
                action_type,
                action_title,
                action_description
            ) VALUES (?, ?, 'admin', 'owner_password_reset', 'Owner Password Reset Approved', ?)
        ");

        if ($logStmt) {
            $logStmt->bind_param("iis", $restaurantId, $adminId, $logDescription);
            $logStmt->execute();
            $logStmt->close();
        }
    }

    $ownerEmail = trim((string)$request["owner_email"]);
    $emailSubject = "FoodConnect - Owner Password Reset Approved";
    $emailBody = build_owner_temporary_password_email(
        $ownerName,
        $restaurantName,
        $temporaryPassword
    );

    /*
     * Delivery is part of approval. If SMTP fails, roll back the password
     * replacement and keep the request pending so the owner is never locked
     * out with a temporary password they did not receive.
     */
    if (!sendBrevoSMTP($ownerEmail, $emailSubject, $emailBody)) {
        throw new RuntimeException(
            "Unable to send the owner temporary password email."
        );
    }

    $conn->commit();

    owner_reset_review_respond([
        "success" => true,
        "message" => "Password reset approved. The temporary password was sent automatically to the owner's registered email.",
        "request_id" => (int)$requestId,
        "request_status" => "approved",
        "owner_name" => $ownerName,
        "owner_email" => $ownerEmail,
        "restaurant_name" => $restaurantName,
        "email_sent" => true,
        "must_change_password" => true
    ]);
} catch (Throwable $error) {
    try {
        $conn->rollback();
    } catch (Throwable $ignored) {
    }

    error_log(
        "review_owner_password_reset_request.php error: " .
        $error->getMessage()
    );

    $safeMessage = $error->getMessage() ===
        "Unable to send the owner temporary password email."
            ? "The temporary password email could not be sent. No password reset was applied and the request remains pending. Please verify the mail service and try again."
            : "Unable to review the owner password recovery request right now.";

    owner_reset_review_respond([
        "success" => false,
        "message" => $safeMessage
    ], 500);
}
