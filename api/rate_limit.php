<?php

declare(strict_types=1);

/**
 * FoodConnect database-backed fixed-window rate limiter.
 *
 * The limiter intentionally targets sensitive/write endpoints only.
 * Normal dashboard polling/read endpoints are not rate limited.
 */
function rate_limit_client_ip(): string
{
    $ip = trim((string)($_SERVER['REMOTE_ADDR'] ?? 'unknown'));

    return $ip !== '' ? $ip : 'unknown';
}

function rate_limit_identifier(string ...$parts): string
{
    $normalized = array_map(
        static function ($part) {
            return strtolower(
                trim((string)$part)
            );
        },
        $parts
    );

    return implode('|', $normalized);
}

function rate_limit_enforce(
    mysqli $conn,
    string $scope,
    string $identifier,
    int $maxRequests,
    int $windowSeconds,
    ?int $blockSeconds = null,
    string $message = 'Too many requests. Please wait a moment and try again.'
): void {
    $maxRequests = max(1, $maxRequests);
    $windowSeconds = max(1, $windowSeconds);
    $blockSeconds = max(1, $blockSeconds ?? $windowSeconds);

    $bucketKey = hash(
        'sha256',
        $scope . '|' . $identifier
    );

    $now = time();
    $blocked = false;
    $retryAfter = 0;

    try {
        $conn->begin_transaction();

        $select = $conn->prepare("\n            SELECT\n                hits,\n                UNIX_TIMESTAMP(window_started_at) AS window_start_ts,\n                UNIX_TIMESTAMP(blocked_until) AS blocked_until_ts\n            FROM tbl_rate_limits\n            WHERE rate_limit_key = ?\n            LIMIT 1\n            FOR UPDATE\n        ");

        if (!$select) {
            throw new RuntimeException(
                'Unable to prepare rate-limit lookup.'
            );
        }

        $select->bind_param('s', $bucketKey);
        $select->execute();
        $row = $select->get_result()->fetch_assoc();
        $select->close();

        if (!$row) {
            $insert = $conn->prepare("\n                INSERT INTO tbl_rate_limits (\n                    rate_limit_key,\n                    scope_name,\n                    hits,\n                    window_started_at,\n                    blocked_until,\n                    updated_at\n                ) VALUES (?, ?, 1, FROM_UNIXTIME(?), NULL, NOW())\n            ");

            if (!$insert) {
                throw new RuntimeException(
                    'Unable to prepare rate-limit bucket.'
                );
            }

            $insert->bind_param(
                'ssi',
                $bucketKey,
                $scope,
                $now
            );
            $insert->execute();
            $insert->close();
        } else {
            $hits = max(0, (int)($row['hits'] ?? 0));
            $windowStart = (int)($row['window_start_ts'] ?? 0);
            $blockedUntil = (int)($row['blocked_until_ts'] ?? 0);

            if ($blockedUntil > $now) {
                $blocked = true;
                $retryAfter = max(1, $blockedUntil - $now);
            } else {
                if (
                    $windowStart <= 0 ||
                    ($now - $windowStart) >= $windowSeconds
                ) {
                    $hits = 1;
                    $windowStart = $now;
                    $blockedUntil = 0;
                } else {
                    $hits++;

                    if ($hits > $maxRequests) {
                        $blocked = true;
                        $blockedUntil = $now + $blockSeconds;
                        $retryAfter = $blockSeconds;
                    }
                }

                $update = $conn->prepare("\n                    UPDATE tbl_rate_limits\n                    SET\n                        hits = ?,\n                        window_started_at = FROM_UNIXTIME(?),\n                        blocked_until = CASE\n                            WHEN ? > 0 THEN FROM_UNIXTIME(?)\n                            ELSE NULL\n                        END,\n                        updated_at = NOW()\n                    WHERE rate_limit_key = ?\n                ");

                if (!$update) {
                    throw new RuntimeException(
                        'Unable to prepare rate-limit update.'
                    );
                }

                $update->bind_param(
                    'iiiis',
                    $hits,
                    $windowStart,
                    $blockedUntil,
                    $blockedUntil,
                    $bucketKey
                );
                $update->execute();
                $update->close();
            }
        }

        $conn->commit();

        // Cheap probabilistic cleanup so the table stays small.
        // Cleanup failure must never affect the protected request.
        try {
            if (mt_rand(1, 100) === 1) {
                $conn->query("\n                    DELETE FROM tbl_rate_limits\n                    WHERE updated_at < (NOW() - INTERVAL 2 DAY)\n                    LIMIT 500\n                ");
            }
        } catch (Throwable $cleanupError) {
            error_log(
                'FoodConnect rate-limit cleanup error: ' .
                $cleanupError->getMessage()
            );
        }
    } catch (Throwable $error) {
        try {
            $conn->rollback();
        } catch (Throwable $ignored) {
        }

        error_log(
            'FoodConnect rate-limit error [' . $scope . ']: ' .
            $error->getMessage()
        );

        // Fail open if the limiter itself is unavailable so a limiter-table
        // issue cannot take the entire application offline.
        return;
    }

    if (!$blocked) {
        return;
    }

    header('Retry-After: ' . $retryAfter);
    http_response_code(429);

    echo json_encode([
        'success' => false,
        'message' => $message,
        'error' => $message,
        'retry_after' => $retryAfter
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

    exit;
}
