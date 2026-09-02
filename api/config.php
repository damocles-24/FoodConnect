<?php
// api/config.php
//
// FoodConnect database configuration.
//
// Priority:
// 1. Render environment variables (production)
// 2. Local XAMPP fallback (development)

define(
    "DB_HOST",
    getenv("DB_HOST") ?: "localhost"
);

define(
    "DB_PORT",
    getenv("DB_PORT") ?: 3306
);

define(
    "DB_USER",
    getenv("DB_USER") ?: "root"
);

define(
    "DB_PASS",
    getenv("DB_PASS") ?: ""
);

define(
    "DB_NAME",
    getenv("DB_NAME") ?: "db_foodconnect"
);

/* =========================================================
   ADMIN PORTAL SECURITY
========================================================= */

define(
    "ADMIN_PORTAL_ACCESS_CODE",
    getenv("ADMIN_PORTAL_ACCESS_CODE") ?: "FCADMIN2026"
);