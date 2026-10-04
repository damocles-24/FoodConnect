<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/session_config.php';
require_once __DIR__ . '/db.php';
function out($d,$c=200){http_response_code($c);echo json_encode($d);exit;}
if (strtolower($_SESSION['role'] ?? '') !== 'admin') out(['success'=>false,'message'=>'Administrator authentication required.'],401);
$userId=(int)($_GET['user_id'] ?? $_POST['user_id'] ?? 0);
if($userId<=0) out(['success'=>false,'message'=>'Invalid owner account.'],400);
$stmt=$conn->prepare("SELECT h.action,h.reason,h.note,h.created_at,u.first_name,u.last_name FROM tbl_account_status_history h LEFT JOIN tbl_users u ON u.user_id=h.performed_by WHERE h.user_id=? ORDER BY h.created_at DESC");
if(!$stmt) out(['success'=>false,'message'=>'History table unavailable.'],500);
$stmt->bind_param('i',$userId);$stmt->execute();$result=$stmt->get_result();$rows=[];
while($r=$result->fetch_assoc()){$r['performed_by']=trim(($r['first_name']??'').' '.($r['last_name']??''));unset($r['first_name'],$r['last_name']);$rows[]=$r;}
out(['success'=>true,'history'=>$rows]);
