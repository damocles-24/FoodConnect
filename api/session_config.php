<?php

date_default_timezone_set(
    "Asia/Manila"
);

if (session_status() !== PHP_SESSION_ACTIVE) {
    ini_set(
        "session.use_strict_mode",
        "1"
    );

    ini_set(
        "session.use_only_cookies",
        "1"
    );

    ini_set(
        "session.use_trans_sid",
        "0"
    );

    ini_set(
        "session.cookie_samesite",
        "Lax"
    );

    session_name(
        "FOODCONNECT_SESSION"
    );

    /*
    Compatible with older PHP/XAMPP versions:
    lifetime, path, domain, secure, httponly
    */
    session_set_cookie_params(
        0,
        "/FoodConnect",
        "",
        false,
        true
    );

    session_start();
}