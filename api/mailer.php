<?php

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require_once __DIR__ . "/PHPMailer/Exception.php";
require_once __DIR__ . "/PHPMailer/PHPMailer.php";
require_once __DIR__ . "/PHPMailer/SMTP.php";

function sendBrevoSMTP(
    string $toEmail,
    string $subject,
    string $htmlBody
): bool {
    $mail =
        new PHPMailer(
            true
        );

    try {
        $mail->isSMTP();

        $mail->Host =
            "smtp-relay.brevo.com";

        $mail->SMTPAuth =
            true;

        $config = require __DIR__ . "/config.local.php";

        $mail->Username = $config["brevo_username"];
        $mail->Password = $config["brevo_password"];


        $mail->SMTPSecure =
            PHPMailer::ENCRYPTION_STARTTLS;

        $mail->Port =
            587;

        $mail->CharSet =
            "UTF-8";

        /*
        This must be the exact sender email verified
        in your current Brevo account.
        */

        $mail->setFrom(
          "foodconnectv1@gmail.com",
          "FoodConnect"
        );

        /*
        Optional: replies will go to this address.
        */

        $mail->addReplyTo(
            "YOUR_VERIFIED_SENDER_EMAIL@gmail.com",
            "FoodConnect Support"
        );

        $mail->addAddress(
            $toEmail
        );

        $mail->isHTML(
            true
        );

        $mail->Subject =
            $subject;

        $mail->Body =
            $htmlBody;

        $mail->AltBody =
            strip_tags(
                $htmlBody
            );

        $mail->send();

        return true;
    } catch (Exception $error) {
        error_log(
            "Brevo SMTP error: " .
            $mail->ErrorInfo
        );

        return false;
    }
}