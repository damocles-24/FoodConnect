-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Aug 15, 2026 at 01:25 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.1.25

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
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
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
(40, 4, 12, 'customer', 'order', 'New Customer Order', 'Cj Tamayo Porto placed Order #2 / Queue #2.', '2026-08-02 14:19:03'),
(41, 4, 12, 'customer', 'order', 'New Customer Order', 'Cj Tamayo Porto placed Order #3 / Queue #3.', '2026-08-02 14:49:01'),
(42, 4, 22, 'owner', 'staff', 'Staff Access Code Updated', 'The restaurant owner generated a new staff access code.', '2026-08-02 15:13:26'),
(43, 4, 12, 'customer', 'order', 'New Customer Order', 'Cj Tamayo Porto placed Order #4 / Queue #4.', '2026-08-02 15:14:33'),
(44, 4, 22, 'owner', 'staff', 'Staff Account Created', 'Test Cashier was added as cashier.', '2026-08-02 15:36:20'),
(45, 4, 22, 'owner', 'staff', 'Staff Account Created', 'Test Cashier was added as cashier.', '2026-08-02 15:36:20'),
(46, 4, 12, 'customer', 'order', 'New Customer Order', 'Test customer v1 placed Order #5 / Queue #5.', '2026-08-02 15:39:00'),
(47, 4, 22, 'owner', 'staff', 'Staff Account Updated', 'Cj Tamayo Porto\'s staff account was updated.', '2026-08-03 10:15:47'),
(48, 4, 22, 'owner', 'staff', 'Staff Account Updated', 'Cj Tamayo Porto\'s staff account was updated.', '2026-08-03 10:15:53'),
(49, 4, 22, 'owner', 'staff', 'Staff Account Updated', 'Test Cashier\'s staff account was updated.', '2026-08-03 10:16:00'),
(50, 4, 22, 'owner', 'staff', 'Staff Account Updated', 'Test Cashier\'s staff account was updated.', '2026-08-03 10:32:08'),
(51, 4, 22, 'owner', 'inventory', 'Inventory Restocked', 'tapsilog was restocked by 5.', '2026-08-03 11:50:28'),
(52, 4, 12, 'customer', 'order', 'New Customer Order', 'test act logs cancel cashier placed Order #6 / Queue #1.', '2026-08-03 13:06:18'),
(53, 4, 23, 'cashier', 'order', 'Order #6 Cancelled', 'Test Cashier (Cashier) cancelled Queue #1, Order #6 for test act logs cancel cashier. Order type: Dine-in. Amount affected: ₱99,999,999.99. Reason: Item is unavailable. Inventory: 2 stock units restored.', '2026-08-03 13:06:38'),
(54, 4, 12, 'customer', 'order', 'New Customer Order', 'injel placed Order #7 / Queue #2.', '2026-08-03 13:25:34'),
(55, 4, 23, 'cashier', 'order', 'Order #7 Cancelled', 'Test Cashier (Cashier) cancelled Queue #2, Order #7 for injel. Order type: Dine-in. Amount affected: ₱100.00. Reason: Insufficient stock. Inventory: 1 stock unit restored.', '2026-08-03 13:27:52'),
(56, 4, 12, 'customer', 'order', 'New Customer Order', 'hahahah inamo placed Order #8 / Queue #3.', '2026-08-03 13:41:53'),
(57, 4, 12, 'customer', 'order', 'Customer Cancelled Order', 'hahahah inamo cancelled Queue #3, Order #8. Order type: Dine-in. Amount affected: ₱100.00. Reason: Duplicate order. Inventory: 1 stock unit restored.', '2026-08-03 13:42:14'),
(58, 4, 12, 'customer', 'order', 'New Customer Order', 'hshwhshhw placed Order #9 / Queue #4.', '2026-08-03 13:43:19'),
(59, 4, 12, 'customer', 'order', 'Customer Cancelled Order', 'hshwhshhw cancelled Queue #4, Order #9. Order type: Dine-in. Amount affected: ₱100.00. Reason: Changed my mind. Inventory: 1 stock unit restored.', '2026-08-03 13:44:01'),
(60, 4, 12, 'customer', 'order', 'New Customer Order', 'Ian Dela cruz placed Order #10 / Queue #5.', '2026-08-03 14:04:32'),
(61, 4, 12, 'customer', 'order', 'Customer Cancelled Order', 'Ian Dela cruz cancelled Queue #5, Order #10. Order type: Dine-in. Amount affected: ₱200.00. Reason: Changed my mind. Inventory: 1 stock unit restored.', '2026-08-03 14:04:50'),
(62, 4, 12, 'customer', 'order', 'New Customer Order', 'Cegee placed Order #11 / Queue #6.', '2026-08-03 14:33:18'),
(63, 4, 12, 'customer', 'order', 'Customer Cancelled Order', 'Cegee cancelled Queue #6, Order #11. Order type: Dine-in. Amount affected: ₱200.00. Reason: Duplicate order. Inventory: 1 stock unit restored.', '2026-08-03 14:35:30'),
(64, 4, 12, 'customer', 'order', 'New Customer Order', 'Unmam placed Order #12 / Queue #7.', '2026-08-03 15:21:37'),
(65, 4, 12, 'customer', 'order', 'Customer Cancelled Order', 'Unmam cancelled Queue #7, Order #12. Order type: Dine-in. Amount affected: ₱99,999,999.99. Reason: Changed my mind. Inventory: 1 stock unit restored.', '2026-08-03 15:22:01'),
(66, 4, 22, 'owner', 'product', 'Product Added', 'Chicksilog was added to the menu.', '2026-08-04 04:42:21'),
(67, 4, 22, 'owner', 'product', 'Product Added', 'Hamsilog was added to the menu.', '2026-08-04 05:48:31'),
(68, 4, 22, 'owner', 'product', 'Product Added', 'Added product \"Burerss\" under Burgir. Price: ₱20.00. Initial stock: 10. Status: Available. Promotion: No promotion.', '2026-08-04 06:19:45'),
(69, 4, 22, 'owner', 'product', 'Product Added', 'Product: Vanilla\nCategory: Iced Coffee\nVariant: Regular * Large\nPrice: ₱38.00\nInitial Stock: 10\nStatus: Available\nPromotion: None', '2026-08-04 06:23:51'),
(70, 4, 22, 'owner', 'product', 'Product Updated', 'tapsilog was updated.', '2026-08-04 06:37:05'),
(71, 4, 22, 'owner', 'product', 'Product Updated', 'Product: Vanilla\nChanges:\nPrice: ₱38.00 → ₱39.00', '2026-08-04 06:52:36'),
(72, 4, 22, 'owner', 'inventory', 'Inventory Restocked', 'Product: Vanilla\nCategory: Iced Coffee\nVariant: Regular * Large\nQuantity Added: 5\nStock: 10 → 15', '2026-08-04 07:13:51'),
(73, 4, 22, 'owner', 'system', 'Settings Updated', 'Restaurant settings were updated.', '2026-08-04 14:44:30'),
(74, 4, 22, 'owner', 'staff', 'Staff Access Code Updated', 'The restaurant owner generated a new staff access code.', '2026-08-04 15:47:44'),
(75, 4, 22, 'owner', 'staff', 'Staff Access Code Updated', 'The restaurant owner generated a new staff access code.', '2026-08-04 15:47:52'),
(76, 4, 22, 'owner', 'staff', 'Staff Account Updated', 'Test Cashier\'s staff account was updated.', '2026-08-04 15:48:22'),
(77, 4, 22, 'owner', 'staff', 'Staff Account Updated', 'Test Cashier\'s staff account was updated.', '2026-08-04 15:48:40'),
(78, 4, 22, 'owner', 'system', 'Settings Updated', 'Restaurant settings were updated.', '2026-08-04 15:51:58'),
(79, 4, 22, 'owner', 'staff', 'Staff Account Created', 'Test Driver was added as delivery staff.', '2026-08-05 13:18:26'),
(80, 4, 22, 'owner', 'staff', 'Staff Account Created', 'Test Driver was added as delivery_staff.', '2026-08-05 13:18:26'),
(81, 4, 12, 'customer', 'order', 'New Customer Order', 'Cj porto placed Order #13 / Queue #1.', '2026-08-06 15:55:48'),
(82, 4, 23, 'cashier', 'order', 'Order Status Updated', 'Test Cashier (Cashier) changed Order #13 from Pending to Preparing.', '2026-08-07 05:33:08'),
(83, 4, 23, NULL, 'delivery_assignment', 'Rider Assigned', 'Test Driver was assigned and automatically accepted delivery Order #13.', '2026-08-07 05:33:16'),
(84, 4, 24, NULL, 'delivery_status', 'Order Picked Up', 'The rider picked up delivery Order #13 from the restaurant.', '2026-08-07 05:36:36'),
(85, 4, 24, NULL, 'delivery_status', 'Out for Delivery', 'Delivery Order #13 is now out for delivery.', '2026-08-07 05:36:42'),
(86, 4, 24, NULL, 'delivery_status', 'Delivery Completed', 'Delivery Order #13 was completed successfully.', '2026-08-09 06:41:25'),
(87, 4, 12, 'customer', 'order', 'New Customer Order', 'Ha??hatdog placed Order #14 / Queue #1.', '2026-08-09 06:57:49'),
(88, 4, 23, 'cashier', 'order', 'Order Status Updated', 'Test Cashier (Cashier) changed Order #14 from Pending to Preparing.', '2026-08-09 06:58:36'),
(89, 4, 23, NULL, 'delivery_assignment', 'Rider Assigned', 'Test Driver was assigned and automatically accepted delivery Order #14.', '2026-08-09 06:58:53'),
(90, 4, 24, NULL, 'delivery_status', 'Order Picked Up', 'The rider picked up delivery Order #14 from the restaurant.', '2026-08-09 06:59:11'),
(91, 4, 24, NULL, 'delivery_status', 'Out for Delivery', 'Delivery Order #14 is now out for delivery.', '2026-08-09 06:59:14'),
(92, 4, 24, NULL, 'delivery_status', 'Delivery Completed', 'Delivery Order #14 was completed successfully.', '2026-08-09 07:05:11'),
(93, 4, 12, 'customer', 'order', 'New Customer Order', 'Cj Tamayo Porto placed Order #15 / Queue #2.', '2026-08-09 07:07:44'),
(94, 4, 23, 'cashier', 'order', 'Order Status Updated', 'Test Cashier (Cashier) changed Order #15 from Pending to Preparing.', '2026-08-09 07:08:34'),
(95, 4, 23, NULL, 'delivery_assignment', 'Rider Assigned', 'Test Driver was assigned and automatically accepted delivery Order #15.', '2026-08-09 07:08:44'),
(96, 4, 24, NULL, 'delivery_status', 'Order Picked Up', 'The rider picked up delivery Order #15 from the restaurant.', '2026-08-09 07:09:22'),
(97, 4, 24, NULL, 'delivery_status', 'Out for Delivery', 'Delivery Order #15 is now out for delivery.', '2026-08-09 07:11:21'),
(98, 4, 24, NULL, 'delivery_status', 'Delivery Completed', 'Delivery Order #15 was completed successfully.', '2026-08-09 07:14:20'),
(99, 4, 22, 'owner', 'product', 'Product Added', 'Product: dawwadwaawd\nCategory: awdddwadwadwaaawda\nPrice: ₱2,412.00\nInitial Stock: 0\nStatus: Available\nPromotion: None', '2026-08-09 12:44:48'),
(100, 4, 22, 'owner', 'product', 'Product Added', 'Product: wearewwww\nCategory: 23123123\nPrice: ₱2,441,456,564.00\nInitial Stock: 5\nStatus: Available\nPromotion: None', '2026-08-09 12:45:06'),
(101, 4, 12, 'customer', 'order', 'New Customer Order', 'test rpint placed Order #16 / Queue #3.', '2026-08-09 14:29:20'),
(102, 4, 12, 'customer', 'order', 'New Customer Order', 'Test print placed Order #17 / Queue #4.', '2026-08-09 14:45:41'),
(103, 4, 12, 'customer', 'order', 'New Customer Order', 'dwaadwaawd placed Order #18 / Queue #5.', '2026-08-09 15:07:46'),
(104, 4, 12, 'customer', 'order', 'New Customer Order', 'cj porto placed Order #19 / Queue #6.', '2026-08-09 15:16:44'),
(105, 4, 12, 'customer', 'order', 'New Customer Order', 'waddwawadwadwa placed Order #20 / Queue #1.', '2026-08-10 14:04:51'),
(106, 4, 12, 'customer', 'order', 'New Customer Order', 'cj urtu placed Order #21 / Queue #2.', '2026-08-10 14:18:24'),
(107, 4, 12, 'customer', 'order', 'New Customer Order', 'last print test placed Order #22 / Queue #3.', '2026-08-10 14:26:23'),
(108, 4, 23, 'cashier', 'receipt_print_request', 'Customer receipt Print Requested', 'Customer receipt print requested for Order #5 by Test Cashier (Cashier).', '2026-08-10 15:12:51'),
(109, 4, 23, 'cashier', 'receipt_print_request', 'Kitchen ticket Print Requested', 'Kitchen ticket print requested for Order #5 by Test Cashier (Cashier).', '2026-08-10 15:13:45'),
(110, 4, 23, 'cashier', 'receipt_print_request', 'Customer receipt Print Requested', 'Customer receipt print requested for Order #5 by Test Cashier (Cashier).', '2026-08-10 15:18:39'),
(111, 4, 12, 'customer', 'order', 'New Customer Order', 'Cjmt42 placed Order #23 / Queue #1.', '2026-08-13 06:50:18'),
(112, 4, 12, 'customer', 'order', 'New Customer Order', 'heheheue828292 placed Order #24 / Queue #2.', '2026-08-13 07:17:43'),
(113, 4, 12, 'customer', 'order', 'New Customer Order', 'Test paymongo placed Order #25 / Queue #3.', '2026-08-13 14:41:11'),
(114, 4, 12, 'customer', 'order', 'New Customer Order', 'test paymongo deliverty placed Order #26 / Queue #4.', '2026-08-13 15:08:51'),
(115, 4, 12, 'customer', 'order', 'New Customer Order', 'cawa placed Order #27 / Queue #1.', '2026-08-14 15:53:08'),
(116, 4, 12, 'customer', 'order', 'New Customer Order', 'wdawdaadw placed Order #28 / Queue #1.', '2026-08-14 16:01:57'),
(117, 4, 12, 'customer', 'order', 'Customer Cancelled Order', 'wdawdaadw cancelled Queue #1, Order #28. Order type: Delivery. Amount affected: ₱160.00. Reason: Changed my mind. Inventory: 1 stock unit restored.', '2026-08-14 16:04:26'),
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
(171, 6, 27, 'owner', 'product', 'Product Added', 'Product: Espresso\nCategory: Add Ons\nPrice: ₱35.00\nInitial Stock: 20\nStatus: Available\nPromotion: None', '2026-08-15 11:22:45');

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
(66, 'ab6e5a226aa6481e21c3a5929519d69b58a20d958a5d65c825d6d47ddeba46c0', '::1', 'access_code', 1, '2026-08-14 16:35:18');

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
  `combo_choice_ids_json` longtext DEFAULT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `price_at_time` decimal(10,2) NOT NULL DEFAULT 0.00,
  `subtotal` decimal(10,2) NOT NULL DEFAULT 0.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_cart`
--

INSERT INTO `tbl_cart` (`cart_id`, `user_id`, `restaurant_id`, `product_id`, `addon_ids`, `combo_choice_ids_json`, `quantity`, `price_at_time`, `subtotal`, `created_at`, `updated_at`) VALUES
(1, 17, 4, 3, '[]', '[]', 1, 100.00, 100.00, '2026-08-02 00:17:09', '2026-08-02 00:17:09');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_categories`
--

