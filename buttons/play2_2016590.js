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
        name: 'play2_2016590'
    },
    async execute(interaction) {
        // SOT-specific role check
        const hasRole = interaction.member.roles.cache.has(config.roles.community.glitterbeard);
        if (hasRole == true) {
            const NotificationsChannel = interaction.client.channels.cache.get(config.log_channels.play2);
            const BotLogChannel = interaction.client.channels.cache.get(config.log_channels.log);

            await interaction.guild.members.fetch(interaction.member.user.id).then( DiscordUser => {
                const time_to_go = moment().unix();
                const steam_app_id = '2016590';
                const user_avatar = (DiscordUser.user.avatar == null) ? config.ui.userpic : "https://cdn.discordapp.com/avatars/" + DiscordUser.user.id + "/" + DiscordUser.user.avatar + ".jpeg" ;

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

                    const firstKey = Object.keys(lists.steam.channels.longlist)[0];
                    const channelData = lists.steam.channels.longlist[firstKey];

                    var ChannelLinkBtn = new ButtonBuilder()
                        .setLabel(channelData.name)
                        .setURL(channelData.url)
                        .setEmoji("<:ico_steam:1246544322321715253>")
                        .setStyle(ButtonStyle.Link);

                    var ButtonsRow1 = new ActionRowBuilder().addComponents(ChannelLinkBtn);

                    NotificationsChannel.send({ embeds: [invite_embed], components: [ButtonsRow1] }).then(repliedMessage => {
                        setTimeout(() => repliedMessage.delete(), 600000);
                    });
                    interaction.reply({ content: '— Приглашение успешно создано!', ephemeral: true });

                    BotLogChannel.send({ content: `[PLAY2] BUTTON: <@` + DiscordUser.user.id + `> creates a **/play2gether** invite - ` + SteamApp.name });
                });
            });
        }
    }
};
