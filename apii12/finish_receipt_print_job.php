<?php

header("Content-Type: application/json; charset=utf-8");
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");

error_reporting(E_ALL & ~E_NOTICE & ~E_WARNING);
ini_set("display_errors", "0");

session_set_cookie_params(
    0,
    "/",
    "",
    false,
    true
);

require_once __DIR__ . "/session_config.php";
require_once __DIR__ . "/db.php";

function respond_json(array $data, int $statusCode = 200): void
{
    http_response_code($statusCode);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

if (!isset($conn) || !($conn instanceof mysqli)) {
    respond_json([
        "success" => false,
        "message" => "Service is temporarily unavailable. Please try again shortly."
    ], 500);
}

if (empty($_SESSION["user_id"]) || empty($_SESSION["restaurant_id"])) {
    $conn->close();

    respond_json([
        "success" => false,
        "message" => "Your session has expired or you do not have access. Please log in again."
    ], 401);
}

$userId = (int)$_SESSION["user_id"];
$restaurantId = (int)$_SESSION["restaurant_id"];
$role = strtolower(trim((string)($_SESSION["role"] ?? "")));

if (!in_array($role, ["cashier", "owner"], true)) {
    $conn->close();

    respond_json([
        "success" => false,
        "message" => "You are not authorized to finish receipt print jobs."
    ], 403);
}

$rawInput = file_get_contents("php://input");
$data = json_decode($rawInput, true);

if (!is_array($data)) {
    $data = $_POST;
}

$printJobId = (int)($data["print_job_id"] ?? 0);

if ($printJobId <= 0) {
    $conn->close();

    respond_json([
        "success" => false,
        "message" => "Invalid receipt print job."
    ], 400);
}

$stmt = $conn->prepare("
    UPDATE tbl_receipt_print_jobs
    SET
        status = 'processed',
        processed_at = NOW()
    WHERE print_job_id = ?
      AND restaurant_id = ?
      AND claimed_by_user_id = ?
      AND status = 'processing'
");

if (!$stmt) {
    $conn->close();

    respond_json([
        "success" => false,
        "message" => "Unable to prepare receipt print completion."
    ], 500);
}

$stmt->bind_param(
    "iii",
    $printJobId,
    $restaurantId,
    $userId
);

if (!$stmt->execute()) {
    $stmt->close();
    $conn->close();

    respond_json([
        "success" => false,
        "message" => "Unable to finish receipt print job."
    ], 500);
}

$updated = $stmt->affected_rows;
$stmt->close();
$conn->close();

if ($updated !== 1) {
    respond_json([
        "success" => false,
        "message" => "The receipt print job is no longer available."
    ], 409);
}

respond_json([
    "success" => true,
    "message" => "Receipt print job processed successfully."
]);
