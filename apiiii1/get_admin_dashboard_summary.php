<?php
header("Content-Type: application/json; charset=utf-8");
header("Cache-Control: no-store, no-cache, must-revalidate");
require_once __DIR__ . "/session_config.php";
require_once __DIR__ . "/db.php";

function respond($data, $code = 200) {
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

$adminId = isset($_SESSION['user_id']) ? (int)$_SESSION['user_id'] : 0;
$role = isset($_SESSION['role']) ? strtolower(trim($_SESSION['role'])) : '';

if ($adminId <= 0 || $role !== 'admin') {
    respond(['success'=>false, 'message'=>'Unauthorized'], 401);
}

try {
    $submitted = $conn->query("SELECT COUNT(*) c FROM tbl_partner_applications WHERE application_status IN ('submitted','email_pending','needs_changes','draft')")->fetch_assoc()['c'];
    $approved = $conn->query("SELECT COUNT(*) c FROM tbl_partner_applications WHERE application_status='approved'")->fetch_assoc()['c'];
    $users = $conn->query("SELECT COUNT(*) c FROM tbl_users")->fetch_assoc()['c'];
    $logs = $conn->query("SELECT COUNT(*) c FROM tbl_activity_logs")->fetch_assoc()['c'];

    respond([
        'success'=>true,
        'summary'=>[
            'submitted_applications'=>(int)$submitted,
            'approved_restaurants'=>(int)$approved,
            'total_users'=>(int)$users,
            'total_logs'=>(int)$logs
        ]
    ]);
} catch (Throwable $e) {
    respond(['success'=>false,'message'=>'Failed loading dashboard summary'],500);
}
?>
