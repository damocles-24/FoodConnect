<?php

declare(strict_types=1);

header(
    "Content-Type: application/json; charset=utf-8"
);

header(
    "Cache-Control: no-store, no-cache, must-revalidate, max-age=0"
);

require_once __DIR__ . "/session_config.php";
require_once __DIR__ . "/db.php";

$geoapifyConfigFile =
    __DIR__ .
    "/config/geoapify.local.php";

if (!is_file($geoapifyConfigFile)) {
    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" =>
            "Geoapify configuration is missing."
    ]);

    exit;
}

$geoapifyConfig =
    require $geoapifyConfigFile;

$geoapifyApiKey = trim(
    (string)(
        $geoapifyConfig["api_key"] ?? ""
    )
);

if (
    $geoapifyApiKey === "" ||
    $geoapifyApiKey ===
        "PASTE_YOUR_GEOAPIFY_API_KEY_HERE"
) {
    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" =>
            "Geoapify API key is not configured."
    ]);

    exit;
}

/* =========================================================
   JSON RESPONSE
========================================================= */

function respond_json(
    array $data,
    int $statusCode = 200
): void {
    http_response_code($statusCode);

    echo json_encode(
        $data,
        JSON_UNESCAPED_UNICODE |
        JSON_UNESCAPED_SLASHES
    );

    exit;
}

/* =========================================================
   REQUEST METHOD
========================================================= */

if (
    strtoupper(
        (string)($_SERVER["REQUEST_METHOD"] ?? "")
    ) !== "POST"
) {
    respond_json([
        "success" => false,
        "message" =>
            "This action is not available."
    ], 405);
}

/* =========================================================
   AUTHENTICATION
========================================================= */

if (empty($_SESSION["user_id"])) {
    respond_json([
        "success" => false,
        "message" =>
            "Please log in before searching for a delivery address."
    ], 401);
}



/* =========================================================
   REQUEST DATA
========================================================= */

$input = json_decode(
    file_get_contents("php://input"),
    true
);

if (!is_array($input)) {
    respond_json([
        "success" => false,
        "message" =>
            "Invalid address search request."
    ], 400);
}

$query = trim(
    (string)($input["query"] ?? "")
);

/* Collapse repeated spaces. */
$query = preg_replace(
    "/\s+/u",
    " ",
    $query
);

if (!is_string($query)) {
    $query = "";
}

$queryLength = function_exists("mb_strlen")
    ? mb_strlen($query)
    : strlen($query);

if ($queryLength < 3) {
    respond_json([
        "success" => false,
        "message" =>
            "Enter at least 3 characters to search for an address."
    ], 400);
}

if ($queryLength > 180) {
    respond_json([
        "success" => false,
        "message" =>
            "The address search is too long."
    ], 400);
}

/* =========================================================
   CHECK ADDRESS CACHE FIRST
========================================================= */

$normalizedQuery =
    normalize_address_query(
        $query
    );

$cachedLocations =
    load_cached_addresses(
        $conn,
        $normalizedQuery
    );

if (!empty($cachedLocations)) {
    respond_json([
        "success" => true,

        "message" =>
            "Address results loaded successfully.",

        "searched_query" =>
            $query,

        "attempted_queries" => [
            $query
        ],

        "source" =>
            "cache",

        "locations" =>
            $cachedLocations
    ]);
}

/* =========================================================
   ADDRESS CACHE HELPERS

   Compatible with PHP 7.2+ and MariaDB 10.1+.
========================================================= */

function normalize_address_query(
    string $query
): string {
    $normalizedQuery = trim($query);

    $collapsedQuery = preg_replace(
        "/\s+/u",
        " ",
        $normalizedQuery
    );

    if (is_string($collapsedQuery)) {
        $normalizedQuery =
            $collapsedQuery;
    }

    if (function_exists("mb_strtolower")) {
        return mb_strtolower(
            $normalizedQuery,
            "UTF-8"
        );
    }

    return strtolower(
        $normalizedQuery
    );
}

