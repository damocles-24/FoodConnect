<?php

declare(strict_types=1);

$rootPath = dirname(__DIR__, 2);

require_once $rootPath . '/vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable($rootPath);
$dotenv->load();