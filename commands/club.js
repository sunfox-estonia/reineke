const { SlashCommandBuilder } = require('discord.js');
const config = require('../config.json');

module.exports = {
    data: new SlashCommandBuilder()
	.setName('club')
	.setDescription('Уведомления для участников клуба')
	.addSubcommand(subcommand =>
		subcommand
			.setName('door')
			.setDescription('Изменить статус доступа')
            .addStringOption(option =>
                option.setName('status')
                    .setDescription('Статус доступа')
                    .setRequired(true)
                    .addChoices(
                        { name: 'Открыт', value: 'open' },
                        { name: 'Закрыт', value: 'close' }
                    ))
    ),

    async execute(interaction) {
        const hasRole = interaction.member.roles.cache.has(config.roles.community.viruviking);
        if (!hasRole) {
            const locales = {
                "en-US": 'You do not have permission to execute this command!',
            };
            await interaction.reply(locales[interaction.locale] ?? 'У вас недостаточно прав для выполнения этой команды!');

            BotLogChannel.send({ content: `ERROR: <@` + DiscordUser.user.id + `> is trying to run **/admin door** command without permission.`});

        } else {
            const NotificationsChannel = interaction.client.channels.cache.get(config.log_channels.notifictions);
            const BotLogChannel = interaction.client.channels.cache.get(config.log_channels.log);
            /*
            * Change club door status
            */
            if (interaction.options.getSubcommand() === 'door') {
                var door_status = interaction.options.getString('status');
            
                switch (door_status) {
                    case 'open':
                        var notification_text = ' двери клуба открыты.';
                        var notification_color = '0x1F7E2';
                        break;
                    case 'close':
                        var notification_text = ' двери клуба закрыты.';
                        var notification_color = '0x1F534';
                        break;
                    default:
                        break;
                }

                NotificationsChannel.send({ content: String.fromCodePoint('0x1F511') + String.fromCodePoint(notification_color) + ` <@&${config.roles.community.viruviking}>, ${notification_text}` });

                BotLogChannel.send({ content: `CLUB DOOR: Status has been changed by <@${interaction.user.id}>` });

            }
        }
    }
};
        