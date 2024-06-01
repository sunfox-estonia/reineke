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
        "play2" : "/play2gether command notifications channel ID here",
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
  "gifts": {
      "shortlist" : [
          { "name": "Chipped Tankard", "value": "20241" }
      ],
      "longlist" : {
          "20241": {
              "title": "Chipped Tankard",
              "description": "A chipped tankard that has seen better days. It's still usable, but it's not the most attractive thing in the world.",
          }
      }
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
  user_xbox_uid varchar(256) [null]
  user_timezone varchar(256) [null, default: `Europe/Tallinn`]
  user_invite_id integer
  services_vpn_us boolean [default: false]
  services_vpn_ee boolean [default: false]
  user_date_created timestamp [default: `CURRENT_TIMESTAMP`]
  user_date_updated timestamp [null]
  user_date_deleted timestamp [null]
}

enum user_landing_list {
  common
  glitterbeard
  viruviking
}

Table user_comedations {
  record_id integer [pk, unique, increment]
  user_discord_uid varchar(256) [not null]
  comedation_code varchar(64) [not null]
  date_created timestamp [default: `CURRENT_TIMESTAMP`]
}

Table user_gifts{
  record_id integer [pk, unique, increment]
  user_discord_uid varchar(256) [not null]
  gift_code varchar(64) [not null]
  gift_title varchar(64) [not null]
  gift_description varchar(64) [not null]
  gift_key varchar(64) [not null]
  date_created timestamp [default: `CURRENT_TIMESTAMP`]
}

Table events_roles {
  record_id integer [pk, unique, increment]
  discord_event_id varchar(256) [not null]
  discord_role_id varchar(256) [not null]
  date_created timestamp [default: `CURRENT_TIMESTAMP`]
}

Table invites {
  invite_id integer [pk, unique, increment]
  invite_code varchar(64) [not null]
  user_id_created integer [ref: > users.user_id]
  invite_user_ip varchar(128) [null]
  invite_user_story varchar(256) [null]
  invite_used boolean [default: false]
  invite_blocked boolean [default: false]
  invite_date_created timestamp [default: `CURRENT_TIMESTAMP`]
  invite_date_used timestamp [null]
}

Table dir_comedations [headercolor: #EBC743] {
  comedation_id integer [pk, unique, increment]
  comedation_code varchar(64) [not null]
  comedation_title varchar(128) [not null]
  comedation_description  varchar(256) [not null]
  comedation_type comedation_type_list [not null, default: `common`]
  comedation_pp integer [not null]
  steam_game_code varchar(64) [null]
}

enum comedation_type_list {
  common
  rare
}
```

Структуру БД смотри в файле ReinekeDb.sql.

### Ресурсы в домене reineke.sunfox.ee
На сайте reineke.sunfox.ee размещаются ресурсы, используемые для корректной работы бота.
Файловая структура для ссылок на изображения:

```
project
│
├───img
│   │
│   ├───comedations
│   │   │   101_image.png
│   │   │   101_profile.png
│   │   │   102_image.png
│   │   │   102_profile.png
│   │   │   ...
│   │
│   ├───glitterbeard
│   │   │   sloop_farm_souls.png
│   │   │   brig_pvp_servants.png
│   │   │   1100.png
│   │   │   ...
│   │
│   ├───dice
│   │   │   d4-1.png
│   │   │   d6-1.png
│   │   │   d8-1.png
│   │   │   d10-1.png
│   │   │   d12-1.png
│   │   │   d20-1.png
│   │   │   ...
│   │
│   ├───alerts
│   │   │   alert_announcement.png
│   │   │   alert_coins.png
│   │   │   alert_note.png
│   │   │   alert_playtogether.png
│   │   │   alert_raid.png
│   │   │   alert_scroll.png
│   │   │   ...
│   │
│   ├───card
│   │   │   2C.png
│   │   │   3D.png
│   │   │   4H.png
│   │   │   5S.png
│   │   │   ...
│   │
│   ├───gifts
│   │   │   20241.png
│   │   │   ...
│   │
│   └───powerpoints
│       │   1.png
│       │   ...
│       │   11.png
│       │   ...
│       └───60.png
│     
└───tmp
```
