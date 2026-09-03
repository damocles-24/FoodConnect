<?php
header("Content-Type: application/json; charset=utf-8");
header("Cache-Control: no-store, no-cache, must-revalidate");
header("Pragma: no-cache");

error_reporting(E_ALL & ~E_NOTICE & ~E_WARNING);
ini_set("display_errors", "0");

if (session_status() !== PHP_SESSION_ACTIVE) {
    session_set_cookie_params([
        "lifetime" => 0,
        "path" => "/",
        "domain" => "",
        "secure" => false,
        "httponly" => true,
        "samesite" => "Lax"
    ]);

   require_once __DIR__ . "/session_config.php";
}

require_once __DIR__ . "/db.php";

if (!isset($_SESSION["user_id"])) {
    http_response_code(401);
    echo json_encode([
        "success" => false,
        "message" => "Your session has expired or you do not have access. Please log in again."
    ]);
    exit;
}

$restaurant_id = isset($_SESSION["restaurant_id"])
    ? (int) $_SESSION["restaurant_id"]
    : 0;

if ($restaurant_id <= 0) {
    echo json_encode([
        "success" => false,
        "message" => "Your restaurant session has expired. Please log in again."
    ]);
    exit;
}

try {
   $sql = "
    SELECT
        restaurant_id,
        owner_id,
        name,
        logo_path,
        banner_path,
        address,
        contact_number,
        opening_hours,
        delivery_fee,
        business_status
    FROM tbl_restaurants
    WHERE restaurant_id = ?
    LIMIT 1
";

    $stmt = $conn->prepare($sql);

    if (!$stmt) {
        throw new Exception($conn->error);
    }

    $stmt->bind_param("i", $restaurant_id);
    $stmt->execute();

    $result = $stmt->get_result();
    $restaurant = $result->fetch_assoc();

    if (!$restaurant) {
        echo json_encode([
            "success" => false,
            "message" => "Restaurant not found."
        ]);
        exit;
    }

    /*
     * Older FoodConnect restaurant records used the placeholder
     * "Configured in restaurant setup". Recover the real schedule
     * from the owner's latest partner application and backfill it once.
     */
    $openingHours = trim((string) ($restaurant["opening_hours"] ?? ""));
    $needsHoursRecovery =
        $openingHours === "" ||
        strcasecmp($openingHours, "Configured in restaurant setup") === 0;

    if ($needsHoursRecovery && !empty($restaurant["owner_id"])) {
        $hoursStmt = $conn->prepare("
            SELECT business_hours_json
            FROM tbl_partner_applications
            WHERE owner_id = ?
            ORDER BY application_id DESC
            LIMIT 1
        ");

        if ($hoursStmt) {
            $ownerId = (int) $restaurant["owner_id"];
            $hoursStmt->bind_param("i", $ownerId);
            $hoursStmt->execute();
            $hoursRow = $hoursStmt->get_result()->fetch_assoc();
            $hoursStmt->close();

            $hours = json_decode(
                (string) ($hoursRow["business_hours_json"] ?? ""),
                true
            );

            if (is_array($hours) && !empty($hours)) {
                $dayNames = [
                    "Monday", "Tuesday", "Wednesday", "Thursday",
                    "Friday", "Saturday", "Sunday"
                ];
                $shortDays = [
                    "Monday" => "Mon", "Tuesday" => "Tue",
                    "Wednesday" => "Wed", "Thursday" => "Thu",
                    "Friday" => "Fri", "Saturday" => "Sat",
                    "Sunday" => "Sun"
                ];

                $formatTime = static function ($time): string {
                    $time = trim((string) $time);
                    $date = DateTime::createFromFormat("H:i", $time);
                    return $date ? $date->format("g:i A") : $time;
                };

                $entries = [];
                foreach ($dayNames as $day) {
                    $row = isset($hours[$day]) && is_array($hours[$day])
                        ? $hours[$day]
                        : [];
                    $closed = !empty($row["closed"]);
                    $entries[] = [
                        "day" => $day,
                        "closed" => $closed,
                        "open" => $row["open"] ?? null,
                        "close" => $row["close"] ?? null,
                        "signature" => $closed
                            ? "closed"
                            : trim((string) ($row["open"] ?? "")) . "|" .
                              trim((string) ($row["close"] ?? ""))
                    ];
                }

                $groups = [];
                for ($start = 0; $start < count($entries);) {
                    $end = $start;
                    while (
                        $end + 1 < count($entries) &&
                        $entries[$end + 1]["signature"] === $entries[$start]["signature"]
                    ) {
                        $end++;
                    }

                    $first = $entries[$start];
                    $label = $shortDays[$entries[$start]["day"]];
                    if ($end > $start) {
                        $label .= "-" . $shortDays[$entries[$end]["day"]];
                    }

                    $groups[] = $first["closed"]
                        ? $label . " Closed"
                        : $label . " " . $formatTime($first["open"]) .
                          "-" . $formatTime($first["close"]);

                    $start = $end + 1;
                }

                $recovered = implode("; ", $groups);

                if (mb_strlen($recovered) > 100) {
                    $compact = [];
                    foreach ($entries as $entry) {
                        $label = $shortDays[$entry["day"]];
                        $compact[] = $entry["closed"]
                            ? $label . " Closed"
                            : $label . " " . trim((string) $entry["open"]) .
                              "-" . trim((string) $entry["close"]);
                    }
                    $recovered = mb_substr(implode(";", $compact), 0, 100);
                }

                if ($recovered !== "") {
                    $restaurant["opening_hours"] = $recovered;

                    $backfillStmt = $conn->prepare("
                        UPDATE tbl_restaurants
                        SET opening_hours = ?
                        WHERE restaurant_id = ?
                        LIMIT 1
                    ");

                    if ($backfillStmt) {
                        $backfillStmt->bind_param(
                            "si",
                            $recovered,
                            $restaurant_id
                        );
                        $backfillStmt->execute();
                        $backfillStmt->close();
                    }
                }
            }
        }
    }

    unset($restaurant["owner_id"]);

    echo json_encode([
        "success" => true,
        "restaurant" => $restaurant
    ]);

} catch (Throwable $e) {
    error_log("get_restaurant_settings.php error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Unable to load restaurant settings right now. Please try again."
    ]);
}