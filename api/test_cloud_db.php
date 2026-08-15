<?php

declare(strict_types=1);

header(
    "Content-Type: application/json; charset=utf-8"
);

header(
    "Cache-Control: no-store, no-cache, must-revalidate, max-age=0"
);

require_once __DIR__ . "/db.php";

/*
 * Temporary diagnostic endpoint.
 * It deliberately returns no password/host credentials.
 */

$result = $conn->query("
    SELECT
        DATABASE() AS database_name,
        VERSION() AS mysql_version,
        @@hostname AS mysql_host
");

if (!$result) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" =>
            "Connected, but the verification query failed."
    ]);
    exit;
}

$row = $result->fetch_assoc();

$tableResult = $conn->query("
    SELECT COUNT(*) AS table_count
    FROM information_schema.tables
    WHERE table_schema = DATABASE()
      AND table_type = 'BASE TABLE'
");

$tableRow =
    $tableResult
        ? $tableResult->fetch_assoc()
        : ["table_count" => null];

echo json_encode([
    "success" => true,
    "message" =>
        "FoodConnect is connected to the configured database.",
    "database" =>
        $row["database_name"] ?? null,
    "mysql_version" =>
        $row["mysql_version"] ?? null,
    "table_count" =>
        isset($tableRow["table_count"])
            ? (int)$tableRow["table_count"]
            : null,
    "ssl" =>
        true
], JSON_UNESCAPED_SLASHES);
