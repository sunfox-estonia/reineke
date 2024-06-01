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
const moment = require('moment');
const mergeImages = require('merge-images');

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
        if (interaction.options.getMember('user') == null) {
            var user_discord_uid = interaction.member.user.id;
        } else {
            var user_discord_uid = interaction.options.getMember('user');
        }
        const ProfileUri = config.url.commonUrl + "profile/";
        /* Step 1. Get user Discord profile and data from database
         */
        await interaction.guild.members.fetch(user_discord_uid).then(
        DiscordUser => {
            getUserProfile(DiscordUser.user.id, function (error, user_data) {
                if (error) {
                    interaction.reply({ content: '— Кажется, у  меня нет доступа к записям прямо сейчас. Извини!', ephemeral: true });
                } else {
                    if (user_data.length == 0 || user_data.length > 1) {
                    interaction.reply({ content: "— Кажется, у Тебя еще нет профиля достижений Sunfox.ee. [Создать профиль](" + ProfileUri + ")." , ephemeral: true });
                    } else {
                        const ProfileEmbed = new EmbedBuilder()
                        .setAuthor({ name: DiscordUser.displayName, iconURL: "https://cdn.discordapp.com/avatars/" + DiscordUser.user.id + "/" + DiscordUser.user.avatar + ".jpeg" })
                        .setColor(config.colors.primaryDark)
                        .addFields(
                            { name: "Время:", value: moment().tz(user_data.user_timezone).format('HH:mm') }
                        )
                        .setTimestamp()
                        .setFooter({
                            icon_url: config.ui.icon_url,
                            text: config.ui.title
                        });

                        if (user_data.user_steam_uid != null) {
                            ProfileEmbed.addFields(
                                { name: `Добавить в друзья`, value: `[<:ico_steam:1246544322321715253> Steam](https://steamcommunity.com/profiles/${user_data.user_steam_uid})`, inline: true },
                            )
                        } else if (user_data.user_steam_uid == null && user_data.user_xbox_uid != null){
                            ProfileEmbed.addFields(
                                { name: `Добавить в друзья`, value: `[<:ico_xbox:1246544319947604012> XBOX](https://account.xbox.com/en-US/profile?gamertag=${user_data.user_xbox_uid})`, inline: true },
                            )
                        }
                        if (user_data.user_steam_uid != null && user_data.user_xbox_uid != null) {
                            ProfileEmbed.addFields(
                                { name: "", value: `[<:ico_xbox:1246544319947604012> XBOX](https://account.xbox.com/en-US/profile?gamertag=${user_data.user_xbox_uid})`, inline: true },
                            )
                        }

                        /* Step 2.
                         * Get user's comendation and shown pp sum
                         */
                        countUserPowerPoints(DiscordUser.user.id, function (error, user_pp) {
                            if (error) {
                                ProfileEmbed.setThumbnail(config.url.resourcesUrl + `img/powerpoints/0.png`);
                            } else {
                                ProfileEmbed.setThumbnail(config.url.resourcesUrl + `img/powerpoints/`+ user_pp + `.png`);
                            }

                            /* Step 3
                            * Get users rare comedations and create image with the list
                            */
                            getUserRareComedations(DiscordUser.user.id, function (error, user_rare_comedations) {
                                if (error) {

                                } else if (user_rare_comedations.length > 0) {
                                    /* Step 4
                                    * Get numbers stored in rare_comedations array and generate new image
                                    * using merge-images library by combining all comedations-related images
                                    * into one.
                                    */

                                    // Set coordinates
                                    coms_coord = [
                                        { x: 0, y: 0 },
                                        { x: 405, y: 0 },
                                        { x: 0, y: 305 },
                                        { x: 405, y: 305 }
                                    ]
                                    // Set size of final image
                                    if (user_rare_comedations.length < 3) {
                                        coms_size.width = 800;
                                        coms_size.height = 295;
                                    } else {
                                        coms_size.width = 800;
                                        coms_size.height = 600;
                                    }

                                    var img1 = user_rare_comedations[0].comedation_code + "_profile.png";
                                    var img2 = user_rare_comedations.length > 1 ? user_rare_comedations[1].comedation_code + "_profile.png" : "placeholder.png";
                                    var img3 = user_rare_comedations.length > 2 ? user_rare_comedations[2].comedation_code + "_profile.png" : "placeholder.png";
                                    var img4 = user_rare_comedations.length > 3 ? user_rare_comedations[3].comedation_code + "_profile.png" : "placeholder.png";
                                    mergeImages([
                                        { src: img1, x: coms_coord[0].x , y: coms_coord[0].y },
                                        { src: img2, x: coms_coord[1].x, y: coms_coord[1].y },
                                        { src: img3, x: coms_coord[2].x, y: coms_coord[2].y },
                                        { src: img4, x: coms_coord[3].x, y: coms_coord[3].y },
                                    ],
                                    {
                                        width: coms_size.width,
                                        height: coms_size.height
                                    }).then(b64 => {
                                        ProfileEmbed.setImage(b64);
                                        ProfileEmbed.addFields(
                                            { name: '\u200b', value: '**Лучшие достижения ' + DiscordUser.displayName + ':**' }
                                        )
                                    });
                                } else {

                                }
                            });

                            /* Step 5
                             * Create and send embed with user data
                             */
                            var ProfileBtn = new ButtonBuilder()
                            .setLabel('Смотреть профиль')
                            .setURL(ProfileUri)
                            .setStyle(ButtonStyle.Link);

                            interaction.reply({ embeds: [ProfileEmbed], components: [ProfileBtn]});
                        });
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
            BotLogChannel.send({ content: `[SYSTEM] DB ERROR: profile/getUserProfile function error.`});
        } else {
            callback(null, result);
        }
      });
    // getUserProfile ends here
    }

countUserPowerPoints = function (UserDiscordUid, callback) {
    let sql2 = `SELECT SUM(dir_comedations.comedation_pp) AS total_pp
                FROM user_comedations
                JOIN dir_comedations ON user_comedations.comedation_code = dir_comedations.comedation_code
                WHERE user_comedations.user_discord_uid = ?`;
    database.query(sql2, [UserDiscordUid], function (error, result) {
        if (error) {
            callback("Database error.", null);
            BotLogChannel.send({ content: `[SYSTEM] DB ERROR: profile/countUserPowerPoints function error.`});
        } else {
            callback(null, result[0].total_pp);
        }
    });
}

getUserRareComedations = function (UserDiscordUid, callback) {
    let sql3 = `SELECT dir_comedations.comedation_code
                FROM user_comedations
                JOIN dir_comedations ON user_comedations.comedation_code = dir_comedations.comedation_code
                WHERE user_comedations.user_discord_uid = ? AND dir_comedations.comedation_type = 'rare' ? ORDER BY user_comedations.date_created DESC LIMIT 4`;
    database.query(sql3, [UserDiscordUid], function (error, result) {
        if (error) {
            callback("Database error.", null);
            BotLogChannel.send({ content: `[SYSTEM] DB ERROR: profile/getUserRareComedations function error.`});
        } else {
            callback(null, result);
        }
    });

}
