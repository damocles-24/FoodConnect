-- phpMyAdmin SQL Dump
-- version 4.8.3
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jul 19, 2026 at 04:59 AM
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
-- Table structure for table `tbl_orders`
--

CREATE TABLE `tbl_orders` (
  `order_id` int(11) NOT NULL,
  `queue_number` int(11) DEFAULT NULL,
  `restaurant_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `customer_name` varchar(100) NOT NULL,
  `contact_number` varchar(30) NOT NULL,
  `order_type` varchar(30) NOT NULL,
  `order_status` enum('pending','preparing','ready','assigned','out_for_delivery','completed','cancelled') NOT NULL DEFAULT 'pending',
  `cancellation_reason` varchar(255) DEFAULT NULL,
  `cancelled_by` enum('cashier','customer') DEFAULT NULL,
  `cancelled_at` datetime DEFAULT NULL,
  `total_amount` decimal(10,2) NOT NULL,
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

INSERT INTO `tbl_orders` (`order_id`, `queue_number`, `restaurant_id`, `user_id`, `customer_name`, `contact_number`, `order_type`, `order_status`, `cancellation_reason`, `cancelled_by`, `cancelled_at`, `total_amount`, `payment_method`, `address`, `landmark`, `table_number`, `pickup_time`, `notes`, `created_at`) VALUES
(4, 101, 1, 12, 'Test Customer', '09123456789', 'delivery', 'completed', NULL, NULL, NULL, '250.00', 'COD', 'Test Address', 'Near Test Store', NULL, NULL, 'Test order for cashier dashboard', '2026-07-06 12:32:23'),
(5, NULL, 1, 12, 'www', '09457309228', 'dine-in', 'completed', NULL, NULL, NULL, '0.00', 'Cash', '', '', NULL, '', 'ewewe', '2026-07-08 15:45:45'),
(6, 1, 1, 12, 'weadawdad', '2231231414', 'dine-in', 'cancelled', NULL, NULL, NULL, '75.00', 'Cash', '', '', NULL, '', 'adaaddada', '2026-07-09 02:58:48'),
(7, 2, 1, 12, 'fgjkk', '12325123432', 'takeout', 'cancelled', NULL, NULL, NULL, '65.00', 'Cash', '', '', NULL, '12:18', 'wahtjghhjgh', '2026-07-09 03:19:09'),
(8, 1, 1, 12, 'salsal', '12345678912', 'delivery', 'out_for_delivery', NULL, NULL, NULL, '65.00', 'Cash on Delivery', 'Poblacion', 'novo', NULL, '', 'pasalsal', '2026-07-10 04:14:50'),
(9, 2, 1, 12, 'Carlos Jay Miguel T. Porto', '09872212345', 'dine-in', 'completed', NULL, NULL, NULL, '525.00', 'Cash', '', '', NULL, '', '', '2026-07-10 13:54:28'),
(10, 3, 1, 12, 'helloworld', '12312415236346', 'delivery', 'ready', NULL, NULL, NULL, '130.00', 'Cash on Delivery', 'Poblacion', 'novo', NULL, '', 'Malapit sa novo', '2026-07-10 13:57:24'),
(11, 1, 1, 12, 'Cj Tamayo Porto', '111111111', 'delivery', 'cancelled', NULL, NULL, NULL, '184.00', 'Cash on Delivery', 'Poblacion', 'novo', NULL, '', '', '2026-07-11 02:22:18'),
(12, 2, 1, 12, 'angel', '09985783488993775877666623228', 'dine-in', 'pending', NULL, NULL, NULL, '130.00', 'Cash', '', '', NULL, '', 'ggg', '2026-07-11 04:39:58'),
(13, 3, 1, 12, 'asgsddwa', '12312313123', 'dine-in', 'pending', NULL, NULL, NULL, '88.00', 'Cash', '', '', NULL, '', 'adwada', '2026-07-11 11:11:55'),
(14, 4, 1, 12, 'wadsdwad', 'awda123231231', 'dine-in', 'pending', NULL, NULL, NULL, '39.00', 'Cash', '', '', '', '', '', '2026-07-11 11:28:38'),
(15, 5, 1, 12, 'wwwwww', 'wwwww', 'dine-in', 'pending', NULL, NULL, NULL, '49.00', 'Cash', '', '', '', '', 'wwwww', '2026-07-11 12:40:19'),
(16, 6, 1, 12, 'ewqa2sqazr bf', '131233534534534', 'dine-in', 'pending', NULL, NULL, NULL, '39.00', 'Cash', '', '', '', '', 'eadawda', '2026-07-11 14:02:26'),
(17, 7, 1, 12, '23AWDASD', 'DWASDA', 'dine-in', 'pending', NULL, NULL, NULL, '39.00', 'Cash', '', '', '', '', 'DASDASD', '2026-07-11 14:08:34'),
(18, 1, 1, 12, 'dwadawdaw', '13141414', 'dine-in', 'preparing', NULL, NULL, NULL, '114.00', 'Cash', '', '', '', '', '', '2026-07-12 05:53:38'),
(23, 2, 1, 12, '213122131', '3123ed 3e4214e1', 'dine-in', 'ready', NULL, NULL, NULL, '134.00', 'Cash', '', '', '', '', '2311a', '2026-07-12 06:12:59'),
(24, 3, 1, 12, 'cj', '09457309228', 'dine-in', 'pending', NULL, NULL, NULL, '65.00', 'Cash', '', '', '', '', 'no pita', '2026-07-12 06:59:43'),
(25, 1, 1, 12, 'wwadadadawdasdwa', '43256456742', 'dine-in', 'completed', NULL, NULL, NULL, '65.00', 'Cash', '', '', '', '', 'wwwwww', '2026-07-13 05:46:17'),
(26, 2, 1, 12, 'wwwww', '23123123123', 'dine-in', 'cancelled', NULL, NULL, NULL, '65.00', 'Cash', '', '', '', '', 'wdawdawdaw', '2026-07-13 06:12:02'),
(27, 3, 1, 12, 'dwadadaw', '23131313122', 'dine-in', 'cancelled', NULL, NULL, NULL, '98.00', 'Cash', '', '', '', '', '', '2026-07-13 06:18:37'),
(28, 4, 1, 12, 'cjh', '23123124125', 'dine-in', 'ready', NULL, NULL, NULL, '65.00', 'Cash', '', '', '', '', '', '2026-07-13 06:29:48'),
(29, 1, 1, 12, 'dwadadwad', '12312312312', 'dine-in', 'cancelled', NULL, NULL, NULL, '110.00', 'Cash', '', '', '', '', '', '2026-07-14 13:37:50'),
(30, 1, 1, 12, 'Cj Tamayo Porto', '09457309228', 'dine-in', 'cancelled', NULL, NULL, NULL, '65.00', 'Cash', '', '', '', '', '', '2026-07-17 07:47:12'),
(31, 2, 1, 17, 'Cj Tamayo Porto', '09878764435', 'delivery', 'ready', NULL, NULL, NULL, '65.00', 'Cash on Delivery', 'Poblacion', '', '', '', '', '2026-07-17 08:26:40'),
(32, 1, 1, 12, 'Cj Tamayo Porto', '09445730933', 'dine-in', 'pending', NULL, NULL, NULL, '65.00', 'Cash', '', '', '', '', '', '2026-07-18 22:26:20'),
(33, 2, 1, 12, 'wdadadadwada', '09876632114', 'dine-in', 'pending', NULL, NULL, NULL, '39.00', 'Cash', '', '', '', '', '', '2026-07-18 22:28:57'),
(34, 3, 1, 12, 'Cj Tamayo Porto', '09457309228', 'dine-in', 'pending', NULL, NULL, NULL, '39.00', 'Cash', '', '', '', '', '', '2026-07-18 23:00:42'),
(35, 4, 1, 12, 'Cj Tamayo Porto', '09212414124', 'dine-in', 'pending', NULL, NULL, NULL, '39.00', 'Cash', '', '', '', '', '', '2026-07-19 00:15:07'),
(36, 5, 1, 12, 'Cj Tamayo Porto', '09432918348', 'dine-in', 'cancelled', 'Want to change my order', 'customer', '2026-07-19 10:31:16', '39.00', 'Cash', '', '', '', '', '', '2026-07-19 02:26:59');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `tbl_orders`
--
ALTER TABLE `tbl_orders`
  ADD PRIMARY KEY (`order_id`),
  ADD KEY `restaurant_id` (`restaurant_id`),
  ADD KEY `user_id` (`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `tbl_orders`
--
ALTER TABLE `tbl_orders`
  MODIFY `order_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=37;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `tbl_orders`
--
ALTER TABLE `tbl_orders`
  ADD CONSTRAINT `tbl_orders_ibfk_1` FOREIGN KEY (`restaurant_id`) REFERENCES `tbl_restaurants` (`restaurant_id`),
  ADD CONSTRAINT `tbl_orders_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `tbl_users` (`user_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
