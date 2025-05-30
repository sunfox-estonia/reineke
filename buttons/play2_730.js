const { SlashCommandBuilder, ChannelType, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
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

module.exports = {
    data: {
        name: 'play2_730'
    },
    async execute(interaction) {
        // SOT-specific role check
        const hasRole = interaction.member.roles.cache.has(config.roles.community.glitterbeard);
        if (hasRole == true) {
            const NotificationsChannel = interaction.client.channels.cache.get(config.log_channels.play2);
            const BotLogChannel = interaction.client.channels.cache.get(config.log_channels.log);

            await interaction.guild.members.fetch(interaction.member.user.id).then( DiscordUser => {
                const time_to_go = moment().unix();
                const steam_app_id = '730';
                const user_avatar = (DiscordUser.user.avatar == null) ? config.ui.userpic : "https://cdn.discordapp.com/avatars/" + DiscordUser.user.id + "/" + DiscordUser.user.avatar + ".jpeg" ;

                const firstKey = Object.keys(lists.steam.channels.longlist)[0];
                const channelData = lists.steam.channels.longlist[firstKey];

                var ChannelLinkBtn = new ButtonBuilder()
                    .setLabel(channelData.name)
                    .setURL(channelData.url)
                    .setEmoji("<:ico_steam:1246544322321715253>")
                    .setStyle(ButtonStyle.Link);

                getSteam(interaction.member.user.id, function (error, dataset1) {
                    if (error) {
                        // If there is no Steam profile available

                        steam.getGameDetails(steam_app_id).then(SteamApp => {
                            var invite_embed = new EmbedBuilder()
                                .setColor(config.colors.primaryBright)
                                .setAuthor({ name: DiscordUser.displayName + " приглашает поиграть\nв "+SteamApp.name+".", iconURL: user_avatar })
                                .setDescription("Начало сессии - <t:" + time_to_go + ":R>")
                                .setThumbnail(config.url.resourcesUrl + "img/alerts/alert_playtogether.png")
                                .setImage(SteamApp.header_image)
                                .addFields(
                                    { name: "Присоединяйся к игре!", value: "Чтобы играть вместе, Тебе необходимо установить **"+SteamApp.name+"** на свой компьютер, а также добавить **" + DiscordUser.displayName + "** в список друзей Steam." },
                                );

                            var ButtonsRow1 = new ActionRowBuilder()
                                .addComponents(ChannelLinkBtn);

                            NotificationsChannel.send({ embeds: [invite_embed], components: [ButtonsRow1] }).then(repliedMessage => {
                                setTimeout(() => repliedMessage.delete(), 600000);
                            });
                            interaction.reply({ content: '— Приглашение успешно создано!', ephemeral: true });

                            BotLogChannel.send({ content: `[PLAY2] <@` + DiscordUser.user.id + `> creates a **/play2gether** invite - ` + SteamApp.name });
                        });
                    } else {
                        var steam_data_prep = JSON.parse(JSON.stringify(dataset1));
                        var steam_data = steam_data_prep[0];

                        steam.getUserSummary(steam_data.user_steam_uid).then(SteamUser => {
                            // Get Steam application data
                            console.log(steam_data.user_steam_uid);
                            /*
                             * Create an invite to play
                             */

                            // In case if user has been runned something aready
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
                                    .setAuthor({ name: DiscordUser.displayName + " приглашает поиграть\nв "+SteamApp.name+".", iconURL: user_avatar })
                                    .setDescription("Начало сессии - <t:" + time_to_go + ":R>")
                                    .setThumbnail(config.url.resourcesUrl + "img/alerts/alert_playtogether.png")
                                    .setImage(SteamApp.header_image)
                                    .addFields(
                                        { name: "Присоединяйся к игре!", value: "Чтобы играть вместе, Тебе необходимо установить **"+SteamApp.name+"** на свой компьютер, а также добавить **" + DiscordUser.displayName + "** в список друзей Steam. Сделать это можно на странице по ссылке ниже." },
                                    );

                                var JoinLobbyBtn = new ButtonBuilder()
                                    .setLabel('Присоединиться к лобби')
                                    .setURL(BifrostUri)
                                    .setStyle(ButtonStyle.Link);

                                var ButtonsRow1 = new ActionRowBuilder()
                                    .addComponents(JoinLobbyBtn, ChannelLinkBtn);

                                NotificationsChannel.send({ embeds: [invite_embed], components: [ButtonsRow1] }).then(repliedMessage => {
                                    setTimeout(() => repliedMessage.delete(), 600000);
                                });
                                interaction.reply({ content: '— Приглашение успешно создано!', ephemeral: true });

                                BotLogChannel.send({ content: `[PLAY2] BUTTON: <@` + DiscordUser.user.id + `> creates a **/play2gether** invite - ` + SteamApp.name });
                            });

                        });
                    }
                });

            });
        }
    }
};
