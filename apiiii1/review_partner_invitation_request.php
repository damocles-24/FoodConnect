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

function respond_json(array $data, int $statusCode = 200): void {
    http_response_code($statusCode);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function escape_html(string $value): string {
    return htmlspecialchars($value, ENT_QUOTES, "UTF-8");
}

if (strtoupper((string) ($_SERVER["REQUEST_METHOD"] ?? "")) !== "POST") {
    header("Allow: POST");
    respond_json(["success" => false, "message" => "This action is not available."], 405);
}

if (empty($_SESSION["user_id"]) || strtolower(trim((string) ($_SESSION["role"] ?? ""))) !== "admin") {
    respond_json(["success" => false, "message" => "Administrator authentication is required."], 401);
}

$adminId = (int) $_SESSION["user_id"];
$input = json_decode(file_get_contents("php://input"), true);
if (!is_array($input)) {
    respond_json(["success" => false, "message" => "Invalid request data."], 400);
}

$requestId = (int) ($input["request_id"] ?? 0);
$decision = strtolower(trim((string) ($input["decision"] ?? "")));
$rejectionReason = trim((string) ($input["rejection_reason"] ?? ""));

if ($requestId <= 0 || !in_array($decision, ["approve", "reject"], true)) {
    respond_json(["success" => false, "message" => "Select a valid partner request and decision."], 422);
}
if ($decision === "reject" && mb_strlen($rejectionReason) < 10) {
    respond_json(["success" => false, "message" => "Enter a clear rejection reason with at least 10 characters."], 422);
}
if (mb_strlen($rejectionReason) > 1000) {
    respond_json(["success" => false, "message" => "The rejection reason is too long."], 422);
}

$conn->begin_transaction();
try {
    $stmt = $conn->prepare("SELECT request_id, full_name, email, intended_restaurant, request_status FROM tbl_partner_invitation_requests WHERE request_id = ? LIMIT 1 FOR UPDATE");
    if (!$stmt) throw new RuntimeException("Unable to load the partner request.");
    $stmt->bind_param("i", $requestId);
    if (!$stmt->execute()) { $stmt->close(); throw new RuntimeException("Unable to load the partner request."); }
    $request = $stmt->get_result()->fetch_assoc();
    $stmt->close();
    if (!$request) throw new RuntimeException("Partner request not found.");
    if (strtolower((string) $request["request_status"]) !== "pending") throw new RuntimeException("This partner request has already been reviewed.");

    $fullName = trim((string) $request["full_name"]);
    $email = strtolower(trim((string) $request["email"]));
    $restaurant = trim((string) $request["intended_restaurant"]);

    $userStmt = $conn->prepare("SELECT user_id FROM tbl_users WHERE LOWER(email) = ? LIMIT 1");
    if (!$userStmt) throw new RuntimeException("Unable to verify the applicant email.");
    $userStmt->bind_param("s", $email);
    if (!$userStmt->execute()) { $userStmt->close(); throw new RuntimeException("Unable to verify the applicant email."); }
    $existingUser = $userStmt->get_result()->fetch_assoc();
    $userStmt->close();
    if ($existingUser) throw new RuntimeException("This email is already registered in FoodConnect.");

    if ($decision === "reject") {
        $update = $conn->prepare("UPDATE tbl_partner_invitation_requests SET request_status='rejected', reviewed_by=?, reviewed_at=NOW(), rejection_reason=? WHERE request_id=? AND request_status='pending'");
        if (!$update) throw new RuntimeException("Unable to reject the partner request.");
        $update->bind_param("isi", $adminId, $rejectionReason, $requestId);
    } else {
        $update = $conn->prepare("UPDATE tbl_partner_invitation_requests SET request_status='approved', reviewed_by=?, reviewed_at=NOW(), rejection_reason=NULL WHERE request_id=? AND request_status='pending'");
        if (!$update) throw new RuntimeException("Unable to approve the partner request.");
        $update->bind_param("ii", $adminId, $requestId);
    }

    if (!$update->execute()) { $update->close(); throw new RuntimeException("Unable to update the partner request."); }
    if ($update->affected_rows !== 1) { $update->close(); throw new RuntimeException("The partner request could not be updated."); }
    $update->close();
    $conn->commit();
} catch (Throwable $error) {
    try { $conn->rollback(); } catch (Throwable $ignored) {}

    $errorMessage = $error->getMessage();
    error_log("review_partner_invitation_request.php error: " . $errorMessage);

    $safeErrors = [
        "Partner request not found." => 404,
        "This partner request has already been reviewed." => 409,
        "This email is already registered in FoodConnect." => 409
    ];

    if (isset($safeErrors[$errorMessage])) {
        respond_json(["success" => false, "message" => $errorMessage], $safeErrors[$errorMessage]);
    }

    respond_json([
        "success" => false,
        "message" => "Unable to review the partner request right now."
    ], 500);
}

$safeName = escape_html($fullName);
$safeRestaurant = escape_html($restaurant);
if ($decision === "approve") {
    $registrationLink = foodconnect_url("frontend/html/partner_apply.html");
    $subject = "Your FoodConnect partner request was approved";
    $body = "<div style='max-width:680px;margin:0 auto;padding:24px;font-family:Arial,sans-serif;color:#1f2937;line-height:1.6'><h2>FoodConnect Partner Request Approved</h2><p>Hello {$safeName},</p><p>Your request to register <strong>{$safeRestaurant}</strong> has been approved.</p><p>You may now create your owner account. After registration, verify your email and complete the restaurant setup wizard.</p><p style='margin:28px 0'><a href='{$registrationLink}' style='display:inline-block;padding:13px 20px;background:#f58220;color:#fff;text-decoration:none;border-radius:10px;font-weight:700'>Create Owner Account</a></p><p>For future owner logins, FoodConnect will send a temporary verification code to your email after your password is accepted.</p></div>";
} else {
    $safeReason = nl2br(escape_html($rejectionReason));
    $subject = "FoodConnect partner request update";
    $body = "<div style='max-width:680px;margin:0 auto;padding:24px;font-family:Arial,sans-serif;color:#1f2937;line-height:1.6'><h2>FoodConnect Partner Request Update</h2><p>Hello {$safeName},</p><p>We are unable to approve the request for <strong>{$safeRestaurant}</strong> at this time.</p><p><strong>Reason:</strong><br>{$safeReason}</p></div>";
}

$emailSent = sendBrevoSMTP($email, $subject, $body);
respond_json([
    "success" => true,
    "message" => $decision === "approve"
        ? ($emailSent ? "Partner request approved. Registration instructions were emailed." : "Partner request approved, but the email could not be sent.")
        : ($emailSent ? "Partner request rejected and the applicant was emailed." : "Partner request rejected, but the email could not be sent."),
    "email_sent" => $emailSent,
    "request_id" => $requestId,
    "decision" => $decision,
    "assigned_email" => $email,
    "intended_restaurant" => $restaurant
], 200);
