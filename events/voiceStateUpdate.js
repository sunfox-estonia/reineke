const { Events } = require('discord.js');
const config = require('../config.json');

/* Voice state update event
 * This event is triggered when a user joins or leaves voice channel.
 */

module.exports = {
    name: Events.VoiceStateUpdate,
    async execute(oldStatus, newStatus) {
        if (oldStatus.channelId  === null && newStatus.channelId !== null) {
            var BotLogChannel = newStatus.guild.channels.cache.get(config.log_channels.log);
            BotLogChannel.send({content: `[VC]: User <@${newStatus.id}> joined to channel <#${newStatus.channelId}>`});
        } else if (newStatus.channelId === null) {
            var BotLogChannel = oldStatus.guild.channels.cache.get(config.log_channels.log);
            BotLogChannel.send({content: `[VC]: User <@${oldStatus.id}> left channel <#${oldStatus.channelId}>`});
        }
    }
}
