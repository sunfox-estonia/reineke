const { Events } = require('discord.js');
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
    name: Events.GuildMemberAdd,
    async execute(member) {
        const UserNotifyChannel = member.client.channels.cache.get(config.log_channels.notifictions);
        const BotLogChannel = member.client.channels.cache.get(config.log_channels.log);

        /*
        * Step 1. Get user invite code
        */
        member.guild.invites.fetch().then(newInvites => {
            // This is the *existing* invites for the guild.
            const oldInvites = invites.get(member.guild.id);
            // Look through the invites, find the one for which the uses went up.
            const invite = newInvites.find(i => i.uses > oldInvites.get(i.code));
            // A real basic message with the information we need. 
            BotLogChannel.send({ content: `${member.user} joined using invite code ${invite.code}.` })
        });

        /*
        * Step 2. Get invite_id and add user_discord_uid to database.
        */
        getInviteId(invite.code, function (error, invite_id) {
            if (error) {
                BotLogChannel.send({ content: `Invitation code ${invite.code} cannot be found in a database. User ${member.user} has been joined without going through Reineke.guildMemberAdd flow.` });
            } else {
                updateInvitedUser(invite_id, member.user.id, function (error) {
                    if (error) {
                        BotLogChannel.send({ content: `Can't update ${member.user} record in a database. User has been joined without going through Reineke.guildMemberAdd flow.` });
                    } else {
                        /*
                        * Step 3. Add a role to user
                        */
                        member.roles.add(config.roles.newbie);

                        /* 
                        * Step 4. Get user data and show self-introduction text
                        */
                        getInvitedUserData(invite.code, function (error, user_data) {
                            if (error) {
                                BotLogChannel.send({ content: `Can't get user ${member.user} data. User has been joined without going through Reineke.guildMemberAdd flow.` });
                            } else {

                                var embed_aboutme = {
                                    title: `Привет! Меня зовут ${user_data.user_name}`,
                                    description: user_data.invite_user_story,
                                    color: config.colors.primaryBright,
                                    thumbnail: {
                                        url: "https://cdn.discordapp.com/avatars/" + member.user.id + "/" + member.user.avatar + ".png"
                                    },
                                    timestamp: new Date().toISOString(),
                                    footer: {
                                        icon_url: `${config.url.resourcesUrl}/reineke/ico/reineke_logo.png`,
                                        text: "Reineke"
                                    }
                                }

                                BotLogChannel.send({ content: `К нам пришел ${member.user}, попривествуйте новичка! Кстати, он немного рассказал о себе:`, embeds: [embed_aboutme] });
                            }
                        });
                    }
                });
            }
        });
    },
};

getInviteId = function (invite_code, callback) {
    // Prepare MySQL request to retrieve user data	
    let sql_join_1 = "SELECT invite_id FROM invites WHERE invite_code = ? LIMIT 1;";
    database.query(sql_join_1, [invite_code], (error_join_1, result_invite, fields) => {
        if (error_join_1) {
            callback("Ошибка в работе базы данных.", null);
            return;
        } else if (result_invite.length == 0 || result_invite.length > 1) {
            callback("Ошибка получения идентификатора приглашения.", null);
            return;
        } else {
            callback(null, result_invite[0]);
        }
    });
}

updateInvitedUser = function (user_invite_id, user_discord_uid, callback) {
    let sql_join_2 = "UPDATE users SET user_discord_uid = ? WHERE user_invite_id = ?;";
    database.query(sql_join_2, [user_discord_uid, user_invite_id], (error_join_2, pingback) => {
        if (error_join_2) {
            callback("Ошибка регистрации приглашения пользователя.");
            return;
        }
        callback(null);
    });
}

/*
* Get user data from tables invites & users
*/
getInvitedUserData = function (user_invite_code, callback) {
    let sql_join_3 = "SELECT invites.invite_user_story, users.user_name, users.user_discord_uid FROM invites LEFT JOIN users ON invites.invite_id = users.user_invite_id WHERE invites.invite_code=?;";
    database.query(sql_join_3, [user_invite_code], (error_join_3, result_user, fields) => {
        if (error_join_3) {
            callback("Ошибка получения масссива данных пользователя (DB error).", null);
            return;
        } else if (result_user.length == 0 || result_user.length > 1) {
            callback("Ошибка получения масссива данных пользователя (<>1).", null);
            return;
        } else {
            callback(null, result_user[0]);
        }
    });
}