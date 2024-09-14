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

module.exports = {
    data: {
        name: 'help2me_fleet'
    },
    async execute(interaction) {
        const BotLogChannel = interaction.client.channels.cache.get(config.log_channels.log);
        BotLogChannel.send({ content: `[HELP2ME] BUTTON FLEETCREATOR: <@` + interaction.member.user.id + `> asked for help with FleetCreator account activation.\n> <@&` + config.roles.level.admin + `>, проверить электронную почту Sunfox.ee для активации аккаунта, и сообщить пользователю об активации.` });
        interaction.reply({ content: '— Я передам просьбу Хранителям и они свяжутся с Тобой как только аккаунт будет активирован!', ephemeral: true });
    }
};
