const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
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
                .setImage(config.url.resourcesUrl + "/help/play2gether.gif")
            .addFields(
                { name: "/play2gether sot", value: "Выбери цель путешествия, тип судна и голосовой чат для общения с экипажем. После отправки команды, пираты Гильдии получат уведомление, и по возможности присоединятся к Тебе." },
                { name: "/play2gether game", value: "Выбери игру из списка и голосовой чат для общения с командой. Участники сервера смогут подключиться к игровому лобби, воспользовавшись сгенерированной ссылкой-приглашением." },
                { name: "\u200b", value: "Используй команду в любом доступном канале `/play2gether` как показано ниже." },
            )
            .setFooter({
                iconURL: config.ui.icon_url,
                text: config.ui.title
            });

            interaction.reply({ embeds: [HelpPlay2gether], ephemeral: true });
        } else if (interaction.options.getSubcommand() === 'club') {
            var HelpClub = new EmbedBuilder()
                .setColor(config.colors.primaryDark)
                .setTitle( "Уведомления для участников сообщества Викинги Вирумаа." )
                .setDescription("")
                .setImage(config.url.resourcesUrl + "/help/club.gif")
            .addFields(
                { name: "/club status", value: "" },
                { name: "\u200b", value: "Используй команду в любом доступном канале `/club` как показано ниже." },
            )
            .setFooter({
                iconURL: config.ui.icon_url,
                text: config.ui.title
            });

            interaction.reply({ embeds: [HelpClub], ephemeral: true });
        } else if (interaction.options.getSubcommand() === 'profile') {
            var HelpProfile = new EmbedBuilder()
                .setColor(config.colors.primaryDark)
                .setTitle( "Просмотр профиля участника сообщества." )
                .setDescription("")
                .setImage(config.url.resourcesUrl + "/help/profile.gif")
            .addFields(
                { name: "/profile", value: "" },
                { name: "\u200b", value: "Используй команду в любом доступном канале `/profile` как показано ниже." },
            )
            .setFooter({
                iconURL: config.ui.icon_url,
                text: config.ui.title
            });

            interaction.reply({ embeds: [HelpProfile], ephemeral: true });

        } else if (interaction.options.getSubcommand() === 'invite') {
            var HelpInvite = new EmbedBuilder()
                .setColor(config.colors.primaryDark)
                .setTitle( "Создание ссылки приглашения на сервер." )
                .setDescription("")
                .setImage(config.url.resourcesUrl + "/help/invite.gif")
            .addFields(
                { name: "/invite", value: "" },
                { name: "\u200b", value: "Используй команду в любом доступном канале `/invite` как показано ниже." },
            )
            .setFooter({
                iconURL: config.ui.icon_url,
                text: config.ui.title
            });

            interaction.reply({ embeds: [HelpInvite], ephemeral: true });

        }
    }
};
