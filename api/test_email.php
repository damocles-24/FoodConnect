<?php
require_once __DIR__ . "/mailer.php";

$ok = sendBrevoSMTP(
  "cjmt42@gmail.com",
  "FoodConnect SMTP Test",
  "<h2>Email working ✅</h2>"
);

echo $ok ? "SENT" : "FAILED";