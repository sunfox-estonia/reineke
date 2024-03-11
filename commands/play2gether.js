const { SlashCommandBuilder } = require('discord.js');
const config = require('../config.json');
const lists = require('../config.lists.json');
const mysql = require('mysql');
const database = mysql.createConnection({
    host: config.db_config.host,
    user: config.db_config.dbuser,
    password: config.db_config.dbpass,
    database: config.db_config.dbname,
    debug: false,
    multipleStatements: true,
});
const moment = require('moment');
const SteamAPI = require('steamapi');
const steam = new SteamAPI(config.api.steam.token);

/*
 * /play2gether command uses Discord.js subcommand system.
 * Currently it can be used to run Sea of Thieves crew ship or another game,
 * the list of another possible games to play is located in a config.lists.json file
 * Current version can't find co-players withen the server members, this functionality
 * will be added in a future release, after Statistical bot release.
 * 
 */

module.exports = {
    data: new SlashCommandBuilder()
	.setName('play2gether')
	.setDescription('Пригласить в кооперативную игру')
    .setDescriptionLocalizations({
        "en-US": 'Invite a player to the cooperative game'
    })
	.addSubcommand(subcommand =>
		subcommand
			.setName('game')
			.setDescription('Выбрать из списка | Select from the list')
            .addStringOption(option =>
                option.setName('game')
                    .setDescription('Наименование игры')
                    .setDescriptionLocalizations({
                        "en-US": 'Game name',
                    })
                    .setRequired(false)
                    .addChoices(lists.games))
            .addChannelOption(option =>
                option.setName('channel')
                    .setDescription('Канал')
                    .setRequired(true)
                    .setDescriptionLocalizations({
                        "en-US": 'Voice channel'
                    })
                    .addChannelTypes(ChannelType.GuildVoice))
            .addStringOption(option =>
                option.setName('time')
                    .setDescription('Старт сессии через...')
                    .setDescriptionLocalizations({
                        "en-US": 'Session starts in...',
                    })
                    .setRequired(false)
                    .addChoices(
                        { name: 'Сразу | Now', value: '0' },
                        { name: '15 мин. | in 15 min.', value: '15' },
                        { name: '30 мин. | in 30 min.', value: '30' },
                        { name: 'Следующий час | Next hour', value: '60' }
                    )),
    )
	.addSubcommand(subcommand =>
		subcommand
			.setName('sot')
			.setDescription('Sea of Thieves')
            .addStringOption(option =>
                option.setName('ship')
                    .setDescription('Тип корабля')
                    .setDescriptionLocalizations({
                        "en-US": 'Ship type',
                    })
                    .setRequired(true)
                    .addChoices(
                        { name: 'Шлюп | Sloop', value: 'sloop' },
                        { name: 'Бригантина | Brigantine', value: 'brig' },
                        { name: 'Галеон | Galleon', value: 'galley' }
                    ))
            .addStringOption(option =>
                option.setName('task')
                    .setDescription('Миссия')
                    .setDescriptionLocalizations({
                        "en-US": 'Mission type',
                    })
                    .setRequired(true)
                    .addChoices(
                        { name: 'Сбор рейда | Gathering raid', value: 'raid' },
                        { name: 'Tall Tales', value: 'tales' },
                        { name: 'Tall Tales - Jack Sparrow', value: 'tales_sparrow' },
                        { name: 'Farm - Гильдия | Guild', value: 'farm_guild' },
                        { name: 'Farm - Златодержцы | Goldhoarders', value: 'farm_gh' },
                        { name: 'Farm - Орден душ | Order of Souls', value: 'farm_souls' },
                        { name: 'Farm - Торговый союз | Merchant Alliance', value: 'farm_merch' },
                        { name: 'Farm - Охотники', value: 'farm_hunt' },
                        { name: 'Farm - Athena', value: 'farm_athena' },
                        { name: 'Farm - Reapers', value: 'farm_reaper' },
                        { name: 'PVP - Open world', value: 'pvp_world' },
                        { name: 'PVP - Слуги Пламени | Servants of the Flame', value: 'pvp_servants' },
                        { name: 'PVP - Хранители Сокровищ | Guardians of Fortune', value: 'pvp_guardians' },
                    ))
            .addChannelOption(option =>
                option.setName('channel')
                    .setDescription('Канал')
                    .setRequired(true)
                    .setDescriptionLocalizations({
                        "en-US": 'Voice channel'
                    })
                    .addChannelTypes(ChannelType.GuildVoice))
            .addStringOption(option =>
                option.setName('time')
                    .setDescription('Старт сессии через...')
                    .setDescriptionLocalizations({
                        "en-US": 'Session starts in...',
                    })
                    .setRequired(false)
                    .addChoices(
                        { name: 'Сразу | Now', value: '0' },
                        { name: '15 мин. | in 15 min.', value: '15' },
                        { name: '30 мин. | in 30 min.', value: '30' },
                        { name: 'Следующий час | Next hour', value: '60' }
                    )),
    ),

async execute(interaction) {
        const NotificationsChannel = interaction.client.channels.cache.get(config.log_channels.notifictions);
        const BotLogChannel = interaction.client.channels.cache.get(config.log_channels.log);
        const party_channel = interaction.options.getChannel('channel');
        const party_time = interaction.options.getString('time');
        /*
         * SEA OF THIEVES play togeter invite
         */
		if (interaction.options.getSubcommand() === 'sot') {
            // SOT-specific role check
            const hasRole = interaction.member.roles.cache.has(config.roles.community.glitterbeard);
            if (hasRole == true) {
                const ship_type = interaction.options.getString('ship');
                const ship_task = interaction.options.getString('task');

                switch (ship_type) {
                    case "sloop":
                        var text_ship_type = "Шлюп";
                        var img_ship_type = "slup_";
                        break;
                    case "brig":
                        var text_ship_type = "Бригантина";
                        var img_ship_type = "brig_";
                        break;
                    case "galley":
                        var text_ship_type = "Галеон";
                        var img_ship_type = "galley_";
                        break;
                    default:
                        break;
                }

                switch (ship_task) {
					case "raid":
                        var text_mission_description = "Сбор рейда";
                        var img_ship_mission = "raid";
                        break;
                    case "tales":
                        var text_mission_description = "Tall Tales";
                        var img_ship_mission = img_ship_type + "tales";
                        break;
                    case "tales_sparrow":
                        var text_mission_description = "Tall Tales - Джек Воробей";
                        var img_ship_mission = img_ship_type + "tales_sparrow";
                        break;
                    case "farm_guild":
                        var text_mission_description = "Фарм - Гильдия";
                        var img_ship_mission = img_ship_type + "farm_guild";
                        break;
                    case "farm_gh":
                        var text_mission_description = "Фарм - Златодержцы";
                        var img_ship_mission = img_ship_type + "farm_gh";
                        break;
                    case "farm_souls":
                        var text_mission_description = "Фарм - Орден Душ";
                        var img_ship_mission = img_ship_type + "farm_souls";
                        break;
                    case "farm_merch":
                        var text_mission_description = "Фарм - Торговый Союз";
                        var img_ship_mission = img_ship_type + "farm_merch";
                        break;
                    case "farm_hunt":
                        var text_mission_description = "Фарм - Братство охотников";
                        var img_ship_mission = img_ship_type + "farm_hunt";
                        break;
                    case "farm_athena":
                        var text_mission_description = "Фарм - Сокровище Афины";
                        var img_ship_mission = img_ship_type + "farm_athena";
                        break;
                    case "farm_reaper":
                        var text_mission_description = "Фарм - Жнецы Костей";
                        var img_ship_mission = img_ship_type + "farm_reaper";
                        break;
                    case "pvp_world":
                        var text_mission_description = "PvP - Открытый мир";
                        var img_ship_mission = img_ship_type + "pvp_world";
                        break;
                    case "pvp_servants":
                        var text_mission_description = "PvP - Слуги Пламени";
                        var img_ship_mission = img_ship_type + "pvp_servants";
                        break;
                    case "pvp_guardians":
                        var text_mission_description = "PvP - Хранители Сокровищ";
                        var img_ship_mission = img_ship_type + "pvp_guardians";
                        break;
                    default:
                        break;
                }

                await interaction.guild.members.fetch(interaction.member.user.id).then( DiscordUser => {
                    var ship_user = DiscordUser.nickname ?? DiscordUser.user.username;
                    var time_to_go = fetchTimestamp(party_time);
					if (ship_task === 'raid') {
						
						var invite_embed = new EmbedBuilder()
							.setColor(config.colors.primaryBright)
							.setAuthor({ name: ship_user + " собирает рейд.", iconURL: "https://cdn.discordapp.com/avatars/" + DiscordUser.user.id + "/" + DiscordUser.user.avatar + ".jpeg" })
							.setDescription("Начало сессии - <t:" + time_to_go + ":R>")
							.setThumbnail(config.url.resourcesUrl + "img/gb/" + img_ship_mission + ".png")
							.addFields(
								{ name: "Присоединяйся к рейду!", value: "Для участия в рейде Тебе потребуется приложение **FleetCreator**, а также установленный и настроенный **VPN**. Участникам сообщества Sunfox.ee бесплатно предоставляется безопасный VPN-сервис: обратись к Хранителям для получения более подробной информации." },
								{ name: "Подготовка к рейду:", value: "[Установить и настроить FleetCreator](https://wiki.sunfox.ee/glitterbeard:fleetcreator)\n[Установить и настроить VPN](https://wiki.sunfox.ee/glitterbeard:vpn)" },
                                { name: "Корабль:", value: text_ship_type },
                                { name: "\u200b", value: "**Добавляйся в голосовой канал:**" },
                                { name: "<#" + party_channel + ">", value: "\u200b" }
							)
							.setTimestamp()
							.setFooter({ 
								icon_url: config.ui.icon_url,
								text: config.ui.title
							});
							
							NotificationsChannel.send({ content: `<@&` + config.roles.community.glitterbeard + `>, начинается сбор рейда:`, embeds: [invite_embed] }).then(repliedMessage => {
										setTimeout(() => repliedMessage.delete(), 600000);
									});
							interaction.reply({ content: '— Приглашение на сбор рейда создано!', ephemeral: true });
							BotLogChannel.send({ content: `[PLAY2] SOT RAID: <@` + DiscordUser.user.id + `> has been created a **/play2gether** invite` });
							
					}else{
						var invite_embed = new EmbedBuilder()
							.setColor(config.colors.primaryBright)
							.setAuthor({ name: ship_user + " собирает команду.", iconURL: "https://cdn.discordapp.com/avatars/" + DiscordUser.user.id + "/" + DiscordUser.user.avatar + ".jpeg" })
							.setDescription("Начало сессии - <t:" + time_to_go + ":R>")
							.setThumbnail(config.url.resourcesUrl + "img/gb/" + img_ship_mission + ".png")
							.addFields(
								{ name: "Корабль:", value: text_ship_type },
								{ name: "Миссия:", value: text_mission_description },
								{ name: "\u200b", value: "**Добавляйся в голосовой канал:**" },
								{ name: "<#" + party_channel + ">", value: "\u200b" }
							)
							.setTimestamp()
							.setFooter({ 
								icon_url: config.ui.icon_url,
								text: config.ui.title
							});
						/*
						* Get Steam profile to show achievements in PVP
						*/ 
						getSteam(interaction.member.user.id, function (error, steam_data) {
							if (error) {
								// If there is no Steam profile available		
								NotificationsChannel.send({ content: `<@&` + config.roles.community.glitterbeard + `>, присоединяйтесь к путешествию:`, embeds: [invite_embed] }).then(repliedMessage => {
									setTimeout(() => repliedMessage.delete(), 600000);
								});
								interaction.reply({ content: '— Приглашение успешно создано!', ephemeral: true });

								BotLogChannel.send({ content: `[PLAY2] SOT: <@` + DiscordUser.user.id + `> has been created a **/play2gether** invite`});

							} else {
								// If profile is available   
								// Here you can see full achievements list:
								// http://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v0002/?key=APIKEY&appid=1172620&l=english&format=json                         
								// Get specified achievements for Sea of Thieves
								steam.getUserAchievements(steam_data.user_steam_uid, "1172620").then(UserAchievements => {
									if (UserAchievements.steamID !== undefined) {
										CommendationsList = ['220', '219', '221', '222'];
										var Badges = "";

										let i = 0;
										while (i < CommendationsList.length) {
											var getOne = getAchievemntStatusByCode(UserAchievements.achievements, CommendationsList[i]);
											let getOneStatus = getOne[0]['achieved'];
											if (getOneStatus == true) {
												Badges += "1";
											} else {
												Badges += "0";
											}
											i++;
										}

										var BadgesImage = "pvp_profile_" + Badges + ".png";

										if (ship_task == "pvp_servants" || ship_task == "pvp_guardians") {
											invite_embed.setImage(config.url.resourcesUrl + 'img/gb/' + BadgesImage);
											invite_embed.addFields(
												{ name: '\u200b', value: '**Достижения ' + ship_user + ' в режиме PvP:**' }
											)
										}
									}

									NotificationsChannel.send({ content: `<@&` + config.roles.community.glitterbeard + `>, присоединяйтесь к путешествию:`, embeds: [invite_embed] }).then(repliedMessage => {
										setTimeout(() => repliedMessage.delete(), 600000);
									});
									interaction.reply({ content: '— Приглашение успешно создано!', ephemeral: true });
									BotLogChannel.send({ content: `[PLAY2] SOT: <@` + DiscordUser.user.id + `> has been created a **/play2gether** invite.`});

								})
								.catch(error => {
                                    NotificationsChannel.send({ content: `<@&1104521026584457216> и <@&1039215669943742475>, присоединяйтесь к путешествию:`, embeds: [invite_embed] }).then(repliedMessage => {
                                        setTimeout(() => repliedMessage.delete(), 600000);
                                    });
                                    interaction.reply({ content: '— Приглашение создано!', ephemeral: true });
    
                                    BotLogChannel.send({ content: `[PLAY2] SOT: <@` + DiscordUser.user.id + `> has been created a **/play2gether** invite, but Steam achievements has not been fetched.`});
								});
							}
						});
						// Get Steam profile END
					}
                });
            } else {
                const locales = {
                    "en-US": 'You do not have permission to execute this command!',
                };
                await interaction.reply(locales[interaction.locale] ?? 'У вас недостаточно прав для выполнения этой команды!');

                BotLogChannel.send({ content: `[PLAY2] ERROR: <@` + DiscordUser.user.id + `> can't create a **/play2gether sot** invite without permission.`});
            }
        } else {
        /*
         * ANOTHER GAME play together invite
         */
            await interaction.guild.members.fetch(interaction.member.user.id).then( DiscordUser => {
                const play2_user = DiscordUser.nickname ?? DiscordUser.user.username;
                const time_to_go = fetchTimestamp(party_time);
                const steam_app_id = interaction.options.getString('game');

                getSteam(interaction.member.user.id, function (error, steam_data) {
                    if (error) {
                        // If there is no Steam profile available		

                        steam.getGameDetails(steam_app_id).then(SteamApp => {      
                            var invite_embed = new EmbedBuilder()
                                .setColor(config.colors.primaryBright)
                                .setAuthor({ name: play2_user + " приглашает поиграть\nв "+SteamApp.name+".", iconURL: "https://cdn.discordapp.com/avatars/" + DiscordUser.user.id + "/" + DiscordUser.user.avatar + ".jpeg" })
                                .setDescription("Начало сессии - <t:" + time_to_go + ":R>")
                                .setThumbnail(config.url.resourcesUrl + "img/bot/alert_playtogether.png")
                                .setImage(SteamApp.header_image)
                                .addFields(
                                    { name: "Присоединяйся к игре!", value: "Чтобы играть вместе, Тебе необходимо установить **"+SteamApp.name+"** на свой компьютер, а также добавить **" + play2_user + "** в список друзей Steam." },
                                    { name: "\u200b", value: "**Добавляйся в голосовой канал:**" },
                                    { name: "<#" + party_channel + ">", value: "\u200b" }
                                )
                                .setTimestamp()
                                .setFooter({ 
                                    icon_url: config.ui.icon_url,
                                    text: config.ui.title
                                });

                            NotificationsChannel.send({ embeds: [invite_embed] }).then(repliedMessage => {
                                setTimeout(() => repliedMessage.delete(), 600000);
                            });
                            interaction.reply({ content: '— Приглашение успешно создано!', ephemeral: true });

                            BotLogChannel.send({ content: `[PLAY2] <@` + DiscordUser.user.id + `> creates a **/play2gether** invite - ` + SteamApp.name });
                        });
                    } else {
                        steam.getUserSummary(steam_data.user_steam_uid).then(SteamUser => {
                            // Get Steam application data
                            
                            /* 
                             * Create an invite to play
                             */

                            // In case if user has been runnded something aready
                            if(SteamUser.gameID === undefined){
                            } else if (SteamUser.gameID !== undefined){
                            }

                            /*
                             * Get game details from Steam
                             */
                            steam.getGameDetails(steam_app_id).then(SteamApp => {      
                                const BifrostUri = 'https://bifrost.snfx.ee/steam/'+SteamApp.steam_appid+'/'+SteamUser.steamID;
                                var invite_embed = new EmbedBuilder()
                                    .setColor(config.colors.primaryBright)
                                    .setAuthor({ name: play2_user + " приглашает поиграть\nв "+SteamApp.name+".", iconURL: "https://cdn.discordapp.com/avatars/" + DiscordUser.user.id + "/" + DiscordUser.user.avatar + ".jpeg" })
                                    .setDescription("Начало сессии - <t:" + time_to_go + ":R>")
                                    .setThumbnail(config.url.resourcesUrl + "img/bot/alert_playtogether.png")
                                    .setImage(SteamApp.header_image)
                                    .addFields(
                                        { name: "Присоединяйся к игре!", value: "Чтобы играть вместе, Тебе необходимо установить **"+SteamApp.name+"** на свой компьютер, а также добавить **" + play2_user + "** в список друзей Steam. Сделать это можно на странице по ссылке ниже." },
                                        { name: "\u200b", value: "**Добавляйся в голосовой канал:**" },
                                        { name: "<#" + party_channel + ">", value: "\u200b" }
                                    )
                                    .setTimestamp()
                                    .setFooter({ 
                                        icon_url: config.ui.icon_url,
                                        text: config.ui.title
                                    });

                                /*
                                * Get app connected achievements from DB
                                */

                                const component_buttons = new ButtonBuilder()
                                    .setLabel('Присоединиться к лобби')
                                    .setURL(BifrostUri)
                                    .setStyle(ButtonStyle.Link);
    
                                NotificationsChannel.send({ embeds: [invite_embed], components: [component_buttons] }).then(repliedMessage => {
                                    setTimeout(() => repliedMessage.delete(), 600000);
                                });
                                interaction.reply({ content: '— Приглашение успешно создано!', ephemeral: true });

                                BotLogChannel.send({ content: `[PLAY2] <@` + DiscordUser.user.id + `> creates a **/play2gether** invite - ` + SteamApp.name });
                            });

                        });
                    }
                });
            });
        }
	},
};      

