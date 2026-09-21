<?php
declare(strict_types=1);

header("Content-Type: application/json; charset=utf-8");
header("Cache-Control: no-store");

require_once __DIR__ . "/session_config.php";
require_once __DIR__ . "/db.php";

function out(array $data, int $status = 200): void
{
    http_response_code($status);
    echo json_encode(
        $data,
        JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES
    );
    exit;
}

function ensure_private_verification_root(string $root): void
{
    if (!is_dir($root) && !mkdir($root, 0750, true)) {
        out([
            "success" => false,
            "message" => "Unable to create the secure upload folder."
        ], 500);
    }

    $denyFile = $root . "/.htaccess";

    if (is_file($denyFile)) {
        return;
    }

    $rules = <<<'HTACCESS'
# FoodConnect private restaurant verification documents.
# These files must only be served through the authenticated PHP viewer.

Options -Indexes

<IfModule mod_authz_core.c>
    Require all denied
</IfModule>

<IfModule !mod_authz_core.c>
    Order Allow,Deny
    Deny from all
</IfModule>
HTACCESS;

    if (file_put_contents($denyFile, $rules . PHP_EOL, LOCK_EX) === false) {
        out([
            "success" => false,
            "message" => "Unable to secure the verification upload folder."
        ], 500);
    }

    @chmod($denyFile, 0640);
}

if (($_SERVER["REQUEST_METHOD"] ?? "") !== "POST") {
    out([
        "success" => false,
        "message" => "This action is not available."
    ], 405);
}

if (
    empty($_SESSION["user_id"]) ||
    !in_array(
        strtolower((string) ($_SESSION["role"] ?? "")),
        ["owner", "partner_applicant"],
        true
    )
) {
    out([
        "success" => false,
        "message" => "Owner authentication is required."
    ], 401);
}

$ownerId = (int) $_SESSION["user_id"];
$type = trim((string) ($_POST["document_type"] ?? ""));

$allowed = [
    "bir_2303" => "BIR Form 2303",
    "restaurant_menu" => "Restaurant / Dine-in Menu",
    "applicant_id" => "Applicant Identification Document"
];

if (!isset($allowed[$type])) {
    out([
        "success" => false,
        "message" => "Invalid document type."
    ], 422);
}

