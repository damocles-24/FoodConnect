<?php

header(
    "Content-Type: application/json; charset=utf-8"
);

header(
    "Cache-Control: no-store, no-cache, must-revalidate, max-age=0"
);

require_once __DIR__ . "/session_config.php";
require_once __DIR__ . "/db.php";
require_once __DIR__ . "/ph_phone.php";
require_once __DIR__ . "/name_helper.php";

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
   REQUEST METHOD
========================================================= */

if (
    strtoupper(
        (string)(
            $_SERVER["REQUEST_METHOD"] ?? ""
        )
    ) !== "POST"
) {
    respond_json([
        "success" => false,
        "message" => "This action is not available."
    ], 405);
}

/* =========================================================
   OWNER AUTHENTICATION
========================================================= */

$userId = (int)(
    $_SESSION["user_id"] ?? 0
);

$restaurantId = (int)(
    $_SESSION["restaurant_id"] ?? 0
);

$sessionRole = strtolower(
    trim(
        (string)(
            $_SESSION["role"] ?? ""
        )
    )
);

if (
    $userId <= 0 ||
    $restaurantId <= 0
) {
    respond_json([
        "success" => false,
        "message" =>
            "Your session has expired or you do not have access. Please log in again. Please log in again."
    ], 401);
}

if ($sessionRole !== "owner") {
    respond_json([
        "success" => false,
        "message" =>
            "Only the restaurant owner can create staff accounts."
    ], 403);
}

/* =========================================================
   VERIFY RESTAURANT OWNERSHIP
========================================================= */

