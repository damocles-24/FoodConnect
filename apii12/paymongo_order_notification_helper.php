<?php

function ensure_paid_order_cashier_notification(
    mysqli $conn,
    int $restaurantId,
    int $customerId,
    string $customerName,
    int $orderId,
    int $queueNumber
): void {
    $title = "New Customer Order";

    $description =
        $customerName .
        " placed Order #" .
        $orderId .
        " / Queue #" .
        $queueNumber .
        ".";

    $checkStmt = $conn->prepare("
        SELECT log_id
        FROM tbl_activity_logs
        WHERE restaurant_id = ?
          AND action_title = ?
          AND action_description = ?
        LIMIT 1
    ");

    if (!$checkStmt) {
        throw new RuntimeException(
            "Unable to prepare the cashier notification check."
        );
    }

    $checkStmt->bind_param(
        "iss",
        $restaurantId,
        $title,
        $description
    );

    if (!$checkStmt->execute()) {
        $checkStmt->close();

        throw new RuntimeException(
            "Unable to check the cashier notification."
        );
    }

    $existing =
        $checkStmt
            ->get_result()
            ->fetch_assoc();

    $checkStmt->close();

    if ($existing) {
        return;
    }

    $insertStmt = $conn->prepare("
        INSERT INTO tbl_activity_logs (
            restaurant_id,
            user_id,
            user_role,
            action_type,
            action_title,
            action_description
        )
        VALUES (
            ?,
            ?,
            'customer',
            'order',
            ?,
            ?
        )
    ");

    if (!$insertStmt) {
        throw new RuntimeException(
            "Unable to prepare the cashier notification."
        );
    }

    $insertStmt->bind_param(
        "iiss",
        $restaurantId,
        $customerId,
        $title,
        $description
    );

    if (!$insertStmt->execute()) {
        $insertStmt->close();

        throw new RuntimeException(
            "Unable to create the cashier notification."
        );
    }

    $insertStmt->close();
}
