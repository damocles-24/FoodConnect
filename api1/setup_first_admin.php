<?php

header("Content-Type: application/json; charset=utf-8");
header("Cache-Control: no-store, no-cache, must-revalidate");
header("Pragma: no-cache");

error_reporting(E_ALL & ~E_NOTICE & ~E_WARNING);
ini_set("display_errors", "0");

require_once __DIR__ . "/db.php";
require_once __DIR__ . "/ph_phone.php";
require_once __DIR__ . "/name_helper.php";

/* =========================================================
   JSON RESPONSE HELPER
   ========================================================= */

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

/* =========================================================
   CHECK WHETHER AN ADMIN EXISTS
   ========================================================= */

function admin_exists(
    mysqli $conn
): bool {
    $stmt = $conn->prepare("
        SELECT user_id
        FROM tbl_users
        WHERE role = 'admin'
        LIMIT 1
    ");

    if (!$stmt) {
        throw new RuntimeException(
            "Unable to prepare administrator lookup."
        );
    }

    if (!$stmt->execute()) {
        $errorMessage =
            $stmt->error;

        $stmt->close();

        throw new RuntimeException(
            "Unable to execute administrator lookup: " .
            $errorMessage
        );
    }

    $admin =
        $stmt
            ->get_result()
            ->fetch_assoc();

    $stmt->close();

    return $admin !== null;
}

/* =========================================================
   DATABASE SETUP LOCK HELPERS
   ========================================================= */

function acquire_admin_setup_lock(
    mysqli $conn
): bool {
    $stmt = $conn->prepare("
        SELECT GET_LOCK(
            'foodconnect_first_admin_setup',
            10
        ) AS lock_acquired
    ");

    if (!$stmt) {
        throw new RuntimeException(
            "Unable to prepare administrator setup lock."
        );
    }

    if (!$stmt->execute()) {
        $errorMessage =
            $stmt->error;

        $stmt->close();

        throw new RuntimeException(
            "Unable to acquire administrator setup lock: " .
            $errorMessage
        );
    }

    $result =
        $stmt
            ->get_result()
            ->fetch_assoc();

    $stmt->close();

    return
        (int) ($result["lock_acquired"] ?? 0)
        === 1;
}

function release_admin_setup_lock(
    mysqli $conn
): void {
    $stmt = $conn->prepare("
        SELECT RELEASE_LOCK(
            'foodconnect_first_admin_setup'
        )
    ");

    if (!$stmt) {
        return;
    }

    $stmt->execute();
    $stmt->close();
}

/* =========================================================
   REQUEST METHOD
   ========================================================= */

$requestMethod = strtoupper(
    (string) (
        $_SERVER["REQUEST_METHOD"]
        ?? ""
    )
);

/* =========================================================
   GET: CHECK FIRST-ADMIN SETUP STATUS
   ========================================================= */

if ($requestMethod === "GET") {
    try {
        $hasAdmin =
            admin_exists($conn);

        respond_json([
            "success" => true,
            "setup_required" =>
                !$hasAdmin
        ]);
    } catch (Throwable $error) {
        error_log(
            "setup_first_admin.php GET error: " .
            $error->getMessage()
        );

        respond_json([
            "success" => false,
            "setup_required" => false,
            "message" =>
                "Unable to check administrator setup."
        ], 500);
    }
}

/* =========================================================
   POST ONLY FOR ACCOUNT CREATION
   ========================================================= */

if ($requestMethod !== "POST") {
    header("Allow: GET, POST");

    respond_json([
        "success" => false,
        "message" =>
            "This action is not available."
    ], 405);
}

/* =========================================================
   READ JSON REQUEST
   ========================================================= */

$rawInput =
    file_get_contents("php://input");

$input =
    json_decode(
        $rawInput,
        true
    );

if (!is_array($input)) {
    respond_json([
        "success" => false,
        "message" =>
            "Invalid request data."
    ], 400);
}

/* =========================================================
   NORMALIZE INPUT
   ========================================================= */

$firstName = trim((string)($input["first_name"] ?? ""));
$middleName = trim((string)($input["middle_name"] ?? ""));
$lastName = trim((string)($input["last_name"] ?? ""));

$fullName = formatUserName([
    "first_name" => $firstName,
    "middle_name" => $middleName,
    "last_name" => $lastName
]);

$email = strtolower(
    trim(
        (string) (
            $input["email"]
            ?? ""
        )
    )
);

$contactNumber = trim(
    (string) (
        $input["contact_number"]
        ?? ""
    )
);

$contactNumberRaw = $contactNumber;
$contactNumber = normalize_ph_mobile($contactNumberRaw);

$password =
    (string) (
        $input["password"]
        ?? ""
    );

$confirmPassword =
    (string) (
        $input["confirm_password"]
        ?? ""
    );

/* =========================================================
   VALIDATION
   ========================================================= */

if (
    $firstName === "" ||
    $lastName === "" ||
    $email === "" ||
    $contactNumber === "" ||
    $password === "" ||
    $confirmPassword === ""
) {
    respond_json([
        "success" => false,
        "message" =>
            "Complete all administrator account fields."
    ], 422);
}

if (strlen($firstName) > 100 || strlen($middleName) > 100 || strlen($lastName) > 100) {
    respond_json([
        "success" => false,
        "message" =>
            "Administrator name is too long."
    ], 422);
}

if (
    !filter_var(
        $email,
        FILTER_VALIDATE_EMAIL
    )
) {
    respond_json([
        "success" => false,
        "message" =>
            "Enter a valid administrator email address."
    ], 422);
}

if (strlen($email) > 150) {
    respond_json([
        "success" => false,
        "message" =>
            "Administrator email address is too long."
    ], 422);
}

if ($contactNumber === "") {
    respond_json([
        "success" => false,
        "message" =>
            "Enter a valid Philippine mobile number starting with 9."
    ], 422);
}




if (
    !preg_match(
        "/^[0-9+\-\s()]+$/",
        $contactNumber
    )
) {
    respond_json([
        "success" => false,
        "message" =>
            "Enter a valid administrator contact number."
    ], 422);
}

if (strlen($password) < 8) {
    respond_json([
        "success" => false,
        "message" =>
            "Password must contain at least 8 characters."
    ], 422);
}

if (strlen($password) > 128) {
    respond_json([
        "success" => false,
        "message" =>
            "Password must not exceed 128 characters."
    ], 422);
}

if (
    !preg_match(
        "/[A-Z]/",
        $password
    ) ||
    !preg_match(
        "/[a-z]/",
        $password
    ) ||
    !preg_match(
        "/[0-9]/",
        $password
    )
) {
    respond_json([
        "success" => false,
        "message" =>
            "Password must include uppercase, lowercase, and a number."
    ], 422);
}

if ($password !== $confirmPassword) {
    respond_json([
        "success" => false,
        "message" =>
            "The password confirmation does not match."
    ], 422);
}

/* =========================================================
   CHECK WHETHER SETUP IS ALREADY COMPLETED
   ========================================================= */

try {
    if (admin_exists($conn)) {
        respond_json([
            "success" => false,
            "setup_required" => false,
            "message" =>
                "FoodConnect already has an administrator account."
        ], 409);
    }
} catch (Throwable $error) {
    error_log(
        "setup_first_admin.php initial check error: " .
        $error->getMessage()
    );

    respond_json([
        "success" => false,
        "message" =>
            "Unable to check administrator setup."
    ], 500);
}

/* =========================================================
   CHECK DUPLICATE EMAIL
   ========================================================= */

$emailStmt = $conn->prepare("
    SELECT
        user_id,
        role
    FROM tbl_users
    WHERE email = ?
    LIMIT 1
");

if (!$emailStmt) {
    error_log(
        "setup_first_admin.php email prepare error: " .
        $conn->error
    );

    respond_json([
        "success" => false,
        "message" =>
            "Unable to validate the administrator email."
    ], 500);
}

$emailStmt->bind_param(
    "s",
    $email
);

if (!$emailStmt->execute()) {
    error_log(
        "setup_first_admin.php email execute error: " .
        $emailStmt->error
    );

    $emailStmt->close();

    respond_json([
        "success" => false,
        "message" =>
            "Unable to validate the administrator email."
    ], 500);
}

$existingUser =
    $emailStmt
        ->get_result()
        ->fetch_assoc();

$emailStmt->close();

if ($existingUser) {
    respond_json([
        "success" => false,
        "message" =>
            "This email address is already registered."
    ], 409);
}

/* =========================================================
   HASH PASSWORD
   ========================================================= */

$passwordHash =
    password_hash(
        $password,
        PASSWORD_DEFAULT
    );

if ($passwordHash === false) {
    error_log(
        "setup_first_admin.php: " .
        "password_hash failed."
    );

    respond_json([
        "success" => false,
        "message" =>
            "Unable to secure the administrator password."
    ], 500);
}

/* =========================================================
   CREATE FIRST DATABASE ADMIN
   ========================================================= */

$setupLockAcquired = false;
$transactionStarted = false;
$adminId = null;

try {
    /*
    The named database lock prevents two setup requests from
    creating separate first-administrator accounts at the
    same time.
    */

    $setupLockAcquired =
        acquire_admin_setup_lock(
            $conn
        );

    if (!$setupLockAcquired) {
        respond_json([
            "success" => false,
            "message" =>
                "Administrator setup is currently busy. Please try again."
        ], 423);
    }

    /*
    Check again after acquiring the lock. Another request may
    have created the administrator while this request waited.
    */

    if (admin_exists($conn)) {
        throw new RuntimeException(
            "ADMIN_ALREADY_EXISTS"
        );
    }

    /*
    Recheck the email while holding the setup lock.
    */

    $lockedEmailStmt = $conn->prepare("
        SELECT user_id
        FROM tbl_users
        WHERE email = ?
        LIMIT 1
    ");

    if (!$lockedEmailStmt) {
        throw new RuntimeException(
            "Unable to prepare the final email check."
        );
    }

    $lockedEmailStmt->bind_param(
        "s",
        $email
    );

    if (!$lockedEmailStmt->execute()) {
        $lockedEmailStmt->close();

        throw new RuntimeException(
            "Unable to execute the final email check."
        );
    }

    $lockedEmailExists =
        $lockedEmailStmt
            ->get_result()
            ->fetch_assoc();

    $lockedEmailStmt->close();

    if ($lockedEmailExists) {
        throw new RuntimeException(
            "EMAIL_ALREADY_EXISTS"
        );
    }

    if (!$conn->begin_transaction()) {
        throw new RuntimeException(
            "Unable to begin administrator creation transaction."
        );
    }

    $transactionStarted = true;

    $role = "admin";

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
            is_verified,
            verification_token,
            verification_expires_at
        )
        VALUES (
            NULL,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            NULL,
            ?,
            1,
            1,
            NULL,
            NULL
        )
    ");

    if (!$insertStmt) {
        throw new RuntimeException(
            "Unable to prepare administrator creation."
        );
    }

    $insertStmt->bind_param(
        "sssssss",
        $role,
        $firstName,
        $middleName,
        $lastName,
        $email,
        $contactNumber,
        $passwordHash
    );

    if (!$insertStmt->execute()) {
        $databaseError =
            $insertStmt->error;

        $databaseErrno =
            $insertStmt->errno;

        $insertStmt->close();

        if ($databaseErrno === 1062) {
            throw new RuntimeException(
                "EMAIL_ALREADY_EXISTS"
            );
        }

        throw new RuntimeException(
            "Unable to create administrator account: " .
            $databaseError
        );
    }

    $adminId =
        (int) $conn->insert_id;

    $insertStmt->close();

    if (!$conn->commit()) {
        throw new RuntimeException(
            "Unable to commit administrator creation."
        );
    }

    $transactionStarted = false;
} catch (Throwable $error) {
    if ($transactionStarted) {
        try {
            $conn->rollback();
        } catch (Throwable $rollbackError) {
            error_log(
                "setup_first_admin.php rollback error: " .
                $rollbackError->getMessage()
            );
        }
    }

    if ($setupLockAcquired) {
        release_admin_setup_lock(
            $conn
        );

        $setupLockAcquired = false;
    }

    if (
        $error->getMessage() ===
        "ADMIN_ALREADY_EXISTS"
    ) {
        respond_json([
            "success" => false,
            "setup_required" => false,
            "message" =>
                "FoodConnect already has an administrator account."
        ], 409);
    }

    if (
        $error->getMessage() ===
        "EMAIL_ALREADY_EXISTS"
    ) {
        respond_json([
            "success" => false,
            "message" =>
                "This email address is already registered."
        ], 409);
    }

    error_log(
        "setup_first_admin.php creation error: " .
        $error->getMessage()
    );

    respond_json([
        "success" => false,
        "message" =>
            "Unable to create the administrator account."
    ], 500);
}

/* =========================================================
   RELEASE DATABASE SETUP LOCK
   ========================================================= */

if ($setupLockAcquired) {
    release_admin_setup_lock(
        $conn
    );
}

/* =========================================================
   SUCCESS RESPONSE
   ========================================================= */

respond_json([
    "success" => true,
    "setup_required" => false,
    "message" =>
        "FoodConnect administrator account created successfully.",

    "admin" => [
        "user_id" =>
            (int) $adminId,

        "restaurant_id" =>
            null,

        "role" =>
            "admin",

        "first_name" =>
            $firstName,

        "middle_name" =>
            $middleName,

        "last_name" =>
            $lastName,

        "display_name" =>
            $fullName,

        "email" =>
            $email,

        "contact_number" =>
            $contactNumber,

        "status" =>
            1,

        "is_verified" =>
            1
    ]
], 201);