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
        let sql1 = "SELECT * FROM users WHERE user_discord_uid = ? LIMIT 1;";
        database.query(sql1, [member.user.id], (error1, dataset1) => {
            if (error1) {
                BotLogChannel.send({ content: `[INVITE] JOIN ERROR: Can't get user ${member.user} data. Database error.` });
                return;
            } else if (result1.length != 0) {
                // User is not registered in the database
                BotLogChannel.send({ content: `[INVITE] JOIN ERROR: Can't get user ${member.user} data. User not found or there are dublicated records in DB` });
                return;
            } else {
                var user_data_prep = JSON.parse(JSON.stringify(dataset1));
                var user_data = user_data_prep[0];

                /* Step 2
                *  Assign default role to user
                */
                member.roles.add(config.roles.newbie);

                /* Step 3
                *  Assign config.roles.community role to user
                *  regarding the user_data.user_landing value
                */
                var communityRole = config.roles.community.find(communityRole => communityRole.key === user_data.user_landing);
                if (communityRole) {
                    member.roles.add(communityRole.id);
                }

                /* Step 4
                 * Change user Nicename on the server regarding
                 * the user_data.user_name value
                 * and communityRole value
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
