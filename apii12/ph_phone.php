<?php
declare(strict_types=1);

function normalize_ph_mobile($value): string
{
    $raw = trim((string)$value);

    if ($raw === '') {
        return '';
    }

    $digits = preg_replace('/\D+/', '', $raw);

    if (!is_string($digits) || $digits === '') {
        return '';
    }

    if (strpos($digits, '63') === 0) {
        $digits = substr($digits, 2);
    }

    if (strpos($digits, '0') === 0) {
        $digits = substr($digits, 1);
    }

    if (!preg_match('/^9\d{9}$/', $digits)) {
        return '';
    }

    return '+63' . $digits;
}

function is_valid_ph_mobile($value): bool
{
    return normalize_ph_mobile($value) !== '';
}

function ph_mobile_for_output($value): string
{
    $raw = trim((string)$value);

    if ($raw === '') {
        return '';
    }

    $normalized = normalize_ph_mobile($raw);

    return $normalized !== '' ? $normalized : $raw;
}
