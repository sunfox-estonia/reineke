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
        name: 'service_vpn_add'
    },
    async execute(interaction) {
        const discord_user_uid = interaction.fields.getTextInputValue('service_uid');
        const service_code = interaction.fields.getTextInputValue('service_id');
        const service_password = interaction.fields.getTextInputValue('service_password');

        const NotificationsChannel = interaction.client.channels.cache.get(config.log_channels.notifictions);
        const BotLogChannel = interaction.client.channels.cache.get(config.log_channels.log);

        var ProfileUri = config.url.commonUrl + "profile/";

        var ProfileLinkBtn = new ButtonBuilder()
        .setLabel('Посмотреть профиль')
        .setURL(ProfileUri)
        .setStyle(ButtonStyle.Link);

        var ButtonsRow1 = new ActionRowBuilder()
        .addComponents(ProfileLinkBtn);

        switch (service_code) {
            // Service: VPN US
            case '101':
                var sql1 = `UPDATE users SET services_vpn_us = ? WHERE user_discord_uid = ?;`;
                database.query(sql1, [service_password, discord_user_uid], (error1, pingback) => {
                    if (error1){
                        BotLogChannel.send({ content: `[ADMIN] SERVICE: Can't add a service US.vpn.snfx.ee (ID: 101) to user <@` + discord_user_uid + `>\nCreated by <@` + interaction.user.id + `>` });
                    } else {
                        NotificationsChannel.send({content:`— <@` + discord_user_uid + `>, добавил для Тебя новый сервис! Подробная информация — на странице Твоего профиля.`, components: [ButtonsRow1]});
                        BotLogChannel.send({ content: `[ADMIN] SERVICE: Added to user <@` + discord_user_uid + `> - US.vpn.snfx.ee (ID: 101)\nCreated by <@` + interaction.user.id + `>` });
                    }
                });
                break;
            // Service: VPN EE
            case '102':
                var sql2 = `UPDATE users SET services_vpn_ee = ? WHERE user_discord_uid = ?;`;
                database.query(sql2, [service_password, discord_user_uid], (error2, pingback) => {
                    if (error2){
                        BotLogChannel.send({ content: `[ADMIN] SERVICE: Can't add a service EE.vpn.snfx.ee (ID: 102) to user <@` + discord_user_uid + `>\nCreated by <@` + interaction.user.id + `>` });
                    } else {
                        NotificationsChannel.send({content:`— <@` + discord_user_uid + `>, добавил для Тебя новый сервис! Подробная информация — на странице Твоего профиля.`, components: [ButtonsRow1]});
                        BotLogChannel.send({ content: `[ADMIN] SERVICE: Added to user <@` + discord_user_uid + `> - EE.vpn.snfx.ee (ID: 102)\nCreated by <@` + interaction.user.id + `>` });
                    }
                });

                break;

            default:
                break;
        }
        interaction.guild.members.cache.get(discord_user_uid).roles.add(config.roles.services.vpn);
        interaction.reply({ content: '— Добавил услугу указанному пользователю!', ephemeral: true });
    }
};
