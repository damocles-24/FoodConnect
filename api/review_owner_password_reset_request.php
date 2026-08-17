<?php

header("Content-Type: application/json; charset=utf-8");
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Pragma: no-cache");

error_reporting(E_ALL & ~E_NOTICE & ~E_WARNING);
ini_set("display_errors", "0");

require_once __DIR__ . "/session_config.php";
require_once __DIR__ . "/db.php";
require_once __DIR__ . "/rate_limit.php";

function owner_reset_review_respond(array $payload, int $code = 200): void
{
    http_response_code($code);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
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
        : "Temporary password issued by administrator.";

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
            ". A temporary password was issued and the owner must create a new private password at the next login.";

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

    $conn->commit();

    owner_reset_review_respond([
        "success" => true,
        "message" => "Temporary password generated. Give it directly to the verified restaurant owner. It will not be shown again after you close this message.",
        "request_id" => (int)$requestId,
        "request_status" => "approved",
        "owner_name" => $ownerName,
        "restaurant_name" => $restaurantName,
        "temporary_password" => $temporaryPassword,
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

    owner_reset_review_respond([
        "success" => false,
        "message" => "Unable to review the owner password recovery request right now."
    ], 500);
}
