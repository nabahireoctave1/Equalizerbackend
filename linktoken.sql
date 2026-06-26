-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 26, 2026 at 01:37 PM
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
(927953, 'ad99093b0fb607f6ef1b8a209d4fcb1eee4c2a31a6a42357b9d8082fe782ad10', 1, '2026-06-25 12:49:10.000000', '2026-06-25 10:34:10.218671');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `linktoken`
--
ALTER TABLE `linktoken`
  ADD PRIMARY KEY (`userid`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `linktoken`
--
ALTER TABLE `linktoken`
  MODIFY `userid` bigint(70) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=954120;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
