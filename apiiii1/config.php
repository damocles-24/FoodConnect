<?php
// api/config.php
//
// SAFE FALLBACK DATABASE CONFIGURATION.
//
// FoodConnect first checks api/config/database.local.php from db.php.
// If that private file exists, its values are used (Aiven/cloud).
// If it does not exist, these localhost values are used.
//
// This keeps development recoverable without placing cloud passwords
// directly in a tracked/shared PHP file.

define("DB_HOST", "localhost");
define("DB_PORT", 3306);
define("DB_USER", "root");
define("DB_PASS", "");
define("DB_NAME", "db_foodconnect");

/* =========================================================
   ADMIN PORTAL SECURITY
========================================================= */

define(
    "ADMIN_PORTAL_ACCESS_CODE",
    "FCADMIN2026"
);
