<?php

/**
 * FoodConnect account status (deactivate / reactivate) rules.
 *
 * ONE place that decides who may change whose status, which reasons are
 * accepted, and how the change and its history are saved. Every endpoint that
 * changes tbl_users.status for deactivation/reactivation must go through
 * fc_change_account_status() so that no endpoint can bypass the rules.
 *
 *   Account         Deactivate / Reactivate by
 *   --------------  ------------------------------------------------------
 *   owner           an administrator only
 *   cashier         the owner of the SAME restaurant only
 *   delivery_staff  the owner of the SAME restaurant only
 *   customer        the customer themself only
 *   admin           nobody through these endpoints
 *
 * REQUIRES the InnoDB migration
 * (database/migrations/2026-10-26_account_status_history_innodb.sql): the status
 * change and its history row must commit atomically, which MyISAM cannot do. Until
 * the migration has run, every status change is refused with HTTP 503 and nothing
 * is modified. The three optional audit columns it adds are detected at runtime.
 *
 * Deactivation is also refused while it would strand live orders or deliveries
 * (see fc_status_operation_blockers()).
 */

const FC_STATUS_STAFF_ROLES = ["cashier", "delivery_staff"];

const FC_STATUS_OTHER_REASON = "Other";

/**
 * Accepted reasons. The stored reason must be one of these values so a client
 * cannot write arbitrary text into the reason column. "Other" is accepted only
 * together with a written explanation (the note).
 */
function fc_status_reason_catalog(): array
{
    return [
        "owner" => [
            "deactivate" => [
                "Violation of FoodConnect Terms",
                "Suspicious account activity",
                "Incorrect restaurant information",
                "Restaurant permanently closed",
                "Owner requested account closure",
                FC_STATUS_OTHER_REASON,
            ],
            "reactivate" => [
                "Issue resolved",
                "Restaurant information corrected",
                "Owner appeal approved",
                "Deactivated by mistake",
                FC_STATUS_OTHER_REASON,
            ],
        ],
        "staff" => [
            "deactivate" => [
                "Employee resigned or left the restaurant",
                "Schedule or role change",
                "Policy violation",
                "Security concern",
                "Temporary suspension",
                FC_STATUS_OTHER_REASON,
            ],
            "reactivate" => [
                "Employee returned to work",
                "Issue resolved",
                "Deactivated by mistake",
                FC_STATUS_OTHER_REASON,
            ],
        ],
        "customer" => [
            "deactivate" => [
                "Taking a break from FoodConnect",
                "Privacy concerns",
                "Too many emails or notifications",
                "I have another account",
                "Not satisfied with the service",
                FC_STATUS_OTHER_REASON,
            ],
            "reactivate" => [
                "I want to order again",
                "I deactivated my account by mistake",
                "My concern was resolved",
                FC_STATUS_OTHER_REASON,
            ],
        ],
    ];
}

function fc_status_group_for_role(string $role): string
{
    $role = strtolower(trim($role));

    if ($role === "owner") {
        return "owner";
    }

    if (in_array($role, FC_STATUS_STAFF_ROLES, true)) {
        return "staff";
    }

    if ($role === "customer") {
        return "customer";
    }

    return "";
}

/**
 * Validate the reason/note sent by a client.
 *
 * @return array{ok:bool, reason?:string, note?:string, message?:string}
 */
function fc_status_validate_reason(
    string $group,
    string $action,
    $reason,
    $note
): array {
    $catalog = fc_status_reason_catalog();
    $allowed = $catalog[$group][$action] ?? [];

    $reason = is_string($reason) ? trim($reason) : "";
    $note = is_string($note) ? trim($note) : "";
    $note = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', "", $note) ?? "";

    if ($reason === "") {
        return [
            "ok" => false,
            "message" => $action === "deactivate"
                ? "Select a reason for deactivating this account."
                : "Select a reason for reactivating this account.",
        ];
    }

    if (!in_array($reason, $allowed, true)) {
        return [
            "ok" => false,
            "message" => "Select one of the listed reasons.",
        ];
    }

    if ($reason === FC_STATUS_OTHER_REASON && mb_strlen($note) < 5) {
        return [
            "ok" => false,
            "message" => "Please explain the reason when you select \"Other\" (at least 5 characters).",
        ];
    }

    if (mb_strlen($note) > 500) {
        return [
            "ok" => false,
            "message" => "Notes must not exceed 500 characters.",
        ];
    }

    return ["ok" => true, "reason" => $reason, "note" => $note];
}

