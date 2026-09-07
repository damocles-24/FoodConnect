<?php

declare(strict_types=1);

$projectRoot = dirname(__DIR__, 2);

require_once $projectRoot . '/vendor/autoload.php';

/*
 * Prefer an .env outside the public web directory.
 *
 * Production:
 * /home/foodbbfd/.env
 *
 * Local fallback:
 * C:\xampp\htdocs\FoodConnect\.env
 */

$outsideWebRoot = dirname($projectRoot);

if (is_file($outsideWebRoot . '/.env')) {
    $envPath = $outsideWebRoot;
} elseif (is_file($projectRoot . '/.env')) {
    $envPath = $projectRoot;
} else {
    throw new RuntimeException(
        'Environment configuration file (.env) was not found.'
    );
}

$dotenv = Dotenv\Dotenv::createImmutable($envPath);
$dotenv->load();