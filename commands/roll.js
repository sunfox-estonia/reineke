const { SlashCommandBuilder } = require('discord.js');
const Roll20 = require('d20');
const lists = require('../config.lists.json');
const config = require('../config.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('roll')
		.setDescription('Кинуть выбранный дайс.')
		.addStringOption(option =>
			option.setName('dice_type')
				.setDescription('Тип дайса (d4, d6, d8б d10, d12, d20)')
				.setRequired(false)
				.addChoices(
					{ name: 'd4', value: 'd4' },
					{ name: 'd6', value: 'd6' },
					{ name: 'd8', value: 'd8' },
					{ name: 'd10', value: 'd10' },
					{ name: 'd12', value: 'd12'},
					{ name: 'd20', value: 'd20'}
				))
		.addBooleanOption(option =>
			option.setName('private')
				.setRequired(false)
				.setDescription('Скрыть результат')),

	async execute(interaction) {
		const data_dice = interaction.options.getString('dice_type') ?? 'd6';
		const data_hide = interaction.options.getBoolean('private') ?? false;
		let p = data_dice.match(/(\d{0,1})[d](\d{1,2})/g);
		result = Roll20.verboseRoll(p[0]);
		var img =  data_dice + '-' + result + '.png';

        let randomAction = getRandomAction();

		interaction.reply({content: `<@` + interaction.user.id + `> ` + randomAction + ` ` +  data_dice + `...`, files: [config.url.resourcesUrl + "img/dice/"+ img], ephemeral: data_hide  });
	},
};

function getRandomAction() {
    const actions = lists.dice_action;
    const randomIndex = Math.floor(Math.random() * actions.length);
    return actions[randomIndex];
}

