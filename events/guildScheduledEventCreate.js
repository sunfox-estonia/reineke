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
 * This scipt creates an Event-related role
 * for each new event created on the server.
 * It adds role ID with the event ID to the Database.
 */

module.exports = {
    name: Events.GuildScheduledEventCreate,
    async execute(event) {
        const NotificationsChannel = event.guild.channels.cache.get(config.log_channels.notifictions);
        const BotLogChannel = event.guild.channels.cache.get(config.log_channels.log);
        var discord_event_id = event.id;
        var discord_event_name = event.name;
        var discord_event_url = event.url;
        var event_role_name = `Участники события: ${discord_event_name}`;

        await event.guild.roles.create({
            name: event_role_name,
            reason: 'Temporary Event-related role. Should be deleted after the event.'
        }).then( NewRole => {
            // Step 2. Add the role ID to the Database
            let sql1 = "INSERT INTO events_roles (discord_event_id, discord_role_id) VALUES (?, ?)";
            database.query(sql1, [discord_event_id, NewRole.id], (error1, pingback) => {
                if (error1) {
                    console.log(error1);
                } else {
                    BotLogChannel.send({ content: `[AUTOMATION] Role **${event_role_name}** created for event **${discord_event_name}**` });
                    NotificationsChannel.send({ content: `${discord_event_url}` });
                }
            })
        }).catch(err => console.log(err));
    }
}
