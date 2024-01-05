SET NAMES utf8;
SET time_zone = '+02:00';

CREATE DATABASE `ReinekeDb` /*!40100 DEFAULT CHARACTER SET utf8 */;
USE `ReinekeDb`;

DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `user_commendations`;
DROP TABLE IF EXISTS `user_games`;
DROP TABLE IF EXISTS `invites`;
DROP TABLE IF EXISTS `dir_comedations`;
DROP TABLE IF EXISTS `dir_games`;

CREATE TABLE `users` (
  `user_id` integer UNIQUE PRIMARY KEY,
  `user_landing` ENUM ('general', 'glitterbeard', 'minecraftrpg') NOT NULL,
  `user_discord_uid` varchar(256),
  `user_name` varchar(256),
  `user_steam_uid` varchar(256),
  `user_timezone` varchar(256) DEFAULT (Europe/Tallinn),
  `user_invite_id` integer,
  `services_vpn_us` boolean DEFAULT false,
  `services_vpn_ee` boolean DEFAULT false,
  `user_date_created` timestamp DEFAULT (now()),
  `user_date_updated` timestamp,
  `user_date_deleted` timestamp
);

CREATE TABLE `user_commendations` (
  `record_id` integer UNIQUE PRIMARY KEY,
  `user_discord_uid` varchar(256) NOT NULL,
  `commendation_code` varchar(64) NOT NULL,
  `user_id_created` integer,
  `date_created` timestamp DEFAULT (now())
);

CREATE TABLE `user_games` (
  `record_id` integer UNIQUE PRIMARY KEY,
  `game_user_id` integer,
  `steam_game_code` varchar(64) NOT NULL,
  `date_created` timestamp DEFAULT (now())
);

CREATE TABLE `invites` (
  `invite_id` integer UNIQUE PRIMARY KEY,
  `invite_code` varchar(64) NOT NULL,
  `user_id_created` integer,
  `invite_user_ip` varchar(128),
  `invite_user_story` varchar(256),
  `invite_used` boolean DEFAULT false,
  `invite_blocked` boolean DEFAULT false,
  `invite_date_created` timestamp DEFAULT (now()),
  `invite_date_used` timestamp
);

CREATE TABLE `dir_comedations` (
  `commendation_id` integer UNIQUE PRIMARY KEY,
  `commendation_code` varchar(64) NOT NULL,
  `commendation_title` varchar(128) NOT NULL,
  `commendation_description` varchar(256) NOT NULL,
  `status` ENUM ('general', 'special', 'ingame'),
  `steam_game_code` varchar(64)
);

CREATE TABLE `dir_games` (
  `record_id` integer UNIQUE PRIMARY KEY,
  `steam_game_code` varchar(64) NOT NULL,
  `steam_game_title` varchar(256) NOT NULL,
  `date_created` timestamp DEFAULT (now())
);

ALTER TABLE `user_commendations` ADD FOREIGN KEY (`user_id_created`) REFERENCES `users` (`user_id`);

ALTER TABLE `user_games` ADD FOREIGN KEY (`game_user_id`) REFERENCES `users` (`user_id`);

ALTER TABLE `invites` ADD FOREIGN KEY (`user_id_created`) REFERENCES `users` (`user_id`);
