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
    )
	.addSubcommand(subcommand =>
		subcommand
			.setName('invite')
			.setDescription('Создание приглашения на сервер | Create an invitation to the server')
    ),

    async execute(interaction) {
        if (interaction.options.getSubcommand() === 'play2gether') {
            var HelpPlay2gether = new EmbedBuilder()
                .setColor(config.colors.primaryDark)
                .setTitle( "— Будем играть вместе!" )
                .setDescription("Приглашай участников сообщества в кооперативные игры с помощью команды `/play2gether`. Доступно два режима использования команды: для экипажей Sea of Thieves, и для других игр.")
                .setImage(config.ui.resourcesUrl + "/help/play2gether.gif")
            .addFields(
                { name: "/play2gether sot", value: "Выбери цель путешествия, тип судна и голосовой чат для общения с экипажем. После отправки команды, пираты Гильдии получат уведомление, и по возможности присоединятся к Тебе." },
                { name: "/play2gether game", value: "Выбери игру из списка и голосовой чат для общения с командой. Участники сервера смогут подключиться к игровому лобби, воспользовавшись сгенерированной ссылкой-приглашением." },
                { name: "\u200b", value: "Используй команду `/play2gether` как показано ниже, либо воспользуйся кнопками для быстрого создания лобби по шаблону." },
            )
            .setFooter({
                icon_url: config.ui.icon_url,
                text: config.ui.title
            });

            interaction.reply({ embeds: [HelpPlay2gether], ephemeral: true });
        } else if (interaction.options.getSubcommand() === 'profile') {

        } else if (interaction.options.getSubcommand() === 'club') {

        } else if (interaction.options.getSubcommand() === 'invite') {

        }
    }
};
