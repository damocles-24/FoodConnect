-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Sep 11, 2026 at 10:22 PM
-- Server version: 11.4.13-MariaDB-cll-lve-log
-- PHP Version: 8.4.24

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `foodbbfd_foodconnect`
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
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_activity_logs`
--

INSERT INTO `tbl_activity_logs` (`log_id`, `restaurant_id`, `user_id`, `user_role`, `action_type`, `action_title`, `action_description`, `created_at`) VALUES
(118, 6, 27, 'owner', 'product', 'Product Variants Added', 'Product: Sweet and Spicy\nCategory: Chicken Wings\nVariants: Solo Meal ₱105.00 (stock 20), 4pcs ₱140.00 (stock 20), 6pcs ₱210.00 (stock 20)', '2026-08-14 18:40:41'),
(119, 6, 27, 'owner', 'product', 'Product Variants Added', 'Product: Teriyaki\nCategory: Chicken Wings\nVariants: Solo Meal ₱105.00 (stock 20), 4 pcs ₱140.00 (stock 20), 6 pcs ₱210.00 (stock 20)', '2026-08-14 18:44:42'),
(120, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Teriyaki\nChanges:\nVariant: 6 pcs → 6pcs', '2026-08-14 18:44:57'),
(121, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Teriyaki\nChanges:\nVariant: 4 pcs → 4pcs', '2026-08-14 18:45:06'),
(122, 6, 27, 'owner', 'product', 'Product Variants Added', 'Product: Honey BBQ\nCategory: Chicken Wings\nVariants: Solo Meal ₱105.00 (stock 20), 4 pcs ₱140.00 (stock 20), 6 pcs ₱210.00 (stock 20)', '2026-08-14 18:46:02'),
(123, 6, 27, 'owner', 'product', 'Product Variants Added', 'Product: Buffalo\nCategory: Chicken Wings\nVariants: Solo Meal ₱105.00 (stock 20), 4 pcs ₱140.00 (stock 20), 6 pcs ₱210.00 (stock 20)', '2026-08-14 18:47:08'),
(124, 6, 27, 'owner', 'product', 'Product Variants Added', 'Product: Garlic Parmesan\nCategory: Chicken Wings\nVariants: Solo Meal ₱105.00 (stock 20), 4 pcs ₱140.00 (stock 20), 6 pcs ₱210.00 (stock 20)', '2026-08-14 18:48:02'),
(125, 6, 27, 'owner', 'product', 'Product Added', 'Product: Spamsilog\nCategory: Rice Meals\nPrice: ₱130.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-14 18:48:42'),
(126, 6, 27, 'owner', 'product', 'Product Added', 'Product: Cornsilog\nCategory: Rice Meals\nPrice: ₱130.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-14 18:49:16'),
(127, 6, 27, 'owner', 'product', 'Product Added', 'Product: Tosilog\nCategory: Rice Meals\nPrice: ₱135.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-14 18:49:39'),
(128, 6, 27, 'owner', 'product', 'Product Added', 'Product: Tofu Sisig\nCategory: Rice Meals\nPrice: ₱135.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-14 18:50:13'),
(129, 6, 27, 'owner', 'product', 'Product Added', 'Product: Tapsilog\nCategory: Rice Meals\nPrice: ₱145.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-14 18:50:37'),
(130, 6, 27, 'owner', 'product', 'Product Added', 'Product: Pork Sisig\nCategory: Rice Meals\nPrice: ₱150.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-14 18:51:07'),
(131, 6, 27, 'owner', 'product', 'Product Added', 'Product: Filipino Spaghetti\nCategory: Pasta\nPrice: ₱99.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-14 18:51:39'),
(132, 6, 27, 'owner', 'product', 'Product Added', 'Product: Mushroom Alfredo\nCategory: Pasta\nPrice: ₱130.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-14 18:52:21'),
(133, 6, 27, 'owner', 'product', 'Product Added', 'Product: Creamy Pesto Tuna\nCategory: Pasta\nPrice: ₱160.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-14 18:52:44'),
(134, 6, 27, 'owner', 'product', 'Product Variants Added', 'Product: French Fries\nCategory: Snacks\nVariants: Plain ₱99.00 (stock 20), Cheese ₱99.00 (stock 20), BBQ ₱99.00 (stock 20), Sour Cream Onion ₱99.00 (stock 20)', '2026-08-14 18:54:10'),
(135, 6, 27, 'owner', 'product', 'Product Added', 'Product: Overload Fries\nCategory: Snacks\nPrice: ₱130.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-14 18:54:32'),
(136, 6, 27, 'owner', 'product', 'Product Added', 'Product: Overload Nachos\nCategory: Snacks\nPrice: ₱145.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-14 18:54:58'),
(137, 6, 27, 'owner', 'product', 'Product Added', 'Product: Overload Combo\nCategory: Snacks\nPrice: ₱160.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-14 18:55:26'),
(138, 6, 27, 'owner', 'product', 'Product Added', 'Product: Drop Platter\nCategory: Snacks\nPrice: ₱460.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-14 18:56:22'),
(139, 6, 27, 'owner', 'product', 'Product Added', 'Product: Classic Burger\nCategory: Burger Series\nPrice: ₱150.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-14 18:56:55'),
(140, 6, 27, 'owner', 'product', 'Product Added', 'Product: Double Cheese Burger\nCategory: Burger Series\nPrice: ₱160.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-14 18:57:26'),
(141, 6, 27, 'owner', 'product', 'Product Added', 'Product: Meaty Burger\nCategory: Burger Series\nPrice: ₱165.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-14 18:57:52'),
(142, 6, 27, 'owner', 'product', 'Product Added', 'Product: Drop Supreme Burger\nCategory: Burger Series\nPrice: ₱175.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-14 18:58:19'),
(143, 6, 27, 'owner', 'product', 'Product Added', 'Product: Tuna Sandwich\nCategory: Sandwiches\nPrice: ₱125.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-14 18:58:58'),
(144, 6, 27, 'owner', 'product', 'Product Added', 'Product: Clubhouse Sandwich\nCategory: Sandwiches\nPrice: ₱140.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-14 18:59:33'),
(145, 6, 27, 'owner', 'product', 'Product Added', 'Product: Siomai Rice\nCategory: Budget Meal\nPrice: ₱59.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-14 19:00:10'),
(146, 6, 27, 'owner', 'product', 'Product Added', 'Product: Shanghai Rice\nCategory: Budget Meal\nPrice: ₱59.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-14 19:00:37'),
(147, 6, 27, 'owner', 'product', 'Product Added', 'Product: Adobo Flakes\nCategory: Budget Meal\nPrice: ₱89.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-14 19:01:05'),
(148, 6, 27, 'owner', 'product', 'Product Added', 'Product: Chicken Poppers\nCategory: Budget Meal\nPrice: ₱70.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-14 19:01:38'),
(149, 6, 27, 'owner', 'product', 'Product Added', 'Product: Combo Cravings\nCategory: Budget Meal\nPrice: ₱79.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-14 19:02:05'),
(150, 6, 27, 'owner', 'product', 'Product Added', 'Product: Savory Duo\nCategory: Budget Meal\nPrice: ₱99.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-14 19:02:32'),
(151, 6, 27, 'owner', 'product', 'Product Added', 'Product: Pinapaitan\nCategory: Ulam Specials\nPrice: ₱220.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-14 19:03:09'),
(152, 6, 27, 'owner', 'product', 'Product Added', 'Product: Pork Igado\nCategory: Ulam Specials\nPrice: ₱200.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-14 19:03:30'),
(153, 6, 27, 'owner', 'product', 'Product Added', 'Product: Tofu Sisig\nCategory: Ulam Specials\nPrice: ₱160.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-14 19:03:58'),
(154, 6, 27, 'owner', 'product', 'Product Added', 'Product: Bulalo\nCategory: Ulam Specials\nPrice: ₱380.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-14 19:04:22'),
(155, 6, 27, 'owner', 'product', 'Product Added', 'Product: Pork Sisig\nCategory: Ulam Specials\nPrice: ₱180.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-14 19:04:47'),
(156, 6, 27, 'owner', 'product', 'Product Variants Added', 'Product: Pour-Over\nCategory: Drinks - Coffee Based\nVariants: Hot ₱80.00 (stock 20), Medium ₱90.00 (stock 20), Large ₱100.00 (stock 20)', '2026-08-15 10:39:24'),
(157, 6, 27, 'owner', 'product', 'Product Variants Added', 'Product: Americano\nCategory: Drinks - Coffee Based\nVariants: Hot ₱80.00 (stock 20), Medium ₱90.00 (stock 20), Large ₱100.00 (stock 20)', '2026-08-15 10:41:09'),
(158, 6, 27, 'owner', 'product', 'Product Variants Added', 'Product: Cafe Latte\nCategory: Drinks - Coffee Based\nVariants: Hot ₱110.00 (stock 20), Medium ₱120.00 (stock 20), Large ₱130.00 (stock 20)', '2026-08-15 10:42:12'),
(159, 6, 27, 'owner', 'product', 'Product Variants Added', 'Product: Spanish Latte\nCategory: Drinks - Coffee Based\nVariants: Hot ₱120.00 (stock 20), Medium ₱130.00 (stock 20), Large ₱140.00 (stock 20)', '2026-08-15 10:43:15'),
(160, 6, 27, 'owner', 'product', 'Product Variants Added', 'Product: Hazelnut Latte\nCategory: Drinks - Coffee Based\nVariants: Hot ₱125.00 (stock 20), Medium ₱135.00 (stock 20), Large ₱145.00 (stock 20)', '2026-08-15 10:44:16'),
(161, 6, 27, 'owner', 'product', 'Product Variants Added', 'Product: Roasted Almond\nCategory: Drinks - Coffee Based\nVariants: Hot ₱125.00 (stock 20), Medium ₱135.00 (stock 20), Large ₱145.00 (stock 20)', '2026-08-15 10:44:55'),
(162, 6, 27, 'owner', 'product', 'Product Variants Added', 'Product: White Choco Latte\nCategory: Drinks - Coffee Based\nVariants: Hot ₱130.00 (stock 20), Medium ₱140.00 (stock 20), Large ₱150.00 (stock 20)', '2026-08-15 10:45:48'),
(163, 6, 27, 'owner', 'product', 'Product Variants Added', 'Product: Salted Caramel\nCategory: Drinks - Coffee Based\nVariants: Hot ₱130.00 (stock 20), Medium ₱140.00 (stock 20), Large ₱150.00 (stock 20)', '2026-08-15 10:46:37'),
(164, 6, 27, 'owner', 'product', 'Product Variants Added', 'Product: Mocha Latte\nCategory: Drinks - Coffee Based\nVariants: Hot ₱130.00 (stock 20), Medium ₱140.00 (stock 20), Large ₱150.00 (stock 20)', '2026-08-15 10:47:23'),
(165, 6, 27, 'owner', 'product', 'Product Variants Added', 'Product: Caramel Machiatto\nCategory: Drinks - Coffee Based\nVariants: Hot ₱135.00 (stock 20), Medium ₱145.00 (stock 20), Large ₱155.00 (stock 20)', '2026-08-15 10:48:09'),
(166, 6, 27, 'owner', 'product', 'Product Variants Added', 'Product: Biscof Latte\nCategory: Drinks - Coffee Based\nVariants: Hot ₱140.00 (stock 20), Medium ₱150.00 (stock 20), Large ₱160.00 (stock 20)', '2026-08-15 11:17:47'),
(167, 6, 27, 'owner', 'product', 'Product Variants Added', 'Product: Strawberry Milk\nCategory: Drinks - Non Coffee\nVariants: Medium - Iced ₱105.00 (stock 20), Large - Iced ₱115.00 (stock 20)', '2026-08-15 11:19:26'),
(168, 6, 27, 'owner', 'product', 'Product Variants Added', 'Product: Blueberry Milk\nCategory: Drinks - Non Coffee\nVariants: Medium - Iced ₱105.00 (stock 20), Large - Iced ₱115.00 (stock 20)', '2026-08-15 11:20:18'),
(169, 6, 27, 'owner', 'product', 'Product Variants Added', 'Product: Chocolate\nCategory: Drinks - Non Coffee\nVariants: Hot ₱115.00 (stock 20), Medium - Iced ₱125.00 (stock 20), Large - Iced ₱135.00 (stock 20)', '2026-08-15 11:21:17'),
(170, 6, 27, 'owner', 'product', 'Product Variants Added', 'Product: Creamy Biscoff\nCategory: Drinks - Non Coffee\nVariants: Hot ₱120.00 (stock 20), Medium - Iced ₱130.00 (stock 20), Large - Iced ₱140.00 (stock 20)', '2026-08-15 11:22:15'),
(171, 6, 27, 'owner', 'product', 'Product Added', 'Product: Espresso\nCategory: Add Ons\nPrice: ₱35.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-15 11:22:45'),
(173, 6, 27, 'owner', 'product', 'Product Added', 'Product: Matcha\nCategory: Add Ons\nPrice: ₱60.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-15 12:44:52'),
(174, 6, 27, 'owner', 'product', 'Product Deleted', 'Matcha was removed from the menu.', '2026-08-15 12:47:15'),
(175, 6, 27, 'owner', 'product', 'Product Deleted', 'Espresso was removed from the menu.', '2026-08-15 12:47:24'),
(176, 6, 27, 'owner', 'product', 'Product Variants Added', 'Product: Matcha Latte\nCategory: Drinks - Matcha Series\nVariants: Hot ₱125.00 (stock 20), Medium ₱135.00 (stock 20), Large ₱145.00 (stock 20)', '2026-08-15 12:48:44'),
(177, 6, 27, 'owner', 'product', 'Product Variants Added', 'Product: Strawberry Matcha\nCategory: Drinks - Matcha Series\nVariants: Medium ₱140.00 (stock 20), Large ₱150.00 (stock 20)', '2026-08-15 15:02:38'),
(178, 6, 27, 'owner', 'product', 'Product Variants Added', 'Product: Blueberry Matcha\nCategory: Drinks - Matcha Series\nVariants: Medium ₱140.00 (stock 20), Large ₱150.00 (stock 20)', '2026-08-15 15:03:30'),
(179, 6, 27, 'owner', 'product', 'Product Variants Added', 'Product: Biscoff Matcha\nCategory: Drinks - Matcha Series\nVariants: Hot ₱140.00 (stock 20), Medium ₱150.00 (stock 20), Large ₱160.00 (stock 20)', '2026-08-15 15:04:48'),
(180, 6, 27, 'owner', 'product', 'Product Variants Added', 'Product: White Choco Matcha\nCategory: Drinks - Matcha Series\nVariants: Hot ₱140.00 (stock 20), Medium ₱150.00 (stock 20), Large ₱160.00 (stock 20)', '2026-08-15 15:06:35'),
(181, 6, 27, 'owner', 'product', 'Product Variants Added', 'Product: Dirty Matcha Latte\nCategory: Drinks - Matcha Series\nVariants: Hot ₱145.00 (stock 20), Medium ₱155.00 (stock 20), Large ₱165.00 (stock 20)', '2026-08-15 15:07:42'),
(182, 6, 27, 'owner', 'product', 'Product Variants Added', 'Product: Hazelnut Latte\nCategory: Drinks - Frappe (Coffee Based)\nVariants: Medium ₱145.00 (stock 20), Large ₱155.00 (stock 20)', '2026-08-15 15:08:46'),
(183, 6, 27, 'owner', 'product', 'Product Variants Added', 'Product: Roasted Almond\nCategory: Drinks - Frappe (Coffee Based)\nVariants: Medium ₱145.00 (stock 20), Large ₱155.00 (stock 20)', '2026-08-15 15:09:57'),
(184, 6, 27, 'owner', 'product', 'Product Variants Added', 'Product: Caramel Latte\nCategory: Drinks - Frappe (Coffee Based)\nVariants: Medium ₱145.00 (stock 20), Large ₱155.00 (stock 20)', '2026-08-15 15:11:07'),
(185, 6, 27, 'owner', 'product', 'Product Variants Added', 'Product: White Choco Latte\nCategory: Drinks - Frappe (Coffee Based)\nVariants: Medium ₱145.00 (stock 20), Large ₱155.00 (stock 20)', '2026-08-15 15:12:08'),
(186, 6, 27, 'owner', 'product', 'Product Variants Added', 'Product: Salted Caramel\nCategory: Drinks - Frappe (Coffee Based)\nVariants: Medium ₱145.00 (stock 20), Large ₱155.00 (stock 20)', '2026-08-15 15:12:47'),
(187, 6, 27, 'owner', 'product', 'Product Variants Added', 'Product: Mocha Latte\nCategory: Drinks - Frappe (Coffee Based)\nVariants: Medium ₱145.00 (stock 20), Large ₱155.00 (stock 20)', '2026-08-15 15:13:45'),
(188, 6, 27, 'owner', 'product', 'Product Variants Added', 'Product: Biscoff Latte\nCategory: Drinks - Frappe (Coffee Based)\nVariants: Medium ₱155.00 (stock 20), Large ₱165.00 (stock 20)', '2026-08-15 15:14:37'),
(189, 6, 27, 'owner', 'product', 'Product Variants Added', 'Product: Cookies n\' Cream\nCategory: Drinks - Frappe (Non-Coffee Based)\nVariants: Medium ₱145.00 (stock 20), Large ₱155.00 (stock 20)', '2026-08-15 15:15:25'),
(190, 6, 27, 'owner', 'product', 'Product Variants Added', 'Product: Strawberry\nCategory: Drinks - Frappe (Non-Coffee Based)\nVariants: Medium ₱145.00 (stock 20), Large ₱155.00 (stock 20)', '2026-08-15 15:16:14'),
(191, 6, 27, 'owner', 'product', 'Product Variants Added', 'Product: Blueberry\nCategory: Drinks - Frappe (Non-Coffee Based)\nVariants: Medium ₱145.00 (stock 20), Large ₱155.00 (stock 20)', '2026-08-15 15:19:03'),
(192, 6, 27, 'owner', 'product', 'Product Variants Added', 'Product: Matcha\nCategory: Drinks - Frappe (Non-Coffee Based)\nVariants: Medium ₱150.00 (stock 20), Large ₱160.00 (stock 20)', '2026-08-15 15:20:01'),
(193, 6, 27, 'owner', 'product', 'Product Variants Added', 'Product: Stawberry/Blueberry\nCategory: Drinks - Frappe (Non-Coffee Based)\nVariants: Medium ₱155.00 (stock 20), Large ₱165.00 (stock 20)', '2026-08-15 15:20:49'),
(194, 6, 27, 'owner', 'product', 'Product Variants Added', 'Product: Biscoff Matcha\nCategory: Drinks - Frappe (Non-Coffee Based)\nVariants: Medium ₱160.00 (stock 20), Large ₱170.00 (stock 20)', '2026-08-15 15:22:08'),
(195, 6, 27, 'owner', 'product', 'Product Variants Added', 'Product: Black Tea\nCategory: Drinks - Tea Based\nVariants: Hot ₱70.00 (stock 20), Medium - Iced ₱80.00 (stock 20), Large - Iced ₱90.00 (stock 20)', '2026-08-15 15:37:27'),
(196, 6, 27, 'owner', 'product', 'Product Variants Added', 'Product: Thai Tea\nCategory: Drinks - Tea Based\nVariants: Medium ₱120.00 (stock 20), Large ₱130.00 (stock 20)', '2026-08-15 15:38:31'),
(197, 6, 27, 'owner', 'product', 'Product Variants Added', 'Product: Lychee\nCategory: Drinks - Fruit Tea\nVariants: Medium ₱79.00 (stock 20), Large ₱89.00 (stock 20)', '2026-08-15 15:39:18'),
(198, 6, 27, 'owner', 'product', 'Product Variants Added', 'Product: Kiwi\nCategory: Drinks - Fruit Tea\nVariants: Medium ₱79.00 (stock 20), Large ₱89.00 (stock 20)', '2026-08-15 15:45:04'),
(199, 6, 27, 'owner', 'product', 'Product Variants Added', 'Product: Strawberry\nCategory: Drinks - Fruit Tea\nVariants: Medium ₱79.00 (stock 20), Large ₱89.00 (stock 20)', '2026-08-15 15:46:03'),
(200, 6, 27, 'owner', 'product', 'Product Variants Added', 'Product: Green Apple\nCategory: Drinks - Fruit Tea\nVariants: Medium ₱79.00 (stock 20), Large ₱89.00 (stock 20)', '2026-08-15 15:49:53'),
(201, 6, 27, 'owner', 'product', 'Product Variants Added', 'Product: Passion Fruit\nCategory: Drinks - Fruit Tea\nVariants: Medium ₱79.00 (stock 20), Large ₱89.00 (stock 20)', '2026-08-15 15:54:13'),
(202, 6, 27, 'owner', 'product', 'Product Variants Added', 'Product: Blueberry\nCategory: Drinks - Fruit Tea\nVariants: Medium ₱79.00 (stock 20), Large ₱89.00 (stock 20)', '2026-08-15 15:55:28'),
(203, 6, 27, 'owner', 'product', 'Product Variants Added', 'Product: Green Apple Soda\nCategory: Drinks - Soda\nVariants: Medium ₱79.00 (stock 20), Large ₱89.00 (stock 20)', '2026-08-15 15:56:31'),
(204, 6, 27, 'owner', 'product', 'Product Variants Added', 'Product: Lychee Soda\nCategory: Drinks - Soda\nVariants: Medium ₱79.00 (stock 20), Large ₱89.00 (stock 20)', '2026-08-15 15:58:41'),
(205, 6, 27, 'owner', 'product', 'Product Variants Added', 'Product: Kiwi Soda\nCategory: Drinks - Soda\nVariants: Medium ₱79.00 (stock 20), Large ₱89.00 (stock 20)', '2026-08-15 15:59:26'),
(206, 6, 27, 'owner', 'product', 'Product Variants Added', 'Product: Passion Fruit Soda\nCategory: Drinks - Soda\nVariants: Medium ₱79.00 (stock 20), Large ₱89.00 (stock 20)', '2026-08-15 16:01:12'),
(207, 6, 27, 'owner', 'product', 'Product Variants Added', 'Product: Blueberry Lemon Soda\nCategory: Drinks - Soda\nVariants: Medium ₱89.00 (stock 20), Large ₱99.00 (stock 20)', '2026-08-15 16:02:13'),
(208, 6, 27, 'owner', 'product', 'Product Variants Added', 'Product: Strawberry Lemon Soda\nCategory: Drinks - Soda\nVariants: Medium ₱89.00 (stock 20), Large ₱99.00 (stock 20)', '2026-08-15 16:03:02'),
(209, 6, 27, 'owner', 'product', 'Product Variants Added', 'Product: Lychee Yogurt\nCategory: Drinks - Yogurt Series\nVariants: Medium ₱90.00 (stock 20), Large ₱100.00 (stock 20)', '2026-08-15 16:04:05'),
(210, 6, 27, 'owner', 'product', 'Product Variants Added', 'Product: Green Apple Yogurt\nCategory: Drinks - Yogurt Series\nVariants: Medium ₱90.00 (stock 20), Large ₱100.00 (stock 20)', '2026-08-15 16:04:50'),
(211, 6, 27, 'owner', 'product', 'Product Variants Added', 'Product: Blueberry Yogurt\nCategory: Drinks - Yogurt Series\nVariants: Medium ₱90.00 (stock 20), Large ₱100.00 (stock 20)', '2026-08-15 16:05:45'),
(212, 6, 27, 'owner', 'product', 'Product Variants Added', 'Product: Strawberry Yogurt\nCategory: Drinks - Yogurt Series\nVariants: Medium ₱90.00 (stock 20), Large ₱100.00 (stock 20)', '2026-08-15 16:06:27'),
(213, 6, 27, 'owner', 'product', 'Product Deleted', 'Matcha was removed from the menu.', '2026-08-16 05:41:36'),
(218, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Teriyaki\nChanges:\nProduct image added.', '2026-08-16 06:46:05'),
(219, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Teriyaki\nChanges:\nProduct image added.', '2026-08-16 06:46:42'),
(220, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Teriyaki\nChanges:\nProduct image added.', '2026-08-16 06:47:09'),
(221, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Spamsilog\nChanges:\nProduct image added.', '2026-08-16 06:48:49'),
(222, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Cornsilog\nChanges:\nProduct image added.', '2026-08-16 06:49:08'),
(223, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Tosilog\nChanges:\nProduct image added.', '2026-08-16 06:49:24'),
(224, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Tapsilog\nChanges:\nProduct image added.', '2026-08-16 06:51:21'),
(225, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Mushroom Alfredo\nChanges:\nProduct image added.', '2026-08-16 06:53:01'),
(226, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Creamy Pesto Tuna\nChanges:\nProduct image added.', '2026-08-16 06:53:21'),
(227, 6, 27, 'owner', 'product', 'Product Updated', 'Product: French Fries\nChanges:\nProduct image added.', '2026-08-16 06:54:16'),
(228, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Overload Fries\nChanges:\nProduct image added.', '2026-08-16 06:54:56'),
(229, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Overload Nachos\nChanges:\nProduct image added.', '2026-08-16 06:55:12'),
(230, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Classic Burger\nChanges:\nProduct image added.', '2026-08-16 06:56:10'),
(231, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Double Cheese Burger\nChanges:\nProduct image added.', '2026-08-16 06:56:29'),
(232, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Meaty Burger\nChanges:\nProduct image added.', '2026-08-16 06:56:46'),
(233, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Drop Supreme Burger\nChanges:\nProduct image added.', '2026-08-16 06:57:06'),
(234, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Tuna Sandwich\nChanges:\nProduct image added.', '2026-08-16 06:57:34'),
(235, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Clubhouse Sandwich\nChanges:\nProduct image added.', '2026-08-16 06:57:55'),
(236, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Siomai Rice\nChanges:\nProduct image added.', '2026-08-16 06:58:35'),
(237, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Shanghai Rice\nChanges:\nProduct image added.', '2026-08-16 07:06:02'),
(238, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Adobo Flakes\nChanges:\nProduct image added.', '2026-08-16 07:06:17'),
(239, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Chicken Poppers\nChanges:\nProduct image added.', '2026-08-16 07:07:27'),
(240, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Combo Cravings\nChanges:\nProduct image added.', '2026-08-16 07:07:48'),
(241, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Savory Duo\nChanges:\nProduct image added.', '2026-08-16 07:08:06'),
(243, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Pinapaitan\nChanges:\nProduct image added.', '2026-08-16 07:10:50'),
(244, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Pork Igado\nChanges:\nProduct image added.', '2026-08-16 07:11:06'),
(245, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Tofu Sisig\nChanges:\nProduct image added.', '2026-08-16 07:11:20'),
(246, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Bulalo\nChanges:\nProduct image added.', '2026-08-16 07:11:35'),
(247, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Pork Sisig\nChanges:\nProduct image added.', '2026-08-16 07:11:50'),
(248, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Pour-Over\nChanges:\nProduct image added.', '2026-08-16 07:25:29'),
(249, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Americano\nChanges:\nProduct image added.', '2026-08-16 07:26:17'),
(250, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Pour-Over\nChanges:\nProduct image added.', '2026-08-16 07:28:37'),
(251, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Pour-Over\nChanges:\nProduct image added.', '2026-08-16 07:29:05'),
(252, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Americano\nChanges:\nProduct image added.', '2026-08-16 07:29:28'),
(253, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Americano\nChanges:\nProduct image added.', '2026-08-16 07:30:12'),
(254, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Cafe Latte\nChanges:\nProduct image added.', '2026-08-16 07:30:49'),
(255, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Cafe Latte\nChanges:\nProduct image added.', '2026-08-16 07:31:05'),
(256, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Cafe Latte\nChanges:\nProduct image added.', '2026-08-16 07:31:20'),
(257, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Spanish Latte\nChanges:\nProduct image added.', '2026-08-16 07:31:41'),
(258, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Spanish Latte\nChanges:\nProduct image added.', '2026-08-16 07:31:58'),
(259, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Spanish Latte\nChanges:\nProduct image added.', '2026-08-16 07:32:29'),
(260, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Hazelnut Latte\nChanges:\nProduct image added.', '2026-08-16 07:33:11'),
(261, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Hazelnut Latte\nChanges:\nProduct image added.', '2026-08-16 07:33:30'),
(262, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Hazelnut Latte\nChanges:\nProduct image added.', '2026-08-16 07:33:54'),
(263, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Roasted Almond\nChanges:\nProduct image added.', '2026-08-16 07:34:16'),
(264, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Roasted Almond\nChanges:\nProduct image added.', '2026-08-16 07:34:37'),
(265, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Roasted Almond\nChanges:\nProduct image added.', '2026-08-16 07:34:58'),
(266, 6, 27, 'owner', 'product', 'Product Updated', 'Product: White Choco Latte\nChanges:\nProduct image added.', '2026-08-16 07:35:18'),
(267, 6, 27, 'owner', 'product', 'Product Updated', 'Product: White Choco Latte\nChanges:\nProduct image added.', '2026-08-16 07:35:41'),
(268, 6, 27, 'owner', 'product', 'Product Updated', 'Product: White Choco Latte\nChanges:\nProduct image added.', '2026-08-16 07:36:01'),
(269, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Salted Caramel\nChanges:\nProduct image added.', '2026-08-16 07:36:58'),
(270, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Salted Caramel\nChanges:\nProduct image added.', '2026-08-16 07:37:17'),
(271, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Salted Caramel\nChanges:\nProduct image added.', '2026-08-16 07:37:41'),
(272, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Mocha Latte\nChanges:\nProduct image added.', '2026-08-16 07:38:06'),
(273, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Mocha Latte\nChanges:\nProduct image added.', '2026-08-16 07:38:25'),
(274, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Mocha Latte\nChanges:\nProduct image added.', '2026-08-16 07:38:40'),
(275, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Caramel Machiatto\nChanges:\nProduct image added.', '2026-08-16 07:39:01'),
(276, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Caramel Machiatto\nChanges:\nProduct image added.', '2026-08-16 07:39:22'),
(277, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Caramel Machiatto\nChanges:\nProduct image added.', '2026-08-16 07:39:45'),
(278, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Biscof Latte\nChanges:\nProduct image added.', '2026-08-16 07:40:03'),
(279, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Biscof Latte\nChanges:\nProduct image added.', '2026-08-16 07:40:19'),
(280, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Biscof Latte\nChanges:\nProduct image added.', '2026-08-16 07:40:37'),
(281, 6, 27, 'owner', 'product', 'Product Updated', 'Product: French Fries\nChanges:\nProduct image added.', '2026-08-16 07:41:02'),
(282, 6, 27, 'owner', 'product', 'Product Updated', 'Product: French Fries\nChanges:\nProduct image added.', '2026-08-16 07:41:20'),
(283, 6, 27, 'owner', 'product', 'Product Updated', 'Product: French Fries\nChanges:\nProduct image added.', '2026-08-16 07:41:39'),
(284, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Filipino Spaghetti\nChanges:\nProduct image added.', '2026-08-16 07:42:05'),
(285, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Sweet and Spicy\nChanges:\nProduct image added.', '2026-08-16 07:43:26'),
(286, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Sweet and Spicy\nChanges:\nProduct image added.', '2026-08-16 07:43:48'),
(287, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Sweet and Spicy\nChanges:\nProduct image added.', '2026-08-16 07:44:09'),
(288, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Honey BBQ\nChanges:\nProduct image added.', '2026-08-16 07:45:28'),
(289, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Honey BBQ\nChanges:\nProduct image added.', '2026-08-16 07:45:50'),
(290, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Matcha Latte\nChanges:\nProduct image added.', '2026-08-16 07:46:57'),
(291, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Matcha Latte\nChanges:\nProduct image added.', '2026-08-16 07:47:53'),
(292, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Matcha Latte\nChanges:\nProduct image added.', '2026-08-16 07:48:39'),
(293, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Strawberry Matcha\nChanges:\nProduct image added.', '2026-08-16 07:49:13'),
(294, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Strawberry Matcha\nChanges:\nProduct image added.', '2026-08-16 07:49:44'),
(295, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Blueberry Matcha\nChanges:\nProduct image added.', '2026-08-16 07:50:12'),
(296, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Blueberry Matcha\nChanges:\nProduct image added.', '2026-08-16 07:50:40'),
(297, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Biscoff Matcha\nChanges:\nProduct image added.', '2026-08-16 07:51:17'),
(298, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Biscoff Matcha\nChanges:\nProduct image added.', '2026-08-16 07:51:40'),
(299, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Biscoff Matcha\nChanges:\nProduct image added.', '2026-08-16 07:52:13'),
(300, 6, 27, 'owner', 'product', 'Product Updated', 'Product: White Choco Matcha\nChanges:\nProduct image added.', '2026-08-16 07:52:48'),
(301, 6, 27, 'owner', 'product', 'Product Updated', 'Product: White Choco Matcha\nChanges:\nProduct image added.', '2026-08-16 07:53:16'),
(302, 6, 27, 'owner', 'product', 'Product Updated', 'Product: White Choco Matcha\nChanges:\nProduct image added.', '2026-08-16 07:53:40'),
(303, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Dirty Matcha Latte\nChanges:\nProduct image added.', '2026-08-16 07:54:04'),
(304, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Dirty Matcha Latte\nChanges:\nProduct image added.', '2026-08-16 07:54:25'),
(305, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Dirty Matcha Latte\nChanges:\nProduct image added.', '2026-08-16 07:56:12'),
(306, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Strawberry Milk\nChanges:\nProduct image added.', '2026-08-16 07:57:07'),
(307, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Strawberry Milk\nChanges:\nProduct image added.', '2026-08-16 07:57:22'),
(308, 6, 27, 'owner', 'product', 'Product Added', 'Product: Plain Rice\nCategory: Add Ons\nPrice: ₱20.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-16 08:00:33'),
(309, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Blueberry Milk\nChanges:\nProduct image added.', '2026-08-16 08:01:31'),
(310, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Blueberry Milk\nChanges:\nProduct image added.', '2026-08-16 08:01:45'),
(311, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Chocolate\nChanges:\nProduct image added.', '2026-08-16 08:02:08'),
(312, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Chocolate\nChanges:\nProduct image added.', '2026-08-16 08:02:33'),
(313, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Chocolate\nChanges:\nProduct image added.', '2026-08-16 08:02:52'),
(314, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Creamy Biscoff\nChanges:\nProduct image added.', '2026-08-16 08:03:23'),
(315, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Creamy Biscoff\nChanges:\nProduct image added.', '2026-08-16 08:03:47'),
(316, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Creamy Biscoff\nChanges:\nProduct image added.', '2026-08-16 08:04:08'),
(317, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Garlic Parmesan\nChanges:\nProduct image added.', '2026-08-16 08:04:59'),
(318, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Garlic Parmesan\nChanges:\nProduct image added.', '2026-08-16 08:05:16'),
(319, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Garlic Parmesan\nChanges:\nProduct image added.', '2026-08-16 08:06:07'),
(320, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Buffalo\nChanges:\nProduct image added.', '2026-08-16 08:06:27'),
(321, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Buffalo\nChanges:\nProduct image added.', '2026-08-16 08:06:48'),
(322, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Buffalo\nChanges:\nProduct image added.', '2026-08-16 08:07:04'),
(323, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Honey BBQ\nChanges:\nProduct image added.', '2026-08-16 08:07:24'),
(338, 6, 27, 'owner', 'product', 'Product Added', 'Product: Fried Rice\nCategory: Add Ons\nPrice: ₱25.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-16 16:23:12'),
(339, 6, 27, 'owner', 'product', 'Product Added', 'Product: Egg\nCategory: Add Ons\nPrice: ₱15.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-16 16:23:46'),
(340, 6, 27, 'owner', 'product', 'Product Added', 'Product: Garlic Sauce\nCategory: Add Ons\nPrice: ₱10.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-16 16:24:12'),
(341, 6, 27, 'owner', 'product', 'Product Added', 'Product: Sliced Cheese\nCategory: Add Ons\nPrice: ₱15.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-16 16:24:39'),
(342, 6, 27, 'owner', 'system', 'Settings Updated', 'Restaurant settings were updated.', '2026-08-16 16:25:12'),
(343, 6, 27, 'owner', 'product', 'Product Added', 'Product: Espresso\nCategory: Add Ons\nPrice: ₱35.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-16 16:27:10'),
(344, 6, 27, 'owner', 'product', 'Product Added', 'Product: Matcha\nCategory: Add Ons\nPrice: ₱60.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-16 16:27:41'),
(345, 6, 27, 'owner', 'product', 'Product Added', 'Product: Oatmilk\nCategory: Add Ons\nPrice: ₱35.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-16 16:28:06'),
(346, 6, 27, 'owner', 'product', 'Product Added', 'Product: Syrup\nCategory: Add Ons\nPrice: ₱35.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-16 16:28:29'),
(347, 6, 27, 'owner', 'product', 'Product Added', 'Product: Condensed\nCategory: Add Ons\nPrice: ₱15.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-16 16:28:55'),
(348, 6, 27, 'owner', 'product', 'Product Added', 'Product: Jelly\nCategory: Add Ons\nPrice: ₱10.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-16 16:29:24'),
(349, 6, 27, 'owner', 'product', 'Product Added', 'Product: Chia Seeds\nCategory: Add Ons\nPrice: ₱10.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-16 16:29:50'),
(350, 6, 27, 'owner', 'product', 'Product Added', 'Product: Whip Cream\nCategory: Add Ons\nPrice: ₱20.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-16 16:30:16'),
(351, 6, 27, 'owner', 'product', 'Product Added', 'Product: Boba Pearl\nCategory: Add Ons\nPrice: ₱15.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-16 16:30:57'),
(352, 6, 27, 'owner', 'product', 'Product Added', 'Product: Crush Oreo\nCategory: Add Ons\nPrice: ₱20.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-16 16:31:19'),
(353, 7, 29, 'owner', 'product', 'Product Added', 'Product: Pinapaitan\nCategory: Kambing\nPrice: ₱180.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-16 16:55:44'),
(354, 7, 29, 'owner', 'product', 'Product Added', 'Product: Sinampalukan\nCategory: Kambing\nPrice: ₱180.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-16 16:56:35'),
(355, 7, 29, 'owner', 'product', 'Product Added', 'Product: Kilawen\nCategory: Kambing\nPrice: ₱180.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-16 16:56:58'),
(356, 7, 29, 'owner', 'product', 'Product Added', 'Product: Kalderita\nCategory: Kambing\nPrice: ₱180.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-16 16:57:28'),
(357, 7, 29, 'owner', 'product', 'Product Added', 'Product: Kinigtot\nCategory: Kambing\nPrice: ₱180.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-16 16:58:20'),
(358, 6, 27, 'owner', 'restaurant_application', 'Go-Live Application Submitted', 'The owner submitted \"Drop By Cafe\" for administrator review.', '2026-08-16 16:59:00'),
(359, 6, 27, 'owner', 'product', 'Product Deleted', 'Crush Oreo was removed from the menu.', '2026-08-16 16:59:29'),
(360, 6, 27, 'owner', 'product', 'Product Deleted', 'Boba Pearl was removed from the menu.', '2026-08-16 16:59:43'),
(361, 6, 27, 'owner', 'product', 'Product Deleted', 'Whip Cream was removed from the menu.', '2026-08-16 16:59:51'),
(362, 6, 27, 'owner', 'product', 'Product Deleted', 'Chia Seeds was removed from the menu.', '2026-08-16 17:00:05'),
(363, 6, 27, 'owner', 'product', 'Product Deleted', 'Jelly was removed from the menu.', '2026-08-16 17:00:13'),
(364, 6, 27, 'owner', 'product', 'Product Deleted', 'Condensed was removed from the menu.', '2026-08-16 17:00:28'),
(365, 6, 27, 'owner', 'product', 'Product Deleted', 'Syrup was removed from the menu.', '2026-08-16 17:00:36'),
(366, 6, 27, 'owner', 'product', 'Product Deleted', 'Oatmilk was removed from the menu.', '2026-08-16 17:00:50'),
(367, 6, 27, 'owner', 'product', 'Product Deleted', 'Matcha was removed from the menu.', '2026-08-16 17:01:01'),
(368, 6, 27, 'owner', 'product', 'Product Deleted', 'Garlic Sauce was removed from the menu.', '2026-08-16 17:01:20'),
(369, 6, 27, 'owner', 'product', 'Product Deleted', 'Egg was removed from the menu.', '2026-08-16 17:01:37'),
(370, 6, 27, 'owner', 'product', 'Product Deleted', 'Fried Rice was removed from the menu.', '2026-08-16 17:01:47'),
(371, 6, 27, 'owner', 'product', 'Product Deleted', 'Espresso was removed from the menu.', '2026-08-16 17:02:06'),
(372, 6, 27, 'owner', 'product', 'Product Deleted', 'Sliced Cheese was removed from the menu.', '2026-08-16 17:02:27'),
(373, 6, 27, 'owner', 'product', 'Product Deleted', 'Plain Rice was removed from the menu.', '2026-08-16 17:03:05'),
(374, 7, 29, 'owner', 'product', 'Product Added', 'Product: Adobo\nCategory: Kambing\nPrice: ₱180.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-16 17:51:07'),
(375, 7, 29, 'owner', 'product', 'Product Added', 'Product: Bulalo\nCategory: Beef\nPrice: ₱195.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-16 17:51:44'),
(376, 7, 29, 'owner', 'product', 'Product Added', 'Product: Kinigtot\nCategory: Beef\nPrice: ₱175.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-16 17:52:08'),
(377, 7, 29, 'owner', 'product', 'Product Added', 'Product: Pigar-Pigar\nCategory: Beef\nPrice: ₱175.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-16 17:52:34'),
(378, 7, 29, 'owner', 'product', 'Product Added', 'Product: Pinapaitan\nCategory: Beef\nPrice: ₱170.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-16 17:52:56'),
(379, 7, 29, 'owner', 'product', 'Product Added', 'Product: Kare-Kare\nCategory: Beef\nPrice: ₱195.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-16 17:54:48'),
(380, 7, 29, 'owner', 'product', 'Product Added', 'Product: Kaleskes\nCategory: Beef\nPrice: ₱170.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-16 17:55:16'),
(381, 7, 29, 'owner', 'product', 'Product Added', 'Product: Pares with Rice\nCategory: Beef\nPrice: ₱130.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-16 17:55:36'),
(382, 7, 29, 'owner', 'product', 'Product Added', 'Product: Beef Steak\nCategory: Beef\nPrice: ₱180.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-16 17:56:05'),
(383, 7, 29, 'owner', 'product', 'Product Added', 'Product: Beef Broccoli\nCategory: Beef\nPrice: ₱190.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-16 18:01:07'),
(384, 7, 29, 'owner', 'product', 'Product Added', 'Product: Lengua\nCategory: Beef\nPrice: ₱190.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-16 18:01:57'),
(385, 7, 29, 'owner', 'product', 'Product Added', 'Product: Beef Caldereta\nCategory: Beef\nPrice: ₱210.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-16 18:03:17'),
(386, 7, 29, 'owner', 'product', 'Product Added', 'Product: Sinigang\nCategory: Pork\nPrice: ₱220.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-16 18:04:07'),
(387, 7, 29, 'owner', 'product', 'Product Added', 'Product: Adobo\nCategory: Pork\nPrice: ₱195.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-16 18:04:41'),
(388, 7, 29, 'owner', 'product', 'Product Added', 'Product: Sisig\nCategory: Pork\nPrice: ₱190.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-16 18:05:09'),
(389, 7, 29, 'owner', 'product', 'Product Added', 'Product: Kilawen\nCategory: Pork\nPrice: ₱180.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-16 18:05:30'),
(390, 7, 29, 'owner', 'product', 'Product Added', 'Product: Sizzling Porkchop w/ Rice\nCategory: Pork\nPrice: ₱130.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-16 18:06:15'),
(391, 7, 29, 'owner', 'product', 'Product Added', 'Product: Pork Sisig with Rice\nCategory: Pork\nPrice: ₱130.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-16 18:06:39'),
(392, 7, 29, 'owner', 'product', 'Product Updated', 'Product: Sizzling Porkchop with Rice\nChanges:\nName: \"Sizzling Porkchop w/ Rice\" → \"Sizzling Porkchop with Rice\"', '2026-08-16 18:07:02'),
(393, 7, 29, 'owner', 'product', 'Product Added', 'Product: Chicharon Bulaklak\nCategory: Pork\nPrice: ₱180.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-16 18:07:47'),
(394, 7, 29, 'owner', 'product', 'Product Added', 'Product: Lechon Kawali\nCategory: Pork\nPrice: ₱210.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-16 18:08:14'),
(395, 7, 29, 'owner', 'product', 'Product Added', 'Product: Crispy Ulo\nCategory: Pork\nPrice: ₱840.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-16 18:08:46'),
(396, 7, 29, 'owner', 'product', 'Product Added', 'Product: Chicken Inasal\nCategory: Grilled\nVariant: Paa\nPrice: ₱155.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-16 18:09:21'),
(397, 7, 29, 'owner', 'product', 'Product Added', 'Product: Leimpo\nCategory: Grilled\nPrice: ₱210.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-16 18:09:58'),
(398, 7, 29, 'owner', 'product', 'Product Added', 'Product: Isaw ng Baboy\nCategory: Grilled\nPrice: ₱30.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-16 18:10:29'),
(399, 7, 29, 'owner', 'product', 'Product Added', 'Product: Isaw ng Manok\nCategory: Grilled\nPrice: ₱20.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-16 18:10:56'),
(400, 7, 29, 'owner', 'product', 'Product Added', 'Product: Tainga\nCategory: Grilled\nPrice: ₱30.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-16 18:11:41'),
(401, 7, 29, 'owner', 'product', 'Product Added', 'Product: Laman\nCategory: Grilled\nPrice: ₱30.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-16 18:12:07'),
(402, 7, 29, 'owner', 'product', 'Product Added', 'Product: Inihaw na Hito\nCategory: Grilled\nPrice: ₱220.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-16 18:12:29'),
(403, 7, 29, 'owner', 'product', 'Product Added', 'Product: Inihaw na Bangus\nCategory: Grilled\nPrice: ₱215.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-16 18:12:55'),
(404, 7, 29, 'owner', 'product', 'Product Added', 'Product: Fried Chicken\nCategory: Chicken\nPrice: ₱250.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-16 18:13:38'),
(405, 7, 29, 'owner', 'product', 'Product Added', 'Product: Spring Chicken Whole\nCategory: Chicken\nPrice: ₱400.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-16 18:14:12'),
(406, 7, 29, 'owner', 'product', 'Product Added', 'Product: Spring Chicken Half\nCategory: Chicken\nPrice: ₱250.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-16 18:14:43'),
(407, 7, 29, 'owner', 'product', 'Product Added', 'Product: Chicken Inasal + Unli Rice + Unli Sabaw + Softdrinks\nCategory: Chicken\nPrice: ₱230.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-16 18:15:50'),
(408, 7, 29, 'owner', 'product', 'Product Added', 'Product: Spring Chicken/ Rice\nCategory: Chicken\nPrice: ₱175.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-16 18:16:36'),
(409, 7, 29, 'owner', 'product', 'Product Added', 'Product: ChopSeuy\nCategory: Veggies\nPrice: ₱160.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-16 18:17:11'),
(410, 7, 29, 'owner', 'product', 'Product Added', 'Product: Pinakbet\nCategory: Veggies\nPrice: ₱160.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-16 18:17:38'),
(411, 7, 29, 'owner', 'product', 'Product Added', 'Product: Sinigang na Bangus Belly\nCategory: Seafood\nPrice: ₱220.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-16 18:19:43'),
(412, 7, 29, 'owner', 'product', 'Product Added', 'Product: Kilawen na Bangus\nCategory: Seafood\nPrice: ₱215.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-16 18:20:20'),
(413, 7, 29, 'owner', 'product', 'Product Added', 'Product: Fried Boneless Bangus\nCategory: Seafood\nPrice: ₱215.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-16 18:21:27'),
(414, 7, 29, 'owner', 'product', 'Product Added', 'Product: Calamares\nCategory: Seafood\nPrice: ₱220.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-16 18:21:56'),
(415, 7, 29, 'owner', 'product', 'Product Added', 'Product: Crispy Hito\nCategory: Seafood\nPrice: ₱220.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-16 18:22:42'),
(416, 7, 29, 'owner', 'product', 'Product Added', 'Product: Bihon\nCategory: Pansit\nPrice: ₱80.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-16 18:23:21'),
(417, 7, 29, 'owner', 'product', 'Product Added', 'Product: Canton\nCategory: Pansit\nPrice: ₱80.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-16 18:23:50'),
(418, 7, 29, 'owner', 'product', 'Product Variants Added', 'Product: Bilao\nCategory: Bilao Order\nVariants: Small (Good for 5) ₱350.00 (stock 20), Medium (Good for 10) ₱570.00 (stock 20), Large (Good for 15) ₱770.00 (stock 20)', '2026-08-16 18:26:09'),
(419, 7, 29, 'owner', 'product', 'Product Added', 'Product: Lecheflan\nCategory: Dessert\nPrice: ₱100.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-16 18:26:44'),
(420, 7, 29, 'owner', 'product', 'Product Added', 'Product: Halo-Halo\nCategory: Dessert\nPrice: ₱90.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-16 18:27:35'),
(421, 7, 29, 'owner', 'product', 'Product Added', 'Product: Fruitshake\nCategory: Dessert\nVariant: Mango\nPrice: ₱100.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-16 18:27:59'),
(422, 7, 29, 'owner', 'product', 'Product Added', 'Product: Sinampalokan or Pinapaitan\nCategory: Specialty\nVariant: Utak at mata ng Baka\nPrice: ₱195.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-16 18:30:09'),
(423, 7, 29, 'owner', 'product', 'Product Added', 'Product: Tapsilog\nCategory: Silog Meals\nPrice: ₱134.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-16 18:31:03'),
(424, 7, 29, 'owner', 'product', 'Product Added', 'Product: Special Lomi\nCategory: Short Orders\nPrice: ₱95.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-16 18:31:30'),
(425, 7, 29, 'owner', 'product', 'Product Added', 'Product: Beef Mami\nCategory: Short Orders\nPrice: ₱65.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-16 18:31:59'),
(426, 7, 29, 'owner', 'product', 'Product Added', 'Product: Beef Mami w/ Egg\nCategory: Short Orders\nPrice: ₱80.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-16 18:32:36'),
(427, 7, 29, 'owner', 'product', 'Product Added', 'Product: Pork Chao Fan\nCategory: Short Orders\nPrice: ₱89.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-16 18:33:09'),
(428, 7, 29, 'owner', 'product', 'Product Added', 'Product: Beef Chao Fan\nCategory: Short Orders\nPrice: ₱89.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-16 18:33:39'),
(429, 7, 29, 'owner', 'product', 'Product Added', 'Product: Yang Chow\nCategory: Short Orders\nPrice: ₱99.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-16 18:34:02'),
(430, 7, 29, 'owner', 'product', 'Product Added', 'Product: Pork Chao Fan\nCategory: Rice Platters\nPrice: ₱210.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-16 18:34:36'),
(431, 7, 29, 'owner', 'product', 'Product Added', 'Product: Beef Chao Fan\nCategory: Rice Platters\nPrice: ₱210.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-16 18:35:39'),
(432, 7, 29, 'owner', 'product', 'Product Added', 'Product: Yang Chow\nCategory: Rice Platters\nPrice: ₱210.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-16 18:36:16');
INSERT INTO `tbl_activity_logs` (`log_id`, `restaurant_id`, `user_id`, `user_role`, `action_type`, `action_title`, `action_description`, `created_at`) VALUES
(433, 7, 29, 'owner', 'product', 'Product Added', 'Product: Small\nCategory: Boodle Bilao\nVariant: 2-4 pax\nPrice: ₱1,500.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-16 18:37:36'),
(434, 7, 29, 'owner', 'product', 'Product Added', 'Product: Medium\nCategory: Boodle Bilao\nVariant: 5-8 pax\nPrice: ₱2,700.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-16 18:38:09'),
(435, 7, 29, 'owner', 'product', 'Product Added', 'Product: Large\nCategory: Boodle Bilao\nVariant: 9-12 pax\nPrice: ₱3,700.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-16 18:38:39'),
(436, 7, 29, 'owner', 'product', 'Product Added', 'Product: Red Horse\nCategory: Liquor\nVariant: 1000ml\nPrice: ₱190.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-16 18:39:23'),
(437, 7, 29, 'owner', 'product', 'Product Added', 'Product: Red Horse\nCategory: Liquor\nVariant: 500ml\nPrice: ₱90.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-16 18:40:07'),
(438, 7, 29, 'owner', 'product', 'Product Added', 'Product: San Mig Pale Pilsen\nCategory: Liquor\nPrice: ₱80.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-16 18:40:38'),
(439, 7, 29, 'owner', 'product', 'Product Added', 'Product: San Mig Apple\nCategory: Liquor\nPrice: ₱80.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-16 18:41:08'),
(440, 7, 29, 'owner', 'product', 'Product Added', 'Product: San Mig Light\nCategory: Liquor\nPrice: ₱80.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-16 18:42:55'),
(441, 7, 29, 'owner', 'product', 'Product Added', 'Product: Alfonso 1L + Sizzling Sisig\nCategory: Liquor\nPrice: ₱670.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-16 18:44:17'),
(442, 7, 29, 'owner', 'product', 'Product Added', 'Product: Alfonso 1L + Pinapaitan/Kinigto\nCategory: Liquor\nPrice: ₱670.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-16 18:44:54'),
(443, 7, 29, 'owner', 'product', 'Product Updated', 'Product: Alfonso 1L + Pinapaitan/Kinigtot\nChanges:\nName: \"Alfonso 1L + Pinapaitan/Kinigto\" → \"Alfonso 1L + Pinapaitan/Kinigtot\"', '2026-08-16 18:45:14'),
(444, 7, 29, 'owner', 'product', 'Product Added', 'Product: Alfonso 1L + Lechon Kawali\nCategory: Liquor\nPrice: ₱680.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-16 18:46:03'),
(445, 7, 29, 'owner', 'product', 'Product Added', 'Product: Alfonso 1L + Liempo\nCategory: Liquor\nPrice: ₱680.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-16 18:46:38'),
(446, 7, 29, 'owner', 'product', 'Product Added', 'Product: Coke\nCategory: Drinks\nVariant: 1.5L\nPrice: ₱95.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-16 18:47:16'),
(447, 7, 29, 'owner', 'product', 'Product Added', 'Product: Sprite\nCategory: Drinks\nVariant: 1.5L\nPrice: ₱95.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-16 18:47:57'),
(448, 7, 29, 'owner', 'product', 'Product Added', 'Product: Royal\nCategory: Drinks\nVariant: 1.5L\nPrice: ₱95.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-16 18:48:49'),
(449, 7, 29, 'owner', 'product', 'Product Added', 'Product: Bottled Water\nCategory: Drinks\nPrice: ₱25.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-16 18:49:19'),
(450, 7, 29, 'owner', 'product', 'Product Added', 'Product: 3 in 1 Coffee\nCategory: Drinks\nPrice: ₱30.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-16 18:49:48'),
(451, 7, 29, 'owner', 'product', 'Product Added', 'Product: Pure Lemonade\nCategory: Drinks\nVariant: 16oz\nPrice: ₱75.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-16 18:50:29'),
(452, 8, 30, 'owner', 'product', 'Product Variants Added', 'Product: Americano\nCategory: Iced Coffee\nVariants: Small ₱89.00 (stock 20), Medium ₱109.00 (stock 20), Large ₱119.00 (stock 20)', '2026-08-17 07:34:37'),
(453, 8, 30, 'owner', 'product', 'Product Variants Added', 'Product: Cafe Latte\nCategory: Iced Coffee\nVariants: Small ₱109.00 (stock 20), Medium ₱129.00 (stock 20), Large ₱139.00 (stock 20)', '2026-08-17 07:37:38'),
(454, 8, 30, 'owner', 'product', 'Product Variants Added', 'Product: Spanish Latte\nCategory: Iced Coffee\nVariants: Small ₱129.00 (stock 20), Medium ₱139.00 (stock 20), Large ₱149.00 (stock 20)', '2026-08-17 07:46:50'),
(455, 8, 30, 'owner', 'product', 'Product Variants Added', 'Product: Hazelnut Latte\nCategory: Iced Coffee\nVariants: Small ₱129.00 (stock 20), Medium ₱139.00 (stock 20), Large ₱149.00 (stock 20)', '2026-08-17 07:47:47'),
(456, 8, 30, 'owner', 'product', 'Product Variants Added', 'Product: Cinnamon Latte\nCategory: Iced Coffee\nVariants: Small ₱129.00 (stock 20), Medium ₱139.00 (stock 20), Large ₱149.00 (stock 20)', '2026-08-17 07:49:17'),
(457, 8, 30, 'owner', 'product', 'Product Variants Added', 'Product: Caramel Macchiato\nCategory: Iced Coffee\nVariants: Small ₱129.00 (stock 20), Medium ₱139.00 (stock 20), Large ₱149.00 (stock 20)', '2026-08-17 07:50:41'),
(458, 8, 30, 'owner', 'product', 'Product Variants Added', 'Product: Dirty Matcha Latte\nCategory: Iced Coffee\nVariants: Small ₱129.00 (stock 20), Medium ₱139.00 (stock 20), Large ₱149.00 (stock 20)', '2026-08-17 07:52:25'),
(459, 8, 30, 'owner', 'product', 'Product Variants Added', 'Product: Irish Cream Latte\nCategory: Iced Coffee\nVariants: Small ₱139.00 (stock 20), Medium ₱149.00 (stock 20), Large ₱159.00 (stock 20)', '2026-08-17 07:55:48'),
(460, 8, 30, 'owner', 'product', 'Product Variants Added', 'Product: Macadamia Latte\nCategory: Iced Coffee\nVariants: Small ₱139.00 (stock 20), Medium ₱149.00 (stock 20), Large ₱159.00 (stock 20)', '2026-08-17 07:57:35'),
(461, 8, 30, 'owner', 'product', 'Product Updated', 'Product: Macadamia Latte\nChanges:\nCategory: Iced Coffee → Espresso - Iced Coffee', '2026-08-17 08:03:50'),
(463, 8, 30, 'owner', 'product', 'Product Updated', 'Product: Irish Cream Latte\nChanges:\nCategory: Iced Coffee → Espresso - Iced Coffee', '2026-08-17 08:04:09'),
(464, 8, 30, 'owner', 'product', 'Product Updated', 'Product: Macadamia Latte\nChanges:\nCategory: Espresso - Iced Coffee → Iced Coffee', '2026-08-17 08:04:54'),
(465, 8, 30, 'owner', 'product', 'Product Updated', 'Product: Irish Cream Latte\nChanges:\nCategory: Espresso - Iced Coffee → Iced Coffee', '2026-08-17 08:05:12'),
(467, 8, 30, 'owner', 'product', 'Product Variants Added', 'Product: Seasalt Latte\nCategory: Iced Coffee\nVariants: Small ₱139.00 (stock 20), Medium ₱149.00 (stock 20), Large ₱159.00 (stock 20)', '2026-08-17 08:06:16'),
(468, 8, 30, 'owner', 'product', 'Product Variants Added', 'Product: Spanish Seasalt\nCategory: Iced Coffee\nVariants: Small ₱149.00 (stock 20), Medium ₱159.00 (stock 20), Large ₱169.00 (stock 20)', '2026-08-17 08:07:53'),
(472, 8, 30, 'owner', 'product', 'Product Added', 'Product: Single Shot Espresso\nCategory: Hot Coffee\nPrice: ₱49.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-17 08:10:42'),
(473, 8, 30, 'owner', 'product', 'Product Added', 'Product: Double Shot Espresso\nCategory: Hot Coffee\nPrice: ₱69.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-17 08:11:14'),
(474, 8, 30, 'owner', 'product', 'Product Added', 'Product: Hot Americano\nCategory: Hot Coffee\nPrice: ₱79.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-17 08:11:38'),
(475, 8, 30, 'owner', 'product', 'Product Added', 'Product: Cafe Latte\nCategory: Hot Coffee\nPrice: ₱99.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-17 08:12:15'),
(476, 8, 30, 'owner', 'product', 'Product Added', 'Product: Cinnamon Latte\nCategory: Hot Coffee\nPrice: ₱109.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-17 08:13:04'),
(477, 8, 30, 'owner', 'product', 'Product Added', 'Product: Caramel Macchiato\nCategory: Hot Coffee\nPrice: ₱109.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-17 08:14:20'),
(478, 8, 30, 'owner', 'product', 'Product Added', 'Product: Hot Matcha Latte\nCategory: Non Coffee\nPrice: ₱99.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-17 08:14:59'),
(479, 8, 30, 'owner', 'product', 'Product Added', 'Product: Hot Chocolate\nCategory: Non Coffee\nPrice: ₱99.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-17 08:15:25'),
(480, 8, 30, 'owner', 'product', 'Product Variants Added', 'Product: Lemon Honey\nCategory: Lemonades\nVariants: Small ₱39.00 (stock 20), Medium ₱59.00 (stock 20), Large ₱69.00 (stock 20)', '2026-08-17 08:16:55'),
(481, 8, 30, 'owner', 'product', 'Product Variants Added', 'Product: Lemon Yakult Honeuy\nCategory: Lemonades\nVariants: Small ₱59.00 (stock 20), Medium ₱69.00 (stock 20), Large ₱79.00 (stock 20)', '2026-08-17 08:18:00'),
(482, 8, 30, 'owner', 'product', 'Product Updated', 'Product: Lemon Yakult Honey\nChanges:\nName: \"Lemon Yakult Honeuy\" → \"Lemon Yakult Honey\"', '2026-08-17 08:18:30'),
(483, 8, 30, 'owner', 'product', 'Product Updated', 'Product: Lemon Yakult Honey\nChanges:\nName: \"Lemon Yakult Honeuy\" → \"Lemon Yakult Honey\"', '2026-08-17 08:18:45'),
(484, 8, 30, 'owner', 'product', 'Product Updated', 'Product: Lemon Yakult Honey\nChanges:\nName: \"Lemon Yakult Honeuy\" → \"Lemon Yakult Honey\"', '2026-08-17 08:19:02'),
(485, 8, 30, 'owner', 'product', 'Product Variants Added', 'Product: Lemorange\nCategory: Lemonades\nVariants: Medium ₱79.00 (stock 20), Large ₱89.00 (stock 20)', '2026-08-17 08:20:38'),
(486, 8, 30, 'owner', 'product', 'Product Variants Added', 'Product: Lemon Lychee\nCategory: Lemonades\nVariants: Medium ₱79.00 (stock 20), Large ₱89.00 (stock 20)', '2026-08-17 08:21:52'),
(487, 8, 30, 'owner', 'product', 'Product Variants Added', 'Product: Lemon Green Apple\nCategory: Lemonades\nVariants: Medium ₱79.00 (stock 20), Large ₱89.00 (stock 20)', '2026-08-17 08:23:03'),
(488, 8, 30, 'owner', 'product', 'Product Variants Added', 'Product: Lemon Honey Peach\nCategory: Lemonades\nVariants: Small ₱79.00 (stock 20), Large ₱89.00 (stock 20)', '2026-08-17 08:23:49'),
(489, 8, 30, 'owner', 'product', 'Product Variants Added', 'Product: Wintermelon\nCategory: Milktea\nVariants: Small ₱75.00 (stock 20), Medium ₱95.00 (stock 20), Large ₱115.00 (stock 20)', '2026-08-17 08:24:53'),
(490, 8, 30, 'owner', 'product', 'Product Variants Added', 'Product: Strawberry\nCategory: Milktea\nVariants: Small ₱75.00 (stock 20), Medium ₱95.00 (stock 20), Large ₱115.00 (stock 20)', '2026-08-17 08:25:44'),
(491, 8, 30, 'owner', 'product', 'Product Variants Added', 'Product: Chocolate\nCategory: Milktea\nVariants: Small ₱75.00 (stock 20), Medium ₱95.00 (stock 20), Large ₱115.00 (stock 20)', '2026-08-17 08:26:49'),
(492, 8, 30, 'owner', 'product', 'Product Variants Added', 'Product: Choco Strawberry\nCategory: Milktea\nVariants: Small ₱75.00 (stock 20), Medium ₱95.00 (stock 20), Large ₱115.00 (stock 20)', '2026-08-17 08:27:53'),
(493, 8, 30, 'owner', 'product', 'Product Variants Added', 'Product: Cookies & Cream\nCategory: Milktea\nVariants: Small ₱75.00 (stock 20), Medium ₱95.00 (stock 20), Large ₱115.00 (stock 20)', '2026-08-17 08:28:44'),
(494, 8, 30, 'owner', 'product', 'Product Variants Added', 'Product: Hokkaido\nCategory: Milktea\nVariants: Small ₱85.00 (stock 20), Medium ₱115.00 (stock 20), Large ₱135.00 (stock 20)', '2026-08-17 08:29:51'),
(495, 8, 30, 'owner', 'product', 'Product Variants Added', 'Product: Dark Belgian Chocolate\nCategory: Milktea\nVariants: Small ₱85.00 (stock 20), Medium ₱115.00 (stock 20), Large ₱135.00 (stock 20)', '2026-08-17 08:30:57'),
(496, 8, 30, 'owner', 'product', 'Product Variants Added', 'Product: Matcha\nCategory: Milktea\nVariants: Small ₱95.00 (stock 20), Medium ₱125.00 (stock 20), Large ₱145.00 (stock 20)', '2026-08-17 08:32:04'),
(497, 8, 30, 'owner', 'product', 'Product Variants Added', 'Product: Thai\nCategory: Milktea\nVariants: Small ₱95.00 (stock 20), Medium ₱125.00 (stock 20), Large ₱145.00 (stock 20)', '2026-08-17 08:33:09'),
(498, 8, 30, 'owner', 'product', 'Product Variants Added', 'Product: Biscoff\nCategory: Milktea\nVariants: Small ₱95.00 (stock 20), Medium ₱125.00 (stock 20), Large ₱145.00 (stock 20)', '2026-08-17 08:34:51'),
(499, 8, 30, 'owner', 'product', 'Product Variants Added', 'Product: Hokkaido\nCategory: Best Sellers\nVariants: Small ₱85.00 (stock 20), Medium ₱115.00 (stock 20), Large ₱135.00 (stock 20)', '2026-08-17 08:36:45'),
(500, 8, 30, 'owner', 'product', 'Product Variants Added', 'Product: Strawberry Milk\nCategory: Best Sellers\nVariants: Small ₱85.00 (stock 20), Medium ₱115.00 (stock 20), Large ₱135.00 (stock 20)', '2026-08-17 08:37:57'),
(501, 8, 30, 'owner', 'product', 'Product Variants Added', 'Product: Thai Tea Latte\nCategory: Best Sellers\nVariants: Small ₱95.00 (stock 20), Medium ₱125.00 (stock 20), Large ₱145.00 (stock 20)', '2026-08-17 08:39:20'),
(502, 8, 30, 'owner', 'product', 'Product Variants Added', 'Product: Matcha Latte\nCategory: Best Sellers\nVariants: Small ₱95.00 (stock 20), Medium ₱125.00 (stock 20), Large ₱145.00 (stock 20)', '2026-08-17 08:40:51'),
(503, 8, 30, 'owner', 'product', 'Product Variants Added', 'Product: Hokkaido Seasalt\nCategory: Best Sellers\nVariants: Small ₱115.00 (stock 20), Medium ₱135.00 (stock 20), Large ₱195.00 (stock 20)', '2026-08-17 08:42:35'),
(504, 8, 30, 'owner', 'product', 'Product Variants Added', 'Product: Thai Seasalt\nCategory: Best Sellers\nVariants: Small ₱125.00 (stock 20), Medium ₱145.00 (stock 20), Large ₱205.00 (stock 20)', '2026-08-17 08:43:37'),
(505, 8, 30, 'owner', 'product', 'Product Variants Added', 'Product: Matcha Seasalt\nCategory: Best Sellers\nVariants: Small ₱125.00 (stock 20), Medium ₱145.00 (stock 20), Large ₱205.00 (stock 20)', '2026-08-17 08:44:27'),
(506, 8, 30, 'owner', 'product', 'Product Variants Added', 'Product: Fries\nCategory: Side Dish\nVariants: Good for 1-2 ₱90.00 (stock 20), Good for 2-3 ₱180.00 (stock 20)', '2026-08-17 08:46:21'),
(507, 8, 30, 'owner', 'product', 'Product Added', 'Product: Miso Soup\nCategory: Side Dish\nPrice: ₱60.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-17 08:46:55'),
(508, 8, 30, 'owner', 'product', 'Product Added', 'Product: Korean Kimchi\nCategory: Side Dish\nPrice: ₱49.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-17 08:47:34'),
(509, 8, 30, 'owner', 'product', 'Product Added', 'Product: Coleslaw Salad\nCategory: Side Dish\nPrice: ₱59.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-17 08:48:08'),
(510, 8, 30, 'owner', 'product', 'Product Added', 'Product: Authentic Gyoza\nCategory: Side Dish\nVariant: 4 pcs\nPrice: ₱119.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-17 08:48:51'),
(511, 8, 30, 'owner', 'product', 'Product Added', 'Product: Authentic Gyoza\nCategory: Side Dish\nVariant: 8 pcs\nPrice: ₱229.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-17 08:49:42'),
(512, 8, 30, 'owner', 'product', 'Product Added', 'Product: Jumbo Ebi Furai with Coleslaw\nCategory: Side Dish\nPrice: ₱209.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-17 08:50:39'),
(513, 8, 30, 'owner', 'product', 'Product Added', 'Product: Jumbo Ebi Tempura\nCategory: Side Dish\nPrice: ₱299.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-17 08:51:21'),
(515, 8, 30, 'owner', 'product', 'Product Added', 'Product: Veggie Okonomiyaki\nCategory: Side Dish - Okonomiyaki\nPrice: ₱170.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-17 08:52:20'),
(516, 8, 30, 'owner', 'product', 'Product Added', 'Product: Classic Okonomiyaki\nCategory: Side Dish - Okonomiyaki\nPrice: ₱180.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-17 08:53:15'),
(517, 8, 30, 'owner', 'product', 'Product Added', 'Product: Kani Mango Salad\nCategory: Side Dish - Salad Bowl\nPrice: ₱139.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-17 08:56:34'),
(519, 8, 30, 'owner', 'product', 'Product Added', 'Product: Spicy Tuna Sashimi Salad\nCategory: Side Dish - Salad Bowl\nPrice: ₱199.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-17 08:57:40'),
(520, 8, 30, 'owner', 'product', 'Product Added', 'Product: Crunchy Salmon Sashimi Salad\nCategory: Side Dish - Salad Bowl\nPrice: ₱259.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-17 08:58:31'),
(521, 8, 30, 'owner', 'product', 'Product Added', 'Product: Bibimbap Regular\nCategory: Rice Meals\nPrice: ₱169.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-17 08:59:27'),
(522, 8, 30, 'owner', 'product', 'Product Added', 'Product: Bibimbap Premium\nCategory: Rice Meals\nPrice: ₱199.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-17 09:00:02'),
(523, 8, 30, 'owner', 'product', 'Product Added', 'Product: Kimchi Rice w/ Egg & Spam\nCategory: Rice Meals\nPrice: ₱189.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-17 09:00:44'),
(524, 8, 30, 'owner', 'product', 'Product Added', 'Product: Omu-Rice\nCategory: Rice Meals\nPrice: ₱175.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-17 09:01:15'),
(525, 8, 30, 'owner', 'product', 'Product Added', 'Product: Chicken Katsu\nCategory: Rice Meals\nPrice: ₱189.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-17 09:02:09'),
(526, 8, 30, 'owner', 'product', 'Product Added', 'Product: Pork Katsu\nCategory: Rice Meals\nPrice: ₱189.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-17 09:02:41'),
(527, 8, 30, 'owner', 'product', 'Product Added', 'Product: Chicken Katsudon\nCategory: Rice Meals\nPrice: ₱209.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-17 09:04:32'),
(528, 8, 30, 'owner', 'product', 'Product Added', 'Product: Pork Katsudon\nCategory: Rice Meals\nPrice: ₱209.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-17 09:06:19'),
(529, 8, 30, 'owner', 'product', 'Product Added', 'Product: Katsu Curry\nCategory: Rice Meals\nPrice: ₱209.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-17 09:07:09'),
(530, 8, 30, 'owner', 'product', 'Product Added', 'Product: Siomai Chao Fan\nCategory: Rice Meals\nPrice: ₱145.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-17 09:07:38'),
(531, 8, 30, 'owner', 'product', 'Product Added', 'Product: Shrimp Chao Fan\nCategory: Rice Meals\nPrice: ₱165.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-17 09:08:17'),
(532, 8, 30, 'owner', 'product', 'Product Added', 'Product: Kani Cheese\nCategory: Sushi Rolls - Maki Rolls\nVariant: 4 pcs\nPrice: ₱75.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-17 09:09:19'),
(534, 8, 30, 'owner', 'product', 'Product Deleted', 'Kani Cheese - 4 pcs was removed from the menu.', '2026-08-17 09:09:57'),
(535, 8, 30, 'owner', 'product', 'Product Variants Added', 'Product: Kani Cheese\nCategory: Sushi Rolls - Maki Rolls\nVariants: 4 pcs ₱75.00 (stock 20), 8 pcs ₱139.00 (stock 20)', '2026-08-17 09:10:28'),
(537, 8, 30, 'owner', 'product', 'Product Variants Added', 'Product: Sesame Crab\nCategory: Sushi Rolls - Maki Rolls\nVariants: 4 pcs ₱85.00 (stock 20), 8 pcs ₱149.00 (stock 20)', '2026-08-17 09:11:30'),
(538, 8, 30, 'owner', 'product', 'Product Variants Added', 'Product: Sakura Denbu\nCategory: Sushi Rolls - Maki Rolls\nVariants: 4 pcs ₱95.00 (stock 20), 8 pcs ₱169.00 (stock 20)', '2026-08-17 09:12:30'),
(539, 8, 30, 'owner', 'product', 'Product Variants Added', 'Product: California Roll\nCategory: Sushi Rolls - Maki Rolls\nVariants: 4 pcs ₱95.00 (stock 20), 8 pcs ₱179.00 (stock 20)', '2026-08-17 09:13:22'),
(540, 8, 30, 'owner', 'product', 'Product Added', 'Product: Volcano Roll\nCategory: Sushi Rolls - Maki Rolls\nVariant: 8 pcs\nPrice: ₱199.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-17 09:14:12'),
(541, 8, 30, 'owner', 'product', 'Product Added', 'Product: Dragon Roll\nCategory: Sushi Rolls - Maki Rolls\nVariant: 8 pcs\nPrice: ₱259.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-17 09:14:53'),
(542, 8, 30, 'owner', 'product', 'Product Added', 'Product: Spicy Tuna Roll\nCategory: Sushi Rolls - Maki Rolls\nVariant: 8 pcs\nPrice: ₱259.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-17 09:15:16'),
(543, 8, 30, 'owner', 'product', 'Product Added', 'Product: Crunchy Salmon\nCategory: Sushi Rolls - Maki Rolls\nVariant: 8 pcs\nPrice: ₱259.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-17 09:15:58'),
(544, 8, 30, 'owner', 'product', 'Product Added', 'Product: Crunchy Spicy Salmon\nCategory: Sushi Rolls - Maki Rolls\nVariant: 8 pcs\nPrice: ₱279.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-17 09:16:46'),
(545, 8, 30, 'owner', 'product', 'Product Added', 'Product: Pure Salmon Roll\nCategory: Sushi Rolls - Maki Rolls\nVariant: 8 pcs\nPrice: ₱299.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-17 09:17:19'),
(546, 8, 30, 'owner', 'product', 'Product Added', 'Product: Shrimp Nigiri\nCategory: Sushi Rolls - Nigiri & Sashimi\nVariant: 8 pcs\nPrice: ₱189.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-17 09:18:11'),
(547, 8, 30, 'owner', 'product', 'Product Added', 'Product: Salmon Nigiri\nCategory: Sushi Rolls - Nigiri & Sashimi\nVariant: 8 pcs\nPrice: ₱259.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-17 09:18:51'),
(548, 8, 30, 'owner', 'product', 'Product Added', 'Product: Salmon Aburi Nigiri\nCategory: Sushi Rolls - Nigiri & Sashimi\nVariant: 8 pcs\nPrice: ₱259.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-17 09:19:34'),
(549, 8, 30, 'owner', 'product', 'Product Added', 'Product: Salmon Sashimi\nCategory: Sushi Rolls - Nigiri & Sashimi\nVariant: 8 pcs\nPrice: ₱339.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-17 09:20:15'),
(550, 8, 30, 'owner', 'product', 'Product Added', 'Product: Tuna Nigiri\nCategory: Sushi Rolls - Nigiri & Sashimi\nVariant: 8 pcs\nPrice: ₱259.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-17 09:21:00'),
(551, 8, 30, 'owner', 'product', 'Product Added', 'Product: Tuna Aburi Nigiri\nCategory: Sushi Rolls - Nigiri & Sashimi\nVariant: 8 pcs\nPrice: ₱259.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-17 09:21:45'),
(552, 8, 30, 'owner', 'product', 'Product Added', 'Product: Tuna Sashimi\nCategory: Sushi Rolls - Nigiri & Sashimi\nVariant: 8 pcs\nPrice: ₱339.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-17 09:22:21'),
(553, 8, 30, 'owner', 'product', 'Product Variants Added', 'Product: Assorted Sushi\nCategory: Sushi Platter\nVariants: 24 Pieces ₱629.00 (stock 20), 32 Pieces ₱829.00 (stock 20), 50 Pieces ₱1,299.00 (stock 20), 64 Pieces ₱1,599.00 (stock 20), 100 Pieces ₱2,599.00 (stock 20), 150 Pieces ₱4,000.00 (stock 20), 200 Pieces ₱5,000.00 (stock 20)', '2026-08-17 09:25:50'),
(554, 8, 30, 'owner', 'product', 'Product Added', 'Product: Alon\'s Signature Dish\nCategory: Rice Meals\nPrice: ₱259.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-17 09:30:28'),
(555, 8, 30, 'owner', 'product', 'Product Added', 'Product: Ebi Furai Curry\nCategory: Rice Meals\nPrice: ₱269.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-17 09:31:08'),
(556, 8, 30, 'owner', 'product', 'Product Added', 'Product: Cheesy Aburi Katsu\nCategory: Rice Meals\nPrice: ₱229.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-17 09:31:35'),
(557, 8, 30, 'owner', 'product', 'Product Added', 'Product: Bento Box A\nCategory: Bento Boxes\nPrice: ₱245.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-17 09:34:35'),
(558, 8, 30, 'owner', 'product', 'Product Added', 'Product: Bento Box B\nCategory: Bento Boxes\nPrice: ₱255.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-17 09:35:07'),
(559, 8, 30, 'owner', 'product', 'Product Added', 'Product: Bento Box C\nCategory: Bento Boxes\nPrice: ₱265.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-17 09:35:31'),
(560, 8, 30, 'owner', 'product', 'Product Added', 'Product: Bento Box D\nCategory: Bento Boxes\nPrice: ₱275.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-17 09:36:00'),
(561, 8, 30, 'owner', 'product', 'Product Variants Added', 'Product: Baked Sushi Tray\nCategory: Baked Goods\nVariants: Small (1 pax) ₱275.00 (stock 20), Medium (2-3 pax) ₱500.00 (stock 20), Large (4-5 pax) ₱700.00 (stock 20), XL (6-10 pax) ₱1,500.00 (stock 20)', '2026-08-17 09:40:09'),
(562, 8, 30, 'owner', 'product', 'Product Variants Added', 'Product: Korean Cream Cheese Garlic Bun\nCategory: Baked Goods\nVariants: Solo ₱99.00 (stock 20), Box of 3 ₱289.00 (stock 20), Box of 4 ₱389.00 (stock 20)', '2026-08-17 09:41:27'),
(563, 8, 30, 'owner', 'product', 'Product Variants Added', 'Product: Takoyaki Cheese\nCategory: Takoyaki - Original Flavors\nVariants: 4 pcs ₱65.00 (stock 20), 8 pcs ₱130.00 (stock 20), 12 pcs ₱190.00 (stock 20)', '2026-08-17 09:44:25'),
(564, 8, 30, 'owner', 'product', 'Product Variants Added', 'Product: Takoyaki Cheese Overload\nCategory: Takoyaki - Original Flavors\nVariants: 4 pcs ₱70.00 (stock 20), 8 pcs ₱140.00 (stock 20), 12 pcs ₱200.00 (stock 20)', '2026-08-17 09:45:27'),
(565, 8, 30, 'owner', 'product', 'Product Variants Added', 'Product: Takoyaki Bacon\nCategory: Takoyaki - Original Flavors\nVariants: 4 pcs ₱75.00 (stock 20), 8 pcs ₱150.00 (stock 20), 12 pcs ₱210.00 (stock 20)', '2026-08-17 09:46:44'),
(566, 8, 30, 'owner', 'product', 'Product Variants Added', 'Product: Takoyaki Crab\nCategory: Takoyaki - Original Flavors\nVariants: 4 pcs ₱75.00 (stock 20), 8 pcs ₱150.00 (stock 20), 12 pcs ₱210.00 (stock 20)', '2026-08-17 09:48:19'),
(567, 8, 30, 'owner', 'product', 'Product Variants Added', 'Product: Takoyaki Shrimp\nCategory: Takoyaki - Original Flavors\nVariants: 4 pcs ₱80.00 (stock 20), 8 pcs ₱160.00 (stock 20), 12 pcs ₱230.00 (stock 20)', '2026-08-17 09:52:24'),
(568, 8, 30, 'owner', 'product', 'Product Variants Added', 'Product: Classic Octobits\nCategory: Takoyaki - Original Flavors\nVariants: 4 pcs ₱80.00 (stock 20), 8 pcs ₱160.00 (stock 20), 12 pcs ₱230.00 (stock 20)', '2026-08-17 09:56:57'),
(569, 8, 30, 'owner', 'product', 'Product Variants Added', 'Product: Cheesy Octobits\nCategory: Takoyaki - Original Flavors\nVariants: 4 pcs ₱85.00 (stock 20), 8 pcs ₱170.00 (stock 20), 12 pcs ₱250.00 (stock 20)', '2026-08-17 10:12:37'),
(570, 8, 30, 'owner', 'product', 'Product Added', 'Product: Takoyaki Cheese\nCategory: Takoyaki - Party Tray\nVariant: 24 pcs\nPrice: ₱390.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-17 10:14:07'),
(571, 8, 30, 'owner', 'product', 'Product Added', 'Product: Takoyaki Cheese Overload\nCategory: Takoyaki - Party Tray\nVariant: 24 pcs\nPrice: ₱420.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-17 10:14:52'),
(572, 8, 30, 'owner', 'product', 'Product Added', 'Product: Takoyaki Bacon\nCategory: Takoyaki - Party Tray\nVariant: 24 pcs\nPrice: ₱450.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-17 10:16:00'),
(573, 8, 30, 'owner', 'product', 'Product Added', 'Product: Takoyaki Crab\nCategory: Takoyaki - Party Tray\nVariant: 24 pcs\nPrice: ₱450.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-17 10:16:33'),
(574, 8, 30, 'owner', 'product', 'Product Added', 'Product: Takoyaki Shrimp\nCategory: Takoyaki - Party Tray\nVariant: 24 pcs\nPrice: ₱470.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-17 10:17:16'),
(575, 8, 30, 'owner', 'product', 'Product Added', 'Product: Classic Octobits\nCategory: Takoyaki - Party Tray\nVariant: 24 pcs\nPrice: ₱500.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-17 10:17:53'),
(576, 8, 30, 'owner', 'product', 'Product Added', 'Product: Cheesy Octobits\nCategory: Takoyaki - Party Tray\nVariant: 24 pcs\nPrice: ₱530.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-17 10:18:31'),
(577, 8, 30, 'owner', 'product', 'Product Variants Added', 'Product: Takoyaki Cheese\nCategory: Takoyaki - Takoyaki Cheese Bomb\nVariants: 4 pcs ₱80.00 (stock 20), 8 pcs ₱160.00 (stock 20), 12 pcs ₱230.00 (stock 20)', '2026-08-17 10:19:42'),
(578, 8, 30, 'owner', 'product', 'Product Variants Added', 'Product: Takoyaki Cheese Overload\nCategory: Takoyaki - Takoyaki Cheese Bomb\nVariants: 4 pcs ₱85.00 (stock 20), 8 pcs ₱170.00 (stock 20), 12 pcs ₱240.00 (stock 20)', '2026-08-17 10:22:15'),
(579, 8, 30, 'owner', 'product', 'Product Variants Added', 'Product: Takoyaki Crab\nCategory: Takoyaki - Takoyaki Cheese Bomb\nVariants: 4 pcs ₱90.00 (stock 20), 8 pcs ₱180.00 (stock 20), 12 pcs ₱260.00 (stock 20)', '2026-08-17 10:23:46'),
(580, 8, 30, 'owner', 'product', 'Product Variants Added', 'Product: Takoyaki Shrimp\nCategory: Takoyaki - Takoyaki Cheese Bomb\nVariants: 4 pcs ₱90.00 (stock 20), 8 pcs ₱180.00 (stock 20), 12 pcs ₱260.00 (stock 20)', '2026-08-17 10:25:23'),
(581, 8, 30, 'owner', 'product', 'Product Variants Added', 'Product: Takoyaki Bacon\nCategory: Takoyaki - Takoyaki Cheese Bomb\nVariants: 4 pcs ₱90.00 (stock 20), 8 pcs ₱180.00 (stock 20), 12 pcs ₱260.00 (stock 20)', '2026-08-17 10:27:45'),
(582, 8, 30, 'owner', 'product', 'Product Variants Added', 'Product: Classic Octobits\nCategory: Takoyaki - Takoyaki Cheese Bomb\nVariants: 4 pcs ₱95.00 (stock 20), 8 pcs ₱190.00 (stock 20), 12 pcs ₱280.00 (stock 20)', '2026-08-17 10:29:01'),
(583, 8, 30, 'owner', 'product', 'Product Variants Added', 'Product: Cheesy Octobits\nCategory: Takoyaki - Takoyaki Cheese Bomb\nVariants: 4 pcs ₱100.00 (stock 20), 8 pcs ₱200.00 (stock 20), 12 pcs ₱290.00 (stock 20)', '2026-08-17 10:36:49'),
(584, 8, 30, 'owner', 'product', 'Product Added', 'Product: Takoyaki Cheese Overload\nCategory: Takoyaki - Cheese Bomb Party Tray\nVariant: 24 pcs\nPrice: ₱470.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-17 10:55:24'),
(585, 8, 30, 'owner', 'product', 'Product Added', 'Product: Takoyaki Bacon\nCategory: Takoyaki - Cheese Bomb Party Tray\nVariant: 24 pcs\nPrice: ₱530.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-17 10:57:22'),
(586, 8, 30, 'owner', 'product', 'Product Added', 'Product: Takoyaki Crab\nCategory: Takoyaki - Cheese Bomb Party Tray\nVariant: 24 pcs\nPrice: ₱530.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-17 10:57:54'),
(587, 8, 30, 'owner', 'product', 'Product Added', 'Product: Takoyaki Shrimp\nCategory: Takoyaki - Cheese Bomb Party Tray\nVariant: 24 pcs1\nPrice: ₱580.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-17 11:00:27'),
(588, 8, 30, 'owner', 'product', 'Product Added', 'Product: Classic Octobits\nCategory: Takoyaki - Cheese Bomb Party Tray\nVariant: 24 pcs\nPrice: ₱580.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-17 11:00:57'),
(589, 8, 30, 'owner', 'product', 'Product Added', 'Product: Cheesy Octobits\nCategory: Takoyaki - Cheese Bomb Party Tray\nVariant: 24 pcs\nPrice: ₱600.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-17 11:02:52'),
(590, 8, 30, 'owner', 'restaurant_application', 'Go-Live Application Submitted', 'The owner submitted \"Alon\'s Cafe Alaminos\" for administrator review.', '2026-08-17 11:07:12'),
(591, 9, 31, 'owner', 'product', 'Product Variants Added', 'Product: Pizza Overload\nCategory: Galley\'s Favorites\nVariants: Small ₱339.00 (stock 20), Medium ₱379.00 (stock 20), Large ₱509.00 (stock 20)', '2026-08-17 11:19:23'),
(592, 9, 31, 'owner', 'product', 'Product Variants Added', 'Product: Spinach and Mushroom\nCategory: Galley\'s Favorites\nVariants: Small ₱339.00 (stock 20), Medium ₱379.00 (stock 20), Large ₱509.00 (stock 20)', '2026-08-17 11:20:20'),
(593, 9, 31, 'owner', 'product', 'Product Variants Added', 'Product: Meaty Deluxe\nCategory: Galley\'s Favorites\nVariants: Small ₱339.00 (stock 20), Medium ₱379.00 (stock 20), Large ₱509.00 (stock 20)', '2026-08-17 11:21:14'),
(594, 9, 31, 'owner', 'product', 'Product Variants Added', 'Product: Ultimate Cheese\nCategory: Galley\'s Favorites\nVariants: Small ₱339.00 (stock 20), Medium ₱379.00 (stock 20), Large ₱509.00 (stock 20)', '2026-08-17 11:22:12'),
(595, 9, 31, 'owner', 'product', 'Product Variants Added', 'Product: Pepperoni\nCategory: Classic Favors\nVariants: Small ₱269.00 (stock 20), Medium ₱309.00 (stock 20), Large ₱459.00 (stock 20)', '2026-08-17 11:23:23'),
(596, 9, 31, 'owner', 'product', 'Product Variants Added', 'Product: Bacon and Cheese\nCategory: Classic Favors\nVariants: Small ₱269.00 (stock 20), Medium ₱309.00 (stock 20), Large ₱459.00 (stock 20)', '2026-08-17 11:24:11'),
(597, 9, 31, 'owner', 'product', 'Product Variants Added', 'Product: All Cheese\nCategory: Classic Favors\nVariants: Small ₱269.00 (stock 20), Medium ₱309.00 (stock 20), Large ₱459.00 (stock 20)', '2026-08-17 11:25:36'),
(598, 9, 31, 'owner', 'product', 'Product Variants Added', 'Product: Hawaiian\nCategory: Classic Flavor\nVariants: Small ₱269.00 (stock 20), Medium ₱309.00 (stock 20), Large ₱459.00 (stock 20)', '2026-08-17 11:27:54'),
(599, 9, 31, 'owner', 'product', 'Product Updated', 'Product: Hawaiian\nChanges:\nCategory: Classic Flavor → Classic Flavors', '2026-08-17 11:28:54'),
(600, 9, 31, 'owner', 'product', 'Product Updated', 'Product: Hawaiian\nChanges:\nCategory: Classic Flavor → Classic Flavors', '2026-08-17 11:29:11'),
(601, 9, 31, 'owner', 'product', 'Product Updated', 'Product: Hawaiian\nChanges:\nCategory: Classic Flavor → Classic Flavors', '2026-08-17 11:29:42'),
(602, 9, 31, 'owner', 'product', 'Product Added', 'Product: Simply Marga\nCategory: Neopolitan Style Flavors\nPrice: ₱359.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-17 11:31:19'),
(603, 9, 31, 'owner', 'product', 'Product Added', 'Product: Truffle Trouble\nCategory: Neopolitan Style Flavors\nPrice: ₱459.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-17 11:31:56'),
(604, 9, 31, 'owner', 'product', 'Product Added', 'Product: Mega Roni\nCategory: Neopolitan Style Flavors\nPrice: ₱459.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-17 11:32:31'),
(605, 9, 31, 'owner', 'product', 'Product Added', 'Product: Five Cheese Fever\nCategory: Neopolitan Style Flavors\nPrice: ₱459.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-17 11:34:20'),
(606, 9, 31, 'owner', 'product', 'Product Added', 'Product: Shrimp Twist\nCategory: Neopolitan Style Flavors\nPrice: ₱459.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-17 11:34:41'),
(607, 9, 31, 'owner', 'product', 'Product Deleted', 'Hawaiian - Small was removed from the menu.', '2026-08-17 11:35:46'),
(608, 9, 31, 'owner', 'product', 'Product Deleted', 'Hawaiian - Large was removed from the menu.', '2026-08-17 11:35:56'),
(609, 9, 31, 'owner', 'product', 'Product Deleted', 'Hawaiian - Medium was removed from the menu.', '2026-08-17 11:36:04'),
(610, 9, 31, 'owner', 'product', 'Product Variants Added', 'Product: Hawaiian\nCategory: Classic Flavors\nVariants: Small ₱269.00 (stock 20), Medium ₱309.00 (stock 20), Large ₱459.00 (stock 20)', '2026-08-17 11:37:05'),
(611, 9, 31, 'owner', 'product', 'Product Deleted', 'Hawaiian - Small was removed from the menu.', '2026-08-17 11:37:47'),
(612, 9, 31, 'owner', 'product', 'Product Deleted', 'Hawaiian - Large was removed from the menu.', '2026-08-17 11:37:51'),
(613, 9, 31, 'owner', 'product', 'Product Deleted', 'Hawaiian - Medium was removed from the menu.', '2026-08-17 11:37:53'),
(614, 9, 31, 'owner', 'product', 'Product Variants Added', 'Product: Hawaiian\nCategory: Classic Flavors\nVariants: Small ₱269.00 (stock 20), Medium ₱309.00 (stock 20), Large ₱459.00 (stock 20)', '2026-08-17 11:39:49'),
(615, 9, 31, 'owner', 'product', 'Product Updated', 'Product: All Cheese\nChanges:\nCategory: Classic Favors → Classic Flavors', '2026-08-17 11:41:47'),
(616, 9, 31, 'owner', 'product', 'Product Updated', 'Product: All Cheese\nChanges:\nCategory: Classic Favors → Classic Flavors', '2026-08-17 11:42:46'),
(617, 9, 31, 'owner', 'product', 'Product Updated', 'Product: All Cheese\nChanges:\nCategory: Classic Favors → Classic Flavors', '2026-08-17 11:43:53'),
(618, 9, 31, 'owner', 'product', 'Product Updated', 'Product: Bacon and Cheese\nChanges:\nCategory: Classic Favors → Classic Flavors', '2026-08-17 11:53:21'),
(619, 9, 31, 'owner', 'product', 'Product Updated', 'Product: Bacon and Cheese\nChanges:\nCategory: Classic Favors → Classic Flavors', '2026-08-17 11:53:42'),
(620, 9, 31, 'owner', 'product', 'Product Updated', 'Product: Bacon and Cheese\nChanges:\nCategory: Classic Favors → Classic Flavors', '2026-08-17 11:54:19'),
(621, 9, 31, 'owner', 'product', 'Product Updated', 'Product: Pepperoni\nChanges:\nCategory: Classic Favors → Classic Flavors', '2026-08-17 11:54:43'),
(622, 9, 31, 'owner', 'product', 'Product Updated', 'Product: Pepperoni\nChanges:\nCategory: Classic Favors → Classic Flavors', '2026-08-17 11:56:20'),
(623, 9, 31, 'owner', 'product', 'Product Updated', 'Product: Pepperoni\nChanges:\nCategory: Classic Favors → Classic Flavors', '2026-08-17 11:56:38'),
(624, 9, 31, 'owner', 'product', 'Product Added', 'Product: Coffee Caramel Pizza\nCategory: Dessert Pizza\nVariant: Medium\nPrice: ₱269.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-17 11:58:50'),
(625, 9, 31, 'owner', 'product', 'Product Added', 'Product: Choco Smores Pizza\nCategory: Dessert Pizza\nVariant: Medium\nPrice: ₱269.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-17 12:00:30'),
(626, 9, 31, 'owner', 'product', 'Product Added', 'Product: Chicken Wings - Honey Buffalo\nCategory: Chicken & Appetizers\nVariant: 6 pcs\nPrice: ₱199.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-17 12:08:07'),
(627, 9, 31, 'owner', 'product', 'Product Updated', 'Product: Honey Buffalo\nChanges:\nName: \"Chicken Wings - Honey Buffalo\" → \"Honey Buffalo\"\nCategory: Chicken & Appetizers → Chicken & Appetizers - Chicken Wings', '2026-08-17 12:08:47'),
(628, 9, 31, 'owner', 'product', 'Product Deleted', 'Honey Buffalo - 6 pcs was removed from the menu.', '2026-08-17 12:09:51'),
(629, 9, 31, 'owner', 'product', 'Product Variants Added', 'Product: Chicken Wings\nCategory: Chicken & Appetizers - Chicken Wings\nVariants: Honey Buffalo-6pcs ₱199.00 (stock 20), Garlic Parmesan-6pcs ₱199.00 (stock 20)', '2026-08-17 12:11:11'),
(630, 9, 31, 'owner', 'product', 'Product Added', 'Product: Chicken Poppers\nCategory: Chicken & Appetizers\nPrice: ₱139.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-17 12:12:05'),
(631, 9, 31, 'owner', 'product', 'Product Added', 'Product: Mojos\nCategory: Chicken & Appetizers\nPrice: ₱139.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-17 12:12:29'),
(632, 9, 31, 'owner', 'product', 'Product Added', 'Product: Spinach Dip Platter\nCategory: Chicken & Appetizers\nPrice: ₱279.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-17 12:13:01'),
(633, 9, 31, 'owner', 'product', 'Product Updated', 'Product: Spinach Dip Platter\nChanges:\nCategory: Chicken & Appetizers → Appetizers', '2026-08-17 12:13:43'),
(634, 9, 31, 'owner', 'product', 'Product Updated', 'Product: Mojos\nChanges:\nCategory: Chicken & Appetizers → Appetizers', '2026-08-17 12:13:57'),
(635, 9, 31, 'owner', 'product', 'Product Updated', 'Product: Chicken Poppers\nChanges:\nCategory: Chicken & Appetizers → Appetizers', '2026-08-17 12:14:26'),
(636, 9, 31, 'owner', 'product', 'Product Deleted', 'Chicken Wings - Honey Buffalo-6pcs was removed from the menu.', '2026-08-17 12:14:58'),
(637, 9, 31, 'owner', 'product', 'Product Deleted', 'Chicken Wings - Garlic Parmesan-6pcs was removed from the menu.', '2026-08-17 12:15:13'),
(638, 9, 31, 'owner', 'product', 'Product Added', 'Product: Honey Buffalo\nCategory: Chicken Wings\nVariant: 6 pcs\nPrice: ₱199.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-17 12:16:48'),
(639, 9, 31, 'owner', 'product', 'Product Added', 'Product: Garlic Parmesan\nCategory: Chicken Wings\nVariant: 6 pcs\nPrice: ₱199.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-17 12:19:15'),
(640, 9, 31, 'owner', 'product', 'Product Variants Added', 'Product: Apple\nCategory: Drinks - Fruit Soda\nVariants: 12oz ₱39.00 (stock 20), 16oz ₱59.00 (stock 20)', '2026-08-17 12:20:43'),
(641, 9, 31, 'owner', 'product', 'Product Variants Added', 'Product: Lychee\nCategory: Drinks - Fruit Soda\nVariants: 12oz ₱39.00 (stock 20), 16oz ₱59.00 (stock 20)', '2026-08-17 12:21:26'),
(642, 9, 31, 'owner', 'product', 'Product Variants Added', 'Product: Strawberry\nCategory: Drinks - Fruit Soda\nVariants: 12oz ₱39.00 (stock 20), 16oz ₱59.00 (stock 20)', '2026-08-17 12:22:13'),
(643, 9, 31, 'owner', 'product', 'Product Variants Added', 'Product: Blueberry\nCategory: Drinks - Fruit Soda\nVariants: 12oz ₱39.00 (stock 20), 16oz ₱59.00 (stock 20)', '2026-08-17 12:22:56'),
(644, 9, 31, 'owner', 'product', 'Product Variants Added', 'Product: Mango\nCategory: Drinks - Fruit Soda\nVariants: 12oz ₱39.00 (stock 20), 16oz ₱59.00 (stock 20)', '2026-08-17 12:27:23'),
(645, 9, 31, 'owner', 'product', 'Product Variants Added', 'Product: Apple\nCategory: Drinks - Fruit Yogu\nVariants: 12oz ₱49.00 (stock 20), 16oz ₱69.00 (stock 20)', '2026-08-17 12:29:10'),
(646, 9, 31, 'owner', 'product', 'Product Variants Added', 'Product: Lychee\nCategory: Drinks - Fruit Yogu\nVariants: 12oz ₱49.00 (stock 20), 16oz ₱69.00 (stock 20)', '2026-08-17 12:30:00'),
(647, 9, 31, 'owner', 'product', 'Product Variants Added', 'Product: Strawberry\nCategory: Drinks - Fruit Yogu\nVariants: 12oz ₱49.00 (stock 20), 16oz ₱69.00 (stock 20)', '2026-08-17 12:31:09'),
(648, 9, 31, 'owner', 'product', 'Product Variants Added', 'Product: Blueberry\nCategory: Drinks - Fruit Yogu\nVariants: 12oz ₱49.00 (stock 20), 16oz ₱69.00 (stock 20)', '2026-08-17 12:31:51'),
(649, 9, 31, 'owner', 'product', 'Product Variants Added', 'Product: Mango\nCategory: Drinks - Fruit Yogu\nVariants: 12oz ₱49.00 (stock 20), 16oz ₱69.00 (stock 20)', '2026-08-17 12:32:58'),
(650, 9, 31, 'owner', 'product', 'Product Variants Added', 'Product: Coke\nCategory: Drinks\nVariants: 1.5L ₱80.00 (stock 20), Mismo ₱30.00 (stock 20)', '2026-08-17 12:33:46'),
(651, 9, 31, 'owner', 'product', 'Product Variants Added', 'Product: Sprite\nCategory: Drinks\nVariants: 1.5L ₱80.00 (stock 20), Mismo ₱30.00 (stock 20)', '2026-08-17 12:34:26'),
(652, 9, 31, 'owner', 'product', 'Product Added', 'Product: Truffle Pasta\nCategory: Pasta\nPrice: ₱299.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-17 12:34:58'),
(653, 9, 31, 'owner', 'product', 'Product Added', 'Product: Shrimp Marinara\nCategory: Pasta\nPrice: ₱299.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-17 12:35:39'),
(654, 9, 31, 'owner', 'product', 'Product Added', 'Product: Four Cheese Pasta\nCategory: Pasta\nPrice: ₱299.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-17 12:35:59'),
(655, 9, 31, 'owner', 'restaurant_application', 'Go-Live Application Submitted', 'The owner submitted \"The Galley Pizza Alaminos Branch\" for administrator review.', '2026-08-17 12:39:20'),
(656, 7, 29, 'owner', 'restaurant_application', 'Go-Live Application Submitted', 'The owner submitted \"Jai\'s Grill and Resto\" for administrator review.', '2026-08-17 12:42:11'),
(661, 8, 30, 'owner', 'product', 'Product Updated', 'Product: Alon\'s Signature Dish\nChanges:\nProduct description added.', '2026-08-18 11:32:43'),
(662, 8, 30, 'owner', 'product', 'Product Updated', 'Product: Bibimbap Regular\nChanges:\nProduct description added.', '2026-08-18 11:58:40'),
(663, 8, 30, 'owner', 'product', 'Product Updated', 'Product: Bibimbap Premium\nChanges:\nProduct description added.', '2026-08-18 12:00:42'),
(664, 8, 30, 'owner', 'product', 'Product Updated', 'Product: Kimchi Rice w/ Egg & Spam\nChanges:\nProduct description added.', '2026-08-18 12:01:51'),
(665, 8, 30, 'owner', 'product', 'Product Updated', 'Product: Omu-Rice\nChanges:\nProduct description added.', '2026-08-18 12:02:34'),
(666, 8, 30, 'owner', 'product', 'Product Updated', 'Product: Chicken Katsu\nChanges:\nProduct description added.', '2026-08-18 12:03:32'),
(667, 8, 30, 'owner', 'product', 'Product Updated', 'Product: Pork Katsu\nChanges:\nProduct description added.', '2026-08-18 12:05:16'),
(668, 8, 30, 'owner', 'product', 'Product Updated', 'Product: Chicken Katsudon\nChanges:\nProduct description added.', '2026-08-18 12:06:48'),
(669, 8, 30, 'owner', 'product', 'Product Updated', 'Product: Pork Katsudon\nChanges:\nProduct description added.', '2026-08-18 12:07:04'),
(670, 8, 30, 'owner', 'product', 'Product Updated', 'Product: Katsu Curry\nChanges:\nProduct description added.', '2026-08-18 12:07:41'),
(671, 8, 30, 'owner', 'product', 'Product Updated', 'Product: Siomai Chao Fan\nChanges:\nProduct description added.', '2026-08-18 12:08:19'),
(672, 8, 30, 'owner', 'product', 'Product Updated', 'Product: Shrimp Chao Fan\nChanges:\nProduct description added.', '2026-08-18 12:08:52'),
(673, 8, 30, 'owner', 'product', 'Product Updated', 'Product: Ebi Furai Curry\nChanges:\nProduct description added.', '2026-08-18 12:10:55'),
(674, 8, 30, 'owner', 'product', 'Product Updated', 'Product: Cheesy Aburi Katsu\nChanges:\nProduct description added.', '2026-08-18 12:14:33'),
(675, 8, 30, 'owner', 'product', 'Product Updated', 'Product: Bento Box A\nChanges:\nProduct description added.', '2026-08-18 12:29:35'),
(676, 8, 30, 'owner', 'product', 'Product Updated', 'Product: Bento Box B\nChanges:\nProduct description added.', '2026-08-18 12:31:11'),
(677, 8, 30, 'owner', 'product', 'Product Updated', 'Product: Bento Box A\nChanges:\nProduct description updated.', '2026-08-18 12:31:27'),
(678, 8, 30, 'owner', 'product', 'Product Updated', 'Product: Bento Box C\nChanges:\nProduct description added.', '2026-08-18 12:33:57'),
(679, 8, 30, 'owner', 'product', 'Product Updated', 'Product: Bento Box D\nChanges:\nProduct description added.', '2026-08-18 12:34:40'),
(680, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Sweet and Spicy\nChanges:\nProduct description added.', '2026-08-18 12:38:49'),
(681, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Teriyaki\nChanges:\nProduct description added.', '2026-08-18 12:39:14'),
(682, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Honey BBQ\nChanges:\nProduct description added.', '2026-08-18 12:39:34'),
(683, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Buffalo\nChanges:\nProduct description added.', '2026-08-18 12:40:02'),
(684, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Garlic Parmesan\nChanges:\nProduct description added.', '2026-08-18 12:41:06'),
(685, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Spamsilog\nChanges:\nProduct description added.', '2026-08-18 12:42:10'),
(686, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Cornsilog\nChanges:\nProduct description added.', '2026-08-18 12:44:14'),
(687, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Tosilog\nChanges:\nProduct description added.', '2026-08-18 12:44:34'),
(688, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Tofu Sisig\nChanges:\nProduct description added.', '2026-08-18 12:44:50'),
(689, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Tapsilog\nChanges:\nProduct description added.', '2026-08-18 12:45:10'),
(690, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Pork Sisig\nChanges:\nProduct description added.', '2026-08-18 12:45:33'),
(691, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Drop Platter\nChanges:\nProduct description added.', '2026-08-18 12:46:56'),
(692, 9, 31, 'owner', 'product', 'Product Updated', 'Product: Pizza Overload\nChanges:\nProduct description added.', '2026-08-18 12:51:14'),
(693, 9, 31, 'owner', 'product', 'Product Updated', 'Product: Pizza Overload\nChanges:\nProduct description added.', '2026-08-18 12:51:35'),
(694, 9, 31, 'owner', 'product', 'Product Updated', 'Product: Pizza Overload\nChanges:\nProduct description added.', '2026-08-18 12:51:55'),
(695, 9, 31, 'owner', 'product', 'Product Updated', 'Product: Spinach and Mushroom\nChanges:\nProduct description added.', '2026-08-18 12:55:37'),
(696, 9, 31, 'owner', 'product', 'Product Updated', 'Product: Spinach and Mushroom\nChanges:\nProduct description added.', '2026-08-18 13:01:54'),
(697, 9, 31, 'owner', 'product', 'Product Updated', 'Product: Spinach and Mushroom\nChanges:\nProduct description added.', '2026-08-18 13:04:05'),
(698, 9, 31, 'owner', 'product', 'Product Updated', 'Product: Meaty Deluxe\nChanges:\nProduct description added.', '2026-08-18 13:05:12'),
(699, 9, 31, 'owner', 'product', 'Product Updated', 'Product: Meaty Deluxe\nChanges:\nProduct description added.', '2026-08-18 13:05:33'),
(700, 9, 31, 'owner', 'product', 'Product Updated', 'Product: Meaty Deluxe\nChanges:\nProduct description added.', '2026-08-18 13:06:16'),
(701, 9, 31, 'owner', 'product', 'Product Updated', 'Product: Ultimate Cheese\nChanges:\nProduct description added.', '2026-08-18 13:08:24'),
(702, 9, 31, 'owner', 'product', 'Product Updated', 'Product: Ultimate Cheese\nChanges:\nProduct description added.', '2026-08-18 13:08:37'),
(703, 9, 31, 'owner', 'product', 'Product Updated', 'Product: Ultimate Cheese\nChanges:\nProduct description added.', '2026-08-18 13:09:04'),
(704, 9, 31, 'owner', 'product', 'Product Updated', 'Product: Pepperoni\nChanges:\nProduct description added.', '2026-08-18 13:12:17'),
(705, 9, 31, 'owner', 'product', 'Product Updated', 'Product: Pepperoni\nChanges:\nProduct description added.', '2026-08-18 13:12:35'),
(706, 9, 31, 'owner', 'product', 'Product Updated', 'Product: Pepperoni\nChanges:\nProduct description added.', '2026-08-18 13:13:05'),
(707, 9, 31, 'owner', 'product', 'Product Updated', 'Product: Bacon and Cheese\nChanges:\nProduct description added.', '2026-08-18 13:15:02');
INSERT INTO `tbl_activity_logs` (`log_id`, `restaurant_id`, `user_id`, `user_role`, `action_type`, `action_title`, `action_description`, `created_at`) VALUES
(708, 9, 31, 'owner', 'product', 'Product Updated', 'Product: Bacon and Cheese\nChanges:\nProduct description added.', '2026-08-18 13:15:21'),
(709, 9, 31, 'owner', 'product', 'Product Updated', 'Product: Bacon and Cheese\nChanges:\nProduct description added.', '2026-08-18 13:15:36'),
(710, 9, 31, 'owner', 'product', 'Product Updated', 'Product: All Cheese\nChanges:\nProduct description added.', '2026-08-18 13:16:21'),
(711, 9, 31, 'owner', 'product', 'Product Updated', 'Product: All Cheese\nChanges:\nProduct description added.', '2026-08-18 13:19:20'),
(712, 9, 31, 'owner', 'product', 'Product Updated', 'Product: Hawaiian\nChanges:\nProduct description added.', '2026-08-18 13:20:02'),
(713, 9, 31, 'owner', 'product', 'Product Updated', 'Product: Hawaiian\nChanges:\nProduct description added.', '2026-08-18 13:20:30'),
(714, 9, 31, 'owner', 'product', 'Product Updated', 'Product: Hawaiian\nChanges:\nProduct description added.', '2026-08-18 13:20:51'),
(715, 9, 31, 'owner', 'product', 'Product Updated', 'Product: Simply Marga\nChanges:\nProduct description added.', '2026-08-18 13:26:24'),
(716, 9, 31, 'owner', 'product', 'Product Updated', 'Product: Truffle Trouble\nChanges:\nProduct description added.', '2026-08-18 13:27:48'),
(717, 9, 31, 'owner', 'product', 'Product Updated', 'Product: Mega Roni\nChanges:\nProduct description added.', '2026-08-18 13:33:01'),
(718, 9, 31, 'owner', 'product', 'Product Updated', 'Product: Five Cheese Fever\nChanges:\nProduct description added.', '2026-08-18 13:38:10'),
(719, 9, 31, 'owner', 'product', 'Product Updated', 'Product: Shrimp Twist\nChanges:\nProduct description added.', '2026-08-18 13:39:29'),
(727, 6, 27, 'owner', 'staff', 'Staff Access Code Updated', 'The restaurant owner generated a new staff access code.', '2026-08-25 13:17:42'),
(728, 6, 27, 'owner', 'staff', 'Staff Account Created', 'Ian Pagador Dela Cruz was added as delivery staff.', '2026-08-25 13:27:10'),
(729, 6, 27, 'owner', 'staff', 'Staff Account Created', 'Ian Pagador Dela Cruz was added as delivery_staff.', '2026-08-25 13:27:19'),
(730, 6, 27, 'owner', 'staff', 'Staff Account Created', 'Gel Racho Recep was added as cashier.', '2026-08-25 13:29:59'),
(731, 6, 27, 'owner', 'staff', 'Staff Account Created', 'Gel Racho Recep was added as cashier.', '2026-08-25 13:30:16'),
(732, 6, 27, 'owner', 'staff', 'Staff Account Updated', 'Angel R Recepcion\'s staff account was updated.', '2026-08-25 13:32:07'),
(733, 6, 27, 'owner', 'staff', 'Staff Account Updated', 'Ian Reigh Pagador Dela Cruz\'s staff account was updated.', '2026-08-25 13:32:40'),
(734, 6, 27, 'owner', 'staff', 'Staff Account Updated', 'Angel R Recepcion\'s staff account was updated.', '2026-08-25 13:33:06'),
(735, 6, 17, 'admin', 'restaurant_application', 'Restaurant Approved', 'The go-live application for \"Drop By Cafe\" owned by Jemillene Laurente was approved. Restaurant ID 6 is now visible to customers.', '2026-08-25 13:56:39'),
(736, 6, 27, 'owner', 'staff', 'Staff Password Reset', 'Ian Reigh Pagador Dela Cruz was issued a temporary password and must create a new password at the next login.', '2026-08-25 14:15:08'),
(740, 6, 27, 'owner', 'staff', 'Staff Account Updated', 'Angel R Recepcion\'s staff account was updated.', '2026-08-26 09:49:31'),
(741, 6, 27, 'owner', 'system', 'Settings Updated', 'Restaurant settings were updated.', '2026-08-26 09:50:35'),
(742, 6, 12, 'customer', 'order', 'New Customer Order', 'Angel Recepcion placed Order #40 / Queue #1.', '2026-08-26 09:54:44'),
(743, 6, 12, 'customer', 'order', 'New Customer Order', 'Order #1 placed Order #41 / Queue #2.', '2026-08-26 10:06:14'),
(744, 6, 34, 'cashier', 'order', 'Order Status Updated', 'Angel R Recepcion (Cashier) changed Order #41 from Pending to Preparing.', '2026-08-26 10:09:06'),
(745, 6, 34, NULL, 'delivery_assignment', 'Rider Assigned', 'Ian Reigh Pagador Dela Cruz was assigned and automatically accepted delivery Order #41.', '2026-08-26 10:10:10'),
(746, 6, 33, NULL, 'delivery_status', 'Order Picked Up', 'The rider picked up delivery Order #41 from the restaurant.', '2026-08-26 10:13:07'),
(747, 6, 33, NULL, 'delivery_status', 'Out for Delivery', 'Delivery Order #41 is now out for delivery.', '2026-08-26 10:14:02'),
(748, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Hazelnut Latte\nChanges:\nProduct image added.', '2026-08-30 05:39:41'),
(749, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Hazelnut Latte\nChanges:\nProduct image added.', '2026-08-30 05:40:17'),
(750, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Roasted Almond\nChanges:\nProduct image added.', '2026-08-30 05:40:43'),
(751, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Roasted Almond\nChanges:\nProduct image added.', '2026-08-30 05:41:10'),
(752, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Caramel Latte\nChanges:\nProduct image added.', '2026-08-30 05:43:17'),
(753, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Caramel Latte\nChanges:\nProduct image added.', '2026-08-30 05:43:40'),
(754, 6, 27, 'owner', 'product', 'Product Updated', 'Product: White Choco Latte\nChanges:\nProduct image added.', '2026-08-30 05:45:40'),
(755, 6, 27, 'owner', 'product', 'Product Updated', 'Product: White Choco Latte\nChanges:\nProduct image added.', '2026-08-30 05:46:03'),
(756, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Salted Caramel\nChanges:\nProduct image added.', '2026-08-30 05:47:06'),
(757, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Salted Caramel\nChanges:\nProduct image added.', '2026-08-30 05:47:26'),
(758, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Mocha Latte\nChanges:\nProduct image added.', '2026-08-30 05:48:06'),
(759, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Mocha Latte\nChanges:\nProduct image added.', '2026-08-30 05:48:33'),
(760, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Biscoff Latte\nChanges:\nProduct image added.', '2026-08-30 05:50:55'),
(761, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Biscoff Latte\nChanges:\nProduct image added.', '2026-08-30 05:51:22'),
(762, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Cookies n\' Cream\nChanges:\nProduct image added.', '2026-08-30 06:04:26'),
(763, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Cookies n\' Cream\nChanges:\nProduct image added.', '2026-08-30 06:04:47'),
(764, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Strawberry\nChanges:\nProduct image added.', '2026-08-30 06:05:28'),
(765, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Strawberry\nChanges:\nProduct image added.', '2026-08-30 06:06:25'),
(766, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Blueberry\nChanges:\nProduct image added.', '2026-08-30 06:07:06'),
(767, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Blueberry\nChanges:\nProduct image added.', '2026-08-30 06:07:30'),
(768, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Matcha\nChanges:\nProduct image added.', '2026-08-30 06:08:25'),
(769, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Matcha\nChanges:\nProduct image added.', '2026-08-30 06:11:05'),
(770, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Stawberry/Blueberry\nChanges:\nProduct image added.', '2026-08-30 06:11:35'),
(771, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Stawberry/Blueberry\nChanges:\nProduct image added.', '2026-08-30 06:12:03'),
(772, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Biscoff Matcha\nChanges:\nProduct image added.', '2026-08-30 06:13:22'),
(773, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Biscoff Matcha\nChanges:\nProduct image added.', '2026-08-30 06:14:06'),
(774, 6, 12, 'customer', 'order', 'New Customer Order', 'test placed Order #42 / Queue #1.', '2026-09-03 05:15:36'),
(775, 6, 12, 'customer', 'order', 'New Customer Order', 'tr placed Order #43 / Queue #2.', '2026-09-03 05:22:37'),
(776, 6, 27, 'owner', 'staff', 'Staff Account Updated', 'Angel R Recepcion\'s staff account was updated.', '2026-09-04 10:46:55'),
(777, 6, 27, 'owner', 'staff', 'Staff Account Updated', 'Ian Reigh P Dela Cruz\'s staff account was updated.', '2026-09-04 10:47:28'),
(778, 6, 27, 'owner', 'system', 'Settings Updated', 'Restaurant settings were updated.', '2026-09-04 10:48:13'),
(779, 6, 12, 'customer', 'order', 'New Customer Order', 'Angel #1 placed Order #44 / Queue #1.', '2026-09-04 10:52:41'),
(780, 6, 34, 'cashier', 'order', 'Order Status Updated', 'Angel R Recepcion (Cashier) changed Order #44 from Pending to Preparing.', '2026-09-04 10:53:20'),
(781, 6, 34, 'cashier', 'order', 'Order Status Updated', 'Angel R Recepcion (Cashier) changed Order #44 from Preparing to Completed.', '2026-09-04 10:53:40'),
(782, 6, 27, 'owner', 'staff', 'Staff Account Created', 'Andoy Humilde Bangal was added as delivery staff.', '2026-09-04 11:04:51'),
(783, 6, 27, 'owner', 'staff', 'Staff Account Created', 'Andoy Humilde Bangal was added as delivery_staff.', '2026-09-04 11:04:51'),
(784, 6, 12, 'customer', 'order', 'New Customer Order', 'Angel #2 placed Order #45 / Queue #2.', '2026-09-04 11:07:17'),
(785, 6, 12, 'customer', 'order', 'New Customer Order', 'Angel #3 placed Order #46 / Queue #3.', '2026-09-04 11:11:33'),
(786, 6, 34, 'cashier', 'order', 'Order Status Updated', 'Angel R Recepcion (Cashier) changed Order #46 from Pending to Preparing.', '2026-09-04 11:12:40'),
(787, 6, 34, 'cashier', 'order', 'Order #45 Cancelled', 'Angel R Recepcion (Cashier) cancelled Queue #2, Order #45 for Angel #2. Order type: Delivery. Amount affected: ₱579.00. Reason: Unable to prepare the order. Inventory: 3 stock units restored.', '2026-09-04 11:13:11'),
(788, 6, 34, NULL, 'delivery_assignment', 'Rider Assigned', 'Andoy Humilde Bangal was assigned and automatically accepted delivery Order #46.', '2026-09-04 11:13:41'),
(789, 6, 35, NULL, 'delivery_status', 'Order Picked Up', 'The rider picked up delivery Order #46 from the restaurant.', '2026-09-04 11:14:41'),
(790, 6, 35, NULL, 'delivery_status', 'Out for Delivery', 'Delivery Order #46 is now out for delivery.', '2026-09-04 11:14:50'),
(791, 6, 35, NULL, 'delivery_status', 'Delivery Completed', 'Delivery Order #46 was delivered and the COD cash payment was confirmed.', '2026-09-04 11:15:15'),
(792, 6, 12, 'customer', 'order', 'New Customer Order', 'Angel #4 placed Order #47 / Queue #4.', '2026-09-04 11:20:42'),
(793, 6, 34, 'cashier', 'order', 'Order Status Updated', 'Angel R Recepcion (Cashier) changed Order #47 from Pending to Preparing.', '2026-09-04 11:21:47'),
(794, 6, 34, 'cashier', 'order', 'Order Status Updated', 'Angel R Recepcion (Cashier) changed Order #47 from Preparing to Completed.', '2026-09-04 11:22:00'),
(795, 6, 12, 'customer', 'order', 'New Customer Order', '#5 placed Order #48 / Queue #5.', '2026-09-04 11:32:59'),
(796, 6, 34, 'cashier', 'order', 'Order Status Updated', 'Angel R Recepcion (Cashier) changed Order #48 from Pending to Preparing.', '2026-09-04 11:35:03'),
(797, 6, 34, NULL, 'delivery_assignment', 'Rider Assigned', 'Andoy Humilde Bangal was assigned and automatically accepted delivery Order #48.', '2026-09-04 11:35:27'),
(798, 6, 35, NULL, 'delivery_status', 'Order Picked Up', 'The rider picked up delivery Order #48 from the restaurant.', '2026-09-04 11:36:19'),
(799, 6, 35, NULL, 'delivery_status', 'Out for Delivery', 'Delivery Order #48 is now out for delivery.', '2026-09-04 11:36:39'),
(800, 6, 35, NULL, 'delivery_status', 'Delivery Completed', 'Delivery Order #48 was delivered and the COD cash payment was confirmed.', '2026-09-04 11:36:52'),
(801, 6, 12, 'customer', 'order', 'New Customer Order', 'Angel Test placed Order #49 / Queue #1.', '2026-09-07 12:47:55'),
(802, 6, 34, 'cashier', 'order', 'Order Status Updated', 'Angel R Recepcion (Cashier) changed Order #49 from Pending to Preparing.', '2026-09-07 12:59:24'),
(803, 6, 34, 'cashier', 'order', 'Order Status Updated', 'Angel R Recepcion (Cashier) changed Order #49 from Preparing to Completed.', '2026-09-07 13:01:43'),
(804, 6, 12, 'customer', 'order', 'New Customer Order', 'Angel (Sept. 07 #2) placed Order #50 / Queue #2.', '2026-09-07 13:12:30'),
(805, 6, 34, 'cashier', 'order', 'Order Status Updated', 'Angel R Recepcion (Cashier) changed Order #50 from Pending to Preparing.', '2026-09-07 13:13:25'),
(806, 6, 34, NULL, 'delivery_assignment', 'Rider Assigned', 'Andoy Humilde Bangal was assigned and automatically accepted delivery Order #50.', '2026-09-07 13:13:50'),
(807, 6, 35, NULL, 'delivery_status', 'Order Picked Up', 'The rider picked up delivery Order #50 from the restaurant.', '2026-09-07 13:15:24'),
(808, 6, 35, NULL, 'delivery_status', 'Out for Delivery', 'Delivery Order #50 is now out for delivery.', '2026-09-07 13:15:41'),
(809, 6, 35, NULL, 'delivery_status', 'Delivery Completed', 'Delivery Order #50 was completed successfully.', '2026-09-07 13:16:51'),
(810, 6, 12, 'customer', 'order', 'New Customer Order', 'Delivery Angel (#1) placed Order #51 / Queue #3.', '2026-09-07 15:00:15'),
(811, 6, 34, 'cashier', 'order', 'Order Status Updated', 'Angel R Recepcion (Cashier) changed Order #51 from Pending to Preparing.', '2026-09-07 15:03:39'),
(812, 6, 34, NULL, 'delivery_assignment', 'Rider Assigned', 'Andoy Humilde Bangal was assigned and automatically accepted delivery Order #51.', '2026-09-07 15:04:40'),
(813, 6, 35, NULL, 'delivery_status', 'Order Picked Up', 'The rider picked up delivery Order #51 from the restaurant.', '2026-09-07 15:05:31'),
(814, 6, 35, NULL, 'delivery_status', 'Out for Delivery', 'Delivery Order #51 is now out for delivery.', '2026-09-07 15:05:46'),
(815, 6, 35, NULL, 'delivery_status', 'Delivery Completed', 'Delivery Order #51 was delivered and the COD cash payment was confirmed.', '2026-09-07 15:08:38'),
(816, 6, 27, 'owner', 'system', 'Settings Updated', 'Restaurant settings were updated.', '2026-09-08 15:43:17'),
(817, 6, 27, 'owner', 'system', 'Settings Updated', 'Restaurant settings were updated.', '2026-09-08 15:48:07'),
(818, 6, 27, 'owner', 'system', 'Settings Updated', 'Restaurant settings were updated.', '2026-09-08 15:48:22'),
(819, 6, 27, 'owner', 'system', 'Settings Updated', 'Restaurant settings were updated.', '2026-09-08 15:48:55'),
(820, 6, 27, 'owner', 'system', 'Settings Updated', 'Restaurant settings were updated.', '2026-09-08 15:53:29'),
(821, 6, 12, 'customer', 'order', 'New Customer Order', 'Gel placed Order #52 / Queue #1.', '2026-09-08 15:57:40'),
(822, 6, 34, 'cashier', 'order', 'Order Status Updated', 'Angel R Recepcion (Cashier) changed Order #52 from Pending to Preparing.', '2026-09-08 15:58:27'),
(823, 6, 34, NULL, 'delivery_assignment', 'Rider Assigned', 'Andoy Humilde Bangal was assigned and automatically accepted delivery Order #52.', '2026-09-08 15:58:44'),
(824, 6, 35, NULL, 'delivery_status', 'Order Picked Up', 'The rider picked up delivery Order #52 from the restaurant.', '2026-09-08 15:59:42'),
(825, 6, 35, NULL, 'delivery_status', 'Out for Delivery', 'Delivery Order #52 is now out for delivery.', '2026-09-08 15:59:48'),
(826, 6, 35, NULL, 'delivery_status', 'Delivery Completed', 'Delivery Order #52 was delivered and the COD cash payment was confirmed.', '2026-09-08 16:02:28'),
(827, 6, 27, 'owner', 'system', 'Settings Updated', 'Restaurant settings were updated.', '2026-09-08 16:13:26'),
(828, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Creamy Pesto Tuna\nChanges:\nProduct image replaced.', '2026-09-09 14:51:27'),
(829, 6, 27, 'owner', 'product', 'Product Added', 'Product: Add Product\nCategory: Product\nPrice: ₱10,000.00\nInitial Stock: 10\nStatus: Available\nPromotion: None', '2026-09-09 14:55:50'),
(830, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Add Product\nChanges:\nProduct image added.', '2026-09-09 14:56:06'),
(831, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Add Product\nChanges:\nProduct image replaced.', '2026-09-09 14:57:13'),
(832, 6, 27, 'owner', 'staff', 'Staff Account Updated', 'Andoy Humilde Bangal\'s staff account was updated.', '2026-09-09 14:59:05'),
(833, 6, 27, 'owner', 'staff', 'Staff Account Updated', 'Angel Recepcion\'s staff account was updated.', '2026-09-09 14:59:23'),
(834, 6, 27, 'owner', 'staff', 'Staff Password Reset', 'Ian Reigh P Dela Cruz was issued a temporary password and must create a new password at the next login.', '2026-09-09 14:59:52'),
(835, 6, 27, 'owner', 'inventory', 'Inventory Restocked', 'Product: Chicken Poppers\nCategory: Budget Meal\nQuantity Added: 1\nStock: 17 → 18', '2026-09-09 15:01:22'),
(836, 6, 27, 'owner', 'inventory', 'Inventory Restocked', 'Product: Drop Supreme Burger\nCategory: Burger Series\nQuantity Added: 1\nStock: 19 → 20', '2026-09-09 15:01:48'),
(837, 6, 27, 'owner', 'inventory', 'Inventory Restocked', 'Product: Add Product\nCategory: Product\nQuantity Added: 7\nStock: 10 → 17', '2026-09-09 15:02:01'),
(838, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Add Product\nChanges:\nProduct image replaced.', '2026-09-09 15:06:43'),
(839, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Creamy Pesto Tuna\nChanges:\nProduct image replaced.', '2026-09-09 15:07:23'),
(840, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Drop Supreme Burger\nChanges:\nProduct image replaced.', '2026-09-09 15:09:44'),
(841, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Overload Nachos\nChanges:\nProduct image replaced.', '2026-09-09 15:21:50'),
(842, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Strawberry Yogurt\nChanges:\nProduct image added.', '2026-09-09 15:26:21'),
(843, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Strawberry Yogurt\nChanges:\nProduct image added.', '2026-09-09 15:26:44'),
(844, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Blueberry Yogurt\nChanges:\nProduct image added.', '2026-09-09 15:27:05'),
(845, 6, 37, 'customer', 'order', 'New Customer Order', 'Micah Romasoc placed Order #54 / Queue #2.', '2026-09-09 15:54:24'),
(846, 6, 37, 'customer', 'order', 'New Customer Order', 'Micah Romasoc placed Order #55 / Queue #3.', '2026-09-09 15:57:36'),
(847, 6, 12, 'customer', 'order', 'New Customer Order', 'kjjhgyu placed Order #56 / Queue #1.', '2026-09-11 02:26:44'),
(848, 6, 34, 'cashier', 'order', 'Order Status Updated', 'Angel Recepcion (Cashier) changed Order #56 from Pending to Preparing.', '2026-09-11 02:31:04'),
(849, 6, 34, 'cashier', 'order', 'Order Status Updated', 'Angel Recepcion (Cashier) changed Order #56 from Preparing to Completed.', '2026-09-11 02:31:15'),
(850, 9, 17, 'admin', 'restaurant_application', 'Restaurant Approved', 'The go-live application for \"The Galley Pizza Alaminos Branch\" owned by Dary Apolinario Castro was approved. Restaurant ID 9 is now visible to customers.', '2026-09-11 02:38:31'),
(851, 8, 17, 'admin', 'restaurant_application', 'Restaurant Approved', 'The go-live application for \"Alon\'s Cafe Alaminos\" owned by Rizza D. Ranoy was approved. Restaurant ID 8 is now visible to customers.', '2026-09-11 02:39:17'),
(852, 10, 40, 'owner', 'staff', 'Staff Account Created', 'Cj Porto was added as delivery staff.', '2026-09-11 02:42:44'),
(853, 10, 40, 'owner', 'staff', 'Staff Account Created', 'Cj Porto was added as delivery_staff.', '2026-09-11 02:42:44'),
(854, 10, 40, 'owner', 'product', 'Product Variants Added', 'Product: Mocha\nCategory: Drinks\nVariants: Medium ₱50.00 (stock 89), Large ₱80.00 (stock 55)', '2026-09-11 02:44:11'),
(855, 10, 40, 'owner', 'product', 'Product Updated', 'Product: Mocha\nChanges:\nProduct description added.\nPrice: ₱80.00 → ₱90.00\nPromotion: None → 40.00% discount (Active, scheduled 2026-09-11 10:45:00 to 2026-09-12 11:50:00)', '2026-09-11 02:45:26'),
(856, 10, 40, 'owner', 'restaurant_application', 'Go-Live Application Submitted', 'The owner submitted \"Bianca Cafe\" for administrator review.', '2026-09-11 02:46:14'),
(857, 10, 17, 'admin', 'restaurant_application', 'Restaurant Approved', 'The go-live application for \"Bianca Cafe\" owned by Bianca Cacho was approved. Restaurant ID 10 is now visible to customers.', '2026-09-11 02:46:28'),
(858, 10, 40, 'owner', 'system', 'Settings Updated', 'Restaurant settings were updated.', '2026-09-11 02:48:14'),
(859, 10, 12, 'customer', 'order', 'New Customer Order', 'hahaha placed Order #57 / Queue #1.', '2026-09-11 02:49:39'),
(860, 10, 12, 'customer', 'order', 'Customer Cancelled Order', 'hahaha cancelled Queue #1, Order #57. Order type: Delivery. Amount affected: ₱114.00. Reason: Incorrect order details. Inventory: 1 stock unit restored.', '2026-09-11 02:51:48'),
(861, 10, 12, 'customer', 'order', 'New Customer Order', 'hatog placed Order #58 / Queue #2.', '2026-09-11 02:52:57'),
(862, 10, 12, 'customer', 'order', 'New Customer Order', 'cege placed Order #59 / Queue #3.', '2026-09-11 02:54:04'),
(863, 10, 40, 'owner', 'staff', 'Staff Account Created', 'Cherry Dacdacc was added as cashier.', '2026-09-11 03:17:11'),
(864, 10, 40, 'owner', 'staff', 'Staff Account Created', 'Cherry Dacdacc was added as cashier.', '2026-09-11 03:17:12'),
(865, 10, 40, 'owner', 'staff', 'Staff Password Reset', 'Cherry Dacdacc was issued a temporary password and must create a new password at the next login.', '2026-09-11 03:19:47'),
(866, 10, 12, 'customer', 'order', 'New Customer Order', 'hatdig placed Order #60 / Queue #4.', '2026-09-11 03:21:41'),
(867, 10, 42, 'cashier', 'order', 'Order Status Updated', 'Cherry Dacdacc (Cashier) changed Order #60 from Pending to Preparing.', '2026-09-11 03:22:19'),
(868, 10, 42, 'cashier', 'order', 'Order Status Updated', 'Cherry Dacdacc (Cashier) changed Order #60 from Preparing to Completed.', '2026-09-11 03:22:30'),
(869, 10, 46, 'customer', 'order', 'New Customer Order', 'ttyrt placed Order #61 / Queue #5.', '2026-09-11 04:09:29'),
(870, 10, 42, 'cashier', 'order', 'Order #61 Cancelled', 'Cherry Dacdacc (Cashier) cancelled Queue #5, Order #61 for ttyrt. Order type: Takeout. Amount affected: ₱54.00. Reason: Insufficient stock. Inventory: 1 stock unit restored.', '2026-09-11 04:12:56'),
(871, 10, 46, 'customer', 'order', 'New Customer Order', 'fyhth placed Order #62 / Queue #6.', '2026-09-11 04:13:24'),
(872, 10, 46, 'customer', 'order', 'Customer Cancelled Order', 'fyhth cancelled Queue #6, Order #62. Order type: Takeout. Amount affected: ₱54.00. Reason: Incorrect order details. Inventory: 1 stock unit restored.', '2026-09-11 04:13:51'),
(873, 10, 46, 'customer', 'order', 'New Customer Order', '57tyyt placed Order #63 / Queue #7.', '2026-09-11 04:14:23'),
(874, 10, 42, 'cashier', 'order', 'Order Status Updated', 'Cherry Dacdacc (Cashier) changed Order #63 from Pending to Preparing.', '2026-09-11 04:14:49'),
(875, 10, 42, 'cashier', 'order', 'Order Status Updated', 'Cherry Dacdacc (Cashier) changed Order #63 from Preparing to Completed.', '2026-09-11 04:16:26'),
(876, 6, 46, 'customer', 'order', 'New Customer Order', 'trtry placed Order #64 / Queue #2.', '2026-09-11 04:17:40'),
(877, 6, 34, 'cashier', 'order', 'Order Status Updated', 'Angel Recepcion (Cashier) changed Order #64 from Pending to Preparing.', '2026-09-11 04:19:49'),
(878, 6, 34, NULL, 'delivery_assignment', 'Rider Assigned', 'Andoy Humilde Bangal was assigned and automatically accepted delivery Order #64.', '2026-09-11 04:22:20'),
(879, 6, 35, NULL, 'delivery_status', 'Order Picked Up', 'The rider picked up delivery Order #64 from the restaurant.', '2026-09-11 04:23:20'),
(880, 6, 35, NULL, 'delivery_status', 'Out for Delivery', 'Delivery Order #64 is now out for delivery.', '2026-09-11 04:23:33'),
(881, 6, 35, NULL, 'delivery_status', 'Delivery Completed', 'Delivery Order #64 was delivered and the COD cash payment was confirmed.', '2026-09-11 04:23:48'),
(882, 6, 27, 'owner', 'product', 'Product Deleted', 'Add Product was removed from the menu.', '2026-09-11 04:25:56'),
(883, 6, 27, 'owner', 'product', 'Product Added', 'Product: Test\nCategory: TEST\nPrice: ₱67.00\nInitial Stock: 80\nStatus: Available\nPromotion: None', '2026-09-11 04:26:55'),
(884, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Test\nChanges:\nCategory: TEST → OKAy\nProduct description updated.\nVariant: None → Regular', '2026-09-11 04:27:28'),
(885, 6, 27, 'owner', 'inventory', 'Inventory Restocked', 'Product: Combo Cravings\nCategory: Budget Meal\nQuantity Added: 5\nStock: 17 → 22', '2026-09-11 04:27:43'),
(886, 6, 27, 'owner', 'inventory', 'Inventory Restocked', 'Product: Chicken Poppers\nCategory: Budget Meal\nQuantity Added: 3\nStock: 17 → 20', '2026-09-11 04:27:56'),
(887, 6, 27, 'owner', 'system', 'Settings Updated', 'Restaurant settings were updated.', '2026-09-11 04:31:17'),
(888, 6, 27, 'owner', 'product', 'Product Updated', 'Product: Test\nChanges:\nPrice: ₱67.00 → ₱90.00\nPromotion: None → 25.00% discount (Active, permanent)', '2026-09-11 04:54:33'),
(889, 6, 46, 'customer', 'order', 'New Customer Order', 'kugiuyyi placed Order #65 / Queue #3.', '2026-09-11 04:58:08'),
(890, 6, 34, 'cashier', 'order', 'Order Status Updated', 'Angel Recepcion (Cashier) changed Order #65 from Pending to Preparing.', '2026-09-11 04:59:29'),
(891, 6, 34, 'cashier', 'order', 'Order Status Updated', 'Angel Recepcion (Cashier) changed Order #65 from Preparing to Completed.', '2026-09-11 04:59:39');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_address_cache`
--

CREATE TABLE `tbl_address_cache` (
  `cache_id` bigint(20) UNSIGNED NOT NULL,
  `normalized_query` varchar(190) NOT NULL,
  `original_query` varchar(190) NOT NULL,
  `result_position` tinyint(3) UNSIGNED NOT NULL DEFAULT 1,
  `display_name` varchar(500) NOT NULL,
  `latitude` decimal(10,8) NOT NULL,
  `longitude` decimal(11,8) NOT NULL,
  `road` varchar(190) DEFAULT NULL,
  `barangay` varchar(190) DEFAULT NULL,
  `city` varchar(190) DEFAULT NULL,
  `province` varchar(190) DEFAULT NULL,
  `place_type` varchar(80) DEFAULT NULL,
  `category` varchar(120) DEFAULT NULL,
  `provider` varchar(30) NOT NULL DEFAULT 'geoapify',
  `hit_count` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `last_used_at` datetime NOT NULL DEFAULT current_timestamp(),
  `expires_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tbl_address_cache`
--

INSERT INTO `tbl_address_cache` (`cache_id`, `normalized_query`, `original_query`, `result_position`, `display_name`, `latitude`, `longitude`, `road`, `barangay`, `city`, `province`, `place_type`, `category`, `provider`, `hit_count`, `created_at`, `last_used_at`, `expires_at`) VALUES
(1, 'lucap', 'Lucap', 1, 'Lucap, Alaminos, Pangasinan, Philippines', 16.18369270, 119.99685360, 'Lucap', 'Lucap', 'Alaminos', 'Pangasinan', 'city', 'administrative', 'geoapify', 3, '2026-08-06 23:08:13', '2026-08-06 23:27:09', '2026-09-05 23:08:13'),
(2, 'poblacion', 'Poblacion', 1, 'Poblacion, Labrador, 2402 Pangasinan, Philippines', 16.02412540, 120.14663560, 'Poblacion', 'Poblacion', 'Labrador', 'Pangasinan', 'city', 'populated_place', 'geoapify', 5, '2026-08-06 23:19:34', '2026-08-06 23:37:04', '2026-09-05 23:19:34'),
(3, 'poblacion', 'Poblacion', 2, 'Poblacion, Malasiqui, 2421 Pangasinan, Philippines', 15.92116330, 120.41912070, 'Poblacion', 'Poblacion', 'Malasiqui', 'Pangasinan', 'city', 'populated_place', 'geoapify', 5, '2026-08-06 23:19:34', '2026-08-06 23:37:04', '2026-09-05 23:19:34'),
(4, 'poblacion', 'Poblacion', 3, 'Cruz, Poblacion, La Trinidad, 2601 Benguet, Philippines', 16.45437560, 120.57547840, 'Cruz', 'Poblacion', 'La Trinidad', 'Benguet', 'suburb', 'populated_place', 'geoapify', 5, '2026-08-06 23:19:34', '2026-08-06 23:37:04', '2026-09-05 23:19:34'),
(5, 'poblacion', 'Poblacion', 4, 'Poblacion, Makati, 1210 Metro Manila, Philippines', 14.56622250, 121.03137870, 'Poblacion', 'Poblacion', 'Makati', 'Metro Manila', 'suburb', 'administrative', 'geoapify', 5, '2026-08-06 23:19:34', '2026-08-06 23:37:04', '2026-09-05 23:19:34'),
(6, 'poblacion', 'Poblacion', 5, 'Poblacion, Caloocan, 1408 Metro Manila, Philippines', 14.65042440, 120.97174020, 'Poblacion', 'Poblacion', 'Caloocan', 'Metro Manila', 'suburb', 'administrative', 'geoapify', 5, '2026-08-06 23:19:34', '2026-08-06 23:37:04', '2026-09-05 23:19:34'),
(7, 'poblacio', 'Poblacio', 1, 'Alaminos, Pangasinan, Philippines', 16.15538570, 119.97922010, 'Alaminos', '', 'Alaminos', 'Pangasinan', 'city', 'administrative', 'geoapify', 0, '2026-08-06 23:19:44', '2026-08-06 23:19:44', '2026-09-05 23:19:44'),
(9, 'alaminos', 'Alaminos', 1, 'Alaminos, Pangasinan, Philippines', 16.15538570, 119.97922010, 'Alaminos', '', 'Alaminos', 'Pangasinan', 'city', 'administrative', 'geoapify', 0, '2026-08-06 23:25:30', '2026-08-06 23:25:30', '2026-09-05 23:25:30'),
(10, 'pag-asa', 'pag-asa', 1, 'Pag-asa, Rizal, 3127 Nueva Ecija, Philippines', 15.67270280, 121.08574510, 'Pag-asa', 'Pag-asa', 'Rizal', 'Nueva Ecija', 'city', 'populated_place', 'geoapify', 0, '2026-08-06 23:27:21', '2026-08-06 23:27:21', '2026-09-05 23:27:21'),
(11, 'pag-asa', 'pag-asa', 2, 'San Agustin, Pag-asa, Talavera, 3133 Nueva Ecija, Philippines', 15.58579810, 120.91671210, 'San Agustin', 'Pag-asa', 'Talavera', 'Nueva Ecija', 'suburb', 'populated_place', 'geoapify', 0, '2026-08-06 23:27:21', '2026-08-06 23:27:21', '2026-09-05 23:27:21'),
(12, 'pag-asa', 'pag-asa', 3, 'Pag-asa, Dinalupihan, 2110 Bataan, Philippines', 14.85062650, 120.41909260, 'Pag-asa', 'Pag-asa', 'Dinalupihan', 'Bataan', 'city', 'populated_place', 'geoapify', 0, '2026-08-06 23:27:21', '2026-08-06 23:27:21', '2026-09-05 23:27:21'),
(13, 'pag-asa', 'pag-asa', 4, 'Pag-asa, Orani, 2112 Bataan, Philippines', 14.76909190, 120.45236080, 'Pag-asa', 'Pag-asa', 'Orani', 'Bataan', 'city', 'populated_place', 'geoapify', 0, '2026-08-06 23:27:21', '2026-08-06 23:27:21', '2026-09-05 23:27:21'),
(14, 'pag-asa', 'pag-asa', 5, 'Pag-asa, Bagac, 2107 Bataan, Philippines', 14.59337980, 120.38938660, 'Pag-asa', 'Pag-asa', 'Bagac', 'Bataan', 'city', 'populated_place', 'geoapify', 0, '2026-08-06 23:27:21', '2026-08-06 23:27:21', '2026-09-05 23:27:21'),
(15, 'palamis', 'palamis', 1, 'Palamis, Alaminos, 2404 Pangasinan, Philippines', 16.15039730, 119.97820260, 'Palamis', 'Palamis', 'Alaminos', 'Pangasinan', 'suburb', 'administrative', 'geoapify', 0, '2026-08-06 23:27:28', '2026-08-06 23:27:28', '2026-09-05 23:27:28'),
(16, 'pandayan', 'pandayan', 1, 'Pandayan Book Store, Quezon Avenue, Alaminos, 2404 Pangasinan, Philippines', 16.15568770, 119.98078140, 'Quezon Avenue', 'Poblacion', 'Alaminos', 'Pangasinan', 'amenity', 'commercial.books', 'geoapify', 0, '2026-08-06 23:28:01', '2026-08-06 23:28:01', '2026-09-05 23:28:01'),
(17, 'pandayan', 'pandayan', 2, 'Pandayan Road, Alaminos, 2404 Pangasinan, Philippines', 16.15383890, 119.98477310, 'Pandayan Road', 'Poblacion', 'Alaminos', 'Pangasinan', 'street', '', 'geoapify', 0, '2026-08-06 23:28:01', '2026-08-06 23:28:01', '2026-09-05 23:28:01'),
(18, 'pandayan', 'pandayan', 3, 'Pandayan, Meycauayan, Bulacan, Philippines', 14.74965770, 120.96567950, 'Pandayan', 'Pandayan', 'Meycauayan', 'Bulacan', 'suburb', 'administrative', 'geoapify', 0, '2026-08-06 23:28:01', '2026-08-06 23:28:01', '2026-09-05 23:28:01'),
(19, 'poblacion, alaminos, pangasinan', 'Poblacion, Alaminos, Pangasinan', 1, 'Poblacion, Alaminos, Pangasinan, Philippines', 16.16119960, 119.98243780, 'Poblacion', 'Poblacion', 'Alaminos', 'Pangasinan', 'suburb', 'administrative', 'geoapify', 3, '2026-08-06 23:35:19', '2026-08-06 23:41:17', '2026-09-05 23:35:19'),
(20, 'magsaysay', 'Magsaysay', 1, 'Magsaysay, Labrador, Pangasinan, Philippines', 16.00369270, 120.16271370, 'Magsaysay', 'Magsaysay', 'Labrador', 'Pangasinan', 'city', 'populated_place', 'geoapify', 0, '2026-08-06 23:37:39', '2026-08-06 23:37:39', '2026-09-05 23:37:39'),
(21, 'magsaysay', 'Magsaysay', 2, 'Magsaysay, Pangasinan, Philippines', 16.07194970, 120.43070470, 'Magsaysay', '', 'Magsaysay', 'Pangasinan', 'city', 'populated_place', 'geoapify', 0, '2026-08-06 23:37:39', '2026-08-06 23:37:39', '2026-09-05 23:37:39'),
(22, 'magsaysay', 'Magsaysay', 3, 'Magsaysay, Tubao, La Union, Philippines', 16.34636300, 120.42664920, 'Magsaysay', 'Magsaysay', 'Tubao', 'La Union', 'city', 'populated_place', 'geoapify', 0, '2026-08-06 23:37:39', '2026-08-06 23:37:39', '2026-09-05 23:37:39'),
(23, 'magsaysay', 'Magsaysay', 4, 'Magsaysay, Aliaga, Nueva Ecija, Philippines', 15.48676140, 120.81956290, 'Magsaysay', 'Magsaysay', 'Aliaga', 'Nueva Ecija', 'city', 'populated_place', 'geoapify', 0, '2026-08-06 23:37:39', '2026-08-06 23:37:39', '2026-09-05 23:37:39'),
(24, 'magsaysay', 'Magsaysay', 5, 'Magsaysay, Isabela, Philippines', 16.94124580, 121.65284510, 'Magsaysay', '', 'Magsaysay', 'Isabela', 'city', 'populated_place', 'geoapify', 0, '2026-08-06 23:37:39', '2026-08-06 23:37:39', '2026-09-05 23:37:39'),
(25, 'bued', 'Bued', 1, 'Bued, Alaminos, Pangasinan, Philippines', 16.16495470, 119.99531040, 'Bued', 'Bued', 'Alaminos', 'Pangasinan', 'city', 'administrative', 'geoapify', 0, '2026-08-06 23:38:35', '2026-08-06 23:38:35', '2026-09-05 23:38:35'),
(26, 'bued', 'Bued', 2, 'Bued, Calasiao, Pangasinan, Philippines', 16.01689840, 120.38478920, 'Bued', 'Bued', 'Calasiao', 'Pangasinan', 'city', 'administrative', 'geoapify', 0, '2026-08-06 23:38:35', '2026-08-06 23:38:35', '2026-09-05 23:38:35'),
(27, 'bued', 'Bued', 3, 'Bued, Zone 6, Binalonan, Pangasinan, Philippines', 16.04063730, 120.58987910, 'Bued', 'Bued', 'Binalonan', 'Pangasinan', 'suburb', 'populated_place', 'geoapify', 0, '2026-08-06 23:38:35', '2026-08-06 23:38:35', '2026-09-05 23:38:35'),
(28, 'bued', 'Bued', 4, 'Bued, Cuyapo, Nueva Ecija, Philippines', 15.82416220, 120.65794940, 'Bued', 'Bued', 'Cuyapo', 'Nueva Ecija', 'city', 'populated_place', 'geoapify', 0, '2026-08-06 23:38:35', '2026-08-06 23:38:35', '2026-09-05 23:38:35'),
(29, 'poblacion, alaminos', 'Poblacion, alaminos', 1, 'Poblacion, Alaminos, Pangasinan, Philippines', 16.16119960, 119.98243780, 'Poblacion', 'Poblacion', 'Alaminos', 'Pangasinan', 'suburb', 'administrative', 'geoapify', 0, '2026-08-06 23:43:39', '2026-08-06 23:43:39', '2026-09-05 23:43:39'),
(30, 'poblacion, alaminos', 'Poblacion, alaminos', 2, 'Alaminos River, Poblacion, Alaminos, 2404 Pangasinan, Philippines', 16.15664780, 119.96731680, 'Alaminos River', 'Poblacion', 'Alaminos', 'Pangasinan', 'amenity', '', 'geoapify', 0, '2026-08-06 23:43:39', '2026-08-06 23:43:39', '2026-09-05 23:43:39');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_admin_login_attempts`
--

CREATE TABLE `tbl_admin_login_attempts` (
  `attempt_id` bigint(20) UNSIGNED NOT NULL,
  `identifier_hash` char(64) NOT NULL,
  `ip_address` varchar(45) NOT NULL,
  `attempt_type` enum('access_code','credentials') NOT NULL,
  `was_successful` tinyint(1) NOT NULL DEFAULT 0,
  `attempted_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_admin_login_attempts`
--

INSERT INTO `tbl_admin_login_attempts` (`attempt_id`, `identifier_hash`, `ip_address`, `attempt_type`, `was_successful`, `attempted_at`) VALUES
(120, '0af39001c6916dda7c5d5f1fd906b2b414721562bbafc936aec693723c0af177', '175.176.15.167', 'access_code', 0, '2026-09-11 23:43:17'),
(121, '0af39001c6916dda7c5d5f1fd906b2b414721562bbafc936aec693723c0af177', '175.176.15.167', 'access_code', 1, '2026-09-11 23:43:24'),
(107, '2e7819e8f16e6a588ef745d1229cac6ac92d459be3a0cf1166f5c3c9297b8803', '110.54.199.200', 'credentials', 1, '2026-09-10 02:55:42'),
(122, '2e7819e8f16e6a588ef745d1229cac6ac92d459be3a0cf1166f5c3c9297b8803', '175.176.15.167', 'credentials', 1, '2026-09-11 23:43:45'),
(118, '2e7819e8f16e6a588ef745d1229cac6ac92d459be3a0cf1166f5c3c9297b8803', '216.247.89.143', 'credentials', 0, '2026-09-11 05:06:56'),
(119, '2e7819e8f16e6a588ef745d1229cac6ac92d459be3a0cf1166f5c3c9297b8803', '216.247.89.143', 'credentials', 1, '2026-09-11 05:07:14'),
(109, '2e7819e8f16e6a588ef745d1229cac6ac92d459be3a0cf1166f5c3c9297b8803', '216.247.89.229', 'credentials', 1, '2026-09-11 02:37:53'),
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
(59, '2e7819e8f16e6a588ef745d1229cac6ac92d459be3a0cf1166f5c3c9297b8803', '::1', 'credentials', 1, '2026-08-10 15:33:25'),
(61, '2e7819e8f16e6a588ef745d1229cac6ac92d459be3a0cf1166f5c3c9297b8803', '::1', 'credentials', 1, '2026-08-10 16:00:45'),
(63, '2e7819e8f16e6a588ef745d1229cac6ac92d459be3a0cf1166f5c3c9297b8803', '::1', 'credentials', 1, '2026-08-10 16:02:05'),
(67, '2e7819e8f16e6a588ef745d1229cac6ac92d459be3a0cf1166f5c3c9297b8803', '::1', 'credentials', 1, '2026-08-14 16:35:35'),
(69, '2e7819e8f16e6a588ef745d1229cac6ac92d459be3a0cf1166f5c3c9297b8803', '::1', 'credentials', 1, '2026-08-17 08:22:18'),
(71, '2e7819e8f16e6a588ef745d1229cac6ac92d459be3a0cf1166f5c3c9297b8803', '::1', 'credentials', 1, '2026-08-18 03:22:03'),
(75, '2e7819e8f16e6a588ef745d1229cac6ac92d459be3a0cf1166f5c3c9297b8803', '::1', 'credentials', 1, '2026-08-19 08:19:29'),
(84, '2e7819e8f16e6a588ef745d1229cac6ac92d459be3a0cf1166f5c3c9297b8803', '::1', 'credentials', 1, '2026-08-19 16:08:51'),
(86, '2e7819e8f16e6a588ef745d1229cac6ac92d459be3a0cf1166f5c3c9297b8803', '::1', 'credentials', 1, '2026-08-20 05:55:15'),
(88, '2e7819e8f16e6a588ef745d1229cac6ac92d459be3a0cf1166f5c3c9297b8803', '::1', 'credentials', 1, '2026-08-20 07:27:52'),
(90, '2e7819e8f16e6a588ef745d1229cac6ac92d459be3a0cf1166f5c3c9297b8803', '::1', 'credentials', 1, '2026-08-25 12:51:14'),
(92, '2e7819e8f16e6a588ef745d1229cac6ac92d459be3a0cf1166f5c3c9297b8803', '::1', 'credentials', 1, '2026-08-25 13:56:19'),
(94, '2e7819e8f16e6a588ef745d1229cac6ac92d459be3a0cf1166f5c3c9297b8803', '::1', 'credentials', 1, '2026-08-27 15:06:07'),
(96, '2e7819e8f16e6a588ef745d1229cac6ac92d459be3a0cf1166f5c3c9297b8803', '::1', 'credentials', 1, '2026-08-28 14:48:26'),
(98, '2e7819e8f16e6a588ef745d1229cac6ac92d459be3a0cf1166f5c3c9297b8803', '::1', 'credentials', 1, '2026-08-29 12:15:52'),
(101, '2e7819e8f16e6a588ef745d1229cac6ac92d459be3a0cf1166f5c3c9297b8803', '::1', 'credentials', 1, '2026-08-29 12:25:09'),
(104, '2e7819e8f16e6a588ef745d1229cac6ac92d459be3a0cf1166f5c3c9297b8803', '::1', 'credentials', 1, '2026-09-02 10:50:14'),
(110, '410a4d533a2a55a518c1fc846c0f5878376c969fbddd5f87673bbb1be50c356d', '216.247.89.143', 'access_code', 0, '2026-09-11 04:45:21'),
(111, '410a4d533a2a55a518c1fc846c0f5878376c969fbddd5f87673bbb1be50c356d', '216.247.89.143', 'access_code', 0, '2026-09-11 04:45:27'),
(112, '410a4d533a2a55a518c1fc846c0f5878376c969fbddd5f87673bbb1be50c356d', '216.247.89.143', 'access_code', 0, '2026-09-11 04:45:38'),
(113, '410a4d533a2a55a518c1fc846c0f5878376c969fbddd5f87673bbb1be50c356d', '216.247.89.143', 'access_code', 0, '2026-09-11 04:46:34'),
(114, '410a4d533a2a55a518c1fc846c0f5878376c969fbddd5f87673bbb1be50c356d', '216.247.89.143', 'access_code', 0, '2026-09-11 04:46:51'),
(115, '410a4d533a2a55a518c1fc846c0f5878376c969fbddd5f87673bbb1be50c356d', '216.247.89.143', 'access_code', 0, '2026-09-11 05:02:37'),
(116, '410a4d533a2a55a518c1fc846c0f5878376c969fbddd5f87673bbb1be50c356d', '216.247.89.143', 'access_code', 0, '2026-09-11 05:03:27'),
(117, '410a4d533a2a55a518c1fc846c0f5878376c969fbddd5f87673bbb1be50c356d', '216.247.89.143', 'access_code', 1, '2026-09-11 05:05:47'),
(108, '7473dd5377c1b8a0411db9599a2f2d0202bcf1149cf66fc7e3530189a6b4c3ae', '216.247.89.229', 'access_code', 1, '2026-09-11 02:36:04'),
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
(57, 'ab6e5a226aa6481e21c3a5929519d69b58a20d958a5d65c825d6d47ddeba46c0', '::1', 'access_code', 0, '2026-08-10 15:33:04'),
(64, 'ab6e5a226aa6481e21c3a5929519d69b58a20d958a5d65c825d6d47ddeba46c0', '::1', 'access_code', 0, '2026-08-14 16:34:49'),
(65, 'ab6e5a226aa6481e21c3a5929519d69b58a20d958a5d65c825d6d47ddeba46c0', '::1', 'access_code', 0, '2026-08-14 16:34:55'),
(72, 'ab6e5a226aa6481e21c3a5929519d69b58a20d958a5d65c825d6d47ddeba46c0', '::1', 'access_code', 0, '2026-08-19 08:18:41'),
(99, 'ab6e5a226aa6481e21c3a5929519d69b58a20d958a5d65c825d6d47ddeba46c0', '::1', 'access_code', 0, '2026-08-29 12:24:51'),
(102, 'ab6e5a226aa6481e21c3a5929519d69b58a20d958a5d65c825d6d47ddeba46c0', '::1', 'access_code', 0, '2026-09-02 10:49:50'),
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
(55, 'ab6e5a226aa6481e21c3a5929519d69b58a20d958a5d65c825d6d47ddeba46c0', '::1', 'access_code', 1, '2026-08-02 13:06:00'),
(58, 'ab6e5a226aa6481e21c3a5929519d69b58a20d958a5d65c825d6d47ddeba46c0', '::1', 'access_code', 1, '2026-08-10 15:33:13'),
(60, 'ab6e5a226aa6481e21c3a5929519d69b58a20d958a5d65c825d6d47ddeba46c0', '::1', 'access_code', 1, '2026-08-10 16:00:34'),
(62, 'ab6e5a226aa6481e21c3a5929519d69b58a20d958a5d65c825d6d47ddeba46c0', '::1', 'access_code', 1, '2026-08-10 16:02:01'),
(66, 'ab6e5a226aa6481e21c3a5929519d69b58a20d958a5d65c825d6d47ddeba46c0', '::1', 'access_code', 1, '2026-08-14 16:35:18'),
(68, 'ab6e5a226aa6481e21c3a5929519d69b58a20d958a5d65c825d6d47ddeba46c0', '::1', 'access_code', 1, '2026-08-17 08:22:09'),
(70, 'ab6e5a226aa6481e21c3a5929519d69b58a20d958a5d65c825d6d47ddeba46c0', '::1', 'access_code', 1, '2026-08-18 03:21:51'),
(73, 'ab6e5a226aa6481e21c3a5929519d69b58a20d958a5d65c825d6d47ddeba46c0', '::1', 'access_code', 1, '2026-08-19 08:18:58'),
(74, 'ab6e5a226aa6481e21c3a5929519d69b58a20d958a5d65c825d6d47ddeba46c0', '::1', 'access_code', 1, '2026-08-19 08:19:16'),
(76, 'ab6e5a226aa6481e21c3a5929519d69b58a20d958a5d65c825d6d47ddeba46c0', '::1', 'access_code', 1, '2026-08-19 15:02:37'),
(77, 'ab6e5a226aa6481e21c3a5929519d69b58a20d958a5d65c825d6d47ddeba46c0', '::1', 'access_code', 1, '2026-08-19 15:14:27'),
(78, 'ab6e5a226aa6481e21c3a5929519d69b58a20d958a5d65c825d6d47ddeba46c0', '::1', 'access_code', 1, '2026-08-19 15:14:36'),
(79, 'ab6e5a226aa6481e21c3a5929519d69b58a20d958a5d65c825d6d47ddeba46c0', '::1', 'access_code', 1, '2026-08-19 15:15:06'),
(80, 'ab6e5a226aa6481e21c3a5929519d69b58a20d958a5d65c825d6d47ddeba46c0', '::1', 'access_code', 1, '2026-08-19 15:21:34'),
(81, 'ab6e5a226aa6481e21c3a5929519d69b58a20d958a5d65c825d6d47ddeba46c0', '::1', 'access_code', 1, '2026-08-19 15:22:43'),
(82, 'ab6e5a226aa6481e21c3a5929519d69b58a20d958a5d65c825d6d47ddeba46c0', '::1', 'access_code', 1, '2026-08-19 15:26:05'),
(83, 'ab6e5a226aa6481e21c3a5929519d69b58a20d958a5d65c825d6d47ddeba46c0', '::1', 'access_code', 1, '2026-08-19 16:08:48'),
(85, 'ab6e5a226aa6481e21c3a5929519d69b58a20d958a5d65c825d6d47ddeba46c0', '::1', 'access_code', 1, '2026-08-20 05:55:04'),
(87, 'ab6e5a226aa6481e21c3a5929519d69b58a20d958a5d65c825d6d47ddeba46c0', '::1', 'access_code', 1, '2026-08-20 07:27:30'),
(89, 'ab6e5a226aa6481e21c3a5929519d69b58a20d958a5d65c825d6d47ddeba46c0', '::1', 'access_code', 1, '2026-08-25 12:51:04'),
(91, 'ab6e5a226aa6481e21c3a5929519d69b58a20d958a5d65c825d6d47ddeba46c0', '::1', 'access_code', 1, '2026-08-25 13:56:10'),
(93, 'ab6e5a226aa6481e21c3a5929519d69b58a20d958a5d65c825d6d47ddeba46c0', '::1', 'access_code', 1, '2026-08-27 15:05:53'),
(95, 'ab6e5a226aa6481e21c3a5929519d69b58a20d958a5d65c825d6d47ddeba46c0', '::1', 'access_code', 1, '2026-08-28 14:48:04'),
(97, 'ab6e5a226aa6481e21c3a5929519d69b58a20d958a5d65c825d6d47ddeba46c0', '::1', 'access_code', 1, '2026-08-29 12:15:40'),
(100, 'ab6e5a226aa6481e21c3a5929519d69b58a20d958a5d65c825d6d47ddeba46c0', '::1', 'access_code', 1, '2026-08-29 12:24:58'),
(103, 'ab6e5a226aa6481e21c3a5929519d69b58a20d958a5d65c825d6d47ddeba46c0', '::1', 'access_code', 1, '2026-09-02 10:49:56'),
(105, 'e0b7b8787af640f3eb2e413c70a0b0ae30bf78cc8454649fd4bd78b661fece87', '110.54.199.200', 'access_code', 0, '2026-09-10 02:52:58'),
(106, 'e0b7b8787af640f3eb2e413c70a0b0ae30bf78cc8454649fd4bd78b661fece87', '110.54.199.200', 'access_code', 1, '2026-09-10 02:54:16');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_cart`
--

CREATE TABLE `tbl_cart` (
  `cart_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `restaurant_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `addon_ids_json` varchar(255) DEFAULT NULL,
  `combo_choice_ids_json` longtext DEFAULT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `price_at_time` decimal(10,2) NOT NULL DEFAULT 0.00,
  `subtotal` decimal(10,2) NOT NULL DEFAULT 0.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
  `is_active` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_combo_choice_groups`
--

CREATE TABLE `tbl_combo_choice_groups` (
  `choice_group_id` int(11) NOT NULL,
  `combo_id` int(11) NOT NULL,
  `group_name` varchar(100) NOT NULL,
  `min_select` int(11) NOT NULL DEFAULT 1,
  `max_select` int(11) NOT NULL DEFAULT 1,
  `is_required` tinyint(1) NOT NULL DEFAULT 1,
  `is_active` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_combo_choice_options`
--

CREATE TABLE `tbl_combo_choice_options` (
  `choice_option_id` int(11) NOT NULL,
  `choice_group_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `price_adjustment` decimal(10,2) NOT NULL DEFAULT 0.00,
  `is_active` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_combo_items`
--

CREATE TABLE `tbl_combo_items` (
  `combo_item_id` int(11) NOT NULL,
  `combo_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_delivery_assignments`
--

CREATE TABLE `tbl_delivery_assignments` (
  `assignment_id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `restaurant_id` int(11) NOT NULL,
  `delivery_staff_id` int(11) DEFAULT NULL,
  `assigned_by_user_id` int(11) NOT NULL,
  `assignment_type` enum('internal','external') NOT NULL DEFAULT 'internal',
  `delivery_status` enum('requested','assigned','accepted','picked_up','out_for_delivery','completed','cancelled') NOT NULL DEFAULT 'requested',
  `delivery_fee` decimal(10,2) NOT NULL DEFAULT 0.00,
  `delivery_staff_payment` decimal(10,2) NOT NULL DEFAULT 0.00,
  `assigned_at` datetime DEFAULT NULL,
  `accepted_at` datetime DEFAULT NULL,
  `picked_up_at` datetime DEFAULT NULL,
  `out_for_delivery_at` datetime DEFAULT NULL,
  `completed_at` datetime DEFAULT NULL,
  `cancelled_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tbl_delivery_assignments`
--

INSERT INTO `tbl_delivery_assignments` (`assignment_id`, `order_id`, `restaurant_id`, `delivery_staff_id`, `assigned_by_user_id`, `assignment_type`, `delivery_status`, `delivery_fee`, `delivery_staff_payment`, `assigned_at`, `accepted_at`, `picked_up_at`, `out_for_delivery_at`, `completed_at`, `cancelled_at`, `created_at`, `updated_at`) VALUES
(5, 41, 6, 33, 34, 'internal', 'out_for_delivery', 50.00, 0.00, '2026-08-26 10:10:09', '2026-08-26 10:10:09', '2026-08-26 10:13:06', '2026-08-26 10:14:02', NULL, NULL, '2026-08-26 10:10:09', '2026-08-26 10:14:02'),
(6, 46, 6, 35, 34, 'internal', 'completed', 50.00, 0.00, '2026-09-04 19:13:41', '2026-09-04 19:13:41', '2026-09-04 19:14:41', '2026-09-04 19:14:50', '2026-09-04 19:15:15', NULL, '2026-09-04 11:13:41', '2026-09-04 11:15:15'),
(7, 48, 6, 35, 34, 'internal', 'completed', 50.00, 0.00, '2026-09-04 19:35:27', '2026-09-04 19:35:27', '2026-09-04 19:36:19', '2026-09-04 19:36:39', '2026-09-04 19:36:52', NULL, '2026-09-04 11:35:27', '2026-09-04 11:36:52'),
(8, 50, 6, 35, 34, 'internal', 'completed', 50.00, 0.00, '2026-09-07 21:13:50', '2026-09-07 21:13:50', '2026-09-07 21:15:24', '2026-09-07 21:15:41', '2026-09-07 21:16:51', NULL, '2026-09-07 13:13:50', '2026-09-07 13:16:51'),
(9, 51, 6, 35, 34, 'internal', 'completed', 50.00, 0.00, '2026-09-07 23:04:40', '2026-09-07 23:04:40', '2026-09-07 23:05:31', '2026-09-07 23:05:46', '2026-09-07 23:08:38', NULL, '2026-09-07 15:04:40', '2026-09-07 15:08:38'),
(10, 52, 6, 35, 34, 'internal', 'completed', 70.00, 0.00, '2026-09-08 23:58:44', '2026-09-08 23:58:44', '2026-09-08 23:59:42', '2026-09-08 23:59:48', '2026-09-09 00:02:28', NULL, '2026-09-08 15:58:44', '2026-09-08 16:02:28'),
(11, 64, 6, 35, 34, 'internal', 'completed', 70.00, 0.00, '2026-09-11 12:22:20', '2026-09-11 12:22:20', '2026-09-11 12:23:20', '2026-09-11 12:23:33', '2026-09-11 12:23:48', NULL, '2026-09-11 04:22:20', '2026-09-11 04:23:48');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_notification_reads`
--

CREATE TABLE `tbl_notification_reads` (
  `notification_read_id` int(11) NOT NULL,
  `log_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `restaurant_id` int(11) NOT NULL,
  `read_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_notification_reads`
--

INSERT INTO `tbl_notification_reads` (`notification_read_id`, `log_id`, `user_id`, `restaurant_id`, `read_at`) VALUES
(71, 742, 34, 6, '2026-08-26 09:59:38'),
(84, 743, 34, 6, '2026-09-03 01:20:41'),
(85, 774, 34, 6, '2026-09-03 01:20:45'),
(86, 810, 34, 6, '2026-09-07 23:10:05'),
(87, 804, 34, 6, '2026-09-07 23:10:09'),
(88, 775, 34, 6, '2026-09-09 00:17:07'),
(89, 779, 34, 6, '2026-09-09 00:17:08'),
(90, 784, 34, 6, '2026-09-09 00:17:10'),
(91, 785, 34, 6, '2026-09-09 00:17:11'),
(92, 792, 34, 6, '2026-09-09 00:17:14'),
(93, 795, 34, 6, '2026-09-09 00:17:16'),
(94, 801, 34, 6, '2026-09-09 00:17:16'),
(95, 821, 34, 6, '2026-09-09 00:17:16');

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
  `subtotal` decimal(10,2) NOT NULL DEFAULT 0.00,
  `delivery_fee` decimal(10,2) NOT NULL DEFAULT 0.00,
  `payment_method` varchar(50) DEFAULT NULL,
  `payment_status` enum('cash_pending','pending','paid','failed','cancelled','refunded') NOT NULL DEFAULT 'cash_pending',
  `address` text DEFAULT NULL,
  `landmark` varchar(255) DEFAULT NULL,
  `customer_latitude` decimal(10,8) DEFAULT NULL,
  `customer_longitude` decimal(11,8) DEFAULT NULL,
  `table_number` varchar(50) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `tbl_orders`
--

INSERT INTO `tbl_orders` (`order_id`, `order_qr_token`, `qr_verified_at`, `qr_expires_at`, `queue_number`, `restaurant_id`, `processed_by_cashier_id`, `user_id`, `customer_name`, `contact_number`, `order_type`, `order_status`, `cancellation_reason`, `cancelled_by`, `cancelled_at`, `total_amount`, `subtotal`, `delivery_fee`, `payment_method`, `payment_status`, `address`, `landmark`, `customer_latitude`, `customer_longitude`, `table_number`, `notes`, `created_at`) VALUES
(40, '717953397eab177c9ba778c959cf8a1407295b21cd86a83da9b544b8cb1bc8af', NULL, '2026-08-26 18:14:41', 1, 6, NULL, 12, 'Angel Recepcion', '+639123456789', 'takeout', 'pending', NULL, NULL, NULL, 365.00, 365.00, 0.00, 'Cash', 'cash_pending', '', '', NULL, NULL, '', '', '2026-08-26 09:54:40'),
(41, '4b742445377c0c686d4b5fb55b9917be1ccb0e4ff67ea0dc1efba08648ea8e9d', NULL, NULL, 2, 6, 34, 12, 'Order #1', '+639123445465', 'delivery', 'out_for_delivery', NULL, NULL, NULL, 515.00, 465.00, 50.00, 'Cash on Delivery', 'cash_pending', 'Poblacion, City of Alaminos, Pangasinan, Philippines', '', 16.15812604, 119.98010279, '', 'basta', '2026-08-26 10:06:11'),
(42, '6997610fe4118be1f8a6f8aba1d0e7d5c9670a79afca4e2f72c9b8bf03f79f3c', NULL, '2026-09-03 13:35:36', 1, 6, NULL, 12, 'test', '+639213232432', 'takeout', 'pending', NULL, NULL, NULL, 485.00, 485.00, 0.00, 'Cash', 'cash_pending', '', '', NULL, NULL, '', 'xjchdj', '2026-09-03 05:15:36'),
(43, '9f48f775a036889da17551f068531eb2a4688a735280be351309b1ba64658995', NULL, '2026-09-03 13:42:36', 2, 6, NULL, 12, 'tr', '+639876543432', 'takeout', 'pending', NULL, NULL, NULL, 170.00, 170.00, 0.00, 'Cash', 'cash_pending', '', '', NULL, NULL, '', 'hjbhjg', '2026-09-03 05:22:36'),
(44, 'dc34e3c7b139773a70727922faea720d64f61671096e671ab6f80bfd9fea0461', '2026-09-04 18:52:51', '2026-09-04 19:12:41', 1, 6, 34, 12, 'Angel #1', '+639123324354', 'takeout', 'completed', NULL, NULL, NULL, 250.00, 250.00, 0.00, 'Cash', 'paid', '', '', NULL, NULL, '', '', '2026-09-04 10:52:41'),
(45, 'e62afc9b677e7b03275117b16e1edf31109c5b232fee0e959f4b6d3d422c5043', NULL, NULL, 2, 6, 34, 12, 'Angel #2', '+639732763244', 'delivery', 'cancelled', 'Unable to prepare the order', 'cashier', '2026-09-04 19:13:11', 579.00, 529.00, 50.00, 'Cash on Delivery', 'cash_pending', 'Eme lang ito, Landoc, City of Alaminos, Pangasinan, Philippines', '', 16.17149100, 119.94531892, '', '', '2026-09-04 11:07:17'),
(46, '7b782dec05642ae15edba4a5c460f81e02437ee8f4728b11d8039b04c1acacad', NULL, NULL, 3, 6, 34, 12, 'Angel #3', '+639734637254', 'delivery', 'completed', NULL, NULL, NULL, 939.00, 889.00, 50.00, 'Cash on Delivery', 'paid', 'Andito ako eh, Landoc, City of Alaminos, Pangasinan, Philippines', '', 16.17142048, 119.94531924, '', '', '2026-09-04 11:11:33'),
(47, '195607c03e545cf4c063a8460411cb02cf76bb7dccb19684a2092a0f620013a3', '2026-09-04 19:21:25', '2026-09-04 19:40:42', 4, 6, 34, 12, 'Angel #4', '+639238782647', 'dine-in', 'completed', NULL, NULL, NULL, 175.00, 175.00, 0.00, 'Cash', 'paid', '', '', NULL, NULL, '', '', '2026-09-04 11:20:42'),
(48, '06e0a610540b65faeae4e262adcb375222dc1d422b7e0ba5fc090c6e7dde75d6', NULL, NULL, 5, 6, 34, 12, '#5', '+639555555555', 'delivery', 'completed', NULL, NULL, NULL, 329.00, 279.00, 50.00, 'Cash on Delivery', 'paid', 'hxggsc, Landoc, City of Alaminos, Pangasinan, Philippines', '', 16.17150047, 119.94530302, '', '', '2026-09-04 11:32:59'),
(49, '50f12aa10415b5509608c5ef696858b765c77d1250cbf4edd015741cdd312ffa', '2026-09-07 20:22:21', '2026-09-07 20:41:29', 1, 6, 34, 12, 'Angel Test', '+639783672546', 'takeout', 'completed', NULL, NULL, NULL, 239.00, 239.00, 0.00, 'PayMongo QR Ph', 'paid', '', '', NULL, NULL, '', '', '2026-09-07 12:21:29'),
(50, 'eaf84c5fbd33a65e7c8f6c0ecf33cdab420e088df6f5023809cb1713f9e165bb', NULL, NULL, 2, 6, 34, 12, 'Angel (Sept. 07 #2)', '+639123456797', 'delivery', 'completed', NULL, NULL, NULL, 310.00, 260.00, 50.00, 'PayMongo QR Ph', 'paid', 'dito lang, Landoc, City of Alaminos, Pangasinan, Philippines', '', 16.17143484, 119.94532878, '', '', '2026-09-07 13:11:09'),
(51, 'dcb5abd414ceca6552f18ba307a211dec4174d6c0833619fc65bc43013f0a634', NULL, NULL, 3, 6, 34, 12, 'Delivery Angel (#1)', '+639123455367', 'delivery', 'completed', NULL, NULL, NULL, 400.00, 350.00, 50.00, 'Cash on Delivery', 'paid', '123, Landoc, City of Alaminos, Pangasinan, Philippines', '', 16.17145422, 119.94525733, '', '', '2026-09-07 15:00:15'),
(52, 'a8609478a6481176786e9bf6ba15f7f073ebc92cd218775e60b1c7586f2f36bb', NULL, NULL, 1, 6, 34, 12, 'Gel', '+639123454697', 'delivery', 'completed', NULL, NULL, NULL, 160.00, 90.00, 70.00, 'Cash on Delivery', 'paid', 'Greenville West Subdvision, Landoc, City of Alaminos, Pangasinan, Philippines', '', 16.17152230, 119.94541940, '', '', '2026-09-08 15:57:40'),
(53, '1fb5a43cf790ca902d04903ef05ab1f2c7c5b4d1f5e7ed89539412d8677258ca', NULL, NULL, 1, 6, NULL, 12, 'Sept 09', '+639516164131', 'delivery', 'pending', NULL, NULL, NULL, 140.00, 70.00, 70.00, 'PayMongo QR Ph', 'pending', 'Landoc, City of Alaminos, Pangasinan, Philippines', '', 16.17152230, 119.94542280, '', '', '2026-09-08 16:23:16'),
(54, '7b1a14fd35da7211a3fe448d23e231cf89213f82341b9da1836ff55c72ae4382', NULL, NULL, 2, 6, NULL, 37, 'Micah Romasoc', '+639164279382', 'delivery', 'pending', NULL, NULL, NULL, 310.00, 230.00, 80.00, 'Cash on Delivery', 'cash_pending', 'Olongapo-Bugallon Road, Alos, City of Alaminos, Pangasinan, Philippines', 'Vinz Car Care', 16.10825115, 119.96667100, '', 'may plantbox sa harap ng bahay namin', '2026-09-09 15:54:24'),
(55, 'c87a5e0c28ced76112e3e8d9d8775e3c9ff2276913cf5423b5cb1d8f6c5df240', NULL, NULL, 3, 6, NULL, 37, 'Micah Romasoc', '+639164279382', 'delivery', 'pending', NULL, NULL, NULL, 175.00, 95.00, 80.00, 'Cash on Delivery', 'cash_pending', 'Olongapo-Bugallon Road, Alos, City of Alaminos, Pangasinan, Philippines', 'Vinz Car Care', 16.10825115, 119.96667100, '', 'dgethrymjnymk', '2026-09-09 15:57:36'),
(56, '29dd6f614474de6cf7dc8793a768e9dc1b0a55c3321d95335eaf758d502d2ad9', '2026-09-11 10:30:42', '2026-09-11 10:46:44', 1, 6, 34, 12, 'kjjhgyu', '+639988755444', 'takeout', 'completed', NULL, NULL, NULL, 169.00, 169.00, 0.00, 'Cash', 'paid', '', '', NULL, NULL, '', '', '2026-09-11 02:26:44'),
(57, 'dbd4937ba4dec65c0e19d7dd72d63ebe896d3ef6cf591b4f89553cdcb9f3db92', NULL, NULL, 1, 10, NULL, 12, 'hahaha', '+639457309228', 'delivery', 'cancelled', 'Incorrect order details', 'customer', '2026-09-11 10:51:48', 114.00, 54.00, 60.00, 'Cash on Delivery', 'cash_pending', 'E. Quintos Street, Poblacion, City of Alaminos, Pangasinan, Philippines', '', 16.15646710, 119.97933070, '', '', '2026-09-11 02:49:39'),
(58, '880b2ea6def875167adf17fe729249785fcffed6fc68587001d4126a77551a99', NULL, '2026-09-11 11:12:57', 2, 10, NULL, 12, 'hatog', '+639457309228', 'dine-in', 'pending', NULL, NULL, NULL, 54.00, 54.00, 0.00, 'Cash', 'cash_pending', '', '', NULL, NULL, '', '', '2026-09-11 02:52:57'),
(59, '55cbd73a36072fbfdb9284eadbd4a8c7f270a080042972a16b579b7c22c08fa2', NULL, '2026-09-11 11:14:04', 3, 10, NULL, 12, 'cege', '+639457309228', 'dine-in', 'pending', NULL, NULL, NULL, 54.00, 54.00, 0.00, 'Cash', 'cash_pending', '', '', NULL, NULL, '', '', '2026-09-11 02:54:04'),
(60, '44cd26fe4e7cc223c0010206486fef0faec1e3e66463f9104c0f02ff10c3c779', '2026-09-11 11:21:53', '2026-09-11 11:41:41', 4, 10, 42, 12, 'hatdig', '+639457309228', 'dine-in', 'completed', NULL, NULL, NULL, 54.00, 54.00, 0.00, 'Cash', 'paid', '', '', NULL, NULL, '', '', '2026-09-11 03:21:41'),
(61, '56a1ff22e4554acbe152f999a959b4ec0af3e56de02dfa82137ec7e607bf34e9', '2026-09-11 12:12:28', '2026-09-11 12:29:29', 5, 10, 42, 46, 'ttyrt', '+639676666667', 'takeout', 'cancelled', 'Insufficient stock', 'cashier', '2026-09-11 12:12:56', 54.00, 54.00, 0.00, 'Cash', 'paid', '', '', NULL, NULL, '', '', '2026-09-11 04:09:29'),
(62, '2619af4346722d07d36c4f2d4c5c8ddc52ea1cf62cd2eeaf92d5210a97529701', '2026-09-11 12:13:28', '2026-09-11 12:33:24', 6, 10, NULL, 46, 'fyhth', '+639786756665', 'takeout', 'cancelled', 'Incorrect order details', 'customer', '2026-09-11 12:13:51', 54.00, 54.00, 0.00, 'Cash', 'paid', '', '', NULL, NULL, '', '', '2026-09-11 04:13:24'),
(63, '75711430f27214be6ab61aad33cbd98502b4a532ecf4103296da0cb054df09c4', '2026-09-11 12:14:29', '2026-09-11 12:34:23', 7, 10, 42, 46, '57tyyt', '+639767667666', 'takeout', 'completed', NULL, NULL, NULL, 54.00, 54.00, 0.00, 'Cash', 'paid', '', '', NULL, NULL, '', '', '2026-09-11 04:14:23'),
(64, 'd8fec16ffa6e78e86c8604e1234f59e39059ea04326c75f6a842ef74db045679', NULL, NULL, 2, 6, 34, 46, 'trtry', '+639786754474', 'delivery', 'completed', NULL, NULL, NULL, 344.00, 274.00, 70.00, 'Cash on Delivery', 'paid', 'M. Rabago Street, Poblacion, City of Alaminos, Pangasinan, Philippines', '', 16.15679700, 119.97946900, '', '', '2026-09-11 04:17:40'),
(65, 'f611c7c89acea88c4b1f33638f0be0746f9e622baa83c59e3d5df19d4d95217a', '2026-09-11 12:59:06', '2026-09-11 13:18:08', 3, 6, 34, 46, 'kugiuyyi', '+639777676666', 'dine-in', 'completed', NULL, NULL, NULL, 166.50, 166.50, 0.00, 'Cash', 'paid', '', '', NULL, NULL, '', '', '2026-09-11 04:58:08');

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
  `regular_price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `discount_type` enum('none','percentage','fixed') NOT NULL DEFAULT 'none',
  `discount_value` decimal(10,2) NOT NULL DEFAULT 0.00,
  `discount_savings` decimal(10,2) NOT NULL DEFAULT 0.00,
  `discount_applied` tinyint(1) NOT NULL DEFAULT 0,
  `product_name` varchar(150) DEFAULT NULL,
  `variant_text` varchar(150) DEFAULT NULL,
  `combo_choice_text` varchar(500) DEFAULT NULL,
  `combo_choice_ids_json` longtext DEFAULT NULL,
  `addon_text` varchar(150) DEFAULT NULL,
  `addon_ids_json` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `tbl_order_items`
--

INSERT INTO `tbl_order_items` (`order_item_id`, `order_id`, `product_id`, `combo_id`, `quantity`, `price`, `regular_price`, `discount_type`, `discount_value`, `discount_savings`, `discount_applied`, `product_name`, `variant_text`, `combo_choice_text`, `combo_choice_ids_json`, `addon_text`, `addon_ids_json`) VALUES
(45, 40, 26, NULL, 1, 105.00, 105.00, 'none', 0.00, 0.00, 0, 'Garlic Parmesan', 'Solo Meal', '', '[]', 'No Add-on', '[]'),
(46, 40, 125, NULL, 1, 260.00, 165.00, 'none', 0.00, 0.00, 0, 'Dirty Matcha Latte', 'Large', '', '[]', 'Matcha, Oatmik', '[220,221]'),
(47, 41, 42, NULL, 1, 130.00, 130.00, 'none', 0.00, 0.00, 0, 'Overload Fries', '', '', '[]', 'No Add-on', '[]'),
(48, 41, 55, NULL, 1, 90.00, 70.00, 'none', 0.00, 0.00, 0, 'Chicken Poppers', '', '', '[]', 'Plain Rice', '[214]'),
(49, 41, 114, NULL, 1, 245.00, 150.00, 'none', 0.00, 0.00, 0, 'Strawberry Matcha', 'Large', '', '[]', 'Matcha, Oatmik', '[220,221]'),
(50, 42, 142, NULL, 1, 215.00, 145.00, 'none', 0.00, 0.00, 0, 'Strawberry', 'Medium', '', '[]', 'Oatmik, Syrup', '[221,222]'),
(51, 42, 181, NULL, 1, 90.00, 90.00, 'none', 0.00, 0.00, 0, 'Lychee Yogurt', 'Medium', '', '[]', 'No Add-on', '[]'),
(52, 42, 183, NULL, 2, 90.00, 90.00, 'none', 0.00, 0.00, 0, 'Green Apple Yogurt', 'Medium', '', '[]', 'No Add-on', '[]'),
(53, 43, 33, NULL, 1, 170.00, 145.00, 'none', 0.00, 0.00, 0, 'Tapsilog', '', '', '[]', 'Fried Rice', '[215]'),
(54, 44, 55, NULL, 1, 70.00, 70.00, 'none', 0.00, 0.00, 0, 'Chicken Poppers', '', '', '[]', 'No Add-on', '[]'),
(55, 44, 147, NULL, 1, 180.00, 160.00, 'none', 0.00, 0.00, 0, 'Matcha', 'Large', '', '[]', 'Whip Cream', '[226]'),
(56, 45, 25, NULL, 1, 210.00, 210.00, 'none', 0.00, 0.00, 0, 'Buffalo', '6 pcs', '', '[]', 'No Add-on', '[]'),
(57, 45, 39, NULL, 1, 99.00, 99.00, 'none', 0.00, 0.00, 0, 'French Fries', 'Cheese', '', '[]', 'No Add-on', '[]'),
(58, 45, 116, NULL, 1, 220.00, 150.00, 'none', 0.00, 0.00, 0, 'Blueberry Matcha', 'Large', '', '[]', 'Matcha, Chia Seeds', '[220,225]'),
(59, 46, 19, NULL, 1, 210.00, 210.00, 'none', 0.00, 0.00, 0, 'Teriyaki', '6pcs', '', '[]', 'No Add-on', '[]'),
(60, 46, 42, NULL, 1, 130.00, 130.00, 'none', 0.00, 0.00, 0, 'Overload Fries', '', '', '[]', 'No Add-on', '[]'),
(61, 46, 53, NULL, 1, 59.00, 59.00, 'none', 0.00, 0.00, 0, 'Shanghai Rice', '', '', '[]', 'No Add-on', '[]'),
(62, 46, 60, NULL, 1, 160.00, 160.00, 'none', 0.00, 0.00, 0, 'Tofu Sisig', '', '', '[]', 'No Add-on', '[]'),
(63, 46, 113, NULL, 1, 140.00, 140.00, 'none', 0.00, 0.00, 0, 'Strawberry Matcha', 'Medium', '', '[]', 'No Add-on', '[]'),
(64, 46, 135, NULL, 1, 190.00, 155.00, 'none', 0.00, 0.00, 0, 'Salted Caramel', 'Large', '', '[]', 'Oatmik', '[221]'),
(65, 47, 143, NULL, 1, 175.00, 155.00, 'none', 0.00, 0.00, 0, 'Strawberry', 'Large', '', '[]', 'Whip Cream', '[226]'),
(66, 48, 48, NULL, 1, 180.00, 165.00, 'none', 0.00, 0.00, 0, 'Meaty Burger', '', '', '[]', 'Sliced Cheese', '[218]'),
(67, 48, 178, NULL, 1, 99.00, 99.00, 'none', 0.00, 0.00, 0, 'Blueberry Lemon Soda', 'Large', '', '[]', 'No Add-on', '[]'),
(68, 49, 56, NULL, 1, 99.00, 79.00, 'none', 0.00, 0.00, 0, 'Combo Cravings', '', '', '[]', 'Plain Rice', '[214]'),
(69, 49, 88, NULL, 1, 140.00, 140.00, 'none', 0.00, 0.00, 0, 'Mocha Latte', 'Medium', '', '[]', 'No Add-on', '[]'),
(70, 50, 29, NULL, 1, 130.00, 130.00, 'none', 0.00, 0.00, 0, 'Spamsilog', '', '', '[]', 'No Add-on', '[]'),
(71, 50, 97, NULL, 1, 130.00, 115.00, 'none', 0.00, 0.00, 0, 'Strawberry Milk', 'Large - Iced', '', '[]', 'Condensed', '[223]'),
(72, 51, 37, NULL, 1, 160.00, 160.00, 'none', 0.00, 0.00, 0, 'Creamy Pesto Tuna', '', '', '[]', 'No Add-on', '[]'),
(73, 51, 49, NULL, 1, 190.00, 175.00, 'none', 0.00, 0.00, 0, 'Drop Supreme Burger', '', '', '[]', 'Sliced Cheese', '[218]'),
(74, 52, 187, NULL, 1, 90.00, 90.00, 'none', 0.00, 0.00, 0, 'Strawberry Yogurt', 'Medium', '', '[]', 'No Add-on', '[]'),
(75, 53, 55, NULL, 1, 70.00, 70.00, 'none', 0.00, 0.00, 0, 'Chicken Poppers', '', '', '[]', 'No Add-on', '[]'),
(76, 54, 151, NULL, 1, 230.00, 170.00, 'none', 0.00, 0.00, 0, 'Biscoff Matcha', 'Large', '', '[]', 'Matcha', '[220]'),
(77, 55, 55, NULL, 1, 95.00, 70.00, 'none', 0.00, 0.00, 0, 'Chicken Poppers', '', '', '[]', 'Fried Rice', '[215]'),
(78, 56, 56, NULL, 1, 79.00, 79.00, 'none', 0.00, 0.00, 0, 'Combo Cravings', '', '', '[]', 'No Add-on', '[]'),
(79, 56, 187, NULL, 1, 90.00, 90.00, 'none', 0.00, 0.00, 0, 'Strawberry Yogurt', 'Medium', '', '[]', 'No Add-on', '[]'),
(80, 57, 616, NULL, 1, 54.00, 90.00, 'percentage', 40.00, 36.00, 1, 'Mocha', 'Large', '', '[]', 'No Add-on', '[]'),
(81, 58, 616, NULL, 1, 54.00, 90.00, 'percentage', 40.00, 36.00, 1, 'Mocha', 'Large', '', '[]', 'No Add-on', '[]'),
(82, 59, 616, NULL, 1, 54.00, 90.00, 'percentage', 40.00, 36.00, 1, 'Mocha', 'Large', '', '[]', 'No Add-on', '[]'),
(83, 60, 616, NULL, 1, 54.00, 90.00, 'percentage', 40.00, 36.00, 1, 'Mocha', 'Large', '', '[]', 'No Add-on', '[]'),
(84, 61, 616, NULL, 1, 54.00, 90.00, 'percentage', 40.00, 36.00, 1, 'Mocha', 'Large', '', '[]', 'No Add-on', '[]'),
(85, 62, 616, NULL, 1, 54.00, 90.00, 'percentage', 40.00, 36.00, 1, 'Mocha', 'Large', '', '[]', 'No Add-on', '[]'),
(86, 63, 616, NULL, 1, 54.00, 90.00, 'percentage', 40.00, 36.00, 1, 'Mocha', 'Large', '', '[]', 'No Add-on', '[]'),
(87, 64, 56, NULL, 1, 99.00, 79.00, 'none', 0.00, 0.00, 0, 'Combo Cravings', '', '', '[]', 'Plain Rice', '[214]'),
(88, 64, 82, NULL, 1, 175.00, 140.00, 'none', 0.00, 0.00, 0, 'White Choco Latte', 'Medium', '', '[]', 'Espresso', '[219]'),
(89, 65, 40, NULL, 1, 99.00, 99.00, 'none', 0.00, 0.00, 0, 'French Fries', 'BBQ', '', '[]', 'No Add-on', '[]'),
(90, 65, 617, NULL, 1, 67.50, 90.00, 'percentage', 25.00, 22.50, 1, 'Test', 'Regular', '', '[]', 'No Add-on', '[]');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_owner_password_reset_requests`
--

CREATE TABLE `tbl_owner_password_reset_requests` (
  `request_id` bigint(20) UNSIGNED NOT NULL,
  `owner_id` int(11) NOT NULL,
  `restaurant_id` int(11) DEFAULT NULL,
  `submitted_email` varchar(190) NOT NULL,
  `submitted_contact_number` varchar(30) NOT NULL,
  `submitted_restaurant_name` varchar(180) NOT NULL,
  `reason` varchar(500) NOT NULL,
  `request_status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `review_note` varchar(500) DEFAULT NULL,
  `reviewed_by` int(11) DEFAULT NULL,
  `reviewed_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `last_used_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_owner_trusted_devices`
--

INSERT INTO `tbl_owner_trusted_devices` (`trusted_device_id`, `owner_id`, `selector`, `token_hash`, `expires_at`, `created_at`, `last_used_at`) VALUES
(34, 27, '3d2278e5baecc6e898bf2ebfd30de231', '831317c3611087ebf24e089a2d095cfcb99f68536e8be43081c8df95e685e4a7', '2026-09-25 17:46:42', '2026-08-26 09:46:42', '2026-08-29 16:43:55'),
(35, 27, 'cfb3ac08baab51237f30e5b395f1fca5', '2016e5ade775c9edeb39567ea9263feee24420c4a6284585166b9ad521dfd3b2', '2026-09-29 13:32:36', '2026-08-30 05:32:37', NULL),
(36, 27, '5f0fae6c34038d0e4ae4507a96ee552c', '050c03b45c1aadc936b0f4f78167963258dc76d4daac710e0575b39a05db5f5e', '2026-10-03 13:50:27', '2026-09-03 01:50:27', NULL),
(37, 27, 'f7d195fee12de951945fb137ff22c4b5', 'e0e83d8c679223cefd2acdf893491f43285470795bbef17b06cc3cee0e44aeae', '2026-10-03 14:13:55', '2026-09-03 02:13:55', NULL),
(38, 27, '7909e847ffd0ff3f613732d5595feaf3', '717e9ae93e8c6ff5671271afa7e000b2c6df252e7e65a022c7c10be6db0d065a', '2026-10-03 14:20:19', '2026-09-03 02:20:19', NULL),
(39, 27, 'cce726a30a8137a053c03b58034f0c10', 'b9f6961b3e70afd6c22496e3a43b008edd0f5d5a431b965004a0e47ac5791277', '2026-10-04 19:01:44', '2026-09-04 19:01:44', NULL),
(40, 27, '09761e401c063c10da7076a9ffd22f7a', '74b2d88624dc30f34d82aa4fa7a367890e4b6d4a906a5113f6544b2d093e5972', '2026-10-07 11:28:12', '2026-09-07 11:28:12', NULL),
(41, 27, 'c37848d604c95c2bc2d5b72380d20525', '949c82009ea0e515997ec66eae9c7015ea2ea977c0e148501bb95213f00b713b', '2026-10-07 11:34:48', '2026-09-07 11:34:48', NULL),
(42, 27, '2c578e6b81ea332e1c77b2afd4cd4939', '6f27ed2dd8220a3a3d9175ac30c8b4f6f65aa9f18081722f69c3694f4b7491e0', '2026-10-07 11:41:04', '2026-09-07 11:41:04', NULL),
(43, 27, 'b0b1d5fde30244acd87ab3d6807a7e8a', 'f22bc7970d4a01408f18fd9f7dc9ddcd2697689ca43dd99108adc1dee2c354f9', '2026-10-07 11:42:13', '2026-09-07 11:42:13', NULL),
(44, 27, '0ed48c9af3e6232098e33f7482dc7e76', '2284da5f30714b7227c08540c952d3278229f72131016135819c4bdf26026e75', '2026-10-07 11:51:13', '2026-09-07 11:51:13', NULL),
(45, 27, '16a65986dd55e032514f3f9940246781', '80cfa9fe55690d2b71efb661c8edcb2476dfe288df79540578741c613e83df10', '2026-10-07 19:27:42', '2026-09-07 19:27:42', NULL),
(50, 27, 'bc5cf89f65a1913613999ade669841ef', '47bc074a8e22092b2bcc328f5bc8418637b95851388ad4aa09f5eb2c3954f95d', '2026-10-09 00:12:10', '2026-09-09 00:12:10', '2026-09-09 22:47:15'),
(54, 40, '6ee860f6efd4519530b9dd6a892603d0', '032225c25b43d7b02e9a5b2f0bf2bd367469b40ebbf2d8cf87bee8833af39903', '2026-10-11 12:11:02', '2026-09-11 12:11:02', NULL),
(55, 27, '3675ed1e84aa482a260a9baf3149070b', '83465a0d8a2f290b0e9960f71b61d3daebc63dc2176c77c746a3ea89bbdd9f54', '2026-10-11 12:25:35', '2026-09-11 12:25:35', '2026-09-11 12:53:29');

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
  `restaurant_description` text DEFAULT NULL,
  `logo_path` varchar(255) DEFAULT NULL,
  `business_email` varchar(150) DEFAULT NULL,
  `province` varchar(100) DEFAULT NULL,
  `city_municipality` varchar(100) DEFAULT NULL,
  `barangay` varchar(100) DEFAULT NULL,
  `postal_code` varchar(10) DEFAULT NULL,
  `business_hours_json` longtext DEFAULT NULL,
  `order_types_json` longtext DEFAULT NULL,
  `delivery_fee` decimal(10,2) NOT NULL DEFAULT 0.00,
  `delivery_pricing_type` varchar(20) NOT NULL DEFAULT 'fixed',
  `delivery_pricing_json` longtext DEFAULT NULL,
  `application_status` enum('email_pending','draft','submitted','needs_changes','approved','rejected') NOT NULL DEFAULT 'email_pending',
  `rejection_reason` text DEFAULT NULL,
  `submitted_at` datetime DEFAULT NULL,
  `reviewed_at` datetime DEFAULT NULL,
  `reviewed_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_partner_applications`
--

INSERT INTO `tbl_partner_applications` (`application_id`, `owner_id`, `restaurant_name`, `restaurant_address`, `restaurant_contact`, `cuisine`, `restaurant_description`, `logo_path`, `business_email`, `province`, `city_municipality`, `barangay`, `postal_code`, `business_hours_json`, `order_types_json`, `delivery_fee`, `delivery_pricing_type`, `delivery_pricing_json`, `application_status`, `rejection_reason`, `submitted_at`, `reviewed_at`, `reviewed_by`, `created_at`, `updated_at`) VALUES
(9, 27, 'Drop By Cafe', 'San Jose Drive, Sabaro', '+639617879757', 'Cafe', '?️ All Day Breakfast & Pasta\n☕️ Coffee & Non-Coffee Drinks\n? Snacks and Pastries\n❄️ Air-Conditioned Area\n? Pet-Friendly Cafe\n? PS4 and Board Games\n?Books Collections\n? Free Wi-Fi\n?️ Free Parking\n✨ Dine In / Take Out / Delivery/ Pick-Up', 'uploads/restaurant_logos/owner_27/restaurant_logo_20260815_022944_a228cfd995c94b93.jpg', 'dropbycafe.25@gmail.com', 'Pangasinan', 'City of Alaminos', 'Poblacion', '2404', '{\"Monday\":{\"closed\":false,\"open\":\"09:00\",\"close\":\"23:00\"},\"Tuesday\":{\"closed\":false,\"open\":\"09:00\",\"close\":\"23:00\"},\"Wednesday\":{\"closed\":false,\"open\":\"09:00\",\"close\":\"23:00\"},\"Thursday\":{\"closed\":false,\"open\":\"09:00\",\"close\":\"23:00\"},\"Friday\":{\"closed\":false,\"open\":\"09:00\",\"close\":\"23:00\"},\"Saturday\":{\"closed\":false,\"open\":\"09:00\",\"close\":\"23:00\"},\"Sunday\":{\"closed\":false,\"open\":\"09:00\",\"close\":\"23:00\"}}', '[\"dine-in\",\"takeout\",\"delivery\"]', 50.00, 'fixed', NULL, 'approved', NULL, '2026-08-16 16:58:59', '2026-08-25 13:56:39', 17, '2026-08-14 18:29:16', '2026-08-25 13:56:39'),
(10, 28, 'Jai\'s Grill and Resto', 'EJR Building, Marcos Avenue, Palamis, City of Alaminos, Pangasinan, Philippines', '+639273980482', 'Filipino', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 'fixed', NULL, 'email_pending', NULL, NULL, NULL, NULL, '2026-08-16 16:14:18', '2026-08-16 16:14:18'),
(11, 29, 'Jai\'s Grill and Resto', 'EJR Building, Marcos Avenue, Palamis, City of Alaminos, Pangasinan, Philippines', '+639273980481', 'Filipino', 'We are open for Dine-in, Take-out, Deliveries and Reservations.', 'uploads/restaurant_logos/owner_29/restaurant_logo_20260817_005008_3139dc32c8666fbe.jpg', 'jaisfc2026@gmail.com', 'Pangasinan', 'City of Alaminos', 'Palamis', '2404', '{\"Monday\":{\"closed\":false,\"open\":\"08:00\",\"close\":\"20:00\"},\"Tuesday\":{\"closed\":false,\"open\":\"08:00\",\"close\":\"20:00\"},\"Wednesday\":{\"closed\":false,\"open\":\"08:00\",\"close\":\"20:00\"},\"Thursday\":{\"closed\":false,\"open\":\"08:00\",\"close\":\"20:00\"},\"Friday\":{\"closed\":false,\"open\":\"08:00\",\"close\":\"20:00\"},\"Saturday\":{\"closed\":false,\"open\":\"08:00\",\"close\":\"20:00\"},\"Sunday\":{\"closed\":false,\"open\":\"08:00\",\"close\":\"20:00\"}}', '[\"dine-in\",\"takeout\",\"delivery\"]', 50.00, 'fixed', NULL, 'needs_changes', 'mahal ko si bianca soafer', '2026-08-17 12:42:11', '2026-09-10 10:58:02', 17, '2026-08-16 16:33:17', '2026-09-10 02:58:02'),
(12, 30, 'Alon\'s Cafe Alaminos', 'Ground floor, Davros Complex, M. Rabago St., San Jose Drive, Poblacion, City of Alaminos, Pangasinan, Philippines', '+639165843190', 'Cafe', 'Japanese-Korean Cafe & Restaurant', 'uploads/restaurant_logos/owner_30/restaurant_logo_20260817_145830_ef31cd105a41575b.jpg', 'alonsfc67@gmail.com', 'Pangasinan', 'City of Alaminos', 'Poblacion', '2404', '{\"Monday\":{\"closed\":false,\"open\":\"08:00\",\"close\":\"20:00\"},\"Tuesday\":{\"closed\":false,\"open\":\"08:00\",\"close\":\"20:00\"},\"Wednesday\":{\"closed\":false,\"open\":\"08:00\",\"close\":\"20:00\"},\"Thursday\":{\"closed\":false,\"open\":\"08:00\",\"close\":\"20:00\"},\"Friday\":{\"closed\":false,\"open\":\"08:00\",\"close\":\"20:00\"},\"Saturday\":{\"closed\":false,\"open\":\"08:00\",\"close\":\"20:00\"},\"Sunday\":{\"closed\":false,\"open\":\"08:00\",\"close\":\"20:00\"}}', '[\"dine-in\",\"takeout\",\"delivery\"]', 50.00, 'fixed', NULL, 'approved', NULL, '2026-08-17 11:07:12', '2026-09-11 10:39:17', 17, '2026-08-17 06:43:03', '2026-09-11 02:39:17'),
(13, 31, 'The Galley Pizza Alaminos Branch', 'C.P. Gracia St., Poblacion, City of Alaminos, Pangasinan, Philippines', '+639956327964', 'Pizza', '', 'uploads/restaurant_logos/owner_31/restaurant_logo_20260817_191225_f87ebff2ca452a19.jpg', 'galleyfc8@gmail.com', 'Pangasinan', 'City of Alaminos', 'Poblacion', '2404', '{\"Monday\":{\"closed\":false,\"open\":\"08:00\",\"close\":\"20:00\"},\"Tuesday\":{\"closed\":false,\"open\":\"08:00\",\"close\":\"20:00\"},\"Wednesday\":{\"closed\":false,\"open\":\"08:00\",\"close\":\"20:00\"},\"Thursday\":{\"closed\":false,\"open\":\"08:00\",\"close\":\"20:00\"},\"Friday\":{\"closed\":false,\"open\":\"08:00\",\"close\":\"20:00\"},\"Saturday\":{\"closed\":false,\"open\":\"08:00\",\"close\":\"20:00\"},\"Sunday\":{\"closed\":false,\"open\":\"08:00\",\"close\":\"20:00\"}}', '[\"dine-in\",\"takeout\",\"delivery\"]', 50.00, 'fixed', NULL, 'approved', NULL, '2026-08-17 12:39:20', '2026-09-11 10:38:31', 17, '2026-08-17 11:10:39', '2026-09-11 02:38:31'),
(15, 40, 'Bianca Cafe', 'Center Point, Poblacion, City of Alaminos, Pangasinan, Philippines', '+639876655444', 'Cafe', 'BIANCA', 'uploads/restaurant_logos/owner_40/restaurant_logo_20260911_103829_b96d6aa058eec72d.jpg', 'acadsonly67@gmail.com', 'Pangasinan', 'City of Alaminos', 'Poblacion', '2404', '{\"Monday\":{\"closed\":false,\"open\":\"08:00\",\"close\":\"20:00\"},\"Tuesday\":{\"closed\":false,\"open\":\"08:00\",\"close\":\"20:00\"},\"Wednesday\":{\"closed\":false,\"open\":\"08:00\",\"close\":\"20:00\"},\"Thursday\":{\"closed\":false,\"open\":\"08:00\",\"close\":\"20:00\"},\"Friday\":{\"closed\":false,\"open\":\"08:00\",\"close\":\"20:00\"},\"Saturday\":{\"closed\":false,\"open\":\"08:00\",\"close\":\"20:00\"},\"Sunday\":{\"closed\":false,\"open\":\"08:00\",\"close\":\"20:00\"}}', '[\"dine-in\",\"takeout\",\"delivery\"]', 60.00, 'distance', '{\"base_fee\":60,\"included_km\":5,\"extra_fee_per_km\":10,\"rounding\":\"ceil_extra_km\"}', 'approved', NULL, '2026-09-11 10:46:14', '2026-09-11 10:46:28', 17, '2026-09-11 02:34:33', '2026-09-11 02:46:28');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_partner_application_documents`
--

CREATE TABLE `tbl_partner_application_documents` (
  `document_id` int(11) NOT NULL,
  `application_id` int(11) NOT NULL,
  `owner_id` int(11) NOT NULL,
  `document_type` enum('bir_2303','restaurant_menu','applicant_id') NOT NULL,
  `original_name` varchar(190) NOT NULL,
  `file_path` varchar(255) NOT NULL,
  `mime_type` varchar(100) NOT NULL,
  `file_size` int(11) NOT NULL,
  `uploaded_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_partner_application_documents`
--

INSERT INTO `tbl_partner_application_documents` (`document_id`, `application_id`, `owner_id`, `document_type`, `original_name`, `file_path`, `mime_type`, `file_size`, `uploaded_at`) VALUES
(4, 9, 27, 'bir_2303', '769309021_1991670854800812_7621144269341864897_n.jpg', 'uploads/restaurant_verification/owner_27/application_9/bir_2303_20260815_023025_6603b483c440.jpg', 'image/jpeg', 48617, '2026-08-15 02:30:25'),
(5, 9, 27, 'applicant_id', '769309021_1991670854800812_7621144269341864897_n.jpg', 'uploads/restaurant_verification/owner_27/application_9/applicant_id_20260815_023032_6ffc44847d49.jpg', 'image/jpeg', 48617, '2026-08-15 02:30:32'),
(6, 9, 27, 'restaurant_menu', '767482764_2908401112840420_5545216318970813536_n.jpg', 'uploads/restaurant_verification/owner_27/application_9/restaurant_menu_20260815_023155_df602b29dbd1.jpg', 'image/jpeg', 122975, '2026-08-15 02:31:55'),
(7, 11, 29, 'bir_2303', '36869de8-9c8b-48cb-8947-bece7cc4eaf2.jpg', 'uploads/restaurant_verification/owner_29/application_11/bir_2303_20260817_005115_6c0d735770b8.jpg', 'image/jpeg', 55505, '2026-08-16 16:51:12'),
(8, 11, 29, 'restaurant_menu', 'f370a99b-5112-4f6e-82ec-a2e913bfe7b9.jpg', 'uploads/restaurant_verification/owner_29/application_11/restaurant_menu_20260817_005241_8e30e8db3b44.jpg', 'image/jpeg', 219671, '2026-08-16 16:52:39'),
(9, 11, 29, 'applicant_id', '36869de8-9c8b-48cb-8947-bece7cc4eaf2.jpg', 'uploads/restaurant_verification/owner_29/application_11/applicant_id_20260817_005250_147434c7ea09.jpg', 'image/jpeg', 55505, '2026-08-16 16:52:47'),
(10, 12, 30, 'bir_2303', 'd302f0db-275b-4ad5-af2c-570b1ff295f2.jpg', 'uploads/restaurant_verification/owner_30/application_12/bir_2303_20260817_144501_15f9a9d1fd14.jpg', 'image/jpeg', 40130, '2026-08-17 06:44:59'),
(11, 12, 30, 'restaurant_menu', '582531079_855766000317923_2208803749854823680_n.jpg', 'uploads/restaurant_verification/owner_30/application_12/restaurant_menu_20260817_144637_e15f04aa3046.jpg', 'image/jpeg', 157580, '2026-08-17 06:46:34'),
(12, 12, 30, 'applicant_id', 'd302f0db-275b-4ad5-af2c-570b1ff295f2.jpg', 'uploads/restaurant_verification/owner_30/application_12/applicant_id_20260817_144641_437dc5514233.jpg', 'image/jpeg', 40130, '2026-08-17 06:46:38'),
(13, 13, 31, 'bir_2303', 'ba4aa3e8-5bf9-48bd-9f07-a6971f8f75d7.jpg', 'uploads/restaurant_verification/owner_31/application_13/bir_2303_20260817_191245_586c625b9fb4.jpg', 'image/jpeg', 134718, '2026-08-17 11:12:43'),
(14, 13, 31, 'restaurant_menu', 'ea45c415-9bf6-4bd8-8222-d76bac7dfff2.jpg', 'uploads/restaurant_verification/owner_31/application_13/restaurant_menu_20260817_191420_6301fc3400c0.jpg', 'image/jpeg', 89123, '2026-08-17 11:14:18'),
(15, 13, 31, 'applicant_id', 'ba4aa3e8-5bf9-48bd-9f07-a6971f8f75d7.jpg', 'uploads/restaurant_verification/owner_31/application_13/applicant_id_20260817_191425_3433302c67e8.jpg', 'image/jpeg', 134718, '2026-08-17 11:14:22'),
(16, 15, 40, 'bir_2303', 'download.jpg', 'uploads/restaurant_verification/owner_40/application_15/bir_2303_20260911_103859_abfe47182e75.jpg', 'image/jpeg', 52876, '2026-09-11 10:38:59'),
(17, 15, 40, 'restaurant_menu', 'download.jpg', 'uploads/restaurant_verification/owner_40/application_15/restaurant_menu_20260911_103906_89d6cdfeeea0.jpg', 'image/jpeg', 52876, '2026-09-11 10:39:06'),
(18, 15, 40, 'applicant_id', 'download.jpg', 'uploads/restaurant_verification/owner_40/application_15/applicant_id_20260911_103908_ad840766cd15.jpg', 'image/jpeg', 52876, '2026-09-11 10:39:08');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_payments`
--

CREATE TABLE `tbl_payments` (
  `payment_id` bigint(20) UNSIGNED NOT NULL,
  `order_id` int(11) NOT NULL,
  `restaurant_id` int(11) NOT NULL,
  `provider` varchar(30) NOT NULL DEFAULT 'paymongo',
  `payment_method_type` varchar(50) DEFAULT NULL,
  `payment_status` enum('pending','paid','failed','cancelled','refunded') NOT NULL DEFAULT 'pending',
  `amount` decimal(10,2) NOT NULL,
  `currency` char(3) NOT NULL DEFAULT 'PHP',
  `reference_number` varchar(100) NOT NULL,
  `checkout_session_id` varchar(100) DEFAULT NULL,
  `provider_payment_id` varchar(100) DEFAULT NULL,
  `paid_at` datetime DEFAULT NULL,
  `failed_at` datetime DEFAULT NULL,
  `cancelled_at` datetime DEFAULT NULL,
  `refunded_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `tbl_payments`
--

INSERT INTO `tbl_payments` (`payment_id`, `order_id`, `restaurant_id`, `provider`, `payment_method_type`, `payment_status`, `amount`, `currency`, `reference_number`, `checkout_session_id`, `provider_payment_id`, `paid_at`, `failed_at`, `cancelled_at`, `refunded_at`, `created_at`, `updated_at`) VALUES
(13, 49, 6, 'paymongo', 'qrph', 'paid', 239.00, 'PHP', 'FC-6-49-T-1-7fb95670a4', 'cs_8bba3eb6d6f472258efad9f0', 'pay_YHU36fPtHwT37C3xX2E94wHs', '2026-09-07 20:47:55', NULL, NULL, NULL, '2026-09-07 12:22:26', '2026-09-07 12:47:55'),
(14, 50, 6, 'paymongo', 'qrph', 'paid', 310.00, 'PHP', 'FC-6-50-T-1-0d8bd1474c', 'cs_cc81b64e0e9a25517effdbc4', 'pay_qvmhbfZTDX9s6Np46LSPa4xQ', '2026-09-07 21:12:30', NULL, NULL, NULL, '2026-09-07 13:11:10', '2026-09-07 13:12:30'),
(15, 53, 6, 'paymongo', 'qrph', 'pending', 140.00, 'PHP', 'FC-6-53-L-1-2cdb9823df', 'cs_79bc976a9a5906b4bb7c90f4', NULL, NULL, NULL, NULL, NULL, '2026-09-08 16:23:17', '2026-09-08 16:23:17');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_products`
--

CREATE TABLE `tbl_products` (
  `product_id` int(11) NOT NULL,
  `restaurant_id` int(11) NOT NULL,
  `product_name` varchar(150) NOT NULL,
  `category` varchar(50) NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `item_type` enum('menu_item','add_on') NOT NULL DEFAULT 'menu_item',
  `size` varchar(20) DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `stock` int(11) DEFAULT 0,
  `status` enum('Available','Unavailable') DEFAULT 'Available',
  `image_path` varchar(255) DEFAULT NULL,
  `discount_type` enum('none','percentage','fixed') NOT NULL DEFAULT 'none',
  `discount_value` decimal(10,2) NOT NULL DEFAULT 0.00,
  `discount_schedule` enum('permanent','scheduled') NOT NULL DEFAULT 'permanent',
  `discount_start` datetime DEFAULT NULL,
  `discount_end` datetime DEFAULT NULL,
  `discount_status` enum('Active','Inactive') NOT NULL DEFAULT 'Inactive'
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `tbl_products`
--

INSERT INTO `tbl_products` (`product_id`, `restaurant_id`, `product_name`, `category`, `description`, `item_type`, `size`, `price`, `stock`, `status`, `image_path`, `discount_type`, `discount_value`, `discount_schedule`, `discount_start`, `discount_end`, `discount_status`) VALUES
(14, 6, 'Sweet and Spicy', 'Chicken Wings', '2 pcs w/ Rice', 'menu_item', 'Solo Meal', 105.00, 20, 'Available', '/FoodConnect/uploads/product_images/restaurant_6/product_eebb10a62b5efbe91dde4c43cbb90440.jpg', 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(15, 6, 'Sweet and Spicy', 'Chicken Wings', NULL, 'menu_item', '4pcs', 140.00, 20, 'Available', '/FoodConnect/uploads/product_images/restaurant_6/product_24e706e42130b398756684c1855ba8da.jpg', 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(16, 6, 'Sweet and Spicy', 'Chicken Wings', NULL, 'menu_item', '6pcs', 210.00, 20, 'Available', '/FoodConnect/uploads/product_images/restaurant_6/product_efaa1b796c04bb8951abf6cefc050d24.jpg', 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(17, 6, 'Teriyaki', 'Chicken Wings', '2 pcs w/ Rice', 'menu_item', 'Solo Meal', 105.00, 20, 'Available', '/FoodConnect/uploads/product_images/restaurant_6/product_65d9a536e3f26a1db38304f0ccefa22c.jpg', 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(18, 6, 'Teriyaki', 'Chicken Wings', NULL, 'menu_item', '4pcs', 140.00, 20, 'Available', '/FoodConnect/uploads/product_images/restaurant_6/product_54039828c4de3894864f2a46d11e7d06.jpg', 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(19, 6, 'Teriyaki', 'Chicken Wings', NULL, 'menu_item', '6pcs', 210.00, 19, 'Available', '/FoodConnect/uploads/product_images/restaurant_6/product_bfa6d8ebff51ef7991a0830f73457d9a.jpg', 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(20, 6, 'Honey BBQ', 'Chicken Wings', '2 pcs w/ Rice', 'menu_item', 'Solo Meal', 105.00, 20, 'Available', '/FoodConnect/uploads/product_images/restaurant_6/product_1c86a730bd0a3fa03b592adf49b39697.jpg', 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(21, 6, 'Honey BBQ', 'Chicken Wings', NULL, 'menu_item', '4 pcs', 140.00, 20, 'Available', '/FoodConnect/uploads/product_images/restaurant_6/product_893b3859c0480ceef898966731fbf1f0.jpg', 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(22, 6, 'Honey BBQ', 'Chicken Wings', NULL, 'menu_item', '6 pcs', 210.00, 20, 'Available', '/FoodConnect/uploads/product_images/restaurant_6/product_9139a601e216423ac9e6dbce4fbf35fd.jpg', 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(23, 6, 'Buffalo', 'Chicken Wings', '2 pcs w/ Rice', 'menu_item', 'Solo Meal', 105.00, 20, 'Available', '/FoodConnect/uploads/product_images/restaurant_6/product_8b1491fbfdb1d842b30fe59d7fb655a1.jpg', 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(24, 6, 'Buffalo', 'Chicken Wings', NULL, 'menu_item', '4 pcs', 140.00, 20, 'Available', '/FoodConnect/uploads/product_images/restaurant_6/product_a466c2c8f442cdf6e4d482c93a3e24fd.jpg', 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(25, 6, 'Buffalo', 'Chicken Wings', NULL, 'menu_item', '6 pcs', 210.00, 20, 'Available', '/FoodConnect/uploads/product_images/restaurant_6/product_774aac713a3609ca433a507a20905869.jpg', 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(26, 6, 'Garlic Parmesan', 'Chicken Wings', '2 pcs w/ Rice', 'menu_item', 'Solo Meal', 105.00, 19, 'Available', '/FoodConnect/uploads/product_images/restaurant_6/product_a73034cccc76618c5df131ebe6534ca4.jpg', 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(27, 6, 'Garlic Parmesan', 'Chicken Wings', NULL, 'menu_item', '4 pcs', 140.00, 20, 'Available', '/FoodConnect/uploads/product_images/restaurant_6/product_5ed8ce496a87df8062c749101ef8b5a4.jpg', 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(28, 6, 'Garlic Parmesan', 'Chicken Wings', NULL, 'menu_item', '6 pcs', 210.00, 20, 'Available', '/FoodConnect/uploads/product_images/restaurant_6/product_e99fc24584924877ec67acf2aaf5f4cd.jpg', 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(29, 6, 'Spamsilog', 'Rice Meals', 'with egg and side dish on the side.', 'menu_item', '', 130.00, 19, 'Available', '/FoodConnect/uploads/product_images/restaurant_6/product_ce0dc4ca2d2cafa098b3600010e7e6f9.jpg', 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(30, 6, 'Cornsilog', 'Rice Meals', 'with egg and side dish on the side.', 'menu_item', '', 130.00, 20, 'Available', '/FoodConnect/uploads/product_images/restaurant_6/product_658381a4a85bf9fde1f31bc33b1b19c8.jpg', 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(31, 6, 'Tosilog', 'Rice Meals', 'with egg and side dish on the side.', 'menu_item', '', 135.00, 20, 'Available', '/FoodConnect/uploads/product_images/restaurant_6/product_b614d9cc8fd59bc9d31b94462f6f2ec6.jpg', 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(32, 6, 'Tofu Sisig', 'Rice Meals', 'with egg and side dish on the side.', 'menu_item', '', 135.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(33, 6, 'Tapsilog', 'Rice Meals', 'with egg and side dish on the side.', 'menu_item', '', 145.00, 19, 'Available', '/FoodConnect/uploads/product_images/restaurant_6/product_f785f94fca19944364521987df5db136.jpg', 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(34, 6, 'Pork Sisig', 'Rice Meals', 'with egg and side dish on the side.', 'menu_item', '', 150.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(35, 6, 'Filipino Spaghetti', 'Pasta', NULL, 'menu_item', '', 99.00, 20, 'Available', '/FoodConnect/uploads/product_images/restaurant_6/product_b3effa139712735baa5ca80e079a7e17.jpg', 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(36, 6, 'Mushroom Alfredo', 'Pasta', NULL, 'menu_item', '', 130.00, 20, 'Available', '/FoodConnect/uploads/product_images/restaurant_6/product_a184a159e3c7f01d7ab46e4afb308e0f.jpg', 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(37, 6, 'Creamy Pesto Tuna', 'Pasta', NULL, 'menu_item', '', 160.00, 19, 'Available', '/FoodConnect/uploads/product_images/restaurant_6/product_8f1e9ca0f58aaa80daa78e2adc0e8df3.jpg', 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(38, 6, 'French Fries', 'Snacks', NULL, 'menu_item', 'Plain', 99.00, 20, 'Available', '/FoodConnect/uploads/product_images/restaurant_6/product_0d59991361c1cee18987bee6f0a8c765.jpg', 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(39, 6, 'French Fries', 'Snacks', NULL, 'menu_item', 'Cheese', 99.00, 20, 'Available', '/FoodConnect/uploads/product_images/restaurant_6/product_2f65c222e5cb013f1272dcfef61aa80d.jpg', 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(40, 6, 'French Fries', 'Snacks', NULL, 'menu_item', 'BBQ', 99.00, 19, 'Available', '/FoodConnect/uploads/product_images/restaurant_6/product_73ddc1d38ba2c832b1fc806738d4c2a9.jpg', 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(41, 6, 'French Fries', 'Snacks', NULL, 'menu_item', 'Sour Cream Onion', 99.00, 20, 'Available', '/FoodConnect/uploads/product_images/restaurant_6/product_3d4863bc581d158c32478c8b2b4c30d2.jpg', 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(42, 6, 'Overload Fries', 'Snacks', NULL, 'menu_item', '', 130.00, 18, 'Available', '/FoodConnect/uploads/product_images/restaurant_6/product_2360164b10589cacac47efb915a00ad8.jpg', 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(43, 6, 'Overload Nachos', 'Snacks', NULL, 'menu_item', '', 145.00, 20, 'Available', '/uploads/product_images/restaurant_6/product_d9405b06d2d6e5cafcac1f29f656ce57.jpg', 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(44, 6, 'Overload Combo', 'Snacks', NULL, 'menu_item', '', 160.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(45, 6, 'Drop Platter', 'Snacks', 'Cheesy Fries and Nachos, 4 pcs Wings, 4 pcs Hashbrown, 4 pcs Mini Burger', 'menu_item', '', 460.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(46, 6, 'Classic Burger', 'Burger Series', NULL, 'menu_item', '', 150.00, 20, 'Available', '/FoodConnect/uploads/product_images/restaurant_6/product_dbdea9b5d30b1492da64028f46914b6d.jpg', 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(47, 6, 'Double Cheese Burger', 'Burger Series', NULL, 'menu_item', '', 160.00, 20, 'Available', '/FoodConnect/uploads/product_images/restaurant_6/product_893e30e47e001a80fac4e7f031a22aef.jpg', 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(48, 6, 'Meaty Burger', 'Burger Series', NULL, 'menu_item', '', 165.00, 19, 'Available', '/FoodConnect/uploads/product_images/restaurant_6/product_9e3f985040e937c5af575b3835b638e7.jpg', 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(49, 6, 'Drop Supreme Burger', 'Burger Series', NULL, 'menu_item', '', 175.00, 20, 'Available', '/FoodConnect/uploads/product_images/restaurant_6/product_ca58b698c83377459b0e037da6e4946f.jpg', 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(50, 6, 'Tuna Sandwich', 'Sandwiches', NULL, 'menu_item', '', 125.00, 20, 'Available', '/FoodConnect/uploads/product_images/restaurant_6/product_42c664bd9bfac209de1df049adce448d.jpg', 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(51, 6, 'Clubhouse Sandwich', 'Sandwiches', NULL, 'menu_item', '', 140.00, 20, 'Available', '/FoodConnect/uploads/product_images/restaurant_6/product_9b66b75be79c930a5174806d7aabb6eb.jpg', 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(52, 6, 'Siomai Rice', 'Budget Meal', NULL, 'menu_item', '', 59.00, 20, 'Available', '/FoodConnect/uploads/product_images/restaurant_6/product_e25a19f94617191938e48a1adb910372.jpg', 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(53, 6, 'Shanghai Rice', 'Budget Meal', NULL, 'menu_item', '', 59.00, 19, 'Available', '/FoodConnect/uploads/product_images/restaurant_6/product_67a63daea4c8b2213e144ab845e212ca.jpg', 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(54, 6, 'Adobo Flakes', 'Budget Meal', NULL, 'menu_item', '', 89.00, 20, 'Available', '/FoodConnect/uploads/product_images/restaurant_6/product_eb77befc27f4b1816174bc36cbc54963.jpg', 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(55, 6, 'Chicken Poppers', 'Budget Meal', NULL, 'menu_item', '', 70.00, 20, 'Available', '/FoodConnect/uploads/product_images/restaurant_6/product_3dfe855a392cecdc9c986e5885d61ffc.jpg', 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(56, 6, 'Combo Cravings', 'Budget Meal', NULL, 'menu_item', '', 79.00, 22, 'Available', '/FoodConnect/uploads/product_images/restaurant_6/product_3d81164ceabaf3b44bc47b01df650400.jpg', 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(57, 6, 'Savory Duo', 'Budget Meal', NULL, 'menu_item', '', 99.00, 20, 'Available', '/FoodConnect/uploads/product_images/restaurant_6/product_5b946fc0a757d7356a16d0e4c408a62d.jpg', 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(58, 6, 'Pinapaitan', 'Ulam Specials', NULL, 'menu_item', '', 220.00, 20, 'Available', '/FoodConnect/uploads/product_images/restaurant_6/product_3a1762b2f4714c52644b17e7da9a1b55.jpg', 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(59, 6, 'Pork Igado', 'Ulam Specials', NULL, 'menu_item', '', 200.00, 20, 'Available', '/FoodConnect/uploads/product_images/restaurant_6/product_5d31e94123e9f2d6266d2b0751c6fcaa.jpg', 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(60, 6, 'Tofu Sisig', 'Ulam Specials', NULL, 'menu_item', '', 160.00, 19, 'Available', '/FoodConnect/uploads/product_images/restaurant_6/product_a9eb2753df796be10213375b9b18b56f.jpg', 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(61, 6, 'Bulalo', 'Ulam Specials', NULL, 'menu_item', '', 380.00, 20, 'Available', '/FoodConnect/uploads/product_images/restaurant_6/product_db4736410532e4ecb51f1f7cad15e817.jpg', 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(62, 6, 'Pork Sisig', 'Ulam Specials', NULL, 'menu_item', '', 180.00, 20, 'Available', '/FoodConnect/uploads/product_images/restaurant_6/product_5509988123cd8ef163b2eaf59cf55a41.jpg', 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(63, 6, 'Pour-Over', 'Drinks - Coffee Based', NULL, 'menu_item', 'Hot', 80.00, 20, 'Available', '/FoodConnect/uploads/product_images/restaurant_6/product_8778472934e9668ed2e72eb435da02be.jpg', 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(64, 6, 'Pour-Over', 'Drinks - Coffee Based', NULL, 'menu_item', 'Medium', 90.00, 20, 'Available', '/FoodConnect/uploads/product_images/restaurant_6/product_d97b1c77c78ae2a435f882227b2ff6d4.jpg', 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(65, 6, 'Pour-Over', 'Drinks - Coffee Based', NULL, 'menu_item', 'Large', 100.00, 20, 'Available', '/FoodConnect/uploads/product_images/restaurant_6/product_84c7398d1a5064a19b11ea079bb937fe.jpg', 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(66, 6, 'Americano', 'Drinks - Coffee Based', NULL, 'menu_item', 'Hot', 80.00, 20, 'Available', '/FoodConnect/uploads/product_images/restaurant_6/product_42d3157cc168732521d6554850346424.jpg', 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(67, 6, 'Americano', 'Drinks - Coffee Based', NULL, 'menu_item', 'Medium', 90.00, 20, 'Available', '/FoodConnect/uploads/product_images/restaurant_6/product_7e6be6a57ff0b58ec7a8dd2759eedb89.jpg', 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(68, 6, 'Americano', 'Drinks - Coffee Based', NULL, 'menu_item', 'Large', 100.00, 20, 'Available', '/FoodConnect/uploads/product_images/restaurant_6/product_314ce9af1f2fd59e30b10ef297780dfc.jpg', 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(69, 6, 'Cafe Latte', 'Drinks - Coffee Based', NULL, 'menu_item', 'Hot', 110.00, 20, 'Available', '/FoodConnect/uploads/product_images/restaurant_6/product_3c771966bc48a35da0e76953992d9fec.jpg', 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(70, 6, 'Cafe Latte', 'Drinks - Coffee Based', NULL, 'menu_item', 'Medium', 120.00, 20, 'Available', '/FoodConnect/uploads/product_images/restaurant_6/product_e4f9e47a500d9fb8724ea775bb8ad17e.jpg', 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(71, 6, 'Cafe Latte', 'Drinks - Coffee Based', NULL, 'menu_item', 'Large', 130.00, 20, 'Available', '/FoodConnect/uploads/product_images/restaurant_6/product_42ed70e9d667c1a50b6df2ddd2f408aa.jpg', 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(72, 6, 'Spanish Latte', 'Drinks - Coffee Based', NULL, 'menu_item', 'Hot', 120.00, 20, 'Available', '/FoodConnect/uploads/product_images/restaurant_6/product_1d04975dbdb7281a26eb967812a89bb3.jpg', 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(73, 6, 'Spanish Latte', 'Drinks - Coffee Based', NULL, 'menu_item', 'Medium', 130.00, 20, 'Available', '/FoodConnect/uploads/product_images/restaurant_6/product_79bcd6c9b8da9b85a6b87ff458c01f70.jpg', 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(74, 6, 'Spanish Latte', 'Drinks - Coffee Based', NULL, 'menu_item', 'Large', 140.00, 20, 'Available', '/FoodConnect/uploads/product_images/restaurant_6/product_52dee703a87cf1e52c257dffa5a7d4f5.jpg', 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(75, 6, 'Hazelnut Latte', 'Drinks - Coffee Based', NULL, 'menu_item', 'Hot', 125.00, 20, 'Available', '/FoodConnect/uploads/product_images/restaurant_6/product_940f216b430dd30a87b032244dfcbf3f.jpg', 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(76, 6, 'Hazelnut Latte', 'Drinks - Coffee Based', NULL, 'menu_item', 'Medium', 135.00, 20, 'Available', '/FoodConnect/uploads/product_images/restaurant_6/product_84fe1e05fd02401f04a34abd28915c09.jpg', 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(77, 6, 'Hazelnut Latte', 'Drinks - Coffee Based', NULL, 'menu_item', 'Large', 145.00, 20, 'Available', '/FoodConnect/uploads/product_images/restaurant_6/product_b0d9e5057d8f3507e7e3a299a18c40d4.jpg', 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(78, 6, 'Roasted Almond', 'Drinks - Coffee Based', NULL, 'menu_item', 'Hot', 125.00, 20, 'Available', '/FoodConnect/uploads/product_images/restaurant_6/product_2e0c9bc92ff5075942ab8f4fd5f2709a.jpg', 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(79, 6, 'Roasted Almond', 'Drinks - Coffee Based', NULL, 'menu_item', 'Medium', 135.00, 20, 'Available', '/FoodConnect/uploads/product_images/restaurant_6/product_ab5599ecbfab983d371fa264b8d0f296.jpg', 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(80, 6, 'Roasted Almond', 'Drinks - Coffee Based', NULL, 'menu_item', 'Large', 145.00, 20, 'Available', '/FoodConnect/uploads/product_images/restaurant_6/product_73b4402df6a86fef01ce3448159e871d.jpg', 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(81, 6, 'White Choco Latte', 'Drinks - Coffee Based', NULL, 'menu_item', 'Hot', 130.00, 20, 'Available', '/FoodConnect/uploads/product_images/restaurant_6/product_800f5ad1dbef9287d169bdd02057f75f.jpg', 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(82, 6, 'White Choco Latte', 'Drinks - Coffee Based', NULL, 'menu_item', 'Medium', 140.00, 19, 'Available', '/FoodConnect/uploads/product_images/restaurant_6/product_5a149369f7cfd8b07806d90946e1016d.jpg', 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(83, 6, 'White Choco Latte', 'Drinks - Coffee Based', NULL, 'menu_item', 'Large', 150.00, 20, 'Available', '/FoodConnect/uploads/product_images/restaurant_6/product_81fc3f5d9b04df90f1c991976b84dc9c.jpg', 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(84, 6, 'Salted Caramel', 'Drinks - Coffee Based', NULL, 'menu_item', 'Hot', 130.00, 20, 'Available', '/FoodConnect/uploads/product_images/restaurant_6/product_e83b2bc47d1780b7cdb993de011a16db.jpg', 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(85, 6, 'Salted Caramel', 'Drinks - Coffee Based', NULL, 'menu_item', 'Medium', 140.00, 20, 'Available', '/FoodConnect/uploads/product_images/restaurant_6/product_3a8974f7f6cd28815e6ca18db163dd4f.jpg', 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(86, 6, 'Salted Caramel', 'Drinks - Coffee Based', NULL, 'menu_item', 'Large', 150.00, 20, 'Available', '/FoodConnect/uploads/product_images/restaurant_6/product_139d0c7b2ad0b03895503bc9c0e9b0a9.jpg', 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(87, 6, 'Mocha Latte', 'Drinks - Coffee Based', NULL, 'menu_item', 'Hot', 130.00, 20, 'Available', '/FoodConnect/uploads/product_images/restaurant_6/product_70128353eeeb59b25321e64bed5b7cf6.jpg', 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(88, 6, 'Mocha Latte', 'Drinks - Coffee Based', NULL, 'menu_item', 'Medium', 140.00, 19, 'Available', '/FoodConnect/uploads/product_images/restaurant_6/product_c581f2eaf07f31bfb417d13b34f06487.jpg', 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(89, 6, 'Mocha Latte', 'Drinks - Coffee Based', NULL, 'menu_item', 'Large', 150.00, 20, 'Available', '/FoodConnect/uploads/product_images/restaurant_6/product_1085b1334c59fdbd369433d42419de18.jpg', 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(90, 6, 'Caramel Machiatto', 'Drinks - Coffee Based', NULL, 'menu_item', 'Hot', 135.00, 20, 'Available', '/FoodConnect/uploads/product_images/restaurant_6/product_8f0650fa3b31a94aeb5eede81a4b71fa.jpg', 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(91, 6, 'Caramel Machiatto', 'Drinks - Coffee Based', NULL, 'menu_item', 'Medium', 145.00, 20, 'Available', '/FoodConnect/uploads/product_images/restaurant_6/product_128649157f515ae47604a1399950bbce.jpg', 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(92, 6, 'Caramel Machiatto', 'Drinks - Coffee Based', NULL, 'menu_item', 'Large', 155.00, 20, 'Available', '/FoodConnect/uploads/product_images/restaurant_6/product_1032b632c7572cdbce8fa9989a9a135f.jpg', 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(93, 6, 'Biscof Latte', 'Drinks - Coffee Based', NULL, 'menu_item', 'Hot', 140.00, 20, 'Available', '/FoodConnect/uploads/product_images/restaurant_6/product_00e432377ace6081332f0307f3c58b62.jpg', 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(94, 6, 'Biscof Latte', 'Drinks - Coffee Based', NULL, 'menu_item', 'Medium', 150.00, 20, 'Available', '/FoodConnect/uploads/product_images/restaurant_6/product_3aac7e811d8cebe79417b18e5362ce98.jpg', 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(95, 6, 'Biscof Latte', 'Drinks - Coffee Based', NULL, 'menu_item', 'Large', 160.00, 20, 'Available', '/FoodConnect/uploads/product_images/restaurant_6/product_b393be45cee22f55232957e46316ef07.jpg', 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(96, 6, 'Strawberry Milk', 'Drinks - Non Coffee', NULL, 'menu_item', 'Medium - Iced', 105.00, 20, 'Available', '/FoodConnect/uploads/product_images/restaurant_6/product_b0150f2cbab4e60acd5d5488b06248b8.jpg', 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(97, 6, 'Strawberry Milk', 'Drinks - Non Coffee', NULL, 'menu_item', 'Large - Iced', 115.00, 19, 'Available', '/FoodConnect/uploads/product_images/restaurant_6/product_599ee04d8b43d36c8c3e122a42480cd4.jpg', 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(98, 6, 'Blueberry Milk', 'Drinks - Non Coffee', NULL, 'menu_item', 'Medium - Iced', 105.00, 20, 'Available', '/FoodConnect/uploads/product_images/restaurant_6/product_a18dba6be538f7d103a2cdc3a97f86b5.jpg', 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(99, 6, 'Blueberry Milk', 'Drinks - Non Coffee', NULL, 'menu_item', 'Large - Iced', 115.00, 20, 'Available', '/FoodConnect/uploads/product_images/restaurant_6/product_c228a10d983d7fdf41a1efef31f317b2.jpg', 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(100, 6, 'Chocolate', 'Drinks - Non Coffee', NULL, 'menu_item', 'Hot', 115.00, 20, 'Available', '/FoodConnect/uploads/product_images/restaurant_6/product_a52ae0c785ae14d27feff7f72306642a.jpg', 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(101, 6, 'Chocolate', 'Drinks - Non Coffee', NULL, 'menu_item', 'Medium - Iced', 125.00, 20, 'Available', '/FoodConnect/uploads/product_images/restaurant_6/product_a350fcd1606c0947acd43ccd0ff3e5c8.jpg', 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(102, 6, 'Chocolate', 'Drinks - Non Coffee', NULL, 'menu_item', 'Large - Iced', 135.00, 20, 'Available', '/FoodConnect/uploads/product_images/restaurant_6/product_e3ae8578ccab890b20efa234f82628ea.jpg', 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(103, 6, 'Creamy Biscoff', 'Drinks - Non Coffee', NULL, 'menu_item', 'Hot', 120.00, 20, 'Available', '/FoodConnect/uploads/product_images/restaurant_6/product_d4a82b220074875f0b0376e016a8b1f6.jpg', 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(104, 6, 'Creamy Biscoff', 'Drinks - Non Coffee', NULL, 'menu_item', 'Medium - Iced', 130.00, 20, 'Available', '/FoodConnect/uploads/product_images/restaurant_6/product_2e9f5dea63a02c9413e7671f0b80c943.jpg', 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(105, 6, 'Creamy Biscoff', 'Drinks - Non Coffee', NULL, 'menu_item', 'Large - Iced', 140.00, 20, 'Available', '/FoodConnect/uploads/product_images/restaurant_6/product_94f17f6ea2d5a9c9e66dc0b03c68b01b.jpg', 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(109, 6, 'Matcha Latte', 'Drinks - Matcha Series', NULL, 'menu_item', 'Hot', 125.00, 20, 'Available', '/FoodConnect/uploads/product_images/restaurant_6/product_b3208eda804f3037f777f830f594246f.jpg', 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(110, 6, 'Matcha Latte', 'Drinks - Matcha Series', NULL, 'menu_item', 'Medium', 135.00, 20, 'Available', '/FoodConnect/uploads/product_images/restaurant_6/product_67755504df756dc905da926326e41306.jpg', 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(111, 6, 'Matcha Latte', 'Drinks - Matcha Series', NULL, 'menu_item', 'Large', 145.00, 20, 'Available', '/FoodConnect/uploads/product_images/restaurant_6/product_8523e30c80da0d755b7317755ca102f1.jpg', 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(113, 6, 'Strawberry Matcha', 'Drinks - Matcha Series', NULL, 'menu_item', 'Medium', 140.00, 19, 'Available', '/FoodConnect/uploads/product_images/restaurant_6/product_603963db4b2197d4c3d24e4f16c74436.jpg', 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(114, 6, 'Strawberry Matcha', 'Drinks - Matcha Series', NULL, 'menu_item', 'Large', 150.00, 19, 'Available', '/FoodConnect/uploads/product_images/restaurant_6/product_193d98d1bb36822c9bcd90da50a95512.jpg', 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(115, 6, 'Blueberry Matcha', 'Drinks - Matcha Series', NULL, 'menu_item', 'Medium', 140.00, 20, 'Available', '/FoodConnect/uploads/product_images/restaurant_6/product_8fd314e0ce864c315dcda644de31e0a6.jpg', 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(116, 6, 'Blueberry Matcha', 'Drinks - Matcha Series', NULL, 'menu_item', 'Large', 150.00, 20, 'Available', '/FoodConnect/uploads/product_images/restaurant_6/product_0ec0b585ca0f4834d392a3cd7a1c4d42.jpg', 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(117, 6, 'Biscoff Matcha', 'Drinks - Matcha Series', NULL, 'menu_item', 'Hot', 140.00, 20, 'Available', '/FoodConnect/uploads/product_images/restaurant_6/product_17ad5a70c0554170302d0db7d77070de.jpg', 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(118, 6, 'Biscoff Matcha', 'Drinks - Matcha Series', NULL, 'menu_item', 'Medium', 150.00, 20, 'Available', '/FoodConnect/uploads/product_images/restaurant_6/product_bba01e14373b5740b0fb2b7df861a94d.jpg', 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(119, 6, 'Biscoff Matcha', 'Drinks - Matcha Series', NULL, 'menu_item', 'Large', 160.00, 20, 'Available', '/FoodConnect/uploads/product_images/restaurant_6/product_f66fbd5f25a72249da799fe86c2acf54.jpg', 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(120, 6, 'White Choco Matcha', 'Drinks - Matcha Series', NULL, 'menu_item', 'Hot', 140.00, 20, 'Available', '/FoodConnect/uploads/product_images/restaurant_6/product_d5a1335659e717f05d0ee9cddc1c3943.jpg', 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(121, 6, 'White Choco Matcha', 'Drinks - Matcha Series', NULL, 'menu_item', 'Medium', 150.00, 20, 'Available', '/FoodConnect/uploads/product_images/restaurant_6/product_c810d6de29c83abf4b1cbffef84a0efa.jpg', 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(122, 6, 'White Choco Matcha', 'Drinks - Matcha Series', NULL, 'menu_item', 'Large', 160.00, 20, 'Available', '/FoodConnect/uploads/product_images/restaurant_6/product_9731b0327c59743224f77b85deba5023.jpg', 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(123, 6, 'Dirty Matcha Latte', 'Drinks - Matcha Series', NULL, 'menu_item', 'Hot', 145.00, 20, 'Available', '/FoodConnect/uploads/product_images/restaurant_6/product_1e23c492cc6db366c4d1793bee0f4059.jpg', 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(124, 6, 'Dirty Matcha Latte', 'Drinks - Matcha Series', NULL, 'menu_item', 'Medium', 155.00, 20, 'Available', '/FoodConnect/uploads/product_images/restaurant_6/product_58d73b2d63b345c49d69106877f76d1d.jpg', 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(125, 6, 'Dirty Matcha Latte', 'Drinks - Matcha Series', NULL, 'menu_item', 'Large', 165.00, 19, 'Available', '/FoodConnect/uploads/product_images/restaurant_6/product_42273d858c716e6888d56505263937f5.jpg', 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(126, 6, 'Hazelnut Latte', 'Drinks - Frappe (Coffee Based)', NULL, 'menu_item', 'Medium', 145.00, 20, 'Available', '/FoodConnect/uploads/product_images/restaurant_6/product_36eaccfa68945e4888dba047b292ac06.jpg', 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(127, 6, 'Hazelnut Latte', 'Drinks - Frappe (Coffee Based)', NULL, 'menu_item', 'Large', 155.00, 20, 'Available', '/FoodConnect/uploads/product_images/restaurant_6/product_13fff100c691e60d37d519709d83e83b.jpg', 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(128, 6, 'Roasted Almond', 'Drinks - Frappe (Coffee Based)', NULL, 'menu_item', 'Medium', 145.00, 20, 'Available', '/FoodConnect/uploads/product_images/restaurant_6/product_f4e97e8955382362cf66eb7711824c4d.jpg', 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(129, 6, 'Roasted Almond', 'Drinks - Frappe (Coffee Based)', NULL, 'menu_item', 'Large', 155.00, 20, 'Available', '/FoodConnect/uploads/product_images/restaurant_6/product_ff642f4f02bfe3edf2a15897fa3ac928.jpg', 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(130, 6, 'Caramel Latte', 'Drinks - Frappe (Coffee Based)', NULL, 'menu_item', 'Medium', 145.00, 20, 'Available', '/FoodConnect/uploads/product_images/restaurant_6/product_4dc27d181bc0075c767f9e60c536ddc6.jpg', 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(131, 6, 'Caramel Latte', 'Drinks - Frappe (Coffee Based)', NULL, 'menu_item', 'Large', 155.00, 20, 'Available', '/FoodConnect/uploads/product_images/restaurant_6/product_23b6f2358294a6abc5eb3c0303ffa578.jpg', 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(132, 6, 'White Choco Latte', 'Drinks - Frappe (Coffee Based)', NULL, 'menu_item', 'Medium', 145.00, 20, 'Available', '/FoodConnect/uploads/product_images/restaurant_6/product_d31710b1a739be62a845d68273275979.jpg', 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(133, 6, 'White Choco Latte', 'Drinks - Frappe (Coffee Based)', NULL, 'menu_item', 'Large', 155.00, 20, 'Available', '/FoodConnect/uploads/product_images/restaurant_6/product_888190df2987e0685f6a8310147d7edc.jpg', 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(134, 6, 'Salted Caramel', 'Drinks - Frappe (Coffee Based)', NULL, 'menu_item', 'Medium', 145.00, 20, 'Available', '/FoodConnect/uploads/product_images/restaurant_6/product_b887779e7c36ea5dd6019728bf8f17f9.jpg', 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(135, 6, 'Salted Caramel', 'Drinks - Frappe (Coffee Based)', NULL, 'menu_item', 'Large', 155.00, 19, 'Available', '/FoodConnect/uploads/product_images/restaurant_6/product_811c9edd51bfbe62536513e53f22a776.jpg', 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(136, 6, 'Mocha Latte', 'Drinks - Frappe (Coffee Based)', NULL, 'menu_item', 'Medium', 145.00, 20, 'Available', '/FoodConnect/uploads/product_images/restaurant_6/product_553ef5bed1e0339048ea35e0d03ac3d2.jpg', 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(137, 6, 'Mocha Latte', 'Drinks - Frappe (Coffee Based)', NULL, 'menu_item', 'Large', 155.00, 20, 'Available', '/FoodConnect/uploads/product_images/restaurant_6/product_0981b6e709629911e5846cf3cd17c751.jpg', 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(138, 6, 'Biscoff Latte', 'Drinks - Frappe (Coffee Based)', NULL, 'menu_item', 'Medium', 155.00, 20, 'Available', '/FoodConnect/uploads/product_images/restaurant_6/product_62dbeb29487f36cf9b22232e3b85b2bb.jpg', 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(139, 6, 'Biscoff Latte', 'Drinks - Frappe (Coffee Based)', NULL, 'menu_item', 'Large', 165.00, 20, 'Available', '/FoodConnect/uploads/product_images/restaurant_6/product_8066f3213eba1500ffcb36ba5392720d.jpg', 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(140, 6, 'Cookies n\' Cream', 'Drinks - Frappe (Non-Coffee Based)', NULL, 'menu_item', 'Medium', 145.00, 20, 'Available', '/FoodConnect/uploads/product_images/restaurant_6/product_f5a549b848a98334bc59854796ea6d0c.jpg', 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(141, 6, 'Cookies n\' Cream', 'Drinks - Frappe (Non-Coffee Based)', NULL, 'menu_item', 'Large', 155.00, 20, 'Available', '/FoodConnect/uploads/product_images/restaurant_6/product_556b813b502ba7c8f3a78c02f81aa32b.jpg', 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(142, 6, 'Strawberry', 'Drinks - Frappe (Non-Coffee Based)', NULL, 'menu_item', 'Medium', 145.00, 19, 'Available', '/FoodConnect/uploads/product_images/restaurant_6/product_2b96624352c9b87be5736e1351fe2f39.jpg', 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(143, 6, 'Strawberry', 'Drinks - Frappe (Non-Coffee Based)', NULL, 'menu_item', 'Large', 155.00, 19, 'Available', '/FoodConnect/uploads/product_images/restaurant_6/product_b3c77518cadc171908353005be0e6843.jpg', 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(144, 6, 'Blueberry', 'Drinks - Frappe (Non-Coffee Based)', NULL, 'menu_item', 'Medium', 145.00, 20, 'Available', '/FoodConnect/uploads/product_images/restaurant_6/product_5ccde25a445411bf4a9dbea8805f15d1.jpg', 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(145, 6, 'Blueberry', 'Drinks - Frappe (Non-Coffee Based)', NULL, 'menu_item', 'Large', 155.00, 20, 'Available', '/FoodConnect/uploads/product_images/restaurant_6/product_cc76706f3d30559f1a095ecbb5866a83.jpg', 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(146, 6, 'Matcha', 'Drinks - Frappe (Non-Coffee Based)', NULL, 'menu_item', 'Medium', 150.00, 20, 'Available', '/FoodConnect/uploads/product_images/restaurant_6/product_2ffcdaae5a04fc2b3ae1e1138dd4116d.jpg', 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(147, 6, 'Matcha', 'Drinks - Frappe (Non-Coffee Based)', NULL, 'menu_item', 'Large', 160.00, 19, 'Available', '/FoodConnect/uploads/product_images/restaurant_6/product_22145fc754d9a7150669c40e57d1c413.jpg', 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(148, 6, 'Stawberry/Blueberry', 'Drinks - Frappe (Non-Coffee Based)', NULL, 'menu_item', 'Medium', 155.00, 20, 'Available', '/FoodConnect/uploads/product_images/restaurant_6/product_bf8dc524fc6e36d6734f3bae5fc1e39f.jpg', 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(149, 6, 'Stawberry/Blueberry', 'Drinks - Frappe (Non-Coffee Based)', NULL, 'menu_item', 'Large', 165.00, 20, 'Available', '/FoodConnect/uploads/product_images/restaurant_6/product_06d152cf846eae3107f27da626f872da.jpg', 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(150, 6, 'Biscoff Matcha', 'Drinks - Frappe (Non-Coffee Based)', NULL, 'menu_item', 'Medium', 160.00, 20, 'Available', '/FoodConnect/uploads/product_images/restaurant_6/product_94bd964cea57f398f0d2bdb280dbe4ec.jpg', 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(151, 6, 'Biscoff Matcha', 'Drinks - Frappe (Non-Coffee Based)', NULL, 'menu_item', 'Large', 170.00, 19, 'Available', '/FoodConnect/uploads/product_images/restaurant_6/product_e1814224a270f2000f8b4dd8cdcd76cf.jpg', 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(152, 6, 'Black Tea', 'Drinks - Tea Based', NULL, 'menu_item', 'Hot', 70.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(153, 6, 'Black Tea', 'Drinks - Tea Based', NULL, 'menu_item', 'Medium - Iced', 80.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(154, 6, 'Black Tea', 'Drinks - Tea Based', NULL, 'menu_item', 'Large - Iced', 90.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(155, 6, 'Thai Tea', 'Drinks - Tea Based', NULL, 'menu_item', 'Medium', 120.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(156, 6, 'Thai Tea', 'Drinks - Tea Based', NULL, 'menu_item', 'Large', 130.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(157, 6, 'Lychee', 'Drinks - Fruit Tea', NULL, 'menu_item', 'Medium', 79.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(158, 6, 'Lychee', 'Drinks - Fruit Tea', NULL, 'menu_item', 'Large', 89.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(159, 6, 'Kiwi', 'Drinks - Fruit Tea', NULL, 'menu_item', 'Medium', 79.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(160, 6, 'Kiwi', 'Drinks - Fruit Tea', NULL, 'menu_item', 'Large', 89.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(161, 6, 'Strawberry', 'Drinks - Fruit Tea', NULL, 'menu_item', 'Medium', 79.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(162, 6, 'Strawberry', 'Drinks - Fruit Tea', NULL, 'menu_item', 'Large', 89.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(163, 6, 'Green Apple', 'Drinks - Fruit Tea', NULL, 'menu_item', 'Medium', 79.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(164, 6, 'Green Apple', 'Drinks - Fruit Tea', NULL, 'menu_item', 'Large', 89.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(165, 6, 'Passion Fruit', 'Drinks - Fruit Tea', NULL, 'menu_item', 'Medium', 79.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(166, 6, 'Passion Fruit', 'Drinks - Fruit Tea', NULL, 'menu_item', 'Large', 89.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(167, 6, 'Blueberry', 'Drinks - Fruit Tea', NULL, 'menu_item', 'Medium', 79.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(168, 6, 'Blueberry', 'Drinks - Fruit Tea', NULL, 'menu_item', 'Large', 89.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(169, 6, 'Green Apple Soda', 'Drinks - Soda', NULL, 'menu_item', 'Medium', 79.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(170, 6, 'Green Apple Soda', 'Drinks - Soda', NULL, 'menu_item', 'Large', 89.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(171, 6, 'Lychee Soda', 'Drinks - Soda', NULL, 'menu_item', 'Medium', 79.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(172, 6, 'Lychee Soda', 'Drinks - Soda', NULL, 'menu_item', 'Large', 89.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(173, 6, 'Kiwi Soda', 'Drinks - Soda', NULL, 'menu_item', 'Medium', 79.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(174, 6, 'Kiwi Soda', 'Drinks - Soda', NULL, 'menu_item', 'Large', 89.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(175, 6, 'Passion Fruit Soda', 'Drinks - Soda', NULL, 'menu_item', 'Medium', 79.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(176, 6, 'Passion Fruit Soda', 'Drinks - Soda', NULL, 'menu_item', 'Large', 89.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(177, 6, 'Blueberry Lemon Soda', 'Drinks - Soda', NULL, 'menu_item', 'Medium', 89.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(178, 6, 'Blueberry Lemon Soda', 'Drinks - Soda', NULL, 'menu_item', 'Large', 99.00, 19, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(179, 6, 'Strawberry Lemon Soda', 'Drinks - Soda', NULL, 'menu_item', 'Medium', 89.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(180, 6, 'Strawberry Lemon Soda', 'Drinks - Soda', NULL, 'menu_item', 'Large', 99.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(181, 6, 'Lychee Yogurt', 'Drinks - Yogurt Series', NULL, 'menu_item', 'Medium', 90.00, 19, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(182, 6, 'Lychee Yogurt', 'Drinks - Yogurt Series', NULL, 'menu_item', 'Large', 100.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(183, 6, 'Green Apple Yogurt', 'Drinks - Yogurt Series', NULL, 'menu_item', 'Medium', 90.00, 18, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(184, 6, 'Green Apple Yogurt', 'Drinks - Yogurt Series', NULL, 'menu_item', 'Large', 100.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(185, 6, 'Blueberry Yogurt', 'Drinks - Yogurt Series', NULL, 'menu_item', 'Medium', 90.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(186, 6, 'Blueberry Yogurt', 'Drinks - Yogurt Series', NULL, 'menu_item', 'Large', 100.00, 20, 'Available', '/uploads/product_images/restaurant_6/product_d2fecbec872bde1abfc68968d414e8ca.jpg', 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(187, 6, 'Strawberry Yogurt', 'Drinks - Yogurt Series', NULL, 'menu_item', 'Medium', 90.00, 18, 'Available', '/uploads/product_images/restaurant_6/product_9f48e8c9242b451ae7cc2cede3657692.jpg', 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(188, 6, 'Strawberry Yogurt', 'Drinks - Yogurt Series', NULL, 'menu_item', 'Large', 100.00, 20, 'Available', '/uploads/product_images/restaurant_6/product_b552de4cc6b018dd16650b24f4d8ad02.jpg', 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(209, 7, 'Pinapaitan', 'Kambing', NULL, 'menu_item', '', 180.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(210, 7, 'Sinampalukan', 'Kambing', NULL, 'menu_item', '', 180.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(211, 7, 'Kilawen', 'Kambing', NULL, 'menu_item', '', 180.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(212, 7, 'Kalderita', 'Kambing', NULL, 'menu_item', '', 180.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(213, 7, 'Kinigtot', 'Kambing', NULL, 'menu_item', '', 180.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(214, 6, 'Plain Rice', 'Add-ons', NULL, 'add_on', NULL, 20.00, 0, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(215, 6, 'Fried Rice', 'Add-ons', NULL, 'add_on', NULL, 25.00, 0, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(216, 6, 'Egg', 'Add-ons', NULL, 'add_on', NULL, 15.00, 0, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(217, 6, 'Garlic Sauce', 'Add-ons', NULL, 'add_on', NULL, 10.00, 0, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(218, 6, 'Sliced Cheese', 'Add-ons', NULL, 'add_on', NULL, 15.00, 0, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(219, 6, 'Espresso', 'Add-ons', NULL, 'add_on', NULL, 35.00, 0, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(220, 6, 'Matcha', 'Add-ons', NULL, 'add_on', NULL, 60.00, 0, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(221, 6, 'Oatmik', 'Add-ons', NULL, 'add_on', NULL, 35.00, 0, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(222, 6, 'Syrup', 'Add-ons', NULL, 'add_on', NULL, 35.00, 0, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(223, 6, 'Condensed', 'Add-ons', NULL, 'add_on', NULL, 15.00, 0, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(224, 6, 'Jelly', 'Add-ons', NULL, 'add_on', NULL, 10.00, 0, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(225, 6, 'Chia Seeds', 'Add-ons', NULL, 'add_on', NULL, 10.00, 0, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(226, 6, 'Whip Cream', 'Add-ons', NULL, 'add_on', NULL, 20.00, 0, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(227, 6, 'Boba Pearl', 'Add-ons', NULL, 'add_on', NULL, 15.00, 0, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(228, 6, 'Crush Oreo', 'Add-ons', NULL, 'add_on', NULL, 20.00, 0, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(229, 7, 'Adobo', 'Kambing', NULL, 'menu_item', '', 180.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(230, 7, 'Bulalo', 'Beef', NULL, 'menu_item', '', 195.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(231, 7, 'Kinigtot', 'Beef', NULL, 'menu_item', '', 175.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(232, 7, 'Pigar-Pigar', 'Beef', NULL, 'menu_item', '', 175.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(233, 7, 'Pinapaitan', 'Beef', NULL, 'menu_item', '', 170.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(234, 7, 'Kare-Kare', 'Beef', NULL, 'menu_item', '', 195.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(235, 7, 'Kaleskes', 'Beef', NULL, 'menu_item', '', 170.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(236, 7, 'Pares with Rice', 'Beef', NULL, 'menu_item', '', 130.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(237, 7, 'Beef Steak', 'Beef', NULL, 'menu_item', '', 180.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(238, 7, 'Beef Broccoli', 'Beef', NULL, 'menu_item', '', 190.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(239, 7, 'Lengua', 'Beef', NULL, 'menu_item', '', 190.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(240, 7, 'Beef Caldereta', 'Beef', NULL, 'menu_item', '', 210.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(241, 7, 'Sinigang', 'Pork', NULL, 'menu_item', '', 220.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(242, 7, 'Adobo', 'Pork', NULL, 'menu_item', '', 195.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(243, 7, 'Sisig', 'Pork', NULL, 'menu_item', '', 190.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(244, 7, 'Kilawen', 'Pork', NULL, 'menu_item', '', 180.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(245, 7, 'Sizzling Porkchop with Rice', 'Pork', NULL, 'menu_item', '', 130.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(246, 7, 'Pork Sisig with Rice', 'Pork', NULL, 'menu_item', '', 130.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(247, 7, 'Chicharon Bulaklak', 'Pork', NULL, 'menu_item', '', 180.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(248, 7, 'Lechon Kawali', 'Pork', NULL, 'menu_item', '', 210.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(249, 7, 'Crispy Ulo', 'Pork', NULL, 'menu_item', '', 840.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(250, 7, 'Chicken Inasal', 'Grilled', NULL, 'menu_item', 'Paa', 155.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(251, 7, 'Leimpo', 'Grilled', NULL, 'menu_item', '', 210.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(252, 7, 'Isaw ng Baboy', 'Grilled', NULL, 'menu_item', '', 30.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(253, 7, 'Isaw ng Manok', 'Grilled', NULL, 'menu_item', '', 20.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(254, 7, 'Tainga', 'Grilled', NULL, 'menu_item', '', 30.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(255, 7, 'Laman', 'Grilled', NULL, 'menu_item', '', 30.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(256, 7, 'Inihaw na Hito', 'Grilled', NULL, 'menu_item', '', 220.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(257, 7, 'Inihaw na Bangus', 'Grilled', NULL, 'menu_item', '', 215.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(258, 7, 'Fried Chicken', 'Chicken', NULL, 'menu_item', '', 250.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(259, 7, 'Spring Chicken Whole', 'Chicken', NULL, 'menu_item', '', 400.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(260, 7, 'Spring Chicken Half', 'Chicken', NULL, 'menu_item', '', 250.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(261, 7, 'Chicken Inasal + Unli Rice + Unli Sabaw + Softdrinks', 'Chicken', NULL, 'menu_item', '', 230.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(262, 7, 'Spring Chicken/ Rice', 'Chicken', NULL, 'menu_item', '', 175.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(263, 7, 'ChopSeuy', 'Veggies', NULL, 'menu_item', '', 160.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(264, 7, 'Pinakbet', 'Veggies', NULL, 'menu_item', '', 160.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(265, 7, 'Sinigang na Bangus Belly', 'Seafood', NULL, 'menu_item', '', 220.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(266, 7, 'Kilawen na Bangus', 'Seafood', NULL, 'menu_item', '', 215.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(267, 7, 'Fried Boneless Bangus', 'Seafood', NULL, 'menu_item', '', 215.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(268, 7, 'Calamares', 'Seafood', NULL, 'menu_item', '', 220.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(269, 7, 'Crispy Hito', 'Seafood', NULL, 'menu_item', '', 220.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(270, 7, 'Bihon', 'Pansit', NULL, 'menu_item', '', 80.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(271, 7, 'Canton', 'Pansit', NULL, 'menu_item', '', 80.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(272, 7, 'Bilao', 'Bilao Order', NULL, 'menu_item', 'Small (Good for 5)', 350.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(273, 7, 'Bilao', 'Bilao Order', NULL, 'menu_item', 'Medium (Good for 10)', 570.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(274, 7, 'Bilao', 'Bilao Order', NULL, 'menu_item', 'Large (Good for 15)', 770.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(275, 7, 'Lecheflan', 'Dessert', NULL, 'menu_item', '', 100.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(276, 7, 'Halo-Halo', 'Dessert', NULL, 'menu_item', '', 90.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(277, 7, 'Fruitshake', 'Dessert', NULL, 'menu_item', 'Mango', 100.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(278, 7, 'Sinampalokan or Pinapaitan', 'Specialty', NULL, 'menu_item', 'Utak at mata ng Baka', 195.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(279, 7, 'Tapsilog', 'Silog Meals', NULL, 'menu_item', '', 134.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(280, 7, 'Special Lomi', 'Short Orders', NULL, 'menu_item', '', 95.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(281, 7, 'Beef Mami', 'Short Orders', NULL, 'menu_item', '', 65.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(282, 7, 'Beef Mami w/ Egg', 'Short Orders', NULL, 'menu_item', '', 80.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(283, 7, 'Pork Chao Fan', 'Short Orders', NULL, 'menu_item', '', 89.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive');
INSERT INTO `tbl_products` (`product_id`, `restaurant_id`, `product_name`, `category`, `description`, `item_type`, `size`, `price`, `stock`, `status`, `image_path`, `discount_type`, `discount_value`, `discount_schedule`, `discount_start`, `discount_end`, `discount_status`) VALUES
(284, 7, 'Beef Chao Fan', 'Short Orders', NULL, 'menu_item', '', 89.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(285, 7, 'Yang Chow', 'Short Orders', NULL, 'menu_item', '', 99.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(286, 7, 'Pork Chao Fan', 'Rice Platters', NULL, 'menu_item', '', 210.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(287, 7, 'Beef Chao Fan', 'Rice Platters', NULL, 'menu_item', '', 210.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(288, 7, 'Yang Chow', 'Rice Platters', NULL, 'menu_item', '', 210.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(289, 7, 'Small', 'Boodle Bilao', NULL, 'menu_item', '2-4 pax', 1500.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(290, 7, 'Medium', 'Boodle Bilao', NULL, 'menu_item', '5-8 pax', 2700.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(291, 7, 'Large', 'Boodle Bilao', NULL, 'menu_item', '9-12 pax', 3700.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(292, 7, 'Red Horse', 'Liquor', NULL, 'menu_item', '1000ml', 190.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(293, 7, 'Red Horse', 'Liquor', NULL, 'menu_item', '500ml', 90.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(294, 7, 'San Mig Pale Pilsen', 'Liquor', NULL, 'menu_item', '', 80.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(295, 7, 'San Mig Apple', 'Liquor', NULL, 'menu_item', '', 80.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(296, 7, 'San Mig Light', 'Liquor', NULL, 'menu_item', '', 80.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(297, 7, 'Alfonso 1L + Sizzling Sisig', 'Liquor', NULL, 'menu_item', '', 670.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(298, 7, 'Alfonso 1L + Pinapaitan/Kinigtot', 'Liquor', NULL, 'menu_item', '', 670.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(299, 7, 'Alfonso 1L + Lechon Kawali', 'Liquor', NULL, 'menu_item', '', 680.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(300, 7, 'Alfonso 1L + Liempo', 'Liquor', NULL, 'menu_item', '', 680.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(301, 7, 'Coke', 'Drinks', NULL, 'menu_item', '1.5L', 95.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(302, 7, 'Sprite', 'Drinks', NULL, 'menu_item', '1.5L', 95.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(303, 7, 'Royal', 'Drinks', NULL, 'menu_item', '1.5L', 95.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(304, 7, 'Bottled Water', 'Drinks', NULL, 'menu_item', '', 25.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(305, 7, '3 in 1 Coffee', 'Drinks', NULL, 'menu_item', '', 30.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(306, 7, 'Pure Lemonade', 'Drinks', NULL, 'menu_item', '16oz', 75.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(307, 8, 'Americano', 'Iced Coffee', NULL, 'menu_item', 'Small', 89.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(308, 8, 'Americano', 'Iced Coffee', NULL, 'menu_item', 'Medium', 109.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(309, 8, 'Americano', 'Iced Coffee', NULL, 'menu_item', 'Large', 119.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(310, 8, 'Cafe Latte', 'Iced Coffee', NULL, 'menu_item', 'Small', 109.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(311, 8, 'Cafe Latte', 'Iced Coffee', NULL, 'menu_item', 'Medium', 129.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(312, 8, 'Cafe Latte', 'Iced Coffee', NULL, 'menu_item', 'Large', 139.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(313, 8, 'Spanish Latte', 'Iced Coffee', NULL, 'menu_item', 'Small', 129.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(314, 8, 'Spanish Latte', 'Iced Coffee', NULL, 'menu_item', 'Medium', 139.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(315, 8, 'Spanish Latte', 'Iced Coffee', NULL, 'menu_item', 'Large', 149.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(316, 8, 'Hazelnut Latte', 'Iced Coffee', NULL, 'menu_item', 'Small', 129.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(317, 8, 'Hazelnut Latte', 'Iced Coffee', NULL, 'menu_item', 'Medium', 139.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(318, 8, 'Hazelnut Latte', 'Iced Coffee', NULL, 'menu_item', 'Large', 149.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(319, 8, 'Cinnamon Latte', 'Iced Coffee', NULL, 'menu_item', 'Small', 129.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(320, 8, 'Cinnamon Latte', 'Iced Coffee', NULL, 'menu_item', 'Medium', 139.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(321, 8, 'Cinnamon Latte', 'Iced Coffee', NULL, 'menu_item', 'Large', 149.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(322, 8, 'Caramel Macchiato', 'Iced Coffee', NULL, 'menu_item', 'Small', 129.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(323, 8, 'Caramel Macchiato', 'Iced Coffee', NULL, 'menu_item', 'Medium', 139.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(324, 8, 'Caramel Macchiato', 'Iced Coffee', NULL, 'menu_item', 'Large', 149.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(325, 8, 'Dirty Matcha Latte', 'Iced Coffee', NULL, 'menu_item', 'Small', 129.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(326, 8, 'Dirty Matcha Latte', 'Iced Coffee', NULL, 'menu_item', 'Medium', 139.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(327, 8, 'Dirty Matcha Latte', 'Iced Coffee', NULL, 'menu_item', 'Large', 149.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(328, 8, 'Irish Cream Latte', 'Iced Coffee', NULL, 'menu_item', 'Small', 139.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(329, 8, 'Irish Cream Latte', 'Iced Coffee', NULL, 'menu_item', 'Medium', 149.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(330, 8, 'Irish Cream Latte', 'Iced Coffee', NULL, 'menu_item', 'Large', 159.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(331, 8, 'Macadamia Latte', 'Iced Coffee', NULL, 'menu_item', 'Small', 139.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(332, 8, 'Macadamia Latte', 'Iced Coffee', NULL, 'menu_item', 'Medium', 149.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(333, 8, 'Macadamia Latte', 'Iced Coffee', NULL, 'menu_item', 'Large', 159.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(334, 8, 'Seasalt Latte', 'Iced Coffee', NULL, 'menu_item', 'Small', 139.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(335, 8, 'Seasalt Latte', 'Iced Coffee', NULL, 'menu_item', 'Medium', 149.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(336, 8, 'Seasalt Latte', 'Iced Coffee', NULL, 'menu_item', 'Large', 159.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(337, 8, 'Spanish Seasalt', 'Iced Coffee', NULL, 'menu_item', 'Small', 149.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(338, 8, 'Spanish Seasalt', 'Iced Coffee', NULL, 'menu_item', 'Medium', 159.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(339, 8, 'Spanish Seasalt', 'Iced Coffee', NULL, 'menu_item', 'Large', 169.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(340, 8, 'Single Shot Espresso', 'Hot Coffee', NULL, 'menu_item', '', 49.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(341, 8, 'Double Shot Espresso', 'Hot Coffee', NULL, 'menu_item', '', 69.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(342, 8, 'Hot Americano', 'Hot Coffee', NULL, 'menu_item', '', 79.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(343, 8, 'Cafe Latte', 'Hot Coffee', NULL, 'menu_item', '', 99.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(344, 8, 'Cinnamon Latte', 'Hot Coffee', NULL, 'menu_item', '', 109.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(345, 8, 'Caramel Macchiato', 'Hot Coffee', NULL, 'menu_item', '', 109.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(346, 8, 'Hot Matcha Latte', 'Non Coffee', NULL, 'menu_item', '', 99.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(347, 8, 'Hot Chocolate', 'Non Coffee', NULL, 'menu_item', '', 99.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(348, 8, 'Lemon Honey', 'Lemonades', NULL, 'menu_item', 'Small', 39.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(349, 8, 'Lemon Honey', 'Lemonades', NULL, 'menu_item', 'Medium', 59.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(350, 8, 'Lemon Honey', 'Lemonades', NULL, 'menu_item', 'Large', 69.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(351, 8, 'Lemon Yakult Honey', 'Lemonades', NULL, 'menu_item', 'Small', 59.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(352, 8, 'Lemon Yakult Honey', 'Lemonades', NULL, 'menu_item', 'Medium', 69.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(353, 8, 'Lemon Yakult Honey', 'Lemonades', NULL, 'menu_item', 'Large', 79.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(354, 8, 'Lemorange', 'Lemonades', NULL, 'menu_item', 'Medium', 79.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(355, 8, 'Lemorange', 'Lemonades', NULL, 'menu_item', 'Large', 89.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(356, 8, 'Lemon Lychee', 'Lemonades', NULL, 'menu_item', 'Medium', 79.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(357, 8, 'Lemon Lychee', 'Lemonades', NULL, 'menu_item', 'Large', 89.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(358, 8, 'Lemon Green Apple', 'Lemonades', NULL, 'menu_item', 'Medium', 79.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(359, 8, 'Lemon Green Apple', 'Lemonades', NULL, 'menu_item', 'Large', 89.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(360, 8, 'Lemon Honey Peach', 'Lemonades', NULL, 'menu_item', 'Small', 79.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(361, 8, 'Lemon Honey Peach', 'Lemonades', NULL, 'menu_item', 'Large', 89.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(362, 8, 'Wintermelon', 'Milktea', NULL, 'menu_item', 'Small', 75.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(363, 8, 'Wintermelon', 'Milktea', NULL, 'menu_item', 'Medium', 95.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(364, 8, 'Wintermelon', 'Milktea', NULL, 'menu_item', 'Large', 115.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(365, 8, 'Strawberry', 'Milktea', NULL, 'menu_item', 'Small', 75.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(366, 8, 'Strawberry', 'Milktea', NULL, 'menu_item', 'Medium', 95.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(367, 8, 'Strawberry', 'Milktea', NULL, 'menu_item', 'Large', 115.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(368, 8, 'Chocolate', 'Milktea', NULL, 'menu_item', 'Small', 75.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(369, 8, 'Chocolate', 'Milktea', NULL, 'menu_item', 'Medium', 95.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(370, 8, 'Chocolate', 'Milktea', NULL, 'menu_item', 'Large', 115.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(371, 8, 'Choco Strawberry', 'Milktea', NULL, 'menu_item', 'Small', 75.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(372, 8, 'Choco Strawberry', 'Milktea', NULL, 'menu_item', 'Medium', 95.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(373, 8, 'Choco Strawberry', 'Milktea', NULL, 'menu_item', 'Large', 115.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(374, 8, 'Cookies & Cream', 'Milktea', NULL, 'menu_item', 'Small', 75.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(375, 8, 'Cookies & Cream', 'Milktea', NULL, 'menu_item', 'Medium', 95.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(376, 8, 'Cookies & Cream', 'Milktea', NULL, 'menu_item', 'Large', 115.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(377, 8, 'Hokkaido', 'Milktea', NULL, 'menu_item', 'Small', 85.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(378, 8, 'Hokkaido', 'Milktea', NULL, 'menu_item', 'Medium', 115.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(379, 8, 'Hokkaido', 'Milktea', NULL, 'menu_item', 'Large', 135.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(380, 8, 'Dark Belgian Chocolate', 'Milktea', NULL, 'menu_item', 'Small', 85.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(381, 8, 'Dark Belgian Chocolate', 'Milktea', NULL, 'menu_item', 'Medium', 115.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(382, 8, 'Dark Belgian Chocolate', 'Milktea', NULL, 'menu_item', 'Large', 135.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(383, 8, 'Matcha', 'Milktea', NULL, 'menu_item', 'Small', 95.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(384, 8, 'Matcha', 'Milktea', NULL, 'menu_item', 'Medium', 125.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(385, 8, 'Matcha', 'Milktea', NULL, 'menu_item', 'Large', 145.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(386, 8, 'Thai', 'Milktea', NULL, 'menu_item', 'Small', 95.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(387, 8, 'Thai', 'Milktea', NULL, 'menu_item', 'Medium', 125.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(388, 8, 'Thai', 'Milktea', NULL, 'menu_item', 'Large', 145.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(389, 8, 'Biscoff', 'Milktea', NULL, 'menu_item', 'Small', 95.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(390, 8, 'Biscoff', 'Milktea', NULL, 'menu_item', 'Medium', 125.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(391, 8, 'Biscoff', 'Milktea', NULL, 'menu_item', 'Large', 145.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(392, 8, 'Hokkaido', 'Best Sellers', NULL, 'menu_item', 'Small', 85.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(393, 8, 'Hokkaido', 'Best Sellers', NULL, 'menu_item', 'Medium', 115.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(394, 8, 'Hokkaido', 'Best Sellers', NULL, 'menu_item', 'Large', 135.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(395, 8, 'Strawberry Milk', 'Best Sellers', NULL, 'menu_item', 'Small', 85.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(396, 8, 'Strawberry Milk', 'Best Sellers', NULL, 'menu_item', 'Medium', 115.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(397, 8, 'Strawberry Milk', 'Best Sellers', NULL, 'menu_item', 'Large', 135.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(398, 8, 'Thai Tea Latte', 'Best Sellers', NULL, 'menu_item', 'Small', 95.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(399, 8, 'Thai Tea Latte', 'Best Sellers', NULL, 'menu_item', 'Medium', 125.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(400, 8, 'Thai Tea Latte', 'Best Sellers', NULL, 'menu_item', 'Large', 145.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(401, 8, 'Matcha Latte', 'Best Sellers', NULL, 'menu_item', 'Small', 95.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(402, 8, 'Matcha Latte', 'Best Sellers', NULL, 'menu_item', 'Medium', 125.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(403, 8, 'Matcha Latte', 'Best Sellers', NULL, 'menu_item', 'Large', 145.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(404, 8, 'Hokkaido Seasalt', 'Best Sellers', NULL, 'menu_item', 'Small', 115.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(405, 8, 'Hokkaido Seasalt', 'Best Sellers', NULL, 'menu_item', 'Medium', 135.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(406, 8, 'Hokkaido Seasalt', 'Best Sellers', NULL, 'menu_item', 'Large', 195.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(407, 8, 'Thai Seasalt', 'Best Sellers', NULL, 'menu_item', 'Small', 125.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(408, 8, 'Thai Seasalt', 'Best Sellers', NULL, 'menu_item', 'Medium', 145.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(409, 8, 'Thai Seasalt', 'Best Sellers', NULL, 'menu_item', 'Large', 205.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(410, 8, 'Matcha Seasalt', 'Best Sellers', NULL, 'menu_item', 'Small', 125.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(411, 8, 'Matcha Seasalt', 'Best Sellers', NULL, 'menu_item', 'Medium', 145.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(412, 8, 'Matcha Seasalt', 'Best Sellers', NULL, 'menu_item', 'Large', 205.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(413, 8, 'Fries', 'Side Dish', NULL, 'menu_item', 'Good for 1-2', 90.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(414, 8, 'Fries', 'Side Dish', NULL, 'menu_item', 'Good for 2-3', 180.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(415, 8, 'Miso Soup', 'Side Dish', NULL, 'menu_item', '', 60.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(416, 8, 'Korean Kimchi', 'Side Dish', NULL, 'menu_item', '', 49.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(417, 8, 'Coleslaw Salad', 'Side Dish', NULL, 'menu_item', '', 59.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(418, 8, 'Authentic Gyoza', 'Side Dish', NULL, 'menu_item', '4 pcs', 119.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(419, 8, 'Authentic Gyoza', 'Side Dish', NULL, 'menu_item', '8 pcs', 229.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(420, 8, 'Jumbo Ebi Furai with Coleslaw', 'Side Dish', NULL, 'menu_item', '', 209.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(421, 8, 'Jumbo Ebi Tempura', 'Side Dish', NULL, 'menu_item', '', 299.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(422, 8, 'Veggie Okonomiyaki', 'Side Dish - Okonomiyaki', NULL, 'menu_item', '', 170.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(423, 8, 'Classic Okonomiyaki', 'Side Dish - Okonomiyaki', NULL, 'menu_item', '', 180.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(424, 8, 'Kani Mango Salad', 'Side Dish - Salad Bowl', NULL, 'menu_item', '', 139.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(425, 8, 'Spicy Tuna Sashimi Salad', 'Side Dish - Salad Bowl', NULL, 'menu_item', '', 199.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(426, 8, 'Crunchy Salmon Sashimi Salad', 'Side Dish - Salad Bowl', NULL, 'menu_item', '', 259.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(427, 8, 'Bibimbap Regular', 'Rice Meals', 'Marinated pure beef, kimchi, veggies, gochujang sauce, garlic rice, and egg.', 'menu_item', '', 169.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(428, 8, 'Bibimbap Premium', 'Rice Meals', 'Authentic korean bibimbap.', 'menu_item', '', 199.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(429, 8, 'Kimchi Rice w/ Egg & Spam', 'Rice Meals', 'Kimchi rice, egg, luncheon meat, nori flakes, roasted sesame seeds, and kewpie.', 'menu_item', '', 189.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(430, 8, 'Omu-Rice', 'Rice Meals', 'Egg omellete, tomato ketchup, meaty and veggie fried rice.', 'menu_item', '', 175.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(431, 8, 'Chicken Katsu', 'Rice Meals', 'Crispy breaded chciken with katsu sauce and coleslaw salad.', 'menu_item', '', 189.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(432, 8, 'Pork Katsu', 'Rice Meals', 'Crispy breaded pork with katsu sauce and coleslaw salad.', 'menu_item', '', 189.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(433, 8, 'Chicken Katsudon', 'Rice Meals', 'Katsu simmered w/ onions and a savory-sweet sauce, then covered with lightly beaten egg.', 'menu_item', '', 209.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(434, 8, 'Pork Katsudon', 'Rice Meals', 'Katsu simmered w/ onions and a savory-sweet sauce, then covered with lightly beaten egg.', 'menu_item', '', 209.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(435, 8, 'Katsu Curry', 'Rice Meals', 'Chicken or pork katsu with a rich curry sauce.', 'menu_item', '', 209.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(436, 8, 'Siomai Chao Fan', 'Rice Meals', 'Chao fan rice topped with 3 pcs steamed soimai.', 'menu_item', '', 145.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(437, 8, 'Shrimp Chao Fan', 'Rice Meals', 'Chao fan rice topped with stirred shrimps.', 'menu_item', '', 165.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(439, 8, 'Kani Cheese', 'Sushi Rolls - Maki Rolls', NULL, 'menu_item', '4 pcs', 75.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(440, 8, 'Kani Cheese', 'Sushi Rolls - Maki Rolls', NULL, 'menu_item', '8 pcs', 139.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(441, 8, 'Sesame Crab', 'Sushi Rolls - Maki Rolls', NULL, 'menu_item', '4 pcs', 85.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(442, 8, 'Sesame Crab', 'Sushi Rolls - Maki Rolls', NULL, 'menu_item', '8 pcs', 149.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(443, 8, 'Sakura Denbu', 'Sushi Rolls - Maki Rolls', NULL, 'menu_item', '4 pcs', 95.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(444, 8, 'Sakura Denbu', 'Sushi Rolls - Maki Rolls', NULL, 'menu_item', '8 pcs', 169.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(445, 8, 'California Roll', 'Sushi Rolls - Maki Rolls', NULL, 'menu_item', '4 pcs', 95.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(446, 8, 'California Roll', 'Sushi Rolls - Maki Rolls', NULL, 'menu_item', '8 pcs', 179.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(447, 8, 'Volcano Roll', 'Sushi Rolls - Maki Rolls', NULL, 'menu_item', '8 pcs', 199.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(448, 8, 'Dragon Roll', 'Sushi Rolls - Maki Rolls', NULL, 'menu_item', '8 pcs', 259.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(449, 8, 'Spicy Tuna Roll', 'Sushi Rolls - Maki Rolls', NULL, 'menu_item', '8 pcs', 259.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(450, 8, 'Crunchy Salmon', 'Sushi Rolls - Maki Rolls', NULL, 'menu_item', '8 pcs', 259.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(451, 8, 'Crunchy Spicy Salmon', 'Sushi Rolls - Maki Rolls', NULL, 'menu_item', '8 pcs', 279.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(452, 8, 'Pure Salmon Roll', 'Sushi Rolls - Maki Rolls', NULL, 'menu_item', '8 pcs', 299.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(453, 8, 'Shrimp Nigiri', 'Sushi Rolls - Nigiri & Sashimi', NULL, 'menu_item', '8 pcs', 189.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(454, 8, 'Salmon Nigiri', 'Sushi Rolls - Nigiri & Sashimi', NULL, 'menu_item', '8 pcs', 259.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(455, 8, 'Salmon Aburi Nigiri', 'Sushi Rolls - Nigiri & Sashimi', NULL, 'menu_item', '8 pcs', 259.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(456, 8, 'Salmon Sashimi', 'Sushi Rolls - Nigiri & Sashimi', NULL, 'menu_item', '8 pcs', 339.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(457, 8, 'Tuna Nigiri', 'Sushi Rolls - Nigiri & Sashimi', NULL, 'menu_item', '8 pcs', 259.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(458, 8, 'Tuna Aburi Nigiri', 'Sushi Rolls - Nigiri & Sashimi', NULL, 'menu_item', '8 pcs', 259.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(459, 8, 'Tuna Sashimi', 'Sushi Rolls - Nigiri & Sashimi', NULL, 'menu_item', '8 pcs', 339.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(460, 8, 'Assorted Sushi', 'Sushi Platter', NULL, 'menu_item', '24 Pieces', 629.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(461, 8, 'Assorted Sushi', 'Sushi Platter', NULL, 'menu_item', '32 Pieces', 829.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(462, 8, 'Assorted Sushi', 'Sushi Platter', NULL, 'menu_item', '50 Pieces', 1299.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(463, 8, 'Assorted Sushi', 'Sushi Platter', NULL, 'menu_item', '64 Pieces', 1599.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(464, 8, 'Assorted Sushi', 'Sushi Platter', NULL, 'menu_item', '100 Pieces', 2599.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(465, 8, 'Assorted Sushi', 'Sushi Platter', NULL, 'menu_item', '150 Pieces', 4000.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(466, 8, 'Assorted Sushi', 'Sushi Platter', NULL, 'menu_item', '200 Pieces', 5000.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(467, 8, 'Extra Soy', 'Add-ons', NULL, 'add_on', NULL, 25.00, 0, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(468, 8, 'Extra Gari', 'Add-ons', NULL, 'add_on', NULL, 25.00, 0, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(469, 8, 'Extra Wasabi', 'Add-ons', NULL, 'add_on', NULL, 25.00, 0, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(470, 8, 'Alon\'s Signature Dish', 'Rice Meals', 'Three pieces jumbo ebi furai drizzled with katsu sauce and japanese mayo served with coleslaw salad and steamed rice.', 'menu_item', '', 259.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(471, 8, 'Ebi Furai Curry', 'Rice Meals', 'Three pieces jumbo ebi furai served with thick japanese curry sauce, carrots, and potatoes with white steamed rice.', 'menu_item', '', 269.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(472, 8, 'Cheesy Aburi Katsu', 'Rice Meals', 'Chicken or pork katsu topped with japanese mayonnaise and blowtorched cheese slices served with coleslaw salad and steamed rice.', 'menu_item', '', 229.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(473, 8, 'Bento Box A', 'Bento Boxes', 'Chicken/pork katsu, rice, coleslaw salad, 2 pcs takoyaki cheese, 2 pcs sushi kani, wasabi, gari.', 'menu_item', '', 245.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(474, 8, 'Bento Box B', 'Bento Boxes', 'Chicken/pork katsu, rice, coleslaw salad, 2 pcs takoyaki octobits, 2 pcs sushi sesame crab, wasabi, gari.', 'menu_item', '', 255.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(475, 8, 'Bento Box C', 'Bento Boxes', 'Chicken/pork katsu, rice, coleslaw salad, 2 pcs takoyaki octobits, 2 pcs california  maki, wasabi, gari.', 'menu_item', '', 265.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(476, 8, 'Bento Box D', 'Bento Boxes', 'Shrimp katsu, rice, coleslaw salad, 2 pcs takoyaki cheese, 2 pcs california maki, wasabi, gari.', 'menu_item', '', 275.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(477, 8, 'Nori Pack', 'Add-ons', NULL, 'add_on', NULL, 20.00, 0, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(478, 8, 'Wasabi', 'Add-ons', NULL, 'add_on', NULL, 15.00, 0, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(479, 8, 'Kikkoman', 'Add-ons', NULL, 'add_on', NULL, 15.00, 0, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(480, 8, 'Baked Sushi Tray', 'Baked Goods', NULL, 'menu_item', 'Small (1 pax)', 275.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(481, 8, 'Baked Sushi Tray', 'Baked Goods', NULL, 'menu_item', 'Medium (2-3 pax)', 500.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(482, 8, 'Baked Sushi Tray', 'Baked Goods', NULL, 'menu_item', 'Large (4-5 pax)', 700.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(483, 8, 'Baked Sushi Tray', 'Baked Goods', NULL, 'menu_item', 'XL (6-10 pax)', 1500.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(484, 8, 'Korean Cream Cheese Garlic Bun', 'Baked Goods', NULL, 'menu_item', 'Solo', 99.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(485, 8, 'Korean Cream Cheese Garlic Bun', 'Baked Goods', NULL, 'menu_item', 'Box of 3', 289.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(486, 8, 'Korean Cream Cheese Garlic Bun', 'Baked Goods', NULL, 'menu_item', 'Box of 4', 389.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(487, 8, 'Takoyaki Cheese', 'Takoyaki - Original Flavors', NULL, 'menu_item', '4 pcs', 65.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(488, 8, 'Takoyaki Cheese', 'Takoyaki - Original Flavors', NULL, 'menu_item', '8 pcs', 130.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(489, 8, 'Takoyaki Cheese', 'Takoyaki - Original Flavors', NULL, 'menu_item', '12 pcs', 190.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(490, 8, 'Takoyaki Cheese Overload', 'Takoyaki - Original Flavors', NULL, 'menu_item', '4 pcs', 70.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(491, 8, 'Takoyaki Cheese Overload', 'Takoyaki - Original Flavors', NULL, 'menu_item', '8 pcs', 140.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(492, 8, 'Takoyaki Cheese Overload', 'Takoyaki - Original Flavors', NULL, 'menu_item', '12 pcs', 200.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(493, 8, 'Takoyaki Bacon', 'Takoyaki - Original Flavors', NULL, 'menu_item', '4 pcs', 75.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(494, 8, 'Takoyaki Bacon', 'Takoyaki - Original Flavors', NULL, 'menu_item', '8 pcs', 150.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(495, 8, 'Takoyaki Bacon', 'Takoyaki - Original Flavors', NULL, 'menu_item', '12 pcs', 210.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(496, 8, 'Takoyaki Crab', 'Takoyaki - Original Flavors', NULL, 'menu_item', '4 pcs', 75.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(497, 8, 'Takoyaki Crab', 'Takoyaki - Original Flavors', NULL, 'menu_item', '8 pcs', 150.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(498, 8, 'Takoyaki Crab', 'Takoyaki - Original Flavors', NULL, 'menu_item', '12 pcs', 210.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(499, 8, 'Takoyaki Shrimp', 'Takoyaki - Original Flavors', NULL, 'menu_item', '4 pcs', 80.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(500, 8, 'Takoyaki Shrimp', 'Takoyaki - Original Flavors', NULL, 'menu_item', '8 pcs', 160.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(501, 8, 'Takoyaki Shrimp', 'Takoyaki - Original Flavors', NULL, 'menu_item', '12 pcs', 230.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(502, 8, 'Classic Octobits', 'Takoyaki - Original Flavors', NULL, 'menu_item', '4 pcs', 80.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(503, 8, 'Classic Octobits', 'Takoyaki - Original Flavors', NULL, 'menu_item', '8 pcs', 160.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(504, 8, 'Classic Octobits', 'Takoyaki - Original Flavors', NULL, 'menu_item', '12 pcs', 230.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(505, 8, 'Cheesy Octobits', 'Takoyaki - Original Flavors', NULL, 'menu_item', '4 pcs', 85.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(506, 8, 'Cheesy Octobits', 'Takoyaki - Original Flavors', NULL, 'menu_item', '8 pcs', 170.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(507, 8, 'Cheesy Octobits', 'Takoyaki - Original Flavors', NULL, 'menu_item', '12 pcs', 250.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(508, 8, 'Takoyaki Cheese', 'Takoyaki - Party Tray', NULL, 'menu_item', '24 pcs', 390.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(509, 8, 'Takoyaki Cheese Overload', 'Takoyaki - Party Tray', NULL, 'menu_item', '24 pcs', 420.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(510, 8, 'Takoyaki Bacon', 'Takoyaki - Party Tray', NULL, 'menu_item', '24 pcs', 450.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(511, 8, 'Takoyaki Crab', 'Takoyaki - Party Tray', NULL, 'menu_item', '24 pcs', 450.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(512, 8, 'Takoyaki Shrimp', 'Takoyaki - Party Tray', NULL, 'menu_item', '24 pcs', 470.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(513, 8, 'Classic Octobits', 'Takoyaki - Party Tray', NULL, 'menu_item', '24 pcs', 500.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(514, 8, 'Cheesy Octobits', 'Takoyaki - Party Tray', NULL, 'menu_item', '24 pcs', 530.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(515, 8, 'Takoyaki Cheese', 'Takoyaki - Takoyaki Cheese Bomb', NULL, 'menu_item', '4 pcs', 80.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(516, 8, 'Takoyaki Cheese', 'Takoyaki - Takoyaki Cheese Bomb', NULL, 'menu_item', '8 pcs', 160.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(517, 8, 'Takoyaki Cheese', 'Takoyaki - Takoyaki Cheese Bomb', NULL, 'menu_item', '12 pcs', 230.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(518, 8, 'Takoyaki Cheese Overload', 'Takoyaki - Takoyaki Cheese Bomb', NULL, 'menu_item', '4 pcs', 85.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(519, 8, 'Takoyaki Cheese Overload', 'Takoyaki - Takoyaki Cheese Bomb', NULL, 'menu_item', '8 pcs', 170.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(520, 8, 'Takoyaki Cheese Overload', 'Takoyaki - Takoyaki Cheese Bomb', NULL, 'menu_item', '12 pcs', 240.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(521, 8, 'Takoyaki Crab', 'Takoyaki - Takoyaki Cheese Bomb', NULL, 'menu_item', '4 pcs', 90.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(522, 8, 'Takoyaki Crab', 'Takoyaki - Takoyaki Cheese Bomb', NULL, 'menu_item', '8 pcs', 180.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(523, 8, 'Takoyaki Crab', 'Takoyaki - Takoyaki Cheese Bomb', NULL, 'menu_item', '12 pcs', 260.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(524, 8, 'Takoyaki Shrimp', 'Takoyaki - Takoyaki Cheese Bomb', NULL, 'menu_item', '4 pcs', 90.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(525, 8, 'Takoyaki Shrimp', 'Takoyaki - Takoyaki Cheese Bomb', NULL, 'menu_item', '8 pcs', 180.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(526, 8, 'Takoyaki Shrimp', 'Takoyaki - Takoyaki Cheese Bomb', NULL, 'menu_item', '12 pcs', 260.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(527, 8, 'Takoyaki Bacon', 'Takoyaki - Takoyaki Cheese Bomb', NULL, 'menu_item', '4 pcs', 90.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(528, 8, 'Takoyaki Bacon', 'Takoyaki - Takoyaki Cheese Bomb', NULL, 'menu_item', '8 pcs', 180.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(529, 8, 'Takoyaki Bacon', 'Takoyaki - Takoyaki Cheese Bomb', NULL, 'menu_item', '12 pcs', 260.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(530, 8, 'Classic Octobits', 'Takoyaki - Takoyaki Cheese Bomb', NULL, 'menu_item', '4 pcs', 95.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(531, 8, 'Classic Octobits', 'Takoyaki - Takoyaki Cheese Bomb', NULL, 'menu_item', '8 pcs', 190.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(532, 8, 'Classic Octobits', 'Takoyaki - Takoyaki Cheese Bomb', NULL, 'menu_item', '12 pcs', 280.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(533, 8, 'Cheesy Octobits', 'Takoyaki - Takoyaki Cheese Bomb', NULL, 'menu_item', '4 pcs', 100.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(534, 8, 'Cheesy Octobits', 'Takoyaki - Takoyaki Cheese Bomb', NULL, 'menu_item', '8 pcs', 200.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(535, 8, 'Cheesy Octobits', 'Takoyaki - Takoyaki Cheese Bomb', NULL, 'menu_item', '12 pcs', 290.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(536, 8, 'Takoyaki Cheese Overload', 'Takoyaki - Cheese Bomb Party Tray', NULL, 'menu_item', '24 pcs', 470.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(537, 8, 'Takoyaki Bacon', 'Takoyaki - Cheese Bomb Party Tray', NULL, 'menu_item', '24 pcs', 530.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(538, 8, 'Takoyaki Crab', 'Takoyaki - Cheese Bomb Party Tray', NULL, 'menu_item', '24 pcs', 530.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(539, 8, 'Takoyaki Shrimp', 'Takoyaki - Cheese Bomb Party Tray', NULL, 'menu_item', '24 pcs1', 580.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(540, 8, 'Classic Octobits', 'Takoyaki - Cheese Bomb Party Tray', NULL, 'menu_item', '24 pcs', 580.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(541, 8, 'Cheesy Octobits', 'Takoyaki - Cheese Bomb Party Tray', NULL, 'menu_item', '24 pcs', 600.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(542, 9, 'Pizza Overload', 'Galley\'s Favorites', 'Loaded with mozarella, pepperoni, bacon, beef and veggies for the ultimate flavor-packed bite.', 'menu_item', 'Small', 339.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(543, 9, 'Pizza Overload', 'Galley\'s Favorites', 'Loaded with mozarella, pepperoni, bacon, beef and veggies for the ultimate flavor-packed bite.', 'menu_item', 'Medium', 379.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(544, 9, 'Pizza Overload', 'Galley\'s Favorites', 'Loaded with mozarella, pepperoni, bacon, beef and veggies for the ultimate flavor-packed bite.', 'menu_item', 'Large', 509.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(545, 9, 'Spinach and Mushroom', 'Galley\'s Favorites', 'A delicious blend of fresh spinach, earthy mushrooms and creamy cheese on a perfect crust.', 'menu_item', 'Small', 339.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(546, 9, 'Spinach and Mushroom', 'Galley\'s Favorites', 'A delicious blend of fresh spinach, earthy mushrooms and creamy cheese on a perfect crust.', 'menu_item', 'Medium', 379.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(547, 9, 'Spinach and Mushroom', 'Galley\'s Favorites', 'A delicious blend of fresh spinach, earthy mushrooms and creamy cheese on a perfect crust.', 'menu_item', 'Large', 509.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(548, 9, 'Meaty Deluxe', 'Galley\'s Favorites', 'A meat lover\'s dream loaded with pepperoni, beef, ham, and hungarian sausage.', 'menu_item', 'Small', 339.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(549, 9, 'Meaty Deluxe', 'Galley\'s Favorites', 'A meat lover\'s dream loaded with pepperoni, beef, ham, and hungarian sausage.', 'menu_item', 'Medium', 379.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(550, 9, 'Meaty Deluxe', 'Galley\'s Favorites', 'A meat lover\'s dream loaded with pepperoni, beef, ham, and hungarian sausage.', 'menu_item', 'Large', 509.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(551, 9, 'Ultimate Cheese', 'Galley\'s Favorites', 'A rich blend of mozarella, cheddar, parmesan, and cream cheese for the ultimate cheesy indulgence.', 'menu_item', 'Small', 339.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(552, 9, 'Ultimate Cheese', 'Galley\'s Favorites', 'A rich blend of mozarella, cheddar, parmesan, and cream cheese for the ultimate cheesy indulgence.', 'menu_item', 'Medium', 379.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(553, 9, 'Ultimate Cheese', 'Galley\'s Favorites', 'A rich blend of mozarella, cheddar, parmesan, and cream cheese for the ultimate cheesy indulgence.', 'menu_item', 'Large', 509.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(554, 9, 'Pepperoni', 'Classic Flavors', 'Red Sauce, Mozarella, and Pepperoni', 'menu_item', 'Small', 269.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(555, 9, 'Pepperoni', 'Classic Flavors', 'Red Sauce, Mozarella, and Pepperoni', 'menu_item', 'Medium', 309.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(556, 9, 'Pepperoni', 'Classic Flavors', 'Red Sauce, Mozarella, and Pepperoni', 'menu_item', 'Large', 459.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(557, 9, 'Bacon and Cheese', 'Classic Flavors', 'Red Sauce, Mozarella, and Bacon', 'menu_item', 'Small', 269.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(558, 9, 'Bacon and Cheese', 'Classic Flavors', 'Red Sauce, Mozarella, and Bacon', 'menu_item', 'Medium', 309.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(559, 9, 'Bacon and Cheese', 'Classic Flavors', 'Red Sauce, Mozarella, and Bacon', 'menu_item', 'Large', 459.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(560, 9, 'All Cheese', 'Classic Flavors', 'Red Sauce, Mozarella, Cheddar, and Parmesan', 'menu_item', 'Small', 269.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(561, 9, 'All Cheese', 'Classic Flavors', NULL, 'menu_item', 'Medium', 309.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(562, 9, 'All Cheese', 'Classic Flavors', 'Red Sauce, Mozarella, Cheddar, and Parmesan', 'menu_item', 'Large', 459.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(566, 9, 'Simply Marga', 'Neopolitan Style Flavors', 'A simple yet delicious blend of san marzano tomatoes, mozarella, basil, and olive oil.', 'menu_item', '', 359.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(567, 9, 'Truffle Trouble', 'Neopolitan Style Flavors', 'Indulge in rich truffle sauce, earthy shiitake mushrooms and crunchy cashew nuts on every slice.', 'menu_item', '', 459.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(568, 9, 'Mega Roni', 'Neopolitan Style Flavors', 'Loaded with generous layers of pepperoni drenched in signature sauce, on a crispy crust.', 'menu_item', '', 459.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(569, 9, 'Five Cheese Fever', 'Neopolitan Style Flavors', 'A rich combination of mozarella, gouda, french cheddar, provolone and blue cheese.', 'menu_item', '', 459.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(570, 9, 'Shrimp Twist', 'Neopolitan Style Flavors', 'A flavorful mix of succulent shrimp, creamy pesto sauce and melted gouda cheese on a perfect crust.', 'menu_item', '', 459.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(574, 9, 'Hawaiian', 'Classic Flavors', 'Red Sauce, Mozarella, Ham, and Pineapples', 'menu_item', 'Small', 269.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(575, 9, 'Hawaiian', 'Classic Flavors', 'Red Sauce, Mozarella, Ham, and Pineapples', 'menu_item', 'Medium', 309.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(576, 9, 'Hawaiian', 'Classic Flavors', 'Red Sauce, Mozarella, Ham, and Pineapples', 'menu_item', 'Large', 459.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(577, 9, 'Coffee Caramel Pizza', 'Dessert Pizza', NULL, 'menu_item', 'Medium', 269.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(578, 9, 'Choco Smores Pizza', 'Dessert Pizza', NULL, 'menu_item', 'Medium', 269.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(582, 9, 'Chicken Poppers', 'Appetizers', NULL, 'menu_item', '', 139.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(583, 9, 'Mojos', 'Appetizers', NULL, 'menu_item', '', 139.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(584, 9, 'Spinach Dip Platter', 'Appetizers', NULL, 'menu_item', '', 279.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(585, 9, 'Honey Buffalo', 'Chicken Wings', NULL, 'menu_item', '6 pcs', 199.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(586, 9, 'Garlic Parmesan', 'Chicken Wings', NULL, 'menu_item', '6 pcs', 199.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(587, 9, 'Apple', 'Drinks - Fruit Soda', NULL, 'menu_item', '12oz', 39.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(588, 9, 'Apple', 'Drinks - Fruit Soda', NULL, 'menu_item', '16oz', 59.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(589, 9, 'Lychee', 'Drinks - Fruit Soda', NULL, 'menu_item', '12oz', 39.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(590, 9, 'Lychee', 'Drinks - Fruit Soda', NULL, 'menu_item', '16oz', 59.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(591, 9, 'Strawberry', 'Drinks - Fruit Soda', NULL, 'menu_item', '12oz', 39.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(592, 9, 'Strawberry', 'Drinks - Fruit Soda', NULL, 'menu_item', '16oz', 59.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(593, 9, 'Blueberry', 'Drinks - Fruit Soda', NULL, 'menu_item', '12oz', 39.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive');
INSERT INTO `tbl_products` (`product_id`, `restaurant_id`, `product_name`, `category`, `description`, `item_type`, `size`, `price`, `stock`, `status`, `image_path`, `discount_type`, `discount_value`, `discount_schedule`, `discount_start`, `discount_end`, `discount_status`) VALUES
(594, 9, 'Blueberry', 'Drinks - Fruit Soda', NULL, 'menu_item', '16oz', 59.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(595, 9, 'Mango', 'Drinks - Fruit Soda', NULL, 'menu_item', '12oz', 39.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(596, 9, 'Mango', 'Drinks - Fruit Soda', NULL, 'menu_item', '16oz', 59.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(597, 9, 'Apple', 'Drinks - Fruit Yogu', NULL, 'menu_item', '12oz', 49.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(598, 9, 'Apple', 'Drinks - Fruit Yogu', NULL, 'menu_item', '16oz', 69.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(599, 9, 'Lychee', 'Drinks - Fruit Yogu', NULL, 'menu_item', '12oz', 49.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(600, 9, 'Lychee', 'Drinks - Fruit Yogu', NULL, 'menu_item', '16oz', 69.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(601, 9, 'Strawberry', 'Drinks - Fruit Yogu', NULL, 'menu_item', '12oz', 49.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(602, 9, 'Strawberry', 'Drinks - Fruit Yogu', NULL, 'menu_item', '16oz', 69.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(603, 9, 'Blueberry', 'Drinks - Fruit Yogu', NULL, 'menu_item', '12oz', 49.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(604, 9, 'Blueberry', 'Drinks - Fruit Yogu', NULL, 'menu_item', '16oz', 69.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(605, 9, 'Mango', 'Drinks - Fruit Yogu', NULL, 'menu_item', '12oz', 49.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(606, 9, 'Mango', 'Drinks - Fruit Yogu', NULL, 'menu_item', '16oz', 69.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(607, 9, 'Coke', 'Drinks', NULL, 'menu_item', '1.5L', 80.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(608, 9, 'Coke', 'Drinks', NULL, 'menu_item', 'Mismo', 30.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(609, 9, 'Sprite', 'Drinks', NULL, 'menu_item', '1.5L', 80.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(610, 9, 'Sprite', 'Drinks', NULL, 'menu_item', 'Mismo', 30.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(611, 9, 'Truffle Pasta', 'Pasta', NULL, 'menu_item', '', 299.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(612, 9, 'Shrimp Marinara', 'Pasta', NULL, 'menu_item', '', 299.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(613, 9, 'Four Cheese Pasta', 'Pasta', NULL, 'menu_item', '', 299.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(615, 10, 'Mocha', 'Drinks', NULL, 'menu_item', 'Medium', 50.00, 89, 'Available', '/FoodConnect/uploads/product_images/restaurant_10/product_51eacd79aa1f4fc9a51fb27d02762cde.jpg', 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(616, 10, 'Mocha', 'Drinks', 'yyyyy', 'menu_item', 'Large', 90.00, 51, 'Available', '/FoodConnect/uploads/product_images/restaurant_10/product_eb319463655f4b6679dd2de8b28a64b3.jpg', 'percentage', 40.00, 'scheduled', '2026-09-11 10:45:00', '2026-09-12 11:50:00', 'Active'),
(617, 6, 'Test', 'OKAy', 'sdfdgtgfytfy', 'menu_item', 'Regular', 90.00, 79, 'Available', '/uploads/product_images/restaurant_6/product_c8b6639306f858955eeb3427312e6bef.jpg', 'percentage', 25.00, 'permanent', NULL, NULL, 'Active');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_product_addon_links`
--

CREATE TABLE `tbl_product_addon_links` (
  `link_id` bigint(20) UNSIGNED NOT NULL,
  `restaurant_id` int(11) NOT NULL,
  `product_name` varchar(150) NOT NULL,
  `product_category` varchar(50) NOT NULL,
  `addon_product_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_product_addon_links`
--

INSERT INTO `tbl_product_addon_links` (`link_id`, `restaurant_id`, `product_name`, `product_category`, `addon_product_id`, `created_at`) VALUES
(23, 6, 'Meaty Burger', 'Burger Series', 218, '2026-08-16 17:12:48'),
(24, 6, 'Meaty Burger', 'Burger Series', 217, '2026-08-16 17:12:48'),
(25, 6, 'Double Cheese Burger', 'Burger Series', 218, '2026-08-16 17:13:05'),
(26, 6, 'Double Cheese Burger', 'Burger Series', 217, '2026-08-16 17:13:05'),
(27, 6, 'Classic Burger', 'Burger Series', 218, '2026-08-16 17:13:21'),
(28, 6, 'Classic Burger', 'Burger Series', 217, '2026-08-16 17:13:21'),
(29, 6, 'Savory Duo', 'Budget Meal', 215, '2026-08-16 17:14:08'),
(30, 6, 'Savory Duo', 'Budget Meal', 214, '2026-08-16 17:14:08'),
(31, 6, 'Combo Cravings', 'Budget Meal', 215, '2026-08-16 17:14:23'),
(32, 6, 'Combo Cravings', 'Budget Meal', 214, '2026-08-16 17:14:23'),
(33, 6, 'Chicken Poppers', 'Budget Meal', 215, '2026-08-16 17:14:48'),
(34, 6, 'Chicken Poppers', 'Budget Meal', 214, '2026-08-16 17:14:48'),
(35, 6, 'Adobo Flakes', 'Budget Meal', 215, '2026-08-16 17:15:03'),
(36, 6, 'Adobo Flakes', 'Budget Meal', 214, '2026-08-16 17:15:03'),
(37, 6, 'Shanghai Rice', 'Budget Meal', 215, '2026-08-16 17:15:18'),
(38, 6, 'Shanghai Rice', 'Budget Meal', 214, '2026-08-16 17:15:18'),
(39, 6, 'Siomai Rice', 'Budget Meal', 215, '2026-08-16 17:15:45'),
(40, 6, 'Siomai Rice', 'Budget Meal', 214, '2026-08-16 17:15:45'),
(47, 8, 'Assorted Sushi', 'Sushi Platter', 469, '2026-08-17 09:28:16'),
(48, 8, 'Assorted Sushi', 'Sushi Platter', 468, '2026-08-17 09:28:16'),
(49, 8, 'Assorted Sushi', 'Sushi Platter', 467, '2026-08-17 09:28:17'),
(50, 8, 'Baked Sushi Tray', 'Baked Goods', 479, '2026-08-17 09:40:12'),
(51, 8, 'Baked Sushi Tray', 'Baked Goods', 478, '2026-08-17 09:40:12'),
(52, 8, 'Baked Sushi Tray', 'Baked Goods', 477, '2026-08-17 09:40:12'),
(53, 6, 'Pour-Over', 'Drinks - Coffee Based', 223, '2026-08-17 16:29:44'),
(54, 6, 'Pour-Over', 'Drinks - Coffee Based', 222, '2026-08-17 16:29:44'),
(55, 6, 'Pour-Over', 'Drinks - Coffee Based', 221, '2026-08-17 16:29:44'),
(56, 6, 'Pour-Over', 'Drinks - Coffee Based', 219, '2026-08-17 16:29:44'),
(57, 6, 'Americano', 'Drinks - Coffee Based', 222, '2026-08-17 16:30:22'),
(58, 6, 'Americano', 'Drinks - Coffee Based', 221, '2026-08-17 16:30:22'),
(59, 6, 'Americano', 'Drinks - Coffee Based', 219, '2026-08-17 16:30:22'),
(60, 6, 'Cafe Latte', 'Drinks - Coffee Based', 223, '2026-08-17 16:31:13'),
(61, 6, 'Cafe Latte', 'Drinks - Coffee Based', 222, '2026-08-17 16:31:13'),
(62, 6, 'Cafe Latte', 'Drinks - Coffee Based', 221, '2026-08-17 16:31:13'),
(63, 6, 'Cafe Latte', 'Drinks - Coffee Based', 219, '2026-08-17 16:31:13'),
(69, 6, 'Spanish Latte', 'Drinks - Coffee Based', 223, '2026-08-17 16:32:35'),
(70, 6, 'Spanish Latte', 'Drinks - Coffee Based', 222, '2026-08-17 16:32:35'),
(71, 6, 'Spanish Latte', 'Drinks - Coffee Based', 221, '2026-08-17 16:32:36'),
(72, 6, 'Spanish Latte', 'Drinks - Coffee Based', 219, '2026-08-17 16:32:36'),
(73, 6, 'Hazelnut Latte', 'Drinks - Coffee Based', 226, '2026-08-17 16:33:10'),
(74, 6, 'Hazelnut Latte', 'Drinks - Coffee Based', 223, '2026-08-17 16:33:10'),
(75, 6, 'Hazelnut Latte', 'Drinks - Coffee Based', 222, '2026-08-17 16:33:11'),
(76, 6, 'Hazelnut Latte', 'Drinks - Coffee Based', 221, '2026-08-17 16:33:11'),
(77, 6, 'Hazelnut Latte', 'Drinks - Coffee Based', 219, '2026-08-17 16:33:11'),
(78, 6, 'Roasted Almond', 'Drinks - Coffee Based', 226, '2026-08-17 16:34:47'),
(79, 6, 'Roasted Almond', 'Drinks - Coffee Based', 223, '2026-08-17 16:34:47'),
(80, 6, 'Roasted Almond', 'Drinks - Coffee Based', 222, '2026-08-17 16:34:47'),
(81, 6, 'Roasted Almond', 'Drinks - Coffee Based', 221, '2026-08-17 16:34:48'),
(82, 6, 'Roasted Almond', 'Drinks - Coffee Based', 219, '2026-08-17 16:34:48'),
(83, 6, 'White Choco Latte', 'Drinks - Coffee Based', 228, '2026-08-17 16:35:27'),
(84, 6, 'White Choco Latte', 'Drinks - Coffee Based', 226, '2026-08-17 16:35:27'),
(85, 6, 'White Choco Latte', 'Drinks - Coffee Based', 223, '2026-08-17 16:35:27'),
(86, 6, 'White Choco Latte', 'Drinks - Coffee Based', 222, '2026-08-17 16:35:28'),
(87, 6, 'White Choco Latte', 'Drinks - Coffee Based', 221, '2026-08-17 16:35:28'),
(88, 6, 'White Choco Latte', 'Drinks - Coffee Based', 219, '2026-08-17 16:35:28'),
(89, 6, 'Salted Caramel', 'Drinks - Coffee Based', 226, '2026-08-17 16:36:03'),
(90, 6, 'Salted Caramel', 'Drinks - Coffee Based', 223, '2026-08-17 16:36:04'),
(91, 6, 'Salted Caramel', 'Drinks - Coffee Based', 222, '2026-08-17 16:36:04'),
(92, 6, 'Salted Caramel', 'Drinks - Coffee Based', 221, '2026-08-17 16:36:04'),
(93, 6, 'Salted Caramel', 'Drinks - Coffee Based', 219, '2026-08-17 16:36:04'),
(94, 6, 'Mocha Latte', 'Drinks - Coffee Based', 228, '2026-08-17 16:39:18'),
(95, 6, 'Mocha Latte', 'Drinks - Coffee Based', 226, '2026-08-17 16:39:18'),
(96, 6, 'Mocha Latte', 'Drinks - Coffee Based', 223, '2026-08-17 16:39:19'),
(97, 6, 'Mocha Latte', 'Drinks - Coffee Based', 222, '2026-08-17 16:39:19'),
(98, 6, 'Mocha Latte', 'Drinks - Coffee Based', 221, '2026-08-17 16:39:19'),
(99, 6, 'Mocha Latte', 'Drinks - Coffee Based', 219, '2026-08-17 16:39:19'),
(100, 6, 'Caramel Machiatto', 'Drinks - Coffee Based', 226, '2026-08-17 16:40:04'),
(101, 6, 'Caramel Machiatto', 'Drinks - Coffee Based', 223, '2026-08-17 16:40:04'),
(102, 6, 'Caramel Machiatto', 'Drinks - Coffee Based', 222, '2026-08-17 16:40:05'),
(103, 6, 'Caramel Machiatto', 'Drinks - Coffee Based', 221, '2026-08-17 16:40:05'),
(104, 6, 'Caramel Machiatto', 'Drinks - Coffee Based', 219, '2026-08-17 16:40:05'),
(105, 6, 'Biscof Latte', 'Drinks - Coffee Based', 226, '2026-08-17 16:40:43'),
(106, 6, 'Biscof Latte', 'Drinks - Coffee Based', 223, '2026-08-17 16:40:43'),
(107, 6, 'Biscof Latte', 'Drinks - Coffee Based', 222, '2026-08-17 16:40:43'),
(108, 6, 'Biscof Latte', 'Drinks - Coffee Based', 221, '2026-08-17 16:40:43'),
(109, 6, 'Biscof Latte', 'Drinks - Coffee Based', 219, '2026-08-17 16:40:44'),
(110, 6, 'Strawberry Milk', 'Drinks - Non Coffee', 226, '2026-08-17 16:42:01'),
(111, 6, 'Strawberry Milk', 'Drinks - Non Coffee', 225, '2026-08-17 16:42:01'),
(112, 6, 'Strawberry Milk', 'Drinks - Non Coffee', 223, '2026-08-17 16:42:01'),
(113, 6, 'Strawberry Milk', 'Drinks - Non Coffee', 222, '2026-08-17 16:42:01'),
(114, 6, 'Strawberry Milk', 'Drinks - Non Coffee', 221, '2026-08-17 16:42:01'),
(115, 6, 'Blueberry Milk', 'Drinks - Non Coffee', 226, '2026-08-17 16:42:32'),
(116, 6, 'Blueberry Milk', 'Drinks - Non Coffee', 225, '2026-08-17 16:42:32'),
(117, 6, 'Blueberry Milk', 'Drinks - Non Coffee', 223, '2026-08-17 16:42:32'),
(118, 6, 'Blueberry Milk', 'Drinks - Non Coffee', 222, '2026-08-17 16:42:32'),
(119, 6, 'Blueberry Milk', 'Drinks - Non Coffee', 221, '2026-08-17 16:42:33'),
(120, 6, 'Chocolate', 'Drinks - Non Coffee', 228, '2026-08-17 16:42:56'),
(121, 6, 'Chocolate', 'Drinks - Non Coffee', 226, '2026-08-17 16:42:56'),
(122, 6, 'Chocolate', 'Drinks - Non Coffee', 223, '2026-08-17 16:42:56'),
(123, 6, 'Chocolate', 'Drinks - Non Coffee', 222, '2026-08-17 16:42:56'),
(124, 6, 'Chocolate', 'Drinks - Non Coffee', 221, '2026-08-17 16:42:56'),
(125, 6, 'Creamy Biscoff', 'Drinks - Non Coffee', 228, '2026-08-17 16:43:49'),
(126, 6, 'Creamy Biscoff', 'Drinks - Non Coffee', 226, '2026-08-17 16:43:50'),
(127, 6, 'Creamy Biscoff', 'Drinks - Non Coffee', 223, '2026-08-17 16:43:50'),
(128, 6, 'Creamy Biscoff', 'Drinks - Non Coffee', 222, '2026-08-17 16:43:50'),
(129, 6, 'Creamy Biscoff', 'Drinks - Non Coffee', 221, '2026-08-17 16:43:50'),
(153, 6, 'White Choco Matcha', 'Drinks - Matcha Series', 228, '2026-08-17 16:46:46'),
(154, 6, 'White Choco Matcha', 'Drinks - Matcha Series', 223, '2026-08-17 16:46:47'),
(155, 6, 'White Choco Matcha', 'Drinks - Matcha Series', 222, '2026-08-17 16:46:47'),
(156, 6, 'White Choco Matcha', 'Drinks - Matcha Series', 221, '2026-08-17 16:46:47'),
(157, 6, 'White Choco Matcha', 'Drinks - Matcha Series', 220, '2026-08-17 16:46:47'),
(158, 6, 'Dirty Matcha Latte', 'Drinks - Matcha Series', 223, '2026-08-17 16:47:20'),
(159, 6, 'Dirty Matcha Latte', 'Drinks - Matcha Series', 222, '2026-08-17 16:47:20'),
(160, 6, 'Dirty Matcha Latte', 'Drinks - Matcha Series', 221, '2026-08-17 16:47:20'),
(161, 6, 'Dirty Matcha Latte', 'Drinks - Matcha Series', 220, '2026-08-17 16:47:20'),
(162, 6, 'Dirty Matcha Latte', 'Drinks - Matcha Series', 219, '2026-08-17 16:47:21'),
(163, 6, 'Biscoff Matcha', 'Drinks - Matcha Series', 228, '2026-08-17 16:47:45'),
(164, 6, 'Biscoff Matcha', 'Drinks - Matcha Series', 223, '2026-08-17 16:47:45'),
(165, 6, 'Biscoff Matcha', 'Drinks - Matcha Series', 222, '2026-08-17 16:47:46'),
(166, 6, 'Biscoff Matcha', 'Drinks - Matcha Series', 221, '2026-08-17 16:47:46'),
(167, 6, 'Biscoff Matcha', 'Drinks - Matcha Series', 220, '2026-08-17 16:47:46'),
(168, 6, 'Blueberry Matcha', 'Drinks - Matcha Series', 225, '2026-08-17 16:48:09'),
(169, 6, 'Blueberry Matcha', 'Drinks - Matcha Series', 223, '2026-08-17 16:48:09'),
(170, 6, 'Blueberry Matcha', 'Drinks - Matcha Series', 222, '2026-08-17 16:48:10'),
(171, 6, 'Blueberry Matcha', 'Drinks - Matcha Series', 221, '2026-08-17 16:48:10'),
(172, 6, 'Blueberry Matcha', 'Drinks - Matcha Series', 220, '2026-08-17 16:48:10'),
(173, 6, 'Strawberry Matcha', 'Drinks - Matcha Series', 225, '2026-08-17 16:48:48'),
(174, 6, 'Strawberry Matcha', 'Drinks - Matcha Series', 223, '2026-08-17 16:48:48'),
(175, 6, 'Strawberry Matcha', 'Drinks - Matcha Series', 222, '2026-08-17 16:48:48'),
(176, 6, 'Strawberry Matcha', 'Drinks - Matcha Series', 221, '2026-08-17 16:48:48'),
(177, 6, 'Strawberry Matcha', 'Drinks - Matcha Series', 220, '2026-08-17 16:48:48'),
(178, 6, 'Matcha Latte', 'Drinks - Matcha Series', 223, '2026-08-17 16:49:05'),
(179, 6, 'Matcha Latte', 'Drinks - Matcha Series', 222, '2026-08-17 16:49:05'),
(180, 6, 'Matcha Latte', 'Drinks - Matcha Series', 221, '2026-08-17 16:49:05'),
(181, 6, 'Matcha Latte', 'Drinks - Matcha Series', 220, '2026-08-17 16:49:05'),
(252, 6, 'Spamsilog', 'Rice Meals', 216, '2026-08-18 12:42:13'),
(253, 6, 'Spamsilog', 'Rice Meals', 215, '2026-08-18 12:42:13'),
(254, 6, 'Spamsilog', 'Rice Meals', 214, '2026-08-18 12:42:13'),
(255, 6, 'Cornsilog', 'Rice Meals', 216, '2026-08-18 12:44:17'),
(256, 6, 'Cornsilog', 'Rice Meals', 215, '2026-08-18 12:44:17'),
(257, 6, 'Cornsilog', 'Rice Meals', 214, '2026-08-18 12:44:17'),
(258, 6, 'Tosilog', 'Rice Meals', 216, '2026-08-18 12:44:37'),
(259, 6, 'Tosilog', 'Rice Meals', 215, '2026-08-18 12:44:37'),
(260, 6, 'Tosilog', 'Rice Meals', 214, '2026-08-18 12:44:37'),
(261, 6, 'Tofu Sisig', 'Rice Meals', 216, '2026-08-18 12:44:53'),
(262, 6, 'Tofu Sisig', 'Rice Meals', 215, '2026-08-18 12:44:53'),
(263, 6, 'Tofu Sisig', 'Rice Meals', 214, '2026-08-18 12:44:53'),
(264, 6, 'Tapsilog', 'Rice Meals', 216, '2026-08-18 12:45:13'),
(265, 6, 'Tapsilog', 'Rice Meals', 215, '2026-08-18 12:45:13'),
(266, 6, 'Tapsilog', 'Rice Meals', 214, '2026-08-18 12:45:14'),
(267, 6, 'Pork Sisig', 'Rice Meals', 216, '2026-08-18 12:45:35'),
(268, 6, 'Pork Sisig', 'Rice Meals', 215, '2026-08-18 12:45:36'),
(269, 6, 'Pork Sisig', 'Rice Meals', 214, '2026-08-18 12:45:36'),
(275, 6, 'Hazelnut Latte', 'Drinks - Frappe (Coffee Based)', 226, '2026-08-30 05:40:21'),
(276, 6, 'Hazelnut Latte', 'Drinks - Frappe (Coffee Based)', 223, '2026-08-30 05:40:21'),
(277, 6, 'Hazelnut Latte', 'Drinks - Frappe (Coffee Based)', 222, '2026-08-30 05:40:21'),
(278, 6, 'Hazelnut Latte', 'Drinks - Frappe (Coffee Based)', 221, '2026-08-30 05:40:21'),
(279, 6, 'Hazelnut Latte', 'Drinks - Frappe (Coffee Based)', 219, '2026-08-30 05:40:21'),
(285, 6, 'Roasted Almond', 'Drinks - Frappe (Coffee Based)', 226, '2026-08-30 05:41:13'),
(286, 6, 'Roasted Almond', 'Drinks - Frappe (Coffee Based)', 223, '2026-08-30 05:41:13'),
(287, 6, 'Roasted Almond', 'Drinks - Frappe (Coffee Based)', 222, '2026-08-30 05:41:13'),
(288, 6, 'Roasted Almond', 'Drinks - Frappe (Coffee Based)', 221, '2026-08-30 05:41:13'),
(289, 6, 'Roasted Almond', 'Drinks - Frappe (Coffee Based)', 219, '2026-08-30 05:41:14'),
(295, 6, 'Caramel Latte', 'Drinks - Frappe (Coffee Based)', 226, '2026-08-30 05:43:43'),
(296, 6, 'Caramel Latte', 'Drinks - Frappe (Coffee Based)', 223, '2026-08-30 05:43:43'),
(297, 6, 'Caramel Latte', 'Drinks - Frappe (Coffee Based)', 222, '2026-08-30 05:43:44'),
(298, 6, 'Caramel Latte', 'Drinks - Frappe (Coffee Based)', 221, '2026-08-30 05:43:44'),
(299, 6, 'Caramel Latte', 'Drinks - Frappe (Coffee Based)', 219, '2026-08-30 05:43:44'),
(306, 6, 'White Choco Latte', 'Drinks - Frappe (Coffee Based)', 228, '2026-08-30 05:46:07'),
(307, 6, 'White Choco Latte', 'Drinks - Frappe (Coffee Based)', 226, '2026-08-30 05:46:07'),
(308, 6, 'White Choco Latte', 'Drinks - Frappe (Coffee Based)', 223, '2026-08-30 05:46:07'),
(309, 6, 'White Choco Latte', 'Drinks - Frappe (Coffee Based)', 222, '2026-08-30 05:46:07'),
(310, 6, 'White Choco Latte', 'Drinks - Frappe (Coffee Based)', 221, '2026-08-30 05:46:07'),
(311, 6, 'White Choco Latte', 'Drinks - Frappe (Coffee Based)', 219, '2026-08-30 05:46:08'),
(318, 6, 'Salted Caramel', 'Drinks - Frappe (Coffee Based)', 228, '2026-08-30 05:47:30'),
(319, 6, 'Salted Caramel', 'Drinks - Frappe (Coffee Based)', 226, '2026-08-30 05:47:30'),
(320, 6, 'Salted Caramel', 'Drinks - Frappe (Coffee Based)', 223, '2026-08-30 05:47:30'),
(321, 6, 'Salted Caramel', 'Drinks - Frappe (Coffee Based)', 222, '2026-08-30 05:47:30'),
(322, 6, 'Salted Caramel', 'Drinks - Frappe (Coffee Based)', 221, '2026-08-30 05:47:30'),
(323, 6, 'Salted Caramel', 'Drinks - Frappe (Coffee Based)', 219, '2026-08-30 05:47:31'),
(330, 6, 'Mocha Latte', 'Drinks - Frappe (Coffee Based)', 228, '2026-08-30 05:48:36'),
(331, 6, 'Mocha Latte', 'Drinks - Frappe (Coffee Based)', 226, '2026-08-30 05:48:36'),
(332, 6, 'Mocha Latte', 'Drinks - Frappe (Coffee Based)', 223, '2026-08-30 05:48:36'),
(333, 6, 'Mocha Latte', 'Drinks - Frappe (Coffee Based)', 222, '2026-08-30 05:48:37'),
(334, 6, 'Mocha Latte', 'Drinks - Frappe (Coffee Based)', 221, '2026-08-30 05:48:37'),
(335, 6, 'Mocha Latte', 'Drinks - Frappe (Coffee Based)', 219, '2026-08-30 05:48:37'),
(342, 6, 'Biscoff Latte', 'Drinks - Frappe (Coffee Based)', 228, '2026-08-30 05:51:26'),
(343, 6, 'Biscoff Latte', 'Drinks - Frappe (Coffee Based)', 226, '2026-08-30 05:51:26'),
(344, 6, 'Biscoff Latte', 'Drinks - Frappe (Coffee Based)', 223, '2026-08-30 05:51:26'),
(345, 6, 'Biscoff Latte', 'Drinks - Frappe (Coffee Based)', 222, '2026-08-30 05:51:26'),
(346, 6, 'Biscoff Latte', 'Drinks - Frappe (Coffee Based)', 221, '2026-08-30 05:51:26'),
(347, 6, 'Biscoff Latte', 'Drinks - Frappe (Coffee Based)', 219, '2026-08-30 05:51:26'),
(353, 6, 'Cookies n\' Cream', 'Drinks - Frappe (Non-Coffee Based)', 228, '2026-08-30 06:04:51'),
(354, 6, 'Cookies n\' Cream', 'Drinks - Frappe (Non-Coffee Based)', 226, '2026-08-30 06:04:51'),
(355, 6, 'Cookies n\' Cream', 'Drinks - Frappe (Non-Coffee Based)', 223, '2026-08-30 06:04:51'),
(356, 6, 'Cookies n\' Cream', 'Drinks - Frappe (Non-Coffee Based)', 222, '2026-08-30 06:04:51'),
(357, 6, 'Cookies n\' Cream', 'Drinks - Frappe (Non-Coffee Based)', 221, '2026-08-30 06:04:51'),
(363, 6, 'Strawberry', 'Drinks - Frappe (Non-Coffee Based)', 226, '2026-08-30 06:06:29'),
(364, 6, 'Strawberry', 'Drinks - Frappe (Non-Coffee Based)', 225, '2026-08-30 06:06:29'),
(365, 6, 'Strawberry', 'Drinks - Frappe (Non-Coffee Based)', 223, '2026-08-30 06:06:29'),
(366, 6, 'Strawberry', 'Drinks - Frappe (Non-Coffee Based)', 222, '2026-08-30 06:06:29'),
(367, 6, 'Strawberry', 'Drinks - Frappe (Non-Coffee Based)', 221, '2026-08-30 06:06:29'),
(373, 6, 'Blueberry', 'Drinks - Frappe (Non-Coffee Based)', 226, '2026-08-30 06:07:34'),
(374, 6, 'Blueberry', 'Drinks - Frappe (Non-Coffee Based)', 225, '2026-08-30 06:07:34'),
(375, 6, 'Blueberry', 'Drinks - Frappe (Non-Coffee Based)', 223, '2026-08-30 06:07:34'),
(376, 6, 'Blueberry', 'Drinks - Frappe (Non-Coffee Based)', 222, '2026-08-30 06:07:35'),
(377, 6, 'Blueberry', 'Drinks - Frappe (Non-Coffee Based)', 221, '2026-08-30 06:07:35'),
(383, 6, 'Matcha', 'Drinks - Frappe (Non-Coffee Based)', 226, '2026-08-30 06:11:08'),
(384, 6, 'Matcha', 'Drinks - Frappe (Non-Coffee Based)', 223, '2026-08-30 06:11:08'),
(385, 6, 'Matcha', 'Drinks - Frappe (Non-Coffee Based)', 222, '2026-08-30 06:11:08'),
(386, 6, 'Matcha', 'Drinks - Frappe (Non-Coffee Based)', 221, '2026-08-30 06:11:08'),
(387, 6, 'Matcha', 'Drinks - Frappe (Non-Coffee Based)', 220, '2026-08-30 06:11:09'),
(393, 6, 'Stawberry/Blueberry', 'Drinks - Frappe (Non-Coffee Based)', 226, '2026-08-30 06:12:07'),
(394, 6, 'Stawberry/Blueberry', 'Drinks - Frappe (Non-Coffee Based)', 225, '2026-08-30 06:12:07'),
(395, 6, 'Stawberry/Blueberry', 'Drinks - Frappe (Non-Coffee Based)', 223, '2026-08-30 06:12:07'),
(396, 6, 'Stawberry/Blueberry', 'Drinks - Frappe (Non-Coffee Based)', 222, '2026-08-30 06:12:07'),
(397, 6, 'Stawberry/Blueberry', 'Drinks - Frappe (Non-Coffee Based)', 221, '2026-08-30 06:12:07'),
(404, 6, 'Biscoff Matcha', 'Drinks - Frappe (Non-Coffee Based)', 228, '2026-08-30 06:14:10'),
(405, 6, 'Biscoff Matcha', 'Drinks - Frappe (Non-Coffee Based)', 226, '2026-08-30 06:14:10'),
(406, 6, 'Biscoff Matcha', 'Drinks - Frappe (Non-Coffee Based)', 223, '2026-08-30 06:14:10'),
(407, 6, 'Biscoff Matcha', 'Drinks - Frappe (Non-Coffee Based)', 222, '2026-08-30 06:14:10'),
(408, 6, 'Biscoff Matcha', 'Drinks - Frappe (Non-Coffee Based)', 221, '2026-08-30 06:14:10'),
(409, 6, 'Biscoff Matcha', 'Drinks - Frappe (Non-Coffee Based)', 220, '2026-08-30 06:14:10'),
(410, 6, 'Lychee', 'Drinks - Fruit Tea', 224, '2026-08-30 06:16:28'),
(411, 6, 'Lychee', 'Drinks - Fruit Tea', 222, '2026-08-30 06:16:28'),
(412, 6, 'Kiwi', 'Drinks - Fruit Tea', 224, '2026-08-30 06:17:06'),
(413, 6, 'Kiwi', 'Drinks - Fruit Tea', 222, '2026-08-30 06:17:07'),
(414, 6, 'Strawberry', 'Drinks - Fruit Tea', 224, '2026-08-30 06:17:24'),
(415, 6, 'Strawberry', 'Drinks - Fruit Tea', 222, '2026-08-30 06:17:24'),
(416, 6, 'Green Apple', 'Drinks - Fruit Tea', 224, '2026-08-30 06:18:33'),
(417, 6, 'Green Apple', 'Drinks - Fruit Tea', 222, '2026-08-30 06:18:33'),
(418, 6, 'Passion Fruit', 'Drinks - Fruit Tea', 224, '2026-08-30 06:18:59'),
(419, 6, 'Passion Fruit', 'Drinks - Fruit Tea', 222, '2026-08-30 06:18:59'),
(420, 6, 'Blueberry', 'Drinks - Fruit Tea', 224, '2026-08-30 06:19:19'),
(421, 6, 'Blueberry', 'Drinks - Fruit Tea', 222, '2026-08-30 06:19:19'),
(422, 6, 'Lychee Yogurt', 'Drinks - Yogurt Series', 223, '2026-08-30 06:20:19'),
(423, 6, 'Lychee Yogurt', 'Drinks - Yogurt Series', 221, '2026-08-30 06:20:20'),
(424, 6, 'Green Apple Yogurt', 'Drinks - Yogurt Series', 223, '2026-08-30 06:20:38'),
(425, 6, 'Green Apple Yogurt', 'Drinks - Yogurt Series', 221, '2026-08-30 06:20:38'),
(442, 6, 'Drop Supreme Burger', 'Burger Series', 218, '2026-09-09 15:09:44'),
(443, 6, 'Drop Supreme Burger', 'Burger Series', 217, '2026-09-09 15:09:44'),
(446, 6, 'Strawberry Yogurt', 'Drinks - Yogurt Series', 223, '2026-09-09 15:26:44'),
(447, 6, 'Strawberry Yogurt', 'Drinks - Yogurt Series', 221, '2026-09-09 15:26:44'),
(448, 6, 'Blueberry Yogurt', 'Drinks - Yogurt Series', 223, '2026-09-09 15:27:05'),
(449, 6, 'Blueberry Yogurt', 'Drinks - Yogurt Series', 221, '2026-09-09 15:27:05'),
(450, 6, 'Test', 'TEST', 226, '2026-09-11 04:26:56'),
(451, 6, 'Test', 'TEST', 225, '2026-09-11 04:26:56'),
(452, 6, 'Test', 'TEST', 224, '2026-09-11 04:26:56'),
(453, 6, 'Test', 'TEST', 223, '2026-09-11 04:26:56'),
(458, 6, 'Test', 'OKAy', 226, '2026-09-11 04:54:34'),
(459, 6, 'Test', 'OKAy', 225, '2026-09-11 04:54:34'),
(460, 6, 'Test', 'OKAy', 224, '2026-09-11 04:54:34'),
(461, 6, 'Test', 'OKAy', 223, '2026-09-11 04:54:34');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_rate_limits`
--

CREATE TABLE `tbl_rate_limits` (
  `rate_limit_key` char(64) NOT NULL,
  `scope_name` varchar(80) NOT NULL,
  `hits` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `window_started_at` datetime NOT NULL,
  `blocked_until` datetime DEFAULT NULL,
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tbl_rate_limits`
--

INSERT INTO `tbl_rate_limits` (`rate_limit_key`, `scope_name`, `hits`, `window_started_at`, `blocked_until`, `updated_at`) VALUES
('0ca86147d384d84f34f3cbcf0fb3b9d32cddcdb13ab6b218409e2e36afc7de04', 'owner-login', 1, '2026-09-10 01:06:20', NULL, '2026-09-10 01:06:20'),
('12cea7c59eaafb56ff0accfa7695881fb38837fc26bff53361612595516583bd', 'staff-login', 1, '2026-09-09 22:58:34', NULL, '2026-09-09 22:58:34'),
('15cb6225e6acda1d0b258ace76160713195b939a4da5292399022373fa991761', 'owner-login', 2, '2026-09-11 12:10:38', NULL, '2026-09-11 12:10:41'),
('1c7a6cac58bfbc8a993a9dd3340b00d3cfef4084fb7e86d026523dfcc276ca34', 'staff-access-code', 2, '2026-09-11 12:11:55', NULL, '2026-09-11 12:16:08'),
('1d94ef99d4cd3fab9efa43c5fcbd240d916898bc378d249d0c53b9b033cb6dd6', 'owner-login', 2, '2026-09-11 12:10:19', NULL, '2026-09-11 12:10:27'),
('2377f0f2337018c248f231b983e9a5f78c18ec68dc1e33c8c607c8cb79cd00da', 'staff-login', 1, '2026-09-11 11:18:24', NULL, '2026-09-11 11:18:24'),
('33255601de8e1a953d95e8360618208fa76d8c9251a61f06cb6aa3cf27bfe04f', 'cashier-qr-scan', 1, '2026-09-11 12:14:29', NULL, '2026-09-11 12:14:29'),
('332759685e51f6b2a934c1da19e8fb24a0c1d936e54fd498f375a9aa3301853f', 'customer-signup', 2, '2026-09-09 23:00:04', NULL, '2026-09-09 23:20:51'),
('3b7f46d316cda7d93cf86c8c2270512fb32bcee8bd02c23cc594ad11f95832f5', 'staff-login', 2, '2026-09-11 11:20:48', NULL, '2026-09-11 11:20:52'),
('43e9277ffb24ab8dcbd8061af142d69313a605712e1338a82b393a857ba82b39', 'customer-order-cancel', 1, '2026-09-11 12:13:51', NULL, '2026-09-11 12:13:51'),
('44b96cd95d041a8d4c3234952515c857d356d5b1368b64cb250ee6a380d19437', 'customer-checkout', 1, '2026-09-11 12:58:08', NULL, '2026-09-11 12:58:08'),
('4d65f1214626cd6312f763970f2ac9e54a93a57c6251eda9428a792524939ec5', 'customer-login', 1, '2026-09-10 14:48:33', NULL, '2026-09-10 14:48:33'),
('5961da2d4e25f1ab792869f24afefc60e03af7e944b5d6e9628934afe751b0db', 'staff-access-code', 5, '2026-09-11 12:18:23', NULL, '2026-09-11 12:22:45'),
('5b6939169da924205b9c6d8000207a2799b1839ae404f98b8d6cb0b1742dcd3a', 'customer-login', 4, '2026-09-09 23:50:15', NULL, '2026-09-09 23:55:58'),
('5d259dbb425783dc99b889beff0cba73a02d75f5cd8bee8e63a037155c26d2e3', 'customer-order-cancel', 1, '2026-09-11 10:51:48', NULL, '2026-09-11 10:51:48'),
('63b54a7d6b25364ed1f03549c0b32e76261db2baeb87c5b36a509392c14c295f', 'owner-login', 1, '2026-09-11 12:25:10', NULL, '2026-09-11 12:25:10'),
('688454c41ae2f7a793e96a5030fdec6fc9413acf0adef4115fc71fa5ca85d6f8', 'customer-signup', 1, '2026-09-09 23:21:06', NULL, '2026-09-09 23:21:06'),
('6a7aa7b23b1ba7e047065715214be88a4d27ba229a76a6ea0fa6dd99d2e71b52', 'staff-login', 1, '2026-09-11 11:18:29', NULL, '2026-09-11 11:18:29'),
('6f0ab98bdf110051d1c5752b7ce7466381c8bca3b14f048a2e0c407b1cfcf7a3', 'staff-access-code', 1, '2026-09-11 12:58:34', NULL, '2026-09-11 12:58:34'),
('7415ddbd131d2626362ba1de08c347c470a3233aca9694f94591465bac312e2b', 'customer-checkout', 1, '2026-09-09 23:57:36', NULL, '2026-09-09 23:57:36'),
('816cd3b8f831d29d28f5a9d61f43d3cf5084075ba7b0bb5b1fc0ac4921296bc9', 'customer-signup', 4, '2026-09-11 11:27:00', NULL, '2026-09-11 11:58:33'),
('872862932fca0dc598e55c5349fb5b54a638ecf766216a37f2736b96d9629a14', 'customer-login', 1, '2026-09-11 11:41:58', NULL, '2026-09-11 11:41:58'),
('87ed5010ee9397496cc1fa5855b0f06360994b1a1bea9c2a56e32a172ede82f5', 'staff-login', 1, '2026-09-11 12:20:43', NULL, '2026-09-11 12:20:43'),
('94bd728719e8c37253ee5c261604987c8ac2b48ecb39a1e2c7b38a6715c9480f', 'customer-login', 1, '2026-09-11 12:31:36', NULL, '2026-09-11 12:31:36'),
('a10a59cc5c96b5d3574159a7d282aff6823283521bf5ff5de6828a12ce8e6bfe', 'customer-login', 1, '2026-09-09 23:20:19', NULL, '2026-09-09 23:20:19'),
('a3236cd2d1dd5590fd308fa6382fa75004fb95f9a53383469b612b8776b10286', 'verification-email-resend', 1, '2026-09-10 01:03:20', NULL, '2026-09-10 01:03:20'),
('a776bb267da16c2a4c864ca2c3fa129e97e571bfba36c21119ed6d261e30f851', 'customer-login', 1, '2026-09-11 10:30:03', NULL, '2026-09-11 10:30:03'),
('aa526970296540725d8e4187e2e60fbbb700fda4d8251e8362d57cdce04251c1', 'owner-login', 1, '2026-09-09 22:47:15', NULL, '2026-09-09 22:47:15'),
('aec3d757fd14792ebf2e580e83ead5791011097eab27d541b35d9ae30b4b10b7', 'owner-login', 1, '2026-09-11 12:53:28', NULL, '2026-09-11 12:53:28'),
('bcedda42f044d0dd4ab3ddc87c44b56c84322df399f8abdcea96c9a93b511e78', 'partner-registration', 1, '2026-09-09 23:46:11', NULL, '2026-09-09 23:46:11'),
('c06db1e4e48118dc386a7e21ef345b85b3357ea8d0561dfc844a2699206bc9f8', 'staff-access-code', 1, '2026-09-09 22:58:21', NULL, '2026-09-09 22:58:21'),
('c48a851985e0d93c6c523164f9e9c9e767b5c21d2dc37022eed6613c9d8cc5af', 'customer-checkout', 1, '2026-09-11 11:21:41', NULL, '2026-09-11 11:21:41'),
('c4b1717bf6514756903ca4cbaa2b197162839b82a212f7260958a0bf25fd1c62', 'staff-login', 2, '2026-09-11 12:58:47', NULL, '2026-09-11 12:58:50'),
('c5f9e0fbcefebbb714bd57118f67df4baa71b9f62a5c50508aaec34398a9e535', 'cashier-qr-scan', 1, '2026-09-11 12:59:06', NULL, '2026-09-11 12:59:06'),
('ca5ecbbbf77d5a270ac3430c7e5add8fb5f59d39cb6295a384ed1de21e0a19ed', 'owner-login', 4, '2026-09-10 10:26:45', NULL, '2026-09-10 10:29:06'),
('d04720295300247255037481570454ba0af9e6e9e455e534600570ba3e3b1375', 'cashier-qr-scan', 1, '2026-09-11 10:55:21', NULL, '2026-09-11 10:55:21'),
('d148033e693d34903ef48bf55847187f5e0ca9b0b1efd5537ef027dccd363201', 'staff-login', 2, '2026-09-11 12:20:56', NULL, '2026-09-11 12:22:52'),
('d1f998e21f9d173ff9f6dc857c6bd869fef2d3e304ad9756d93d8694343c9eb9', 'password-reset-submit', 1, '2026-09-11 12:02:54', NULL, '2026-09-11 12:02:54'),
('d41a70234f95d8891631e924b6b13a7035abd318b7c0fd803b3d96bbc72c6fe1', 'staff-login', 4, '2026-09-11 12:19:17', NULL, '2026-09-11 12:22:10'),
('da53466c8b41c502e6412d6fcdf0657a469f0f61c880614d679bb0951a82e4f5', 'staff-login', 3, '2026-09-11 12:12:17', NULL, '2026-09-11 12:16:21'),
('e7f9a2c5954a2f4fe5f13921d014843e81e58b41642c54dbd163a286d4aafc0e', 'customer-login', 2, '2026-09-11 12:00:42', NULL, '2026-09-11 12:03:16'),
('f2674376220d0b2707abf610f482dc22073c1dabd7d970b71ee3ddba97658b72', 'staff-login', 1, '2026-09-11 10:49:27', NULL, '2026-09-11 10:49:27'),
('f446aaa9a9b5946dc291dd0518bdc3541ccbd86e1e952105d08b84f6aa716ced', 'customer-checkout', 1, '2026-09-11 12:17:40', NULL, '2026-09-11 12:17:40'),
('f5d454bcb41fb7f3df0bb33af490bb033b1bd7ff5ae0255c88f85f03036407e7', 'customer-signup', 1, '2026-09-09 23:21:59', NULL, '2026-09-09 23:21:59'),
('f767a00d613ab1fbea48da5c03da9d8d63439208fd3cb278d37f505903ff3699', 'forgot-password', 1, '2026-09-11 12:02:15', NULL, '2026-09-11 12:02:15'),
('f95e9fd4d67404f2141a721f952e342509c43b6470b852376be298134106eedd', 'partner-registration', 1, '2026-09-11 10:34:33', NULL, '2026-09-11 10:34:33'),
('f9977422d52e51fdad22e7b6640401b7d24651299fee63bbdbab2c6a8addbe9d', 'customer-login', 1, '2026-09-11 12:56:45', NULL, '2026-09-11 12:56:45'),
('ff29c84848f6d1d30f1675f1112848836b8ca191ba8554741b628b50ebb68450', 'verification-email-resend', 1, '2026-09-09 23:51:37', NULL, '2026-09-09 23:51:37');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_receipt_print_jobs`
--

CREATE TABLE `tbl_receipt_print_jobs` (
  `print_job_id` bigint(20) UNSIGNED NOT NULL,
  `order_id` int(11) NOT NULL,
  `restaurant_id` int(11) NOT NULL,
  `print_kind` varchar(40) NOT NULL DEFAULT 'customer_receipt',
  `trigger_source` varchar(40) NOT NULL,
  `status` enum('pending','processing','processed','cancelled') NOT NULL DEFAULT 'pending',
  `claimed_by_user_id` int(11) DEFAULT NULL,
  `claimed_at` datetime DEFAULT NULL,
  `processed_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_receipt_print_jobs`
--

INSERT INTO `tbl_receipt_print_jobs` (`print_job_id`, `order_id`, `restaurant_id`, `print_kind`, `trigger_source`, `status`, `claimed_by_user_id`, `claimed_at`, `processed_at`, `created_at`) VALUES
(3952, 41, 6, 'customer_receipt', 'delivery_order', 'processed', 34, '2026-08-26 10:07:04', '2026-08-26 10:07:57', '2026-08-26 10:06:11'),
(3953, 41, 6, 'kitchen_ticket', 'delivery_order', 'processed', 34, '2026-08-26 10:08:03', '2026-08-26 10:08:27', '2026-08-26 10:06:11'),
(5475, 44, 6, 'customer_receipt', 'qr_verified', 'processed', 34, '2026-09-04 18:52:52', '2026-09-04 18:53:09', '2026-09-04 18:52:51'),
(5476, 44, 6, 'kitchen_ticket', 'qr_verified', 'processed', 34, '2026-09-04 18:53:10', '2026-09-04 18:53:13', '2026-09-04 18:52:51'),
(5542, 45, 6, 'customer_receipt', 'delivery_order', 'processed', 34, '2026-09-04 19:10:50', '2026-09-04 19:12:09', '2026-09-04 19:07:17'),
(5543, 45, 6, 'kitchen_ticket', 'delivery_order', 'processed', 34, '2026-09-04 19:12:10', '2026-09-04 19:12:12', '2026-09-04 19:07:17'),
(5545, 46, 6, 'customer_receipt', 'delivery_order', 'processed', 34, '2026-09-04 19:12:13', '2026-09-04 19:12:17', '2026-09-04 19:11:33'),
(5546, 46, 6, 'kitchen_ticket', 'delivery_order', 'processed', 34, '2026-09-04 19:12:19', '2026-09-04 19:12:22', '2026-09-04 19:11:33'),
(5637, 47, 6, 'customer_receipt', 'qr_verified', 'processed', 34, '2026-09-04 19:21:26', '2026-09-04 19:21:38', '2026-09-04 19:21:25'),
(5638, 47, 6, 'kitchen_ticket', 'qr_verified', 'processed', 34, '2026-09-04 19:21:40', '2026-09-04 19:21:45', '2026-09-04 19:21:25'),
(5648, 48, 6, 'customer_receipt', 'delivery_order', 'processed', 34, '2026-09-04 19:34:08', '2026-09-04 19:34:18', '2026-09-04 19:32:59'),
(5649, 48, 6, 'kitchen_ticket', 'delivery_order', 'processed', 34, '2026-09-04 19:34:18', '2026-09-04 19:34:22', '2026-09-04 19:32:59'),
(5739, 49, 6, 'customer_receipt', 'qr_verified', 'processed', 34, '2026-09-07 20:49:59', '2026-09-07 20:50:21', '2026-09-07 20:22:21'),
(5740, 49, 6, 'kitchen_ticket', 'qr_verified', 'processed', 34, '2026-09-07 20:50:24', '2026-09-07 20:50:30', '2026-09-07 20:22:21'),
(5975, 50, 6, 'customer_receipt', 'delivery_order', 'processed', 34, '2026-09-07 21:12:31', '2026-09-07 21:12:40', '2026-09-07 21:11:09'),
(5976, 50, 6, 'kitchen_ticket', 'delivery_order', 'processed', 34, '2026-09-07 21:12:43', '2026-09-07 21:12:47', '2026-09-07 21:11:09'),
(6030, 51, 6, 'customer_receipt', 'delivery_order', 'processed', 34, '2026-09-07 23:02:08', '2026-09-07 23:02:14', '2026-09-07 23:00:15'),
(6031, 51, 6, 'kitchen_ticket', 'delivery_order', 'processed', 34, '2026-09-07 23:02:16', '2026-09-07 23:02:19', '2026-09-07 23:00:15'),
(6235, 52, 6, 'customer_receipt', 'delivery_order', 'processed', 34, '2026-09-08 23:57:42', '2026-09-08 23:57:59', '2026-09-08 23:57:40'),
(6236, 52, 6, 'kitchen_ticket', 'delivery_order', 'processed', 34, '2026-09-08 23:58:00', '2026-09-08 23:58:03', '2026-09-08 23:57:40'),
(6422, 54, 6, 'customer_receipt', 'delivery_order', 'processed', 34, '2026-09-11 10:28:34', '2026-09-11 10:28:39', '2026-09-09 23:54:24'),
(6423, 54, 6, 'kitchen_ticket', 'delivery_order', 'processed', 34, '2026-09-11 10:28:42', '2026-09-11 10:28:45', '2026-09-09 23:54:24'),
(6424, 55, 6, 'customer_receipt', 'delivery_order', 'processed', 34, '2026-09-11 10:28:48', '2026-09-11 10:28:50', '2026-09-09 23:57:36'),
(6425, 55, 6, 'kitchen_ticket', 'delivery_order', 'processed', 34, '2026-09-11 10:28:51', '2026-09-11 10:28:53', '2026-09-09 23:57:36'),
(6469, 56, 6, 'customer_receipt', 'qr_verified', 'processed', 34, '2026-09-11 10:30:44', '2026-09-11 10:30:49', '2026-09-11 10:30:42'),
(6470, 56, 6, 'kitchen_ticket', 'qr_verified', 'processed', 34, '2026-09-11 10:30:50', '2026-09-11 10:30:53', '2026-09-11 10:30:42'),
(6627, 60, 10, 'customer_receipt', 'qr_verified', 'processed', 42, '2026-09-11 11:21:53', '2026-09-11 11:21:57', '2026-09-11 11:21:53'),
(6628, 60, 10, 'kitchen_ticket', 'qr_verified', 'processed', 42, '2026-09-11 11:21:58', '2026-09-11 11:22:00', '2026-09-11 11:21:53'),
(6651, 61, 10, 'customer_receipt', 'qr_verified', 'processed', 42, '2026-09-11 12:12:28', '2026-09-11 12:12:30', '2026-09-11 12:12:28'),
(6652, 61, 10, 'kitchen_ticket', 'qr_verified', 'processed', 42, '2026-09-11 12:12:31', '2026-09-11 12:12:32', '2026-09-11 12:12:28'),
(6676, 62, 10, 'customer_receipt', 'qr_verified', 'processed', 42, '2026-09-11 12:13:31', '2026-09-11 12:13:33', '2026-09-11 12:13:28'),
(6677, 62, 10, 'kitchen_ticket', 'qr_verified', 'processed', 42, '2026-09-11 12:13:34', '2026-09-11 12:13:36', '2026-09-11 12:13:28'),
(6699, 63, 10, 'customer_receipt', 'qr_verified', 'processed', 42, '2026-09-11 12:14:31', '2026-09-11 12:14:33', '2026-09-11 12:14:29'),
(6700, 63, 10, 'kitchen_ticket', 'qr_verified', 'processed', 42, '2026-09-11 12:14:38', '2026-09-11 12:14:39', '2026-09-11 12:14:29'),
(6721, 64, 6, 'customer_receipt', 'delivery_order', 'processed', 34, '2026-09-11 12:19:23', '2026-09-11 12:19:36', '2026-09-11 12:17:40'),
(6722, 64, 6, 'kitchen_ticket', 'delivery_order', 'processed', 34, '2026-09-11 12:19:37', '2026-09-11 12:19:42', '2026-09-11 12:17:40'),
(6743, 65, 6, 'customer_receipt', 'qr_verified', 'processed', 34, '2026-09-11 12:59:06', '2026-09-11 12:59:12', '2026-09-11 12:59:06'),
(6744, 65, 6, 'kitchen_ticket', 'qr_verified', 'processed', 34, '2026-09-11 12:59:13', '2026-09-11 12:59:18', '2026-09-11 12:59:06');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_restaurants`
--

CREATE TABLE `tbl_restaurants` (
  `restaurant_id` int(11) NOT NULL,
  `name` varchar(150) NOT NULL,
  `description` mediumtext DEFAULT NULL,
  `logo_path` varchar(255) DEFAULT NULL,
  `banner_path` varchar(255) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `contact_number` varchar(50) DEFAULT NULL,
  `opening_hours` varchar(100) DEFAULT NULL,
  `delivery_fee` decimal(10,2) NOT NULL DEFAULT 0.00,
  `order_types_json` longtext DEFAULT NULL,
  `business_status` enum('Open','Closed','Temporarily Unavailable') NOT NULL DEFAULT 'Open',
  `owner_id` int(11) NOT NULL,
  `staff_access_code` varchar(100) NOT NULL,
  `setup_completed` tinyint(1) NOT NULL DEFAULT 0,
  `customer_visibility` enum('Hidden','Visible') NOT NULL DEFAULT 'Hidden'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_restaurants`
--

INSERT INTO `tbl_restaurants` (`restaurant_id`, `name`, `description`, `logo_path`, `banner_path`, `address`, `contact_number`, `opening_hours`, `delivery_fee`, `order_types_json`, `business_status`, `owner_id`, `staff_access_code`, `setup_completed`, `customer_visibility`) VALUES
(6, 'Drop By Cafe', '?? All Day Breakfast & Pasta\n?? Coffee & Non-Coffee Drinks\n? Snacks and Pastries\n?? Air-Conditioned Area\n? Pet-Friendly Cafe\n? PS4 and Board Games\n?Books Collections\n? Free Wi-Fi\n?? Free Parking\n? Dine In / Take Out / Delivery/ Pick-Up', 'uploads/restaurant_logos/owner_27/restaurant_logo_20260815_022944_a228cfd995c94b93.jpg', '', 'Sabaro, Poblacion, City of Alaminos, Pangasinan, Philippines', '+639617879757', 'Mon-Sun 9:00 AM-7:00 PM', 70.00, '[\"dine-in\",\"takeout\",\"delivery\"]', 'Open', 27, 'FC-AE5A-8952', 1, 'Visible'),
(7, 'Jai\'s Grill and Resto', 'We are open for Dine-in, Take-out, Deliveries and Reservations.', 'uploads/restaurant_logos/owner_29/restaurant_logo_20260817_005008_3139dc32c8666fbe.jpg', NULL, 'EJR Building, Marcos Avenue, Palamis, City of Alaminos, Pangasinan, Philippines', '+639273980481', 'Mon-Sun 8:00 AM-8:00 PM', 50.00, '[\"dine-in\",\"takeout\",\"delivery\"]', 'Closed', 29, '263B4FBB1E92', 1, 'Hidden'),
(8, 'Alon\'s Cafe Alaminos', 'Japanese-Korean Cafe & Restaurant', 'uploads/restaurant_logos/owner_30/restaurant_logo_20260817_145830_ef31cd105a41575b.jpg', NULL, 'Ground floor, Davros Complex, M. Rabago St., San Jose Drive, Poblacion, City of Alaminos, Pangasinan, Philippines', '+639165843190', 'Mon-Sun 8:00 AM-8:00 PM', 50.00, '[\"dine-in\",\"takeout\",\"delivery\"]', 'Closed', 30, '29E976A07313', 1, 'Visible'),
(9, 'The Galley Pizza Alaminos Branch', '', 'uploads/restaurant_logos/owner_31/restaurant_logo_20260817_191225_f87ebff2ca452a19.jpg', NULL, 'C.P. Gracia St., Poblacion, City of Alaminos, Pangasinan, Philippines', '+639956327964', 'Mon-Sun 8:00 AM-8:00 PM', 50.00, '[\"dine-in\",\"takeout\",\"delivery\"]', 'Closed', 31, 'A7D344FDBF12', 1, 'Visible'),
(10, 'Bianca Cafe', 'BIANCA', 'uploads/restaurant_logos/owner_40/restaurant_logo_20260911_103829_b96d6aa058eec72d.jpg', '', 'Center Point, Poblacion, City of Alaminos, Pangasinan, Philippines, 2404', '+639876655444', 'Mon-Sun 8:00 AM-8:00 PM', 60.00, '[\"dine-in\",\"takeout\",\"delivery\"]', 'Open', 40, '052284DB0DBA', 1, 'Visible');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_restaurant_delivery_settings`
--

CREATE TABLE `tbl_restaurant_delivery_settings` (
  `restaurant_id` int(11) NOT NULL,
  `pricing_type` varchar(20) NOT NULL DEFAULT 'fixed',
  `base_fee` decimal(10,2) NOT NULL DEFAULT 0.00,
  `included_km` decimal(8,2) DEFAULT NULL,
  `extra_fee_per_km` decimal(10,2) DEFAULT NULL,
  `tiers_json` longtext DEFAULT NULL,
  `restaurant_latitude` decimal(10,8) DEFAULT NULL,
  `restaurant_longitude` decimal(11,8) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_restaurant_delivery_settings`
--

INSERT INTO `tbl_restaurant_delivery_settings` (`restaurant_id`, `pricing_type`, `base_fee`, `included_km`, `extra_fee_per_km`, `tiers_json`, `restaurant_latitude`, `restaurant_longitude`, `created_at`, `updated_at`) VALUES
(6, 'distance', 70.00, 5.00, 10.00, '[]', 16.15538570, 119.97922010, '2026-09-08 12:57:17', '2026-09-08 16:13:26'),
(7, 'fixed', 50.00, NULL, NULL, '[]', NULL, NULL, '2026-09-08 12:57:17', '2026-09-08 12:57:17'),
(8, 'fixed', 50.00, NULL, NULL, '[]', NULL, NULL, '2026-09-08 12:57:17', '2026-09-08 12:57:17'),
(9, 'fixed', 50.00, NULL, NULL, '[]', NULL, NULL, '2026-09-08 12:57:17', '2026-09-08 12:57:17'),
(10, 'distance', 60.00, 5.00, 10.00, '[]', 16.15427980, 119.97555537, '2026-09-11 02:40:36', '2026-09-11 02:40:36');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_stock_logs`
--

CREATE TABLE `tbl_stock_logs` (
  `log_id` int(11) NOT NULL,
  `restaurant_id` int(11) DEFAULT NULL,
  `product_id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `action_type` varchar(50) NOT NULL DEFAULT 'adjustment',
  `quantity` int(11) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `tbl_stock_logs`
--

INSERT INTO `tbl_stock_logs` (`log_id`, `restaurant_id`, `product_id`, `user_id`, `action_type`, `quantity`, `description`, `created_at`) VALUES
(1, 6, 55, 27, 'restock', 1, 'Restocked Chicken Poppers by 1 unit(s).', '2026-09-09 15:01:22'),
(2, 6, 49, 27, 'restock', 1, 'Restocked Drop Supreme Burger by 1 unit(s).', '2026-09-09 15:01:48'),
(4, 6, 56, 27, 'restock', 5, 'Restocked Combo Cravings by 5 unit(s).', '2026-09-11 04:27:43'),
(5, 6, 55, 27, 'restock', 3, 'Restocked Chicken Poppers by 3 unit(s).', '2026-09-11 04:27:56');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_users`
--

CREATE TABLE `tbl_users` (
  `user_id` int(11) NOT NULL,
  `restaurant_id` int(11) DEFAULT NULL,
  `role` varchar(30) NOT NULL,
  `first_name` varchar(100) DEFAULT NULL,
  `middle_name` varchar(100) DEFAULT NULL,
  `last_name` varchar(100) DEFAULT NULL,
  `email` varchar(150) NOT NULL,
  `contact_number` varchar(20) DEFAULT NULL,
  `address` mediumtext DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `must_change_password` tinyint(1) NOT NULL DEFAULT 0,
  `status` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `remember_token_hash` varchar(255) DEFAULT NULL,
  `remember_token_expires` datetime DEFAULT NULL,
  `reset_token_hash` varchar(255) DEFAULT NULL,
  `reset_token_expires` datetime DEFAULT NULL,
  `is_verified` tinyint(4) DEFAULT 0,
  `verification_token` varchar(255) DEFAULT NULL,
  `verification_expires_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_users`
--

INSERT INTO `tbl_users` (`user_id`, `restaurant_id`, `role`, `first_name`, `middle_name`, `last_name`, `email`, `contact_number`, `address`, `password_hash`, `must_change_password`, `status`, `created_at`, `remember_token_hash`, `remember_token_expires`, `reset_token_hash`, `reset_token_expires`, `is_verified`, `verification_token`, `verification_expires_at`) VALUES
(12, NULL, 'customer', 'Cj', 'Tamayo', 'Porto', 'carlosjaymiguel67@gmail.com', '', '1234 Hello, Poblacion, City of Alaminos, Pangasinan, Philippines', '$2y$10$0pZX3FKO7GjRcebhrx2ZdOERZNfE4SZh9cfJQ5D6pvAhDgxtiv/IO', 0, 1, '2026-03-01 14:15:54', NULL, NULL, NULL, NULL, 1, NULL, NULL),
(17, NULL, 'admin', 'Carlos Jay Miguel T. Porto', NULL, NULL, 'foodconnectv1@gmail.com', '+639457309228', NULL, '$2y$10$HExF9FmCKV0GMnEDRHWJT.T.e4BrRlL.ywOLwBm7dc43c6R1m0Xvq', 0, 1, '2026-07-16 06:02:12', NULL, NULL, NULL, NULL, 1, NULL, NULL),
(27, 6, 'owner', 'Jemillene ', NULL, 'Laurente', 'gelracho07@gmail.com', '+639295096884', NULL, '$2y$10$/iRsgy9Txea.Qjnc55PHd.G0o8WegRV3MIIIUviSubye8MgY8G9OC', 0, 1, '2026-08-14 18:29:16', NULL, NULL, NULL, NULL, 1, NULL, NULL),
(28, NULL, 'owner', 'Mary Joy Peralta', NULL, NULL, 'ianc18864@gmail.com', '+639273980482', NULL, '$2y$10$plWaoFzqAxvICs1n2suZDO/2vixRFzckzL4D9iXCGbVrGCYX3J25i', 0, 0, '2026-08-16 16:14:17', NULL, NULL, NULL, NULL, 0, 'f202e730ca554b00b16a39c7a5237834795979619b2eda3ddd04a9d7f8d5a08c', '2026-08-18 00:14:20'),
(29, 7, 'owner', 'Mary Joy Peralta', NULL, NULL, 'jaisfc2026@gmail.com', '+639273980481', NULL, '$2y$10$fc6cWhi8Iwgw7dFbi8Fy0O.SYjUnC4zjedPITeolCiDbx82to9oSe', 0, 1, '2026-08-16 16:33:17', NULL, NULL, NULL, NULL, 1, NULL, NULL),
(30, 8, 'owner', 'Rizza D. Ranoy', NULL, NULL, 'alonsfc67@gmail.com', '+639165843190', NULL, '$2y$10$WLsZSXZsNfMFEqLuRxyLEuy./Or1MOZfA40HtQgrFZKLAxmhJdIiq', 0, 1, '2026-08-17 06:43:03', NULL, NULL, NULL, NULL, 1, NULL, NULL),
(31, 9, 'owner', 'Dary Apolinario Castro', NULL, NULL, 'galleyfc8@gmail.com', '+639956327964', NULL, '$2y$10$2dY7d8qpfSzCGRlUiMoewO5HAWgoxs74g5vcdLCZ.1ATGpk1CVRlC', 0, 1, '2026-08-17 11:10:39', NULL, NULL, NULL, NULL, 1, NULL, NULL),
(32, NULL, 'customer', 'Gel', 'Racho', 'Recepcion', 'eeegggihtloh@gmail.com', '+639295096884', 'V. Racho St., San Roque, City of Alaminos, Pangasinan, Philippines', '$2y$10$S2uADG/Gnwp1RWf2/5.LiutBJkGa10Vf9c2DsQ0riVxGcx3vFEfUe', 0, 1, '2026-08-25 13:11:30', '$2y$10$2hEcls6Xh32CLVG3NsgVO.zr3QxAH1WFpZy54SvNcZxeW30fGkUpO', '2026-09-24 21:13:12', NULL, NULL, 1, NULL, NULL),
(33, 6, 'delivery_staff', 'Ian Reigh', 'P', 'Dela Cruz', 'iandelacruz@gmail.com', '+639123456788', 'Ene, Bolaney, City of Alaminos, Pangasinan, Philippines', '$2y$10$IyFnVJShQvXMcqeHOno9bO1sQMmKJUD.eTrZd/J693ssOhnkNZ8R2', 1, 1, '2026-08-25 13:27:10', NULL, NULL, NULL, NULL, 1, NULL, NULL),
(34, 6, 'cashier', 'Angel', '', 'Recepcion', 'angelrecep123@gmail.com', '+639112233443', 'Basta, San Roque, City of Alaminos, Pangasinan, Philippines', '$2y$10$A.ks7wrNOmb41cLE13pXueHJqYWC/3XFlXxAJfAcob4tURzZy0Yya', 0, 1, '2026-08-25 13:29:58', NULL, NULL, NULL, NULL, 1, NULL, NULL),
(35, 6, 'delivery_staff', 'Andoy', 'Humilde', 'Bangal', 'andoykuhonta@gmail.com', '+639123456666', 'Eme lang, Poblacion, City of Alaminos, Pangasinan, Philippines', '$2y$10$B44qOP6TQfyK5Eg7ANQDqu9qmy5w.F5z5CYvY8B6nrnJ08NTKe8nC', 0, 1, '2026-09-04 11:04:51', NULL, NULL, NULL, NULL, 1, NULL, NULL),
(36, NULL, 'customer', 'Micah', 'Ranit', 'Romasoc', 'romasocmicah@gmail.com', NULL, NULL, '$2y$10$Nl8o/bJR0H6uXR4h.4x4lujNTbbmgFhd3mC6x8FH1w1Ee2eXyOXPm', 0, 1, '2026-09-09 15:00:04', NULL, NULL, NULL, NULL, 0, 'cbdf35511aa6d66da353afc34fb18c38', '2026-09-10 23:00:04'),
(37, NULL, 'customer', 'Micah', 'Ranit', 'Romasoc', 'galvxny@gmail.com', NULL, NULL, '$2y$10$N.JIZ6xpUelcMxreEoEe8.bvDeyKDIGTaX7DQQKFQsJW1t37mirr2', 0, 1, '2026-09-09 15:21:06', NULL, NULL, NULL, NULL, 1, NULL, NULL),
(38, NULL, 'customer', 'Joms', 'Joms', 'Joms', 'xcontravis@gmail.com', NULL, NULL, '$2y$10$HOPzCkfNY4EqmvVzOg0akOyGCy9nXerWGUR5CAep7DZQX5EmJmS36', 0, 1, '2026-09-09 15:22:00', NULL, NULL, NULL, NULL, 0, '6b6e021c32502cd1ec34634293c93142', '2026-09-10 23:22:00'),
(40, 10, 'owner', 'Bianca', '', 'Cacho', 'acadsonly67@gmail.com', '+639876655444', NULL, '$2y$10$88SAewL.tutS/p56cytUKeVcxnbSyFmHqW0AFjKvjVL8yh9B5rOWO', 0, 1, '2026-09-11 02:34:33', NULL, NULL, NULL, NULL, 1, NULL, NULL),
(41, 10, 'delivery_staff', 'Cj', '', 'Porto', 'cjporto@gmail.com', '+639887766655', 'YYYY, Poblacion, City of Alaminos, Pangasinan, Philippines', '$2y$10$DIhI/V/b9KHTGAZSYoSSGu5aMRMNl7LPsSjSr2NvZuWO0ZC6cXdVq', 0, 1, '2026-09-11 02:42:44', NULL, NULL, NULL, NULL, 1, NULL, NULL),
(42, 10, 'cashier', 'Cherry', '', 'Dacdacc', 'cherry@gmail.com', '+639887665666', '1234, Balangobong, City of Alaminos, Pangasinan, Philippines', '$2y$10$QDLJ1W.CR5A9Cf0WumpUKujFn.FTigJehB/4Mje9AUEBizP5poOC2', 1, 1, '2026-09-11 03:17:11', NULL, NULL, NULL, NULL, 1, NULL, NULL),
(46, NULL, 'customer', 'Dan', 'R', 'De Leon', 'jameslee050505051@gmail.com', '+639123456789', '123, Pogo, City of Alaminos, Pangasinan, Philippines', '$2y$10$OmBPoyGwLAVH7QaSJtlJC.9KYGRZcUbwtXBItPnzBfMR04.LzM4cC', 0, 1, '2026-09-11 03:58:34', '$2y$10$QY5sj7k66a0/TVlbS2O3XOUfYdIraBO2T21.g6GkZFVSTAJ7c5epe', '2026-10-11 12:56:46', NULL, NULL, 1, NULL, NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `tbl_activity_logs`
--
ALTER TABLE `tbl_activity_logs`
  ADD PRIMARY KEY (`log_id`);

--
-- Indexes for table `tbl_address_cache`
--
ALTER TABLE `tbl_address_cache`
  ADD PRIMARY KEY (`cache_id`),
  ADD UNIQUE KEY `uq_address_cache_result` (`normalized_query`,`latitude`,`longitude`),
  ADD KEY `idx_address_cache_query_position` (`normalized_query`,`result_position`),
  ADD KEY `idx_address_cache_last_used` (`last_used_at`),
  ADD KEY `idx_address_cache_expires` (`expires_at`);

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
  ADD PRIMARY KEY (`cart_id`),
  ADD KEY `idx_cart_user_cart` (`user_id`,`cart_id`);

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
  ADD KEY `idx_delivery_rider` (`delivery_staff_id`),
  ADD KEY `idx_delivery_assigned_by` (`assigned_by_user_id`),
  ADD KEY `idx_delivery_status` (`delivery_status`);

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
  ADD KEY `idx_orders_processed_cashier` (`processed_by_cashier_id`),
  ADD KEY `idx_orders_payment_status` (`payment_status`),
  ADD KEY `idx_orders_restaurant_status_order` (`restaurant_id`,`order_status`,`order_id`);

--
-- Indexes for table `tbl_order_items`
--
ALTER TABLE `tbl_order_items`
  ADD PRIMARY KEY (`order_item_id`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `product_id` (`product_id`),
  ADD KEY `combo_id` (`combo_id`);

--
-- Indexes for table `tbl_owner_password_reset_requests`
--
ALTER TABLE `tbl_owner_password_reset_requests`
  ADD PRIMARY KEY (`request_id`),
  ADD KEY `idx_owner_password_reset_owner` (`owner_id`,`request_status`,`created_at`),
  ADD KEY `idx_owner_password_reset_status` (`request_status`,`created_at`),
  ADD KEY `idx_owner_password_reset_restaurant` (`restaurant_id`),
  ADD KEY `idx_owner_password_reset_reviewer` (`reviewed_by`);

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
-- Indexes for table `tbl_partner_application_documents`
--
ALTER TABLE `tbl_partner_application_documents`
  ADD PRIMARY KEY (`document_id`),
  ADD UNIQUE KEY `uq_application_document_type` (`application_id`,`document_type`),
  ADD KEY `idx_verification_owner` (`owner_id`);

--
-- Indexes for table `tbl_payments`
--
ALTER TABLE `tbl_payments`
  ADD PRIMARY KEY (`payment_id`),
  ADD UNIQUE KEY `uq_payments_reference_number` (`reference_number`),
  ADD UNIQUE KEY `uq_payments_checkout_session` (`checkout_session_id`),
  ADD KEY `idx_payments_order_id` (`order_id`),
  ADD KEY `idx_payments_restaurant_id` (`restaurant_id`),
  ADD KEY `idx_payments_order_restaurant` (`order_id`,`restaurant_id`),
  ADD KEY `idx_payments_status` (`payment_status`);

--
-- Indexes for table `tbl_products`
--
ALTER TABLE `tbl_products`
  ADD PRIMARY KEY (`product_id`),
  ADD KEY `idx_products_restaurant_product` (`restaurant_id`,`product_id`),
  ADD KEY `idx_products_restaurant_type_status` (`restaurant_id`,`item_type`,`status`,`product_id`);

--
-- Indexes for table `tbl_product_addon_links`
--
ALTER TABLE `tbl_product_addon_links`
  ADD PRIMARY KEY (`link_id`),
  ADD UNIQUE KEY `uq_product_addon_group` (`restaurant_id`,`product_name`,`product_category`,`addon_product_id`),
  ADD KEY `idx_product_addon_group` (`restaurant_id`,`product_name`,`product_category`),
  ADD KEY `idx_product_addon_id` (`addon_product_id`);

--
-- Indexes for table `tbl_rate_limits`
--
ALTER TABLE `tbl_rate_limits`
  ADD PRIMARY KEY (`rate_limit_key`),
  ADD KEY `idx_rate_limits_updated_at` (`updated_at`),
  ADD KEY `idx_rate_limits_scope` (`scope_name`);

--
-- Indexes for table `tbl_receipt_print_jobs`
--
ALTER TABLE `tbl_receipt_print_jobs`
  ADD PRIMARY KEY (`print_job_id`),
  ADD UNIQUE KEY `uq_receipt_first_print` (`order_id`,`print_kind`),
  ADD KEY `idx_receipt_print_restaurant_status` (`restaurant_id`,`status`,`created_at`),
  ADD KEY `idx_receipt_print_claimed_user` (`claimed_by_user_id`);

--
-- Indexes for table `tbl_restaurants`
--
ALTER TABLE `tbl_restaurants`
  ADD PRIMARY KEY (`restaurant_id`),
  ADD KEY `fk_owner` (`owner_id`),
  ADD KEY `idx_restaurants_public_visibility` (`setup_completed`,`customer_visibility`,`restaurant_id`);

--
-- Indexes for table `tbl_restaurant_delivery_settings`
--
ALTER TABLE `tbl_restaurant_delivery_settings`
  ADD PRIMARY KEY (`restaurant_id`),
  ADD KEY `idx_delivery_pricing_type` (`pricing_type`);

--
-- Indexes for table `tbl_stock_logs`
--
ALTER TABLE `tbl_stock_logs`
  ADD PRIMARY KEY (`log_id`),
  ADD KEY `product_id` (`product_id`),
  ADD KEY `idx_stock_logs_restaurant_created` (`restaurant_id`,`created_at`),
  ADD KEY `idx_stock_logs_user` (`user_id`);

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
  MODIFY `log_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=892;

--
-- AUTO_INCREMENT for table `tbl_address_cache`
--
ALTER TABLE `tbl_address_cache`
  MODIFY `cache_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT for table `tbl_admin_login_attempts`
--
ALTER TABLE `tbl_admin_login_attempts`
  MODIFY `attempt_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=123;

--
-- AUTO_INCREMENT for table `tbl_cart`
--
ALTER TABLE `tbl_cart`
  MODIFY `cart_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=88;

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
  MODIFY `assignment_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `tbl_notification_reads`
--
ALTER TABLE `tbl_notification_reads`
  MODIFY `notification_read_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=96;

--
-- AUTO_INCREMENT for table `tbl_orders`
--
ALTER TABLE `tbl_orders`
  MODIFY `order_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=66;

--
-- AUTO_INCREMENT for table `tbl_order_items`
--
ALTER TABLE `tbl_order_items`
  MODIFY `order_item_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=91;

--
-- AUTO_INCREMENT for table `tbl_owner_password_reset_requests`
--
ALTER TABLE `tbl_owner_password_reset_requests`
  MODIFY `request_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `tbl_owner_trusted_devices`
--
ALTER TABLE `tbl_owner_trusted_devices`
  MODIFY `trusted_device_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=56;

--
-- AUTO_INCREMENT for table `tbl_partner_applications`
--
ALTER TABLE `tbl_partner_applications`
  MODIFY `application_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `tbl_partner_application_documents`
--
ALTER TABLE `tbl_partner_application_documents`
  MODIFY `document_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `tbl_payments`
--
ALTER TABLE `tbl_payments`
  MODIFY `payment_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `tbl_products`
--
ALTER TABLE `tbl_products`
  MODIFY `product_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=618;

--
-- AUTO_INCREMENT for table `tbl_product_addon_links`
--
ALTER TABLE `tbl_product_addon_links`
  MODIFY `link_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=462;

--
-- AUTO_INCREMENT for table `tbl_receipt_print_jobs`
--
ALTER TABLE `tbl_receipt_print_jobs`
  MODIFY `print_job_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6764;

--
-- AUTO_INCREMENT for table `tbl_restaurants`
--
ALTER TABLE `tbl_restaurants`
  MODIFY `restaurant_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `tbl_stock_logs`
--
ALTER TABLE `tbl_stock_logs`
  MODIFY `log_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `tbl_users`
--
ALTER TABLE `tbl_users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=47;

--
-- Constraints for dumped tables
--

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
  ADD CONSTRAINT `fk_delivery_assigned_by` FOREIGN KEY (`assigned_by_user_id`) REFERENCES `tbl_users` (`user_id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_delivery_order` FOREIGN KEY (`order_id`) REFERENCES `tbl_orders` (`order_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_delivery_restaurant` FOREIGN KEY (`restaurant_id`) REFERENCES `tbl_restaurants` (`restaurant_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_delivery_rider` FOREIGN KEY (`delivery_staff_id`) REFERENCES `tbl_users` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;

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
-- Constraints for table `tbl_owner_password_reset_requests`
--
ALTER TABLE `tbl_owner_password_reset_requests`
  ADD CONSTRAINT `fk_owner_password_reset_owner` FOREIGN KEY (`owner_id`) REFERENCES `tbl_users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_owner_password_reset_restaurant` FOREIGN KEY (`restaurant_id`) REFERENCES `tbl_restaurants` (`restaurant_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_owner_password_reset_reviewer` FOREIGN KEY (`reviewed_by`) REFERENCES `tbl_users` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;

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
-- Constraints for table `tbl_partner_application_documents`
--
ALTER TABLE `tbl_partner_application_documents`
  ADD CONSTRAINT `fk_verification_application` FOREIGN KEY (`application_id`) REFERENCES `tbl_partner_applications` (`application_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_verification_owner` FOREIGN KEY (`owner_id`) REFERENCES `tbl_users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `tbl_payments`
--
ALTER TABLE `tbl_payments`
  ADD CONSTRAINT `fk_payments_order` FOREIGN KEY (`order_id`) REFERENCES `tbl_orders` (`order_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_payments_restaurant` FOREIGN KEY (`restaurant_id`) REFERENCES `tbl_restaurants` (`restaurant_id`) ON UPDATE CASCADE;

--
-- Constraints for table `tbl_product_addon_links`
--
ALTER TABLE `tbl_product_addon_links`
  ADD CONSTRAINT `fk_product_addon_product` FOREIGN KEY (`addon_product_id`) REFERENCES `tbl_products` (`product_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_product_addon_restaurant` FOREIGN KEY (`restaurant_id`) REFERENCES `tbl_restaurants` (`restaurant_id`) ON DELETE CASCADE;

--
-- Constraints for table `tbl_receipt_print_jobs`
--
ALTER TABLE `tbl_receipt_print_jobs`
  ADD CONSTRAINT `fk_receipt_print_claimed_user` FOREIGN KEY (`claimed_by_user_id`) REFERENCES `tbl_users` (`user_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_receipt_print_order` FOREIGN KEY (`order_id`) REFERENCES `tbl_orders` (`order_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_receipt_print_restaurant` FOREIGN KEY (`restaurant_id`) REFERENCES `tbl_restaurants` (`restaurant_id`) ON DELETE CASCADE;

--
-- Constraints for table `tbl_restaurants`
--
ALTER TABLE `tbl_restaurants`
  ADD CONSTRAINT `fk_owner` FOREIGN KEY (`owner_id`) REFERENCES `tbl_users` (`user_id`);

--
-- Constraints for table `tbl_stock_logs`
--
ALTER TABLE `tbl_stock_logs`
  ADD CONSTRAINT `fk_stock_logs_restaurant` FOREIGN KEY (`restaurant_id`) REFERENCES `tbl_restaurants` (`restaurant_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_stock_logs_user` FOREIGN KEY (`user_id`) REFERENCES `tbl_users` (`user_id`) ON DELETE SET NULL,
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
