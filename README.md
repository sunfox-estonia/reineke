# Reineke
> Я, Лис Рейнеке, приветствую вас в моем удивительном Лесу! Здесь каждый день — новое приключение, и  с хитрым взглядом я бегу навстречу каждому из них. Ловкость и изобретательность — вот ключи к успеху в этом Лесу!
> Я сопровождаю участников сервера Sunfox.ee в их приключениях в Море, на суше и в глубоких подземельях, в онлайне и в реальном мире. Не стесняйся обращаться ко мне за помощью и советом!

### Файлы конфигурации

Основной файл конфигурации config.json - размещается в корневой директории с файлами чат-бота Reineke:
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
        "dbname": "database title",
        "dbuser": "database username",
        "dbpass": "database user password"
    },
    "roles": {
        "level": {
            "newbie": "newbie role ID"
        },
        "community": {
            "glitterbeard": "glitterbeard role ID",
            "viruviking": "viruviking role ID"
        }
    },
    "colors": {
        "primaryDark": "Primary Dark color",
        "primaryBright": "Primary Bright color",
        "secondary": "Secondary color"
    },
    "url": {
        "landingUrl": "Joining to server page landing URL",
        "resourcesUrl": "Resources URL",
        "commonUrl": "Common URL"
    },
    "ui": {
        "icon_url": "Your bot icon URL here",
        "title":    "Your server or bot title here"
    },
    "api": {
        "steam": {
            "token": "Your Steam API token here"
        }
    }
}
```
Файл конфигурации со списками config.lists.json содержит несколько массивов данных: массив достижений, игр и доступных сервисов. Файл размещен в корневой директории проекта, примерная структура файла приведена далее:
```json
{
  "comendations": [
    { "name": "Посвящение в клоуны", "value": "101" },
    { "name": "Общее дело", "value": "102" },
  ],
  "games": [
    { "name": "Battlefield 1", "value": "1238840" },
    { "name": "Dead by Daylight", "value": "381210" }
  ],
  "services": [
    { "name": "Service title", "value": "Service code" }
  ]
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
  commendation_image boolean [default: false]
  steam_game_code varchar(64) [null]
}

enum commendation_type_list {
  general
  special
  ingame
}
```

Структуру БД смотри в файле ReinekeDb.sql.
