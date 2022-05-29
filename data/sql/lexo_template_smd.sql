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
-- Database: `lexo_template_smd`
--

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
('apik', '{}'),
('editing', '{\n	\"xonomyMode\": \"nerd\"\n}'),
('ident', '{\n	\"title\": \"Simple Monolingual Dictionary\",\n	\"blurb\": \"This is a simple dictionary of English, with only three entries, intended to demonstrate the capabilities of Lexonomy.\"\n}'),
('kex', '{\"url\": \"https://app.sketchengine.eu/\", \"apiurl\": \"https://api.sketchengine.eu/bonito/run.cgi\"}'),
('publico', '{\n	\"public\": false\n}'),
('searchability', '{}'),
('subbing', '{}'),
('titling', '{\"abc\":[[\"a\",\"á\",\"à\",\"â\",\"ä\",\"ă\",\"ā\",\"ã\",\"å\",\"ą\",\"æ\"],[\"b\"],[\"c\",\"ć\",\"ċ\",\"ĉ\",\"č\",\"ç\"],[\"d\",\"ď\",\"đ\"],[\"e\",\"é\",\"è\",\"ė\",\"ê\",\"ë\",\"ě\",\"ē\",\"ę\"],[\"f\"],[\"g\",\"ġ\",\"ĝ\",\"ğ\",\"ģ\"],[\"h\",\"ĥ\",\"ħ\"],[\"i\",\"ı\",\"í\",\"ì\",\"i\",\"î\",\"ï\",\"ī\",\"į\"],[\"j\",\"ĵ\"],[\"k\",\"ĸ\",\"ķ\"],[\"l\",\"ĺ\",\"ŀ\",\"ľ\",\"ļ\",\"ł\"],[\"m\"],[\"n\",\"ń\",\"ň\",\"ñ\",\"ņ\"],[\"o\",\"ó\",\"ò\",\"ô\",\"ö\",\"ō\",\"õ\",\"ő\",\"ø\",\"œ\"],[\"p\"],[\"q\"],[\"r\",\"ŕ\",\"ř\",\"ŗ\"],[\"s\",\"ś\",\"ŝ\",\"š\",\"ş\",\"ș\",\"ß\"],[\"t\",\"ť\",\"ţ\",\"ț\"],[\"u\",\"ú\",\"ù\",\"û\",\"ü\",\"ŭ\",\"ū\",\"ů\",\"ų\",\"ű\"],[\"v\"],[\"w\",\"ẃ\",\"ẁ\",\"ŵ\",\"ẅ\"],[\"x\"],[\"y\",\"ý\",\"ỳ\",\"ŷ\",\"ÿ\"],[\"z\",\"ź\",\"ż\",\"ž\"]]}'),
('users', '{\n	\"valselob@gmail.com\": {\n		\"canEdit\": true,\n		\"canConfig\": true,\n		\"canDownload\": true,\n		\"canUpload\": true\n	}\n}'),
('xampl', '{\n	\"container\": \"example\",\n	\"template\": \"<example>$text</example>\",\n	\"markup\": \"h\"\n}'),
('xema', '{\n	\"root\": \"entry\",\n	\"elements\": {\n		\"entry\": {\n			\"filling\": \"chd\",\n			\"values\": [],\n			\"children\": [\n				{\n					\"name\": \"headword\",\n					\"min\": \"1\",\n					\"max\": \"1\"\n				},\n				{\n					\"name\": \"partOfSpeech\",\n					\"min\": \"0\",\n					\"max\": \"1\"\n				},\n				{\n					\"name\": \"sense\",\n					\"min\": \"1\",\n					\"max\": \"0\"\n				}\n			],\n			\"attributes\": {}\n		},\n		\"headword\": {\n			\"filling\": \"txt\",\n			\"values\": [],\n			\"children\": [],\n			\"attributes\": {}\n		},\n		\"partOfSpeech\": {\n			\"filling\": \"lst\",\n			\"values\": [\n				{\n					\"value\": \"n\",\n					\"caption\": \"noun\"\n				},\n				{\n					\"value\": \"v\",\n					\"caption\": \"verb\"\n				},\n				{\n					\"value\": \"adj\",\n					\"caption\": \"adjective\"\n				}\n			],\n			\"children\": [],\n			\"attributes\": {}\n		},\n		\"sense\": {\n			\"filling\": \"chd\",\n			\"values\": [],\n			\"children\": [\n				{\n					\"name\": \"definition\",\n					\"min\": \"0\",\n					\"max\": \"1\"\n				},\n				{\n					\"name\": \"example\",\n					\"min\": \"0\",\n					\"max\": \"0\"\n				}\n			],\n			\"attributes\": {}\n		},\n		\"definition\": {\n			\"filling\": \"txt\",\n			\"values\": [],\n			\"children\": [],\n			\"attributes\": {}\n		},\n		\"example\": {\n			\"filling\": \"inl\",\n			\"values\": [],\n			\"children\": [\n				{\n					\"name\": \"h\",\n					\"min\": \"0\",\n					\"max\": \"0\"\n				}\n			],\n			\"attributes\": {}\n		},\n		\"h\": {\n			\"filling\": \"txt\",\n			\"values\": [],\n			\"children\": [],\n			\"attributes\": {}\n		}\n	}\n}'),
('xemplate', '{\n        \"entry\": {\n                \"shown\": true,\n                \"layout\": \"block\"\n        },\n        \"headword\": {\n                \"shown\": true,\n                \"layout\": \"inline\",\n                \"separation\": \"space\",\n                \"gutter\": \"\",\n                \"weight\": \"bold\",\n                \"slant\": \"\",\n                \"colour\": \"red\"\n        },\n        \"partOfSpeech\": {\n                \"shown\": true,\n                \"layout\": \"inline\",\n                \"separation\": \"space\",\n                \"gutter\": \"\",\n                \"weight\": \"\",\n                \"slant\": \"italic\",\n                \"colour\": \"green\"\n        },\n        \"sense\": {\n                \"shown\": true,\n                \"layout\": \"block\",\n                \"separation\": \"space\",\n                \"gutter\": \"sensenum1\",\n                \"weight\": \"\",\n                \"slant\": \"\",\n                \"colour\": \"\"\n        },\n        \"definition\": {\n                \"shown\": true,\n                \"layout\": \"block\",\n                \"separation\": \"space\",\n                \"gutter\": \"\",\n                \"weight\": \"\",\n                \"slant\": \"\",\n                \"colour\": \"\"\n        },\n        \"example\": {\n                \"shown\": true,\n                \"layout\": \"block\",\n                \"separation\": \"space\",\n                \"gutter\": \"disk\",\n                \"weight\": \"\",\n                \"slant\": \"italic\",\n                \"colour\": \"blue\"\n        },\n        \"h\": {\n                \"shown\": true,\n                \"layout\": \"inline\",\n                \"separation\": \"space\",\n                \"gutter\": \"\",\n                \"weight\": \"bold\",\n                \"slant\": \"\",\n                \"colour\": \"\"\n        }\n}\n');

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

