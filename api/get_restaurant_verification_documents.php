<?php
declare(strict_types=1);
header("Content-Type: application/json; charset=utf-8"); header("Cache-Control: no-store");
require_once __DIR__."/session_config.php"; require_once __DIR__."/db.php";
function out(array $d,int $s=200):void{http_response_code($s);echo json_encode($d,JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES);exit;}
if(empty($_SESSION["user_id"]))out(["success"=>false,"message"=>"Authentication required."],401);
$uid=(int)$_SESSION["user_id"]; $role=strtolower((string)($_SESSION["role"]??""));
$appId=(int)($_GET["application_id"]??0);
if($role==="owner"){
 $s=$conn->prepare("SELECT application_id FROM tbl_partner_applications WHERE owner_id=? ORDER BY application_id DESC LIMIT 1");$s->bind_param("i",$uid);$s->execute();$r=$s->get_result()->fetch_assoc();$s->close();if(!$r)out(["success"=>true,"documents"=>[]]);$appId=(int)$r["application_id"];
}elseif($role!=="admin")out(["success"=>false,"message"=>"Access denied."],403);
if($appId<=0)out(["success"=>false,"message"=>"Invalid application."],422);
$s=$conn->prepare("SELECT document_id,document_type,original_name,mime_type,file_size,uploaded_at FROM tbl_partner_application_documents WHERE application_id=? ORDER BY document_type");$s->bind_param("i",$appId);$s->execute();$res=$s->get_result();$docs=[];while($r=$res->fetch_assoc()){$r["document_id"]=(int)$r["document_id"];$r["file_size"]=(int)$r["file_size"];$r["view_url"]="/api/view_restaurant_verification_document.php?document_id=".$r["document_id"];$docs[]=$r;}$s->close();out(["success"=>true,"documents"=>$docs]);
