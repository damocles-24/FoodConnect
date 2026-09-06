<?php

require_once __DIR__ . '/env.php';

return [

    "brevo_username" =>
        $_ENV["BREVO_USERNAME"] ?? "",

    "brevo_password" =>
        $_ENV["BREVO_PASSWORD"] ?? "",

    "brevo_sender_email" =>
        $_ENV["BREVO_SENDER_EMAIL"] ?? "",

    "brevo_sender_name" =>
        $_ENV["BREVO_SENDER_NAME"] ?? "",

    "brevo_reply_to_email" =>
        $_ENV["BREVO_REPLY_TO_EMAIL"] ?? ""
];