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

module.exports = {
    data: {
        name: 'play2_sot2'
    },
    async execute(interaction) {
        // SOT-specific role check
        const hasRole = interaction.member.roles.cache.has(config.roles.community.glitterbeard);
        if (hasRole == true) {
            const NotificationsChannel = interaction.client.channels.cache.get(config.log_channels.play2);
            const BotLogChannel = interaction.client.channels.cache.get(config.log_channels.log);
            const voice_channel = interaction.client.channels.cache.get(config.voice_channels.play2);

            var text_ship_type = "Шлюп";
            var img_ship_type = "slup_";
            var text_mission_description = "PvP - Открытый мир";
            var img_ship_mission = img_ship_type + "pvp_world";

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

                NotificationsChannel.send({ content: `<@&` + config.roles.community.glitterbeard + `>, присоединяйтесь к путешествию:`, embeds: [invite_embed] }).then(repliedMessage => {
                    setTimeout(() => repliedMessage.delete(), 600000);
                });
                interaction.reply({ content: '— Приглашение успешно создано!', ephemeral: true });

                BotLogChannel.send({ content: `[PLAY2] SOT: <@` + DiscordUser.user.id + `> has been created a **/play2gether** invite`});

            });
        }
    }
};