CREATE TABLE `tbl_categories` (
  `category_id` int(11) NOT NULL,
  `restaurant_id` int(11) NOT NULL,
  `category_name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

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
  `rider_id` int(11) DEFAULT NULL,
  `assigned_by` int(11) NOT NULL,
  `assignment_type` enum('internal','external') NOT NULL DEFAULT 'internal',
  `delivery_status` enum('requested','assigned','accepted','picked_up','out_for_delivery','completed','cancelled') NOT NULL DEFAULT 'requested',
  `delivery_fee` decimal(10,2) NOT NULL DEFAULT 0.00,
  `rider_payment` decimal(10,2) NOT NULL DEFAULT 0.00,
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

INSERT INTO `tbl_delivery_assignments` (`assignment_id`, `order_id`, `restaurant_id`, `rider_id`, `assigned_by`, `assignment_type`, `delivery_status`, `delivery_fee`, `rider_payment`, `assigned_at`, `accepted_at`, `picked_up_at`, `out_for_delivery_at`, `completed_at`, `cancelled_at`, `created_at`, `updated_at`) VALUES
(1, 13, 4, 24, 23, 'internal', 'completed', 60.00, 0.00, '2026-08-07 13:33:16', '2026-08-07 13:33:16', '2026-08-07 13:36:36', '2026-08-07 13:36:42', '2026-08-09 14:41:25', NULL, '2026-08-07 05:33:16', '2026-08-09 06:41:25'),
(2, 14, 4, 24, 23, 'internal', 'completed', 60.00, 0.00, '2026-08-09 14:58:53', '2026-08-09 14:58:53', '2026-08-09 14:59:11', '2026-08-09 14:59:14', '2026-08-09 15:05:11', NULL, '2026-08-09 06:58:53', '2026-08-09 07:05:11'),
(3, 15, 4, 24, 23, 'internal', 'completed', 60.00, 0.00, '2026-08-09 15:08:44', '2026-08-09 15:08:44', '2026-08-09 15:09:22', '2026-08-09 15:11:21', '2026-08-09 15:14:20', NULL, '2026-08-09 07:08:44', '2026-08-09 07:14:20');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_inventory`
--

CREATE TABLE `tbl_inventory` (
  `inventory_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `stock_quantity` int(11) NOT NULL DEFAULT 0,
  `critical_level` int(11) DEFAULT 5,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

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
  `pickup_time` varchar(20) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `tbl_orders`
--

INSERT INTO `tbl_orders` (`order_id`, `order_qr_token`, `qr_verified_at`, `qr_expires_at`, `queue_number`, `restaurant_id`, `processed_by_cashier_id`, `user_id`, `customer_name`, `contact_number`, `order_type`, `order_status`, `cancellation_reason`, `cancelled_by`, `cancelled_at`, `total_amount`, `subtotal`, `delivery_fee`, `payment_method`, `payment_status`, `address`, `landmark`, `customer_latitude`, `customer_longitude`, `table_number`, `pickup_time`, `notes`, `created_at`) VALUES
(1, 'd0f69685dc9925746ded33b88065fdcc8ad8f58f8fac6a51990f40202a47409b', NULL, '2026-08-02 22:01:45', 1, 4, NULL, 12, 'Cj Tamayo Porto', '9457309228', 'dine-in', 'pending', NULL, NULL, NULL, 100.00, 100.00, 0.00, 'Cash', 'cash_pending', '', '', NULL, NULL, '', '', '', '2026-08-02 13:41:45'),
(2, 'f77b860e228adcd811c02b1eb288f9a988209dbb1bddc7a70bae0f6bb59cc183', NULL, '2026-08-02 22:39:03', 2, 4, NULL, 12, 'Cj Tamayo Porto', '9457309228', 'dine-in', 'pending', NULL, NULL, NULL, 30.00, 30.00, 0.00, 'Cash', 'cash_pending', '', '', NULL, NULL, '', '', '', '2026-08-02 14:19:03'),
(3, '94a89303c4a6239eea56242f7d3fd2342360744430abfc99556e1c90183f2225', NULL, '2026-08-02 23:09:01', 3, 4, NULL, 12, 'Cj Tamayo Porto', '9457309228', 'dine-in', 'pending', NULL, NULL, NULL, 30.00, 30.00, 0.00, 'Cash', 'cash_pending', '', '', NULL, NULL, '', '', '', '2026-08-02 14:49:01'),
(4, 'c8170de54612b552d32f7c49714993749e1a487438e901c382d8bf6c4ce323ed', NULL, '2026-08-02 23:34:33', 4, 4, NULL, 12, 'Cj Tamayo Porto', '9457309228', 'dine-in', 'pending', NULL, NULL, NULL, 30.00, 30.00, 0.00, 'Cash', 'cash_pending', '', '', NULL, NULL, '', '', '', '2026-08-02 15:14:33'),
(5, 'e9c2eefbf279472d0cc9c224c0728e3b674e64e7cb3831944f95f3d54c81bcf9', '2026-08-02 23:39:22', '2026-08-02 23:59:00', 5, 4, NULL, 12, 'Test customer v1', '9457309228', 'dine-in', 'pending', NULL, NULL, NULL, 30.00, 30.00, 0.00, 'Cash', 'cash_pending', '', '', NULL, NULL, '', '', '', '2026-08-02 15:39:00'),
(6, '00a8b8eec0e029b6030843c7a07f7d2dccd161dd29f757dddb198978e77ab738', '2026-08-03 21:06:30', '2026-08-03 21:26:18', 1, 4, 23, 12, 'test act logs cancel cashier', '9457306288', 'dine-in', 'cancelled', 'Item is unavailable', 'cashier', '2026-08-03 21:06:38', 99999999.99, 99999999.99, 0.00, 'Cash', 'cash_pending', '', '', NULL, NULL, '', '', '', '2026-08-03 13:06:18'),
(7, '55ef1f63919d9e6b68f8b336ba3d67f55fe4fe655b1ae38e9af2b2c2f7bac01f', '2026-08-03 21:27:24', '2026-08-03 21:45:34', 2, 4, 23, 12, 'injel', '9860646184', 'dine-in', 'cancelled', 'Insufficient stock', 'cashier', '2026-08-03 21:27:52', 100.00, 100.00, 0.00, 'Cash', 'cash_pending', '', '', NULL, NULL, '', '', '', '2026-08-03 13:25:34'),
(8, '8477cdf4286d694eff57332902288762924edebf324fc4a2c9fb0863719eea37', NULL, '2026-08-03 22:01:53', 3, 4, NULL, 12, 'hahahah inamo', '9546757246', 'dine-in', 'cancelled', 'Duplicate order', 'customer', '2026-08-03 21:42:14', 100.00, 100.00, 0.00, 'Cash', 'cash_pending', '', '', NULL, NULL, '', '', '', '2026-08-03 13:41:53'),
(9, '9ff6421f0e42c448d48c31adfd4d505d8cd6f0d877bf28fbbb129e2d0f1ae836', '2026-08-03 21:43:32', '2026-08-03 22:03:19', 4, 4, NULL, 12, 'hshwhshhw', '9494849949', 'dine-in', 'cancelled', 'Changed my mind', 'customer', '2026-08-03 21:44:01', 100.00, 100.00, 0.00, 'Cash', 'cash_pending', '', '', NULL, NULL, '', '', '', '2026-08-03 13:43:19'),
(10, '1bee3f6ef902d4347977bda75752065eee4bc7de7b3e53aaac065518808020f7', NULL, '2026-08-03 22:24:32', 5, 4, NULL, 12, 'Ian Dela cruz', '9457309228', 'dine-in', 'cancelled', 'Changed my mind', 'customer', '2026-08-03 22:04:50', 200.00, 200.00, 0.00, 'Cash', 'cash_pending', '', '', NULL, NULL, '', '', '', '2026-08-03 14:04:32'),
(11, '7e84fd5f5b1d155d139ef811ddaa8ddf0510606864e3862051879bf503b6dcff', NULL, '2026-08-03 22:53:18', 6, 4, NULL, 12, 'Cegee', '9457309228', 'dine-in', 'cancelled', 'Duplicate order', 'customer', '2026-08-03 22:35:30', 200.00, 200.00, 0.00, 'Cash', 'cash_pending', '', '', NULL, NULL, '', '', '', '2026-08-03 14:33:18'),
(12, '33dcbb993086052dd80e0bc9d510faef64b6b20f0084cfd665547e6eb7bda197', NULL, '2026-08-03 23:41:37', 7, 4, NULL, 12, 'Unmam', '9457309282', 'dine-in', 'cancelled', 'Changed my mind', 'customer', '2026-08-03 23:22:01', 99999999.99, 99999999.99, 0.00, 'Cash', 'cash_pending', '', '', NULL, NULL, '', '', '', '2026-08-03 15:21:37'),
(13, '59b3d9d3877404f4fddd62086f4c5dcfd935f15e359300b6739e6ea79d46a16c', NULL, NULL, 1, 4, 23, 12, 'Cj porto', '9487996128', 'delivery', 'completed', NULL, NULL, NULL, 260.00, 200.00, 60.00, 'Cash on Delivery', 'cash_pending', 'JRS Express, Quezon Avenue, Alaminos, 2404 PN, Philippines', 'tapat ng novo, sa may school supplies', 16.15420017, 119.98138017, '', '', '', '2026-08-06 15:55:48'),
(14, '2f1d360c5b91911cd34fb6a101a48e37f36cac87a1e93fc75e8a8e23cf6d53e8', NULL, NULL, 1, 4, 23, 12, 'Ha??hatdog', '9238966428', 'delivery', 'completed', NULL, NULL, NULL, 160.00, 100.00, 60.00, 'Cash on Delivery', 'cash_pending', 'Inicay Dental Clinic, Quezon Avenue, Alaminos, 2404 PN, Philippines', 'Malaly ko saayo', 16.15410755, 119.98173476, '', '', '', '2026-08-09 06:57:49'),
(15, 'a06163aa5c26fe5a1670fa3916880029d1b4f9cde67bd384a579a9b2b9dc6075', NULL, NULL, 2, 4, 23, 12, 'Cj Tamayo Porto', '9566666666', 'delivery', 'completed', NULL, NULL, NULL, 260.00, 200.00, 60.00, 'Cash on Delivery', 'cash_pending', 'JRS Express, Quezon Avenue, Alaminos, 2404 PN, Philippines', '', 16.15420242, 119.98138924, '', '', '', '2026-08-09 07:07:44'),
(16, '3ae9f02cb42cd474ecce12d06570b5557e410a8a423826de756c49c17352a988', NULL, NULL, 3, 4, NULL, 12, 'test rpint', '9123798128', 'delivery', 'pending', NULL, NULL, NULL, 260.00, 200.00, 60.00, 'Cash on Delivery', 'cash_pending', 'JRS Express, Quezon Avenue, Alaminos, 2404 PN, Philippines', '', 16.15419068, 119.98139976, '', '', '', '2026-08-09 14:29:19'),
(17, '309a74360ef3ce63cab7a86dae4e5aae8febf3f45abc43e05caaa346d7d4b5e4', NULL, NULL, 4, 4, NULL, 12, 'Test print', '9899635248', 'delivery', 'pending', NULL, NULL, NULL, 160.00, 100.00, 60.00, 'Cash on Delivery', 'cash_pending', 'Inicay Dental Clinic, Quezon Avenue, Alaminos, 2404 PN, Philippines', '', 16.15411142, 119.98168124, '', '', '', '2026-08-09 14:45:41'),
(18, '922984a543cc0569ed7b8b6e37942765c1298e4b10434638e08b7bb30b65a8aa', NULL, NULL, 5, 4, NULL, 12, 'dwaadwaawd', '9127123783', 'delivery', 'pending', NULL, NULL, NULL, 160.00, 100.00, 60.00, 'Cash on Delivery', 'cash_pending', 'Lovely Gie\'s Bakeshop, S. Quimson Street, Alaminos, 2404 PN, Philippines', '', 16.15412586, 119.98163065, '', '', '', '2026-08-09 15:07:46'),
(19, '572869fc38e591b168bff86127ad082d3151ce9f318214c85e9886d2002bbf45', NULL, NULL, 6, 4, NULL, 12, 'cj porto', '9897299989', 'delivery', 'pending', NULL, NULL, NULL, 160.00, 100.00, 60.00, 'Cash on Delivery', 'cash_pending', 'De Vera Paint Shop, Pag-asa Street, Alaminos, 2404 PN, Philippines', '', 16.15415500, 119.98140700, '', '', '', '2026-08-09 15:16:44'),
(20, '60f53d456a2f19b411706258089b2d4cc1085e0c20fa160c827b0fb0f6a5196f', NULL, NULL, 1, 4, NULL, 12, 'waddwawadwadwa', '9689766666', 'delivery', 'pending', NULL, NULL, NULL, 160.00, 100.00, 60.00, 'Cash on Delivery', 'cash_pending', 'JRS Express, Quezon Avenue, Alaminos, 2404 PN, Philippines', '', 16.15421052, 119.98139318, '', '', '', '2026-08-10 14:04:51'),
(21, '28fc19eba1ff9d04e3d9de918638796d8c7ce8b8fc8233aae7388453ad396a0f', NULL, NULL, 2, 4, NULL, 12, 'cj urtu', '9987768665', 'delivery', 'pending', NULL, NULL, NULL, 180.00, 120.00, 60.00, 'Cash on Delivery', 'cash_pending', 'Lovely Gie\'s Bakeshop, S. Quimson Street, Alaminos, 2404 PN, Philippines', '', 16.15415966, 119.98172594, '', '', '', '2026-08-10 14:18:24'),
(22, 'ca002932bdfd09cfaeea122f0a31052b18a962d71a6ce5e92271b20a060aad8d', NULL, NULL, 3, 4, NULL, 12, 'last print test', '9093450983', 'delivery', 'pending', NULL, NULL, NULL, 160.00, 100.00, 60.00, 'Cash on Delivery', 'cash_pending', 'Apang Food House, Quezon Avenue, Alaminos, 2404 PN, Philippines', '', 16.15410950, 119.98182460, '', '', '', '2026-08-10 14:26:23'),
(23, 'f1608a0b09a7263bf32c0749870730e72b81863d8655b4ad679847b9586a49fc', '2026-08-13 14:50:42', '2026-08-13 15:10:18', 1, 4, NULL, 12, 'Cjmt42', '9457309228', 'dine-in', 'pending', NULL, NULL, NULL, 39.00, 39.00, 0.00, 'PayMongo QR Ph', 'pending', '', '', NULL, NULL, '', '', '', '2026-08-13 06:50:18'),
(24, '7e5bf6623465d5173354ade491f36e4d680028cd9dd81a33c4c246f4b65363cd', '2026-08-13 15:18:28', '2026-08-13 15:37:43', 2, 4, NULL, 12, 'heheheue828292', '9484846464', 'dine-in', 'pending', NULL, NULL, NULL, 100.00, 100.00, 0.00, 'PayMongo QR Ph', 'pending', '', '', NULL, NULL, '', '', '', '2026-08-13 07:17:43'),
(25, '149e3f9ed8808c49adac34a5b59625ba8bb5720067eeb9999f58f78c46b6b44d', '2026-08-13 22:42:40', '2026-08-13 23:01:11', 3, 4, NULL, 12, 'Test paymongo', '9764546686', 'dine-in', 'pending', NULL, NULL, NULL, 200.00, 200.00, 0.00, 'PayMongo QR Ph', 'paid', '', '', NULL, NULL, '', '', '', '2026-08-13 14:41:11'),
(26, 'b73569d1603b7f4e726fa5f27d155df45ed1581d6640a411564599246b620626', NULL, NULL, 4, 4, NULL, 12, 'test paymongo deliverty', '9899616462', 'delivery', 'pending', NULL, NULL, NULL, 160.00, 100.00, 60.00, 'PayMongo QR Ph', 'paid', 'Inicay Dental Clinic, Quezon Avenue, Alaminos, 2404 PN, Philippines', '', 16.15409656, 119.98162514, '', '', '', '2026-08-13 15:08:51'),
(27, '45048ee8bb6dcf37847cc7cd57395a3a0003309e4f807d47ba31443891e36472', NULL, NULL, 1, 4, NULL, 12, 'cawa', '9478238799', 'delivery', 'pending', NULL, NULL, NULL, 260.00, 200.00, 60.00, 'PayMongo QR Ph', 'pending', 'S. Quimson Street, Poblacion, City of Alaminos, Pangasinan, Philippines', '', 16.15417465, 119.98164699, '', '', '', '2026-08-14 15:53:07'),
(28, '8503ff90d0a17ca4b6faba49d21300bd76cdda2caa85e2566e5c81313653ff95', NULL, NULL, 1, 4, NULL, 12, 'wdawdaadw', '9678666669', 'delivery', 'cancelled', 'Changed my mind', 'customer', '2026-08-15 00:04:26', 160.00, 100.00, 60.00, 'PayMongo QR Ph', 'pending', 'Quezon Avenue, Poblacion, City of Alaminos, Pangasinan, Philippines', '', 16.15410104, 119.98192156, '', '', '', '2026-08-14 16:01:57');

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
  `base_text` varchar(150) DEFAULT NULL,
  `combo_choice_text` varchar(500) DEFAULT NULL,
  `combo_choice_ids_json` longtext DEFAULT NULL,
  `addon_text` varchar(150) DEFAULT NULL,
  `addon_ids_json` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `tbl_order_items`
--

INSERT INTO `tbl_order_items` (`order_item_id`, `order_id`, `product_id`, `combo_id`, `quantity`, `price`, `regular_price`, `discount_type`, `discount_value`, `discount_savings`, `discount_applied`, `product_name`, `base_text`, `combo_choice_text`, `combo_choice_ids_json`, `addon_text`, `addon_ids_json`) VALUES
(1, 1, 4, NULL, 1, 100.00, 0.00, 'none', 0.00, 0.00, 0, 'tapsilog', '', '', '[]', 'No Add-on', '[]'),
(2, 2, 4, NULL, 1, 30.00, 0.00, 'none', 0.00, 0.00, 0, 'tapsilog', '', '', '[]', 'No Add-on', '[]'),
(3, 3, 4, NULL, 1, 30.00, 100.00, 'percentage', 70.00, 70.00, 1, 'tapsilog', '', '', '[]', 'No Add-on', '[]'),
(4, 4, 4, NULL, 1, 30.00, 100.00, 'percentage', 70.00, 70.00, 1, 'tapsilog', '', '', '[]', 'No Add-on', '[]'),
(5, 5, 4, NULL, 1, 30.00, 100.00, 'percentage', 70.00, 70.00, 1, 'tapsilog', '', '', '[]', 'No Add-on', '[]'),
(6, 6, 2, NULL, 1, 99999999.99, 99999999.99, 'none', 0.00, 0.00, 0, 'Masarap', '', '', '[]', 'No Add-on', '[]'),
(7, 6, 4, NULL, 1, 100.00, 100.00, 'percentage', 70.00, 0.00, 0, 'tapsilog', '', '', '[]', 'No Add-on', '[]'),
(8, 7, 4, NULL, 1, 100.00, 100.00, 'percentage', 70.00, 0.00, 0, 'tapsilog', '', '', '[]', 'No Add-on', '[]'),
(9, 8, 4, NULL, 1, 100.00, 100.00, 'percentage', 70.00, 0.00, 0, 'tapsilog', '', '', '[]', 'No Add-on', '[]'),
(10, 9, 4, NULL, 1, 100.00, 100.00, 'percentage', 70.00, 0.00, 0, 'tapsilog', '', '', '[]', 'No Add-on', '[]'),
(11, 10, 1, NULL, 1, 200.00, 200.00, 'none', 0.00, 0.00, 0, 'Hotdog malaki', 'Solo', '', '[]', 'No Add-on', '[]'),
(12, 11, 1, NULL, 1, 200.00, 200.00, 'none', 0.00, 0.00, 0, 'Hotdog malaki', 'Solo', '', '[]', 'No Add-on', '[]'),
(13, 12, 2, NULL, 1, 99999999.99, 99999999.99, 'none', 0.00, 0.00, 0, 'Masarap', '', '', '[]', 'No Add-on', '[]'),
(14, 13, 1, NULL, 1, 200.00, 200.00, 'none', 0.00, 0.00, 0, 'Hotdog malaki', 'Solo', '', '[]', 'No Add-on', '[]'),
(15, 14, 8, NULL, 1, 100.00, 100.00, 'none', 0.00, 0.00, 0, 'Chicksilog', '', '', '[]', 'No Add-on', '[]'),
(16, 15, 1, NULL, 1, 200.00, 200.00, 'none', 0.00, 0.00, 0, 'Hotdog malaki', 'Solo', '', '[]', 'No Add-on', '[]'),
(17, 16, 1, NULL, 1, 200.00, 200.00, 'none', 0.00, 0.00, 0, 'Hotdog malaki', 'Solo', '', '[]', 'No Add-on', '[]'),
(18, 17, 8, NULL, 1, 100.00, 100.00, 'none', 0.00, 0.00, 0, 'Chicksilog', '', '', '[]', 'No Add-on', '[]'),
(19, 18, 8, NULL, 1, 100.00, 100.00, 'none', 0.00, 0.00, 0, 'Chicksilog', '', '', '[]', 'No Add-on', '[]'),
(20, 19, 8, NULL, 1, 100.00, 100.00, 'none', 0.00, 0.00, 0, 'Chicksilog', '', '', '[]', 'No Add-on', '[]'),
(21, 20, 8, NULL, 1, 100.00, 100.00, 'none', 0.00, 0.00, 0, 'Chicksilog', '', '', '[]', 'No Add-on', '[]'),
(22, 21, 9, NULL, 1, 120.00, 120.00, 'none', 0.00, 0.00, 0, 'Hamsilog', '', '', '[]', 'No Add-on', '[]'),
(23, 22, 7, NULL, 1, 100.00, 100.00, 'none', 0.00, 0.00, 0, 'Hotsilog', '', '', '[]', 'No Add-on', '[]'),
(24, 23, 11, NULL, 1, 39.00, 39.00, 'none', 0.00, 0.00, 0, 'Vanilla', 'Regular * Large', '', '[]', 'No Add-on', '[]'),
(25, 24, 8, NULL, 1, 100.00, 100.00, 'none', 0.00, 0.00, 0, 'Chicksilog', '', '', '[]', 'No Add-on', '[]'),
(26, 25, 1, NULL, 1, 200.00, 200.00, 'none', 0.00, 0.00, 0, 'Hotdog malaki', 'Solo', '', '[]', 'No Add-on', '[]'),
(27, 26, 8, NULL, 1, 100.00, 100.00, 'none', 0.00, 0.00, 0, 'Chicksilog', '', '', '[]', 'No Add-on', '[]'),
(28, 27, 1, NULL, 1, 200.00, 200.00, 'none', 0.00, 0.00, 0, 'Hotdog malaki', 'Solo', '', '[]', 'No Add-on', '[]'),
(29, 28, 8, NULL, 1, 100.00, 100.00, 'none', 0.00, 0.00, 0, 'Chicksilog', '', '', '[]', 'No Add-on', '[]');

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
(13, 22, 'edd4c5e4cffbb7a5acdeda725966f3f1', '24e8d891714b4352a81b476ddf7f406fa244eee0e02cb91b38a6ed39d8cfc01f', '2026-09-11 22:44:34', '2026-08-12 22:44:34', '2026-08-13 22:36:54'),
(14, 25, '3bb1f4e917a811272e7a6623713e905c', 'e7778e47645a4b8156a63079adfb7c87a7d8543d38ef9f72c12348f358604686', '2026-09-14 00:37:53', '2026-08-15 00:37:53', NULL),
(15, 27, '952062f8005e5e8467102cdadd9bf298', 'cafc44ab50b69f9e2f36f0da252854f061916f14007e0208234db120f481d22f', '2026-09-14 18:37:02', '2026-08-15 18:37:02', NULL);

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
  `tax_registration_type` enum('vat','non_vat') DEFAULT NULL,
  `province` varchar(100) DEFAULT NULL,
  `city_municipality` varchar(100) DEFAULT NULL,
  `barangay` varchar(100) DEFAULT NULL,
  `postal_code` varchar(10) DEFAULT NULL,
  `business_hours_json` longtext DEFAULT NULL,
  `delivery_options_json` longtext DEFAULT NULL,
  `minimum_order` decimal(10,2) NOT NULL DEFAULT 0.00,
  `delivery_fee` decimal(10,2) NOT NULL DEFAULT 0.00,
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

INSERT INTO `tbl_partner_applications` (`application_id`, `owner_id`, `restaurant_name`, `restaurant_address`, `restaurant_contact`, `cuisine`, `restaurant_description`, `logo_path`, `business_email`, `tax_registration_type`, `province`, `city_municipality`, `barangay`, `postal_code`, `business_hours_json`, `delivery_options_json`, `minimum_order`, `delivery_fee`, `application_status`, `rejection_reason`, `submitted_at`, `reviewed_at`, `reviewed_by`, `created_at`, `updated_at`) VALUES
(2, 18, 'Ayaw ko na Restaurant', 'Poblacion', '09457309228', 'Cafe', '', NULL, 'jameslee050505051@gmail.com', NULL, 'Pangasinan', 'Alaminos City', 'Poblacion', '2402', '{\"Monday\":{\"closed\":false,\"open\":\"08:00\",\"close\":\"20:00\"},\"Tuesday\":{\"closed\":false,\"open\":\"08:00\",\"close\":\"20:00\"},\"Wednesday\":{\"closed\":false,\"open\":\"08:00\",\"close\":\"20:00\"},\"Thursday\":{\"closed\":false,\"open\":\"08:00\",\"close\":\"20:00\"},\"Friday\":{\"closed\":false,\"open\":\"08:00\",\"close\":\"20:00\"},\"Saturday\":{\"closed\":false,\"open\":\"08:00\",\"close\":\"20:00\"},\"Sunday\":{\"closed\":true,\"open\":null,\"close\":null}}', '[\"pickup\",\"restaurant_delivery\"]', 0.00, 0.00, 'approved', NULL, '2026-07-24 18:47:03', '2026-07-25 00:48:06', 17, '2026-07-24 14:29:16', '2026-07-24 16:48:06'),
(5, 21, 'da wundaful', 'Poblacion', '094573092298', 'Filipino', 'akoy na ihiii', 'uploads/restaurant_logos/owner_21/restaurant_logo_20260726_145557_0ea16fc377afa1e3.jpg', 'acadsonly67@gmail.com', NULL, 'Pangasinan', 'Alaminos City', 'Poblacion', '2402', '{\"Monday\":{\"closed\":false,\"open\":\"08:00\",\"close\":\"20:00\"},\"Tuesday\":{\"closed\":false,\"open\":\"08:00\",\"close\":\"20:00\"},\"Wednesday\":{\"closed\":false,\"open\":\"08:00\",\"close\":\"20:00\"},\"Thursday\":{\"closed\":false,\"open\":\"08:00\",\"close\":\"20:00\"},\"Friday\":{\"closed\":false,\"open\":\"08:00\",\"close\":\"20:00\"},\"Saturday\":{\"closed\":false,\"open\":\"08:00\",\"close\":\"20:00\"},\"Sunday\":{\"closed\":false,\"open\":\"08:00\",\"close\":\"20:00\"}}', '[\"pickup\",\"restaurant_delivery\"]', 0.00, 0.00, 'rejected', 'smoke and shers', '2026-07-26 14:56:42', '2026-07-26 21:06:37', 17, '2026-07-26 12:55:35', '2026-07-26 13:06:37'),
(6, 22, 'Test Environment', 'Poblacion', '094573092298', 'Cafe', '', 'uploads/restaurant_logos/owner_22/restaurant_logo_20260729_152152_2a2e89d6f0901449.jpg', 'cjmt42@gmail.com', NULL, 'Pangasinan', 'Alaminos City', 'Poblacion', '2402', '{\"Monday\":{\"closed\":false,\"open\":\"08:00\",\"close\":\"20:00\"},\"Tuesday\":{\"closed\":false,\"open\":\"08:00\",\"close\":\"20:00\"},\"Wednesday\":{\"closed\":false,\"open\":\"08:00\",\"close\":\"20:00\"},\"Thursday\":{\"closed\":false,\"open\":\"08:00\",\"close\":\"20:00\"},\"Friday\":{\"closed\":false,\"open\":\"08:00\",\"close\":\"20:00\"},\"Saturday\":{\"closed\":false,\"open\":\"08:00\",\"close\":\"20:00\"},\"Sunday\":{\"closed\":false,\"open\":\"08:00\",\"close\":\"20:00\"}}', '[\"pickup\",\"restaurant_delivery\"]', 0.00, 0.00, 'approved', NULL, '2026-07-29 21:46:16', '2026-07-29 22:21:48', 17, '2026-07-29 12:45:29', '2026-07-29 14:21:48'),
(7, 25, 'MWuahahhha', 'Poblacion', '+639657853534', 'Pizza', '', '', 'eeegggihtloh@gmail.com', '', 'Agusan del Norte', 'Carmen', 'Alegria', '2402', '{\"Monday\":{\"closed\":false,\"open\":\"08:00\",\"close\":\"20:00\"},\"Tuesday\":{\"closed\":false,\"open\":\"08:00\",\"close\":\"20:00\"},\"Wednesday\":{\"closed\":false,\"open\":\"08:00\",\"close\":\"20:00\"},\"Thursday\":{\"closed\":false,\"open\":\"08:00\",\"close\":\"20:00\"},\"Friday\":{\"closed\":false,\"open\":\"08:00\",\"close\":\"20:00\"},\"Saturday\":{\"closed\":true,\"open\":null,\"close\":null},\"Sunday\":{\"closed\":true,\"open\":null,\"close\":null}}', '[\"dine-in\",\"takeout\",\"delivery\"]', 0.00, 0.00, 'draft', NULL, NULL, NULL, NULL, '2026-08-10 15:59:23', '2026-08-14 17:02:39'),
(9, 27, 'Drop By Cafe', 'San Jose Drive, Sabaro', '+639617879757', 'Cafe', '🍽️ All Day Breakfast & Pasta\n☕️ Coffee & Non-Coffee Drinks\n🥐 Snacks and Pastries\n❄️ Air-Conditioned Area\n🐶 Pet-Friendly Cafe\n🎮 PS4 and Board Games\n📚Books Collections\n🛜 Free Wi-Fi\n🅿️ Free Parking\n✨ Dine In / Take Out / Delivery/ Pick-Up', 'uploads/restaurant_logos/owner_27/restaurant_logo_20260815_022944_a228cfd995c94b93.jpg', 'dropbycafe.25@gmail.com', '', 'Pangasinan', 'City of Alaminos', 'Poblacion', '2404', '{\"Monday\":{\"closed\":false,\"open\":\"09:00\",\"close\":\"23:00\"},\"Tuesday\":{\"closed\":false,\"open\":\"09:00\",\"close\":\"23:00\"},\"Wednesday\":{\"closed\":false,\"open\":\"09:00\",\"close\":\"23:00\"},\"Thursday\":{\"closed\":false,\"open\":\"09:00\",\"close\":\"23:00\"},\"Friday\":{\"closed\":false,\"open\":\"09:00\",\"close\":\"23:00\"},\"Saturday\":{\"closed\":false,\"open\":\"09:00\",\"close\":\"23:00\"},\"Sunday\":{\"closed\":false,\"open\":\"09:00\",\"close\":\"23:00\"}}', '[\"dine-in\",\"takeout\",\"delivery\"]', 0.00, 50.00, 'draft', NULL, NULL, NULL, NULL, '2026-08-14 18:29:16', '2026-08-14 18:35:03');

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
(1, 7, 25, 'bir_2303', 'Screenshot 2026-08-03 120626.png', 'uploads/restaurant_verification/owner_25/application_7/bir_2303_20260815_005206_3d96b8657ea7.png', 'image/png', 1065756, '2026-08-15 00:52:06'),
(2, 7, 25, 'restaurant_menu', 'Screenshot 2026-08-03 201006.png', 'uploads/restaurant_verification/owner_25/application_7/restaurant_menu_20260815_005210_4b3c096b4652.png', 'image/png', 730, '2026-08-15 00:52:10'),
(3, 7, 25, 'applicant_id', 'Screenshot 2026-08-03 200236.png', 'uploads/restaurant_verification/owner_25/application_7/applicant_id_20260815_005213_cd761183b94c.png', 'image/png', 17898, '2026-08-15 00:52:13'),
(4, 9, 27, 'bir_2303', '769309021_1991670854800812_7621144269341864897_n.jpg', 'uploads/restaurant_verification/owner_27/application_9/bir_2303_20260815_023025_6603b483c440.jpg', 'image/jpeg', 48617, '2026-08-15 02:30:25'),
(5, 9, 27, 'applicant_id', '769309021_1991670854800812_7621144269341864897_n.jpg', 'uploads/restaurant_verification/owner_27/application_9/applicant_id_20260815_023032_6ffc44847d49.jpg', 'image/jpeg', 48617, '2026-08-15 02:30:32'),
(6, 9, 27, 'restaurant_menu', '767482764_2908401112840420_5545216318970813536_n.jpg', 'uploads/restaurant_verification/owner_27/application_9/restaurant_menu_20260815_023155_df602b29dbd1.jpg', 'image/jpeg', 122975, '2026-08-15 02:31:55');

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
  `message` text DEFAULT NULL,
  `request_status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `reviewed_by` int(11) DEFAULT NULL,
  `reviewed_at` datetime DEFAULT NULL,
  `rejection_reason` text DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
(1, 23, 4, 'paymongo', 'qrph', 'pending', 39.00, 'PHP', 'FC-4-23-20260813145108-d4f926', 'cs_c0f85e98d5a6ee1c238fdc38', NULL, NULL, NULL, NULL, NULL, '2026-08-13 06:51:08', '2026-08-13 06:51:08'),
(2, 24, 4, 'paymongo', 'qrph', 'pending', 100.00, 'PHP', 'FC-4-24-20260813151836-785aee', 'cs_c41504235991c3a42c990542', NULL, NULL, NULL, NULL, NULL, '2026-08-13 07:18:36', '2026-08-13 07:18:36'),
(3, 25, 4, 'paymongo', 'qrph', 'paid', 200.00, 'PHP', 'FC-4-25-20260813224254-5e7acd', 'cs_72bb549c6f50938f8116c24a', 'pay_tdAHqUiNthxjcNB7EyVav9g5', '2026-08-13 23:03:37', NULL, NULL, NULL, '2026-08-13 14:42:54', '2026-08-13 15:03:37'),
(4, 26, 4, 'paymongo', 'qrph', 'paid', 160.00, 'PHP', 'FC-4-26-20260813230851-25cc2a', 'cs_0c6fbe3b60c16ba83d9f0495', 'pay_9mFGSb9mXuMbLu59HQLjutF8', '2026-08-13 23:09:21', NULL, NULL, NULL, '2026-08-13 15:08:51', '2026-08-13 15:09:21'),
(5, 27, 4, 'paymongo', 'qrph', 'pending', 260.00, 'PHP', 'FC-4-27-20260814235308-eba097', 'cs_4f181068d22c49922cd2050b', NULL, NULL, NULL, NULL, NULL, '2026-08-14 15:53:08', '2026-08-14 15:53:08'),
(6, 28, 4, 'paymongo', 'qrph', 'pending', 160.00, 'PHP', 'FC-4-28-20260815000157-b66db1', 'cs_02a0b4c1605055f8ae2a548a', NULL, NULL, NULL, NULL, NULL, '2026-08-14 16:01:57', '2026-08-14 16:01:57');

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

INSERT INTO `tbl_products` (`product_id`, `restaurant_id`, `product_name`, `category`, `size`, `price`, `stock`, `status`, `image_path`, `discount_type`, `discount_value`, `discount_schedule`, `discount_start`, `discount_end`, `discount_status`) VALUES
(1, 4, 'Hotdog malaki', 'Burgir', 'Solo', 200.00, 15, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(2, 4, 'Masarap', 'Limited Edition', '', 99999999.99, 10, 'Available', '/FoodConnect/uploads/product_images/restaurant_4/product_2415e05751dd960d0282acb972ee152c.jpg', 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(4, 4, 'tapsilog', 'Silog meals', '', 100.00, 10, 'Available', NULL, 'percentage', 70.00, 'scheduled', '2026-08-02 08:20:00', '2026-08-03 17:19:00', 'Active'),
(7, 4, 'Hotsilog', 'Silog meals', '', 100.00, 199, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(8, 4, 'Chicksilog', 'Silog Meals', '', 100.00, 193, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(9, 4, 'Hamsilog', 'Silog Meals', '', 120.00, 9, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(10, 4, 'Burerss', 'Burgir', '', 20.00, 10, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(11, 4, 'Vanilla', 'Iced Coffee', 'Regular * Large', 39.00, 14, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(12, 4, 'dawwadwaawd', 'awdddwadwadwaaawda', '', 2412.00, 0, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(13, 4, 'wearewwww', '23123123', '', 99999999.99, 5, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(14, 6, 'Sweet and Spicy', 'Chicken Wings', 'Solo Meal', 105.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(15, 6, 'Sweet and Spicy', 'Chicken Wings', '4pcs', 140.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(16, 6, 'Sweet and Spicy', 'Chicken Wings', '6pcs', 210.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(17, 6, 'Teriyaki', 'Chicken Wings', 'Solo Meal', 105.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(18, 6, 'Teriyaki', 'Chicken Wings', '4pcs', 140.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(19, 6, 'Teriyaki', 'Chicken Wings', '6pcs', 210.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(20, 6, 'Honey BBQ', 'Chicken Wings', 'Solo Meal', 105.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(21, 6, 'Honey BBQ', 'Chicken Wings', '4 pcs', 140.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(22, 6, 'Honey BBQ', 'Chicken Wings', '6 pcs', 210.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(23, 6, 'Buffalo', 'Chicken Wings', 'Solo Meal', 105.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(24, 6, 'Buffalo', 'Chicken Wings', '4 pcs', 140.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(25, 6, 'Buffalo', 'Chicken Wings', '6 pcs', 210.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(26, 6, 'Garlic Parmesan', 'Chicken Wings', 'Solo Meal', 105.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(27, 6, 'Garlic Parmesan', 'Chicken Wings', '4 pcs', 140.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(28, 6, 'Garlic Parmesan', 'Chicken Wings', '6 pcs', 210.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(29, 6, 'Spamsilog', 'Rice Meals', '', 130.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(30, 6, 'Cornsilog', 'Rice Meals', '', 130.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(31, 6, 'Tosilog', 'Rice Meals', '', 135.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(32, 6, 'Tofu Sisig', 'Rice Meals', '', 135.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(33, 6, 'Tapsilog', 'Rice Meals', '', 145.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(34, 6, 'Pork Sisig', 'Rice Meals', '', 150.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(35, 6, 'Filipino Spaghetti', 'Pasta', '', 99.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(36, 6, 'Mushroom Alfredo', 'Pasta', '', 130.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(37, 6, 'Creamy Pesto Tuna', 'Pasta', '', 160.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(38, 6, 'French Fries', 'Snacks', 'Plain', 99.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(39, 6, 'French Fries', 'Snacks', 'Cheese', 99.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(40, 6, 'French Fries', 'Snacks', 'BBQ', 99.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(41, 6, 'French Fries', 'Snacks', 'Sour Cream Onion', 99.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(42, 6, 'Overload Fries', 'Snacks', '', 130.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(43, 6, 'Overload Nachos', 'Snacks', '', 145.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(44, 6, 'Overload Combo', 'Snacks', '', 160.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(45, 6, 'Drop Platter', 'Snacks', '', 460.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(46, 6, 'Classic Burger', 'Burger Series', '', 150.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(47, 6, 'Double Cheese Burger', 'Burger Series', '', 160.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(48, 6, 'Meaty Burger', 'Burger Series', '', 165.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(49, 6, 'Drop Supreme Burger', 'Burger Series', '', 175.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(50, 6, 'Tuna Sandwich', 'Sandwiches', '', 125.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(51, 6, 'Clubhouse Sandwich', 'Sandwiches', '', 140.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(52, 6, 'Siomai Rice', 'Budget Meal', '', 59.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(53, 6, 'Shanghai Rice', 'Budget Meal', '', 59.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(54, 6, 'Adobo Flakes', 'Budget Meal', '', 89.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(55, 6, 'Chicken Poppers', 'Budget Meal', '', 70.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(56, 6, 'Combo Cravings', 'Budget Meal', '', 79.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(57, 6, 'Savory Duo', 'Budget Meal', '', 99.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(58, 6, 'Pinapaitan', 'Ulam Specials', '', 220.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(59, 6, 'Pork Igado', 'Ulam Specials', '', 200.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(60, 6, 'Tofu Sisig', 'Ulam Specials', '', 160.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(61, 6, 'Bulalo', 'Ulam Specials', '', 380.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(62, 6, 'Pork Sisig', 'Ulam Specials', '', 180.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(63, 6, 'Pour-Over', 'Drinks - Coffee Based', 'Hot', 80.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(64, 6, 'Pour-Over', 'Drinks - Coffee Based', 'Medium', 90.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(65, 6, 'Pour-Over', 'Drinks - Coffee Based', 'Large', 100.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(66, 6, 'Americano', 'Drinks - Coffee Based', 'Hot', 80.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(67, 6, 'Americano', 'Drinks - Coffee Based', 'Medium', 90.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(68, 6, 'Americano', 'Drinks - Coffee Based', 'Large', 100.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(69, 6, 'Cafe Latte', 'Drinks - Coffee Based', 'Hot', 110.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(70, 6, 'Cafe Latte', 'Drinks - Coffee Based', 'Medium', 120.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(71, 6, 'Cafe Latte', 'Drinks - Coffee Based', 'Large', 130.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(72, 6, 'Spanish Latte', 'Drinks - Coffee Based', 'Hot', 120.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(73, 6, 'Spanish Latte', 'Drinks - Coffee Based', 'Medium', 130.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(74, 6, 'Spanish Latte', 'Drinks - Coffee Based', 'Large', 140.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(75, 6, 'Hazelnut Latte', 'Drinks - Coffee Based', 'Hot', 125.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(76, 6, 'Hazelnut Latte', 'Drinks - Coffee Based', 'Medium', 135.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(77, 6, 'Hazelnut Latte', 'Drinks - Coffee Based', 'Large', 145.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(78, 6, 'Roasted Almond', 'Drinks - Coffee Based', 'Hot', 125.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(79, 6, 'Roasted Almond', 'Drinks - Coffee Based', 'Medium', 135.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(80, 6, 'Roasted Almond', 'Drinks - Coffee Based', 'Large', 145.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(81, 6, 'White Choco Latte', 'Drinks - Coffee Based', 'Hot', 130.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(82, 6, 'White Choco Latte', 'Drinks - Coffee Based', 'Medium', 140.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(83, 6, 'White Choco Latte', 'Drinks - Coffee Based', 'Large', 150.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(84, 6, 'Salted Caramel', 'Drinks - Coffee Based', 'Hot', 130.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(85, 6, 'Salted Caramel', 'Drinks - Coffee Based', 'Medium', 140.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(86, 6, 'Salted Caramel', 'Drinks - Coffee Based', 'Large', 150.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(87, 6, 'Mocha Latte', 'Drinks - Coffee Based', 'Hot', 130.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(88, 6, 'Mocha Latte', 'Drinks - Coffee Based', 'Medium', 140.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(89, 6, 'Mocha Latte', 'Drinks - Coffee Based', 'Large', 150.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(90, 6, 'Caramel Machiatto', 'Drinks - Coffee Based', 'Hot', 135.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(91, 6, 'Caramel Machiatto', 'Drinks - Coffee Based', 'Medium', 145.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(92, 6, 'Caramel Machiatto', 'Drinks - Coffee Based', 'Large', 155.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(93, 6, 'Biscof Latte', 'Drinks - Coffee Based', 'Hot', 140.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(94, 6, 'Biscof Latte', 'Drinks - Coffee Based', 'Medium', 150.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(95, 6, 'Biscof Latte', 'Drinks - Coffee Based', 'Large', 160.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(96, 6, 'Strawberry Milk', 'Drinks - Non Coffee', 'Medium - Iced', 105.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(97, 6, 'Strawberry Milk', 'Drinks - Non Coffee', 'Large - Iced', 115.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(98, 6, 'Blueberry Milk', 'Drinks - Non Coffee', 'Medium - Iced', 105.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(99, 6, 'Blueberry Milk', 'Drinks - Non Coffee', 'Large - Iced', 115.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(100, 6, 'Chocolate', 'Drinks - Non Coffee', 'Hot', 115.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(101, 6, 'Chocolate', 'Drinks - Non Coffee', 'Medium - Iced', 125.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(102, 6, 'Chocolate', 'Drinks - Non Coffee', 'Large - Iced', 135.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(103, 6, 'Creamy Biscoff', 'Drinks - Non Coffee', 'Hot', 120.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(104, 6, 'Creamy Biscoff', 'Drinks - Non Coffee', 'Medium - Iced', 130.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(105, 6, 'Creamy Biscoff', 'Drinks - Non Coffee', 'Large - Iced', 140.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive'),
(106, 6, 'Espresso', 'Add Ons', '', 35.00, 20, 'Available', NULL, 'none', 0.00, 'permanent', NULL, NULL, 'Inactive');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_queue`
--

CREATE TABLE `tbl_queue` (
  `queue_id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `queue_number` int(11) NOT NULL,
  `status` enum('waiting','serving','done') DEFAULT 'waiting',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

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
(1, 5, 4, 'customer_receipt', 'qr_verified', 'processed', NULL, NULL, '2026-08-09 22:26:09', '2026-08-02 23:39:22'),
(2, 13, 4, 'customer_receipt', 'delivery_order', 'processed', NULL, NULL, '2026-08-09 22:26:09', '2026-08-06 23:55:48'),
(3, 14, 4, 'customer_receipt', 'delivery_order', 'processed', NULL, NULL, '2026-08-09 22:26:09', '2026-08-09 14:57:49'),
(4, 15, 4, 'customer_receipt', 'delivery_order', 'processed', NULL, NULL, '2026-08-09 22:26:09', '2026-08-09 15:07:44'),
(51, 16, 4, 'customer_receipt', 'delivery_order', 'processed', 23, '2026-08-09 22:29:24', '2026-08-09 22:30:42', '2026-08-09 22:29:19'),
(356, 5, 4, 'kitchen_ticket', 'qr_verified', 'processed', NULL, NULL, '2026-08-09 22:40:47', '2026-08-02 23:39:22'),
(357, 13, 4, 'kitchen_ticket', 'delivery_order', 'processed', NULL, NULL, '2026-08-09 22:40:47', '2026-08-06 23:55:48'),
(358, 14, 4, 'kitchen_ticket', 'delivery_order', 'processed', NULL, NULL, '2026-08-09 22:40:47', '2026-08-09 14:57:49'),
(359, 15, 4, 'kitchen_ticket', 'delivery_order', 'processed', NULL, NULL, '2026-08-09 22:40:47', '2026-08-09 15:07:44'),
(360, 16, 4, 'kitchen_ticket', 'delivery_order', 'processed', NULL, NULL, '2026-08-09 22:40:47', '2026-08-09 22:29:19'),
(421, 17, 4, 'customer_receipt', 'delivery_order', 'processed', 23, '2026-08-09 22:45:42', '2026-08-09 22:54:15', '2026-08-09 22:45:41'),
(422, 17, 4, 'kitchen_ticket', 'delivery_order', 'processed', 23, '2026-08-09 22:54:16', '2026-08-09 22:55:35', '2026-08-09 22:45:41'),
(512, 18, 4, 'customer_receipt', 'delivery_order', 'processing', 23, '2026-08-09 23:07:46', NULL, '2026-08-09 23:07:46'),
(513, 18, 4, 'kitchen_ticket', 'delivery_order', 'processing', 23, '2026-08-09 23:08:54', NULL, '2026-08-09 23:07:46'),
(717, 19, 4, 'customer_receipt', 'delivery_order', 'processing', 23, '2026-08-09 23:16:45', NULL, '2026-08-09 23:16:44'),
(718, 19, 4, 'kitchen_ticket', 'delivery_order', 'processing', 23, '2026-08-09 23:17:51', NULL, '2026-08-09 23:16:44'),
(767, 20, 4, 'customer_receipt', 'delivery_order', 'processed', 23, '2026-08-10 22:04:57', '2026-08-10 22:05:01', '2026-08-10 22:04:51'),
(768, 20, 4, 'kitchen_ticket', 'delivery_order', 'processed', 23, '2026-08-10 22:05:02', '2026-08-10 22:05:17', '2026-08-10 22:04:51'),
(947, 21, 4, 'customer_receipt', 'delivery_order', 'processing', 23, '2026-08-10 22:18:24', NULL, '2026-08-10 22:18:24'),
(948, 21, 4, 'kitchen_ticket', 'delivery_order', 'processing', 23, '2026-08-10 22:19:37', NULL, '2026-08-10 22:18:24'),
(1093, 22, 4, 'customer_receipt', 'delivery_order', 'processed', 23, '2026-08-10 22:26:27', '2026-08-10 22:26:31', '2026-08-10 22:26:23'),
(1094, 22, 4, 'kitchen_ticket', 'delivery_order', 'processed', 23, '2026-08-10 22:26:33', '2026-08-10 22:26:39', '2026-08-10 22:26:23'),
(1393, 25, 4, 'customer_receipt', 'qr_verified', 'processed', 23, '2026-08-13 23:04:00', '2026-08-13 23:04:15', '2026-08-13 22:42:40'),
(1394, 25, 4, 'kitchen_ticket', 'qr_verified', 'processed', 23, '2026-08-13 23:04:15', '2026-08-13 23:04:19', '2026-08-13 22:42:40'),
(1478, 26, 4, 'customer_receipt', 'delivery_order', 'processed', 23, '2026-08-13 23:09:26', '2026-08-13 23:09:28', '2026-08-13 23:08:51'),
(1479, 26, 4, 'kitchen_ticket', 'delivery_order', 'processed', 23, '2026-08-13 23:09:29', '2026-08-13 23:09:31', '2026-08-13 23:08:51');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_restaurants`
--

CREATE TABLE `tbl_restaurants` (
  `restaurant_id` int(11) NOT NULL,
  `name` varchar(150) NOT NULL,
  `description` text DEFAULT NULL,
  `logo_path` varchar(255) DEFAULT NULL,
  `banner_path` varchar(255) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `contact_number` varchar(50) DEFAULT NULL,
  `opening_hours` varchar(100) DEFAULT NULL,
  `delivery_fee` decimal(10,2) NOT NULL DEFAULT 0.00,
  `tax_registration_type` enum('vat','non_vat') DEFAULT NULL,
  `order_types_json` longtext DEFAULT NULL,
  `business_status` enum('Open','Closed','Temporarily Unavailable') NOT NULL DEFAULT 'Open',
  `owner_id` int(11) NOT NULL,
  `staff_access_code` varchar(100) NOT NULL,
  `setup_completed` tinyint(1) NOT NULL DEFAULT 0,
  `customer_visibility` enum('Hidden','Visible') NOT NULL DEFAULT 'Hidden'
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `tbl_restaurants`
--

INSERT INTO `tbl_restaurants` (`restaurant_id`, `name`, `description`, `logo_path`, `banner_path`, `address`, `contact_number`, `opening_hours`, `delivery_fee`, `tax_registration_type`, `order_types_json`, `business_status`, `owner_id`, `staff_access_code`, `setup_completed`, `customer_visibility`) VALUES
(2, 'Ayaw ko na Restaurant', NULL, NULL, NULL, 'Poblacion', '09457309228', 'Configured during partner application', 0.00, NULL, '[\"dine-in\",\"takeout\",\"delivery\"]', 'Closed', 18, '19EDF2E0A6C5', 1, 'Visible'),
(4, 'Test Environment', '', 'uploads/restaurant_logos/owner_22/restaurant_logo_20260729_152152_2a2e89d6f0901449.jpg', NULL, 'Poblacions', '094573092298', 'Configured in restaurant setup', 60.00, NULL, '[\"dine-in\",\"takeout\",\"delivery\"]', 'Open', 22, 'FC-DD4C-2A1D', 1, 'Visible'),
(5, 'MWuahahhha', '', '', NULL, 'Poblacion', '+639657853534', 'Configured in restaurant setup', 0.00, '', '[\"dine-in\",\"takeout\",\"delivery\"]', 'Closed', 25, 'F291D96BC283', 1, 'Hidden'),
(6, 'Drop By Cafe', '?? All Day Breakfast & Pasta\n?? Coffee & Non-Coffee Drinks\n? Snacks and Pastries\n?? Air-Conditioned Area\n? Pet-Friendly Cafe\n? PS4 and Board Games\n?Books Collections\n? Free Wi-Fi\n?? Free Parking\n? Dine In / Take Out / Delivery/ Pick-Up', 'uploads/restaurant_logos/owner_27/restaurant_logo_20260815_022944_a228cfd995c94b93.jpg', NULL, 'San Jose Drive, Sabaro', '+639617879757', 'Configured in restaurant setup', 50.00, '', '[\"dine-in\",\"takeout\",\"delivery\"]', 'Closed', 27, '7D2FB0EE81A7', 1, 'Hidden');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_stock_logs`
--

CREATE TABLE `tbl_stock_logs` (
  `log_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `change_qty` int(11) NOT NULL,
  `reason` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

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
  `address` text DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `status` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `remember_token_hash` varchar(255) DEFAULT NULL,
  `remember_token_expires` datetime DEFAULT NULL,
  `reset_token_hash` varchar(255) DEFAULT NULL,
  `reset_token_expires` datetime DEFAULT NULL,
  `is_verified` tinyint(4) DEFAULT 0,
  `verification_token` varchar(255) DEFAULT NULL,
  `verification_expires_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `tbl_users`
--

INSERT INTO `tbl_users` (`user_id`, `restaurant_id`, `role`, `full_name`, `email`, `contact_number`, `address`, `password_hash`, `status`, `created_at`, `remember_token_hash`, `remember_token_expires`, `reset_token_hash`, `reset_token_expires`, `is_verified`, `verification_token`, `verification_expires_at`) VALUES
(12, NULL, 'customer', 'helloworldcoding', 'carlosjaymiguel67@gmail.com', NULL, NULL, '$2y$10$smSq2TDgFGLhgAiX/OKr5uv3na/LCa6FNPIsOVivTv7vHZ8AIXnk2', 1, '2026-03-01 14:15:54', NULL, NULL, NULL, NULL, 1, NULL, NULL),
(17, NULL, 'admin', 'Carlos Jay Miguel T. Porto', 'foodconnectv1@gmail.com', '09457309228', NULL, '$2y$10$HExF9FmCKV0GMnEDRHWJT.T.e4BrRlL.ywOLwBm7dc43c6R1m0Xvq', 1, '2026-07-16 06:02:12', NULL, NULL, NULL, NULL, 1, NULL, NULL),
(18, 2, 'owner', 'Ian delacruz', 'jameslee050505051@gmail.com', '09457309228', NULL, '$2y$10$8Jy1FyOevG9VGm75bCknQ.x0EnTrO4DtXcbt2a9pq94F7nNdqLYGq', 1, '2026-07-24 14:29:16', NULL, NULL, NULL, NULL, 1, NULL, NULL),
(21, NULL, 'owner', 'ian the nigg', 'acadsonly67@gmail.com', '09457309228', NULL, '$2y$10$abOOCeZjO83FfR0QaM.DxuEf6JGx5asoV92lX5IqQbtScckebkzPe', 1, '2026-07-26 12:55:35', NULL, NULL, NULL, NULL, 1, NULL, NULL),
(22, 4, 'owner', 'Cj Tamayo Porto', 'cjmt42@gmail.com', '09457309228', '', '$2y$10$oowy4BuGDmi8SIREiIdNq.lYjRYc9zF99dIkXlG51iYkOelRSBxKa', 1, '2026-07-29 12:45:29', NULL, NULL, NULL, NULL, 1, NULL, NULL),
(23, 4, 'cashier', 'Test Cashier', 'itlog@gmail.com', '09457309228', 'Tanaytay, Alaminos City Pangasinan', '$2y$10$.tkvKvaZrFE/BLKy.4vy7ehv9KYgZMJkBJ1pWQ21DnsYGnXzltWGa', 1, '2026-08-02 15:36:20', NULL, NULL, NULL, NULL, 1, NULL, NULL),
(24, 4, 'delivery_staff', 'Test Driver', 'james@gmail.com', '09437853435', 'Popantay, Alaminos City Pangasinan', '$2y$10$GGGfqceNnXkP.mJmArwWp.lBF0.gfZuuGnUkJgQN8MKIwP6clJxO.', 1, '2026-08-05 13:18:26', NULL, NULL, NULL, NULL, 1, NULL, NULL),
(25, 5, 'owner', 'injel', 'eeegggihtloh@gmail.com', '+639898199722', NULL, '$2y$10$p2qpT/SX9Ca/GedCuGl9z.2e.PUWTFbnCeyLtf6M4VQtEoe4umtpO', 1, '2026-08-10 15:59:23', NULL, NULL, NULL, NULL, 1, NULL, NULL),
(27, 6, 'owner', 'Jemillene Laurente', 'gelracho07@gmail.com', '+639295096884', NULL, '$2y$10$/iRsgy9Txea.Qjnc55PHd.G0o8WegRV3MIIIUviSubye8MgY8G9OC', 1, '2026-08-14 18:29:16', NULL, NULL, NULL, NULL, 1, NULL, NULL);

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
  ADD PRIMARY KEY (`cart_id`);

--
-- Indexes for table `tbl_categories`
--
ALTER TABLE `tbl_categories`
  ADD PRIMARY KEY (`category_id`),
  ADD KEY `restaurant_id` (`restaurant_id`);

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
  ADD KEY `idx_orders_processed_cashier` (`processed_by_cashier_id`),
  ADD KEY `idx_orders_payment_status` (`payment_status`);

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
-- Indexes for table `tbl_partner_application_documents`
--
ALTER TABLE `tbl_partner_application_documents`
  ADD PRIMARY KEY (`document_id`),
  ADD UNIQUE KEY `uq_application_document_type` (`application_id`,`document_type`),
  ADD KEY `idx_verification_owner` (`owner_id`);

--
-- Indexes for table `tbl_partner_invitation_requests`
--
ALTER TABLE `tbl_partner_invitation_requests`
  ADD PRIMARY KEY (`request_id`),
  ADD KEY `idx_partner_invitation_email` (`email`),
  ADD KEY `idx_partner_invitation_status` (`request_status`),
  ADD KEY `idx_partner_invitation_reviewed_by` (`reviewed_by`);

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
  ADD PRIMARY KEY (`product_id`);

--
-- Indexes for table `tbl_queue`
--
ALTER TABLE `tbl_queue`
  ADD PRIMARY KEY (`queue_id`),
  ADD KEY `order_id` (`order_id`);

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
  MODIFY `log_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=172;

--
-- AUTO_INCREMENT for table `tbl_address_cache`
--
ALTER TABLE `tbl_address_cache`
  MODIFY `cache_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT for table `tbl_admin_login_attempts`
--
ALTER TABLE `tbl_admin_login_attempts`
  MODIFY `attempt_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=68;

--
-- AUTO_INCREMENT for table `tbl_cart`
--
ALTER TABLE `tbl_cart`
  MODIFY `cart_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `tbl_categories`
--
ALTER TABLE `tbl_categories`
  MODIFY `category_id` int(11) NOT NULL AUTO_INCREMENT;

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
  MODIFY `assignment_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

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
  MODIFY `order_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- AUTO_INCREMENT for table `tbl_order_items`
--
ALTER TABLE `tbl_order_items`
  MODIFY `order_item_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT for table `tbl_owner_trusted_devices`
--
ALTER TABLE `tbl_owner_trusted_devices`
  MODIFY `trusted_device_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `tbl_partner_applications`
--
ALTER TABLE `tbl_partner_applications`
  MODIFY `application_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `tbl_partner_application_documents`
--
ALTER TABLE `tbl_partner_application_documents`
  MODIFY `document_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `tbl_partner_invitation_requests`
--
ALTER TABLE `tbl_partner_invitation_requests`
  MODIFY `request_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_payments`
--
ALTER TABLE `tbl_payments`
  MODIFY `payment_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `tbl_products`
--
ALTER TABLE `tbl_products`
  MODIFY `product_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=107;

--
-- AUTO_INCREMENT for table `tbl_queue`
--
ALTER TABLE `tbl_queue`
  MODIFY `queue_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_receipt_print_jobs`
--
ALTER TABLE `tbl_receipt_print_jobs`
  MODIFY `print_job_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1810;

--
-- AUTO_INCREMENT for table `tbl_restaurants`
--
ALTER TABLE `tbl_restaurants`
  MODIFY `restaurant_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `tbl_stock_logs`
--
ALTER TABLE `tbl_stock_logs`
  MODIFY `log_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_users`
--
ALTER TABLE `tbl_users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `tbl_categories`
--
ALTER TABLE `tbl_categories`
  ADD CONSTRAINT `tbl_categories_ibfk_1` FOREIGN KEY (`restaurant_id`) REFERENCES `tbl_restaurants` (`restaurant_id`) ON DELETE CASCADE;

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
-- Constraints for table `tbl_partner_application_documents`
--
ALTER TABLE `tbl_partner_application_documents`
  ADD CONSTRAINT `fk_verification_application` FOREIGN KEY (`application_id`) REFERENCES `tbl_partner_applications` (`application_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_verification_owner` FOREIGN KEY (`owner_id`) REFERENCES `tbl_users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `tbl_partner_invitation_requests`
--
ALTER TABLE `tbl_partner_invitation_requests`
  ADD CONSTRAINT `fk_partner_invitation_reviewer` FOREIGN KEY (`reviewed_by`) REFERENCES `tbl_users` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `tbl_payments`
--
ALTER TABLE `tbl_payments`
  ADD CONSTRAINT `fk_payments_order` FOREIGN KEY (`order_id`) REFERENCES `tbl_orders` (`order_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_payments_restaurant` FOREIGN KEY (`restaurant_id`) REFERENCES `tbl_restaurants` (`restaurant_id`) ON UPDATE CASCADE;

--
-- Constraints for table `tbl_queue`
--
ALTER TABLE `tbl_queue`
  ADD CONSTRAINT `tbl_queue_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `tbl_orders` (`order_id`) ON DELETE CASCADE;

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