/**
 * Optional columns that exist only after the migration. Detected once per
 * request so the code is safe both before and after the migration runs.
 */
function fc_status_history_columns(mysqli $conn): array
{
    static $columns = null;

    if ($columns !== null) {
        return $columns;
    }

    $columns = [];

    try {
        $result = $conn->query("SHOW FULL COLUMNS FROM tbl_account_status_history");

        if ($result) {
            while ($row = $result->fetch_assoc()) {
                $columns[(string)$row["Field"]] = true;

                if ((string)$row["Field"] === "note") {
                    $columns["_note_collation"] = (string)($row["Collation"] ?? "");
                }
            }

            $result->free();
        }
    } catch (Throwable $error) {
        error_log("account status history columns: " . $error->getMessage());
    }

    return $columns;
}

/**
 * The history row and the status change must commit or roll back together.
 * That is only true when tbl_account_status_history is InnoDB (the original
 * table is MyISAM, which ignores transactions). The InnoDB migration is
 * therefore a REQUIRED deployment step: until it has run, status changes are
 * refused (nothing is changed) rather than risking a status change without its
 * history row, or a history row without its status change.
 */
function fc_status_history_is_transactional(mysqli $conn): bool
{
    static $transactional = null;

    if ($transactional !== null) {
        return $transactional;
    }

    $transactional = false;

    try {
        $result = $conn->query(
            "SELECT ENGINE FROM information_schema.TABLES
             WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'tbl_account_status_history'
             LIMIT 1"
        );
        $row = $result ? $result->fetch_assoc() : null;

        if (!$row) {
            /* Some hosts hide information_schema rows; ask the table directly. */
            $status = $conn->query("SHOW TABLE STATUS LIKE 'tbl_account_status_history'");
            $statusRow = $status ? $status->fetch_assoc() : null;
            $row = $statusRow ? ["ENGINE" => $statusRow["Engine"] ?? ""] : null;
        }

        if ($row && strcasecmp((string)($row["ENGINE"] ?? ""), "InnoDB") === 0) {
            $transactional = true;
        }
    } catch (Throwable $error) {
        error_log("account status history engine check: " . $error->getMessage());
    }

    return $transactional;
}

/**
 * Number of rows a locking SELECT COUNT(*) returns. LOCK IN SHARE MODE reads the
 * latest committed rows (not an older snapshot) and blocks concurrent writers
 * until this transaction ends, which closes the race with order creation.
 */
function fc_status_locked_count(mysqli $conn, string $sql, string $types, array $params): int
{
    $stmt = $conn->prepare($sql . " LOCK IN SHARE MODE");

    if (!$stmt) {
        throw new RuntimeException("prepare count: " . $conn->error);
    }

    if ($types !== "") {
        $stmt->bind_param($types, ...$params);
    }

    if (!$stmt->execute()) {
        throw new RuntimeException("execute count failed: " . $stmt->error);
    }

    $row = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    return (int)($row["c"] ?? 0);
}

function fc_status_plural(int $count, string $singular, string $plural): string
{
    return $count . " " . ($count === 1 ? $singular : $plural);
}

/**
 * "5 min", "3 h", "2 days" for a number of seconds.
 */
function fc_status_age_text(int $seconds): string
{
    $seconds = max(0, $seconds);

    if ($seconds < 3600) {
        return max(1, intdiv($seconds, 60)) . " min";
    }

    if ($seconds < 172800) {
        return intdiv($seconds, 3600) . " h";
    }

    return intdiv($seconds, 86400) . " days";
}

