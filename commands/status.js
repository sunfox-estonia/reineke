const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const config = require('../config.json');
const fetch = require('node-fetch');

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

        const htmlResponse = await fetch('http://steamstat.us');
        const htmlContent = await htmlResponse.text();

        let psaText = null;
        const psaMatch = htmlContent.match(/<[^>]*id=["']psa["'][^>]*>([\s\S]*?)<\/[^>]+>/i);
        if (psaMatch && psaMatch[1]) {
            psaText = psaMatch[1].replace(/<[^>]+>/g, '').trim();
            if (psaText.length > 0) {
                var notification_embed = new EmbedBuilder()
                    .setColor(config.colors.primaryBright)
                    .setTitle("Внимание!\nВозможны проблемы в работе\u1CBC<:ico_steam:1246544322321715253>Steam!")
                    .setDescription("Информация с сайта [steamstat.us](https://steamstat.us/):\n```" + psaText + "```")
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
