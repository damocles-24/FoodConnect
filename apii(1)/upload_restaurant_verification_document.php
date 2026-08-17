<?php
declare(strict_types=1);
header("Content-Type: application/json; charset=utf-8");
header("Cache-Control: no-store");
require_once __DIR__ . "/session_config.php";
require_once __DIR__ . "/db.php";
function out(array $d, int $s=200): void { http_response_code($s); echo json_encode($d, JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES); exit; }
if (($_SERVER["REQUEST_METHOD"] ?? "") !== "POST") out(["success"=>false,"message"=>"This action is not available."],405);
if (empty($_SESSION["user_id"]) || strtolower((string)($_SESSION["role"]??"")) !== "owner") out(["success"=>false,"message"=>"Owner authentication is required."],401);
$ownerId=(int)$_SESSION["user_id"];
$type=trim((string)($_POST["document_type"]??""));
$allowed=["bir_2303"=>"BIR Form 2303","restaurant_menu"=>"Restaurant / Dine-in Menu","applicant_id"=>"Applicant Identification Document"];
if (!isset($allowed[$type])) out(["success"=>false,"message"=>"Invalid document type."],422);
if (!isset($_FILES["document"]) || !is_array($_FILES["document"]) || $_FILES["document"]["error"] !== UPLOAD_ERR_OK) out(["success"=>false,"message"=>"Select a valid document to upload."],422);
$file=$_FILES["document"];
if ((int)$file["size"] <= 0 || (int)$file["size"] > 5*1024*1024) out(["success"=>false,"message"=>"Document must be 5 MB or smaller."],422);
$finfo=new finfo(FILEINFO_MIME_TYPE); $mime=$finfo->file($file["tmp_name"]);
$exts=["application/pdf"=>"pdf","image/jpeg"=>"jpg","image/png"=>"png"];
if (!isset($exts[$mime])) out(["success"=>false,"message"=>"Only PDF, JPG, and PNG files are allowed."],422);
$stmt=$conn->prepare("SELECT application_id, application_status FROM tbl_partner_applications WHERE owner_id=? ORDER BY application_id DESC LIMIT 1");
$stmt->bind_param("i",$ownerId); $stmt->execute(); $app=$stmt->get_result()->fetch_assoc(); $stmt->close();
if (!$app) out(["success"=>false,"message"=>"Restaurant application not found."],404);
if (!in_array(strtolower((string)$app["application_status"]),["draft","needs_changes"],true)) out(["success"=>false,"message"=>"Documents cannot be changed while this application is under review."],409);
$appId=(int)$app["application_id"];
$dir=__DIR__."/uploads/restaurant_verification/owner_{$ownerId}/application_{$appId}";
if (!is_dir($dir) && !mkdir($dir,0755,true)) out(["success"=>false,"message"=>"Unable to create the secure upload folder."],500);
$filename=$type."_".date("Ymd_His")."_".bin2hex(random_bytes(6)).".".$exts[$mime];
$absolute=$dir."/".$filename;
if (!move_uploaded_file($file["tmp_name"],$absolute)) out(["success"=>false,"message"=>"Unable to save the uploaded document."],500);
$relative="uploads/restaurant_verification/owner_{$ownerId}/application_{$appId}/{$filename}";
$original=mb_substr(basename((string)$file["name"]),0,190);
$conn->begin_transaction();
try {
  $old=$conn->prepare("SELECT document_id, file_path FROM tbl_partner_application_documents WHERE application_id=? AND document_type=? LIMIT 1 FOR UPDATE");
  $old->bind_param("is",$appId,$type); $old->execute(); $existing=$old->get_result()->fetch_assoc(); $old->close();
  if ($existing) {
    $u=$conn->prepare("UPDATE tbl_partner_application_documents SET original_name=?, file_path=?, mime_type=?, file_size=?, uploaded_at=NOW() WHERE document_id=? AND application_id=?");
    $size=(int)$file["size"]; $docId=(int)$existing["document_id"]; $u->bind_param("sssiii",$original,$relative,$mime,$size,$docId,$appId); $u->execute(); $u->close();
    $oldPath=__DIR__."/".(string)$existing["file_path"]; if (is_file($oldPath) && realpath($oldPath)!==realpath($absolute)) @unlink($oldPath);
  } else {
    $i=$conn->prepare("INSERT INTO tbl_partner_application_documents (application_id, owner_id, document_type, original_name, file_path, mime_type, file_size) VALUES (?,?,?,?,?,?,?)");
    $size=(int)$file["size"]; $i->bind_param("iissssi",$appId,$ownerId,$type,$original,$relative,$mime,$size); $i->execute(); $i->close();
  }
  $conn->commit();
} catch (Throwable $e) { $conn->rollback(); @unlink($absolute); out(["success"=>false,"message"=>"Unable to record the uploaded document."],500); }
out(["success"=>true,"document"=>["document_type"=>$type,"label"=>$allowed[$type],"original_name"=>$original]]);
