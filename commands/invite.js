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
                    { name: 'Virumaa Viikingid', value: 'viruviking' },
                    { name: 'Minecraft RPG', value: 'minecraftrpg' },
                )),

    async execute(interaction) {

        const BotLogChannel = interaction.client.channels.cache.get(config.log_channels.log);
        const creator_discord_user = interaction.member.user;
        const landing = interaction.options.getString('landing');

        getInviteCreator(creator_discord_user.id, function (error, invite_creator_id) {
            if (error) {
                const locales = {
                    "en-US": 'The invitation link cannot be created by current user.'
                };
                interaction.reply({ content: locales[interaction.locale] ?? error, ephemeral: true });
                BotLogChannel.send({ content: `${creator_discord_user} is trying to create a new invite. Invite is not created.` });
            } else {

                /*
                * Here is an invite creation process
                * Step 1. Generate a new invite
                */
                let invite = interaction.channel.createInvite( // Do we need to add `await` keyword here?
                    {
                        maxAge: 7200, // set 2h
                        maxUses: 1 // maximum times invite can be used
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

                /*
                * Step 2. Add invite to database & generate a link
                * https://discord.com/developers/docs/resources/invite
                */
                addInvite(invite.code, invite_creator_id, function (error) {
                    if (error) {
                        const locales = {
                            "en-US": 'An error occurred while creating invitation link.'
                        };
                        interaction.reply({ content: locales[interaction.locale] ?? error, ephemeral: true });
                    } else {
                        var inviteUrl = landingUrl + 'i/' + invite.code;
                        interaction.reply({ content: '— Вот ссылка-приглашение на сервер: ' + inviteUrl, ephemeral: true });
                    }
                });
            }
        });
    },
};

addInvite = function (invite_code, invite_creator_id, callback) {
    // Prepare MySQL request to add new user data	
    let sql_invite_1 = "INSERT INTO invites (invite_code, user_id_created) VALUES (?, ?);";
    database.query(sql_invite_1, [invite_code, invite_creator_id], (error_invite_4, pingback) => {
        if (error_invite_4) {
            callback("Этот пользователь не может создать ссылку-приглашение.");
            return;
        } else {
            callback(null);
        }
    });
    // createInvite closed
}

getInviteCreator = function (user_discord_uid, callback) {
    // Prepare MySQL request to retrieve user data	
    let sql_invite_2 = "SELECT user_id FROM users WHERE user_discord_uid = ? LIMIT 1;";
    database.query(sql_invite_2, [user_discord_uid], (error_invite_2, result_userdata, fields) => {
        if (error_invite_2) {
            callback("Ошибка в работе базы данных.", null);
            return;
        } else if (result_userdata.length == 0 || result_userdata.length > 1) {
            callback("Ошибка получения идентификатора пользователя.", null);
            return;
        } else {
            callback(null, result_userdata[0]);
        }
    });
    // getInviteCreator closed
}