const { Events, ButtonBuilder, ActionRowBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');
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
    name: Events.GuildMemberRemove,
    async execute(member) {
        const BotLogChannel = member.client.channels.cache.get(config.log_channels.log);

        BotLogChannel.send({ content: `[INVITE] LEFT: User <@${member.user.id}> left the server.` });
    }
}
