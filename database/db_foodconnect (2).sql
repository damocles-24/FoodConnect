-- phpMyAdmin SQL Dump
-- version 4.8.3
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jul 27, 2026 at 04:30 PM
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
(1, 1, 12, 'customer', 'order', 'New Customer Order', 'ihiieee placed Order #1 / Queue #1.', '2026-07-23 04:57:55'),
(2, 1, 15, 'cashier', 'order', 'Order Status Updated', 'Cashier changed Order #1 from pending to preparing.', '2026-07-23 05:25:35'),
(3, 1, 15, NULL, 'delivery_assignment', 'Rider Assigned', 'deliver was assigned and automatically accepted delivery Order #1.', '2026-07-23 05:25:46'),
(4, 1, 14, NULL, 'delivery_status', 'Order Picked Up', 'The rider picked up delivery Order #1 from the restaurant.', '2026-07-23 05:26:21'),
(5, 1, 14, NULL, 'delivery_status', 'Out for Delivery', 'Delivery Order #1 is now out for delivery.', '2026-07-23 05:26:33'),
(6, 1, 14, NULL, 'delivery_status', 'Delivery Completed', 'Delivery Order #1 was completed successfully.', '2026-07-23 05:26:44'),
(7, 1, 17, 'admin', 'account_status', 'Platform User Deactivated', 'Carlos Jay Miguel T. Porto changed Carlos Jay Miguel T. Porto (cjmt42@gmail.com, Owner) from Active to Inactive.', '2026-07-24 12:22:39'),
(8, 1, 17, 'admin', 'account_status', 'Platform User Activated', 'Carlos Jay Miguel T. Porto changed Carlos Jay Miguel T. Porto (cjmt42@gmail.com, Owner) from Inactive to Active.', '2026-07-24 12:23:27'),
(9, 1, 17, 'admin', 'account_status', 'Platform User Deactivated', 'Carlos Jay Miguel T. Porto changed Carlos Jay Miguel T. Porto (cjmt42@gmail.com, Owner) from Active to Inactive.', '2026-07-24 13:53:09'),
(10, 1, 17, 'admin', 'restaurant_access', 'Restaurant Reactivated', 'Carlos Jay Miguel T. Porto restored FoodConnect access for BlackHabit. The owner account was reactivated. Staff remain inactive until reviewed.', '2026-07-24 16:57:54'),
(11, 2, 17, 'admin', 'restaurant_status', 'Restaurant Status Updated', 'Carlos Jay Miguel T. Porto changed Ayaw ko na Restaurant from Closed to Open.', '2026-07-26 11:56:51'),
(12, 2, 17, 'admin', 'restaurant_status', 'Restaurant Status Updated', 'Carlos Jay Miguel T. Porto changed Ayaw ko na Restaurant from Open to Closed.', '2026-07-26 12:04:05'),
(13, 2, 17, 'admin', 'restaurant_status', 'Restaurant Status Updated', 'Carlos Jay Miguel T. Porto changed Ayaw ko na Restaurant from Closed to Open.', '2026-07-26 12:04:27'),
(14, 1, 12, 'customer', 'order', 'New Customer Order', 'Cj Tamayo Porto placed Order #2 / Queue #1.', '2026-07-27 04:20:06'),
(15, 1, 12, 'customer', 'order', 'New Customer Order', 'Cj Tamayo Porto placed Order #3 / Queue #2.', '2026-07-27 05:10:39'),
(16, 1, 15, 'cashier', 'order', 'Order Status Updated', 'Cashier changed Order #2 from pending to preparing.', '2026-07-27 05:12:22'),
(17, 1, 12, 'customer', 'order', 'New Customer Order', 'Heheheh placed Order #4 / Queue #3.', '2026-07-27 12:53:18'),
(18, 1, 12, 'customer', 'order', 'New Customer Order', 'huhuhahah placed Order #5 / Queue #4.', '2026-07-27 13:13:53'),
(19, 1, 15, 'cashier', 'order', 'Order Cancelled', 'Cashier cancelled Queue #4 • Order #5 for Customer. Reason: Item is unavailable. Stock was restored.', '2026-07-27 13:14:52'),
(20, 1, 12, 'customer', 'order', 'New Customer Order', 'huhuhaha placed Order #6 / Queue #5.', '2026-07-27 13:36:30'),
(21, 1, 15, 'cashier', 'order', 'Order Cancelled', 'Cashier cancelled Queue #5 • Order #6 for Customer. Reason: Item is unavailable. Stock was restored.', '2026-07-27 13:37:18'),
(22, 1, 12, 'customer', 'order', 'New Customer Order', 'hsjwbwkwklwkw82828 placed Order #7 / Queue #6.', '2026-07-27 13:47:19'),
(23, 1, 15, 'cashier', 'order', 'Order Cancelled', 'Cashier cancelled Queue #6 • Order #7 for Customer. Reason: Item is unavailable. Stock was restored.', '2026-07-27 13:47:56'),
(24, 1, 12, 'customer', 'order', 'New Customer Order', 'Hatod placed Order #8 / Queue #7.', '2026-07-27 14:18:42'),
(25, 1, 15, 'cashier', 'order', 'Order Cancelled', 'Cashier cancelled Queue #7 • Order #8 for Customer. Reason: Unable to prepare the order. Stock was restored.', '2026-07-27 14:19:06');

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
(11, 'ab6e5a226aa6481e21c3a5929519d69b58a20d958a5d65c825d6d47ddeba46c0', '::1', 'access_code', 0, '2026-07-25 07:13:52'),
(12, 'ab6e5a226aa6481e21c3a5929519d69b58a20d958a5d65c825d6d47ddeba46c0', '::1', 'access_code', 0, '2026-07-25 07:14:01'),
(13, 'ab6e5a226aa6481e21c3a5929519d69b58a20d958a5d65c825d6d47ddeba46c0', '::1', 'access_code', 0, '2026-07-25 07:14:02'),
(14, 'ab6e5a226aa6481e21c3a5929519d69b58a20d958a5d65c825d6d47ddeba46c0', '::1', 'access_code', 0, '2026-07-25 07:14:27'),
(15, 'ab6e5a226aa6481e21c3a5929519d69b58a20d958a5d65c825d6d47ddeba46c0', '::1', 'access_code', 0, '2026-07-25 07:14:30'),
(20, 'ab6e5a226aa6481e21c3a5929519d69b58a20d958a5d65c825d6d47ddeba46c0', '::1', 'access_code', 0, '2026-07-26 02:58:45'),
(23, 'ab6e5a226aa6481e21c3a5929519d69b58a20d958a5d65c825d6d47ddeba46c0', '::1', 'access_code', 0, '2026-07-26 04:22:52'),
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
(32, 'ab6e5a226aa6481e21c3a5929519d69b58a20d958a5d65c825d6d47ddeba46c0', '::1', 'access_code', 1, '2026-07-26 12:57:04');

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

