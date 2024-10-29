const { SlashCommandBuilder } = require('discord.js');
const config = require('../config.json');
const Roll20 = require('d20');

module.exports = {
    data: {
        name: 'roll_d20'
    },
    async execute(interaction) {
        result = Roll20.verboseRoll('d20');
        var img = 'd20-' + result + '.png';

        interaction.reply({files: [config.url.resourcesUrl + "img/dice/"+ img] }).then(repliedMessage => {
            setTimeout(() => repliedMessage.delete(), 30000);
        });

    }
};