$ownerStmt = $conn->prepare("
    SELECT restaurant_id

    FROM tbl_restaurants

    WHERE restaurant_id = ?
      AND owner_id = ?

    LIMIT 1
");

if (!$ownerStmt) {
    error_log(
        "add_user.php ownership prepare error: " .
        $conn->error
    );

    respond_json([
        "success" => false,
        "message" =>
            "Unable to verify restaurant ownership."
    ], 500);
}

$ownerStmt->bind_param(
    "ii",
    $restaurantId,
    $userId
);

if (!$ownerStmt->execute()) {
    error_log(
        "add_user.php ownership execute error: " .
        $ownerStmt->error
    );

    $ownerStmt->close();

    respond_json([
        "success" => false,
        "message" =>
            "Unable to verify restaurant ownership."
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
            "You are not authorized to manage this restaurant."
    ], 403);
}

/* =========================================================
   REQUEST BODY
========================================================= */

$rawInput =
    file_get_contents(
        "php://input"
    );

$data = json_decode(
    $rawInput,
    true
);

if (!is_array($data)) {
    respond_json([
        "success" => false,
        "message" =>
            "Invalid request data."
    ], 400);
}

$firstName = trim((string)($data["first_name"] ?? ""));
$middleName = trim((string)($data["middle_name"] ?? ""));
$lastName = trim((string)($data["last_name"] ?? ""));

$fullName = formatUserName([
    "first_name" => $firstName,
    "middle_name" => $middleName,
    "last_name" => $lastName
]);

$email = strtolower(
    trim(
        (string)(
            $data["email"] ?? ""
        )
    )
);

$password =
    (string)(
        $data["password"] ?? ""
    );

$contactNumber = trim(
    (string)(
        $data["contact_number"] ?? ""
    )
);

$contactNumberRaw = $contactNumber;
$contactNumber = $contactNumberRaw === "" ? "" : normalize_ph_mobile($contactNumberRaw);

$address = trim(
    (string)(
        $data["address"] ?? ""
    )
);

$role = strtolower(
    trim(
        (string)(
            $data["role"] ?? ""
        )
    )
);

$status = isset(
    $data["status"]
)
    ? (int)$data["status"]
    : 1;

/* =========================================================
   VALIDATION
========================================================= */

/*
 * These roles match the current staff_login.php.
 */
$allowedRoles = [
    "cashier",
    "delivery_staff"
];

if ($firstName === "" || $lastName === "") {
    respond_json([
        "success" => false,
        "message" => "First name and last name are required."
    ], 422);
}

if (
    mb_strlen($firstName) > 100 ||
    mb_strlen($middleName) > 100 ||
    mb_strlen($lastName) > 100 ||
    mb_strlen($fullName) > 150
) {
    respond_json([
        "success" => false,
        "message" => "Please enter a shorter staff name."
    ], 422);
}

if (
    $email === "" ||
    !filter_var(
        $email,
        FILTER_VALIDATE_EMAIL
    )
) {
    respond_json([
        "success" => false,
        "message" =>
            "Enter a valid email address."
    ], 422);
}

if (strlen($password) < 8) {
    respond_json([
        "success" => false,
        "message" =>
            "Password must contain at least 8 characters."
    ], 422);
}

if (
    !in_array(
        $role,
        $allowedRoles,
        true
    )
) {
    respond_json([
        "success" => false,
        "message" =>
            "Select a valid staff role."
    ], 422);
}

if (
    !in_array(
        $status,
        [0, 1],
        true
    )
) {
    respond_json([
        "success" => false,
        "message" =>
            "Select a valid account status."
    ], 422);
}

if (
    $contactNumberRaw !== "" &&
    $contactNumber === ""
) {
    respond_json([
        "success" => false,
        "message" =>
            "Enter a valid Philippine mobile number starting with 9."
    ], 422);
}

/* =========================================================
   CHECK EXISTING EMAIL

   Staff login searches by email without a restaurant filter,
   so the email must be unique across all user accounts.
========================================================= */

$checkStmt = $conn->prepare("
    SELECT user_id

    FROM tbl_users

    WHERE LOWER(email) = ?

    LIMIT 1
");

if (!$checkStmt) {
    error_log(
        "add_user.php email check prepare error: " .
        $conn->error
    );

    respond_json([
        "success" => false,
        "message" =>
            "Unable to validate the email address."
    ], 500);
}

$checkStmt->bind_param(
    "s",
    $email
);

if (!$checkStmt->execute()) {
    error_log(
        "add_user.php email check execute error: " .
        $checkStmt->error
    );

    $checkStmt->close();

    respond_json([
        "success" => false,
        "message" =>
            "Unable to validate the email address."
    ], 500);
}

$existingUser =
    $checkStmt
        ->get_result()
        ->fetch_assoc();

$checkStmt->close();

if ($existingUser) {
    respond_json([
        "success" => false,
        "message" =>
            "This email address is already registered."
    ], 409);
}

/* =========================================================
   CREATE PASSWORD HASH
========================================================= */

$passwordHash =
    password_hash(
        $password,
        PASSWORD_DEFAULT
    );

if ($passwordHash === false) {
    respond_json([
        "success" => false,
        "message" =>
            "Unable to securely process the password."
    ], 500);
}

/* =========================================================
   INSERT STAFF ACCOUNT
========================================================= */

$insertStmt = $conn->prepare("
    INSERT INTO tbl_users (
        restaurant_id,
        role,
        first_name,
        middle_name,
        last_name,
        email,
        contact_number,
        address,
        password_hash,
        status,
        is_verified
    )
    VALUES (
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        1
    )
");

if (!$insertStmt) {
    error_log(
        "add_user.php insert prepare error: " .
        $conn->error
    );

    respond_json([
        "success" => false,
        "message" =>
            "Unable to prepare the staff account."
    ], 500);
}

$insertStmt->bind_param(
    "issssssssi",
    $restaurantId,
    $role,
    $firstName,
    $middleName,
    $lastName,
    $email,
    $contactNumber,
    $address,
    $passwordHash,
    $status
);

if (!$insertStmt->execute()) {
    error_log(
        "add_user.php insert execute error: " .
        $insertStmt->error
    );

    $databaseErrorNumber =
        (int)$insertStmt->errno;

    $insertStmt->close();

    if ($databaseErrorNumber === 1062) {
        respond_json([
            "success" => false,
            "message" =>
                "This email address is already registered."
        ], 409);
    }

    respond_json([
        "success" => false,
        "message" =>
            "Unable to create the staff account."
    ], 500);
}

$newUserId =
    (int)$insertStmt->insert_id;

$insertStmt->close();

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
        'Staff Account Created',
        ?
    )
");

if ($logStmt) {
    $description =
        $fullName .
        " was added as " .
        str_replace(
            "_",
            " ",
            $role
        ) .
        ".";

    $logStmt->bind_param(
        "iis",
        $restaurantId,
        $userId,
        $description
    );

    $logStmt->execute();
    $logStmt->close();
}

/* =========================================================
   SUCCESS
========================================================= */

respond_json([
    "success" => true,

    "message" =>
        "Staff account created successfully.",

    "user" => [
        "user_id" =>
            $newUserId,

        "restaurant_id" =>
            $restaurantId,

        "first_name" =>
            $firstName ?? "",

        "middle_name" =>
            $middleName ?? "",

        "last_name" =>
            $lastName ?? "",

        "display_name" =>
            $fullName,

        "email" =>
            $email,

        "contact_number" =>
            $contactNumber,

        "address" =>
            $address,

        "role" =>
            $role,

        "status" =>
            $status,

        "is_verified" =>
            1
    ]
], 201);