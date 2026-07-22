<?php
require_once __DIR__ . "/mailer.php";

$ok = sendBrevoSMTP(
  "jameslee050505051@gmail.com",
  "FoodConnect SMTP Test",
  "<h2>Email working ✅</h2>"
);

echo $ok ? "SENT" : "FAILED";