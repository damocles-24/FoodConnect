<?php

/**
 * Build the current display name from the canonical separated name fields.
 */
function formatUserName(array $user): string
{
    $parts = [];

    foreach (["first_name", "middle_name", "last_name"] as $field) {
        $value = trim((string)($user[$field] ?? ""));

        if ($value !== "") {
            $parts[] = $value;
        }
    }

    return trim(implode(" ", $parts));
}

/**
 * SQL expression for a tbl_users display name using only the canonical
 * separated name columns. $alias must be hard-coded, never user input.
 */
function userNameSqlExpression(string $alias = ""): string
{
    if ($alias !== "" && !preg_match('/^[A-Za-z_][A-Za-z0-9_]*$/', $alias)) {
        throw new InvalidArgumentException("Invalid SQL table alias for user name expression.");
    }

    $prefix = $alias !== "" ? $alias . "." : "";

    return "TRIM(CONCAT_WS(' ', " .
        "NULLIF(TRIM({$prefix}first_name), ''), " .
        "NULLIF(TRIM({$prefix}middle_name), ''), " .
        "NULLIF(TRIM({$prefix}last_name), '')" .
    "))";
}
