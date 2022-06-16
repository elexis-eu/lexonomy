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

CREATE DATABASE  IF NOT EXISTS lexo_template_blank;
USE lexo_crossref;

-- --------------------------------------------------------

--
-- Table structure for table `configs`
--

CREATE TABLE `configs` (
  `id` varchar(128) NOT NULL,
  `json` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `configs`
--

INSERT INTO `configs` (`id`, `json`) VALUES
('editing', '{\n	\"xonomyMode\": \"nerd\"\n}'),
('ident', '{\n	\"title\": \"blank\",\n	\"blurb\": \"\"\n}'),
('kex', '{\"url\": \"https://app.sketchengine.eu/\", \"apiurl\": \"https://api.sketchengine.eu/bonito/run.cgi\"}'),
('publico', '{\n	\"public\": false\n}'),
('searchability', '{\n	\"searchableElements\": []\n}'),
('subbing', '{}'),
('titling', '{\n	\"headword\": \"\",\n	\"headwordAnnotations\": [],\n	\"abc\": [\n		[\n			\"a\",\n			\"á\",\n			\"à\",\n			\"â\",\n			\"ä\",\n			\"ă\",\n			\"ā\",\n			\"ã\",\n			\"å\",\n			\"ą\",\n			\"æ\"\n		],\n		[\n			\"b\"\n		],\n		[\n			\"c\",\n			\"ć\",\n			\"ċ\",\n			\"ĉ\",\n			\"č\",\n			\"ç\"\n		],\n		[\n			\"d\",\n			\"ď\",\n			\"đ\"\n		],\n		[\n			\"e\",\n			\"é\",\n			\"è\",\n			\"ė\",\n			\"ê\",\n			\"ë\",\n			\"ě\",\n			\"ē\",\n			\"ę\"\n		],\n		[\n			\"f\"\n		],\n		[\n			\"g\",\n			\"ġ\",\n			\"ĝ\",\n			\"ğ\",\n			\"ģ\"\n		],\n		[\n			\"h\",\n			\"ĥ\",\n			\"ħ\"\n		],\n		[\n			\"i\",\n			\"ı\",\n			\"í\",\n			\"ì\",\n			\"i\",\n			\"î\",\n			\"ï\",\n			\"ī\",\n			\"į\"\n		],\n		[\n			\"j\",\n			\"ĵ\"\n		],\n		[\n			\"k\",\n			\"ĸ\",\n			\"ķ\"\n		],\n		[\n			\"l\",\n			\"ĺ\",\n			\"ŀ\",\n			\"ľ\",\n			\"ļ\",\n			\"ł\"\n		],\n		[\n			\"m\"\n		],\n		[\n			\"n\",\n			\"ń\",\n			\"ň\",\n			\"ñ\",\n			\"ņ\"\n		],\n		[\n			\"o\",\n			\"ó\",\n			\"ò\",\n			\"ô\",\n			\"ö\",\n			\"ō\",\n			\"õ\",\n			\"ő\",\n			\"ø\",\n			\"œ\"\n		],\n		[\n			\"p\"\n		],\n		[\n			\"q\"\n		],\n		[\n			\"r\",\n			\"ŕ\",\n			\"ř\",\n			\"ŗ\"\n		],\n		[\n			\"s\",\n			\"ś\",\n			\"ŝ\",\n			\"š\",\n			\"ş\",\n			\"ș\",\n			\"ß\"\n		],\n		[\n			\"t\",\n			\"ť\",\n			\"ţ\",\n			\"ț\"\n		],\n		[\n			\"u\",\n			\"ú\",\n			\"ù\",\n			\"û\",\n			\"ü\",\n			\"ŭ\",\n			\"ū\",\n			\"ů\",\n			\"ų\",\n			\"ű\"\n		],\n		[\n			\"v\"\n		],\n		[\n			\"w\",\n			\"ẃ\",\n			\"ẁ\",\n			\"ŵ\",\n			\"ẅ\"\n		],\n		[\n			\"x\"\n		],\n		[\n			\"y\",\n			\"ý\",\n			\"ỳ\",\n			\"ŷ\",\n			\"ÿ\"\n		],\n		[\n			\"z\",\n			\"ź\",\n			\"ż\",\n			\"ž\"\n		]\n	]\n}'),
('users', '{}'),
('xampl', '{\n	\"container\": \"\",\n	\"template\": \"\",\n	\"markup\": \"\"\n}'),
('xema', '{\n	\"root\": \"entry\",\n	\"elements\": {\n		\"entry\": {\n			\"filling\": \"chd\",\n			\"values\": [],\n			\"children\": [],\n			\"attributes\": {}\n		}\n	}\n}'),
('xemplate', '{\n	\"entry\": {\n		\"shown\": false,\n		\"layout\": \"block\"\n	}\n}');

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
  `needs_refac` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `history`
--

CREATE TABLE `history` (
  `id` int(11) NOT NULL,
  `entry_id` int(11) DEFAULT NULL,
  `action` varchar(128) DEFAULT NULL,
  `when` datetime DEFAULT NULL,
  `email` varchar(128) DEFAULT NULL,
  `xml` text DEFAULT NULL,
  `historiography` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `linkables`
--

CREATE TABLE `linkables` (
  `id` int(11) NOT NULL,
  `entry_id` int(11) DEFAULT NULL,
  `txt` text DEFAULT NULL,
  `element` varchar(1024) DEFAULT NULL,
  `preview` varchar(1024) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `searchables`
--

CREATE TABLE `searchables` (
  `id` int(11) NOT NULL,
  `entry_id` int(11) DEFAULT NULL,
  `txt` varchar(512) DEFAULT NULL,
  `level` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `sub`
--

CREATE TABLE `sub` (
  `id` int(11) NOT NULL,
  `parent_id` int(11) DEFAULT NULL,
  `child_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `configs`
--
ALTER TABLE `configs`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `entries`
--
ALTER TABLE `entries`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sortkey` (`sortkey`(768)),
  ADD KEY `needs_re` (`needs_resave`,`needs_refresh`,`needs_refac`);

--
-- Indexes for table `history`
--
ALTER TABLE `history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `history_by_entry_id` (`entry_id`,`when`),
  ADD KEY `history_by_email` (`email`,`when`),
  ADD KEY `history_by_when` (`when`),
  ADD KEY `history_by_action` (`action`,`when`);

--
-- Indexes for table `linkables`
--
ALTER TABLE `linkables`
  ADD PRIMARY KEY (`id`),
  ADD KEY `entry_id` (`entry_id`);

--
-- Indexes for table `searchables`
--
ALTER TABLE `searchables`
  ADD PRIMARY KEY (`id`),
  ADD KEY `entry_id` (`entry_id`),
  ADD KEY `search` (`txt`,`level`);

--
-- Indexes for table `sub`
--
ALTER TABLE `sub`
  ADD PRIMARY KEY (`id`),
  ADD KEY `parent_id` (`parent_id`),
  ADD KEY `child_id` (`child_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `entries`
--
ALTER TABLE `entries`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `history`
--
ALTER TABLE `history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `linkables`
--
ALTER TABLE `linkables`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `searchables`
--
ALTER TABLE `searchables`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `sub`
--
ALTER TABLE `sub`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `linkables`
--
ALTER TABLE `linkables`
  ADD CONSTRAINT `linkables_ibfk_1` FOREIGN KEY (`entry_id`) REFERENCES `entries` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `searchables`
--
ALTER TABLE `searchables`
  ADD CONSTRAINT `searchables_ibfk_1` FOREIGN KEY (`entry_id`) REFERENCES `entries` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `sub`
--
ALTER TABLE `sub`
  ADD CONSTRAINT `sub_ibfk_1` FOREIGN KEY (`parent_id`) REFERENCES `entries` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `sub_ibfk_2` FOREIGN KEY (`child_id`) REFERENCES `entries` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
