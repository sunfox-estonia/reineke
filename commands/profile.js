const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
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
	data: new SlashCommandBuilder()
		.setName('profile')
		.setDescription('Просмотреть профиль пользователя.')
        .setDescriptionLocalizations({
            "en-US": 'Show user profile.'
        })
		.addUserOption(option =>
			option.setName('user')
				.setDescription('Имя пользователя | User name')),

    async execute(interaction) {
        /* Step 1. Check if user has manager role
         * Only manager can see another user profile
         * Othervise only own profile can be seen
         */
        var hasManagerRole = interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers);
        if (hasManagerRole == true) {
            if (interaction.options.getMember('user') == null) {
                const user_discord_uid = interaction.member.user.id;
                const reply_hidden = FALSE;
            } else {
                const user_discord_uid = interaction.options.getMember('user');
                const reply_hidden = TRUE;
            }
        } else {
            const user_discord_uid = interaction.member.user.id;
        }

        /* Step 2. Get user Discord profile and data from database
         */
        await interaction.guild.members.fetch(user_discord_uid).then(
        DiscordUser => {
            getUserProfile(DiscordUser.user.id, function (error, user_data) {
                if (error) {
                    interaction.reply({ content: '— Кажется, у  меня нет доступа к записям прямо сейчас. Извини!', ephemeral: true });
                } else {
                    if (user_data.length == 0 || user_data.length > 1) {
                    interaction.reply({ content: '— Увы, но в моих записях нет упоминаний об этом человеке!', ephemeral: true });
                    } else {
                        /* Step 3. Prepare user profile commendations
                         * There are the list of completed commendations and
                         * one commendation to complete in a future.
                         * We are showing special commendation too - they
                         * are shown as the icons.
                         */

                        var commendations_list = [];
                        var commendations_special = "";

                        var profile_embed = new EmbedBuilder()
                            .setColor(config.colors.primaryDark)
                            .setAuthor({ name: DiscordUser.roles.highest.name, iconURL: "" }) // Add user current level-related role
                            .setTitle(DiscordUser.displayName)
                            .setThumbnail("https://cdn.discordapp.com/avatars/" + DiscordUser.user.id + "/" + DiscordUser.user.avatar + ".png")
                            .setImage(commendations_special)
                            .addFields(commendations_list)
                            .setTimestamp()
                            .setFooter({
                                icon_url: config.ui.icon_url,
                                text: config.ui.title
                            });

                        interaction.reply({ embeds: [profile_embed], ephemeral: reply_hidden });
                    }
                }
            });
        });
    }
};

getUserProfile = function (UserDiscordUid, callback) {
    let sql1 = `SELECT * FROM users WHERE user_discord_uid = ? AND user_date_deleted IS NULL`;
    database.query(sql1, [UserDiscordUid], function (error, result) {
        if (error) {
            callback("Database error.",null);
        } else {
            callback(null, result);
        }
      });
    // getUserProfile ends here
    }
