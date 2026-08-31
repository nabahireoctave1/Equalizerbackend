-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Aug 31, 2026 at 08:30 PM
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
-- Database: `equalizer_system`
--

-- --------------------------------------------------------

--
-- Table structure for table `agent`
--

CREATE TABLE `agent` (
  `id` bigint(20) NOT NULL,
  `agent_id` bigint(20) NOT NULL,
  `permision_id` varchar(255) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `location` varchar(255) DEFAULT NULL,
  `phone` varchar(255) NOT NULL,
  `status` enum('active','suspended') DEFAULT 'active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `agent`
--

INSERT INTO `agent` (`id`, `agent_id`, `permision_id`, `name`, `email`, `location`, `phone`, `status`) VALUES
(0, 520057, '520057', 'Nabahire octave', 'nabahireoctave@gmail.com', 'kampala', '0782761859', 'active'),
(0, 905467, '905467', 'kemirembe peace', 'kemp0872@gmail.com', 'Nyagatare', '0789665345', 'active');

-- --------------------------------------------------------

--
-- Table structure for table `agent_log`
--

CREATE TABLE `agent_log` (
  `id` bigint(20) NOT NULL,
  `agent_id` bigint(20) DEFAULT NULL,
  `company_id` bigint(20) DEFAULT NULL,
  `paid_amount` varchar(255) DEFAULT NULL,
  `agent_fee` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `billing`
--

CREATE TABLE `billing` (
  `id` bigint(20) NOT NULL,
  `bill_id` bigint(20) NOT NULL,
  `company_id` bigint(20) DEFAULT NULL,
  `amount` decimal(12,2) DEFAULT NULL,
  `started_date` datetime DEFAULT current_timestamp(),
  `activation_type` varchar(120) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `expire_at` datetime(6) DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `billing`
--

INSERT INTO `billing` (`id`, `bill_id`, `company_id`, `amount`, `started_date`, `activation_type`, `created_at`, `expire_at`) VALUES
(1, 89488576, 108012, 100000.00, '2026-07-23 13:45:07', 'monthly_activation', '2026-07-21 11:45:07', '2026-08-27 13:25:24.336146');

-- --------------------------------------------------------

--
-- Table structure for table `branch`
--

CREATE TABLE `branch` (
  `id` int(11) NOT NULL,
  `branch_id` bigint(20) NOT NULL,
  `company_id` bigint(20) DEFAULT NULL,
  `branch_name` varchar(255) NOT NULL,
  `location` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `branch`
--

INSERT INTO `branch` (`id`, `branch_id`, `company_id`, `branch_name`, `location`) VALUES
(1, 890765, 108012, 'Rugano ', 'Hoima'),
(2, 6574658, 108012, 'gungu', 'Kampala'),
(3, 9875664, 284573, 'gasani', 'nyanza'),
(4, 9889765, 284573, 'HavestTech', 'Rwanda');

-- --------------------------------------------------------

--
-- Table structure for table `cashier`
--

CREATE TABLE `cashier` (
  `id` bigint(20) NOT NULL,
  `cashier_id` varchar(255) NOT NULL,
  `company_id` bigint(20) DEFAULT NULL,
  `branch_id` bigint(20) DEFAULT NULL,
  `cashier_name` varchar(255) NOT NULL,
  `cashier_contact` varchar(255) NOT NULL,
  `cashier_email` varchar(255) DEFAULT NULL,
  `cashier_location` varchar(255) DEFAULT NULL,
  `status` enum('active','suspended') DEFAULT 'active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `client`
--

CREATE TABLE `client` (
  `client_id` bigint(20) NOT NULL,
  `national_id` varchar(255) NOT NULL,
  `company_id` bigint(20) NOT NULL,
  `branch_id` bigint(20) NOT NULL,
  `client_name` varchar(255) NOT NULL,
  `location` varchar(255) NOT NULL,
  `phone` varchar(255) NOT NULL,
  `client_address` varchar(255) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `client`
--

INSERT INTO `client` (`client_id`, `national_id`, `company_id`, `branch_id`, `client_name`, `location`, `phone`, `client_address`, `created_at`, `updated_at`) VALUES
(786467, '1234567886778987', 108012, 9875664, 'jane hanet', 'Kigali', '0798724546', 'Hoima', '2026-07-24 09:59:35', '2026-06-25 12:34:39'),
(7873765, '78374636545', 108012, 6574658, 'Ndahayo diocres', 'Nyagatare', '0783734567', 'Bugesera', '2026-07-27 10:20:21', '2026-07-28 09:10:59');

-- --------------------------------------------------------

--
-- Table structure for table `client_flag`
--

CREATE TABLE `client_flag` (
  `id` bigint(20) NOT NULL,
  `company_id` bigint(20) DEFAULT NULL,
  `branch_id` bigint(20) DEFAULT NULL,
  `client_name` varchar(255) DEFAULT NULL,
  `reported_by` varchar(255) DEFAULT NULL,
  `reason` varchar(255) DEFAULT NULL,
  `date` datetime DEFAULT current_timestamp(),
  `status` enum('rejected','approved','pending') DEFAULT 'pending'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `client_flag`
--

INSERT INTO `client_flag` (`id`, `company_id`, `branch_id`, `client_name`, `reported_by`, `reason`, `date`, `status`) VALUES
(1, 284573, 9875664, 'Nyarugabo james', 'jane Hanet', 'froud suspension ', '2026-08-14 08:34:32', 'rejected'),
(2, 284573, 9875664, 'Bugingo Eddy', 'Jane Hanet', 'multiple loans in defferent company', '2026-08-14 08:36:36', 'rejected'),
(3, 284573, 9875664, 'cyusa dan', 'shema dan', 'loan approve request ', '2026-08-14 08:38:49', 'rejected'),
(4, 284573, 6574658, 'mugisha sam', 'cyusa emma', 'bad payment behaviors', '2026-08-14 18:37:27', 'approved'),
(5, 284573, NULL, 'bugingo Blaise', 'precious ishimwe', 'has overdue loans', '2026-08-14 18:42:28', 'rejected'),
(6, 284573, 6574658, 'mugabo Eddy', 'mugabo Emma', 'froud suspecious', '2026-08-14 18:43:47', 'approved');

-- --------------------------------------------------------

--
-- Table structure for table `company`
--

CREATE TABLE `company` (
  `company_id` bigint(20) NOT NULL,
  `admin_sys_Id` bigint(70) NOT NULL,
  `agent_id` bigint(20) DEFAULT NULL,
  `company_name` varchar(255) NOT NULL,
  `admin_name` varchar(255) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `admin_id` bigint(20) NOT NULL,
  `location` varchar(255) DEFAULT NULL,
  `status` enum('activated','inactivated','suspended','overdue') DEFAULT 'inactivated',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `unpdate_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `company`
--

INSERT INTO `company` (`company_id`, `admin_sys_Id`, `agent_id`, `company_name`, `admin_name`, `phone`, `admin_id`, `location`, `status`, `created_at`, `unpdate_at`) VALUES
(108012, 230551, 888988, 'Technova', 'Mugisha Dan', '0798724546', 1234556787609, 'Rwamagana', 'inactivated', '2026-07-09 09:05:24', '2026-08-16 10:22:45'),
(218490, 441916, 888988, 'xcurrency', 'james willlock', '0732782595', 1234567891012346, 'Uganda,Kampala', 'inactivated', '2026-07-09 09:22:27', '2026-07-09 09:22:27'),
(284573, 584211, 888988, 'NOvoCamp', 'kemirembe Joyce', '0798724540', 1234567891012345, 'Rwanda', 'inactivated', '2026-07-09 09:11:53', '2026-08-17 10:48:30'),
(357151, 156571, 89866, 'TurnLake', 'bugingo Blaise', '0787345640', 1111111111111111, 'Kigali', 'inactivated', '2026-07-09 09:10:10', '2026-07-09 09:10:10');

-- --------------------------------------------------------

--
-- Table structure for table `company_auto_notification`
--

CREATE TABLE `company_auto_notification` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `company_id` bigint(70) NOT NULL,
  `Reminder` varchar(255) NOT NULL,
  `overdue` varchar(255) NOT NULL,
  `created_at` timestamp(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` datetime(6) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `company_auto_notification`
--

INSERT INTO `company_auto_notification` (`id`, `company_id`, `Reminder`, `overdue`, `created_at`, `updated_at`) VALUES
(0, 284573, 'hello your payment is due to day', 'hello your payment is overdue to day', '2026-07-18 09:26:00.600499', '2026-08-18 11:44:14.000000'),
(1, 108012, 'the reminder message is available here ', 'the overdue message is now available', '2026-07-14 07:52:54.186612', '2026-08-09 12:12:31.000000');

-- --------------------------------------------------------

--
-- Table structure for table `company_sms_balance`
--

CREATE TABLE `company_sms_balance` (
  `id` bigint(20) NOT NULL,
  `company_id` bigint(20) DEFAULT NULL,
  `messages` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `company_sms_balance`
--

INSERT INTO `company_sms_balance` (`id`, `company_id`, `messages`, `created_at`, `updated_at`) VALUES
(1, 108012, '120', '2026-08-05 15:01:29', '2026-08-08 07:49:36');

-- --------------------------------------------------------

--
-- Table structure for table `company_sms_usage`
--

CREATE TABLE `company_sms_usage` (
  `id` bigint(20) NOT NULL,
  `company_id` bigint(20) NOT NULL,
  `usage_date` date NOT NULL,
  `sms_used` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `company_sms_usage`
--

INSERT INTO `company_sms_usage` (`id`, `company_id`, `usage_date`, `sms_used`, `created_at`, `updated_at`) VALUES
(1, 108012, '2026-08-19', 2000, '2026-08-06 10:15:57', '2026-08-06 17:46:29');

-- --------------------------------------------------------

--
-- Table structure for table `linktoken`
--

CREATE TABLE `linktoken` (
  `userid` bigint(70) NOT NULL,
  `Token` varchar(255) NOT NULL,
  `isused` tinyint(1) NOT NULL DEFAULT 0,
  `expiration` datetime(6) NOT NULL,
  `created_at` timestamp(6) NOT NULL DEFAULT current_timestamp(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `linktoken`
--

INSERT INTO `linktoken` (`userid`, `Token`, `isused`, `expiration`, `created_at`) VALUES
(156571, 'c71e84887d66397ccfa6a3a2c07f4c0a01e23722e1cc6ef4e6d0b0f55b902f5d', 1, '2026-07-09 09:25:11.000000', '2026-07-09 07:10:11.004438'),
(230551, '303b25825fb5ff7aa0190694cfe75064a06db5d5129662f895c1391aa90b844f', 1, '2026-07-09 09:20:27.000000', '2026-07-09 07:05:27.024980'),
(441916, 'f9569e6e538f2df8ea4bac17826221efc1da031770e3eeff0701986bc6c886f3', 0, '2026-07-09 09:37:28.000000', '2026-07-09 07:22:28.168810'),
(584211, '8c0ccbc809fa272a2827ed963c8ff26ed8ad7a7cf986e300a5f8bc326d67965b', 1, '2026-07-09 09:26:53.000000', '2026-07-09 07:11:53.293851'),
(619587, '85753184550642fdd855624620c74a817b0376347c5d698f97c88ba7a89b3a2d', 1, '2026-06-27 08:40:26.000000', '2026-06-27 06:25:26.069000'),
(624780, '76dd1ba520b3aa09520d1557edcbb2f597e662086db9e035938fa1864811bc6a', 1, '2026-06-27 09:01:03.000000', '2026-06-27 06:46:03.134047'),
(874625, '443b533d6caa88042df07912b517baf1b067a71212cf09b2caa30276219d7605', 0, '2026-06-27 08:54:23.000000', '2026-06-27 06:39:23.921318');

-- --------------------------------------------------------

--
-- Table structure for table `loan`
--

CREATE TABLE `loan` (
  `id` bigint(20) NOT NULL,
  `loan_id` varchar(70) NOT NULL,
  `company_id` bigint(20) DEFAULT NULL,
  `branch_id` bigint(20) DEFAULT NULL,
  `client_id` bigint(20) DEFAULT NULL,
  `client_name` varchar(255) NOT NULL,
  `national_id` varchar(255) NOT NULL,
  `recieved_amount` varchar(255) DEFAULT NULL,
  `totalpay` decimal(65,0) NOT NULL DEFAULT 0,
  `unpaid_days` int(11) NOT NULL DEFAULT 0,
  `status` enum('paid','unpaid') DEFAULT 'unpaid',
  `guarantor_name` varchar(255) NOT NULL,
  `guarantor_address` varchar(255) NOT NULL,
  `guarantor_contacts` varchar(20) NOT NULL,
  `amount_given` decimal(65,2) NOT NULL,
  `closing_date` datetime NOT NULL,
  `fees` int(20) NOT NULL,
  `pay_frequency` enum('daily','monthly','weekly') DEFAULT 'daily',
  `busines_type` varchar(250) NOT NULL,
  `bussiness_location` varchar(250) NOT NULL,
  `security` varchar(250) NOT NULL,
  `sec_pic` varchar(255) NOT NULL,
  `approved` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `location`
--

CREATE TABLE `location` (
  `id` bigint(20) NOT NULL,
  `location_id` bigint(20) NOT NULL,
  `client_id` bigint(20) DEFAULT NULL,
  `longitude` decimal(50,4) DEFAULT NULL,
  `latitude` decimal(50,4) DEFAULT NULL,
  `last_longotude` decimal(50,4) DEFAULT NULL,
  `last_latitude` decimal(50,4) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `notification`
--

CREATE TABLE `notification` (
  `notification_id` bigint(20) NOT NULL,
  `company_id` bigint(20) DEFAULT NULL,
  `notification` varchar(255) NOT NULL,
  `status` enum('unread','read') DEFAULT 'unread',
  `read_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `office`
--

CREATE TABLE `office` (
  `id` bigint(20) NOT NULL,
  `company_id` bigint(20) DEFAULT NULL,
  `branch_id` bigint(20) DEFAULT NULL,
  `client_id` bigint(20) DEFAULT NULL,
  `charge` varchar(255) NOT NULL,
  `balance` varchar(255) DEFAULT NULL,
  `loan_amount` varchar(255) DEFAULT NULL,
  `pay_location` varchar(255) DEFAULT NULL CHECK (`pay_location` in ('office','field')),
  `pay_date` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `office_charge`
--

CREATE TABLE `office_charge` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `company_id` bigint(20) DEFAULT NULL,
  `branch_id` bigint(20) DEFAULT NULL,
  `interest_percentage` decimal(12,2) NOT NULL,
  `startup_amount` bigint(20) NOT NULL,
  `end_amount` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `office_charge`
--

INSERT INTO `office_charge` (`id`, `company_id`, `branch_id`, `interest_percentage`, `startup_amount`, `end_amount`) VALUES
(2, 108012, 6574658, 13.00, 300000, 5000),
(3, 108012, 6574658, 5.00, 9000, 140000),
(6, 108012, 890765, 5.00, 12000, 150000),
(7, 108012, 890765, 13.00, 300000, 5000),
(8, 108012, 890765, 5.00, 9000, 140000),
(9, 108012, 890765, 13.00, 300000, 5000),
(12, 284573, 9875664, 5.00, 4000, 30000),
(13, 284573, 9875664, 5.00, 15000, 100000);

-- --------------------------------------------------------

--
-- Table structure for table `repayment`
--

CREATE TABLE `repayment` (
  `id` bigint(20) NOT NULL,
  `loan_id` varchar(70) NOT NULL,
  `company_id` bigint(20) DEFAULT NULL,
  `branch_id` bigint(20) DEFAULT NULL,
  `client_id` bigint(20) DEFAULT NULL,
  `client_name` varchar(255) NOT NULL,
  `client_amount` varchar(255) NOT NULL,
  `date` datetime DEFAULT current_timestamp(),
  `status` enum('done','failed') DEFAULT 'done',
  `signed_by` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `setting`
--

CREATE TABLE `setting` (
  `id` bigint(20) NOT NULL,
  `company_id` bigint(20) DEFAULT NULL,
  `disable_loan_app` tinyint(1) DEFAULT 1,
  `report_generetion_time` time DEFAULT NULL,
  `interest_percentage` decimal(12,2) NOT NULL,
  `payment_frequency` varchar(255) NOT NULL CHECK (`payment_frequency` in ('daily','weekly','monthly','season')),
  `grace_period` int(20) NOT NULL,
  `isofficechargeenabled` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `setting`
--

INSERT INTO `setting` (`id`, `company_id`, `disable_loan_app`, `report_generetion_time`, `interest_percentage`, `payment_frequency`, `grace_period`, `isofficechargeenabled`) VALUES
(1, 284573, 1, '08:06:00', 10.00, 'Monthly', 2, 1);

-- --------------------------------------------------------

--
-- Table structure for table `sms_transaction_logs`
--

CREATE TABLE `sms_transaction_logs` (
  `id` bigint(20) NOT NULL,
  `sms_id` varchar(20) NOT NULL,
  `company_id` bigint(20) DEFAULT NULL,
  `amount` decimal(12,2) NOT NULL,
  `sms_purchase_total` varchar(255) NOT NULL,
  `date` datetime DEFAULT current_timestamp(),
  `package_status` enum('active','expired') DEFAULT 'active',
  `status` enum('success','failed') DEFAULT 'success'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sms_transaction_logs`
--

INSERT INTO `sms_transaction_logs` (`id`, `sms_id`, `company_id`, `amount`, `sms_purchase_total`, `date`, `package_status`, `status`) VALUES
(1, '89763', 108012, 7000.00, '2980', '2026-08-05 16:57:23', 'expired', 'success'),
(2, '6767920', 108012, 90000.00, '9800', '2026-08-05 16:57:23', 'active', 'success');

-- --------------------------------------------------------

--
-- Table structure for table `super_admin_auto_notification`
--

CREATE TABLE `super_admin_auto_notification` (
  `id` int(20) NOT NULL,
  `reminder` varchar(255) NOT NULL,
  `overdue` varchar(255) NOT NULL,
  `created_at` datetime(6) DEFAULT current_timestamp(6),
  `updated_at` datetime(6) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `super_admin_auto_notification`
--

INSERT INTO `super_admin_auto_notification` (`id`, `reminder`, `overdue`, `created_at`, `updated_at`) VALUES
(1, 'hello every need to to activate their company before you account have been suspended', 'hello were here to solve your problem', '2026-07-06 20:21:49.614898', '2026-08-29 09:10:13.000000');

-- --------------------------------------------------------

--
-- Table structure for table `super_notification_setting`
--

CREATE TABLE `super_notification_setting` (
  `id` bigint(20) NOT NULL,
  `notification` varchar(255) DEFAULT NULL CHECK (`notification` in ('Remainder_notification','manual_notification')),
  `status` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `super_setting`
--

CREATE TABLE `super_setting` (
  `id` bigint(20) NOT NULL,
  `interest_percentage_ration` decimal(12,4) DEFAULT NULL,
  `grace_period` bigint(20) DEFAULT NULL,
  `lock_after_days` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `agent_amount` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `super_setting`
--

INSERT INTO `super_setting` (`id`, `interest_percentage_ration`, `grace_period`, `lock_after_days`, `created_at`, `updated_at`, `agent_amount`) VALUES
(1, 5.0000, 2, 1, '2026-07-06 18:21:49', '2026-08-29 07:10:13', '2');

-- --------------------------------------------------------

--
-- Table structure for table `terms_penalties`
--

CREATE TABLE `terms_penalties` (
  `id` bigint(20) NOT NULL,
  `company_id` bigint(20) DEFAULT NULL,
  `branch_id` bigint(20) DEFAULT NULL,
  `interest_percentage_penelty` bigint(20) DEFAULT NULL,
  `grace_period` varchar(255) DEFAULT NULL,
  `penalte_name` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `transcation_log`
--

CREATE TABLE `transcation_log` (
  `id` bigint(20) NOT NULL,
  `transcation_id` bigint(20) NOT NULL,
  `company_id` bigint(20) DEFAULT NULL,
  `amount` decimal(12,2) DEFAULT NULL,
  `transcation_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `status` enum('done','failed') DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` bigint(20) NOT NULL,
  `company_id` bigint(70) NOT NULL,
  `names` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `status` enum('active','suspended') DEFAULT 'active',
  `role` enum('superadmin','subadmin','cashier','user') DEFAULT 'user',
  `profile_photo` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `is_password_set` tinyint(1) DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `company_id`, `names`, `email`, `phone`, `status`, `role`, `profile_photo`, `password`, `is_password_set`, `created_at`, `updated_at`) VALUES
(156571, 357151, 'bugingo Blaise', 'bugingo1@gmail.com', '0787345640', 'active', 'superadmin', NULL, '$2b$08$1TZ7JdnRaXqAlS4BVUR0YejIHKLdWSSOGDohM.fx.P2C1fXzHkR6O', 1, '2026-07-09 09:10:11', '2026-07-09 09:15:02'),
(230551, 108012, 'Mugisha Dan', 'dan@gmail.com', '0798724546', 'active', 'subadmin', 'user-230551-1786868663400.png', '$2b$08$MF3DBiFkpFPinP3xE8L1qOvKl347.bEsZ2QMLlJbeTaMNWAqQOS7W', 1, '2026-07-09 09:05:25', '2026-08-16 10:24:23'),
(584211, 284573, 'kemirembe Joyce', 'codejoiner15@gmail.com', '0798724540', 'suspended', 'subadmin', NULL, '$2b$08$Ze/A9akUjO.KMj9UFbsD0OZxwif/fzDBNcQTprujaYXwum0C8iveq', 1, '2026-07-09 09:11:53', '2026-08-17 10:48:30');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `agent`
--
ALTER TABLE `agent`
  ADD PRIMARY KEY (`id`,`agent_id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `phone` (`phone`),
  ADD KEY `agent_id` (`agent_id`);

--
-- Indexes for table `agent_log`
--
ALTER TABLE `agent_log`
  ADD PRIMARY KEY (`id`),
  ADD KEY `company_id` (`company_id`),
  ADD KEY `agent_id` (`agent_id`);

--
-- Indexes for table `billing`
--
ALTER TABLE `billing`
  ADD PRIMARY KEY (`id`,`bill_id`),
  ADD UNIQUE KEY `bill_id` (`bill_id`),
  ADD UNIQUE KEY `company_id_2` (`company_id`),
  ADD KEY `company_id` (`company_id`);

--
-- Indexes for table `branch`
--
ALTER TABLE `branch`
  ADD PRIMARY KEY (`branch_id`),
  ADD UNIQUE KEY `id` (`id`),
  ADD KEY `company_id` (`company_id`);

--
-- Indexes for table `cashier`
--
ALTER TABLE `cashier`
  ADD PRIMARY KEY (`id`,`cashier_id`),
  ADD UNIQUE KEY `cashier_contact` (`cashier_contact`),
  ADD KEY `company_id` (`company_id`),
  ADD KEY `branch_id` (`branch_id`),
  ADD KEY `idx_cashier_id` (`cashier_id`);

--
-- Indexes for table `client`
--
ALTER TABLE `client`
  ADD PRIMARY KEY (`client_id`),
  ADD UNIQUE KEY `national_id` (`national_id`),
  ADD KEY `company_id` (`company_id`),
  ADD KEY `branch_id` (`branch_id`),
  ADD KEY `indx_client_id` (`client_id`);

--
-- Indexes for table `client_flag`
--
ALTER TABLE `client_flag`
  ADD PRIMARY KEY (`id`),
  ADD KEY `company_id` (`company_id`),
  ADD KEY `branch_id` (`branch_id`);

--
-- Indexes for table `company`
--
ALTER TABLE `company`
  ADD PRIMARY KEY (`company_id`),
  ADD UNIQUE KEY `company_name` (`company_name`),
  ADD UNIQUE KEY `admin_name` (`admin_name`),
  ADD UNIQUE KEY `admin_id` (`admin_id`),
  ADD UNIQUE KEY `company_id` (`company_id`),
  ADD KEY `fk_comp_agent` (`agent_id`);

--
-- Indexes for table `company_auto_notification`
--
ALTER TABLE `company_auto_notification`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `company_id` (`company_id`),
  ADD KEY `idx_company_id` (`company_id`);

--
-- Indexes for table `company_sms_balance`
--
ALTER TABLE `company_sms_balance`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `company_id_2` (`company_id`),
  ADD KEY `company_id` (`company_id`);

--
-- Indexes for table `company_sms_usage`
--
ALTER TABLE `company_sms_usage`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_company_date` (`company_id`,`usage_date`);

--
-- Indexes for table `linktoken`
--
ALTER TABLE `linktoken`
  ADD PRIMARY KEY (`userid`);

--
-- Indexes for table `loan`
--
ALTER TABLE `loan`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `loan_id` (`loan_id`),
  ADD UNIQUE KEY `guarantor_contacts` (`guarantor_contacts`),
  ADD KEY `company_id` (`company_id`),
  ADD KEY `branch_id` (`branch_id`),
  ADD KEY `idx_client_id_national_id` (`client_id`,`national_id`),
  ADD KEY `national_id` (`national_id`);

--
-- Indexes for table `location`
--
ALTER TABLE `location`
  ADD PRIMARY KEY (`id`,`location_id`),
  ADD KEY `idx_client_id` (`client_id`);

--
-- Indexes for table `notification`
--
ALTER TABLE `notification`
  ADD PRIMARY KEY (`notification_id`),
  ADD KEY `company_id` (`company_id`);

--
-- Indexes for table `office`
--
ALTER TABLE `office`
  ADD PRIMARY KEY (`id`),
  ADD KEY `company_id` (`company_id`),
  ADD KEY `branch_id` (`branch_id`),
  ADD KEY `client_id` (`client_id`);

--
-- Indexes for table `office_charge`
--
ALTER TABLE `office_charge`
  ADD PRIMARY KEY (`id`),
  ADD KEY `company_id` (`company_id`),
  ADD KEY `branch_id` (`branch_id`);

--
-- Indexes for table `repayment`
--
ALTER TABLE `repayment`
  ADD PRIMARY KEY (`id`),
  ADD KEY `company_id` (`company_id`),
  ADD KEY `branch_id` (`branch_id`),
  ADD KEY `client_id` (`client_id`),
  ADD KEY `idx_repay_id` (`id`),
  ADD KEY `loan_id` (`loan_id`);

--
-- Indexes for table `setting`
--
ALTER TABLE `setting`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `company_id_2` (`company_id`),
  ADD KEY `company_id` (`company_id`);

--
-- Indexes for table `sms_transaction_logs`
--
ALTER TABLE `sms_transaction_logs`
  ADD PRIMARY KEY (`id`,`sms_id`),
  ADD KEY `company_id` (`company_id`);

--
-- Indexes for table `super_admin_auto_notification`
--
ALTER TABLE `super_admin_auto_notification`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `super_notification_setting`
--
ALTER TABLE `super_notification_setting`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `super_setting`
--
ALTER TABLE `super_setting`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `terms_penalties`
--
ALTER TABLE `terms_penalties`
  ADD PRIMARY KEY (`id`),
  ADD KEY `company_id` (`company_id`),
  ADD KEY `branch_id` (`branch_id`);

--
-- Indexes for table `transcation_log`
--
ALTER TABLE `transcation_log`
  ADD PRIMARY KEY (`id`,`transcation_id`),
  ADD KEY `company_id` (`company_id`),
  ADD KEY `idx_date` (`transcation_date`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `phone` (`phone`),
  ADD KEY `indx_user_id` (`user_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `user_id_2` (`user_id`),
  ADD KEY `user_id_3` (`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `agent_log`
--
ALTER TABLE `agent_log`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `billing`
--
ALTER TABLE `billing`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `branch`
--
ALTER TABLE `branch`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `cashier`
--
ALTER TABLE `cashier`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `client_flag`
--
ALTER TABLE `client_flag`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `company`
--
ALTER TABLE `company`
  MODIFY `company_id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=995612;

--
-- AUTO_INCREMENT for table `company_sms_balance`
--
ALTER TABLE `company_sms_balance`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `company_sms_usage`
--
ALTER TABLE `company_sms_usage`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `linktoken`
--
ALTER TABLE `linktoken`
  MODIFY `userid` bigint(70) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=874626;

--
-- AUTO_INCREMENT for table `loan`
--
ALTER TABLE `loan`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `location`
--
ALTER TABLE `location`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `notification`
--
ALTER TABLE `notification`
  MODIFY `notification_id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `office`
--
ALTER TABLE `office`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `office_charge`
--
ALTER TABLE `office_charge`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `repayment`
--
ALTER TABLE `repayment`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `setting`
--
ALTER TABLE `setting`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `sms_transaction_logs`
--
ALTER TABLE `sms_transaction_logs`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `super_admin_auto_notification`
--
ALTER TABLE `super_admin_auto_notification`
  MODIFY `id` int(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `super_notification_setting`
--
ALTER TABLE `super_notification_setting`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `super_setting`
--
ALTER TABLE `super_setting`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `terms_penalties`
--
ALTER TABLE `terms_penalties`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `transcation_log`
--
ALTER TABLE `transcation_log`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=584212;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `agent_log`
--
ALTER TABLE `agent_log`
  ADD CONSTRAINT `agent_log_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `company` (`company_id`);

--
-- Constraints for table `billing`
--
ALTER TABLE `billing`
  ADD CONSTRAINT `billing_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `company` (`company_id`) ON UPDATE CASCADE;

--
-- Constraints for table `branch`
--
ALTER TABLE `branch`
  ADD CONSTRAINT `branch_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `company` (`company_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `cashier`
--
ALTER TABLE `cashier`
  ADD CONSTRAINT `cashier_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `company` (`company_id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `cashier_ibfk_2` FOREIGN KEY (`branch_id`) REFERENCES `branch` (`branch_id`) ON UPDATE CASCADE;

--
-- Constraints for table `client`
--
ALTER TABLE `client`
  ADD CONSTRAINT `client_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `company` (`company_id`),
  ADD CONSTRAINT `client_ibfk_2` FOREIGN KEY (`branch_id`) REFERENCES `branch` (`branch_id`);

--
-- Constraints for table `client_flag`
--
ALTER TABLE `client_flag`
  ADD CONSTRAINT `client_flag_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `company` (`company_id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `client_flag_ibfk_2` FOREIGN KEY (`branch_id`) REFERENCES `branch` (`branch_id`) ON UPDATE CASCADE;

--
-- Constraints for table `company_auto_notification`
--
ALTER TABLE `company_auto_notification`
  ADD CONSTRAINT `company_auto_notification_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `company` (`company_id`);

--
-- Constraints for table `company_sms_balance`
--
ALTER TABLE `company_sms_balance`
  ADD CONSTRAINT `company_sms_balance_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `company` (`company_id`) ON UPDATE CASCADE;

--
-- Constraints for table `company_sms_usage`
--
ALTER TABLE `company_sms_usage`
  ADD CONSTRAINT `company_sms_usage_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `company_sms_balance` (`company_id`);

--
-- Constraints for table `loan`
--
ALTER TABLE `loan`
  ADD CONSTRAINT `loan_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `company` (`company_id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `loan_ibfk_2` FOREIGN KEY (`branch_id`) REFERENCES `branch` (`branch_id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `loan_ibfk_3` FOREIGN KEY (`client_id`) REFERENCES `client` (`client_id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `loan_ibfk_4` FOREIGN KEY (`national_id`) REFERENCES `client` (`national_id`);

--
-- Constraints for table `location`
--
ALTER TABLE `location`
  ADD CONSTRAINT `location_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `client` (`client_id`) ON UPDATE CASCADE;

--
-- Constraints for table `notification`
--
ALTER TABLE `notification`
  ADD CONSTRAINT `notification_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `company` (`company_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `office`
--
ALTER TABLE `office`
  ADD CONSTRAINT `office_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `company` (`company_id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `office_ibfk_2` FOREIGN KEY (`branch_id`) REFERENCES `branch` (`branch_id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `office_ibfk_3` FOREIGN KEY (`client_id`) REFERENCES `client` (`client_id`) ON UPDATE CASCADE;

--
-- Constraints for table `office_charge`
--
ALTER TABLE `office_charge`
  ADD CONSTRAINT `office_charge_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `company` (`company_id`),
  ADD CONSTRAINT `office_charge_ibfk_2` FOREIGN KEY (`branch_id`) REFERENCES `branch` (`branch_id`);

--
-- Constraints for table `repayment`
--
ALTER TABLE `repayment`
  ADD CONSTRAINT `repayment_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `loan` (`client_id`),
  ADD CONSTRAINT `repayment_ibfk_2` FOREIGN KEY (`client_id`) REFERENCES `client` (`client_id`),
  ADD CONSTRAINT `repayment_ibfk_3` FOREIGN KEY (`loan_id`) REFERENCES `loan` (`loan_id`);

--
-- Constraints for table `setting`
--
ALTER TABLE `setting`
  ADD CONSTRAINT `setting_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `company` (`company_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `sms_transaction_logs`
--
ALTER TABLE `sms_transaction_logs`
  ADD CONSTRAINT `sms_transaction_logs_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `company` (`company_id`) ON UPDATE CASCADE;

--
-- Constraints for table `terms_penalties`
--
ALTER TABLE `terms_penalties`
  ADD CONSTRAINT `terms_penalties_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `company` (`company_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `terms_penalties_ibfk_2` FOREIGN KEY (`branch_id`) REFERENCES `branch` (`branch_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `transcation_log`
--
ALTER TABLE `transcation_log`
  ADD CONSTRAINT `transcation_log_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `company` (`company_id`) ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
