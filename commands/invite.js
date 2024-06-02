const { SlashCommandBuilder } = require('discord.js');
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
    data: new SlashCommandBuilder()
        .setName('invite')
        .setDescription('Создать приглашение на сервер')
        .setDescriptionLocalizations({
            "en-US": 'Invite a friend to the server'
        })
        .addStringOption(option =>
            option.setName('landing')
                .setDescription('Страница с правилами сервера')
                .setRequired(false)
                .addChoices(
                    { name: 'Glitterbeard Sailors', value: 'glitterbeard' },
                    { name: 'Virumaa Viikingid', value: 'viruviking' }
                )),

    async execute(interaction) {

        const BotLogChannel = interaction.client.channels.cache.get(config.log_channels.log);
        const landing = interaction.options.getString('landing');

        let invite = await interaction.channel.createInvite(
        {
            maxAge: 7200, // 2h
            maxUses: 1 // maximum times it can be used
        }
        ).catch(console.log);

        switch (landing) {
            case 'glitterbeard':
                var landingUrl = config.url.landingUrl + 'gs' + '/';
                break;
            case 'viruviking':
                var landingUrl = config.url.landingUrl + 'vv' + '/';
                break;
            default:
                var landingUrl = config.url.landingUrl;
                break;
        }
        var inviteUrl = landingUrl + 'i/' + invite.code;
        interaction.reply({content: '— Вот ссылка-приглашение на сервер: '+inviteUrl, ephemeral: true });
        BotLogChannel.send({content: `[INVITE] CREATE: An a new **/invite** has been created by: <@${interaction.user.id}>. Landing: ${landing}, code: ${invite.code}`} );
    },
};
