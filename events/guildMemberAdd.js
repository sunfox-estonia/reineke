const { Events } = require('discord.js');
const config = require('../config.json');

module.exports = {
    name: Events.GuildMemberAdd,
    async execute(member) {
        const UserNotifyChannel = member.client.channels.cache.get(config.log_channels.notifictions);
        const BotLogChannel = member.client.channels.cache.get(config.log_channels.log);

        // TODO: Add user to database, change used invite status

        // Get user invite id
        member.guild.invites.fetch().then(newInvites => {
            // This is the *existing* invites for the guild.
            const oldInvites = invites.get(member.guild.id);
            // Look through the invites, find the one for which the uses went up.
            const invite = newInvites.find(i => i.uses > oldInvites.get(i.code));
            // A real basic message with the information we need. 
            BotLogChannel.send({content: `${member.user.tag} joined using invite code ${invite.code}.`})
        });

        // Get user record in DB


        UserNotifyChannel.send({content: `Привет, ${member.user}! Рады тебя видеть на нашем сервере :) Если ты используешь ник вместо настоящего имени, пожалуйста смени его на свое имя. Спасибо!`});




        // TODO: Add a role to the user

        // TODO: Send message to the log and Notificatnios channel (with the user selft-intro message)
    },
};