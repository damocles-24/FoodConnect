<?php

header("Content-Type: application/json; charset=utf-8");
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Pragma: no-cache");

error_reporting(E_ALL & ~E_NOTICE & ~E_WARNING);
ini_set("display_errors", "0");

require_once __DIR__ . "/session_config.php";
require_once __DIR__ . "/db.php";
require_once __DIR__ . "/ph_phone.php";

function owner_reset_admin_respond(array $payload, int $code = 200): void
{
    http_response_code($code);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

if (strtoupper((string)($_SERVER["REQUEST_METHOD"] ?? "")) !== "GET") {
    owner_reset_admin_respond([
        "success" => false,
        "message" => "This action is not available."
    ], 405);
}

$adminId = (int)($_SESSION["user_id"] ?? 0);
$sessionRole = strtolower(trim((string)($_SESSION["role"] ?? "")));

if ($adminId <= 0 || $sessionRole !== "admin") {
    owner_reset_admin_respond([
        "success" => false,
        "message" => "Administrator authentication is required."
    ], 401);
}

$adminStmt = $conn->prepare("
    SELECT user_id, role, status, is_verified
    FROM tbl_users
    WHERE user_id = ?
    LIMIT 1
");

if (!$adminStmt) {
    owner_reset_admin_respond([
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
    owner_reset_admin_respond([
        "success" => false,
        "message" => "Your administrator account is invalid or inactive."
    ], 403);
}

try {
    $summaryResult = $conn->query("
        SELECT
            COUNT(*) AS total_requests,
            SUM(request_status = 'pending') AS pending_requests,
            SUM(request_status = 'approved') AS approved_requests,
            SUM(request_status = 'rejected') AS rejected_requests
        FROM tbl_owner_password_reset_requests
    ");

    if (!$summaryResult) {
        throw new RuntimeException("Unable to load recovery request summary.");
    }

    $summary = $summaryResult->fetch_assoc() ?: [];

    $requestResult = $conn->query("
        SELECT
            req.request_id,
            req.owner_id,
            req.restaurant_id,
            req.submitted_email,
            req.submitted_contact_number,
            req.submitted_restaurant_name,
            req.reason,
            req.request_status,
            req.review_note,
            req.reviewed_by,
            req.reviewed_at,
            req.created_at,
            req.updated_at,
            owner.full_name AS owner_name,
            owner.email AS owner_email,
            owner.contact_number AS owner_contact_number,
            owner.status AS owner_status,
            owner.is_verified AS owner_is_verified,
            COALESCE(r.name, pa.restaurant_name, '') AS actual_restaurant_name,
            reviewer.full_name AS reviewer_name
        FROM tbl_owner_password_reset_requests AS req
        INNER JOIN tbl_users AS owner
            ON owner.user_id = req.owner_id
           AND owner.role = 'owner'
        LEFT JOIN tbl_restaurants AS r
            ON r.restaurant_id = req.restaurant_id
        LEFT JOIN tbl_partner_applications AS pa
            ON pa.owner_id = req.owner_id
        LEFT JOIN tbl_users AS reviewer
            ON reviewer.user_id = req.reviewed_by
        ORDER BY
            CASE req.request_status
                WHEN 'pending' THEN 0
                ELSE 1
            END,
            req.created_at DESC,
            req.request_id DESC
        LIMIT 250
    ");

    if (!$requestResult) {
        throw new RuntimeException("Unable to load recovery requests.");
    }

    $requests = [];

    while ($row = $requestResult->fetch_assoc()) {
        $row["request_id"] = (int)$row["request_id"];
        $row["owner_id"] = (int)$row["owner_id"];
        $row["restaurant_id"] = $row["restaurant_id"] !== null
            ? (int)$row["restaurant_id"]
            : null;
        $row["owner_status"] = (int)$row["owner_status"];
        $row["owner_is_verified"] = (int)$row["owner_is_verified"];
        $row["submitted_contact_number"] = ph_mobile_for_output($row["submitted_contact_number"] ?? "");
        $row["owner_contact_number"] = ph_mobile_for_output($row["owner_contact_number"] ?? "");
        $requests[] = $row;
    }

    owner_reset_admin_respond([
        "success" => true,
        "summary" => [
            "total_requests" => (int)($summary["total_requests"] ?? 0),
            "pending_requests" => (int)($summary["pending_requests"] ?? 0),
            "approved_requests" => (int)($summary["approved_requests"] ?? 0),
            "rejected_requests" => (int)($summary["rejected_requests"] ?? 0)
        ],
        "requests" => $requests
    ]);
} catch (Throwable $error) {
    error_log(
        "get_owner_password_reset_requests.php error: " .
        $error->getMessage()
    );

    owner_reset_admin_respond([
        "success" => false,
        "message" => "Unable to load owner password recovery requests right now."
    ], 500);
}
