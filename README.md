# Reineke
> Я, Лис Рейнеке, приветствую вас в моем удивительном Лесу! Здесь каждый день — новое приключение, и  с хитрым взглядом я бегу навстречу каждому из них. Ловкость и изобретательность — вот ключи к успеху в этом Лесу!
> Я сопровождаю участников сервера Sunfox.ee в их приключениях в Море, на суше и в глубоких подземельях, в онлайне и в реальном мире. Не стесняйся обращаться ко мне за помощью и советом!


Проект структуры БД для бота:
```mysql-- ---
-- Globals
-- ---

-- SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";
-- SET FOREIGN_KEY_CHECKS=0;

-- ---
-- Table 'list_comedations'
-- List of the server achievements and commendations.
-- ---

DROP TABLE IF EXISTS `list_comedations`;
		
CREATE TABLE `list_comedations` (
  `commendation_id` INTEGER NULL AUTO_INCREMENT DEFAULT NULL,
  `commendation_code` VARCHAR(64) NOT NULL,
  `commendation_title` VARCHAR(256) NULL DEFAULT NULL,
  `commendation_description` VARCHAR(256) NULL DEFAULT NULL,
  `commendation_type` ENUM NULL DEFAULT general,
  `commendation_game_code` INTEGER NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`commendation_id`)
) COMMENT 'List of the server achievements and commendations.';

-- ---
-- Table 'users'
-- Tables with server users data
-- ---

DROP TABLE IF EXISTS `users`;
		
CREATE TABLE `users` (
  `user_id` INTEGER NULL AUTO_INCREMENT DEFAULT NULL,
  `user_landing` ENUM NOT NULL DEFAULT general,
  `user_discord_uid` VARCHAR(256) NULL DEFAULT NULL,
  `user_name` VARCHAR(256) NULL DEFAULT NULL,
  `user_steam_uid` VARCHAR(128) NULL DEFAULT NULL,
  `user_timezone` VARCHAR(128) NOT NULL DEFAULT 'Europe/Tallinn',
  `user_invite_id` INTEGER NULL DEFAULT NULL,
  `services_vpn_us` BINARY(1) NOT NULL DEFAULT '0',
  `services_vpn_ee` BINARY(1) NOT NULL DEFAULT '0',
  `user_date_created` TIMESTAMP NOT NULL AUTO_INCREMENT,
  `user_date_updated` TIMESTAMP NULL DEFAULT NULL,
  `user_date_deleted` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`user_id`)
) COMMENT 'Tables with server users data';

-- ---
-- Table 'invites'
-- 
-- ---

DROP TABLE IF EXISTS `invites`;
		
CREATE TABLE `invites` (
  `invite_id` INTEGER NULL AUTO_INCREMENT DEFAULT NULL,
  `invite_code` VARCHAR(128) NOT NULL,
  `user_id_created` INTEGER NOT NULL AUTO_INCREMENT,
  `invite_user_ip` VARCHAR(256) NULL DEFAULT NULL,
  `invite_user_story` VARCHAR(256) NULL DEFAULT NULL,
  `invite_used` BINARY NOT NULL DEFAULT '0',
  `invite_blocked` BINARY NOT NULL DEFAULT '0',
  `invite_date_created` TIMESTAMP NOT NULL AUTO_INCREMENT,
  `invite_date_used` DATETIME NULL DEFAULT NULL,
  PRIMARY KEY (`invite_id`)
);

-- ---
-- Table 'user_comendations'
-- 
-- ---

DROP TABLE IF EXISTS `user_comendations`;
		
CREATE TABLE `user_comendations` (
  `record_id` INTEGER NULL AUTO_INCREMENT DEFAULT NULL,
  `user_id` INTEGER NOT NULL AUTO_INCREMENT,
  `commendation_id` INTEGER NOT NULL AUTO_INCREMENT,
  `user_id_created` INTEGER NOT NULL AUTO_INCREMENT,
  `date_created` TIMESTAMP NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`record_id`)
);

-- ---
-- Table 'user_games'
-- List of the games tha users has been installed
-- ---

DROP TABLE IF EXISTS `user_games`;
		
CREATE TABLE `user_games` (
  `record_id` INTEGER NOT NULL AUTO_INCREMENT,
  `user_id` INTEGER NOT NULL AUTO_INCREMENT,
  `steam_game_code` VARCHAR(64) NOT NULL,
  `record_added` TIMESTAMP NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`record_id`)
) COMMENT 'List of the games tha users has been installed';

-- ---
-- Foreign Keys 
-- ---

ALTER TABLE `users` ADD FOREIGN KEY (user_invite_id) REFERENCES `invites` (`invite_id`);
ALTER TABLE `invites` ADD FOREIGN KEY (user_id_created) REFERENCES `users` (`user_id`);
ALTER TABLE `user_comendations` ADD FOREIGN KEY (user_id) REFERENCES `users` (`user_id`);
ALTER TABLE `user_comendations` ADD FOREIGN KEY (commendation_id) REFERENCES `list_comedations` (`commendation_id`);
ALTER TABLE `user_comendations` ADD FOREIGN KEY (user_id_created) REFERENCES `users` (`user_id`);
ALTER TABLE `user_games` ADD FOREIGN KEY (user_id) REFERENCES `users` (`user_id`);

-- ---
-- Table Properties
-- ---

-- ALTER TABLE `list_comedations` ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
-- ALTER TABLE `users` ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
-- ALTER TABLE `invites` ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
-- ALTER TABLE `user_comendations` ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
-- ALTER TABLE `user_games` ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
```
