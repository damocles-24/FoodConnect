<?php

require_once __DIR__ . '/config/env.php';


define(
    "DB_HOST",
    $_ENV["DB_HOST"] ?? ""
);

define(
    "DB_PORT",
    $_ENV["DB_PORT"] ?? 3306
);

define(
    "DB_USER",
    $_ENV["DB_USER"] ?? ""
);

define(
    "DB_PASS",
    $_ENV["DB_PASSWORD"] ?? ""
);

define(
    "DB_NAME",
    $_ENV["DB_NAME"] ?? ""
);


/* =========================================================
   ADMIN PORTAL SECURITY
========================================================= */

define(
    "ADMIN_PORTAL_ACCESS_CODE",
    $_ENV["ADMIN_PORTAL_ACCESS_CODE"] ?? ""
);