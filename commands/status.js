const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const config = require('../config.json');
const downdetector = require('downdetector-api');

/** Check the documentation for downdetector-api library:
 *  https://github.com/DavideViolante/downdetector-api
 *  NPM: https://www.npmjs.com/package/downdetector-api
 */

module.exports = {
    data: new SlashCommandBuilder()
	.setName('status')
	.setDescription('Проверка статуса для стороних сервисов')
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
	.addSubcommand(subcommand =>
		subcommand
			.setName('steam')
			.setDescription('Статус Steam')
    ),
    async execute(interaction) {
        const NotificationsChannel = interaction.client.channels.cache.get(config.log_channels.notifictions);

        if (interaction.options.getSubcommand() === 'steam') {
            if (isServiceDown('steam')) {
                var notification_embed = new EmbedBuilder()
                    .setColor(config.colors.primaryBright)
                    .setTitle("Внимание!\nВозможны проблемы в работе <:ico_steam:1246544322321715253>Steam!")
                    .setDescription("Информация с сайта [downdetector.com/steam](https://downdetector.com/status/steam/)")
                    .setTimestamp()
                    .setFooter({
                        iconURL: config.ui.icon_url,
                        text: config.ui.title
                });
                NotificationsChannel.send({ embeds: [notification_embed] });
                interaction.reply({ content: '— Вероятно, в работе сервиса Steam возникли проблемы. Отправил подробности в канал <#' + config.log_channels.notifictions + '>.', ephemeral: true });
            } else {
                interaction.reply({ content: '— Сообщений о проблемах в работе сервиса Steam не обнаружено.', ephemeral: true });
            }
        }
    }
};

function isServiceDown(serviceName) {
    /** Possible service names:
     * "steam",
     * "discord",
     * "epicgames",
     * "xbox-live",
     * "playstation-network"
     */

    const status = downdetector.getServiceStatus(serviceName);
    if (!status || !Array.isArray(status.reports) || status.reports.length === 0) {
        return false;
        console.log("No status reports available for service: " + serviceName);
    }
    console.log("Status reports for " + serviceName + ": ", status.reports);
    const latestThree = [...status.reports]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 3);

    const sum = latestThree.reduce((acc, r) => acc + (Number(r.value) || 0), 0);
    if (sum > 30) {
        return true;
    } else {
        return false;
    }
}
