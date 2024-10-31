const { SlashCommandBuilder } = require('discord.js');
const config = require('../config.json');

module.exports = {
    data: {
        name: 'take_сard'
    },
    async execute(interaction) {
        var crd = ['2','3','3','5','6','7','8','9','10','A','J','K','Q'];
        var clr = ['C','D','H','S'];
        var rndCrd = crd[Math.floor(Math.random()*crd.length)];
        var rndClr = clr[Math.floor(Math.random()*clr.length)];
		var img = rndCrd + rndClr + '.png';

        interaction.reply({content: `<@` + interaction.user.id + `> вытаскивает случайную карту...`, files: [config.url.resourcesUrl + "img/card/"+ img] }).then(repliedMessage => {
            setTimeout(() => repliedMessage.delete(), 30000);
        });

    }
};
