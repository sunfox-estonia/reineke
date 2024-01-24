# Reineke
> Я, Лис Рейнеке, приветствую вас в моем удивительном Лесу! Здесь каждый день — новое приключение, и  с хитрым взглядом я бегу навстречу каждому из них. Ловкость и изобретательность — вот ключи к успеху в этом Лесу!
> Я сопровождаю участников сервера Sunfox.ee в их приключениях в Море, на суше и в глубоких подземельях, в онлайне и в реальном мире. Не стесняйся обращаться ко мне за помощью и советом!

Файл конфигурации config.json - размещается в корневой директории с файлами чат-бота Reineke:
```json
{
    "token": "your Discord bot token here",
    "client_id": "your Application ID here",
    "guild_id": "your Discord Server ID here",
    "log_channels": {
        "notifictions": "user notifications channel ID here",
        "log": "bot system log channel ID here"
    },
    "db_config": {
        "host": "localhost",
        "dbname": "reineke_WTvQfD",
        "dbuser": "reineke_db_usr_WTvQfD",
        "dbpass": "4XtOTDDec19ROsf2y0rLrtHG"
    },
    "roles": {
        "newbie": "newbie role ID"
    },
    "colors": {
        "primaryDark": "Primary Dark color",
        "primaryBright": "Primary Bright color",
        "secondary": "Secondary color"
    },
    "url": {
        "landingUrl": "Joining to server page landing URL", // Needed for the invite link generation
        "resourcesUrl": "Resources URL", // Needed to show resources like images etc.
        "commonUrl": "Common URL" // Needed for common purposes
    }
}
```

Проект структуры БД для бота в формате DBML:
```dbml
Project ReinekeDb {
  database_type: 'MySQL'
  Note: 'Database for Reineke Discord Bot'
}

Table users {
  user_id integer [pk, unique, increment]
  user_landing user_landing_list [not null, default: `common`]
  user_discord_uid varchar(256) [null]
  user_name varchar(256) [null]
  user_steam_uid varchar(256) [null]
  user_timezone varchar(256) [null, default: `Europe/Tallinn`]
  user_invite_id integer
  services_vpn_us boolean [default: false]
  services_vpn_ee boolean [default: false]
  user_date_created timestamp [default: `now()`]
  user_date_updated timestamp [null]
  user_date_deleted timestamp [null]
}

enum user_landing_list {
  common
  glitterbeard
  minecraftrpg
}

Table user_commendations {
  record_id integer [pk, unique, increment]
  user_discord_uid varchar(256) [not null]
  commendation_code varchar(64) [not null]
  user_id_created integer [ref: > users.user_id]
  date_created timestamp [default: `now()`]
}

Table user_levels {
  record_id integer [pk, unique, increment]
  user_discord_uid varchar(256) [not null]
  level_code varchar(64) [not null]
  date_created timestamp [default: `now()`]
}

Table user_games {
  record_id integer [pk, unique, increment]
  game_user_id integer [ref: > users.user_id]
  steam_game_code varchar(64) [not null]
  date_created timestamp [default: `now()`] 
}

Table invites {
  invite_id integer [pk, unique, increment]
  invite_code varchar(64) [not null]
  user_id_created integer [ref: > users.user_id]
  invite_user_ip varchar(128) [null]
  invite_user_story varchar(256) [null]
  invite_used boolean [default: false]
  invite_blocked boolean [default: false]
  invite_date_created timestamp [default: `now()`]
  invite_date_used timestamp [null]
}

Table dir_comedations [headercolor: #EBC743] {
  commendation_id integer [pk, unique, increment]
  commendation_code varchar(64) [not null]
  commendation_title varchar(128) [not null]
  commendation_description  varchar(256) [not null]
  commendation_type commendation_type_list [not null, default: `general`]
  commendation_pp integer [not null]
  steam_game_code varchar(64) [null]
}

Table dir_levels [headercolor: #EBC743] {
  level_id integer [pk, unique, increment]
  level_code varchar(64) [not null]
  level_title varchar(128) [not null]
}

Table dir_games [headercolor: #EBC743] {
  record_id integer [pk, unique, increment]
  steam_game_code varchar(64) [not null]
  steam_game_title varchar(256) [not null]
  date_created timestamp [default: `now()`]
}

enum commendation_type_list {
  general
  special
  ingame
}
```
