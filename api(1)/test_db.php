<?php
header("Content-Type: application/json; charset=utf-8");
require_once __DIR__ . "/db.php";

$res = $conn->query("SELECT COUNT(*) AS total FROM tbl_users");
$row = $res->fetch_assoc();

echo json_encode([
  "connected" => true,
  "db" => DB_NAME,
  "users_count" => (int)$row["total"]
]);