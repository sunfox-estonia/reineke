const { SlashCommandBuilder } = require('discord.js');
const config = require('../config.json');
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
                option.setName('comendation')
                    .setDescription('Код достижения')
                    .setRequired(true)
                    .addChoices(lists.comendations))
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
                    .addChoices(lists.gifts.shortlist))
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
                    checkComedation(DiscordUser.user.id,target_achievement,function(error,achievement_data){
                        if (error) {
                            interaction.reply({ content: error, ephemeral: true });
                        } else {
                            addComedation(DiscordUser.user.id, achievement_data,function(error){
                                if (error) {
                                    interaction.reply({ content: error, ephemeral: true });
                                } else {
                                    let embed_username = DiscordUser.nickname ?? DiscordUser.user.username;
                                    let embed_image = ( achievement_data.comedation_type  === "rare" ) ? config.url.resourcesUrl + "img/comedations/" + target_comedation_code + "png" : config.url.resourcesUrl + "img/comendations/default.png" ;
                                    let ProfileUri = config.url.commonUrl + "profile/";

                                    var achievement_embed = new EmbedBuilder()
                                        .setColor(config.colors.primaryDark)
                                        .setTitle(embed_username  + " получил новое достижение!")
                                        .setThumbnail(embed_image)
                                        .addFields(
                                            { name: ":white_check_mark: - " + achievement_data.comedation_title + " (" + achievement_data.comedation_pp + " очков)",
                                            value: achievement_data.comedation_description },
                                            { name: "\u200b", value:"\u200b" }
                                        )
                                        .setTimestamp()
                                        .setFooter({
                                            icon_url: config.ui.icon_url,
                                            text: config.ui.title
                                    });

                                    var achievement_button = new ButtonBuilder()
                                    .setLabel('Посмотреть достижения')
                                    .setURL(ProfileUri)
                                    .setStyle(ButtonStyle.Link);

                                    NotificationsChannel.send({content:`${embed_username}, смотри, что для Тебя есть:`, embeds: [achievement_embed], components: [achievement_button]});

                                    countComedationsPowerPoints(DiscordUser.user.id,function(error,total_pp){
                                        if (error) {
                                            callback("There was an error counting user powerpoints.");
                                            return;
                                        } else {
                                            BotLogChannel.send({ content: `ACHIEVEMENT ADDED: to user <@` + DiscordUser.user.id + `> - (` + achievement_data.comedation_code + `) ` + achievement_data.comedation_title + `\nUser user PowerPoints sum: ` + total_pp `\n`+ `Created by <@` + interaction.user.id + `>` });
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
            const target_uid = interaction.options.getUser('user').id;
            const target_uname = interaction.options.getUser('user').nickname ?? interaction.options.getUser('user').user.username;

            if (lists.gifts.longlist.hasOwnProperty(gift)) {
                const giftData = lists.gifts.longlist[gift];

                let sql6 = "INSERT INTO user_gifts (user_discord_uid, gift_code, gift_title, gift_description, gift_key) VALUES (?,?,?,?,?);";
                database.query(sql6, [target_uid, gift, giftData.title, giftData.description, key], (error6, pingback) => {
                    if (error6) {
                        interaction.reply({ content: "Ошибка при добавлении подарка в базу данных.", ephemeral: true });
                        BotLogChannel.send({ content: `ERROR: Can't add gift (code: ` + gift + `) for user <@` + target_uid + `> to database. Created by: <@` + interaction.user.id + `>` });
                        return;
                    } else {
                        let ProfileUri = config.url.commonUrl + "profile/" + user_profile.user_discord_uid;

                        var gift_embed = new EmbedBuilder()
                            .setColor(config.colors.primaryDark)
                            .setTitle(target_uname  + " ждет подарок:\n" + giftData.title)
                            .setDescription("Чтобы получить подарок, воспользуйся кодом и инструкцией, доступной на странице Твоего профиля.")
                            .setThumbnail(config.url.resourcesUrl + "img/gifts/" + gift + ".png")
                            .setTimestamp()
                            .setFooter({
                                icon_url: config.ui.icon_url,
                                text: config.ui.title
                        });

                        const gift_button = new ButtonBuilder()
                        .setLabel('Забрать подарок')
                        .setURL(ProfileUri)
                        .setStyle(ButtonStyle.Link);

                        NotificationsChannel.send({content:`${DiscordUser.user}, смотри, что для Тебя есть:`, embeds: [gift_embed], components: [gift_button]});

                        interaction.reply({ content: "Подарок успешно добавлен в базу данных.", ephemeral: true });
                        BotLogChannel.send({ content: `GIFT ADDED: to user <@` + target_uid + `> - (` + gift + `) ` + giftData.title + `\nCreated by <@` + interaction.user.id + `>` });
                    }
                });
            } else {
                interaction.reply({ content: "Невозможно выдать указанный код.", ephemeral: true });
                BotLogChannel.send({ content: `ERROR: Can't get gift data for the code ` + gift + `. Runned by: <@` + interaction.user.id + `>` });
                return;
            }
        }
    }
};

checkComedation = function(user_discord_uid, comedation_code, callback) {
    // Check thе achievement exists and is available for user level
    let sql2 = "SELECT * FROM dir_comedations WHERE commendation_code = ?;";
    database.query(sql2, [comedation_code], (error2, comedation_fulldata, fields) => {
        if (error2) {
            callback("Database error.",null);
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
                callback("Database error.",null);
                return;
            }
            if (check_added[0].rowscount > 0){
                callback("This comedation is already added for selected user.",null);
                return;
            }
            callback(null,comedation_fulldata[0]);
        });
    });
// checkAchievement ended
}

addComedation = function(user_discord_uid, comedation_data, callback) {
	// Add achivement for user
	let sql4 = "INSERT INTO user_comedations (user_discord_uid, comedation_code) VALUES (?,?);";
    database.query(sql4, [user_discord_uid,comedation_data.comedation_code], (error4, pingback) => {
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
