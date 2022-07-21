-- phpMyAdmin SQL Dump
-- version 5.1.1
-- https://www.phpmyadmin.net/
--
-- Host: db
-- Generation Time: May 29, 2022 at 09:17 AM
-- Server version: 10.6.4-MariaDB-1:10.6.4+maria~focal
-- PHP Version: 7.4.25

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `lexo`
--

CREATE DATABASE IF NOT EXISTS lexo;
USE lexo;

-- --------------------------------------------------------

--
-- Table structure for table `dicts`
--

CREATE TABLE `dicts` (
  `id` varchar(100) NOT NULL,
  `title` varchar(256) DEFAULT NULL,
  `language` varchar(256) DEFAULT NULL,
  `blurb` varchar(256) DEFAULT NULL;
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `recovery_tokens`
--

CREATE TABLE `recovery_tokens` (
  `email` varchar(256) DEFAULT NULL,
  `requestAddress` varchar(256) DEFAULT NULL,
  `token` varchar(256) DEFAULT NULL,
  `expiration` datetime DEFAULT NULL,
  `usedDate` datetime DEFAULT NULL,
  `usedAddress` varchar(256) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `register_tokens`
--

CREATE TABLE `register_tokens` (
  `email` varchar(256) DEFAULT NULL,
  `requestAddress` varchar(256) DEFAULT NULL,
  `token` varchar(256) DEFAULT NULL,
  `expiration` datetime DEFAULT NULL,
  `usedDate` datetime DEFAULT NULL,
  `usedAddress` varchar(256) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `email` varchar(100) NOT NULL,
  `passwordHash` varchar(256) DEFAULT NULL,
  `sessionKey` varchar(256) DEFAULT NULL,
  `sessionLast` datetime DEFAULT NULL,
  `apiKey` varchar(256) DEFAULT NULL,
  `ske_id` int(11) DEFAULT NULL,
  `ske_username` varchar(256) DEFAULT NULL,
  `consent` int(11) DEFAULT NULL,
  `ske_apiKey` varchar(256) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`email`, `passwordHash`, `sessionKey`, `sessionLast`, `apiKey`, `ske_id`, `ske_username`, `consent`, `ske_apiKey`) VALUES
('root@localhost', '19367ca7d9eaebcdab29d23280a4ae17f971908b', 'KI5B4G4YSRYX2D55TFOZ2IEULOTIBCRH', '2022-02-07 05:36:51', NULL, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `user_dict`
--

CREATE TABLE `user_dict` (
  `id` int(10) NOT NULL,
  `dict_id` text DEFAULT NULL,
  `user_email` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `dicts`
--
ALTER TABLE `dicts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `title` (`title`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`email`),
  ADD KEY `email_password` (`email`,`passwordHash`),
  ADD KEY `email_session` (`email`,`sessionKey`,`sessionLast`);

--
-- Indexes for table `user_dict`
--
ALTER TABLE `user_dict`
  ADD PRIMARY KEY (`id`),
  ADD KEY `dict_id` (`dict_id`(768)),
  ADD KEY `user_email` (`user_email`(768));

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `user_dict`
--
ALTER TABLE `user_dict`
  MODIFY `id` int(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

-- --------------------------------------------------------
-- Added in 25/6/2022 
-- brief: add entry and searchables tables into lexo DB to use it in the gloabal search
--
-- Table structure for table `searchables`
--

CREATE TABLE `searchables` (
  `id` int(11) NOT NULL,
  `entry_id` int(11) DEFAULT NULL,
  `txt` varchar(512) DEFAULT NULL,
  `level` int(11) DEFAULT NULL,
  `dict_id` varchar(250) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `entries`
--

CREATE TABLE `entries` (
  `id` int(11) NOT NULL,
  `doctype` text DEFAULT NULL,
  `xml` text DEFAULT NULL,
  `title` varchar(1024) DEFAULT NULL,
  `sortkey` varchar(1024) DEFAULT NULL,
  `needs_resave` tinyint(1) DEFAULT 0,
  `needs_refresh` tinyint(1) DEFAULT 0,
  `needs_refac` tinyint(1) DEFAULT 0,
  `dict_id` varchar(250) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

-- --------------------------------------------------------


--
-- Indexes for table `entries`
--
ALTER TABLE `entries`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sortkey` (`sortkey`(768)),
  ADD KEY `needs_re` (`needs_resave`,`needs_refresh`,`needs_refac`);

--
-- AUTO_INCREMENT for table `entries`
--
ALTER TABLE `entries`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

  --
-- Indexes for table `searchables`
--
ALTER TABLE `searchables`
  ADD PRIMARY KEY (`id`),
  ADD KEY `entry_id` (`entry_id`),
  ADD KEY `search` (`txt`,`level`);

--
-- AUTO_INCREMENT for table `searchables`
--
ALTER TABLE `searchables`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

-- --
-- -- Constraints for table `searchables`
-- --
-- ALTER TABLE `searchables`
--   ADD CONSTRAINT `searchables_ibfk_1` FOREIGN KEY (`entry_id`) REFERENCES `entries` (`id`) ON DELETE CASCADE;


