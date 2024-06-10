const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, AttachmentBuilder } = require('discord.js');
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
const momenttz = require('moment-timezone');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('profile')
		.setDescription('Просмотреть профиль пользователя.')
        .setDescriptionLocalizations({
            "en-US": 'Show user profile.'
        })
		.addUserOption(option =>
			option.setName('user')
				.setDescription('Имя пользователя | User name')
                .setRequired(false)),

    async execute(interaction) {
        const BotLogChannel = interaction.client.channels.cache.get(config.log_channels.log);

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
            const user_avatar = (DiscordUser.user.avatar == null) ? config.ui.userpic : "https://cdn.discordapp.com/avatars/" + DiscordUser.user.id + "/" + DiscordUser.user.avatar + ".jpeg" ;

            getUserProfile(DiscordUser.user.id, function (error, dataset1) {
                if (error) {
                    interaction.reply({ content: '— Кажется, у  меня нет доступа к записям прямо сейчас. Извини!', ephemeral: true });
                } else {
                    if (dataset1.length == 0 || dataset1.length > 1) {
                        if (interaction.options.getMember('user') == null) {
                            interaction.reply({ content: "— Кажется, у Тебя еще нет профиля достижений Sunfox.ee. [Создать профиль](" + ProfileUri + ")." , ephemeral: true });
                        } else {
                            interaction.reply({ content: "— Кажется, у этого пользователя еще нет профиля достижений Sunfox.ee. Обязательно попроси нашего друга создать себе профиль!" , ephemeral: true });
                        }
                    } else {
                        var user_data_prep = JSON.parse(JSON.stringify(dataset1));
                        var user_data = user_data_prep[0];
                        var user_timezone = user_data.user_timezone == null ? "Europe/Tallinn" : user_data.user_timezone;

                        const ProfileEmbed = new EmbedBuilder()
                        .setAuthor({ name: DiscordUser.displayName, iconURL: user_avatar })
                        .setColor(config.colors.primaryDark)
                        .addFields(
                            { name: "Время:", value: '`' + momenttz().tz(user_timezone).format('HH:mm') + '`'}
                        )
                        .setTimestamp()
                        .setFooter({
                            iconURL: config.ui.icon_url,
                            text: config.ui.title
                        });



                        if (user_data.user_steam_uid != '' && user_data.user_xbox_uid != '') {
                            ProfileEmbed.addFields(
                                { name: `Добавить в друзья:`, value: `[<:ico_steam:1246544322321715253> Steam](https://steamcommunity.com/profiles/${user_data.user_steam_uid})`, inline: true },
                            )
                            ProfileEmbed.addFields(
                                { name: "\u200b", value: `[<:ico_xbox:1246544319947604012> XBOX](https://account.xbox.com/en-US/profile?gamertag=${user_data.user_xbox_uid})`, inline: true },
                            )
                        } else if (user_data.user_steam_uid == '' && user_data.user_xbox_uid != ''){
                            ProfileEmbed.addFields(
                                { name: `Добавить в друзья:`, value: `[<:ico_xbox:1246544319947604012> XBOX](https://account.xbox.com/en-US/profile?gamertag=${user_data.user_xbox_uid})`, inline: true },
                            )
                        } else if (user_data.user_steam_uid != '' && user_data.user_xbox_uid == '') {
                            ProfileEmbed.addFields(
                                { name: `Добавить в друзья:`, value: `[<:ico_steam:1246544322321715253> Steam](https://steamcommunity.com/profiles/${user_data.user_steam_uid})`, inline: true },
                            )
                        }

                        /* Step 2.
                         * Get user's comendation and shown pp sum
                         */
                        countUserPowerPoints(DiscordUser.user.id, function (error, user_pp) {
                            if (error) {
                                BotLogChannel.send({ content: `[SYSTEM] DB ERROR: ` + error });
                                ProfileEmbed.setThumbnail(config.url.resourcesUrl + `img/powerpoints/0.png`);
                            } else {
                                ProfileEmbed.setThumbnail(config.url.resourcesUrl + `img/powerpoints/`+ user_pp + `.png`);
                            }

                            /* Step 3
                            * Get users rare comedations and create image with the list
                            */
                            getUserRareComedations(DiscordUser.user.id, function (error, dataset2) {
                                if (error) {

                                } else if (dataset2.length > 0) {
                                    var profile_comedations_url = config.buffer.images.url + 'p_c_' + DiscordUser.user.id + '.png?' + momenttz().unix();
                                    ProfileEmbed.setImage(profile_comedations_url);
                                    ProfileEmbed.addFields(
                                        { name: '\u200b', value: '**Лучшие достижения ' + DiscordUser.displayName + ':**' }
                                    );

                                    var ProfileLinkBtn = new ButtonBuilder()
                                    .setLabel('Смотреть профиль')
                                    .setURL(ProfileUri)
                                    .setStyle(ButtonStyle.Link);

                                    var ButtonsRow1 = new ActionRowBuilder()
                                    .addComponents(ProfileLinkBtn);

                                    interaction.reply({ embeds: [ProfileEmbed], components: [ButtonsRow1]});

                                } else {
                                    var ProfileLinkBtn = new ButtonBuilder()
                                    .setLabel('Смотреть профиль')
                                    .setURL(ProfileUri)
                                    .setStyle(ButtonStyle.Link);

                                    var ButtonsRow1 = new ActionRowBuilder()
                                    .addComponents(ProfileLinkBtn);

                                    interaction.reply({ embeds: [ProfileEmbed], components: [ButtonsRow1]});
                                }
                            });
                        });
                    }
                }
            });
        });
    }
};

getUserProfile = function (UserDiscordUid, callback) {
    let sql1 = `SELECT user_landing, user_discord_uid, user_name, ifnull(user_steam_uid,'') as user_steam_uid, ifnull(user_xbox_uid,'') as user_xbox_uid, user_timezone FROM users WHERE user_discord_uid = ? AND user_date_deleted IS NULL`;
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
    let sql2 = `SELECT COALESCE(SUM(dir_comedations.comedation_pp),0)  AS total_pp
                FROM user_comedations
                JOIN dir_comedations ON user_comedations.comedation_code = dir_comedations.comedation_code
                WHERE user_comedations.user_discord_uid = ?`;
    database.query(sql2, [UserDiscordUid], function (error, result) {
        if (error) {
            callback("[SYSTEM] DB ERROR: profile/countUserPowerPoints function error.", null);
        } else {
            callback(null, result[0].total_pp);
        }
    });
}

getUserRareComedations = function (UserDiscordUid, callback) {
    let sql3 = `SELECT dir_comedations.comedation_code
                FROM user_comedations
                JOIN dir_comedations ON user_comedations.comedation_code = dir_comedations.comedation_code
                WHERE user_comedations.user_discord_uid = ? AND dir_comedations.comedation_type = 'rare' ORDER BY user_comedations.date_created DESC LIMIT 4`;
    database.query(sql3, [UserDiscordUid], function (error, result) {
        if (error) {
            callback("profile/getUserRareComedations function error.", null);
        } else {
            callback(null, result);
        }
    });

}