function load_cached_addresses(
    mysqli $conn,
    string $normalizedQuery
): array {
    $sql = "
        SELECT
            cache_id,
            display_name,
            latitude,
            longitude,
            road,
            barangay,
            city,
            province,
            place_type,
            category
        FROM tbl_address_cache
        WHERE normalized_query = ?
          AND (
              expires_at IS NULL
              OR expires_at > NOW()
          )
        ORDER BY result_position ASC
        LIMIT 5
    ";

    $statement =
        $conn->prepare($sql);

    if (!$statement) {
        error_log(
            "Address cache prepare error: " .
            $conn->error
        );

        return [];
    }

    $statement->bind_param(
        "s",
        $normalizedQuery
    );

    if (!$statement->execute()) {
        error_log(
            "Address cache query error: " .
            $statement->error
        );

        $statement->close();

        return [];
    }

    $result =
        $statement->get_result();

    $locations = [];
    $cacheIds = [];

    while (
        $row = $result->fetch_assoc()
    ) {
        $cacheIds[] =
            (int)$row["cache_id"];

        $locations[] = [
            "display_name" =>
                (string)$row["display_name"],

            "latitude" =>
                (float)$row["latitude"],

            "longitude" =>
                (float)$row["longitude"],

            "road" =>
                (string)($row["road"] ?? ""),

            "barangay" =>
                (string)($row["barangay"] ?? ""),

            "city" =>
                (string)($row["city"] ?? ""),

            "province" =>
                (string)($row["province"] ?? ""),

            "place_type" =>
                (string)($row["place_type"] ?? ""),

            "category" =>
                (string)($row["category"] ?? "")
        ];
    }

    $statement->close();

    if (!empty($cacheIds)) {
        /*
         * The values came from our own integer primary keys.
         * Casting above prevents SQL injection here.
         */
        $cacheIdList =
            implode(
                ",",
                $cacheIds
            );

        $updateSql = "
            UPDATE tbl_address_cache
            SET
                hit_count = hit_count + 1,
                last_used_at = NOW()
            WHERE cache_id IN (
                {$cacheIdList}
            )
        ";

        if (!$conn->query($updateSql)) {
            error_log(
                "Address cache usage update error: " .
                $conn->error
            );
        }
    }

    return $locations;
}

function save_addresses_to_cache(
    mysqli $conn,
    string $normalizedQuery,
    string $originalQuery,
    array $locations
): void {
    if (empty($locations)) {
        return;
    }

    $sql = "
        INSERT INTO tbl_address_cache (
            normalized_query,
            original_query,
            result_position,
            display_name,
            latitude,
            longitude,
            road,
            barangay,
            city,
            province,
            place_type,
            category,
            provider,
            hit_count,
            created_at,
            last_used_at,
            expires_at
        )
        VALUES (
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            'geoapify',
            0,
            NOW(),
            NOW(),
            DATE_ADD(
                NOW(),
                INTERVAL 30 DAY
            )
        )
        ON DUPLICATE KEY UPDATE
            original_query =
                VALUES(original_query),

            result_position =
                VALUES(result_position),

            display_name =
                VALUES(display_name),

            road =
                VALUES(road),

            barangay =
                VALUES(barangay),

            city =
                VALUES(city),

            province =
                VALUES(province),

            place_type =
                VALUES(place_type),

            category =
                VALUES(category),

            provider =
                'geoapify',

            last_used_at =
                NOW(),

            expires_at =
                DATE_ADD(
                    NOW(),
                    INTERVAL 30 DAY
                )
    ";

    $statement =
        $conn->prepare($sql);

    if (!$statement) {
        error_log(
            "Address cache insert prepare error: " .
            $conn->error
        );

        return;
    }

    foreach (
        array_values($locations)
        as $index => $location
    ) {
        $resultPosition =
            $index + 1;

        $displayName = trim(
            (string)(
                $location["display_name"] ?? ""
            )
        );

        $latitude =
            (float)(
                $location["latitude"] ?? 0
            );

        $longitude =
            (float)(
                $location["longitude"] ?? 0
            );

        $road = trim(
            (string)(
                $location["road"] ?? ""
            )
        );

        $barangay = trim(
            (string)(
                $location["barangay"] ?? ""
            )
        );

        $city = trim(
            (string)(
                $location["city"] ?? ""
            )
        );

        $province = trim(
            (string)(
                $location["province"] ?? ""
            )
        );

        $placeType = trim(
            (string)(
                $location["place_type"] ?? ""
            )
        );

        $category = trim(
            (string)(
                $location["category"] ?? ""
            )
        );

        if (
            $displayName === "" ||
            $latitude < -90 ||
            $latitude > 90 ||
            $longitude < -180 ||
            $longitude > 180
        ) {
            continue;
        }

        $statement->bind_param(
            "ssisddssssss",
            $normalizedQuery,
            $originalQuery,
            $resultPosition,
            $displayName,
            $latitude,
            $longitude,
            $road,
            $barangay,
            $city,
            $province,
            $placeType,
            $category
        );

        if (!$statement->execute()) {
            error_log(
                "Address cache insert error: " .
                $statement->error
            );
        }
    }

    $statement->close();
}

