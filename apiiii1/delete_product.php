<?php
header("Content-Type: application/json; charset=utf-8");
require_once __DIR__ . "/session_config.php";

require_once __DIR__ . "/db.php";

if (!isset($_SESSION["user_id"])) {
  echo json_encode([
    "success" => false,
    "message" => "Unauthorized. Please login first."
  ]);
  exit;
}

$restaurant_id = (int)($_SESSION["restaurant_id"] ?? 0);

if ($restaurant_id <= 0) {
    http_response_code(403);
    echo json_encode([
        "success" => false,
        "message" => "No restaurant is assigned to this account."
    ]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

$product_id = intval($data["product_id"] ?? 0);

if ($product_id <= 0) {
  echo json_encode([
    "success" => false,
    "message" => "Invalid product ID."
  ]);
  exit;
}

$productStmt = $conn->prepare("
  SELECT
    product_name,
    category,
    item_type
  FROM tbl_products
  WHERE product_id = ?
    AND restaurant_id = ?
  LIMIT 1
");

if (!$productStmt) {
  http_response_code(500);
  echo json_encode([
    "success" => false,
    "message" => "Unable to validate the product."
  ]);
  exit;
}

$productStmt->bind_param(
  "ii",
  $product_id,
  $restaurant_id
);

$productStmt->execute();

$product =
  $productStmt
    ->get_result()
    ->fetch_assoc();

$productStmt->close();

if (!$product) {
  http_response_code(404);
  echo json_encode([
    "success" => false,
    "message" => "Product not found."
  ]);
  exit;
}

$conn->begin_transaction();

try {
  $stmt = $conn->prepare("
    DELETE FROM tbl_products
    WHERE product_id = ?
      AND restaurant_id = ?
  ");

  if (!$stmt) {
    throw new RuntimeException(
      "Unable to prepare product deletion."
    );
  }

  $stmt->bind_param(
    "ii",
    $product_id,
    $restaurant_id
  );

  if (!$stmt->execute()) {
    throw new RuntimeException(
      "Failed to delete product."
    );
  }

  $stmt->close();

  /*
   * Add-on link rows referencing an add-on are removed by
   * ON DELETE CASCADE.
   *
   * For a normal menu product, clear group assignments only
   * when no other variant of the same product remains.
   */
  if (
    strtolower(
      trim(
        (string)($product["item_type"] ?? "menu_item")
      )
    ) !== "add_on"
  ) {
    $remainingStmt = $conn->prepare("
      SELECT product_id
      FROM tbl_products
      WHERE restaurant_id = ?
        AND item_type = 'menu_item'
        AND LOWER(TRIM(product_name)) =
            LOWER(TRIM(?))
        AND LOWER(TRIM(category)) =
            LOWER(TRIM(?))
      LIMIT 1
    ");

    if (!$remainingStmt) {
      throw new RuntimeException(
        "Unable to check remaining product variants."
      );
    }

    $productName =
      (string)$product["product_name"];

    $productCategory =
      (string)$product["category"];

    $remainingStmt->bind_param(
      "iss",
      $restaurant_id,
      $productName,
      $productCategory
    );

    $remainingStmt->execute();

    $remaining =
      $remainingStmt
        ->get_result()
        ->fetch_assoc();

    $remainingStmt->close();

    if (!$remaining) {
      $linkStmt = $conn->prepare("
        DELETE FROM tbl_product_addon_links
        WHERE restaurant_id = ?
          AND LOWER(TRIM(product_name)) =
              LOWER(TRIM(?))
          AND LOWER(TRIM(product_category)) =
              LOWER(TRIM(?))
      ");

      if (!$linkStmt) {
        throw new RuntimeException(
          "Unable to clear product add-on links."
        );
      }

      $linkStmt->bind_param(
        "iss",
        $restaurant_id,
        $productName,
        $productCategory
      );

      $linkStmt->execute();
      $linkStmt->close();
    }
  }

  $conn->commit();

  echo json_encode([
    "success" => true,
    "message" =>
      strtolower(
        trim(
          (string)($product["item_type"] ?? "")
        )
      ) === "add_on"
        ? "Add-on deleted successfully."
        : "Product deleted successfully."
  ]);

} catch (Throwable $error) {
  try {
    $conn->rollback();
  } catch (Throwable $ignore) {
  }

  error_log(
    "delete_product.php: " .
    $error->getMessage()
  );

  http_response_code(500);

  echo json_encode([
    "success" => false,
    "message" =>
      "Unable to delete this item."
  ]);
}

$conn->close();
