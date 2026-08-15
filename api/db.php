<?php
// api/db.php
// Creates $conn (mysqli) for all FoodConnect API endpoints.
//
// Priority:
// 1. api/config/database.local.php  -> private cloud/local override
// 2. api/config.php                 -> localhost fallback
//
// Cloud credentials are intentionally NOT hard-coded in this file.

require_once __DIR__ . "/config.php";

$databaseLocalFile =
    __DIR__ . "/config/database.local.php";

$databaseConfig = [];

if (is_file($databaseLocalFile)) {
    $loadedDatabaseConfig =
        require $databaseLocalFile;

    if (!is_array($loadedDatabaseConfig)) {
        http_response_code(500);
        header(
            "Content-Type: application/json; charset=utf-8"
        );
        echo json_encode([
            "error" =>
                "Database configuration is invalid."
        ]);
        exit;
    }

    $databaseConfig =
        $loadedDatabaseConfig;
}

$dbHost = trim(
    (string)(
        $databaseConfig["host"]
        ?? DB_HOST
    )
);

$dbPort = (int)(
    $databaseConfig["port"]
    ?? (
        defined("DB_PORT")
            ? DB_PORT
            : 3306
    )
);

$dbUser = trim(
    (string)(
        $databaseConfig["username"]
        ?? DB_USER
    )
);

$dbPass = (string)(
    $databaseConfig["password"]
    ?? DB_PASS
);

$dbName = trim(
    (string)(
        $databaseConfig["database"]
        ?? DB_NAME
    )
);

$dbSslEnabled =
    (bool)(
        $databaseConfig["ssl"]
        ?? false
    );

$dbSslCa = trim(
    (string)(
        $databaseConfig["ssl_ca"]
        ?? ""
    )
);

if (
    $dbHost === "" ||
    $dbPort <= 0 ||
    $dbPort > 65535 ||
    $dbUser === "" ||
    $dbName === ""
) {
    http_response_code(500);
    header(
        "Content-Type: application/json; charset=utf-8"
    );
    echo json_encode([
        "error" =>
            "Database configuration is incomplete."
    ]);
    exit;
}

$conn = mysqli_init();

if (!$conn) {
    http_response_code(500);
    header(
        "Content-Type: application/json; charset=utf-8"
    );
    echo json_encode([
        "error" =>
            "Unable to initialize database connection."
    ]);
    exit;
}

/*
 * Keep connection attempts short enough that a cloud outage does not
 * leave FoodConnect pages hanging for a long time.
 */
if (
    defined("MYSQLI_OPT_CONNECT_TIMEOUT")
) {
    $conn->options(
        MYSQLI_OPT_CONNECT_TIMEOUT,
        10
    );
}

$clientFlags = 0;

if ($dbSslEnabled) {
    if (
        $dbSslCa === "" ||
        !is_file($dbSslCa)
    ) {
        http_response_code(500);
        header(
            "Content-Type: application/json; charset=utf-8"
        );
        echo json_encode([
            "error" =>
                "Database SSL certificate is missing."
        ]);
        exit;
    }

    /*
     * Aiven MySQL requires an encrypted connection.
     * mysqli_ssl_set() must be called BEFORE real_connect().
     */
    $conn->ssl_set(
        null,
        null,
        $dbSslCa,
        null,
        null
    );

    /*
     * Enable server-certificate verification when the PHP/MySQL client
     * exposes this option. Older XAMPP builds may not expose it, so the
     * check is conditional for compatibility.
     */
    if (
        defined(
            "MYSQLI_OPT_SSL_VERIFY_SERVER_CERT"
        )
    ) {
        @$conn->options(
            MYSQLI_OPT_SSL_VERIFY_SERVER_CERT,
            true
        );
    }

    if (
        defined("MYSQLI_CLIENT_SSL")
    ) {
        $clientFlags |=
            MYSQLI_CLIENT_SSL;
    }
}

$connected =
    @$conn->real_connect(
        $dbHost,
        $dbUser,
        $dbPass,
        $dbName,
        $dbPort,
        null,
        $clientFlags
    );

if (!$connected) {
    /*
     * Do not leak host/user/password details to the browser.
     * The full mysqli error is still written to Apache/PHP error logs
     * for local debugging.
     */
    error_log(
        "FoodConnect database connection failed: "
        . mysqli_connect_error()
    );

    http_response_code(500);
    header(
        "Content-Type: application/json; charset=utf-8"
    );
    echo json_encode([
        "error" =>
            "Database connection failed."
    ]);
    exit;
}

if (!$conn->set_charset("utf8mb4")) {
    error_log(
        "FoodConnect could not set utf8mb4: "
        . $conn->error
    );
}
