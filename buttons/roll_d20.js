const { SlashCommandBuilder } = require('discord.js');
const config = require('../config.json');
const lists = require('../config.lists.json');
const Roll20 = require('d20');

module.exports = {
    data: {
        name: 'roll_d20'
    },
    async execute(interaction) {
        result = Roll20.verboseRoll('d20');
        var img = 'd20-' + result + '.png';

        let randomAction = getRandomAction();

        interaction.reply({content: `<@` + interaction.user.id + `> ` + randomAction + ` d20...`, files: [config.url.resourcesUrl + "img/dice/"+ img] }).then(repliedMessage => {
            setTimeout(() => repliedMessage.delete(), 30000);
        });
    }
};

function getRandomAction() {
    const actions = lists.dice_action;
    const randomIndex = Math.floor(Math.random() * actions.length);
    return actions[randomIndex];
}

