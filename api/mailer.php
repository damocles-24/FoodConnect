<?php

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require_once __DIR__ . "/PHPMailer/Exception.php";
require_once __DIR__ . "/PHPMailer/PHPMailer.php";
require_once __DIR__ . "/PHPMailer/SMTP.php";

function sendBrevoSMTP($toEmail, $subject, $htmlBody) {

  $mail = new PHPMailer(true);

  try {
    $mail->isSMTP();
    $mail->Host = "smtp-relay.brevo.com";
    $mail->SMTPAuth = true;

    // 🔴 paste Brevo SMTP login here
    $mail->Username = "a35383001@smtp-brevo.com";

    // 🔴 paste SMTP key here
    $mail->Password = "xsmtpsib-4426a24d8d70ba0b5b3f307ccfba826bf7beceb842c3a93560226fbfcb1a0fe6-g55SQZXT9jlIJaBw";

    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port = 587;

    $mail->setFrom("carlosjaymiguel67@gmail.com", "FoodConnect");
    $mail->addAddress($toEmail);

    $mail->isHTML(true);
    $mail->Subject = $subject;
    $mail->Body = $htmlBody;

    $mail->send();
    return true;

  } catch (Exception $e) {
    error_log($mail->ErrorInfo);
    return false;
  }
}