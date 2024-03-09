const { SlashCommandBuilder } = require('discord.js');
const config = require('../config.json');
const lists = require('../config.lists.json');


module.exports = {
    data: new SlashCommandBuilder()
	.setName('help')
	.setDescription('Помощь по командам сервера')
    .setDescriptionLocalizations({
        "en-US": 'Get help with the server commands',
    })
	.addSubcommand(subcommand =>
		subcommand
			.setName('play2gether')
			.setDescription('Пригласить в кооперативную игру | Invite a player to the cooperative game')
    )
	.addSubcommand(subcommand =>
		subcommand
			.setName('profile')
			.setDescription('Просмотреть профиль участника | View member profile')
    )
	.addSubcommand(subcommand =>
		subcommand
			.setName('club')
			.setDescription('Уведомления для группы Viru Vikings | Viru Vikings club notifications')
    ),

    async execute(interaction) {
        if (interaction.options.getSubcommand() === 'play2gether') {

        } else if (interaction.options.getSubcommand() === 'profile') {

        } else if (interaction.options.getSubcommand() === 'club') {

        }
    }
};