<?php

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require_once __DIR__ . "/PHPMailer/Exception.php";
require_once __DIR__ . "/PHPMailer/PHPMailer.php";
require_once __DIR__ . "/PHPMailer/SMTP.php";

/**
 * Send an email through Brevo SMTP.
 *
 * @param string $toEmail Recipient email address.
 * @param string $subject Email subject.
 * @param string $htmlBody HTML email content.
 *
 * @return bool
 */
function sendBrevoSMTP(
    string $toEmail,
    string $subject,
    string $htmlBody
): bool {
    $mail = new PHPMailer(true);

    try {
        /*
        |----------------------------------------------------------
        | Validate recipient
        |----------------------------------------------------------
        */

        $toEmail = trim($toEmail);

        if (
            !filter_var(
                $toEmail,
                FILTER_VALIDATE_EMAIL
            )
        ) {
            throw new RuntimeException(
                "Invalid recipient email address."
            );
        }

        /*
        |----------------------------------------------------------
        | Load private configuration
        |----------------------------------------------------------
        */

        $configPath =
            __DIR__ . "/config.local.php";

        if (!is_file($configPath)) {
            throw new RuntimeException(
                "Missing config.local.php."
            );
        }

        $config = require $configPath;

        if (!is_array($config)) {
            throw new RuntimeException(
                "config.local.php must return an array."
            );
        }

        $smtpUsername = trim(
            (string)(
                $config["brevo_username"] ?? ""
            )
        );

        $smtpPassword = trim(
            (string)(
                $config["brevo_password"] ?? ""
            )
        );

        $senderEmail = trim(
            (string)(
                $config["brevo_sender_email"] ?? ""
            )
        );

        $senderName = trim(
            (string)(
                $config["brevo_sender_name"] ??
                "FoodConnect"
            )
        );

        $replyToEmail = trim(
            (string)(
                $config["brevo_reply_to_email"] ??
                $senderEmail
            )
        );

        /*
        |----------------------------------------------------------
        | Validate configuration
        |----------------------------------------------------------
        */

        if (
            $smtpUsername === "" ||
            $smtpPassword === ""
        ) {
            throw new RuntimeException(
                "Brevo SMTP credentials are missing."
            );
        }

        if (
            !filter_var(
                $senderEmail,
                FILTER_VALIDATE_EMAIL
            )
        ) {
            throw new RuntimeException(
                "The Brevo sender email is missing or invalid."
            );
        }

        if (
            !filter_var(
                $replyToEmail,
                FILTER_VALIDATE_EMAIL
            )
        ) {
            throw new RuntimeException(
                "The reply-to email is invalid."
            );
        }

        /*
        |----------------------------------------------------------
        | Brevo SMTP configuration
        |----------------------------------------------------------
        */

        $mail->isSMTP();

        $mail->Host =
            "smtp-relay.brevo.com";

        $mail->SMTPAuth =
            true;

        $mail->Username =
            $smtpUsername;

        $mail->Password =
            $smtpPassword;

        $mail->SMTPSecure =
            PHPMailer::ENCRYPTION_STARTTLS;

        $mail->Port =
            587;

        $mail->CharSet =
            "UTF-8";

        /*
        |----------------------------------------------------------
        | Sender and recipient
        |----------------------------------------------------------
        */

        $mail->setFrom(
            $senderEmail,
            $senderName
        );

        $mail->addReplyTo(
            $replyToEmail,
            $senderName . " Support"
        );

        $mail->addAddress(
            $toEmail
        );

        /*
        |----------------------------------------------------------
        | Email content
        |----------------------------------------------------------
        */

        $mail->isHTML(true);

        $mail->Subject =
            trim($subject);

        $mail->Body =
            $htmlBody;

        $mail->AltBody =
            trim(
                html_entity_decode(
                    strip_tags($htmlBody),
                    ENT_QUOTES,
                    "UTF-8"
                )
            );

        /*
        |----------------------------------------------------------
        | Send
        |----------------------------------------------------------
        */

        $mail->send();

        return true;
    } catch (\Throwable $error) {
        error_log(
            "Brevo SMTP exception: " .
            $error->getMessage()
        );

        error_log(
            "Brevo PHPMailer error: " .
            $mail->ErrorInfo
        );

        return false;
    }
}