/* =========================================================
   EXTERNAL ADDRESS SEARCH RATE LIMIT

   Applied only after a cache miss.
========================================================= */

$currentTime =
    microtime(true);

$lastSearchTime = isset(
    $_SESSION[
        "delivery_address_last_search"
    ]
)
    ? (float)$_SESSION[
        "delivery_address_last_search"
    ]
    : 0.0;

if (
    $lastSearchTime > 0 &&
    ($currentTime - $lastSearchTime) < 1.0
) {
    respond_json([
        "success" => false,
        "message" =>
            "Please wait a moment before searching again."
    ], 429);
}

$_SESSION[
    "delivery_address_last_search"
] = $currentTime;

/* =========================================================
   GEOAPIFY SEARCH HELPER

   PHP 7.4 and PHP 8 compatible.
========================================================= */

function search_geoapify(
    string $searchQuery,
    string $apiKey
): array {
    /*
     * Alaminos City approximate center:
     * longitude first, then latitude.
     */
    $alaminosLongitude =
        119.9801;

    $alaminosLatitude =
        16.1552;

    $parameters = http_build_query([
        "text" =>
            $searchQuery,

        "format" =>
            "json",

        "lang" =>
            "en",

        "limit" =>
            5,

        /*
         * Restrict results to the Philippines.
         */
        "filter" =>
            "countrycode:ph",

        /*
         * Prioritize results near Alaminos City.
         */
        "bias" =>
            "proximity:" .
            $alaminosLongitude .
            "," .
            $alaminosLatitude,

        "apiKey" =>
            $apiKey
    ]);

    $url =
        "https://api.geoapify.com/v1/geocode/search?" .
        $parameters;

    $curl =
        curl_init();

    if ($curl === false) {
        return [
            "success" => false,
            "http_status" => 0,
            "error" =>
                "Unable to initialize Geoapify.",
            "results" => []
        ];
    }

    curl_setopt_array($curl, [
        CURLOPT_URL =>
            $url,

        CURLOPT_RETURNTRANSFER =>
            true,

        CURLOPT_FOLLOWLOCATION =>
            true,

        CURLOPT_CONNECTTIMEOUT =>
            8,

        CURLOPT_TIMEOUT =>
            15,

        CURLOPT_HTTPHEADER => [
            "Accept: application/json"
        ],

        CURLOPT_SSL_VERIFYPEER =>
            true,

        CURLOPT_SSL_VERIFYHOST =>
            2
    ]);

    $responseBody =
        curl_exec($curl);

    $curlError =
        curl_error($curl);

    $httpStatus =
        (int)curl_getinfo(
            $curl,
            CURLINFO_HTTP_CODE
        );

    curl_close($curl);

    if ($responseBody === false) {
        return [
            "success" => false,
            "http_status" =>
                $httpStatus,
            "error" =>
                $curlError,
            "results" => []
        ];
    }

    if ($httpStatus !== 200) {
        return [
            "success" => false,
            "http_status" =>
                $httpStatus,
            "error" =>
                "Geoapify returned HTTP " .
                $httpStatus .
                ".",
            "results" => []
        ];
    }

    $decodedResponse =
        json_decode(
            $responseBody,
            true
        );

    if (!is_array($decodedResponse)) {
        return [
            "success" => false,
            "http_status" =>
                $httpStatus,
            "error" =>
                "Geoapify returned invalid JSON.",
            "results" => []
        ];
    }

    $results =
        $decodedResponse["results"] ?? [];

    if (!is_array($results)) {
        $results = [];
    }

    return [
        "success" => true,
        "http_status" =>
            $httpStatus,
        "error" => "",
        "results" =>
            $results
    ];
}
/* =========================================================
   BUILD SEARCH FALLBACKS
========================================================= */

$queryContextText =
    normalize_address_query(
        $query
    );

$hasAlaminosContext =
    strpos(
        $queryContextText,
        "alaminos"
    ) !== false;

$hasPangasinanContext =
    strpos(
        $queryContextText,
        "pangasinan"
    ) !== false;

$hasPhilippinesContext =
    strpos(
        $queryContextText,
        "philippines"
    ) !== false;

/*
 * Search using the most complete local address first.
 *
 * This prevents common names such as "Poblacion" from
 * matching another province before Alaminos.
 */
$searchQueries = [];