/**
 * Read-only description of up to five live orders (oldest first) so the person who is
 * told "finish these first" knows exactly which ones. Nothing here changes any data;
 * orders are resolved through the normal cashier cancel/complete workflow.
 *
 * $where is a fixed fragment written by this file ("o.user_id = ?" or
 * "o.restaurant_id IN (?,?)"); user input only ever reaches bind_param().
 *
 * @return array<int,array{order_id:int,status:string,payment_status:string,age:string,stale:bool,restaurant:?string}>
 */
function fc_status_blocking_orders(mysqli $conn, string $where, string $types, array $params, bool $withRestaurant): array
{
    $stmt = $conn->prepare(
        "SELECT o.order_id, o.restaurant_id, o.order_status, o.payment_status,
                (UNIX_TIMESTAMP(NOW()) - UNIX_TIMESTAMP(o.created_at)) AS age_seconds
         FROM tbl_orders o
         WHERE $where AND o.order_status NOT IN ('completed', 'cancelled')
         ORDER BY o.created_at ASC, o.order_id ASC
         LIMIT 5"
    );

    if (!$stmt) {
        return [];
    }

    $stmt->bind_param($types, ...$params);

    if (!$stmt->execute()) {
        $stmt->close();
        return [];
    }

    $rows = $stmt->get_result();
    $orders = [];

    while ($rows && ($row = $rows->fetch_assoc())) {
        $age = (int)($row["age_seconds"] ?? 0);

        $orders[] = [
            "order_id" => (int)$row["order_id"],
            "restaurant_id" => (int)$row["restaurant_id"],
            "status" => (string)$row["order_status"],
            "payment_status" => (string)$row["payment_status"],
            "age" => fc_status_age_text($age),
            "stale" => $age > 86400,
            "restaurant" => null,
        ];
    }

    $stmt->close();

    if ($withRestaurant && $orders) {
        $names = [];
        $nameStmt = $conn->prepare("SELECT name FROM tbl_restaurants WHERE restaurant_id = ?");

        if ($nameStmt) {
            foreach ($orders as $index => $order) {
                $rid = $order["restaurant_id"];

                if (!array_key_exists($rid, $names)) {
                    $nameStmt->bind_param("i", $rid);
                    $names[$rid] = $nameStmt->execute()
                        ? ($nameStmt->get_result()->fetch_assoc()["name"] ?? null)
                        : null;
                }

                $orders[$index]["restaurant"] = $names[$rid];
            }

            $nameStmt->close();
        }
    }

    return $orders;
}

function fc_status_orders_sentence(array $orders, int $limit = 3): string
{
    $parts = [];

    foreach (array_slice($orders, 0, $limit) as $order) {
        $parts[] = "#" . $order["order_id"]
            . ($order["restaurant"] ? " at " . $order["restaurant"] : "")
            . ", " . str_replace("_", " ", $order["status"])
            . ", " . $order["age"] . " old";
    }

    return implode("; ", $parts);
}

/**
 * Operations that must be finished before an account may be deactivated (or,
 * for staff, deleted / moved to another role). Nothing is cancelled, reassigned
 * or edited here; the caller simply refuses the change.
 *
 *   owner           any order of the owner's restaurant(s) that is not completed or
 *                   cancelled, and any delivery assignment that is not completed or
 *                   cancelled
 *   delivery_staff  an unfinished delivery assignment of that rider; also the
 *                   restaurant's ONLY active rider while delivery orders still
 *                   wait for a rider
 *   customer        any order of theirs that is not completed or cancelled, and any
 *                   unfinished delivery of those orders (they keep order tracking)
 *   cashier         the restaurant's ONLY active cashier while orders are still
 *                   in progress (only a cashier can scan order QR codes and the
 *                   order-processing screens exist only in the cashier dashboard)
 *
 * MUST run inside the caller's transaction, after the target row was locked
 * with SELECT ... FOR UPDATE. Checkout locks the same owner row before it creates
 * an order, so an order cannot slip in between this check and the commit.
 *
 * @return array|null null when nothing blocks; otherwise
 *         ["code","message","http","blockers"=>[...]]
 */
