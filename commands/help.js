const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');
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
			.setName('fleetcreator')
			.setDescription('Настроить FleetCreator для участия в рейде | Configure FleetCreator for raid participation')
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
        } else if (interaction.options.getSubcommand() === 'fleetcreator') {
            /*
             * Generate cridentials for FleetCreator Account
             */

            var email_prefix = 'glitterbeard';
            var email_domain = 'sunfox.ee';
            var personal_code = generatePrefix(4);

            var fc_username = email_prefix + '.' + personal_code;
            var fc_password = generateStrongPassword(8);

            var Help2MeButton1 = new ButtonBuilder()
            .setLabel('Подтвердить аккаунт')
            .setCustomId('help2me_fleet')
            .setEmoji("<:questsot:1117069619711180810>")
            .setStyle(ButtonStyle.Secondary);

            var Help2MeRow = new ActionRowBuilder()
                .addComponents(Help2MeButton1);

            var HelpFleetcreator = new EmbedBuilder()
                .setColor(config.colors.primaryDark)
                .setTitle( "Установка и настройка FleetCreator для участия в рейде" )
                .setDescription("Для запуска кораблей в рейде Sea of Thieves мы используем FleetCreator. Необходимо скачать архив с программой и зарегистрировать аккаунт, используя сгенерированные учетные данные.")
            .addFields(
                {   name: "Установка FleetCreator",
                    value: "Перейди на сайт [FleetCreator](https://www.fleetcreator.com/en/#fc-guide) и скачай архив, нажав кнопку **Download**.\nРаспакуй содержимое архива - директорию `FleetCreator_v*`.\n\nНайди и запусти файл `FleetCreator.exe`, далее нажми кнопку **Register with FleetCreator** чтобы зарегистрировать аккаунт. Зарегистрируйся, используя данные, приведенные ниже; сохрани их чтобы не потерять!"},
                {   name: "Данные для регистрации:",
                    value: "- Username: `" + fc_username + "`\n- Email: `" + fc_username + '@' + email_domain + "`\n- Password: `" + fc_password + "`" },
                {   name: "Подтверждение регистрации",
                    value: "Зарегистрированный аккаунт необходимо подтвердить - для этого нажми кнопку **Подтвердить аккаунт** под этим сообщением. Подтверждение аккаунта осуществляется Хранителями вручную. Как только аккаунт будет подтвержден, один из Хранителей свяжется с Тобой в ЛС.\n\nПосле активации, используй для входа в аккаунт данные, приведенные выше."},
            )
            .setFooter({
                iconURL: config.ui.icon_url,
                text: config.ui.title
            });

            interaction.reply({ embeds: [HelpFleetcreator], components: [Help2MeRow],  ephemeral: true });
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

function generatePrefix(length) {
    var charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    var prefix = "";
    for (var i = 0; i < length; i++) {
        var char = charset.charAt(Math.floor(Math.random() * charset.length));
        prefix += char;
    }
    return prefix;
}

function generateStrongPassword(length) {
    var charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%";
    var password = "";
    for (var i = 0; i < length; i++) {
        var char = charset.charAt(Math.floor(Math.random() * charset.length));
        password += char;
    }
    return password;
}
