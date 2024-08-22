const { ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const config = require('../config.json');
const fs = require('node:fs');
const lists = require('../config.lists.json');
const hints  = require('../config.hints.json');
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
        name: 'user_connections_edit'
    },
    async execute(interaction) {
        const discord_uid = interaction.fields.getTextInputValue('bifrost_uid');
        const steam_uid = interaction.fields.getTextInputValue('bifrost_steam');
        const xbox_username = interaction.fields.getTextInputValue('bifrost_xbox');

        const NotificationsChannel = interaction.client.channels.cache.get(config.log_channels.notifictions);
        const BotLogChannel = interaction.client.channels.cache.get(config.log_channels.log);

        var sql1 = `UPDATE users SET user_steam_uid = ?, user_xbox_uid = ? WHERE user_discord_uid = ?;`;
        database.query(sql1, [steam_uid, xbox_username, discord_uid], (error1, pingback) => {
            if (error1){
                BotLogChannel.send({ content: `[ADMIN] BIFRÖST: Can't update integrations for user <@` + discord_uid + `>` });
            } else {
                BotLogChannel.send({ content: `[ADMIN] BIFRÖST: Integrations are updated for <@` + discord_uid + `>\nCreated by <@` + interaction.user.id + `>` });
            }
            interaction.reply({ content: '— Выбранная команда выполена. Смотри лог!', ephemeral: true });
        });
    }
};
