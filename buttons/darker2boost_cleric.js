const { SlashCommandBuilder } = require('discord.js');
const config = require('../config.json');
const lists = require('../config.lists.json');

module.exports = {
    data: {
        name: 'darker2boost_cleric'
    },
    async execute(interaction) {
        const modal_order_details = {
            "title": `Add order for: Cleric`,
            "custom_id": "darker_client_request",
            "components": [
                {
                    "type": 1,
                    "components": [{
                        "type": 4,
                        "custom_id": "order_character",
                        "label": "Character:",
                        "style": 1,
                        "min_length": 1,
                        "max_length": 64,
                        "value": "Cleric",
                        "required": true
                    }]
                },
                {
                    "type": 1,
                    "components": [{
                        "type": 4,
                        "custom_id": "order_account",
                        "label": "Account name:",
                        "style": 1,
                        "min_length": 1,
                        "max_length": 128,
                        "required": true
                    }]
                },
                {
                    "type": 1,
                    "components": [{
                        "type": 4,
                        "custom_id": "order_details",
                        "label": "Order Details:",
                        "style": 2,
                        "min_length": 1,
                        "max_length": 256,
                        "required": true
                    }]
                }
            ]
        };
        interaction.showModal(modal_order_details);
    }
};
