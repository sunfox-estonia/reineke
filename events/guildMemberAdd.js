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
        const BotLogChannel = member.client.channels.cache.get(config.log_channels.log);

        /* Step 1.
        *  Select member data out from the
        *  users table.
        */

        getUserProfile(member.user.id, function (error, dataset1) {
            if (error) {
                BotLogChannel.send({ content: `[INVITE] JOIN ERROR: Can't get user ${member.user} data. Database error.` });
                return;
            } else if (dataset1.length != 1) {
                // User is not registered in the database
                BotLogChannel.send({ content: `[INVITE] JOIN ERROR: Can't get user ${member.user} data. User not found or there are dublicated records in DB` });
                return;
            } else {
                var user_data_prep = JSON.parse(JSON.stringify(dataset1));
                var user_data = user_data_prep[0];
                /* Step 3
                *  Assign config.roles.community role to user
                *  regarding the user_data.user_landing value
                *  Add default role.
                */

                /*
                for (var key in config.roles.community) {
                    if (key === user_data.user_landing) {
                        var communityRole = config.roles.community[key];
                        if(user_data.user_landing != "common"){
                            member.roles.add([config.roles.level.newbie, communityRole]);
                        } else {
                            member.roles.add(config.roles.level.newbie);
                        }
                    }
                }
                */
                member.roles.add(config.roles.level.newbie);


                /* Step 4
                *  Set user nickname to user_data.user_name
                */
                if (user_data.user_name) {
                    member.setNickname(user_data.user_name);
                }

                BotLogChannel.send({ content: `[INVITE] JOIN: User <@${member.user.id}> has been joined to the server. Default roles has been assigned.` });
                return;
            }
        });
    },
};

getNewbieProfile = function (UserDiscordUid, callback) {
    let sql1 = `SELECT * FROM users WHERE user_discord_uid = ? LIMIT 1;`;
    database.query(sql1, [UserDiscordUid], function (error, result) {
        if (error) {
            callback("Database error.",null);
            BotLogChannel.send({ content: `[SYSTEM] DB ERROR: guildMemberAdd/getUserProfile function error.`});
        } else {
            callback(null, result);
        }
    });
    // getNewbieProfile ends here
    }

function getValues(obj, key) {
    for (var i in obj) {
        if (!obj.hasOwnProperty(i)) continue;
        if (typeof obj[i] == 'object') {
            return getValues(obj[i], key);
        } else if (i == key) {
            return 'false';
        }
    }
}
