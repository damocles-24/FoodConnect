-- phpMyAdmin SQL Dump
-- version 4.8.3
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Aug 02, 2026 at 04:44 PM
-- Server version: 10.1.36-MariaDB
-- PHP Version: 7.2.10

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `db_foodconnect`
--

-- --------------------------------------------------------

--
-- Table structure for table `tbl_activity_logs`
--

CREATE TABLE `tbl_activity_logs` (
  `log_id` int(11) NOT NULL,
  `restaurant_id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `user_role` varchar(30) DEFAULT NULL,
  `action_type` varchar(50) NOT NULL,
  `action_title` varchar(100) NOT NULL,
  `action_description` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `tbl_activity_logs`
--

INSERT INTO `tbl_activity_logs` (`log_id`, `restaurant_id`, `user_id`, `user_role`, `action_type`, `action_title`, `action_description`, `created_at`) VALUES
(11, 2, 17, 'admin', 'restaurant_status', 'Restaurant Status Updated', 'Carlos Jay Miguel T. Porto changed Ayaw ko na Restaurant from Closed to Open.', '2026-07-26 11:56:51'),
(12, 2, 17, 'admin', 'restaurant_status', 'Restaurant Status Updated', 'Carlos Jay Miguel T. Porto changed Ayaw ko na Restaurant from Open to Closed.', '2026-07-26 12:04:05'),
(13, 2, 17, 'admin', 'restaurant_status', 'Restaurant Status Updated', 'Carlos Jay Miguel T. Porto changed Ayaw ko na Restaurant from Closed to Open.', '2026-07-26 12:04:27'),
(14, 2, 17, 'admin', 'restaurant_status', 'Restaurant Status Updated', 'Carlos Jay Miguel T. Porto changed Ayaw ko na Restaurant from Open to Closed.', '2026-07-29 03:06:24'),
(15, 4, 22, 'owner', 'product', 'Product Added', 'Hotdog - Solo was added to the menu.', '2026-07-29 13:46:06'),
(16, 4, 22, 'owner', 'restaurant_application', 'Go-Live Application Submitted', 'The owner submitted \"Test Environment\" for administrator review.', '2026-07-29 13:46:16'),
(17, 4, 17, 'admin', 'restaurant_application', 'Restaurant Approved', 'The go-live application for \"Test Environment\" owned by Cj Tamayo Porto was approved. Restaurant ID 4 is now visible to customers.', '2026-07-29 14:21:48'),
(18, 4, 22, 'owner', 'product', 'Product Updated', 'Hotdog malaki - Solo was updated.', '2026-07-30 05:08:59'),
(19, 4, 22, 'owner', 'product', 'Product Added', 'Cheese Burger was added to the menu.', '2026-07-30 05:55:02'),
(20, 4, 22, 'owner', 'product', 'Product Updated', 'Cheese Burger was updated.', '2026-07-30 06:48:47'),
(21, 4, 22, 'owner', 'product', 'Product Updated', 'Cheese Burger was updated.', '2026-07-30 06:50:32'),
(22, 4, 22, 'owner', 'product', 'Product Updated', 'Cheese Burgers was updated.', '2026-07-30 06:50:37'),
(23, 4, 22, 'owner', 'product', 'Product Updated', 'Cheese Burgers was updated.', '2026-07-30 06:50:45'),
(24, 4, 22, 'owner', 'product', 'Product Updated', 'Masarap was updated.', '2026-07-30 06:51:18'),
(25, 4, 22, 'owner', 'product', 'Product Added', 'Tapsilog was added to the menu.', '2026-08-02 00:14:07'),
(26, 2, 17, 'admin', 'restaurant_status', 'Restaurant Status Updated', 'Carlos Jay Miguel T. Porto changed Ayaw ko na Restaurant from Closed to Open.', '2026-08-02 00:16:31'),
(27, 2, 17, 'admin', 'restaurant_status', 'Restaurant Status Updated', 'Carlos Jay Miguel T. Porto changed Ayaw ko na Restaurant from Open to Closed.', '2026-08-02 00:16:35'),
(28, 4, 17, 'admin', 'restaurant_status', 'Restaurant Status Updated', 'Carlos Jay Miguel T. Porto changed Test Environment from Closed to Open.', '2026-08-02 00:16:37'),
(29, 4, 22, 'owner', 'product', 'Product Deleted', 'Tapsilog was removed from the menu.', '2026-08-02 00:18:19'),
(30, 4, 22, 'owner', 'product', 'Product Added', 'tapsilog was added to the menu.', '2026-08-02 00:19:26'),
(31, 4, 22, 'owner', 'product', 'Product Updated', 'tapsilog was updated.', '2026-08-02 00:37:52'),
(32, 4, 22, 'owner', 'product', 'Product Updated', 'tapsilog was updated.', '2026-08-02 01:22:44'),
(33, 4, 22, 'owner', 'product', 'Product Updated', 'tapsilog was updated.', '2026-08-02 01:32:24'),
(34, 4, 22, 'owner', 'product', 'Product Updated', 'tapsilog was updated.', '2026-08-02 01:57:14'),
(35, 4, 22, 'owner', 'product', 'Product Updated', 'tapsilog was updated.', '2026-08-02 02:29:15'),
(36, 4, 22, 'owner', 'product', 'Product Updated', 'tapsilog was updated.', '2026-08-02 03:40:52'),
(37, 4, 22, 'owner', 'product', 'Product Updated', 'tapsilog was updated.', '2026-08-02 04:25:08'),
(38, 4, 22, 'owner', 'product', 'Product Updated', 'tapsilog was updated.', '2026-08-02 13:07:01'),
(39, 4, 12, 'customer', 'order', 'New Customer Order', 'Cj Tamayo Porto placed Order #1 / Queue #1.', '2026-08-02 13:41:45'),
(40, 4, 12, 'customer', 'order', 'New Customer Order', 'Cj Tamayo Porto placed Order #2 / Queue #2.', '2026-08-02 14:19:03');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_admin_login_attempts`
--

CREATE TABLE `tbl_admin_login_attempts` (
  `attempt_id` bigint(20) UNSIGNED NOT NULL,
  `identifier_hash` char(64) NOT NULL,
  `ip_address` varchar(45) NOT NULL,
  `attempt_type` enum('access_code','credentials') NOT NULL,
  `was_successful` tinyint(1) NOT NULL DEFAULT '0',
  `attempted_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `tbl_admin_login_attempts`
--

INSERT INTO `tbl_admin_login_attempts` (`attempt_id`, `identifier_hash`, `ip_address`, `attempt_type`, `was_successful`, `attempted_at`) VALUES
(2, '2e7819e8f16e6a588ef745d1229cac6ac92d459be3a0cf1166f5c3c9297b8803', '::1', 'credentials', 1, '2026-07-23 07:16:48'),
(4, '2e7819e8f16e6a588ef745d1229cac6ac92d459be3a0cf1166f5c3c9297b8803', '::1', 'credentials', 1, '2026-07-24 01:45:38'),
(6, '2e7819e8f16e6a588ef745d1229cac6ac92d459be3a0cf1166f5c3c9297b8803', '::1', 'credentials', 1, '2026-07-24 12:11:09'),
(8, '2e7819e8f16e6a588ef745d1229cac6ac92d459be3a0cf1166f5c3c9297b8803', '::1', 'credentials', 1, '2026-07-24 16:01:16'),
(10, '2e7819e8f16e6a588ef745d1229cac6ac92d459be3a0cf1166f5c3c9297b8803', '::1', 'credentials', 1, '2026-07-24 16:47:55'),
(17, '2e7819e8f16e6a588ef745d1229cac6ac92d459be3a0cf1166f5c3c9297b8803', '::1', 'credentials', 1, '2026-07-25 13:46:32'),
(19, '2e7819e8f16e6a588ef745d1229cac6ac92d459be3a0cf1166f5c3c9297b8803', '::1', 'credentials', 1, '2026-07-25 14:45:49'),
(22, '2e7819e8f16e6a588ef745d1229cac6ac92d459be3a0cf1166f5c3c9297b8803', '::1', 'credentials', 1, '2026-07-26 02:59:02'),
(25, '2e7819e8f16e6a588ef745d1229cac6ac92d459be3a0cf1166f5c3c9297b8803', '::1', 'credentials', 1, '2026-07-26 04:23:07'),
(27, '2e7819e8f16e6a588ef745d1229cac6ac92d459be3a0cf1166f5c3c9297b8803', '::1', 'credentials', 1, '2026-07-26 04:25:55'),
(29, '2e7819e8f16e6a588ef745d1229cac6ac92d459be3a0cf1166f5c3c9297b8803', '::1', 'credentials', 1, '2026-07-26 04:40:47'),
(31, '2e7819e8f16e6a588ef745d1229cac6ac92d459be3a0cf1166f5c3c9297b8803', '::1', 'credentials', 1, '2026-07-26 11:56:43'),
(33, '2e7819e8f16e6a588ef745d1229cac6ac92d459be3a0cf1166f5c3c9297b8803', '::1', 'credentials', 1, '2026-07-26 12:57:16'),
(38, '2e7819e8f16e6a588ef745d1229cac6ac92d459be3a0cf1166f5c3c9297b8803', '::1', 'credentials', 1, '2026-07-28 07:02:55'),
(40, '2e7819e8f16e6a588ef745d1229cac6ac92d459be3a0cf1166f5c3c9297b8803', '::1', 'credentials', 1, '2026-07-28 13:25:24'),
(44, '2e7819e8f16e6a588ef745d1229cac6ac92d459be3a0cf1166f5c3c9297b8803', '::1', 'credentials', 1, '2026-07-29 02:12:24'),
(47, '2e7819e8f16e6a588ef745d1229cac6ac92d459be3a0cf1166f5c3c9297b8803', '::1', 'credentials', 1, '2026-07-29 12:12:54'),
(49, '2e7819e8f16e6a588ef745d1229cac6ac92d459be3a0cf1166f5c3c9297b8803', '::1', 'credentials', 1, '2026-07-29 13:42:17'),
(51, '2e7819e8f16e6a588ef745d1229cac6ac92d459be3a0cf1166f5c3c9297b8803', '::1', 'credentials', 1, '2026-07-29 13:46:54'),
(53, '2e7819e8f16e6a588ef745d1229cac6ac92d459be3a0cf1166f5c3c9297b8803', '::1', 'credentials', 1, '2026-08-02 00:16:20'),
(56, '2e7819e8f16e6a588ef745d1229cac6ac92d459be3a0cf1166f5c3c9297b8803', '::1', 'credentials', 1, '2026-08-02 13:06:05'),
(11, 'ab6e5a226aa6481e21c3a5929519d69b58a20d958a5d65c825d6d47ddeba46c0', '::1', 'access_code', 0, '2026-07-25 07:13:52'),
(12, 'ab6e5a226aa6481e21c3a5929519d69b58a20d958a5d65c825d6d47ddeba46c0', '::1', 'access_code', 0, '2026-07-25 07:14:01'),
(13, 'ab6e5a226aa6481e21c3a5929519d69b58a20d958a5d65c825d6d47ddeba46c0', '::1', 'access_code', 0, '2026-07-25 07:14:02'),
(14, 'ab6e5a226aa6481e21c3a5929519d69b58a20d958a5d65c825d6d47ddeba46c0', '::1', 'access_code', 0, '2026-07-25 07:14:27'),
(15, 'ab6e5a226aa6481e21c3a5929519d69b58a20d958a5d65c825d6d47ddeba46c0', '::1', 'access_code', 0, '2026-07-25 07:14:30'),
(20, 'ab6e5a226aa6481e21c3a5929519d69b58a20d958a5d65c825d6d47ddeba46c0', '::1', 'access_code', 0, '2026-07-26 02:58:45'),
(23, 'ab6e5a226aa6481e21c3a5929519d69b58a20d958a5d65c825d6d47ddeba46c0', '::1', 'access_code', 0, '2026-07-26 04:22:52'),
(34, 'ab6e5a226aa6481e21c3a5929519d69b58a20d958a5d65c825d6d47ddeba46c0', '::1', 'access_code', 0, '2026-07-28 07:01:12'),
(35, 'ab6e5a226aa6481e21c3a5929519d69b58a20d958a5d65c825d6d47ddeba46c0', '::1', 'access_code', 0, '2026-07-28 07:01:33'),
(36, 'ab6e5a226aa6481e21c3a5929519d69b58a20d958a5d65c825d6d47ddeba46c0', '::1', 'access_code', 0, '2026-07-28 07:01:41'),
(41, 'ab6e5a226aa6481e21c3a5929519d69b58a20d958a5d65c825d6d47ddeba46c0', '::1', 'access_code', 0, '2026-07-29 02:12:04'),
(42, 'ab6e5a226aa6481e21c3a5929519d69b58a20d958a5d65c825d6d47ddeba46c0', '::1', 'access_code', 0, '2026-07-29 02:12:05'),
(45, 'ab6e5a226aa6481e21c3a5929519d69b58a20d958a5d65c825d6d47ddeba46c0', '::1', 'access_code', 0, '2026-07-29 12:12:25'),
(54, 'ab6e5a226aa6481e21c3a5929519d69b58a20d958a5d65c825d6d47ddeba46c0', '::1', 'access_code', 0, '2026-08-02 13:05:54'),
(1, 'ab6e5a226aa6481e21c3a5929519d69b58a20d958a5d65c825d6d47ddeba46c0', '::1', 'access_code', 1, '2026-07-23 07:15:44'),
(3, 'ab6e5a226aa6481e21c3a5929519d69b58a20d958a5d65c825d6d47ddeba46c0', '::1', 'access_code', 1, '2026-07-24 01:45:26'),
(5, 'ab6e5a226aa6481e21c3a5929519d69b58a20d958a5d65c825d6d47ddeba46c0', '::1', 'access_code', 1, '2026-07-24 12:10:55'),
(7, 'ab6e5a226aa6481e21c3a5929519d69b58a20d958a5d65c825d6d47ddeba46c0', '::1', 'access_code', 1, '2026-07-24 16:01:05'),
(9, 'ab6e5a226aa6481e21c3a5929519d69b58a20d958a5d65c825d6d47ddeba46c0', '::1', 'access_code', 1, '2026-07-24 16:47:40'),
(16, 'ab6e5a226aa6481e21c3a5929519d69b58a20d958a5d65c825d6d47ddeba46c0', '::1', 'access_code', 1, '2026-07-25 13:46:18'),
(18, 'ab6e5a226aa6481e21c3a5929519d69b58a20d958a5d65c825d6d47ddeba46c0', '::1', 'access_code', 1, '2026-07-25 14:45:34'),
(21, 'ab6e5a226aa6481e21c3a5929519d69b58a20d958a5d65c825d6d47ddeba46c0', '::1', 'access_code', 1, '2026-07-26 02:58:54'),
(24, 'ab6e5a226aa6481e21c3a5929519d69b58a20d958a5d65c825d6d47ddeba46c0', '::1', 'access_code', 1, '2026-07-26 04:22:59'),
(26, 'ab6e5a226aa6481e21c3a5929519d69b58a20d958a5d65c825d6d47ddeba46c0', '::1', 'access_code', 1, '2026-07-26 04:25:41'),
(28, 'ab6e5a226aa6481e21c3a5929519d69b58a20d958a5d65c825d6d47ddeba46c0', '::1', 'access_code', 1, '2026-07-26 04:40:31'),
(30, 'ab6e5a226aa6481e21c3a5929519d69b58a20d958a5d65c825d6d47ddeba46c0', '::1', 'access_code', 1, '2026-07-26 11:56:28'),
(32, 'ab6e5a226aa6481e21c3a5929519d69b58a20d958a5d65c825d6d47ddeba46c0', '::1', 'access_code', 1, '2026-07-26 12:57:04'),
(37, 'ab6e5a226aa6481e21c3a5929519d69b58a20d958a5d65c825d6d47ddeba46c0', '::1', 'access_code', 1, '2026-07-28 07:02:29'),
(39, 'ab6e5a226aa6481e21c3a5929519d69b58a20d958a5d65c825d6d47ddeba46c0', '::1', 'access_code', 1, '2026-07-28 13:25:14'),
(43, 'ab6e5a226aa6481e21c3a5929519d69b58a20d958a5d65c825d6d47ddeba46c0', '::1', 'access_code', 1, '2026-07-29 02:12:12'),
(46, 'ab6e5a226aa6481e21c3a5929519d69b58a20d958a5d65c825d6d47ddeba46c0', '::1', 'access_code', 1, '2026-07-29 12:12:36'),
(48, 'ab6e5a226aa6481e21c3a5929519d69b58a20d958a5d65c825d6d47ddeba46c0', '::1', 'access_code', 1, '2026-07-29 13:42:04'),
(50, 'ab6e5a226aa6481e21c3a5929519d69b58a20d958a5d65c825d6d47ddeba46c0', '::1', 'access_code', 1, '2026-07-29 13:46:46'),
(52, 'ab6e5a226aa6481e21c3a5929519d69b58a20d958a5d65c825d6d47ddeba46c0', '::1', 'access_code', 1, '2026-08-02 00:16:07'),
(55, 'ab6e5a226aa6481e21c3a5929519d69b58a20d958a5d65c825d6d47ddeba46c0', '::1', 'access_code', 1, '2026-08-02 13:06:00');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_cart`
--

CREATE TABLE `tbl_cart` (
  `cart_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `restaurant_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `addon_ids` varchar(255) DEFAULT NULL,
  `combo_choice_ids_json` longtext,
  `quantity` int(11) NOT NULL DEFAULT '1',
  `price_at_time` decimal(10,2) NOT NULL DEFAULT '0.00',
  `subtotal` decimal(10,2) NOT NULL DEFAULT '0.00',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `tbl_cart`
--

INSERT INTO `tbl_cart` (`cart_id`, `user_id`, `restaurant_id`, `product_id`, `addon_ids`, `combo_choice_ids_json`, `quantity`, `price_at_time`, `subtotal`, `created_at`, `updated_at`) VALUES
(1, 17, 4, 3, '[]', '[]', 1, '100.00', '100.00', '2026-08-02 00:17:09', '2026-08-02 00:17:09');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_categories`
--

CREATE TABLE `tbl_categories` (
  `category_id` int(11) NOT NULL,
  `restaurant_id` int(11) NOT NULL,
  `category_name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_chat_messages`
--

CREATE TABLE `tbl_chat_messages` (
  `message_id` int(11) NOT NULL,
  `session_id` int(11) NOT NULL,
  `sender` enum('bot','user') NOT NULL,
  `message` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_chat_sessions`
--

CREATE TABLE `tbl_chat_sessions` (
  `session_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `started_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_combos`
--

CREATE TABLE `tbl_combos` (
  `combo_id` int(11) NOT NULL,
  `restaurant_id` int(11) NOT NULL,
  `product_id` int(11) DEFAULT NULL,
  `combo_name` varchar(150) NOT NULL,
  `combo_price` decimal(10,2) NOT NULL,
  `is_active` tinyint(1) DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_combo_choice_groups`
--

CREATE TABLE `tbl_combo_choice_groups` (
  `choice_group_id` int(11) NOT NULL,
  `combo_id` int(11) NOT NULL,
  `group_name` varchar(100) NOT NULL,
  `min_select` int(11) NOT NULL DEFAULT '1',
  `max_select` int(11) NOT NULL DEFAULT '1',
  `is_required` tinyint(1) NOT NULL DEFAULT '1',
  `is_active` tinyint(1) NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_combo_choice_options`
--

CREATE TABLE `tbl_combo_choice_options` (
  `choice_option_id` int(11) NOT NULL,
  `choice_group_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `price_adjustment` decimal(10,2) NOT NULL DEFAULT '0.00',
  `is_active` tinyint(1) NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_combo_items`
--

CREATE TABLE `tbl_combo_items` (
  `combo_item_id` int(11) NOT NULL,
  `combo_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_delivery_assignments`
--

CREATE TABLE `tbl_delivery_assignments` (
  `assignment_id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `restaurant_id` int(11) NOT NULL,
  `rider_id` int(11) DEFAULT NULL,
  `assigned_by` int(11) NOT NULL,
  `assignment_type` enum('internal','external') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'internal',
  `delivery_status` enum('requested','assigned','accepted','picked_up','out_for_delivery','completed','cancelled') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'requested',
  `delivery_fee` decimal(10,2) NOT NULL DEFAULT '0.00',
  `rider_payment` decimal(10,2) NOT NULL DEFAULT '0.00',
  `assigned_at` datetime DEFAULT NULL,
  `accepted_at` datetime DEFAULT NULL,
  `picked_up_at` datetime DEFAULT NULL,
  `out_for_delivery_at` datetime DEFAULT NULL,
  `completed_at` datetime DEFAULT NULL,
  `cancelled_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_inventory`
--

CREATE TABLE `tbl_inventory` (
  `inventory_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `stock_quantity` int(11) NOT NULL DEFAULT '0',
  `critical_level` int(11) DEFAULT '5',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_notification_reads`
--

CREATE TABLE `tbl_notification_reads` (
  `notification_read_id` int(11) NOT NULL,
  `log_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `restaurant_id` int(11) NOT NULL,
  `read_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_orders`
--

CREATE TABLE `tbl_orders` (
  `order_id` int(11) NOT NULL,
  `order_qr_token` char(64) NOT NULL,
  `qr_verified_at` datetime DEFAULT NULL,
  `qr_expires_at` datetime DEFAULT NULL,
  `queue_number` int(11) DEFAULT NULL,
  `restaurant_id` int(11) NOT NULL,
  `processed_by_cashier_id` int(11) DEFAULT NULL,
  `user_id` int(11) NOT NULL,
  `customer_name` varchar(100) NOT NULL,
  `contact_number` varchar(30) NOT NULL,
  `order_type` varchar(30) NOT NULL,
  `order_status` enum('pending','preparing','ready','assigned','out_for_delivery','completed','cancelled') NOT NULL DEFAULT 'pending',
  `cancellation_reason` varchar(255) DEFAULT NULL,
  `cancelled_by` enum('cashier','customer') DEFAULT NULL,
  `cancelled_at` datetime DEFAULT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL DEFAULT '0.00',
  `delivery_fee` decimal(10,2) NOT NULL DEFAULT '0.00',
  `payment_method` varchar(50) DEFAULT NULL,
  `address` text,
  `landmark` varchar(255) DEFAULT NULL,
  `table_number` varchar(50) DEFAULT NULL,
  `pickup_time` varchar(20) DEFAULT NULL,
  `notes` text,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `tbl_orders`
--

INSERT INTO `tbl_orders` (`order_id`, `order_qr_token`, `qr_verified_at`, `qr_expires_at`, `queue_number`, `restaurant_id`, `processed_by_cashier_id`, `user_id`, `customer_name`, `contact_number`, `order_type`, `order_status`, `cancellation_reason`, `cancelled_by`, `cancelled_at`, `total_amount`, `subtotal`, `delivery_fee`, `payment_method`, `address`, `landmark`, `table_number`, `pickup_time`, `notes`, `created_at`) VALUES
(1, 'd0f69685dc9925746ded33b88065fdcc8ad8f58f8fac6a51990f40202a47409b', NULL, '2026-08-02 22:01:45', 1, 4, NULL, 12, 'Cj Tamayo Porto', '9457309228', 'dine-in', 'pending', NULL, NULL, NULL, '100.00', '100.00', '0.00', 'Cash', '', '', '', '', '', '2026-08-02 13:41:45'),
(2, 'f77b860e228adcd811c02b1eb288f9a988209dbb1bddc7a70bae0f6bb59cc183', NULL, '2026-08-02 22:39:03', 2, 4, NULL, 12, 'Cj Tamayo Porto', '9457309228', 'dine-in', 'pending', NULL, NULL, NULL, '30.00', '30.00', '0.00', 'Cash', '', '', '', '', '', '2026-08-02 14:19:03');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_order_items`
--

CREATE TABLE `tbl_order_items` (
  `order_item_id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `product_id` int(11) DEFAULT NULL,
  `combo_id` int(11) DEFAULT NULL,
  `quantity` int(11) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `regular_price` decimal(10,2) NOT NULL DEFAULT '0.00',
  `discount_type` enum('none','percentage','fixed') NOT NULL DEFAULT 'none',
  `discount_value` decimal(10,2) NOT NULL DEFAULT '0.00',
  `discount_savings` decimal(10,2) NOT NULL DEFAULT '0.00',
  `discount_applied` tinyint(1) NOT NULL DEFAULT '0',
  `product_name` varchar(150) DEFAULT NULL,
  `base_text` varchar(150) DEFAULT NULL,
  `combo_choice_text` varchar(500) DEFAULT NULL,
  `combo_choice_ids_json` longtext,
  `addon_text` varchar(150) DEFAULT NULL,
  `addon_ids_json` text
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `tbl_order_items`
--

INSERT INTO `tbl_order_items` (`order_item_id`, `order_id`, `product_id`, `combo_id`, `quantity`, `price`, `regular_price`, `discount_type`, `discount_value`, `discount_savings`, `discount_applied`, `product_name`, `base_text`, `combo_choice_text`, `combo_choice_ids_json`, `addon_text`, `addon_ids_json`) VALUES
(1, 1, 4, NULL, 1, '100.00', '0.00', 'none', '0.00', '0.00', 0, 'tapsilog', '', '', '[]', 'No Add-on', '[]'),
(2, 2, 4, NULL, 1, '30.00', '0.00', 'none', '0.00', '0.00', 0, 'tapsilog', '', '', '[]', 'No Add-on', '[]');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_owner_trusted_devices`
--

CREATE TABLE `tbl_owner_trusted_devices` (
  `trusted_device_id` bigint(20) UNSIGNED NOT NULL,
  `owner_id` int(11) NOT NULL,
  `selector` char(32) NOT NULL,
  `token_hash` char(64) NOT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `last_used_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `tbl_owner_trusted_devices`
--

INSERT INTO `tbl_owner_trusted_devices` (`trusted_device_id`, `owner_id`, `selector`, `token_hash`, `expires_at`, `created_at`, `last_used_at`) VALUES
(5, 19, '65778f3c9ccb58b8420414f048190e1b', '7f7c210a8d9f103fa60e9cc267e0b4b4c222641191d104f88da7cd6b7ddec484', '2026-08-24 15:49:51', '2026-07-25 21:49:51', '2026-07-26 12:38:34'),
(6, 22, '62c8ed88b8a14e9d29affaf40754802d', 'f83f86701cadcf1a8844be0fd575b969aeb7f63b91b682529099cc1e53522622', '2026-08-28 15:45:29', '2026-07-29 21:45:29', '2026-08-02 21:06:32'),
(7, 22, '21fc4047af34c4e99437b6394ba1ac65', 'e9c43c3ec9ecf57711ede7520e7413100b7207a37d22ffe932dba12d5527ed1a', '2026-08-29 06:28:39', '2026-07-30 12:28:39', '2026-08-02 08:17:41');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_partner_applications`
--

CREATE TABLE `tbl_partner_applications` (
  `application_id` int(11) NOT NULL,
  `owner_id` int(11) NOT NULL,
  `restaurant_name` varchar(150) NOT NULL,
  `restaurant_address` varchar(255) NOT NULL,
  `restaurant_contact` varchar(50) NOT NULL,
  `cuisine` varchar(100) NOT NULL,
  `restaurant_description` text,
  `logo_path` varchar(255) DEFAULT NULL,
  `business_email` varchar(150) DEFAULT NULL,
  `province` varchar(100) DEFAULT NULL,
  `city_municipality` varchar(100) DEFAULT NULL,
  `barangay` varchar(100) DEFAULT NULL,
  `postal_code` varchar(10) DEFAULT NULL,
  `business_hours_json` longtext,
  `delivery_options_json` longtext,
  `minimum_order` decimal(10,2) NOT NULL DEFAULT '0.00',
  `delivery_fee` decimal(10,2) NOT NULL DEFAULT '0.00',
  `application_status` enum('email_pending','draft','submitted','needs_changes','approved','rejected') NOT NULL DEFAULT 'email_pending',
  `rejection_reason` text,
  `submitted_at` datetime DEFAULT NULL,
  `reviewed_at` datetime DEFAULT NULL,
  `reviewed_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `tbl_partner_applications`
--

INSERT INTO `tbl_partner_applications` (`application_id`, `owner_id`, `restaurant_name`, `restaurant_address`, `restaurant_contact`, `cuisine`, `restaurant_description`, `logo_path`, `business_email`, `province`, `city_municipality`, `barangay`, `postal_code`, `business_hours_json`, `delivery_options_json`, `minimum_order`, `delivery_fee`, `application_status`, `rejection_reason`, `submitted_at`, `reviewed_at`, `reviewed_by`, `created_at`, `updated_at`) VALUES
(2, 18, 'Ayaw ko na Restaurant', 'Poblacion', '09457309228', 'Cafe', '', NULL, 'jameslee050505051@gmail.com', 'Pangasinan', 'Alaminos City', 'Poblacion', '2402', '{\"Monday\":{\"closed\":false,\"open\":\"08:00\",\"close\":\"20:00\"},\"Tuesday\":{\"closed\":false,\"open\":\"08:00\",\"close\":\"20:00\"},\"Wednesday\":{\"closed\":false,\"open\":\"08:00\",\"close\":\"20:00\"},\"Thursday\":{\"closed\":false,\"open\":\"08:00\",\"close\":\"20:00\"},\"Friday\":{\"closed\":false,\"open\":\"08:00\",\"close\":\"20:00\"},\"Saturday\":{\"closed\":false,\"open\":\"08:00\",\"close\":\"20:00\"},\"Sunday\":{\"closed\":true,\"open\":null,\"close\":null}}', '[\"pickup\",\"restaurant_delivery\"]', '0.00', '0.00', 'approved', NULL, '2026-07-24 18:47:03', '2026-07-25 00:48:06', 17, '2026-07-24 14:29:16', '2026-07-24 16:48:06'),
(3, 19, 'Hotdog cafe', 'Poblacion', '09457309228', 'Cafe', '', 'uploads/restaurant_logos/owner_19/restaurant_logo_20260725_154052_5fbe4653f64f8827.jpg', 'eeegggihtloh@gmail.com', 'Pangasinan', 'Alaminos City', 'Tanaytay', '2402', '{\"Monday\":{\"closed\":false,\"open\":\"08:00\",\"close\":\"20:00\"},\"Tuesday\":{\"closed\":false,\"open\":\"08:00\",\"close\":\"20:00\"},\"Wednesday\":{\"closed\":false,\"open\":\"08:00\",\"close\":\"20:00\"},\"Thursday\":{\"closed\":false,\"open\":\"08:00\",\"close\":\"20:00\"},\"Friday\":{\"closed\":false,\"open\":\"08:00\",\"close\":\"20:00\"},\"Saturday\":{\"closed\":false,\"open\":\"08:00\",\"close\":\"17:00\"},\"Sunday\":{\"closed\":true,\"open\":null,\"close\":null}}', '[\"pickup\",\"restaurant_delivery\"]', '0.00', '1000.00', 'approved', NULL, '2026-07-26 06:45:10', '2026-07-26 12:45:19', 17, '2026-07-25 13:37:21', '2026-07-26 04:45:19'),
(4, 20, 'da wundaful', 'Poblacion', '094573092298', 'Fast Food', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '0.00', '0.00', 'email_pending', NULL, NULL, NULL, NULL, '2026-07-26 12:10:07', '2026-07-26 12:10:07'),
(5, 21, 'da wundaful', 'Poblacion', '094573092298', 'Filipino', 'akoy na ihiii', 'uploads/restaurant_logos/owner_21/restaurant_logo_20260726_145557_0ea16fc377afa1e3.jpg', 'acadsonly67@gmail.com', 'Pangasinan', 'Alaminos City', 'Poblacion', '2402', '{\"Monday\":{\"closed\":false,\"open\":\"08:00\",\"close\":\"20:00\"},\"Tuesday\":{\"closed\":false,\"open\":\"08:00\",\"close\":\"20:00\"},\"Wednesday\":{\"closed\":false,\"open\":\"08:00\",\"close\":\"20:00\"},\"Thursday\":{\"closed\":false,\"open\":\"08:00\",\"close\":\"20:00\"},\"Friday\":{\"closed\":false,\"open\":\"08:00\",\"close\":\"20:00\"},\"Saturday\":{\"closed\":false,\"open\":\"08:00\",\"close\":\"20:00\"},\"Sunday\":{\"closed\":false,\"open\":\"08:00\",\"close\":\"20:00\"}}', '[\"pickup\",\"restaurant_delivery\"]', '0.00', '0.00', 'rejected', 'smoke and shers', '2026-07-26 14:56:42', '2026-07-26 21:06:37', 17, '2026-07-26 12:55:35', '2026-07-26 13:06:37'),
(6, 22, 'Test Environment', 'Poblacion', '094573092298', 'Cafe', '', 'uploads/restaurant_logos/owner_22/restaurant_logo_20260729_152152_2a2e89d6f0901449.jpg', 'cjmt42@gmail.com', 'Pangasinan', 'Alaminos City', 'Poblacion', '2402', '{\"Monday\":{\"closed\":false,\"open\":\"08:00\",\"close\":\"20:00\"},\"Tuesday\":{\"closed\":false,\"open\":\"08:00\",\"close\":\"20:00\"},\"Wednesday\":{\"closed\":false,\"open\":\"08:00\",\"close\":\"20:00\"},\"Thursday\":{\"closed\":false,\"open\":\"08:00\",\"close\":\"20:00\"},\"Friday\":{\"closed\":false,\"open\":\"08:00\",\"close\":\"20:00\"},\"Saturday\":{\"closed\":false,\"open\":\"08:00\",\"close\":\"20:00\"},\"Sunday\":{\"closed\":false,\"open\":\"08:00\",\"close\":\"20:00\"}}', '[\"pickup\",\"restaurant_delivery\"]', '0.00', '0.00', 'approved', NULL, '2026-07-29 21:46:16', '2026-07-29 22:21:48', 17, '2026-07-29 12:45:29', '2026-07-29 14:21:48');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_partner_invitation_requests`
--

CREATE TABLE `tbl_partner_invitation_requests` (
  `request_id` int(11) NOT NULL,
  `full_name` varchar(120) NOT NULL,
  `email` varchar(190) NOT NULL,
  `contact_number` varchar(30) DEFAULT NULL,
  `intended_restaurant` varchar(180) NOT NULL,
  `business_address` varchar(255) DEFAULT NULL,
  `message` text,
  `request_status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `reviewed_by` int(11) DEFAULT NULL,
  `reviewed_at` datetime DEFAULT NULL,
  `rejection_reason` text,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_products`
--

CREATE TABLE `tbl_products` (
  `product_id` int(11) NOT NULL,
  `restaurant_id` int(11) NOT NULL,
  `product_name` varchar(150) NOT NULL,
  `category` varchar(50) NOT NULL,
  `size` varchar(20) DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `stock` int(11) DEFAULT '0',
  `status` enum('Available','Unavailable') DEFAULT 'Available',
  `image_path` varchar(255) DEFAULT NULL,
  `discount_type` enum('none','percentage','fixed') NOT NULL DEFAULT 'none',
  `discount_value` decimal(10,2) NOT NULL DEFAULT '0.00',
  `discount_schedule` enum('permanent','scheduled') NOT NULL DEFAULT 'permanent',
  `discount_start` datetime DEFAULT NULL,
  `discount_end` datetime DEFAULT NULL,
  `discount_status` enum('Active','Inactive') NOT NULL DEFAULT 'Inactive'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `tbl_products`
--

INSERT INTO `tbl_products` (`product_id`, `restaurant_id`, `product_name`, `category`, `size`, `price`, `stock`, `status`, `image_path`, `discount_type`, `discount_value`, `discount_schedule`, `discount_start`, `discount_end`, `discount_status`) VALUES
(1, 4, 'Hotdog malaki', 'Burgir', 'Solo', '200.00', 20, 'Available', NULL, 'none', '0.00', 'permanent', NULL, NULL, 'Inactive'),
(2, 4, 'Masarap', 'Limited Edition', '', '99999999.99', 10, 'Available', '/FoodConnect/uploads/product_images/restaurant_4/product_2415e05751dd960d0282acb972ee152c.jpg', 'none', '0.00', 'permanent', NULL, NULL, 'Inactive'),
(4, 4, 'tapsilog', 'Silogmeals', '', '100.00', 8, 'Available', NULL, 'percentage', '70.00', 'scheduled', '2026-08-02 08:20:00', '2026-08-03 17:19:00', 'Active');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_queue`
--

CREATE TABLE `tbl_queue` (
  `queue_id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `queue_number` int(11) NOT NULL,
  `status` enum('waiting','serving','done') DEFAULT 'waiting',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_restaurants`
--

CREATE TABLE `tbl_restaurants` (
  `restaurant_id` int(11) NOT NULL,
  `name` varchar(150) NOT NULL,
  `description` text,
  `logo_path` varchar(255) DEFAULT NULL,
  `banner_path` varchar(255) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `contact_number` varchar(50) DEFAULT NULL,
  `opening_hours` varchar(100) DEFAULT NULL,
  `delivery_fee` decimal(10,2) NOT NULL DEFAULT '0.00',
  `business_status` enum('Open','Closed','Temporarily Unavailable') NOT NULL DEFAULT 'Open',
  `owner_id` int(11) NOT NULL,
  `staff_access_code` varchar(100) NOT NULL,
  `setup_completed` tinyint(1) NOT NULL DEFAULT '0',
  `customer_visibility` enum('Hidden','Visible') NOT NULL DEFAULT 'Hidden'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `tbl_restaurants`
--

INSERT INTO `tbl_restaurants` (`restaurant_id`, `name`, `description`, `logo_path`, `banner_path`, `address`, `contact_number`, `opening_hours`, `delivery_fee`, `business_status`, `owner_id`, `staff_access_code`, `setup_completed`, `customer_visibility`) VALUES
(2, 'Ayaw ko na Restaurant', NULL, NULL, NULL, 'Poblacion', '09457309228', 'Configured during partner application', '0.00', 'Closed', 18, '19EDF2E0A6C5', 1, 'Visible'),
(3, 'Hotdog cafe', NULL, 'uploads/restaurant_logos/owner_19/restaurant_logo_20260725_154052_5fbe4653f64f8827.jpg', NULL, 'Poblacion', '09457309228', 'Configured during partner application', '1000.00', 'Closed', 19, '72606EC1F9C2', 1, 'Visible'),
(4, 'Test Environment', '', 'uploads/restaurant_logos/owner_22/restaurant_logo_20260729_152152_2a2e89d6f0901449.jpg', NULL, 'Poblacion', '094573092298', 'Configured in restaurant setup', '0.00', 'Open', 22, 'F2FC80DF9A21', 1, 'Visible');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_stock_logs`
--

CREATE TABLE `tbl_stock_logs` (
  `log_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `change_qty` int(11) NOT NULL,
  `reason` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_users`
--

CREATE TABLE `tbl_users` (
  `user_id` int(11) NOT NULL,
  `restaurant_id` int(11) DEFAULT NULL,
  `role` varchar(30) NOT NULL,
  `full_name` varchar(150) NOT NULL,
  `email` varchar(150) NOT NULL,
  `contact_number` varchar(20) DEFAULT NULL,
  `address` text,
  `password_hash` varchar(255) NOT NULL,
  `status` tinyint(1) DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `remember_token_hash` varchar(255) DEFAULT NULL,
  `remember_token_expires` datetime DEFAULT NULL,
  `reset_token_hash` varchar(255) DEFAULT NULL,
  `reset_token_expires` datetime DEFAULT NULL,
  `is_verified` tinyint(4) DEFAULT '0',
  `verification_token` varchar(255) DEFAULT NULL,
  `verification_expires_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `tbl_users`
--

INSERT INTO `tbl_users` (`user_id`, `restaurant_id`, `role`, `full_name`, `email`, `contact_number`, `address`, `password_hash`, `status`, `created_at`, `remember_token_hash`, `remember_token_expires`, `reset_token_hash`, `reset_token_expires`, `is_verified`, `verification_token`, `verification_expires_at`) VALUES
(12, NULL, 'customer', 'helloworldcoding', 'carlosjaymiguel67@gmail.com', NULL, NULL, '$2y$10$mzxnPqxSSWSrVJngcTIuWuSbYzHER6nmwOJTryRdc9IcsOz3fif0i', 1, '2026-03-01 14:15:54', NULL, NULL, NULL, NULL, 1, NULL, NULL),
(17, NULL, 'admin', 'Carlos Jay Miguel T. Porto', 'foodconnectv1@gmail.com', '09457309228', NULL, '$2y$10$HExF9FmCKV0GMnEDRHWJT.T.e4BrRlL.ywOLwBm7dc43c6R1m0Xvq', 1, '2026-07-16 06:02:12', NULL, NULL, NULL, NULL, 1, NULL, NULL),
(18, 2, 'owner', 'Ian delacruz', 'jameslee050505051@gmail.com', '09457309228', NULL, '$2y$10$8Jy1FyOevG9VGm75bCknQ.x0EnTrO4DtXcbt2a9pq94F7nNdqLYGq', 1, '2026-07-24 14:29:16', NULL, NULL, NULL, NULL, 1, NULL, NULL),
(19, 3, 'owner', 'Angel Recepcion', 'eeegggihtloh@gmail.com', '09457309228', NULL, '$2y$10$Go4eCJ0zKM7OFhP1vvsM3uk9P/RmNgguLZEJHj1s/k91UX1AazDuK', 1, '2026-07-25 13:37:21', NULL, NULL, NULL, NULL, 1, NULL, NULL),
(20, NULL, 'owner', 'Injel the wundaful', 'gelracho07@gmail.com', '09457309228', NULL, '$2y$10$1iQqdbhvX9RtCIMCY1g2CeLAfia4IUhEXqrp2xRCB8TSgNWYsNRty', 0, '2026-07-26 12:10:07', NULL, NULL, NULL, NULL, 0, 'c7e55aae7800b03d16d40b48bcbac37abefa2d601e7ef332e3f54935deda6bbb', '2026-07-27 14:10:07'),
(21, NULL, 'owner', 'ian the nigg', 'acadsonly67@gmail.com', '09457309228', NULL, '$2y$10$abOOCeZjO83FfR0QaM.DxuEf6JGx5asoV92lX5IqQbtScckebkzPe', 1, '2026-07-26 12:55:35', NULL, NULL, NULL, NULL, 1, NULL, NULL),
(22, 4, 'owner', 'Cj Tamayo Porto', 'cjmt42@gmail.com', '09457309228', NULL, '$2y$10$oowy4BuGDmi8SIREiIdNq.lYjRYc9zF99dIkXlG51iYkOelRSBxKa', 1, '2026-07-29 12:45:29', NULL, NULL, NULL, NULL, 1, NULL, NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `tbl_activity_logs`
--
ALTER TABLE `tbl_activity_logs`
  ADD PRIMARY KEY (`log_id`);

--
-- Indexes for table `tbl_admin_login_attempts`
--
ALTER TABLE `tbl_admin_login_attempts`
  ADD PRIMARY KEY (`attempt_id`),
  ADD KEY `idx_admin_attempt_check` (`identifier_hash`,`ip_address`,`attempt_type`,`was_successful`,`attempted_at`),
  ADD KEY `idx_admin_attempt_cleanup` (`attempted_at`);

--
-- Indexes for table `tbl_cart`
--
ALTER TABLE `tbl_cart`
  ADD PRIMARY KEY (`cart_id`);

--
-- Indexes for table `tbl_categories`
--
ALTER TABLE `tbl_categories`
  ADD PRIMARY KEY (`category_id`),
  ADD KEY `restaurant_id` (`restaurant_id`);

--
-- Indexes for table `tbl_chat_messages`
--
ALTER TABLE `tbl_chat_messages`
  ADD PRIMARY KEY (`message_id`),
  ADD KEY `session_id` (`session_id`);

--
-- Indexes for table `tbl_chat_sessions`
--
ALTER TABLE `tbl_chat_sessions`
  ADD PRIMARY KEY (`session_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `tbl_combos`
--
ALTER TABLE `tbl_combos`
  ADD PRIMARY KEY (`combo_id`),
  ADD UNIQUE KEY `uq_combo_product` (`restaurant_id`,`product_id`);

--
-- Indexes for table `tbl_combo_choice_groups`
--
ALTER TABLE `tbl_combo_choice_groups`
  ADD PRIMARY KEY (`choice_group_id`),
  ADD KEY `idx_combo_choice_group_combo` (`combo_id`);

--
-- Indexes for table `tbl_combo_choice_options`
--
ALTER TABLE `tbl_combo_choice_options`
  ADD PRIMARY KEY (`choice_option_id`),
  ADD UNIQUE KEY `uq_combo_choice_option` (`choice_group_id`,`product_id`),
  ADD KEY `idx_combo_choice_product` (`product_id`);

--
-- Indexes for table `tbl_combo_items`
--
ALTER TABLE `tbl_combo_items`
  ADD PRIMARY KEY (`combo_item_id`),
  ADD KEY `combo_id` (`combo_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `tbl_delivery_assignments`
--
ALTER TABLE `tbl_delivery_assignments`
  ADD PRIMARY KEY (`assignment_id`),
  ADD UNIQUE KEY `uq_delivery_order_active` (`order_id`),
  ADD KEY `idx_delivery_restaurant` (`restaurant_id`),
  ADD KEY `idx_delivery_rider` (`rider_id`),
  ADD KEY `idx_delivery_assigned_by` (`assigned_by`),
  ADD KEY `idx_delivery_status` (`delivery_status`);

--
-- Indexes for table `tbl_inventory`
--
ALTER TABLE `tbl_inventory`
  ADD PRIMARY KEY (`inventory_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `tbl_notification_reads`
--
ALTER TABLE `tbl_notification_reads`
  ADD PRIMARY KEY (`notification_read_id`),
  ADD UNIQUE KEY `unique_user_notification` (`log_id`,`user_id`),
  ADD KEY `idx_notification_user` (`user_id`),
  ADD KEY `idx_notification_restaurant` (`restaurant_id`),
  ADD KEY `idx_notification_log` (`log_id`);

--
-- Indexes for table `tbl_orders`
--
ALTER TABLE `tbl_orders`
  ADD PRIMARY KEY (`order_id`),
  ADD UNIQUE KEY `uq_orders_qr_token` (`order_qr_token`),
  ADD KEY `restaurant_id` (`restaurant_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `idx_orders_processed_cashier` (`processed_by_cashier_id`);

--
-- Indexes for table `tbl_order_items`
--
ALTER TABLE `tbl_order_items`
  ADD PRIMARY KEY (`order_item_id`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `product_id` (`product_id`),
  ADD KEY `combo_id` (`combo_id`);

--
-- Indexes for table `tbl_owner_trusted_devices`
--
ALTER TABLE `tbl_owner_trusted_devices`
  ADD PRIMARY KEY (`trusted_device_id`),
  ADD UNIQUE KEY `selector` (`selector`),
  ADD KEY `idx_trusted_owner` (`owner_id`),
  ADD KEY `idx_trusted_expiration` (`expires_at`);

--
-- Indexes for table `tbl_partner_applications`
--
ALTER TABLE `tbl_partner_applications`
  ADD PRIMARY KEY (`application_id`),
  ADD UNIQUE KEY `uq_partner_owner` (`owner_id`),
  ADD KEY `idx_partner_status` (`application_status`),
  ADD KEY `fk_partner_reviewer` (`reviewed_by`);

--
-- Indexes for table `tbl_partner_invitation_requests`
--
ALTER TABLE `tbl_partner_invitation_requests`
  ADD PRIMARY KEY (`request_id`),
  ADD KEY `idx_partner_invitation_email` (`email`),
  ADD KEY `idx_partner_invitation_status` (`request_status`),
  ADD KEY `idx_partner_invitation_reviewed_by` (`reviewed_by`);

--
-- Indexes for table `tbl_products`
--
ALTER TABLE `tbl_products`
  ADD PRIMARY KEY (`product_id`);

--
-- Indexes for table `tbl_queue`
--
ALTER TABLE `tbl_queue`
  ADD PRIMARY KEY (`queue_id`),
  ADD KEY `order_id` (`order_id`);

--
-- Indexes for table `tbl_restaurants`
--
ALTER TABLE `tbl_restaurants`
  ADD PRIMARY KEY (`restaurant_id`),
  ADD KEY `fk_owner` (`owner_id`);

--
-- Indexes for table `tbl_stock_logs`
--
ALTER TABLE `tbl_stock_logs`
  ADD PRIMARY KEY (`log_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `tbl_users`
--
ALTER TABLE `tbl_users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `restaurant_id` (`restaurant_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `tbl_activity_logs`
--
ALTER TABLE `tbl_activity_logs`
  MODIFY `log_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

--
-- AUTO_INCREMENT for table `tbl_admin_login_attempts`
--
ALTER TABLE `tbl_admin_login_attempts`
  MODIFY `attempt_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=57;

--
-- AUTO_INCREMENT for table `tbl_cart`
--
ALTER TABLE `tbl_cart`
  MODIFY `cart_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `tbl_categories`
--
ALTER TABLE `tbl_categories`
  MODIFY `category_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_chat_messages`
--
ALTER TABLE `tbl_chat_messages`
  MODIFY `message_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_chat_sessions`
--
ALTER TABLE `tbl_chat_sessions`
  MODIFY `session_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_combos`
--
ALTER TABLE `tbl_combos`
  MODIFY `combo_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_combo_choice_groups`
--
ALTER TABLE `tbl_combo_choice_groups`
  MODIFY `choice_group_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_combo_choice_options`
--
ALTER TABLE `tbl_combo_choice_options`
  MODIFY `choice_option_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_combo_items`
--
ALTER TABLE `tbl_combo_items`
  MODIFY `combo_item_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_delivery_assignments`
--
ALTER TABLE `tbl_delivery_assignments`
  MODIFY `assignment_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_inventory`
--
ALTER TABLE `tbl_inventory`
  MODIFY `inventory_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_notification_reads`
--
ALTER TABLE `tbl_notification_reads`
  MODIFY `notification_read_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_orders`
--
ALTER TABLE `tbl_orders`
  MODIFY `order_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `tbl_order_items`
--
ALTER TABLE `tbl_order_items`
  MODIFY `order_item_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `tbl_owner_trusted_devices`
--
ALTER TABLE `tbl_owner_trusted_devices`
  MODIFY `trusted_device_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `tbl_partner_applications`
--
ALTER TABLE `tbl_partner_applications`
  MODIFY `application_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `tbl_partner_invitation_requests`
--
ALTER TABLE `tbl_partner_invitation_requests`
  MODIFY `request_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_products`
--
ALTER TABLE `tbl_products`
  MODIFY `product_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `tbl_queue`
--
ALTER TABLE `tbl_queue`
  MODIFY `queue_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_restaurants`
--
ALTER TABLE `tbl_restaurants`
  MODIFY `restaurant_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `tbl_stock_logs`
--
ALTER TABLE `tbl_stock_logs`
  MODIFY `log_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_users`
--
ALTER TABLE `tbl_users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `tbl_categories`
--
ALTER TABLE `tbl_categories`
  ADD CONSTRAINT `tbl_categories_ibfk_1` FOREIGN KEY (`restaurant_id`) REFERENCES `tbl_restaurants` (`restaurant_id`) ON DELETE CASCADE;

--
-- Constraints for table `tbl_chat_messages`
--
ALTER TABLE `tbl_chat_messages`
  ADD CONSTRAINT `tbl_chat_messages_ibfk_1` FOREIGN KEY (`session_id`) REFERENCES `tbl_chat_sessions` (`session_id`) ON DELETE CASCADE;

--
-- Constraints for table `tbl_chat_sessions`
--
ALTER TABLE `tbl_chat_sessions`
  ADD CONSTRAINT `tbl_chat_sessions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `tbl_users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `tbl_combos`
--
ALTER TABLE `tbl_combos`
  ADD CONSTRAINT `tbl_combos_ibfk_1` FOREIGN KEY (`restaurant_id`) REFERENCES `tbl_restaurants` (`restaurant_id`) ON DELETE CASCADE;

--
-- Constraints for table `tbl_combo_items`
--
ALTER TABLE `tbl_combo_items`
  ADD CONSTRAINT `tbl_combo_items_ibfk_1` FOREIGN KEY (`combo_id`) REFERENCES `tbl_combos` (`combo_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `tbl_combo_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `tbl_products` (`product_id`) ON DELETE CASCADE;

--
-- Constraints for table `tbl_delivery_assignments`
--
ALTER TABLE `tbl_delivery_assignments`
  ADD CONSTRAINT `fk_delivery_assigned_by` FOREIGN KEY (`assigned_by`) REFERENCES `tbl_users` (`user_id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_delivery_order` FOREIGN KEY (`order_id`) REFERENCES `tbl_orders` (`order_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_delivery_restaurant` FOREIGN KEY (`restaurant_id`) REFERENCES `tbl_restaurants` (`restaurant_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_delivery_rider` FOREIGN KEY (`rider_id`) REFERENCES `tbl_users` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `tbl_inventory`
--
ALTER TABLE `tbl_inventory`
  ADD CONSTRAINT `tbl_inventory_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `tbl_products` (`product_id`) ON DELETE CASCADE;

--
-- Constraints for table `tbl_notification_reads`
--
ALTER TABLE `tbl_notification_reads`
  ADD CONSTRAINT `fk_notification_read_log` FOREIGN KEY (`log_id`) REFERENCES `tbl_activity_logs` (`log_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_notification_read_user` FOREIGN KEY (`user_id`) REFERENCES `tbl_users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `tbl_orders`
--
ALTER TABLE `tbl_orders`
  ADD CONSTRAINT `fk_orders_processed_cashier` FOREIGN KEY (`processed_by_cashier_id`) REFERENCES `tbl_users` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `tbl_orders_ibfk_1` FOREIGN KEY (`restaurant_id`) REFERENCES `tbl_restaurants` (`restaurant_id`),
  ADD CONSTRAINT `tbl_orders_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `tbl_users` (`user_id`);

--
-- Constraints for table `tbl_order_items`
--
ALTER TABLE `tbl_order_items`
  ADD CONSTRAINT `tbl_order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `tbl_orders` (`order_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `tbl_order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `tbl_products` (`product_id`),
  ADD CONSTRAINT `tbl_order_items_ibfk_3` FOREIGN KEY (`combo_id`) REFERENCES `tbl_combos` (`combo_id`);

--
-- Constraints for table `tbl_owner_trusted_devices`
--
ALTER TABLE `tbl_owner_trusted_devices`
  ADD CONSTRAINT `fk_trusted_device_owner` FOREIGN KEY (`owner_id`) REFERENCES `tbl_users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `tbl_partner_applications`
--
ALTER TABLE `tbl_partner_applications`
  ADD CONSTRAINT `fk_partner_owner` FOREIGN KEY (`owner_id`) REFERENCES `tbl_users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_partner_reviewer` FOREIGN KEY (`reviewed_by`) REFERENCES `tbl_users` (`user_id`) ON DELETE SET NULL;

--
-- Constraints for table `tbl_partner_invitation_requests`
--
ALTER TABLE `tbl_partner_invitation_requests`
  ADD CONSTRAINT `fk_partner_invitation_reviewer` FOREIGN KEY (`reviewed_by`) REFERENCES `tbl_users` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `tbl_queue`
--
ALTER TABLE `tbl_queue`
  ADD CONSTRAINT `tbl_queue_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `tbl_orders` (`order_id`) ON DELETE CASCADE;

--
-- Constraints for table `tbl_restaurants`
--
ALTER TABLE `tbl_restaurants`
  ADD CONSTRAINT `fk_owner` FOREIGN KEY (`owner_id`) REFERENCES `tbl_users` (`user_id`);

--
-- Constraints for table `tbl_stock_logs`
--
ALTER TABLE `tbl_stock_logs`
  ADD CONSTRAINT `tbl_stock_logs_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `tbl_products` (`product_id`) ON DELETE CASCADE;

--
-- Constraints for table `tbl_users`
--
ALTER TABLE `tbl_users`
  ADD CONSTRAINT `tbl_users_ibfk_1` FOREIGN KEY (`restaurant_id`) REFERENCES `tbl_restaurants` (`restaurant_id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
