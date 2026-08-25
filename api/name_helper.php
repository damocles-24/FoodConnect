<?php

function formatUserName(array $user): string
{
    $parts = [];

    foreach (["first_name", "middle_name", "last_name"] as $field) {
        $value = trim((string)($user[$field] ?? ""));

        if ($value !== "") {
            $parts[] = $value;
        }
    }

    $separatedName = trim(implode(" ", $parts));

    if ($separatedName !== "") {
        return $separatedName;
    }

    return trim((string)($user["full_name"] ?? ""));
}

/**
 * Returns a safe SQL expression for displaying a tbl_users name during the
 * compatibility migration. New separated fields are preferred; the legacy
 * full_name column is only used when an older account has not been migrated.
 *
 * $alias must be a hard-coded SQL table alias, never user input.
 */
function userNameSqlExpression(string $alias = ""): string
{
    if ($alias !== "" && !preg_match('/^[A-Za-z_][A-Za-z0-9_]*$/', $alias)) {
        throw new InvalidArgumentException("Invalid SQL table alias for user name expression.");
    }

    $prefix = $alias !== "" ? $alias . "." : "";

    return "COALESCE(" .
        "NULLIF(TRIM(CONCAT_WS(' ', " .
            "NULLIF(TRIM({$prefix}first_name), ''), " .
            "NULLIF(TRIM({$prefix}middle_name), ''), " .
            "NULLIF(TRIM({$prefix}last_name), '')" .
        ")), ''), " .
        "NULLIF(TRIM({$prefix}full_name), ''), " .
        "''" .
    ")";
}
