use `ReinekeDb`;

CREATE TABLE `users` (
  `user_id` integer UNIQUE PRIMARY KEY AUTO_INCREMENT,
  `user_landing` ENUM ('common', 'glitterbeard', 'viruviking') NOT NULL DEFAULT ('common'),
  `user_discord_uid` varchar(256),
  `user_name` varchar(256),
  `user_steam_uid` varchar(256),
  `user_xbox_uid` varchar(256),
  `user_timezone` varchar(256) DEFAULT (Europe/Tallinn),
  `user_invite_id` integer,
  `services_vpn_us` varchar(64) NOT NULL DEFAULT ('0'),
  `services_vpn_ee` varchar(64) NOT NULL DEFAULT ('0'),
  `user_date_created` timestamp DEFAULT (CURRENT_TIMESTAMP),
  `user_date_updated` timestamp,
  `user_date_deleted` timestamp
);

CREATE TABLE `user_comedations` (
  `record_id` integer UNIQUE PRIMARY KEY AUTO_INCREMENT,
  `user_discord_uid` varchar(256) NOT NULL,
  `comedation_code` varchar(64) NOT NULL,
  `date_created` timestamp DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE `user_gifts` (
  `record_id` integer UNIQUE PRIMARY KEY AUTO_INCREMENT,
  `user_discord_uid` varchar(256) NOT NULL,
  `gift_title` varchar(64) NOT NULL,
  `gift_description` varchar(64) NOT NULL,
  `gift_code` varchar(64) NOT NULL,
  `gift_key` varchar(256) NOT NULL,
  `date_created` timestamp DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE `events_roles` (
  `record_id` integer UNIQUE PRIMARY KEY AUTO_INCREMENT,
  `discord_event_id` varchar(256) NOT NULL,
  `discord_role_id` varchar(256) NOT NULL,
  `date_created` timestamp DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE `invites` (
  `invite_id` integer UNIQUE PRIMARY KEY AUTO_INCREMENT,
  `invite_code` varchar(64) NOT NULL,
  `user_id_created` integer,
  `invite_user_ip` varchar(128),
  `invite_user_story` varchar(256),
  `invite_used` boolean DEFAULT false,
  `invite_blocked` boolean DEFAULT false,
  `invite_date_created` timestamp DEFAULT (CURRENT_TIMESTAMP),
  `invite_date_used` timestamp
);

CREATE TABLE `dir_comedations` (
  `comedation_id` integer UNIQUE PRIMARY KEY AUTO_INCREMENT,
  `comedation_code` varchar(64) NOT NULL,
  `comedation_title` varchar(128) NOT NULL,
  `comedation_description` varchar(256) NOT NULL,
  `comedation_type` ENUM ('common', 'rare') NOT NULL DEFAULT ('common'),
  `comedation_pp` integer NOT NULL,
  `steam_game_code` varchar(64)
);

ALTER TABLE `invites` ADD FOREIGN KEY (`user_id_created`) REFERENCES `users` (`user_id`);
