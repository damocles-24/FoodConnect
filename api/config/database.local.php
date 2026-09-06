<?php

require_once __DIR__ . '/env.php';

$rootPath = dirname(__DIR__, 2);

$sslCa = trim(
    (string) ($_ENV['DB_SSL_CA'] ?? '')
);

/*
 * If DB_SSL_CA is a relative path such as:
 * api/config/ca.pem
 *
 * convert it to the full project path.
 */
if (
    $sslCa !== '' &&
    !preg_match('/^(?:[A-Za-z]:[\\\\\/]|\/)/', $sslCa)
) {
    $sslCa =
        $rootPath .
        DIRECTORY_SEPARATOR .
        str_replace(
            ['/', '\\'],
            DIRECTORY_SEPARATOR,
            $sslCa
        );
}

return [
    'host' => trim(
        (string) ($_ENV['DB_HOST'] ?? '')
    ),

    'port' => (int) (
        $_ENV['DB_PORT'] ?? 3306
    ),

    'database' => trim(
        (string) ($_ENV['DB_NAME'] ?? '')
    ),

    'username' => trim(
        (string) ($_ENV['DB_USER'] ?? '')
    ),

    'password' => (string) (
        $_ENV['DB_PASSWORD'] ?? ''
    ),

    'ssl' => filter_var(
        $_ENV['DB_SSL'] ?? 'false',
        FILTER_VALIDATE_BOOLEAN
    ),

    'ssl_ca' => $sslCa
];