function fc_status_operation_blockers(mysqli $conn, array $target, string $verb = "deactivated"): ?array
{
    $role = strtolower(trim((string)$target["role"]));
    $targetId = (int)$target["user_id"];
    $restaurantId = (int)($target["restaurant_id"] ?? 0);
    $targetIsActive = (int)($target["status"] ?? 0) === 1;

    $blocked = static function (string $message, array $blockers): array {
        return [
            "code" => "ACTIVE_OPERATIONS",
            "message" => $message,
            "http" => 409,
            "blockers" => $blockers,
        ];
    };

    if ($role === "owner") {
        $restaurantIds = [];

        if ($restaurantId > 0) {
            $restaurantIds[$restaurantId] = $restaurantId;
        }

        $stmt = $conn->prepare("SELECT restaurant_id FROM tbl_restaurants WHERE owner_id = ?");

        if (!$stmt) {
            throw new RuntimeException("prepare owner restaurants: " . $conn->error);
        }

        $stmt->bind_param("i", $targetId);

        if (!$stmt->execute()) {
            throw new RuntimeException("execute failed: " . $stmt->error);
        }

        $rows = $stmt->get_result();

        while ($rows && ($row = $rows->fetch_assoc())) {
            $id = (int)$row["restaurant_id"];

            if ($id > 0) {
                $restaurantIds[$id] = $id;
            }
        }

        $stmt->close();

        if (!$restaurantIds) {
            return null;
        }

        $ids = array_values($restaurantIds);
        $marks = implode(",", array_fill(0, count($ids), "?"));
        $types = str_repeat("i", count($ids));

        $activeOrders = fc_status_locked_count(
            $conn,
            "SELECT COUNT(*) AS c FROM tbl_orders
             WHERE restaurant_id IN ($marks)
               AND order_status NOT IN ('completed', 'cancelled')",
            $types,
            $ids
        );

        $unfinishedDeliveries = fc_status_locked_count(
            $conn,
            "SELECT COUNT(*) AS c FROM tbl_delivery_assignments
             WHERE restaurant_id IN ($marks)
               AND delivery_status NOT IN ('completed', 'cancelled')",
            $types,
            $ids
        );

        if ($activeOrders > 0 || $unfinishedDeliveries > 0) {
            $orders = $activeOrders > 0
                ? fc_status_blocking_orders($conn, "o.restaurant_id IN ($marks)", $types, $ids, false)
                : [];
            $staleCount = count(array_filter($orders, static fn($o) => $o["stale"]));
            $parts = [];

            if ($activeOrders > 0) {
                $parts[] = fc_status_plural($activeOrders, "active order", "active orders");
            }

            if ($unfinishedDeliveries > 0) {
                $parts[] = fc_status_plural($unfinishedDeliveries, "unfinished delivery", "unfinished deliveries");
            }

            return $blocked(
                "This owner cannot be deactivated yet because the restaurant still has "
                . implode(" and ", $parts)
                . ($orders ? " (oldest: " . fc_status_orders_sentence($orders) . ")" : "")
                . ". "
                . ($staleCount > 0
                    ? fc_status_plural($staleCount, "of them is", "of them are")
                      . " more than 24 hours old and may have been abandoned. "
                    : "")
                . "Ask the restaurant's cashier to cancel or complete them from the Orders screen, then try again. "
                . "Nothing is cancelled automatically, and no account or order was changed.",
                [
                    "active_orders" => $activeOrders,
                    "unfinished_deliveries" => $unfinishedDeliveries,
                    "stale_active_orders" => $staleCount,
                    "orders" => $orders,
                ]
            );
        }

        return null;
    }

    if ($role === "customer") {
        $activeOrders = fc_status_locked_count(
            $conn,
            "SELECT COUNT(*) AS c FROM tbl_orders
             WHERE user_id = ? AND order_status NOT IN ('completed', 'cancelled')",
            "i",
            [$targetId]
        );

        $unfinishedDeliveries = fc_status_locked_count(
            $conn,
            "SELECT COUNT(*) AS c FROM tbl_delivery_assignments a
             INNER JOIN tbl_orders o ON o.order_id = a.order_id
             WHERE o.user_id = ? AND a.delivery_status NOT IN ('completed', 'cancelled')",
            "i",
            [$targetId]
        );

        if ($activeOrders > 0 || $unfinishedDeliveries > 0) {
            $orders = $activeOrders > 0
                ? fc_status_blocking_orders($conn, "o.user_id = ?", "i", [$targetId], true)
                : [];
            $parts = [];

            if ($activeOrders > 0) {
                $parts[] = fc_status_plural($activeOrders, "active order", "active orders");
            }

            if ($unfinishedDeliveries > 0) {
                $parts[] = fc_status_plural($unfinishedDeliveries, "unfinished delivery", "unfinished deliveries");
            }

            return $blocked(
                "You can't deactivate your account yet because you still have "
                . implode(" and ", $parts)
                . ($orders ? " (" . fc_status_orders_sentence($orders) . ")" : "")
                . ". Please keep tracking your orders under My Orders until they are completed or cancelled. "
                . "If the restaurant has not started an order yet, contact the restaurant to cancel it. "
                . "Your account was not changed.",
                [
                    "active_orders" => $activeOrders,
                    "unfinished_deliveries" => $unfinishedDeliveries,
                    "orders" => $orders,
                ]
            );
        }

        return null;
    }

    if ($role === "delivery_staff") {
        $unfinished = fc_status_locked_count(
            $conn,
            "SELECT COUNT(*) AS c FROM tbl_delivery_assignments
             WHERE delivery_staff_id = ?
               AND delivery_status NOT IN ('completed', 'cancelled')",
            "i",
            [$targetId]
        );

        if ($unfinished > 0) {
            return $blocked(
                "This delivery rider cannot be {$verb} yet because they still have "
                . fc_status_plural($unfinished, "unfinished delivery", "unfinished deliveries")
                . ". Let the rider finish it, or cancel the order through the normal order process, then try again. "
                . "No delivery was changed.",
                ["unfinished_deliveries" => $unfinished]
            );
        }

        if ($targetIsActive && $restaurantId > 0) {
            $otherRiders = fc_status_locked_count(
                $conn,
                "SELECT COUNT(*) AS c FROM tbl_users
                 WHERE restaurant_id = ? AND role = 'delivery_staff' AND status = 1 AND user_id <> ?",
                "ii",
                [$restaurantId, $targetId]
            );

            if ($otherRiders === 0) {
                $waiting = fc_status_locked_count(
                    $conn,
                    "SELECT COUNT(*) AS c FROM tbl_orders
                     WHERE restaurant_id = ? AND LOWER(order_type) = 'delivery'
                       AND order_status IN ('pending', 'preparing', 'ready')",
                    "i",
                    [$restaurantId]
                );

                if ($waiting > 0) {
                    return $blocked(
                        "This is the restaurant's only active delivery rider and "
                        . fc_status_plural($waiting, "delivery order still needs", "delivery orders still need")
                        . " a rider. Complete or cancel those orders, or activate another rider first, then try again. "
                        . "No order was changed.",
                        ["delivery_orders_waiting" => $waiting]
                    );
                }
            }
        }

        return null;
    }

    if ($role === "cashier" && $targetIsActive && $restaurantId > 0) {
        $otherCashiers = fc_status_locked_count(
            $conn,
            "SELECT COUNT(*) AS c FROM tbl_users
             WHERE restaurant_id = ? AND role = 'cashier' AND status = 1 AND user_id <> ?",
            "ii",
            [$restaurantId, $targetId]
        );

        if ($otherCashiers === 0) {
            $inProgress = fc_status_locked_count(
                $conn,
                "SELECT COUNT(*) AS c FROM tbl_orders
                 WHERE restaurant_id = ? AND order_status NOT IN ('completed', 'cancelled')",
                "i",
                [$restaurantId]
            );

            if ($inProgress > 0) {
                return $blocked(
                    "This is the restaurant's only active cashier and "
                    . fc_status_plural($inProgress, "order is", "orders are")
                    . " still in progress. Complete or cancel them, or activate another cashier first, then try again. "
                    . "No order was changed.",
                    ["orders_in_progress" => $inProgress]
                );
            }
        }
    }

    return null;
}

