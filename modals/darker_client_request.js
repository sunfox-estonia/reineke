const { SlashCommandBuilder } = require('discord.js');
const config = require('../config.json');
const fs = require('node:fs');

module.exports = {
    data: {
        name: 'darker_client_request'
    },
    async execute(interaction) {
        const data_order_character = interaction.fields.getTextInputValue('order_character');
        const data_order_account = interaction.fields.getTextInputValue('order_account');
        const data_order_details = interaction.fields.getTextInputValue('order_details');

        const OrderDetailsEmbed = new EmbedBuilder()
            .setColor(config.colors.primaryBright)
            .setTitle("Order details")
            .setDescription(data_order_details)
            .addFields(
                { name: "Character:", value: data_order_character, inline: true},
                { name: "Account name:", value: data_order_account, inline: true}
            )
            .setTimestamp()
            .setFooter({
                iconURL: config.ui.icon_url,
                text: config.ui.title
            });

        interaction.reply({ content:`— <@` + DiscordUser.user.id + `>, your order details are provided below. We will contact you shortly.`, embeds: [OrderDetailsEmbed] });
    }
};
