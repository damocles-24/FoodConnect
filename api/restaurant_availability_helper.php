<?php

/**
 * FoodConnect restaurant schedule availability helper.
 *
 * Owner Settings already serializes the weekly schedule into
 * tbl_restaurants.opening_hours, for example:
 *   Mon-Sat 8:00 AM-8:00 PM; Sun Closed
 *
 * This helper turns that stored value into an authoritative
 * customer-ordering status using Philippine local time.
 */

function fc_restaurant_schedule_days(): array
{
    return [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday"
    ];
}

function fc_restaurant_normalize_day_token(string $token): ?string
{
    $token = strtolower(trim($token));

    $map = [
        "mon" => "monday",
        "monday" => "monday",
        "tue" => "tuesday",
        "tues" => "tuesday",
        "tuesday" => "tuesday",
        "wed" => "wednesday",
        "wednesday" => "wednesday",
        "thu" => "thursday",
        "thur" => "thursday",
        "thurs" => "thursday",
        "thursday" => "thursday",
        "fri" => "friday",
        "friday" => "friday",
        "sat" => "saturday",
        "saturday" => "saturday",
        "sun" => "sunday",
        "sunday" => "sunday"
    ];

    return $map[$token] ?? null;
}

function fc_restaurant_expand_day_expression(string $expression): array
{
    $days = fc_restaurant_schedule_days();
    $result = [];

    foreach (preg_split('/\s*,\s*/u', trim($expression)) ?: [] as $part) {
        if ($part === '') {
            continue;
        }

        $range = preg_split('/\s*[-–—]\s*/u', trim($part));

        if (is_array($range) && count($range) === 2) {
            $startDay = fc_restaurant_normalize_day_token((string) $range[0]);
            $endDay = fc_restaurant_normalize_day_token((string) $range[1]);

            if ($startDay !== null && $endDay !== null) {
                $startIndex = array_search($startDay, $days, true);
                $endIndex = array_search($endDay, $days, true);

                if ($startIndex !== false && $endIndex !== false) {
                    if ($startIndex <= $endIndex) {
                        for ($i = $startIndex; $i <= $endIndex; $i++) {
                            $result[] = $days[$i];
                        }
                    } else {
                        for ($i = $startIndex; $i < count($days); $i++) {
                            $result[] = $days[$i];
                        }

                        for ($i = 0; $i <= $endIndex; $i++) {
                            $result[] = $days[$i];
                        }
                    }

                    continue;
                }
            }
        }

        $day = fc_restaurant_normalize_day_token(trim($part));

        if ($day !== null) {
            $result[] = $day;
        }
    }

    return array_values(array_unique($result));
}

function fc_restaurant_time_to_minutes(string $value): ?int
{
    $value = strtoupper(trim(preg_replace('/\s+/u', ' ', $value) ?? $value));

    if (
        preg_match(
            '/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/i',
            $value,
            $match
        ) === 1
    ) {
        $hour = (int) $match[1];
        $minute = isset($match[2]) && $match[2] !== ''
            ? (int) $match[2]
            : 0;

        if ($hour < 1 || $hour > 12 || $minute < 0 || $minute > 59) {
            return null;
        }

        if ($hour === 12) {
            $hour = 0;
        }

        if (strtoupper($match[3]) === 'PM') {
            $hour += 12;
        }

        return ($hour * 60) + $minute;
    }

    if (
        preg_match(
            '/^([01]?\d|2[0-3]):([0-5]\d)$/',
            $value,
            $match
        ) === 1
    ) {
        return ((int) $match[1] * 60) + (int) $match[2];
    }

    return null;
}

/**
 * @return array<string,array{closed:bool,open:?int,close:?int}>|null
 */
function fc_restaurant_parse_opening_hours(string $openingHours): ?array
{
    $text = trim($openingHours);

    if (
        $text === '' ||
        preg_match('/^configured\s+(in|during)\b/i', $text) === 1
    ) {
        return null;
    }

    $days = fc_restaurant_schedule_days();
    $schedule = [];

    foreach ($days as $day) {
        $schedule[$day] = [
            'closed' => true,
            'open' => null,
            'close' => null
        ];
    }

    $matchedAny = false;

    foreach (preg_split('/\s*;\s*/u', $text) ?: [] as $segment) {
        $segment = trim($segment);

        if ($segment === '') {
            continue;
        }

        if (
            preg_match('/^(.+?)\s+closed$/iu', $segment, $closedMatch) === 1
        ) {
            $closedDays = fc_restaurant_expand_day_expression($closedMatch[1]);

            foreach ($closedDays as $day) {
                $schedule[$day] = [
                    'closed' => true,
                    'open' => null,
                    'close' => null
                ];
            }

            if ($closedDays !== []) {
                $matchedAny = true;
            }

            continue;
        }

        $timePattern = '(\d{1,2}(?::\d{2})?\s*(?:AM|PM)|(?:[01]?\d|2[0-3]):[0-5]\d)';

        if (
            preg_match(
                '/^(?:(.+?)\s+)?' . $timePattern . '\s*[-–—]\s*' . $timePattern . '$/iu',
                $segment,
                $timeMatch
            ) !== 1
        ) {
            continue;
        }

        $dayExpression = trim((string) ($timeMatch[1] ?? ''));
        $openMinutes = fc_restaurant_time_to_minutes((string) ($timeMatch[2] ?? ''));
        $closeMinutes = fc_restaurant_time_to_minutes((string) ($timeMatch[3] ?? ''));

        if ($openMinutes === null || $closeMinutes === null) {
            continue;
        }

        $targetDays = $dayExpression === ''
            ? $days
            : fc_restaurant_expand_day_expression($dayExpression);

        foreach ($targetDays as $day) {
            $schedule[$day] = [
                'closed' => false,
                'open' => $openMinutes,
                'close' => $closeMinutes
            ];
        }

        if ($targetDays !== []) {
            $matchedAny = true;
        }
    }

    return $matchedAny ? $schedule : null;
}