/**
 * Permission matrix. Returns null when allowed, otherwise
 * ["message" => ..., "http" => ...].
 *
 * $actor  = ["user_id" => int, "role" => string, "restaurant_id" => ?int]
 * $target = locked tbl_users row.
 */
function fc_status_authorize(mysqli $conn, array $actor, array $target): ?array
{
    $actorId = (int)($actor["user_id"] ?? 0);
    $actorRole = strtolower(trim((string)($actor["role"] ?? "")));
    $targetId = (int)$target["user_id"];
    $targetRole = strtolower(trim((string)$target["role"]));

    if ($actorId <= 0) {
        return ["message" => "Please log in again.", "http" => 401];
    }

    if ($actorRole === "admin") {
        if ($targetRole !== "owner") {
            return [
                "message" => "Administrators can only deactivate or reactivate restaurant owner accounts. "
                    . "Staff accounts are managed by their restaurant owner and customers manage their own accounts.",
                "http" => 403,
            ];
        }

        if ($targetId === $actorId) {
            return ["message" => "You cannot change your own account.", "http" => 403];
        }

        if ((int)($target["is_verified"] ?? 0) !== 1) {
            return ["message" => "Unverified accounts cannot be managed here.", "http" => 403];
        }

        return null;
    }

    if ($actorRole === "owner") {
        if (!in_array($targetRole, FC_STATUS_STAFF_ROLES, true)) {
            return [
                "message" => "Restaurant owners can only manage their own cashier and delivery staff accounts.",
                "http" => 403,
            ];
        }

        $actorRestaurantId = (int)($actor["restaurant_id"] ?? 0);
        $targetRestaurantId = (int)($target["restaurant_id"] ?? 0);

        if ($actorRestaurantId <= 0 || $targetRestaurantId !== $actorRestaurantId) {
            return [
                "message" => "You can only manage staff accounts that belong to your own restaurant.",
                "http" => 403,
            ];
        }

        $stmt = $conn->prepare(
            "SELECT restaurant_id FROM tbl_restaurants WHERE restaurant_id = ? AND owner_id = ? LIMIT 1"
        );

        if (!$stmt) {
            throw new RuntimeException("Unable to verify restaurant ownership.");
        }

        $stmt->bind_param("ii", $targetRestaurantId, $actorId);
        if (!$stmt->execute()) {
            throw new RuntimeException("execute failed: " . $stmt->error);
        }
        $owned = $stmt->get_result()->fetch_assoc();
        $stmt->close();

        if (!$owned) {
            return [
                "message" => "You can only manage staff accounts that belong to your own restaurant.",
                "http" => 403,
            ];
        }

        return null;
    }

    if ($actorRole === "customer") {
        if ($targetRole !== "customer" || $targetId !== $actorId) {
            return [
                "message" => "You can only change the status of your own account.",
                "http" => 403,
            ];
        }

        return null;
    }

    return [
        "message" => "You are not allowed to change account status.",
        "http" => 403,
    ];
}

