const { Events } = require('discord.js');
const config = require('../config.json');

/*
 * The following script assigns the
 * event-specified role to the user
 * attended to participate in the event.
 */

module.exports = {
    name: Events.guildScheduledEventUserAdd,
    async execute(meeting, user) {

    }
}