/**
 * @param array<string,array{closed:bool,open:?int,close:?int}> $schedule
 */
function fc_restaurant_schedule_is_open(
    array $schedule,
    DateTimeInterface $now
): bool {
    $today = strtolower($now->format('l'));
    $currentMinutes = ((int) $now->format('G') * 60) + (int) $now->format('i');

    $todaySchedule = $schedule[$today] ?? null;

    if (
        is_array($todaySchedule) &&
        empty($todaySchedule['closed']) &&
        isset($todaySchedule['open'], $todaySchedule['close'])
    ) {
        $open = (int) $todaySchedule['open'];
        $close = (int) $todaySchedule['close'];

        if ($open === $close) {
            return true;
        }

        if ($close > $open) {
            if ($currentMinutes >= $open && $currentMinutes < $close) {
                return true;
            }
        } elseif ($currentMinutes >= $open) {
            return true;
        }
    }

    /*
     * Support overnight schedules such as 6:00 PM-2:00 AM.
     * The early-morning portion belongs to the previous day's shift.
     */
    $previous = DateTimeImmutable::createFromInterface($now)->modify('-1 day');
    $previousDay = strtolower($previous->format('l'));
    $previousSchedule = $schedule[$previousDay] ?? null;

    if (
        is_array($previousSchedule) &&
        empty($previousSchedule['closed']) &&
        isset($previousSchedule['open'], $previousSchedule['close'])
    ) {
        $previousOpen = (int) $previousSchedule['open'];
        $previousClose = (int) $previousSchedule['close'];

        if (
            $previousClose < $previousOpen &&
            $currentMinutes < $previousClose
        ) {
            return true;
        }
    }

    return false;
}

function fc_restaurant_evaluate_availability(
    string $businessStatus,
    string $openingHours,
    ?DateTimeInterface $now = null
): array {
    $manualStatus = trim($businessStatus);
    $manualNormalized = strtolower($manualStatus);

    if ($manualNormalized !== 'open') {
        return [
            'is_accepting_orders' => false,
            'customer_status' => $manualNormalized === 'temporarily unavailable'
                ? 'Temporarily Unavailable'
                : 'Closed',
            'availability_reason' => 'manual_status',
            'schedule_parsed' => false
        ];
    }

    $schedule = fc_restaurant_parse_opening_hours($openingHours);

    /*
     * Legacy/unrecognized hours should not unexpectedly close an otherwise
     * manually-open restaurant. Once Owner Settings writes the structured
     * weekly format, the schedule becomes authoritative automatically.
     */
    if ($schedule === null) {
        return [
            'is_accepting_orders' => true,
            'customer_status' => 'Open',
            'availability_reason' => 'manual_fallback',
            'schedule_parsed' => false
        ];
    }

    if ($now === null) {
        $now = new DateTimeImmutable(
            'now',
            new DateTimeZone('Asia/Manila')
        );
    } else {
        $now = DateTimeImmutable::createFromInterface($now)
            ->setTimezone(new DateTimeZone('Asia/Manila'));
    }

    $isOpen = fc_restaurant_schedule_is_open($schedule, $now);

    return [
        'is_accepting_orders' => $isOpen,
        'customer_status' => $isOpen ? 'Open' : 'Closed',
        'availability_reason' => $isOpen ? 'schedule_open' : 'schedule_closed',
        'schedule_parsed' => true
    ];
}

function fc_restaurant_unavailable_message(array $availability): string
{
    $status = strtolower((string) ($availability['customer_status'] ?? 'closed'));
    $reason = (string) ($availability['availability_reason'] ?? '');

    if ($status === 'temporarily unavailable') {
        return 'This restaurant is temporarily unavailable.';
    }

    if ($reason === 'schedule_closed') {
        return 'This restaurant is currently closed based on its operating schedule.';
    }

    return 'This restaurant is not currently accepting orders.';
}
