const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('invite')
        .setDescription('Создать приглашение на сервер')
        .addStringOption(option =>
            option.setName('landing')
                .setDescription('Страница с правилами сервера')
                .setRequired(false)
                .addChoices(
                    { name: 'Glitterbeard Sailors', value: 'glitterbeard' }
                )),

    async execute(interaction) {
        var landing = interaction.options.getString('landing');
        var baseUrl = 'https://welcome.sunfox.ee/';

        let invite = await interaction.channel.createInvite(
            {
                maxAge: 1800000, // 30 minutes
                maxUses: 1 // maximum times it can be used
            }
        ).catch(console.log);
        switch (landing) {
            case 'glitterbeard':
                var landingUrl = baseUrl + 'glitterbeards' + '/';
                break;

            default:
                var landingUrl = baseUrl;
                break;
        }
        // Add invite to database;
        var inviteUrl = landingUrl + 'invite/' + invite.code;
        interaction.reply({ content: '— Вот ссылка-приглашение на сервер: ' + inviteUrl, ephemeral: true });
    },
};

createInvite = function (invite_code, user_id_created, callback) {
    // Prepare MySQL request to add new user data	
    let sql_invite_1 = "INSERT INTO invites (invite_code, user_id_created) VALUES (?, ?);";
    // TODO: Remove community title when database migrates to SQLite  
    database.query(sql_invite_1, [invite_code, user_id_created], (error_invite_4, pingback) => {
        if (error_invite_4) {
            callback("Ошибка добавления ссылки-приглашения в БД.");
            return;
        } else {
            callback(null);
        }
    });
    // createInvite closed
}

getInvitedUser = function (user_discord_uid, callback) {
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
    // getInvitedUser closed
}