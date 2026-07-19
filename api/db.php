<?php
// api/db.php
// Creates $conn (mysqli). Include this file inside endpoints.

require_once __DIR__ . "/config.php";

$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

if ($conn->connect_error) {
  http_response_code(500);
  header("Content-Type: application/json; charset=utf-8");
  echo json_encode(["error" => "Database connection failed"]);
  exit;
}

$conn->set_charset("utf8mb4");