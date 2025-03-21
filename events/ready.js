const { Events, EmbedBuilder, PresenceUpdateStatus, ActivityType, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');
const config = require('../config.json');
const lists = require('../config.lists.json');
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
        let randomStatus = getRandomStatus();
        client.user.setPresence({
            activities: [{
                type: ActivityType.Custom,
                name: randomStatus }],
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
        var timeLimitEnd    = moment('13:30', timeFormat);

        if (timeCurrent.isBetween(timeLimitStart, timeLimitEnd)) {
            const Play2Channel  = client.channels.cache.get(config.log_channels.play2);
            const BadgeRequestChannel  = client.channels.cache.get(config.log_channels.achievements);

            var Play2IntroEmbed = new EmbedBuilder()
                .setColor(config.colors.primaryDark)
                .setTitle( "— Будем играть вместе!" )
                .setDescription("Приглашай участников сообщества в кооперативные игры с помощью команды `/play2gether`. Доступно два режима использования команды: для экипажей Sea of Thieves, и для других игр.")
                .setImage(config.url.resourcesUrl + "/help/play2gether.gif")
            .addFields(
                { name: "/play2gether sot", value: "Выбери цель путешествия, тип судна и голосовой чат для общения с экипажем. После отправки команды, пираты Гильдии получат уведомление, и по возможности присоединятся к Тебе." },
                { name: "/play2gether game", value: "Выбери игру из списка и голосовой чат для общения с командой. Участники сервера смогут подключиться к игровому лобби, воспользовавшись сгенерированной ссылкой-приглашением." },
                { name: "\u200b", value: "Используй команду `/play2gether` как показано ниже." },
            )
            .setFooter({
                iconURL: config.ui.icon_url,
                text: config.ui.title
            });

            // SoT Predefine buttons
            var Play2ButtonSot1 = new ButtonBuilder()
            .setLabel('🟠 PVP - Слуги Пламени')
            .setCustomId('play2_sot1')
            .setEmoji("<:ship_brig:1155489530900660294>")
            .setStyle(ButtonStyle.Secondary);

            var Play2ButtonSot2 = new ButtonBuilder()
            .setLabel('🟠 PVP - Открытый мир')
            .setCustomId('play2_sot2')
            .setEmoji("<:ship_sloop:1155489536349057095>")
            .setStyle(ButtonStyle.Secondary);

            var Play2ButtonSot3 = new ButtonBuilder()
            .setLabel('🟠 Farm - Гильдия')
            .setCustomId('play2_sot3')
            .setEmoji("<:ship_brig:1155489530900660294>")
            .setStyle(ButtonStyle.Secondary);

            var Play2GameDRG = new ButtonBuilder()
            .setLabel('🟠 Deep Rock Galactic')
            .setCustomId('play2_548430')
            .setStyle(ButtonStyle.Secondary);

            var Play2GameCS2 = new ButtonBuilder()
            .setLabel('🟧 Counter-Strike 2')
            .setCustomId('play2_730')
            .setEmoji("<:ico_steam:1246544322321715253>")
            .setStyle(ButtonStyle.Secondary);

            var Play2ServerRust = new ButtonBuilder()
            .setLabel('MrGOPY Rust Server')
            .setURL('https://bifrost.snfx.ee/steam/252490/server/common')
            .setStyle(ButtonStyle.Link);

            var Play2ServerValheim = new ButtonBuilder()
            .setLabel('Sunfox Valheim')
            .setURL('https://bifrost.snfx.ee/steam/892970/server/common')
            .setStyle(ButtonStyle.Link);

            var Play2SotRow = new ActionRowBuilder()
                .addComponents(Play2ButtonSot1, Play2ButtonSot2, Play2ButtonSot3);

            var Play2GamesRow = new ActionRowBuilder()
                .addComponents(Play2GameDRG, Play2GameCS2);

            var Play2ServersRow = new ActionRowBuilder()
            .addComponents(Play2ServerRust, Play2ServerValheim);

            if (!Play2Channel) {
                BotLogChannel.send({ content: `[PLAY2] ERROR: Invites channel not found!` });
            }
            Play2Channel.messages.fetch({ limit: 99 }).then(messages => {
                Play2Channel.bulkDelete(messages, true).then(messages => {
                    BotLogChannel.send({ content: `[AUTOMATION] PLAY2: Invites channel has been cleared.` });
                    Play2Channel.send({ embeds: [Play2IntroEmbed],  components: [Play2SotRow, Play2GamesRow, Play2ServersRow] });
                }).catch(console.error);
            });

            // if (!BadgeRequestChannel) {
            //     BotLogChannel.send({ content: `[BADGES] ERROR: Requests channel not found!` });
            // }
            // BadgeRequestChannel.messages.fetch({ limit: 99 }).then(messages => {
            //     BadgeRequestChannel.bulkDelete(messages, true).then(messages => {
            //         BotLogChannel.send({ content: `[AUTOMATION] BADGES: Requests channel has been cleared.` });
            //         BadgeRequestChannel.send({ embeds: [BadgesIntroEmbed] });
            //     }).catch(console.error);
            // });

        } else {
            BotLogChannel.send({ content: `[AUTOMATION] Play2gether & Badges Requests channels has not been cleared. Current time not within limit.` });
        }
    },
};

function getRandomStatus() {
    const statuses = lists.status;
    const randomIndex = Math.floor(Math.random() * statuses.length);
    return statuses[randomIndex];
}
