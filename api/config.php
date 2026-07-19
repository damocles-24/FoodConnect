<?php
// api/config.php
// Database configuration (XAMPP / localhost)

define("DB_HOST", "localhost");
define("DB_USER", "root");
define("DB_PASS", "");
define("DB_NAME", "db_foodconnect");

// For online hosting, change the values above
// define("DB_HOST", "yourhost");
// define("DB_USER", "youruser");
// define("DB_PASS", "yourpass");
// define("DB_NAME", "yourdbname");

/* =========================================================
   FOODCONNECT PARTNER PORTAL
   ========================================================= */

define(
    "PARTNER_PORTAL_ACCESS_CODE",
    "FCPARTNER2026"
);

/* =========================================================
   ADMIN PORTAL SECURITY
   ========================================================= */

define(
    "ADMIN_PORTAL_ACCESS_CODE",
    "FCADMIN2026"
);