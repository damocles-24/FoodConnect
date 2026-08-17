-- FoodConnect staff password reset workflow
-- Run this once on db_foodconnect before replacing the PHP files.

ALTER TABLE tbl_users
ADD COLUMN must_change_password TINYINT(1) NOT NULL DEFAULT 0
AFTER password_hash;
