<?php
declare(strict_types=1);
require_once __DIR__."/session_config.php"; require_once __DIR__."/db.php";
if(empty($_SESSION["user_id"])) { http_response_code(401); exit("Authentication required."); }
$uid=(int)$_SESSION["user_id"]; $role=strtolower((string)($_SESSION["role"]??"")); $id=(int)($_GET["document_id"]??0);
$s=$conn->prepare("SELECT d.file_path,d.original_name,d.mime_type,d.owner_id FROM tbl_partner_application_documents d WHERE d.document_id=? LIMIT 1");$s->bind_param("i",$id);$s->execute();$d=$s->get_result()->fetch_assoc();$s->close();
if(!$d){http_response_code(404);exit("Document not found.");}
if($role!=="admin" && !($role==="owner" && (int)$d["owner_id"]===$uid)){http_response_code(403);exit("Access denied.");}
$path=__DIR__."/".$d["file_path"];if(!is_file($path)){http_response_code(404);exit("File not found.");}
header("Content-Type: ".$d["mime_type"]);header("Content-Length: ".filesize($path));header("Content-Disposition: inline; filename=\"".str_replace(['\"','\\'],"",$d["original_name"])."\"");header("X-Content-Type-Options: nosniff");readfile($path);exit;
