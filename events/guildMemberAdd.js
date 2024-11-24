const { Events, ButtonBuilder, ActionRowBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');
const config = require('../config.json');
const mysql = require('mysql');
const database = mysql.createConnection({
    host: config.db_config.host,
    user: config.db_config.dbuser,
    password: config.db_config.dbpass,
    database: config.db_config.dbname,
    debug: false,
    multipleStatements: true,
});

module.exports = {
    name: Events.GuildMemberAdd,
    async execute(member) {
        const BotLogChannel = member.client.channels.cache.get(config.log_channels.log);
        const DarkerCategoryId = config.roles.categories.darker;

        /* Step 1.
        *  Select member data out from the
        *  users table.
        */

        getNewbieProfile(member.user.id, function (error, dataset1) {
            if (error) {
                BotLogChannel.send({ content: `[INVITE] JOIN ERROR: Can't get user ${member.user} data. Database error.` });
                return;
            } else if (dataset1.length != 1) {
                // User is not registered in the database
                BotLogChannel.send({ content: `[INVITE] JOIN ERROR: Can't get user ${member.user} data. User not found or there are dublicated records in DB\n> <@&` + config.roles.level.admin + `>, проверить учетную запись пользователя в БД и настроить интеграции.` });
                return;
            } else {
                var user_data_prep = JSON.parse(JSON.stringify(dataset1));
                var user_data = user_data_prep[0];
                /* Step 3
                *  Assign config.roles.community role to user
                *  regarding the user_data.user_landing value
                *  Add default role.
                */
                BotLogChannel.send({ content: `[INVITE] JOIN: User <@${member.user.id}> joined to the server.` });

                for (var key in config.roles.community) {
                    if (key === user_data.user_landing && key != 'darker') {

                        console.log("User is: " + key);
                        member.setNickname(user_data.user_name);
                        var communityRole = config.roles.community[key];
                        member.roles.add([config.roles.level.newbie, communityRole]);
                        BotLogChannel.send({ content: `[INVITE] JOIN: Default roles are assigned to user <@${member.user.id}>.` });

                    } else if (key === user_data.user_landing && key == 'darker') {

                        /* Darker Level Boost service
                         * Here is the code for the personal channel creation and user account data getting.
                         */

                        console.log("User is: " + key);
                        var communityRole = config.roles.community[key];
                        member.roles.add([communityRole]);

                        var DarkerFighterBtn = new ButtonBuilder()
                        .setLabel('Fighter')
                        .setCustomId('darker2boost_fighter')
                        .setStyle(ButtonStyle.Secondary);

                        var DarkerBarbarianBtn = new ButtonBuilder()
                        .setLabel('Barbarian')
                        .setCustomId('darker2boost_barbarian')
                        .setStyle(ButtonStyle.Secondary);

                        var DarkerRogueBtn = new ButtonBuilder()
                        .setLabel('Rogue')
                        .setCustomId('darker2boost_rogue')
                        .setStyle(ButtonStyle.Secondary);

                        var DarkerRangerBtn = new ButtonBuilder()
                        .setLabel('Ranger')
                        .setCustomId('darker2boost_ranger')
                        .setStyle(ButtonStyle.Secondary);

                        var DarkerWizardBtn = new ButtonBuilder()
                        .setLabel('Wizard')
                        .setCustomId('darker2boost_wizard')
                        .setStyle(ButtonStyle.Secondary);

                        var DarkerClericBtn = new ButtonBuilder()
                        .setLabel('Cleric')
                        .setCustomId('darker2boost_cleric')
                        .setStyle(ButtonStyle.Secondary);

                        var DarkerBardBtn = new ButtonBuilder()
                        .setLabel('Bard')
                        .setCustomId('darker2boost_bard')
                        .setStyle(ButtonStyle.Secondary);

                        var DarkerWarlockBtn = new ButtonBuilder()
                        .setLabel('Warlock')
                        .setCustomId('darker2boost_warlock')
                        .setStyle(ButtonStyle.Secondary);

                        var DarkerDruidBtn = new ButtonBuilder()
                        .setLabel('Druid')
                        .setCustomId('darker2boost_druid')
                        .setStyle(ButtonStyle.Secondary);

                        var ButtonsRow1 = new ActionRowBuilder()
                        .addComponents(DarkerFighterBtn, DarkerBarbarianBtn, DarkerRogueBtn, DarkerRangerBtn, DarkerWizardBtn);

                        var ButtonsRow2 = new ActionRowBuilder()
                        .addComponents(DarkerClericBtn, DarkerBardBtn, DarkerWarlockBtn, DarkerDruidBtn);

                        var PersonalChannelName = member.user.username;

                        member.guild.channels.create({
                            name: PersonalChannelName,
                            type: 0
                        })
                        .then(ticket => {
                            ticket.setParent(DarkerCategoryId);
                            ticket.permissionOverwrites.set([
                                {
                                    id: member.guild.roles.everyone,
                                    deny: [
                                        PermissionFlagsBits.ViewChannel,
                                    ],
                                },
                                {
                                    id: member.user.id,
                                    allow: [
                                        PermissionFlagsBits.ViewChannel,
                                        PermissionFlagsBits.SendMessages,
                                        PermissionFlagsBits.ReadMessageHistory,
                                        PermissionFlagsBits.AttachFiles,
                                        PermissionFlagsBits.AddReactions,
                                    ],
                                },
                                {
                                    id: member.guild.roles.cache.get(config.roles.level.admin),
                                    allow: [
                                        PermissionFlagsBits.ViewChannel,
                                        PermissionFlagsBits.SendMessages,
                                        PermissionFlagsBits.ReadMessageHistory,
                                        PermissionFlagsBits.AttachFiles,
                                        PermissionFlagsBits.AddReactions,
                                        PermissionFlagsBits.ManageMessages
                                ],
                                }
                            ]);
                            ticket.send({ content: `Dear <@${member.user.id}>.\r\nThank you for choosing our services. Here is your personal channel. To get started, please select the class of your character by clicking one of the buttons below.\r\nIf you have any questions, feel free to ask — we’re here to make your experience smooth and enjoyable!\r\nLet’s begin your journey to success!`, components: [ButtonsRow1, ButtonsRow2]});
                            BotLogChannel.send({ content: `[INVITE] JOIN: Personal channel for user <@${member.user.id}> is created.` });
                        })
                        .catch(err => {
                            console.log(err)
                        });
                    }
                }
            }
        });
    },
};

getNewbieProfile = function (UserDiscordUid, callback) {
    let sql1 = `SELECT * FROM users WHERE user_discord_uid = ? LIMIT 1;`;
    database.query(sql1, [UserDiscordUid], function (error, result) {
        if (error) {
            callback("Database error.",null);
            BotLogChannel.send({ content: `[SYSTEM] DB ERROR: guildMemberAdd/getUserProfile function error.`});
        } else {
            callback(null, result);
        }
    });
    // getNewbieProfile ends here
    }

function getValues(obj, key) {
    for (var i in obj) {
        if (!obj.hasOwnProperty(i)) continue;
        if (typeof obj[i] == 'object') {
            return getValues(obj[i], key);
        } else if (i == key) {
            return 'false';
        }
    }
}