if (
    !isset($_FILES["document"]) ||
    !is_array($_FILES["document"]) ||
    ($_FILES["document"]["error"] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK
) {
    out([
        "success" => false,
        "message" => "Select a valid document to upload."
    ], 422);
}

$file = $_FILES["document"];
$fileSize = (int) ($file["size"] ?? 0);

if ($fileSize <= 0 || $fileSize > 5 * 1024 * 1024) {
    out([
        "success" => false,
        "message" => "Document must be 5 MB or smaller."
    ], 422);
}

$tmpName = (string) ($file["tmp_name"] ?? "");

if ($tmpName === "" || !is_uploaded_file($tmpName)) {
    out([
        "success" => false,
        "message" => "Select a valid document to upload."
    ], 422);
}

$finfo = new finfo(FILEINFO_MIME_TYPE);
$mime = (string) $finfo->file($tmpName);

$extensions = [
    "application/pdf" => "pdf",
    "image/jpeg" => "jpg",
    "image/png" => "png"
];

if (!isset($extensions[$mime])) {
    out([
        "success" => false,
        "message" => "Only PDF, JPG, and PNG files are allowed."
    ], 422);
}

$stmt = $conn->prepare(
    "SELECT application_id, application_status
     FROM tbl_partner_applications
     WHERE owner_id = ?
     ORDER BY application_id DESC
     LIMIT 1"
);
$stmt->bind_param("i", $ownerId);
$stmt->execute();
$app = $stmt->get_result()->fetch_assoc();
$stmt->close();

if (!$app) {
    out([
        "success" => false,
        "message" => "Restaurant application not found."
    ], 404);
}

if (
    !in_array(
        strtolower((string) $app["application_status"]),
        ["email_pending", "draft", "needs_changes"],
        true
    )
) {
    out([
        "success" => false,
        "message" => "Documents cannot be changed while this application is under review."
    ], 409);
}

$appId = (int) $app["application_id"];

$verificationRoot = __DIR__ . "/uploads/restaurant_verification";
ensure_private_verification_root($verificationRoot);

$dir = $verificationRoot . "/owner_{$ownerId}/application_{$appId}";

if (!is_dir($dir) && !mkdir($dir, 0750, true)) {
    out([
        "success" => false,
        "message" => "Unable to create the secure upload folder."
    ], 500);
}

$filename =
    $type . "_" .
    date("Ymd_His") . "_" .
    bin2hex(random_bytes(6)) . "." .
    $extensions[$mime];

$absolute = $dir . "/" . $filename;

if (!move_uploaded_file($tmpName, $absolute)) {
    out([
        "success" => false,
        "message" => "Unable to save the uploaded document."
    ], 500);
}

@chmod($absolute, 0640);

$relative =
    "uploads/restaurant_verification/" .
    "owner_{$ownerId}/application_{$appId}/{$filename}";

$originalName = basename((string) ($file["name"] ?? "document"));
$original = function_exists("mb_substr")
    ? mb_substr($originalName, 0, 190)
    : substr($originalName, 0, 190);

$conn->begin_transaction();

try {
    $documentId = 0;

    if ($type === "restaurant_menu") {
        /*
         * Restaurant menus may span multiple images/pages.
         * Each upload is stored as a separate verification document.
         */
        $insert = $conn->prepare(
            "INSERT INTO tbl_partner_application_documents
                (application_id, owner_id, document_type, original_name, file_path, mime_type, file_size)
             VALUES (?, ?, ?, ?, ?, ?, ?)"
        );
        $insert->bind_param(
            "iissssi",
            $appId,
            $ownerId,
            $type,
            $original,
            $relative,
            $mime,
            $fileSize
        );
        $insert->execute();
        $documentId = (int) $conn->insert_id;
        $insert->close();
    } else {
        /*
         * BIR Form 2303 and Applicant ID remain single-file document types.
         * Uploading them again replaces the previous file, matching the
         * existing FoodConnect behavior.
         */
        $old = $conn->prepare(
            "SELECT document_id, file_path
             FROM tbl_partner_application_documents
             WHERE application_id = ? AND document_type = ?
             ORDER BY document_id DESC
             LIMIT 1
             FOR UPDATE"
        );
        $old->bind_param("is", $appId, $type);
        $old->execute();
        $existing = $old->get_result()->fetch_assoc();
        $old->close();

        if ($existing) {
            $update = $conn->prepare(
                "UPDATE tbl_partner_application_documents
                 SET original_name = ?,
                     file_path = ?,
                     mime_type = ?,
                     file_size = ?,
                     uploaded_at = NOW()
                 WHERE document_id = ? AND application_id = ?"
            );

            $documentId = (int) $existing["document_id"];
            $update->bind_param(
                "sssiii",
                $original,
                $relative,
                $mime,
                $fileSize,
                $documentId,
                $appId
            );
            $update->execute();
            $update->close();

            $oldRelative = ltrim((string) $existing["file_path"], "/\\");
            $oldPath = __DIR__ . "/" . $oldRelative;
            $rootReal = realpath($verificationRoot);
            $oldReal = is_file($oldPath) ? realpath($oldPath) : false;
            $newReal = realpath($absolute);

            if (
                $rootReal !== false &&
                $oldReal !== false &&
                $newReal !== false &&
                str_starts_with(
                    $oldReal,
                    rtrim($rootReal, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR
                ) &&
                $oldReal !== $newReal
            ) {
                @unlink($oldReal);
            }
        } else {
            $insert = $conn->prepare(
                "INSERT INTO tbl_partner_application_documents
                    (application_id, owner_id, document_type, original_name, file_path, mime_type, file_size)
                 VALUES (?, ?, ?, ?, ?, ?, ?)"
            );
            $insert->bind_param(
                "iissssi",
                $appId,
                $ownerId,
                $type,
                $original,
                $relative,
                $mime,
                $fileSize
            );
            $insert->execute();
            $documentId = (int) $conn->insert_id;
            $insert->close();
        }
    }

    $conn->commit();
} catch (Throwable $error) {
    $conn->rollback();
    @unlink($absolute);

    error_log(
        "Restaurant verification upload database error: " .
        $error->getMessage()
    );

    out([
        "success" => false,
        "message" => "Unable to record the uploaded document."
    ], 500);
}

out([
    "success" => true,
    "document" => [
        "document_id" => $documentId,
        "document_type" => $type,
        "label" => $allowed[$type],
        "original_name" => $original
    ]
]);
