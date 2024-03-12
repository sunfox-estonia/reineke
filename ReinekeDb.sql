use `ReinekeDb`;

CREATE TABLE `users` (
  `user_id` integer PRIMARY KEY AUTO_INCREMENT,
  `user_landing` ENUM ('common', 'glitterbeard', 'minecraftrpg') NOT NULL DEFAULT ('common'),
  `user_discord_uid` varchar(256),
  `user_name` varchar(256),
  `user_steam_uid` varchar(256),
  `user_timezone` varchar(256) DEFAULT ('Europe/Tallinn'),
  `user_invite_id` integer,
  `services_vpn_us` boolean DEFAULT false,
  `services_vpn_ee` boolean DEFAULT false,
  `user_date_created` timestamp DEFAULT CURRENT_TIMESTAMP,
  `user_date_updated` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `user_date_deleted` timestamp,
  INDEX (`user_id`)
);

CREATE TABLE `user_commendations` (
  `record_id` integer PRIMARY KEY AUTO_INCREMENT,
  `user_discord_uid` varchar(256) NOT NULL,
  `commendation_code` varchar(64) NOT NULL,
  `user_id_created` integer,
  `date_created` timestamp DEFAULT CURRENT_TIMESTAMP,
  INDEX (`record_id`)
);

CREATE TABLE `events_roles` (
  `record_id` integer PRIMARY KEY AUTO_INCREMENT,
  `discord_event_id` varchar(256) NOT NULL,
  `discord_role_id` varchar(256) NOT NULL,
  `date_created` timestamp DEFAULT CURRENT_TIMESTAMP,
  INDEX (`record_id`)
);

CREATE TABLE `user_games` (
  `record_id` integer PRIMARY KEY AUTO_INCREMENT,
  `game_user_id` integer,
  `steam_game_code` varchar(64) NOT NULL,
  `date_created` timestamp DEFAULT CURRENT_TIMESTAMP,
  INDEX (`record_id`)
);

CREATE TABLE `invites` (
  `invite_id` integer PRIMARY KEY AUTO_INCREMENT,
  `invite_code` varchar(64) NOT NULL,
  `user_id_created` integer,
  `invite_user_ip` varchar(128),
  `invite_user_story` varchar(256),
  `invite_used` boolean DEFAULT false,
  `invite_blocked` boolean DEFAULT false,
  `invite_date_created` timestamp DEFAULT CURRENT_TIMESTAMP,
  `invite_date_used` timestamp,
  INDEX (`invite_id`)
);

CREATE TABLE `dir_comedations` (
  `commendation_id` integer PRIMARY KEY AUTO_INCREMENT,
  `commendation_code` varchar(64) NOT NULL,
  `commendation_title` varchar(128) NOT NULL,
  `commendation_description` varchar(256) NOT NULL,
  `commendation_type` ENUM ('general', 'special', 'ingame') NOT NULL DEFAULT ('general'),
  `commendation_pp` integer NOT NULL,
  `commendation_image` boolean DEFAULT false,
  `steam_game_code` varchar(64) DEFAULT NULL,
  INDEX (`commendation_id`)
);

ALTER TABLE `user_commendations` ADD FOREIGN KEY (`user_id_created`) REFERENCES `users` (`user_id`);

ALTER TABLE `user_games` ADD FOREIGN KEY (`game_user_id`) REFERENCES `users` (`user_id`);

ALTER TABLE `invites` ADD FOREIGN KEY (`user_id_created`) REFERENCES `users` (`user_id`);
