<?php
declare(strict_types=1);

require_once __DIR__ . "/session_config.php";
require_once __DIR__ . "/db.php";

header("Cache-Control: private, no-store, max-age=0");
header("Pragma: no-cache");
header("X-Content-Type-Options: nosniff");
header("X-Frame-Options: SAMEORIGIN");
header("Referrer-Policy: no-referrer");

if (empty($_SESSION["user_id"])) {
    http_response_code(401);
    exit("Authentication required.");
}

$userId = (int) $_SESSION["user_id"];
$role = strtolower((string) ($_SESSION["role"] ?? ""));
$documentId = (int) ($_GET["document_id"] ?? 0);

if ($documentId <= 0) {
    http_response_code(404);
    exit("Document not found.");
}

$stmt = $conn->prepare(
    "SELECT
        d.file_path,
        d.original_name,
        d.mime_type,
        d.owner_id,
        d.application_id
     FROM tbl_partner_application_documents d
     WHERE d.document_id = ?
     LIMIT 1"
);
$stmt->bind_param("i", $documentId);
$stmt->execute();
$document = $stmt->get_result()->fetch_assoc();
$stmt->close();

if (!$document) {
    http_response_code(404);
    exit("Document not found.");
}

$isAdmin = $role === "admin";
$isOwner =
    in_array($role, ["owner", "partner_applicant"], true) &&
    (int) $document["owner_id"] === $userId;

if (!$isAdmin && !$isOwner) {
    http_response_code(403);
    exit("Access denied.");
}

$allowedMimeTypes = [
    "application/pdf",
    "image/jpeg",
    "image/png"
];

$mimeType = strtolower(trim((string) $document["mime_type"]));

if (!in_array($mimeType, $allowedMimeTypes, true)) {
    http_response_code(415);
    exit("Unsupported document type.");
}

$verificationRoot = __DIR__ . "/uploads/restaurant_verification";
$verificationRootReal = realpath($verificationRoot);

if ($verificationRootReal === false) {
    http_response_code(404);
    exit("File not found.");
}

$storedRelativePath = ltrim((string) $document["file_path"], "/\\");
$expectedPrefix = "uploads/restaurant_verification/";

if (!str_starts_with($storedRelativePath, $expectedPrefix)) {
    error_log(
        "Blocked verification document path outside private root for document_id=" .
        $documentId
    );

    http_response_code(404);
    exit("File not found.");
}

$path = realpath(__DIR__ . "/" . $storedRelativePath);
$rootPrefix =
    rtrim($verificationRootReal, DIRECTORY_SEPARATOR) .
    DIRECTORY_SEPARATOR;

if (
    $path === false ||
    !is_file($path) ||
    !str_starts_with($path, $rootPrefix)
) {
    http_response_code(404);
    exit("File not found.");
}

$fileSize = filesize($path);

if ($fileSize === false) {
    http_response_code(404);
    exit("File not found.");
}

$downloadName = basename((string) $document["original_name"]);
$downloadName = preg_replace('/[\r\n"\\]+/', "", $downloadName) ?: "document";

header("Content-Type: " . $mimeType);
header("Content-Length: " . (string) $fileSize);
header(
    "Content-Disposition: inline; filename=\"" .
    $downloadName .
    "\""
);

readfile($path);
exit;
