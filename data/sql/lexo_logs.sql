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
-- Database: `lexo_template_blank`
--

CREATE DATABASE  IF NOT EXISTS lexo_logs;
USE lexo_logs;


-- --------------------------------------------------------

--
-- Table structure for table `SearchHistory`
--

  CREATE TABLE `SearchHistory` (
  `id` int(11) NOT NULL,
  `title` varchar(1024) DEFAULT NULL,
  `when` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `unixtime` int(40) NOT NULL,
  `email` varchar(128) DEFAULT NULL

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
--
-- Indexes for table `history`
--

ALTER TABLE `SearchHistory`
  ADD PRIMARY KEY (`id`),
  ADD KEY `history_by_email` (`email`,`unixtime`),
  ADD KEY `history_by_when` (`unixtime`);


--
-- AUTO_INCREMENT for table `SearchHistory`
--

ALTER TABLE `SearchHistory`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;


-- --------------------------------------------------------

--
-- Table structure for table `daily_words`
--

  CREATE TABLE `daily_words` (
  `id` int(11) NOT NULL,
  `entry_id` int(11) DEFAULT NULL,
  `txt` varchar(512) DEFAULT NULL,
  `dict_id` varchar(250) DEFAULT NULL,
  `unixtime` int(40) DEFAULT NULL

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Indexes for table `daily_words`
--

ALTER TABLE `daily_words`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `daily_words`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;