getSteam = function (UserDiscordUid, callback) {
    let sql1 = "SELECT user_discord_uid, user_steam_uid FROM users WHERE user_discord_uid = ? LIMIT 1;";
    database.query(sql1, [UserDiscordUid], (error1, result_userdata, fields) => {
        if (error1) {
            callback("Database error.", null);
            return;
        }
        if (result_userdata.length == 0 || result_userdata.length > 1) {
            callback("Ошибка получения профиля пользователя.", null);
            return;
        }
        callback(null, result_userdata[0]);
    });
}

fetchTimestamp = function (interval) {
    switch (interval) {
        case '15':
            var unix_time = moment().add(15, 'minutes').format('X');
            break;
        case '30':
            var unix_time = moment().add(30, 'minutes').format('X');
            break;
        case '60':
            var unix_time = moment().endOf('hour').fromNow().format("X");
            break;
        default:
            var unix_time = moment().format("X");
            break;
    }
    return unix_time;
}

getGameAchievements = function (UserDiscordUid,GameId){
    let sql2 = "";
    database.query(sql2, [UserDiscordUid,GameId], (error2, result_achdata, fields) => {
        if (error2) {
            callback("Database error.", null);
            return;
        }
        // TODO: Game-connected achievements
    });
}

getAchievementStatusByCode = function (comedations, code){
    return comedations.filter(
        function (comedations) { return comedations.api == code }
    );
}