-- --------------------------------------------------------

--
-- Table structure for table `tbl_categories`
--

CREATE TABLE `tbl_categories` (
  `category_id` int(11) NOT NULL,
  `restaurant_id` int(11) NOT NULL,
  `category_name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `tbl_categories`
--

INSERT INTO `tbl_categories` (`category_id`, `restaurant_id`, `category_name`) VALUES
(1, 1, 'Shawarma');

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

--
-- Dumping data for table `tbl_combos`
--

INSERT INTO `tbl_combos` (`combo_id`, `restaurant_id`, `product_id`, `combo_name`, `combo_price`, `is_active`) VALUES
(1, 1, 5, 'Shawarma Pita', '120.00', 1),
(2, 1, 6, 'Shawarma Pita Cheese', '130.00', 1),
(3, 1, 7, 'Shawarma Pita All Meat', '140.00', 1),
(4, 1, 8, 'Shawarma Rice', '150.00', 1),
(5, 1, 9, 'Shawarma Pita + Milktea', '110.00', 1),
(6, 1, 10, 'Shawarma Pita + Fruit Tea', '100.00', 1),
(7, 1, 11, 'Shawarma Rice + Milktea', '120.00', 1),
(8, 1, 12, 'Shawarma Rice + Fruit Tea', '115.00', 1),
(9, 1, 112, 'Shawarma Burger', '55.00', 1),
(10, 1, 113, 'Shawarma Burger Cheese', '65.00', 1),
(11, 1, 114, 'Shawarma Burger All Meat', '70.00', 1),
(12, 1, 115, 'Shawarma Burger + Milktea', '99.00', 1),
(13, 1, 116, 'Shawarma Burger + Fruit Tea', '89.00', 1),
(14, 1, 119, 'Fries Solo + Milktea', '120.00', 1),
(15, 1, 120, 'Fries + Fruit Tea', '110.00', 1);

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

--
-- Dumping data for table `tbl_combo_choice_groups`
--

INSERT INTO `tbl_combo_choice_groups` (`choice_group_id`, `combo_id`, `group_name`, `min_select`, `max_select`, `is_required`, `is_active`) VALUES
(1, 5, 'Choose Regular Milk Tea', 1, 1, 1, 1),
(2, 6, 'Choose Regular Fruit Tea', 1, 1, 1, 1),
(3, 7, 'Choose Regular Milk Tea', 1, 1, 1, 1),
(4, 8, 'Choose Regular Fruit Tea', 1, 1, 1, 1),
(5, 14, 'Choose Regular Milk Tea', 1, 1, 1, 1),
(6, 15, 'Choose Regular Fruit Tea', 1, 1, 1, 1);

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

--
-- Dumping data for table `tbl_combo_choice_options`
--

INSERT INTO `tbl_combo_choice_options` (`choice_option_id`, `choice_group_id`, `product_id`, `price_adjustment`, `is_active`) VALUES
(1, 1, 61, '0.00', 1),
(2, 3, 61, '0.00', 1),
(3, 5, 61, '0.00', 1),
(4, 1, 62, '0.00', 1),
(5, 3, 62, '0.00', 1),
(6, 5, 62, '0.00', 1),
(7, 1, 63, '0.00', 1),
(8, 3, 63, '0.00', 1),
(9, 5, 63, '0.00', 1),
(10, 1, 64, '0.00', 1),
(11, 3, 64, '0.00', 1),
(12, 5, 64, '0.00', 1),
(13, 1, 65, '0.00', 1),
(14, 3, 65, '0.00', 1),
(15, 5, 65, '0.00', 1),
(16, 1, 66, '0.00', 1),
(17, 3, 66, '0.00', 1),
(18, 5, 66, '0.00', 1),
(19, 1, 67, '0.00', 1),
(20, 3, 67, '0.00', 1),
(21, 5, 67, '0.00', 1),
(22, 1, 68, '0.00', 1),
(23, 3, 68, '0.00', 1),
(24, 5, 68, '0.00', 1),
(25, 1, 69, '0.00', 1),
(26, 3, 69, '0.00', 1),
(27, 5, 69, '0.00', 1),
(28, 1, 70, '0.00', 1),
(29, 3, 70, '0.00', 1),
(30, 5, 70, '0.00', 1),
(31, 1, 136, '0.00', 1),
(32, 3, 136, '0.00', 1),
(33, 5, 136, '0.00', 1),
(34, 1, 137, '0.00', 1),
(35, 3, 137, '0.00', 1),
(36, 5, 137, '0.00', 1),
(37, 1, 138, '0.00', 1),
(38, 3, 138, '0.00', 1),
(39, 5, 138, '0.00', 1),
(40, 1, 139, '0.00', 1),
(41, 3, 139, '0.00', 1),
(42, 5, 139, '0.00', 1),
(43, 1, 140, '0.00', 1),
(44, 3, 140, '0.00', 1),
(45, 5, 140, '0.00', 1),
(46, 1, 141, '0.00', 1),
(47, 3, 141, '0.00', 1),
(48, 5, 141, '0.00', 1),
(49, 1, 142, '0.00', 1),
(50, 3, 142, '0.00', 1),
(51, 5, 142, '0.00', 1),
(52, 1, 143, '0.00', 1),
(53, 3, 143, '0.00', 1),
(54, 5, 143, '0.00', 1),
(55, 1, 144, '0.00', 1),
(56, 3, 144, '0.00', 1),
(57, 5, 144, '0.00', 1),
(64, 2, 83, '0.00', 1),
(65, 4, 83, '0.00', 1),
(66, 6, 83, '0.00', 1),
(67, 2, 84, '0.00', 1),
(68, 4, 84, '0.00', 1),
(69, 6, 84, '0.00', 1),
(70, 2, 85, '0.00', 1),
(71, 4, 85, '0.00', 1),
(72, 6, 85, '0.00', 1),
(73, 2, 86, '0.00', 1),
(74, 4, 86, '0.00', 1),
(75, 6, 86, '0.00', 1);

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

--
-- Dumping data for table `tbl_combo_items`
--

INSERT INTO `tbl_combo_items` (`combo_item_id`, `combo_id`, `product_id`, `quantity`) VALUES
(1, 1, 1, 2),
(2, 2, 2, 2),
(3, 3, 3, 2),
(4, 4, 4, 2),
(5, 5, 1, 1),
(6, 6, 1, 1),
(7, 7, 4, 1),
(8, 8, 4, 1),
(9, 14, 117, 1),
(10, 15, 117, 1);

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

--
-- Dumping data for table `tbl_delivery_assignments`
--

INSERT INTO `tbl_delivery_assignments` (`assignment_id`, `order_id`, `restaurant_id`, `rider_id`, `assigned_by`, `assignment_type`, `delivery_status`, `delivery_fee`, `rider_payment`, `assigned_at`, `accepted_at`, `picked_up_at`, `out_for_delivery_at`, `completed_at`, `cancelled_at`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 14, 15, 'internal', 'completed', '50.00', '0.00', '2026-07-23 13:25:46', '2026-07-23 13:25:46', '2026-07-23 13:26:21', '2026-07-23 13:26:33', '2026-07-23 13:26:44', NULL, '2026-07-23 05:25:46', '2026-07-23 05:26:44');

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

INSERT INTO `tbl_orders` (`order_id`, `order_qr_token`, `queue_number`, `restaurant_id`, `processed_by_cashier_id`, `user_id`, `customer_name`, `contact_number`, `order_type`, `order_status`, `cancellation_reason`, `cancelled_by`, `cancelled_at`, `total_amount`, `subtotal`, `delivery_fee`, `payment_method`, `address`, `landmark`, `table_number`, `pickup_time`, `notes`, `created_at`) VALUES
(1, 'b4be7dfddc3c3c10b9e8384dca674753c136b6aca1d4a457ff36267b0ab0b01e', 1, 1, 15, 12, 'ihiieee', '09239989127', 'delivery', 'completed', NULL, NULL, NULL, '89.00', '39.00', '50.00', 'Cash on Delivery', 'Poblacion', 'novo', '', '', '', '2026-07-23 04:57:55'),
(2, '2864b775131e4abf5b0060842e4127c00a9366342214598855eeb1786b9ba02a', 1, 1, 15, 12, 'Cj Tamayo Porto', '9321783218', 'dine-in', 'preparing', NULL, NULL, NULL, '39.00', '39.00', '0.00', 'Cash', '', '', '', '', '', '2026-07-27 04:20:06'),
(3, 'b40b1bfe77c5d32ccb460e5e8c9b69d33af6a9198ef76104638e9ba5791b37dd', 2, 1, NULL, 12, 'Cj Tamayo Porto', '9766868667', 'dine-in', 'pending', NULL, NULL, NULL, '39.00', '39.00', '0.00', 'Cash', '', '', '', '', '', '2026-07-27 05:10:39'),
(4, '796c9788dbba767838b17e0054131511935097feec5c96f50b452e4b860951e1', 3, 1, NULL, 12, 'Heheheh', '9457309228', 'dine-in', 'pending', NULL, NULL, NULL, '39.00', '39.00', '0.00', 'Cash', '', '', '', '', '', '2026-07-27 12:53:18'),
(5, 'c018cf90a9ab803f26d849cd97de2da90078d6d234497791739654b0fbab5b89', 4, 1, 15, 12, 'huhuhahah', '9457309228', 'dine-in', 'cancelled', 'Item is unavailable', 'cashier', '2026-07-27 21:14:52', '49.00', '49.00', '0.00', 'Cash', '', '', '', '', '', '2026-07-27 13:13:53'),
(6, '58e86d67198e95681ce95f300687a571dac8efa16c6e1dde2deb663413cb7e63', 5, 1, 15, 12, 'huhuhaha', '9457309228', 'dine-in', 'cancelled', 'Item is unavailable', 'cashier', '2026-07-27 21:37:18', '49.00', '49.00', '0.00', 'Cash', '', '', '', '', '', '2026-07-27 13:36:29'),
(7, 'bcf9841f806926cfd9403f53a01e763f30899a58ba2066aa202371fec42479c6', 6, 1, 15, 12, 'hsjwbwkwklwkw82828', '9457386494', 'dine-in', 'cancelled', 'Item is unavailable', 'cashier', '2026-07-27 21:47:56', '49.00', '49.00', '0.00', 'Cash', '', '', '', '', '', '2026-07-27 13:47:19'),
(8, '553d453e07ea691a480e45edfa05a6f6109e9b253228303284ea30df3a97cd1e', 7, 1, 15, 12, 'Hatod', '9546464646', 'dine-in', 'cancelled', 'Unable to prepare the order', 'cashier', '2026-07-27 22:19:06', '79.00', '79.00', '0.00', 'Cash', '', '', '', '', '', '2026-07-27 14:18:42');

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

INSERT INTO `tbl_order_items` (`order_item_id`, `order_id`, `product_id`, `combo_id`, `quantity`, `price`, `product_name`, `base_text`, `combo_choice_text`, `combo_choice_ids_json`, `addon_text`, `addon_ids_json`) VALUES
(1, 1, 62, NULL, 1, '39.00', 'Wintermelon', 'Regular', '', '[]', 'No Add-on', '[]'),
(2, 2, 62, NULL, 1, '39.00', 'Wintermelon', 'Regular', '', '[]', 'No Add-on', '[]'),
(3, 3, 62, NULL, 1, '39.00', 'Wintermelon', 'Regular', '', '[]', 'No Add-on', '[]'),
(4, 4, 62, NULL, 1, '39.00', 'Wintermelon', 'Regular', '', '[]', 'No Add-on', '[]'),
(5, 5, 122, NULL, 1, '49.00', 'Wintermelon', 'Large', '', '[]', 'No Add-on', '[]'),
(6, 6, 122, NULL, 1, '49.00', 'Wintermelon', 'Large', '', '[]', 'No Add-on', '[]'),
(7, 7, 62, NULL, 1, '49.00', 'Wintermelon', 'Regular', '', '[]', 'Nata', '[146]'),
(8, 8, 122, NULL, 1, '79.00', 'Wintermelon', 'Large', '', '[]', 'Black Pearl, Nata, Fruit Jelly', '[145,146,147]');

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
(6, 11, '0aab48e14fcf29f5b80bc3df80e6ca5b', '3d6906a964a83fb9fe25e4cbd86cccb64c951902bfbc49fb8ed426d8a773eb22', '2026-08-26 07:13:20', '2026-07-27 13:13:20', NULL);

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
(5, 21, 'da wundaful', 'Poblacion', '094573092298', 'Filipino', 'akoy na ihiii', 'uploads/restaurant_logos/owner_21/restaurant_logo_20260726_145557_0ea16fc377afa1e3.jpg', 'acadsonly67@gmail.com', 'Pangasinan', 'Alaminos City', 'Poblacion', '2402', '{\"Monday\":{\"closed\":false,\"open\":\"08:00\",\"close\":\"20:00\"},\"Tuesday\":{\"closed\":false,\"open\":\"08:00\",\"close\":\"20:00\"},\"Wednesday\":{\"closed\":false,\"open\":\"08:00\",\"close\":\"20:00\"},\"Thursday\":{\"closed\":false,\"open\":\"08:00\",\"close\":\"20:00\"},\"Friday\":{\"closed\":false,\"open\":\"08:00\",\"close\":\"20:00\"},\"Saturday\":{\"closed\":false,\"open\":\"08:00\",\"close\":\"20:00\"},\"Sunday\":{\"closed\":false,\"open\":\"08:00\",\"close\":\"20:00\"}}', '[\"pickup\",\"restaurant_delivery\"]', '0.00', '0.00', 'rejected', 'smoke and shers', '2026-07-26 14:56:42', '2026-07-26 21:06:37', 17, '2026-07-26 12:55:35', '2026-07-26 13:06:37');

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
  `status` enum('Available','Unavailable') DEFAULT 'Available'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `tbl_products`
--

INSERT INTO `tbl_products` (`product_id`, `restaurant_id`, `product_name`, `category`, `size`, `price`, `stock`, `status`) VALUES
(1, 1, 'Shawarma Pita', 'Solo', NULL, '65.00', 1, 'Unavailable'),
(2, 1, 'Shawarma Pita Cheese', 'Solo', NULL, '70.00', 0, 'Unavailable'),
(3, 1, 'Shawarma Pita All Meat', 'Solo', NULL, '75.00', 0, 'Unavailable'),
(4, 1, 'Shawarma Rice', 'Solo', NULL, '80.00', 0, 'Unavailable'),
(5, 1, 'Shawarma Pita', 'Buy 1 Take 1', NULL, '120.00', 0, 'Unavailable'),
(6, 1, 'Shawarma Pita Cheese', 'Buy 1 Take 1', NULL, '130.00', 0, 'Unavailable'),
(7, 1, 'Shawarma Pita All Meat', 'Buy 1 Take 1', NULL, '140.00', 0, 'Unavailable'),
(8, 1, 'Shawarma Rice', 'Buy 1 Take 1', NULL, '150.00', 0, 'Unavailable'),
(9, 1, 'Shawarma Pita + Milktea', 'Combo', NULL, '110.00', 0, 'Unavailable'),
(10, 1, 'Shawarma Pita + Fruit Tea', 'Combo', NULL, '100.00', 0, 'Unavailable'),
(11, 1, 'Shawarma Rice + Milktea', 'Combo', NULL, '120.00', 0, 'Unavailable'),
(12, 1, 'Shawarma Rice + Fruit Tea', 'Combo', NULL, '115.00', 0, 'Unavailable'),
(13, 1, 'Java Chips', 'Frappe', 'Regular', '119.00', 0, 'Unavailable'),
(14, 1, 'Java Chips', 'Frappe', 'Large', '139.00', 0, 'Unavailable'),
(15, 1, 'Coffee Jelly', 'Frappe', 'Regular', '109.00', 0, 'Unavailable'),
(16, 1, 'Coffee Jelly', 'Frappe', 'Large', '129.00', 0, 'Unavailable'),
(17, 1, 'Coffee Crumble', 'Frappe', 'Regular', '109.00', 0, 'Unavailable'),
(18, 1, 'Coffee Crumble', 'Frappe', 'Large', '129.00', 0, 'Unavailable'),
(19, 1, 'Choco Delux', 'Frappe', 'Regular', '109.00', 0, 'Unavailable'),
(20, 1, 'Choco Delux', 'Frappe', 'Large', '129.00', 0, 'Unavailable'),
(21, 1, 'Peanut Butter Cookie', 'Frappe', 'Regular', '109.00', 0, 'Unavailable'),
(22, 1, 'Peanut Butter Cookie', 'Frappe', 'Large', '129.00', 0, 'Unavailable'),
(23, 1, 'Cookies & Cream', 'Frappe', 'Regular', '109.00', 0, 'Unavailable'),
(24, 1, 'Cookies & Cream', 'Frappe', 'Large', '129.00', 0, 'Unavailable'),
(25, 1, 'Oreo Strawberry', 'Frappe', 'Regular', '109.00', 0, 'Unavailable'),
(26, 1, 'Oreo Strawberry', 'Frappe', 'Large', '129.00', 0, 'Unavailable'),
(27, 1, 'Ube Quezo', 'Frappe', 'Regular', '109.00', 0, 'Unavailable'),
(28, 1, 'Ube Quezo', 'Frappe', 'Large', '119.00', 0, 'Unavailable'),
(29, 1, 'Pandan Cream', 'Frappe', 'Regular', '109.00', 0, 'Unavailable'),
(30, 1, 'Pandan Cream', 'Frappe', 'Large', '119.00', 0, 'Unavailable'),
(31, 1, 'Mango Graham', 'Frappe', 'Regular', '119.00', 0, 'Unavailable'),
(32, 1, 'Mango Graham', 'Frappe', 'Large', '139.00', 0, 'Unavailable'),
(33, 1, 'Avocado Crushed', 'Frappe', 'Regular', '109.00', 0, 'Unavailable'),
(34, 1, 'Avocado Crushed', 'Frappe', 'Large', '129.00', 0, 'Unavailable'),
(35, 1, 'Matcha Latte', 'Non Coffee', 'Regular', '79.00', 0, 'Unavailable'),
(36, 1, 'Matcha Latte', 'Non Coffee Cream', 'Cream', '89.00', 0, 'Unavailable'),
(37, 1, 'Choco Latte', 'Non Coffee', 'Regular', '79.00', 0, 'Unavailable'),
(38, 1, 'Choco Latte', 'Non Coffee Cream', 'Cream', '89.00', 0, 'Unavailable'),
(39, 1, 'Strawberry Milk', 'Non Coffee', 'Regular', '79.00', 0, 'Unavailable'),
(40, 1, 'Strawberry Milk', 'Non Coffee Cream', 'Cream', '89.00', 0, 'Unavailable'),
(41, 1, 'Brown Sugar Cheesecake', 'Non Coffee Cream', 'Cream', '99.00', 0, 'Unavailable'),
(42, 1, 'Matchaberry', 'Non Coffee', 'Regular', '79.00', 0, 'Unavailable'),
(43, 1, 'Matchaberry', 'Non Coffee Cream', 'Cream', '89.00', 0, 'Unavailable'),
(44, 1, 'Melon Milk', 'Non Coffee', 'Regular', '79.00', 0, 'Unavailable'),
(45, 1, 'Melon Milk', 'Non Coffee Cream', 'Cream', '89.00', 0, 'Unavailable'),
(46, 1, 'Pandan Milk', 'Non Coffee', 'Regular', '79.00', 0, 'Unavailable'),
(47, 1, 'Pandan Milk', 'Non Coffee Cream', 'Cream', '89.00', 0, 'Unavailable'),
(48, 1, 'Americano', 'Coffee - Hot and Iced', NULL, '69.00', 0, 'Unavailable'),
(49, 1, 'Spanish Latte', 'Coffee - Hot and Iced', NULL, '109.00', 0, 'Unavailable'),
(50, 1, 'Caramel Macchiatto', 'Coffee - Hot and Iced', NULL, '119.00', 0, 'Unavailable'),
(51, 1, 'White Chocolate Mocha', 'Coffee - Hot and Iced', NULL, '119.00', 0, 'Unavailable'),
(52, 1, 'Cafe Mocha', 'Coffee - Hot and Iced', NULL, '119.00', 0, 'Unavailable'),
(53, 1, 'Cappuccino', 'Coffee - Hot and Iced', NULL, '109.00', 0, 'Unavailable'),
(54, 1, 'Seasalt Latte', 'Coffee - Iced Coffee', NULL, '129.00', 0, 'Unavailable'),
(55, 1, 'Matcha Coffee', 'Coffee - Iced Coffee', NULL, '120.00', 0, 'Unavailable'),
(56, 1, 'Butterscotch', 'Coffee - Iced Coffee', NULL, '129.00', 0, 'Unavailable'),
(57, 1, 'Biscoff Latte', 'Coffee - Iced Coffee', NULL, '139.00', 0, 'Unavailable'),
(58, 1, 'Einspanner Coffee', 'Coffee - Iced Coffee', NULL, '129.00', 0, 'Unavailable'),
(59, 1, 'Brown Sugar Coffee', 'Coffee - Iced Coffee', NULL, '109.00', 0, 'Unavailable'),
(60, 1, 'Coffee Jelly', 'Coffee - Iced Coffee', NULL, '109.00', 0, 'Unavailable'),
(61, 1, 'Dark Chocolate', 'Milktea Classic', 'Regular', '39.00', 0, 'Unavailable'),
(62, 1, 'Wintermelon', 'Milktea Classic', 'Regular', '39.00', 3, 'Available'),
(63, 1, 'Okinawa', 'Milktea Classic', 'Regular', '39.00', 0, 'Unavailable'),
(64, 1, 'Cheesecake', 'Milktea Classic', 'Regular', '39.00', 0, 'Unavailable'),
(65, 1, 'Matcha', 'Milktea Classic', 'Regular', '39.00', 0, 'Unavailable'),
(66, 1, 'Taro', 'Milktea Classic', 'Regular', '39.00', 0, 'Unavailable'),
(67, 1, 'Hokkaido', 'Milktea Classic', 'Regular', '39.00', 0, 'Unavailable'),
(68, 1, 'Cookies & Cream', 'Milktea Classic', 'Regular', '39.00', 0, 'Unavailable'),
(69, 1, 'Salted Caramel', 'Milktea Classic', 'Regular', '39.00', 0, 'Unavailable'),
(70, 1, 'Red Velvet', 'Milktea Classic', 'Regular', '39.00', 2, 'Available'),
(71, 1, 'Dark Oreo', 'Milktea Classic', 'Large', '49.00', 10, 'Available'),
(72, 1, 'Avocado', 'Milktea Classic', 'Large', '49.00', 0, 'Unavailable'),
(73, 1, 'Black Forest', 'Milktea Classic', 'Large', '49.00', 0, 'Unavailable'),
(74, 1, 'Coffee Crumble', 'Milktea Classic', 'Large', '49.00', 0, 'Unavailable'),
(75, 1, 'Nutella', 'Milktea Classic', 'Large', '49.00', 0, 'Unavailable'),
(76, 1, 'Vanilla Oreo', 'Milktea Classic', 'Large', '49.00', 0, 'Unavailable'),
(77, 1, 'Cappuccino', 'Milktea Classic', 'Large', '49.00', 0, 'Unavailable'),
(78, 1, 'Strawberry', 'Milktea Classic', 'Large', '49.00', 0, 'Unavailable'),
(79, 1, 'Mango Pastillas', 'Milktea Classic', 'Large', '49.00', 0, 'Unavailable'),
(80, 1, 'Black Pearl', 'Milktea Classic Add-on', NULL, '10.00', 0, 'Unavailable'),
(81, 1, 'Nata', 'Milktea Classic Add-on', NULL, '10.00', 0, 'Unavailable'),
(82, 1, 'Fruit Jelly', 'Milktea Classic Add-on', NULL, '10.00', 0, 'Unavailable'),
(83, 1, 'Lychee', 'Fruit Tea', 'Regular', '29.00', 0, 'Unavailable'),
(84, 1, 'Blue Lemonade', 'Fruit Tea', 'Regular', '29.00', 0, 'Unavailable'),
(85, 1, 'Green Apple', 'Fruit Tea', 'Regular', '29.00', 0, 'Unavailable'),
(86, 1, 'Mix Berries', 'Fruit Tea', 'Regular', '29.00', 0, 'Unavailable'),
(87, 1, 'Passion Fruit', 'Fruit Tea', 'Large', '39.00', 0, 'Unavailable'),
(88, 1, 'Tropical', 'Fruit Tea', 'Large', '39.00', 0, 'Unavailable'),
(89, 1, 'Strawberry', 'Fruit Tea', 'Large', '39.00', 0, 'Unavailable'),
(90, 1, 'Blueberry', 'Fruit Tea', 'Large', '39.00', 0, 'Unavailable'),
(91, 1, 'Oreo Cheesecake', 'Milktea Creamcheese', NULL, '79.00', 0, 'Unavailable'),
(92, 1, 'Dark Chocolate', 'Milktea Creamcheese', NULL, '69.00', 0, 'Unavailable'),
(93, 1, 'Wintermelon', 'Milktea Creamcheese', NULL, '69.00', 0, 'Unavailable'),
(94, 1, 'Okinawa', 'Milktea Creamcheese', NULL, '69.00', 0, 'Unavailable'),
(95, 1, 'Matcha', 'Milktea Creamcheese', NULL, '69.00', 0, 'Unavailable'),
(96, 1, 'Taro', 'Milktea Creamcheese', NULL, '69.00', 0, 'Unavailable'),
(97, 1, 'Hokkaido', 'Milktea Creamcheese', NULL, '69.00', 0, 'Unavailable'),
(98, 1, 'Cookies & Cream', 'Milktea Creamcheese', NULL, '69.00', 0, 'Unavailable'),
(99, 1, 'Salted Caramel', 'Milktea Creamcheese', NULL, '69.00', 0, 'Unavailable'),
(100, 1, 'Red Velvet', 'Milktea Creamcheese', NULL, '69.00', 0, 'Unavailable'),
(101, 1, 'Dark Oreo', 'Milktea Creamcheese', NULL, '69.00', 0, 'Unavailable'),
(102, 1, 'Avocado', 'Milktea Creamcheese', NULL, '69.00', 0, 'Unavailable'),
(103, 1, 'Black Forest', 'Milktea Creamcheese', NULL, '69.00', 0, 'Unavailable'),
(104, 1, 'Coffee Crumble', 'Milktea Creamcheese', NULL, '69.00', 0, 'Unavailable'),
(105, 1, 'Nutella', 'Milktea Creamcheese', NULL, '69.00', 0, 'Unavailable'),
(106, 1, 'Vanilla Oreo', 'Milktea Creamcheese', NULL, '69.00', 0, 'Unavailable'),
(107, 1, 'Cappuccino', 'Milktea Creamcheese', NULL, '69.00', 0, 'Unavailable'),
(108, 1, 'Strawberry', 'Milktea Creamcheese', NULL, '69.00', 0, 'Unavailable'),
(109, 1, 'Mango Pastillas', 'Milktea Creamcheese', NULL, '69.00', 0, 'Unavailable'),
(110, 1, 'Oreo Crushed', 'Milktea Creamcheese Add-on', NULL, '10.00', 0, 'Unavailable'),
(111, 1, 'More Creamcheese', 'Milktea Creamcheese Add-on', NULL, '20.00', 0, 'Unavailable'),
(112, 1, 'Shawarma Burger', 'Shawarma Burger - Buy 1 Take 1', NULL, '55.00', 0, 'Unavailable'),
(113, 1, 'Shawarma Burger Cheese', 'Shawarma Burger - Buy 1 Take 1', NULL, '65.00', 0, 'Unavailable'),
(114, 1, 'Shawarma Burger All Meat', 'Shawarma Burger - Buy 1 Take 1', NULL, '70.00', 0, 'Unavailable'),
(115, 1, 'Shawarma Burger + Milktea', 'Shawarma Burger Combo', NULL, '99.00', 0, 'Unavailable'),
(116, 1, 'Shawarma Burger + Fruit Tea', 'Shawarma Burger Combo', NULL, '89.00', 0, 'Unavailable'),
(117, 1, 'Fries Solo Overload', 'Fries', NULL, '75.00', 0, 'Unavailable'),
(118, 1, 'Fries Barkada Overload w/ Shawarma', 'Fries', NULL, '130.00', 20, 'Available'),
(119, 1, 'Fries Solo + Milktea', 'Fries Combo', NULL, '120.00', 2, 'Available'),
(120, 1, 'Fries + Fruit Tea', 'Fries Combo', NULL, '110.00', 40, 'Available'),
(121, 1, 'Dark Chocolate', 'Milktea Classic', 'Large', '49.00', 0, 'Unavailable'),
(122, 1, 'Wintermelon', 'Milktea Classic', 'Large', '49.00', 10, 'Available'),
(123, 1, 'Okinawa', 'Milktea Classic', 'Large', '49.00', 0, 'Unavailable'),
(124, 1, 'Cheesecake', 'Milktea Classic', 'Large', '49.00', 0, 'Unavailable'),
(125, 1, 'Matcha', 'Milktea Classic', 'Large', '49.00', 0, 'Unavailable'),
(126, 1, 'Taro', 'Milktea Classic', 'Large', '49.00', 0, 'Unavailable'),
(127, 1, 'Hokkaido', 'Milktea Classic', 'Large', '49.00', 0, 'Unavailable'),
(128, 1, 'Cookies & Cream', 'Milktea Classic', 'Large', '49.00', 0, 'Unavailable'),
(129, 1, 'Salted Caramel', 'Milktea Classic', 'Large', '49.00', 0, 'Unavailable'),
(130, 1, 'Red Velvet', 'Milktea Classic', 'Large', '49.00', 9, 'Available'),
(136, 1, 'Dark Oreo', 'Milktea Classic', 'Regular', '39.00', 10, 'Available'),
(137, 1, 'Avocado', 'Milktea Classic', 'Regular', '39.00', 0, 'Unavailable'),
(138, 1, 'Black Forest', 'Milktea Classic', 'Regular', '39.00', 0, 'Unavailable'),
(139, 1, 'Coffee Crumble', 'Milktea Classic', 'Regular', '39.00', 0, 'Unavailable'),
(140, 1, 'Nutella', 'Milktea Classic', 'Regular', '39.00', 0, 'Unavailable'),
(141, 1, 'Vanilla Oreo', 'Milktea Classic', 'Regular', '39.00', 0, 'Unavailable'),
(142, 1, 'Cappuccino', 'Milktea Classic', 'Regular', '39.00', 0, 'Unavailable'),
(143, 1, 'Strawberry', 'Milktea Classic', 'Regular', '39.00', 0, 'Unavailable'),
(144, 1, 'Mango Pastillas', 'Milktea Classic', 'Regular', '39.00', 0, 'Unavailable'),
(145, 1, 'Black Pearl', 'Milktea Classic Add-on', NULL, '10.00', 9, 'Available'),
(146, 1, 'Nata', 'Milktea Classic Add-on', NULL, '10.00', 9, 'Available'),
(147, 1, 'Fruit Jelly', 'Milktea Classic Add-on', NULL, '10.00', 8, 'Available'),
(148, 1, 'Oreo Crushed', 'Milktea Creamcheese Add-on', NULL, '10.00', 10, 'Available'),
(149, 1, 'More Creamcheese', 'Milktea Creamcheese Add-on', NULL, '20.00', 10, 'Available'),
(150, 1, 'weare', 'Shawarma', 'Solo', '20.00', 1, 'Available');

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
(1, 'BlackHabit', NULL, NULL, NULL, 'Cp Garcia Street,Alaminos City', '09109970717', '8:00 AM - 10:00 PM', '50.00', 'Open', 11, 'BH20261234', 1, 'Visible'),
(2, 'Ayaw ko na Restaurant', NULL, NULL, NULL, 'Poblacion', '09457309228', 'Configured during partner application', '0.00', 'Open', 18, '19EDF2E0A6C5', 1, 'Visible'),
(3, 'Hotdog cafe', NULL, 'uploads/restaurant_logos/owner_19/restaurant_logo_20260725_154052_5fbe4653f64f8827.jpg', NULL, 'Poblacion', '09457309228', 'Configured during partner application', '1000.00', 'Closed', 19, '72606EC1F9C2', 1, 'Visible');

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
(11, 1, 'owner', 'Carlos Jay Miguel T. Porto', 'cjmt42@gmail.com', '09457309228', 'Poblacion', '$2y$10$9YgBtorlcNFrrshiQxwiGeZgR8yetIiJaB221XD24rNrwKA3YU9uW', 1, '2026-02-27 13:28:55', NULL, NULL, NULL, NULL, 1, NULL, NULL),
(12, NULL, 'customer', 'helloworldcoding', 'carlosjaymiguel67@gmail.com', NULL, NULL, '$2y$10$mzxnPqxSSWSrVJngcTIuWuSbYzHER6nmwOJTryRdc9IcsOz3fif0i', 1, '2026-03-01 14:15:54', '$2y$10$uFTHlKG5fZ5JnCloLk4dYu.B9si1HuvyqneJqYn6.gd98RTtUC6pa', '2026-08-26 16:18:14', NULL, NULL, 1, NULL, NULL),
(13, 1, 'cashier', 'hehe', 'carlosjaymiguelporto67@gmail.com', '09456661234', 'manila city', '$2y$10$oHS20kygAup0e758IDIJqe75MhkuBlGFMqYw87Lum11UZRvOOKdgO', 1, '2026-07-05 06:56:22', NULL, NULL, NULL, NULL, 0, NULL, NULL),
(14, 1, 'delivery_staff', 'deliver', 'jameslee11@gmail.com', '09985556307', 'Poblacion', '$2y$10$uxz.ZCQIgQa3tGGbbB.wneU8PGsVuN4hFXn2M9y1vk/wATLk8fNdC', 1, '2026-07-10 03:57:46', NULL, NULL, NULL, NULL, 0, NULL, NULL),
(15, 1, 'cashier', 'cashier', 'itlog@gmail.com', '12345543312', 'Poblacion', '$2y$10$kPTsRHBtNGbR.2SPRneUD.w49mJZC7f0//JkC7U1oRU7/sJRg2chW', 1, '2026-07-10 04:12:54', NULL, NULL, NULL, NULL, 0, NULL, NULL),
(17, NULL, 'admin', 'Carlos Jay Miguel T. Porto', 'foodconnectv1@gmail.com', '09457309228', NULL, '$2y$10$HExF9FmCKV0GMnEDRHWJT.T.e4BrRlL.ywOLwBm7dc43c6R1m0Xvq', 1, '2026-07-16 06:02:12', NULL, NULL, NULL, NULL, 1, NULL, NULL),
(18, 2, 'owner', 'Ian delacruz', 'jameslee050505051@gmail.com', '09457309228', NULL, '$2y$10$8Jy1FyOevG9VGm75bCknQ.x0EnTrO4DtXcbt2a9pq94F7nNdqLYGq', 1, '2026-07-24 14:29:16', NULL, NULL, NULL, NULL, 1, NULL, NULL),
(19, 3, 'owner', 'Angel Recepcion', 'eeegggihtloh@gmail.com', '09457309228', NULL, '$2y$10$Go4eCJ0zKM7OFhP1vvsM3uk9P/RmNgguLZEJHj1s/k91UX1AazDuK', 1, '2026-07-25 13:37:21', NULL, NULL, NULL, NULL, 1, NULL, NULL),
(20, NULL, 'owner', 'Injel the wundaful', 'gelracho07@gmail.com', '09457309228', NULL, '$2y$10$1iQqdbhvX9RtCIMCY1g2CeLAfia4IUhEXqrp2xRCB8TSgNWYsNRty', 0, '2026-07-26 12:10:07', NULL, NULL, NULL, NULL, 0, 'c7e55aae7800b03d16d40b48bcbac37abefa2d601e7ef332e3f54935deda6bbb', '2026-07-27 14:10:07'),
(21, NULL, 'owner', 'ian the nigg', 'acadsonly67@gmail.com', '09457309228', NULL, '$2y$10$abOOCeZjO83FfR0QaM.DxuEf6JGx5asoV92lX5IqQbtScckebkzPe', 1, '2026-07-26 12:55:35', NULL, NULL, NULL, NULL, 1, NULL, NULL);

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
  MODIFY `log_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT for table `tbl_admin_login_attempts`
--
ALTER TABLE `tbl_admin_login_attempts`
  MODIFY `attempt_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=34;

--
-- AUTO_INCREMENT for table `tbl_cart`
--
ALTER TABLE `tbl_cart`
  MODIFY `cart_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `tbl_categories`
--
ALTER TABLE `tbl_categories`
  MODIFY `category_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

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
  MODIFY `combo_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `tbl_combo_choice_groups`
--
ALTER TABLE `tbl_combo_choice_groups`
  MODIFY `choice_group_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `tbl_combo_choice_options`
--
ALTER TABLE `tbl_combo_choice_options`
  MODIFY `choice_option_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=76;

--
-- AUTO_INCREMENT for table `tbl_combo_items`
--
ALTER TABLE `tbl_combo_items`
  MODIFY `combo_item_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `tbl_delivery_assignments`
--
ALTER TABLE `tbl_delivery_assignments`
  MODIFY `assignment_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

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
  MODIFY `order_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `tbl_order_items`
--
ALTER TABLE `tbl_order_items`
  MODIFY `order_item_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `tbl_owner_trusted_devices`
--
ALTER TABLE `tbl_owner_trusted_devices`
  MODIFY `trusted_device_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `tbl_partner_applications`
--
ALTER TABLE `tbl_partner_applications`
  MODIFY `application_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `tbl_products`
--
ALTER TABLE `tbl_products`
  MODIFY `product_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=151;

--
-- AUTO_INCREMENT for table `tbl_queue`
--
ALTER TABLE `tbl_queue`
  MODIFY `queue_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_restaurants`
--
ALTER TABLE `tbl_restaurants`
  MODIFY `restaurant_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `tbl_stock_logs`
--
ALTER TABLE `tbl_stock_logs`
  MODIFY `log_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_users`
--
ALTER TABLE `tbl_users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

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