/**
 * Change an account's status and record it - atomically.
 *
 * $options:
 *   reason, note        validated by fc_status_validate_reason()
 *   actor               ["user_id","role","restaurant_id"] (database-verified)
 *   actor_name          shown in the activity log
 *   activity_log        true to also write tbl_activity_logs (restaurant scoped)
 *   extra_in_transaction optional callable(mysqli,array $target,int $newStatus): void
 *                        executed inside the same transaction (may throw to roll back)
 *
 * @return array{success:bool, changed?:bool, message:string, http:int, code?:string, blockers?:array, target?:array, old_status?:int, status?:int}
 */
function fc_change_account_status(
    mysqli $conn,
    int $targetUserId,
    int $newStatus,
    array $options
): array {
    if (!in_array($newStatus, [0, 1], true) || $targetUserId <= 0) {
        return ["success" => false, "message" => "Invalid account status request.", "http" => 422];
    }

    if (!fc_status_history_is_transactional($conn)) {
        /* Required database upgrade missing: refuse BEFORE touching anything. */
        error_log("fc_change_account_status refused: tbl_account_status_history is not InnoDB (run the required migration).");

        return [
            "success" => false,
            "code" => "MIGRATION_REQUIRED",
            "message" => "Account status changes are temporarily unavailable because a required database upgrade has not been applied yet. Nothing was changed. Please contact the system administrator.",
            "http" => 503,
        ];
    }

    $action = $newStatus === 1 ? "reactivate" : "deactivate";
    $historyAction = $newStatus === 1 ? "reactivated" : "deactivated";
    $actor = $options["actor"];
    $actorId = (int)$actor["user_id"];

    $startedTransaction = false;

    try {
        $conn->begin_transaction();
        $startedTransaction = true;

        /* Lock the row so two simultaneous requests cannot both succeed. */
        $stmt = $conn->prepare("
            SELECT user_id, restaurant_id, role, email, status, is_verified,
                   TRIM(CONCAT_WS(' ', NULLIF(TRIM(first_name), ''), NULLIF(TRIM(middle_name), ''), NULLIF(TRIM(last_name), ''))) AS display_name
            FROM tbl_users
            WHERE user_id = ?
            LIMIT 1
            FOR UPDATE
        ");

        if (!$stmt) {
            throw new RuntimeException("prepare target: " . $conn->error);
        }

        $stmt->bind_param("i", $targetUserId);
        if (!$stmt->execute()) {
            throw new RuntimeException("execute failed: " . $stmt->error);
        }
        $target = $stmt->get_result()->fetch_assoc();
        $stmt->close();

        if (!$target) {
            $conn->rollback();
            return ["success" => false, "message" => "Account not found.", "http" => 404];
        }

        $denied = fc_status_authorize($conn, $actor, $target);

        if ($denied !== null) {
            $conn->rollback();
            return ["success" => false, "message" => $denied["message"], "http" => $denied["http"]];
        }

        $targetRole = strtolower(trim((string)$target["role"]));
        $group = fc_status_group_for_role($targetRole);
        $valid = fc_status_validate_reason(
            $group,
            $action,
            $options["reason"] ?? "",
            $options["note"] ?? ""
        );

        if (!$valid["ok"]) {
            $conn->rollback();
            return ["success" => false, "message" => $valid["message"], "http" => 422, "field" => "reason"];
        }

        $oldStatus = (int)$target["status"];

        if ($oldStatus === $newStatus) {
            /* Already in the requested state: change nothing, record nothing. */
            $conn->rollback();

            return [
                "success" => true,
                "changed" => false,
                "message" => $newStatus === 1
                    ? "This account is already active."
                    : "This account is already inactive.",
                "http" => 200,
                "target" => $target,
                "old_status" => $oldStatus,
                "status" => $newStatus,
            ];
        }

        if ($newStatus === 0) {
            /* Never strand live orders or deliveries (locked, same transaction). */
            $blockers = fc_status_operation_blockers($conn, $target, "deactivated");

            if ($blockers !== null) {
                $conn->rollback();

                return [
                    "success" => false,
                    "code" => $blockers["code"],
                    "message" => $blockers["message"],
                    "http" => $blockers["http"],
                    "blockers" => $blockers["blockers"],
                ];
            }
        }

        $reason = $valid["reason"];
        $note = $valid["note"];
        $recordedText = $reason === FC_STATUS_OTHER_REASON
            ? FC_STATUS_OTHER_REASON . ": " . $note
            : ($note !== "" ? $reason . " - " . $note : $reason);

        if ($newStatus === 0) {
            /* Also end remember-me logins; sessions are ended by the session guard. */
            $update = $conn->prepare("
                UPDATE tbl_users
                SET status = 0,
                    deactivation_reason = ?,
                    deactivated_at = NOW(),
                    deactivated_by = ?,
                    remember_token_hash = NULL,
                    remember_token_expires = NULL
                WHERE user_id = ? AND status = 1
                LIMIT 1
            ");
        } else {
            $update = $conn->prepare("
                UPDATE tbl_users
                SET status = 1,
                    reactivation_note = ?,
                    reactivated_at = NOW(),
                    reactivated_by = ?
                WHERE user_id = ? AND status = 0
                LIMIT 1
            ");
        }

        if (!$update) {
            throw new RuntimeException("prepare update: " . $conn->error);
        }

        $update->bind_param("sii", $recordedText, $actorId, $targetUserId);
        if (!$update->execute()) {
            throw new RuntimeException("execute failed: " . $update->error);
        }
        $affected = $update->affected_rows;
        $update->close();

        if ($affected !== 1) {
            throw new RuntimeException("status update affected {$affected} rows");
        }

        if (is_callable($options["extra_in_transaction"] ?? null)) {
            $options["extra_in_transaction"]($conn, $target, $newStatus);
        }

        /* History is written last: if it fails, the status change rolls back. */
        $columns = fc_status_history_columns($conn);
        $names = ["user_id", "action", "reason", "note", "performed_by"];
        $types = "isssi";

        /* Before the migration the history table is latin1: a note with characters
           outside latin1 (for example an emoji) would make the insert fail and block
           the status change. Replace only those characters with "?" in that case. */
        $historyNote = $note;
        $noteCollation = (string)($columns["_note_collation"] ?? "");

        if ($noteCollation !== "" && stripos($noteCollation, "utf8mb4") !== 0) {
            $historyNote = mb_convert_encoding(
                mb_convert_encoding($note, "ISO-8859-1", "UTF-8"),
                "UTF-8",
                "ISO-8859-1"
            );
        }

        $values = [$targetUserId, $historyAction, $reason, $historyNote, $actorId];

        if (isset($columns["target_role"])) {
            $names[] = "target_role";
            $types .= "s";
            $values[] = $targetRole;
        }

        if (isset($columns["performed_by_role"])) {
            $names[] = "performed_by_role";
            $types .= "s";
            $values[] = strtolower(trim((string)$actor["role"]));
        }

        if (isset($columns["target_restaurant_id"])) {
            $names[] = "target_restaurant_id";
            $types .= "i";
            $values[] = (int)($target["restaurant_id"] ?? 0);
        }

        $history = $conn->prepare(
            "INSERT INTO tbl_account_status_history (" . implode(", ", $names) . ") VALUES ("
            . implode(", ", array_fill(0, count($names), "?")) . ")"
        );

        if (!$history) {
            throw new RuntimeException("prepare history: " . $conn->error);
        }

        $history->bind_param($types, ...$values);
        if (!$history->execute()) {
            throw new RuntimeException("execute failed: " . $history->error);
        }
        $history->close();

        if (!empty($options["activity_log"])) {
            $logRestaurantId = (int)($target["restaurant_id"] ?? 0);
            $actorRole = strtolower(trim((string)$actor["role"]));
            $title = $newStatus === 1 ? "Account Reactivated" : "Account Deactivated";
            $description = trim((string)($options["actor_name"] ?? "A user"))
                . ($newStatus === 1 ? " reactivated " : " deactivated ")
                . trim((string)$target["display_name"])
                . " (" . ucwords(str_replace("_", " ", $targetRole)) . "). Reason: "
                . $recordedText;

            $log = $conn->prepare("
                INSERT INTO tbl_activity_logs (restaurant_id, user_id, user_role, action_type, action_title, action_description)
                VALUES (?, ?, ?, 'account_status', ?, ?)
            ");

            if (!$log) {
                throw new RuntimeException("prepare activity log: " . $conn->error);
            }

            $log->bind_param("iisss", $logRestaurantId, $actorId, $actorRole, $title, $description);
            if (!$log->execute()) {
                throw new RuntimeException("execute failed: " . $log->error);
            }
            $log->close();
        }

        $conn->commit();
        $startedTransaction = false;

        $target["status"] = $newStatus;

        return [
            "success" => true,
            "changed" => true,
            "message" => $newStatus === 1
                ? "Account reactivated successfully."
                : "Account deactivated successfully.",
            "http" => 200,
            "target" => $target,
            "old_status" => $oldStatus,
            "status" => $newStatus,
            "reason" => $reason,
            "note" => $note,
        ];
    } catch (Throwable $error) {
        if ($startedTransaction) {
            try {
                $conn->rollback();
            } catch (Throwable $ignored) {
            }
        }

        error_log("fc_change_account_status error: " . $error->getMessage());

        return [
            "success" => false,
            "message" => "Unable to update the account status right now. Nothing was changed. Please try again.",
            "http" => 500,
        ];
    }
}
