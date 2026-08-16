<?php

header("Content-Type: application/json; charset=utf-8");
header("Cache-Control: no-store");

error_reporting(E_ALL & ~E_NOTICE & ~E_WARNING);
ini_set("display_errors", "0");

session_set_cookie_params(
    0,
    "/FoodConnect",
    "",
    false,
    true
);

require_once __DIR__ . "/session_config.php";

require_once __DIR__ . "/db.php";

function respond_json(
    array $data,
    int $statusCode = 200
): void {
    http_response_code($statusCode);

    echo json_encode(
        $data,
        JSON_UNESCAPED_UNICODE
    );

    exit;
}

if (
    empty($_SESSION["user_id"]) ||
    strtolower(
        (string) ($_SESSION["role"] ?? "")
    ) !== "admin"
) {
    respond_json([
        "success" => false,
        "message" => "Administrator authentication is required."
    ], 401);
}

$status = strtolower(
    trim(
        (string) ($_GET["status"] ?? "all")
    )
);

$allowedStatuses = [
    "all",
    "email_pending",
    "draft",
    "submitted",
    "needs_changes",
    "approved",
    "rejected"
];

if (
    !in_array(
        $status,
        $allowedStatuses,
        true
    )
) {
    $status = "all";
}

$sql = "
    SELECT
        pa.application_id,
        pa.owner_id,
        pa.restaurant_name,
        pa.restaurant_address,
        pa.restaurant_contact,
        pa.cuisine,
        pa.business_email,
        pa.province,
        pa.city_municipality,
        pa.barangay,
        pa.postal_code,
        pa.delivery_fee,
        pa.application_status,
        pa.rejection_reason,
        pa.submitted_at,
        pa.reviewed_at,
        pa.created_at,
        pa.updated_at,

        u.full_name AS owner_name,
        u.email AS owner_email,
        u.contact_number AS owner_contact,
        u.status AS owner_status,
        u.is_verified AS owner_is_verified,
        u.restaurant_id AS owner_restaurant_id

    FROM tbl_partner_applications pa

    INNER JOIN tbl_users u
        ON u.user_id = pa.owner_id
";

if ($status !== "all") {
    $sql .= "
        WHERE pa.application_status = ?
    ";
}

$sql .= "
    ORDER BY
        CASE pa.application_status
            WHEN 'submitted' THEN 1
            WHEN 'needs_changes' THEN 2
            WHEN 'draft' THEN 3
            WHEN 'rejected' THEN 4
            WHEN 'email_pending' THEN 5
            WHEN 'approved' THEN 6
            ELSE 7
        END,
        pa.updated_at DESC,
        pa.application_id DESC
";

$stmt = $conn->prepare($sql);

if (!$stmt) {
    error_log(
        "get_partner_applications prepare error: " .
        $conn->error
    );

    respond_json([
        "success" => false,
        "message" => "Unable to load restaurant applications."
    ], 500);
}

if ($status !== "all") {
    $stmt->bind_param(
        "s",
        $status
    );
}

$stmt->execute();

$result =
    $stmt->get_result();

$applications = [];

while ($row = $result->fetch_assoc()) {
    $applications[] = [
        "application_id" =>
            (int) $row["application_id"],

        "owner_id" =>
            (int) $row["owner_id"],

        "owner_name" =>
            $row["owner_name"],

        "owner_email" =>
            $row["owner_email"],

        "owner_contact" =>
            $row["owner_contact"],

        "owner_status" =>
            (int) $row["owner_status"],

        "owner_is_verified" =>
            (int) $row["owner_is_verified"],

        "owner_restaurant_id" =>
            !empty($row["owner_restaurant_id"])
                ? (int) $row["owner_restaurant_id"]
                : null,

        "restaurant_name" =>
            $row["restaurant_name"],

        "restaurant_address" =>
            $row["restaurant_address"],

        "restaurant_contact" =>
            $row["restaurant_contact"],

        "cuisine" =>
            $row["cuisine"],

        "business_email" =>
            $row["business_email"],

        "province" =>
            $row["province"],

        "city_municipality" =>
            $row["city_municipality"],

        "barangay" =>
            $row["barangay"],

        "postal_code" =>
            $row["postal_code"],

        "delivery_fee" =>
            (float) $row["delivery_fee"],

        "application_status" =>
            strtolower(
                (string) $row["application_status"]
            ),

        "rejection_reason" =>
            $row["rejection_reason"],

        "submitted_at" =>
            $row["submitted_at"],

        "reviewed_at" =>
            $row["reviewed_at"],

        "created_at" =>
            $row["created_at"],

        "updated_at" =>
            $row["updated_at"]
    ];
}

$stmt->close();

$documentStmt = $conn->prepare("SELECT document_id, document_type, original_name, mime_type, file_size, uploaded_at FROM tbl_partner_application_documents WHERE application_id = ? ORDER BY document_type");
if ($documentStmt) {
    foreach ($applications as &$applicationItem) {
        $applicationIdForDocs = (int)$applicationItem["application_id"];
        $documentStmt->bind_param("i", $applicationIdForDocs);
        $documentStmt->execute();
        $documentResult = $documentStmt->get_result();
        $applicationItem["verification_documents"] = [];
        while ($documentRow = $documentResult->fetch_assoc()) {
            $documentRow["document_id"] = (int)$documentRow["document_id"];
            $documentRow["file_size"] = (int)$documentRow["file_size"];
            $documentRow["view_url"] = "/FoodConnect/api/view_restaurant_verification_document.php?document_id=" . $documentRow["document_id"];
            $applicationItem["verification_documents"][] = $documentRow;
        }
    }
    unset($applicationItem);
    $documentStmt->close();
}

$counts = [
    "all" => 0,
    "email_pending" => 0,
    "draft" => 0,
    "submitted" => 0,
    "needs_changes" => 0,
    "approved" => 0,
    "rejected" => 0
];

$countResult = $conn->query("
    SELECT
        application_status,
        COUNT(*) AS total
    FROM tbl_partner_applications
    GROUP BY application_status
");

if ($countResult) {
    while (
        $countRow =
            $countResult->fetch_assoc()
    ) {
        $countStatus = strtolower(
            (string) $countRow["application_status"]
        );

        $total =
            (int) $countRow["total"];

        if (
            array_key_exists(
                $countStatus,
                $counts
            )
        ) {
            $counts[$countStatus] =
                $total;
        }

        $counts["all"] +=
            $total;
    }
}

respond_json([
    "success" => true,
    "applications" => $applications,
    "counts" => $counts
]);