if (
    $hasAlaminosContext &&
    !$hasPangasinanContext
) {
    $searchQueries[] =
        $query .
        ", Pangasinan, Philippines";
} elseif (!$hasAlaminosContext) {
    $searchQueries[] =
        $query .
        ", Alaminos, Pangasinan, Philippines";
} elseif (!$hasPhilippinesContext) {
    $searchQueries[] =
        $query .
        ", Philippines";
}

/*
 * Use the customer's exact wording only as a fallback.
 */
$searchQueries[] =
    $query;

/*
 * Remove duplicate query strings while preserving order.
 */
$searchQueries =
    array_values(
        array_unique($searchQueries)
    );

/*
 * Maximum three attempts so one customer search does not
 * produce too many external requests.
 */
$searchQueries =
    array_slice(
        $searchQueries,
        0,
        3
    );

/* =========================================================
   RUN SEARCH ATTEMPTS
========================================================= */

$results = [];
$usedSearchQuery = $query;
$lastProviderError = "";

foreach (
    $searchQueries as $index =>
    $candidateQuery
) {
    /*
     * Respect the external service's request-rate limit
     * between fallback attempts.
     */
    if ($index > 0) {
        usleep(1100000);
    }

    $providerResponse =
    search_geoapify(
        $candidateQuery,
        $geoapifyApiKey
    );

    if (
        $providerResponse["success"] !== true
    ) {
        $lastProviderError =
            (string)(
                $providerResponse["error"] ?? ""
            );

        error_log(
            "Geoapify search error: " .
            $lastProviderError
        );

        continue;
    }

    $candidateResults =
        $providerResponse["results"] ?? [];

    if (
        is_array($candidateResults) &&
        !empty($candidateResults)
    ) {
        $results =
            $candidateResults;

        $usedSearchQuery =
            $candidateQuery;

        break;
    }
}

if (
    empty($results) &&
    $lastProviderError !== ""
) {
    respond_json([
        "success" => false,
        "message" =>
            "The address search service is temporarily unavailable."
    ], 502);
}


/* =========================================================
   SANITIZE RESULTS

   Return only the fields FoodConnect needs.
========================================================= */

$locations = [];

foreach ($results as $result) {
    if (!is_array($result)) {
        continue;
    }

    $latitude =
        filter_var(
            $result["lat"] ?? null,
            FILTER_VALIDATE_FLOAT
        );

    $longitude =
        filter_var(
            $result["lon"] ?? null,
            FILTER_VALIDATE_FLOAT
        );

    $displayName = trim(
        (string)(
            $result["formatted"] ??
            $result["address_line2"] ??
            $result["address_line1"] ??
            ""
        )
    );

    if (
        $latitude === false ||
        $longitude === false ||
        $displayName === ""
    ) {
        continue;
    }

    if (
        $latitude < -90 ||
        $latitude > 90 ||
        $longitude < -180 ||
        $longitude > 180
    ) {
        continue;
    }

    $road = trim(
        (string)(
            $result["street"] ??
            $result["address_line1"] ??
            ""
        )
    );

    $barangay = trim(
        (string)(
            $result["suburb"] ??
            $result["district"] ??
            $result["village"] ??
            ""
        )
    );

    $city = trim(
        (string)(
            $result["city"] ??
            $result["town"] ??
            $result["municipality"] ??
            ""
        )
    );

    $province = trim(
        (string)(
            $result["state"] ??
            ""
        )
    );

    $placeType = trim(
        (string)(
            $result["result_type"] ??
            $result["category"] ??
            ""
        )
    );

    $locations[] = [
        "display_name" =>
            $displayName,

        "latitude" =>
            (float)$latitude,

        "longitude" =>
            (float)$longitude,

        "place_type" =>
            $placeType,

        "category" =>
            trim(
                (string)(
                    $result["category"] ??
                    ""
                )
            ),

        "road" =>
            $road,

        "barangay" =>
            $barangay,

        "city" =>
            $city,

        "province" =>
            $province
    ];
}

/* =========================================================
   SAVE SUCCESSFUL RESULTS TO CACHE
========================================================= */

if (!empty($locations)) {
    save_addresses_to_cache(
        $conn,
        $normalizedQuery,
        $query,
        $locations
    );
}

respond_json([
    "success" => true,

    "message" =>
        empty($locations)
            ? "No matching address was found."
            : "Address results loaded successfully.",

    "searched_query" =>
    $usedSearchQuery,

"attempted_queries" =>
    $searchQueries,

"source" =>
    "geoapify",

"locations" =>
    $locations
]);