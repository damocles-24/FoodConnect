<?php

header(
    "Content-Type: application/json; charset=utf-8"
);

header(
    "Cache-Control: no-store, no-cache, must-revalidate, max-age=0"
);

require_once __DIR__ . "/session_config.php";
require_once __DIR__ . "/db.php";

/* =========================================================
   JSON RESPONSE
========================================================= */

function respond_json(
    array $data,
    int $statusCode = 200
): void {
    http_response_code($statusCode);

    echo json_encode(
        $data,
        JSON_UNESCAPED_UNICODE |
        JSON_UNESCAPED_SLASHES
    );

    exit;
}

/* =========================================================
   AUTHENTICATION
========================================================= */

$userId = (int)(
    $_SESSION["user_id"] ?? 0
);

$restaurantId = (int)(
    $_SESSION["restaurant_id"] ?? 0
);

$role = strtolower(
    trim(
        (string)(
            $_SESSION["role"] ?? ""
        )
    )
);

if (
    $userId <= 0 ||
    $restaurantId <= 0 ||
    $role !== "owner"
) {
    respond_json([
        "success" => false,
        "message" =>
            "Only the restaurant owner can manage the staff access code."
    ], 403);
}

/* =========================================================
   VERIFY RESTAURANT OWNERSHIP
========================================================= */

$ownerStmt = $conn->prepare("
    SELECT
        restaurant_id,
        staff_access_code

    FROM tbl_restaurants

    WHERE restaurant_id = ?
      AND owner_id = ?

    LIMIT 1
");

if (!$ownerStmt) {
    respond_json([
        "success" => false,
        "message" =>
            "Unable to prepare staff access code validation."
    ], 500);
}

$ownerStmt->bind_param(
    "ii",
    $restaurantId,
    $userId
);

if (!$ownerStmt->execute()) {
    $ownerStmt->close();

    respond_json([
        "success" => false,
        "message" =>
            "Unable to verify the restaurant."
    ], 500);
}

$restaurant =
    $ownerStmt
        ->get_result()
        ->fetch_assoc();

$ownerStmt->close();

if (!$restaurant) {
    respond_json([
        "success" => false,
        "message" =>
            "Restaurant ownership could not be verified."
    ], 403);
}

/* =========================================================
   GET CURRENT CODE
========================================================= */

$requestMethod = strtoupper(
    (string)(
        $_SERVER["REQUEST_METHOD"] ?? ""
    )
);

if ($requestMethod === "GET") {
    respond_json([
        "success" => true,

        "staff_access_code" =>
            (string)(
                $restaurant[
                    "staff_access_code"
                ] ?? ""
            )
    ]);
}

/* =========================================================
   GENERATE NEW CODE
========================================================= */

if ($requestMethod !== "POST") {
    respond_json([
        "success" => false,
        "message" =>
            "Method not allowed."
    ], 405);
}

$input = json_decode(
    file_get_contents("php://input"),
    true
);

$action = strtolower(
    trim(
        (string)(
            $input["action"] ?? ""
        )
    )
);

if ($action !== "regenerate") {
    respond_json([
        "success" => false,
        "message" =>
            "Invalid staff access code action."
    ], 422);
}

/*
 * Example generated code:
 * FC-7A3K-92PX
 */
$randomCharacters =
    strtoupper(
        bin2hex(
            random_bytes(4)
        )
    );

$newCode =
    "FC-" .
    substr(
        $randomCharacters,
        0,
        4
    ) .
    "-" .
    substr(
        $randomCharacters,
        4,
        4
    );

$updateStmt = $conn->prepare("
    UPDATE tbl_restaurants

    SET staff_access_code = ?

    WHERE restaurant_id = ?
      AND owner_id = ?

    LIMIT 1
");

if (!$updateStmt) {
    respond_json([
        "success" => false,
        "message" =>
            "Unable to prepare staff access code update."
    ], 500);
}

$updateStmt->bind_param(
    "sii",
    $newCode,
    $restaurantId,
    $userId
);

if (!$updateStmt->execute()) {
    $updateStmt->close();

    respond_json([
        "success" => false,
        "message" =>
            "Unable to generate a new staff access code."
    ], 500);
}

$updated =
    $updateStmt->affected_rows >= 0;

$updateStmt->close();

if (!$updated) {
    respond_json([
        "success" => false,
        "message" =>
            "The staff access code was not updated."
    ], 500);
}

/* =========================================================
   ACTIVITY LOG
========================================================= */

$logStmt = $conn->prepare("
    INSERT INTO tbl_activity_logs (
        restaurant_id,
        user_id,
        user_role,
        action_type,
        action_title,
        action_description
    )
    VALUES (
        ?,
        ?,
        'owner',
        'staff',
        'Staff Access Code Updated',
        'The restaurant owner generated a new staff access code.'
    )
");

if ($logStmt) {
    $logStmt->bind_param(
        "ii",
        $restaurantId,
        $userId
    );

    $logStmt->execute();
    $logStmt->close();
}

respond_json([
    "success" => true,

    "message" =>
        "A new staff access code was generated successfully.",

    "staff_access_code" =>
        $newCode
]);