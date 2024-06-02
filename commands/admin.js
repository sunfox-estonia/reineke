const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const config = require('../config.json');
const fs = require('node:fs');
const lists = require('../config.lists.json');
const mysql = require('mysql');
const database = mysql.createConnection({
    host: config.db_config.host,
    user: config.db_config.dbuser,
    password: config.db_config.dbpass,
    database: config.db_config.dbname,
    debug: false,
    multipleStatements: true,
});
const { createCanvas, loadImage } = require('canvas');

module.exports = {
    data: new SlashCommandBuilder()
	.setName('admin')
	.setDescription('Административные команды')
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
	.addSubcommand(subcommand =>
		subcommand
			.setName('pp')
			.setDescription('Добавить достижение участнику')
			.addUserOption(option =>
                option.setName('user')
                .setDescription('Пользователь')
                .setRequired(true))
            .addStringOption(option =>
                option.setName('comedation')
                    .setDescription('Код достижения')
                    .setRequired(true)
                    .addChoices(...lists.comedations)),
    )
	.addSubcommand(subcommand =>
		subcommand
			.setName('gift')
			.setDescription('Передать подарочный код участнику')
			.addUserOption(option =>
                option.setName('user')
                    .setDescription('Пользователь')
                    .setRequired(true))
            .addStringOption(option =>
                option.setName('gift_code')
                    .setDescription('Наименование подарка')
                    .setRequired(true)
                    .addChoices(...lists.gifts.shortlist))
            .addStringOption(option =>
                option.setName('gift_key')
                    .setDescription('Подарочный ключ')
                    .setRequired(true)),
    ),

    async execute(interaction) {
        const NotificationsChannel = interaction.client.channels.cache.get(config.log_channels.notifictions);
        const BotLogChannel = interaction.client.channels.cache.get(config.log_channels.log);

        if (interaction.options.getSubcommand() === 'pp') {
        /*
        * Add selected commendation to user profile.
        */
            const target_user = interaction.options.getUser('user');
            const target_comedation_code = interaction.options.getString('comedation');

            await interaction.guild.members.fetch(target_user).then(
                DiscordUser => {
                    checkComedation(DiscordUser.user.id,target_comedation_code,function(error,dataset1){
                        if (error) {
                            interaction.reply({ content: error, ephemeral: true });
                        } else {
                            addComedation(DiscordUser.user.id, target_comedation_code,function(error){
                                if (error) {
                                    interaction.reply({ content: error, ephemeral: true });
                                } else {
                                    var achievement_data = JSON.parse(JSON.stringify(dataset1));

                                    let embed_username = DiscordUser.nickname ?? DiscordUser.user.username;
                                    let embed_image = ( achievement_data.comedation_type  === "rare" ) ? config.url.resourcesUrl + "img/comedations/" + target_comedation_code + ".png" : config.url.resourcesUrl + "img/comedations/default.png";
                                    let ProfileUri = config.url.commonUrl + "profile/";

                                    var achievement_embed = new EmbedBuilder()
                                        .setColor(config.colors.primaryDark)
                                        .setTitle(embed_username  + " получил новое достижение!")
                                        .setThumbnail(embed_image)
                                        .addFields(
                                            { name: ":white_check_mark: - " + achievement_data.comedation_title + " (+" + achievement_data.comedation_pp + " pp)",
                                            value: achievement_data.comedation_description },
                                            { name: "\u200b", value:"\u200b" }
                                        )
                                        .setTimestamp()
                                        .setFooter({
                                            icon_url: config.ui.icon_url,
                                            text: config.ui.title
                                    });

                                    var ComedationsLinkBtn = new ButtonBuilder()
                                    .setLabel('Посмотреть достижения')
                                    .setURL(ProfileUri)
                                    .setStyle(ButtonStyle.Link);

                                    var ButtonsRow1 = new ActionRowBuilder()
                                    .addComponents(ComedationsLinkBtn);

                                    NotificationsChannel.send({content:`— <@` + DiscordUser.user.id + `>, смотри, что для Тебя есть:`, embeds: [achievement_embed], components: [ButtonsRow1]});

                                    countComedationsPowerPoints(DiscordUser.user.id,function(error,dataset2){
                                        if (error) {
                                            interaction.reply({ content: '— Возникла ошибка при подсчете pp!', ephemeral: true });
                                        } else {
                                            var total_pp = JSON.parse(JSON.stringify(dataset2));
                                            BotLogChannel.send({ content: `ACHIEVEMENT ADDED: to user <@` + DiscordUser.user.id + `> - (` + achievement_data.comedation_code + `) ` + achievement_data.comedation_title + `\nUser user PowerPoints sum: ` + total_pp + `\n`+ `Created by <@` + interaction.user.id + `>` });
                                        }
                                    });

                                    updateUserRareComedations(DiscordUser.user.id, function (error, dataset2) {
                                        if (error) {

                                        } else if (dataset2.length > 0) {
                                            /* Step 4
                                            * Get numbers stored in rare_comedations array and generate new image
                                            * using merge-images library by combining all comedations-related images
                                            * into one.
                                            */
                                            var user_rare_comedations = JSON.parse(JSON.stringify(dataset2));

                                            var canvas = createCanvas(800, 295);
                                            if (user_rare_comedations.length > 2) {
                                                canvas = createCanvas(800, 600);
                                            }
                                            const ctx = canvas.getContext('2d');
                                            const profile_comedations_filename = 'p_c_' + DiscordUser.user.id + '.png';


                                            var img1 = user_rare_comedations[0].comedation_code + "_profile.png";
                                            var img2 = user_rare_comedations.length > 1 ? user_rare_comedations[1].comedation_code + "_profile.png" : "placeholder.png";
                                            var img3 = user_rare_comedations.length > 2 ? user_rare_comedations[2].comedation_code + "_profile.png" : "placeholder.png";
                                            var img4 = user_rare_comedations.length > 3 ? user_rare_comedations[3].comedation_code + "_profile.png" : "placeholder.png";

                                            var img1_url = config.url.resourcesUrl + "img/comedations/" + img1;
                                            var img2_url = config.url.resourcesUrl + "img/comedations/" + img2;
                                            var img3_url = config.url.resourcesUrl + "img/comedations/" + img3;
                                            var img4_url = config.url.resourcesUrl + "img/comedations/" + img4;

                                            loadImage(img1_url).then((image) => {
                                                ctx.drawImage(image, 0, 0, 395, 295);
                                                loadImage(img2_url).then((image) => {
                                                    ctx.drawImage(image, 405, 0, 395, 295);
                                                    loadImage(img3_url).then((image) => {
                                                        ctx.drawImage(image, 0, 305, 395, 295);
                                                        loadImage(img4_url).then((image) => {
                                                            ctx.drawImage(image, 405, 305, 395, 295);
                                                            var out = fs.createWriteStream(config.buffer.images.path + profile_comedations_filename);
                                                            var stream = canvas.createPNGStream();
                                                            stream.pipe(out);
                                                            out.on('finish', () => {
                                                                // interaction.reply({ content: '— Добавил достижение указанному пользователю!', ephemeral: true });
                                                            });
                                                        })
                                                    })
                                                })
                                            });
                                        } else {
                                            // interaction.reply({ content: '— Добавил достижение указанному пользователю!', ephemeral: true });
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            );
        } else if (interaction.options.getSubcommand() === 'gift') {
            /* Step 1.
             * Get selected gift data from the lists.gifts.longlist and add it into to DB
             */

            const gift = interaction.options.getString('gift_code');
            const key = interaction.options.getString('gift_key');
            const target_user = interaction.options.getUser('user').id;

            await interaction.guild.members.fetch(target_user).then(
                DiscordUser => {
                    if (lists.gifts.longlist.hasOwnProperty(gift)) {
                        const giftData = lists.gifts.longlist[gift];

                        let sql6 = "INSERT INTO user_gifts (user_discord_uid, gift_code, gift_title, gift_description, gift_key) VALUES (?,?,?,?,?);";
                        database.query(sql6, [DiscordUser.user.id, gift, giftData.title, giftData.description, key], (error, pingback) => {
                            if (error) {
                                interaction.reply({ content: "Ошибка при добавлении подарка в базу данных.", ephemeral: true });
                                BotLogChannel.send({ content: `ERROR: Can't add gift (code: ` + gift + `) for user <@` + DiscordUser.user.id + `> to database. Created by: <@` + interaction.user.id + `>` });
                                return;
                            } else {
                                let embed_username = DiscordUser.nickname ?? DiscordUser.user.username;
                                let ProfileUri = config.url.commonUrl + "profile/";
                                var gift_embed = new EmbedBuilder()
                                    .setColor(config.colors.primaryDark)
                                    .setTitle(embed_username  + ", тебя ждет подарок:\n" + giftData.title)
                                    .setDescription("Чтобы получить подарок, воспользуйся кодом и инструкцией, доступной на странице Твоего профиля.")
                                    .setThumbnail(config.url.resourcesUrl + "img/alerts/alert_gift.png")
                                    .setTimestamp()
                                    .setFooter({
                                        icon_url: config.ui.icon_url,
                                        text: config.ui.title
                                });

                                var GiftLinkBtn = new ButtonBuilder()
                                .setLabel('Смотреть подарки')
                                .setURL(ProfileUri)
                                .setStyle(ButtonStyle.Link);

                                var ButtonsRow2 = new ActionRowBuilder()
                                .addComponents(GiftLinkBtn);

                                NotificationsChannel.send({content:`— <@` + DiscordUser.user.id + `>, смотри, что для Тебя есть:`, embeds: [gift_embed], components: [ButtonsRow2]});
                                BotLogChannel.send({ content: `GIFT ADDED: to user <@` + DiscordUser.user.id + `> - (` + gift + `) ` + giftData.title + `\nCreated by <@` + interaction.user.id + `>` });
                                interaction.reply({ content: '— Добавил подарок указанному пользователю!', ephemeral: true });
                            }
                        });
                    } else {
                        interaction.reply({ content: "— Не могу выдать подарок указанному пользователю!", ephemeral: true });
                        BotLogChannel.send({ content: `ERROR: Can't get gift data for the code ` + gift + `. Runned by: <@` + interaction.user.id + `>` });
                    }
                });
        }
    }
};

checkComedation = function(user_discord_uid, comedation_code, callback) {
    // Check thе achievement exists and is available for user level
    let sql2 = "SELECT * FROM dir_comedations WHERE comedation_code = ? LIMIT 1;";
    database.query(sql2, [comedation_code], (error2, comedation_fulldata, fields) => {
        if (error2) {
            callback("Database error on achievement selection.",null);
            return;
        }
        if (comedation_fulldata.length != 1){
            callback("Achievement doesn't added to database.",null);
            return;
        }
        // Check if achivement is already added for selected user
        let sql3 = "SELECT count(*) AS rowscount FROM user_comedations WHERE user_discord_uid = ? AND comedation_code = ?;";
        database.query(sql3, [user_discord_uid,comedation_code], (error3, check_added, fields) => {
            if (error3) {
                callback("Database error on achievement check.",null);
                return;
            }
            if (check_added[0].rowscount > 0){
                callback("— Это достижение уже добавлено для выбранного пользователя.",null);
                return;
            }
            callback(null,comedation_fulldata[0]);
        });
    });
// checkAchievement ended
}

addComedation = function(user_discord_uid, comedation_code, callback) {
	// Add achivement for user
	let sql4 = "INSERT INTO user_comedations (user_discord_uid, comedation_code) VALUES (?,?);";
    database.query(sql4, [user_discord_uid,comedation_code], (error4, pingback) => {
        if (error4) {
            callback("There was an error adding comendation to user profile.");
            return;
        } else {
            callback(null);
		}
    });
// addAchievement ended
}

countComedationsPowerPoints = function(discord_uid, callback) {
    let sql5 = "SELECT SUM(dir_comedations.comedation_pp) AS total_pp FROM user_comedations LEFT JOIN dir_comedations ON user_comedations.comedation_code = dir_comedations.comedation_code WHERE user_comedations.user_discord_uid = ?;";
    database.query(sql5, [discord_uid], (error5, total_pp, fields) => {
        if (error5) {
            callback("Database error.",null);
            return;
        }
        callback(null,total_pp[0].total_pp);
    });
// countComendationsPowerPoints ended
}

updateUserRareComedations = function (UserDiscordUid, callback) {
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
// getUserRareComedations ended
}
