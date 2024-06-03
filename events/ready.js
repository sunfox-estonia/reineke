const { Events, EmbedBuilder, PresenceUpdateStatus, ActivityType } = require('discord.js');
const config = require('../config.json');
const mysql = require('mysql');
const moment = require('moment');
const database = mysql.createConnection({
    host: config.db_config.host,
    user: config.db_config.dbuser,
    password: config.db_config.dbpass,
    database: config.db_config.dbname,
    debug: false,
    multipleStatements: true,
});

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        database.connect(function (err) {
            if (err) {
                return console.error('error: ' + err.message);
            }
            console.log('Connected to the MySQL server database ' + config.db_config.dbname + '@' + config.db_config.host + '.');
        });
        console.log(`Logged in Discord as ${client.user.tag}!`);

        client.channels.fetch(config.log_channels.log).then(channel => {
            channel.send("Reineke management bot is started!");
        });

        const BotLogChannel = client.channels.cache.get(config.log_channels.log);

        // Set the bot status
        client.user.setPresence({
            activities: [{
                type: ActivityType.Watching,
                name: config.status.text }],
            status: PresenceUpdateStatus.Online
        });

        /* Play2gether channel praparing block
         * We should delete all messages in a play2gether channel
         * and create a new embed message with the information
         * about the play2gether command
         * Should be runned one time per day at 11:30-13:30
         */
        const timeFormat    = 'hh:mm';
        var timeCurrent     = moment();
        var timeLimitStart  = moment('11:30', timeFormat);
        var timeLimitEnd    = moment('19:30', timeFormat);

        if (timeCurrent.isBetween(timeLimitStart, timeLimitEnd)) {
            const Play2Channel  = client.channels.cache.get(config.log_channels.play2);
            const BadgeRequestChannel  = client.channels.cache.get(config.log_channels.achievements);

            // Step 1. Clear the Play2gether and Badges Request channel
            if (!Play2Channel) {
                BotLogChannel.send({ content: `[PLAY2] ERROR: Invites channel not found!` });
            }
            Play2Channel.messages.fetch({ limit: 99 }).then(messages => {
                Play2Channel.bulkDelete(messages, true).then(messages => {
                    BotLogChannel.send({ content: `[AUTOMATION] PLAY2: Invites channel has been cleared.` });
                })
                .catch(console.error);
            });

            if (!BadgeRequestChannel) {
                BotLogChannel.send({ content: `[BADGES] ERROR: Requests channel not found!` });
            }
            BadgeRequestChannel.messages.fetch({ limit: 99 }).then(messages => {
                BadgeRequestChannel.bulkDelete(messages, true).then(messages => {
                    BotLogChannel.send({ content: `[AUTOMATION] BADGES: Requests channel has been cleared.` });
                }).catch(console.error);

            });

            // Step 2. Create a new embed message with the Play2gether command info and Badges Request info
            var Play2IntroEmbed = new EmbedBuilder()
                .setColor(config.colors.primaryDark)
                .setTitle( "— Будем играть вместе!" )
                .setDescription("Приглашай участников сообщества в кооперативные игры с помощью команды `/play2gether`. Доступно два режима использования команды: для экипажей Sea of Thieves, и для других игр.")
                .setImage(config.url.resourcesUrl + "/help/play2gether.gif")
            .addFields(
                { name: "/play2gether sot", value: "Выбери цель путешествия, тип судна и голосовой чат для общения с экипажем. После отправки команды, пираты Гильдии получат уведомление, и по возможности присоединятся к Тебе." },
                { name: "/play2gether game", value: "Выбери игру из списка и голосовой чат для общения с командой. Участники сервера смогут подключиться к игровому лобби, воспользовавшись сгенерированной ссылкой-приглашением." },
                { name: "\u200b", value: "Используй команду `/play2gether` как показано ниже, либо воспользуйся кнопками для быстрого создания лобби по шаблону." },
            )
            .setFooter({
                iconURL: config.ui.icon_url,
                text: config.ui.title
            });

            var BadgesIntroEmbed = new EmbedBuilder()
                .setColor(config.colors.primaryDark)
                .setTitle( "— Покажи-ка, что интересного у тебя есть?" )
                .setDescription("Чтобы получить достижения сообщества, в этом канале нужно предоставить доказательства, подтверждающие выполнение действий, необходимых для получения ачивки. Просмотреть весь список доступных достижений можно на сайте [sunfox.ee/profile](https://sunfox.ee/profile).")
            .addFields(
                { name: "Редкие достижения", value: "Редкие достижения демонстрируются в профиле пользователя по команде `/profile` — на зависть остальным! Достижения, выполненные в кооперативных играх, показаны в приглашении, созданном с помощью команды `/play2gether`. Редкие достижения могут быть выданы задним числом." },
                { name: "\u200b", value: "В этом чате включен медленный режим. Постарайся отправить доказательства одним сообщением. Не забудь указать название желаемой ачивки!" },
            )
            .setFooter({
                iconURL: config.ui.icon_url,
                text: config.ui.title
            });

            // Step 3. Send the embed message to the channels
            Play2Channel.send({ embeds: [Play2IntroEmbed] });
            BadgeRequestChannel.send({ embeds: [BadgesIntroEmbed] });
        } else {
            BotLogChannel.send({ content: `[AUTOMATION] Play2gether & Badges Requests channels has not been cleared. Current time not within limit.` });
        }

    },
};
