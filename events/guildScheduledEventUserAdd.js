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

/*
 * The following script assigns the
 * event-specified role to the user
 * attended to participate in the event.
 */

module.exports = {
    name: Events.guildScheduledEventUserAdd,
    async execute(meeting, user) {
        const BotLogChannel = interaction.client.channels.cache.get(config.log_channels.log);
        var discord_event_id = meeting.id;
        var discord_uid = user.id;

        // Step 1. Get the event role ID from the Database
        let sql1 = "SELECT discord_role_id FROM events_roles WHERE discord_event_id = ?";
        database.query(sql1, [discord_event_id], (error1, role_data) => {
            if (error1) {
                console.log(error1);
            } else {
                var role_id = role_data[0];
                // Step 2. Assign the role to the user
                meeting.guild.members.cache.get(discord_uid).roles.add(role_id);
                BotLogChannel.send({ content: `AUTOMATION: Role "Событие: ${meeting.name}" assigned to ${user.tag}.` });
            }
        });

    }
}