--
-- Dumping data for table `entries`
--

INSERT INTO `entries` (`id`, `doctype`, `xml`, `title`, `sortkey`, `needs_resave`, `needs_refresh`, `needs_refac`) VALUES
(1, 'entry', '<entry><headword xml:space=\"preserve\">able</headword><partOfSpeech xml:space=\"preserve\">adj</partOfSpeech><sense><definition xml:space=\"preserve\">If someone is able to do something, they can do it.</definition><example xml:space=\"preserve\">I\'m busy tomorrow, so I won\'t be <h xml:space=\"preserve\">able</h> to see you.</example></sense><sense><definition xml:space=\"preserve\">If a person is able, they are good or skillful at what they do.</definition><example xml:space=\"preserve\">She is an <h xml:space=\"preserve\">able</h> teacher.</example></sense></entry>', '<span class=\'headword\'>able</span>', '_00000_00011_00053_00021', 0, 0, 0),
(2, 'entry', '<entry><headword xml:space=\"preserve\">ask</headword><partOfSpeech xml:space=\"preserve\">v</partOfSpeech><sense><definition xml:space=\"preserve\">To look for an answer to a question.</definition><example xml:space=\"preserve\">I need to <h xml:space=\"preserve\">ask</h> you a question.</example><example xml:space=\"preserve\">I don\'t know, <h xml:space=\"preserve\">ask</h> your mother.</example></sense><sense><definition xml:space=\"preserve\">To talk to someone to see if they will do something.</definition><example xml:space=\"preserve\">She <h xml:space=\"preserve\">asked</h> me to help her.</example><example xml:space=\"preserve\">We will have to <h xml:space=\"preserve\">ask</h> for more money.</example></sense></entry>', '<span class=\'headword\'>ask</span>', '_00000_00081_00050', 0, 0, 0),
(3, 'entry', '<entry><headword xml:space=\"preserve\">arm</headword><partOfSpeech xml:space=\"preserve\">n</partOfSpeech><sense><definition xml:space=\"preserve\">One of the upper limbs, from shoulder to wrist.</definition><example xml:space=\"preserve\">You have very long <h xml:space=\"preserve\">arms</h>.</example><example xml:space=\"preserve\">My left <h xml:space=\"preserve\">arm</h> hurts.</example></sense><sense><definition xml:space=\"preserve\">A weapon.</definition><example xml:space=\"preserve\">The <h xml:space=\"preserve\">arms</h> dealer was arrested.</example></sense></entry>', '<span class=\'headword\'>arm</span>', '_00000_00077_00059', 0, 0, 0);

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

--
-- Dumping data for table `searchables`
--

INSERT INTO `searchables` (`id`, `entry_id`, `txt`, `level`) VALUES
(1, 1, 'able', 1),
(2, 3, 'arm', 1),
(3, 2, 'ask', 1);

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

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
