const { SlashCommandBuilder, ChannelType, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const config = require('../config.json');
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

module.exports = {
    data: {
        name: 'play2_sot1'
    },
    async execute(interaction) {
        // SOT-specific role check
        const hasRole = interaction.member.roles.cache.has(config.roles.community.glitterbeard);
        if (hasRole == true) {
            const NotificationsChannel = interaction.client.channels.cache.get(config.log_channels.play2);
            const BotLogChannel = interaction.client.channels.cache.get(config.log_channels.log);
            const voice_channel = interaction.client.channels.cache.get(config.voice_channels.play2);

            var text_ship_type = "Бригантина";
            var img_ship_type = "brig_";
            var text_mission_description = "PvP - Слуги Пламени";
            var img_ship_mission = img_ship_type + "pvp_servants";

            await interaction.guild.members.fetch(interaction.member.user.id).then( DiscordUser => {
                var time_to_go = moment().unix();
                const user_avatar = (DiscordUser.user.avatar == null) ? config.ui.userpic : "https://cdn.discordapp.com/avatars/" + DiscordUser.user.id + "/" + DiscordUser.user.avatar + ".jpeg" ;

                var invite_embed = new EmbedBuilder()
                .setColor(config.colors.primaryBright)
                .setAuthor({ name: DiscordUser.displayName + " собирает команду.", iconURL: user_avatar })
                .setDescription("Начало сессии - <t:" + time_to_go + ":R>")
                .setThumbnail(config.url.resourcesUrl + "img/glitterbeard/" + img_ship_mission + ".png")
                .addFields(
                    { name: "Корабль:", value: text_ship_type },
                    { name: "Миссия:", value: text_mission_description },
                    { name: "\u200b", value: "**Добавляйся в голосовой канал:**" },
                    { name: "<#" + voice_channel + ">", value: "\u200b" }
                )
                .setTimestamp()
                .setFooter({
                    iconURL: config.ui.icon_url,
                    text: config.ui.title
                });

                /*
                * Get Steam profile to show achievements in PVP
                */
                getSteam(interaction.member.user.id, function (error, dataset1) {
                    if (error) {
                        // If there is no Steam profile available
                        NotificationsChannel.send({ content: `<@&` + config.roles.community.glitterbeard + `>, присоединяйтесь к путешествию:`, embeds: [invite_embed] }).then(repliedMessage => {
                            setTimeout(() => repliedMessage.delete(), 600000);
                        });
                        interaction.reply({ content: '— Приглашение успешно создано!', ephemeral: true });

                        BotLogChannel.send({ content: `[PLAY2] BUTTON SOT: <@` + DiscordUser.user.id + `> creates a **/play2gether** invite`});

                    } else {
                        var steam_data_prep = JSON.parse(JSON.stringify(dataset1));
                        var steam_data = steam_data_prep[0];

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
                                    var getOne = getAchievementStatusByCode(UserAchievements.achievements, CommendationsList[i]);
                                    let getOneStatus = getOne[0]['achieved'];
                                    if (getOneStatus == true) {
                                        Badges += "1";
                                    } else {
                                        Badges += "0";
                                    }
                                    i++;
                                }

                                var BadgesImage = "pvp_profile_" + Badges + ".png";

                                invite_embed.setImage(config.url.resourcesUrl + 'img/glitterbeard/' + BadgesImage);
                                invite_embed.addFields(
                                    { name: '\u200b', value: '**Достижения ' + DiscordUser.displayName + ' в режиме PvP:**' }
                                )
                            }

                            NotificationsChannel.send({ content: `<@&` + config.roles.community.glitterbeard + `>, присоединяйтесь к путешествию:`, embeds: [invite_embed] }).then(repliedMessage => {
                                setTimeout(() => repliedMessage.delete(), 600000);
                            });
                            interaction.reply({ content: '— Приглашение успешно создано!', ephemeral: true });
                            BotLogChannel.send({ content: `[PLAY2] BUTTON SOT: <@` + DiscordUser.user.id + `> creates a **/play2gether** invite.`});

                        })
                        .catch(error => {
                            NotificationsChannel.send({ content: `<@&` + config.roles.community.glitterbeard + `>, присоединяйтесь к путешествию:`, embeds: [invite_embed] }).then(repliedMessage => {
                                setTimeout(() => repliedMessage.delete(), 600000);
                            });
                            interaction.reply({ content: '— Приглашение создано!', ephemeral: true });

                            BotLogChannel.send({ content: `[PLAY2] BUTTON SOT: <@` + DiscordUser.user.id + `> created a **/play2gether** invite, but Steam achievements has not been fetched.`});
                        });
                    }
                });
                // Get Steam profile END
            });
        }
    }
};
