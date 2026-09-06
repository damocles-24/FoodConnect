<?php

require_once __DIR__ . '/env.php';

return [
    "api_key" => $_ENV["GEOAPIFY_API_KEY"] ?? ""
];