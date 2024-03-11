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
			.setName('comendation')
			.setDescription('Добавить достижение участнику')
			.addUserOption(option =>
                option.setName('user')
                .setDescription('Имя пользователя')
                .setRequired(true))
            .addStringOption(option =>
                option.setName('comendation')
                    .setDescription('Достижение')
                    .setRequired(true)
                    .addChoices(lists.comendations))
    )
	.addSubcommand(subcommand =>
		subcommand
			.setName('service')
			.setDescription('Добавить сервис участнику')
			.addUserOption(option =>
                option.setName('user')
                .setDescription('Имя пользователя')
                .setRequired(true))
            .addStringOption(option =>
                option.setName('service')
                    .setDescription('Сервис')
                    .setRequired(true)
                    .addChoices(lists.services)),
    ),
                
    async execute(interaction) {
        const NotificationsChannel = interaction.client.channels.cache.get(config.log_channels.notifictions);
        const BotLogChannel = interaction.client.channels.cache.get(config.log_channels.log);
        if (interaction.options.getSubcommand() === 'comendation') {
        /*
        * Add selected commendation to user profile.
        */
            const target_user = interaction.options.getUser('user');
            const target_comendation_code = interaction.options.getString('comendation');
    
            await interaction.guild.members.fetch(target_user).then(
                DiscordUser => {
                    getComendationsProfile(DiscordUser.user.id,function(error,user_profile){
                        if (error) {
                            interaction.reply({ content: error, ephemeral: true });	
                            BotLogChannel.send({ content: `ERROR: Can't get User comendations profile for <@` + DiscordUser.user.id + `>` });
                        } else {
                            checkComendation(user_profile,target_achievement,function(error,achievement_data){
                                if (error) {
                                    interaction.reply({ content: error, ephemeral: true });
                                } else {		
                                    addComendation(user_profile, achievement_data,function(error){
                                        if (error) {
                                            interaction.reply({ content: error, ephemeral: true });
                                        } else {		
                                            let embed_username = DiscordUser.nickname ?? DiscordUser.user.username;
                                            let embed_image = ( achievement_data.commendation_image === true ) ? config.url.resourcesUrl + "img/bot/comendations/" + target_comendation_code + "png" : config.url.resourcesUrl + "img/bot/alert_scroll.png" ;
                                            let ProfileUri = config.url.commonUrl + "profile/" + user_profile.user_discord_uid;

                                            var achievement_embed = new EmbedBuilder()
                                                .setColor(config.colors.primaryDark)
                                                .setTitle(embed_username  + " получил новое достижение!")
                                                .setThumbnail(embed_image)
                                                .addFields(
                                                    { name: ":ballot_box_with_check: - " + achievement_data.commendation_title + " (" + achievement_data.commendation_pp + " очков)",
                                                    value: achievement_data.commendation_description },
                                                    { name: "\u200b", value:"\u200b" }
                                                )
                                                .setTimestamp()
                                                .setFooter({ 
                                                    icon_url: config.ui.icon_url,
                                                    text: config.ui.title
                                            });

                                            const component_buttons = new ButtonBuilder()
                                            .setLabel('Посмотреть достижения')
                                            .setURL(ProfileUri)
                                            .setStyle(ButtonStyle.Link);
                                
                                            NotificationsChannel.send({content:`${DiscordUser.user}, для тебя весть от Рейнеке:`, embeds: [achievement_embed], components: [component_buttons]});		
                                            
                                            countComendationsPowerPoints(user_profile.user_discord_uid,function(error,total_pp){
                                                if (error) {
                                                    callback("There was an error counting user powerpoints.");
                                                    return;
                                                } else {
                                                    BotLogChannel.send({ content: `ACHIEVEMENT ADDED: to user <@` + user_profile.user_discord_uid + `> - (` + commendation_data.commendation_code + `) ` + commendation_data.commendation_title + `\nUser user PowerPoints sum: ` + total_pp `\n`+ `Given by <@` + interaction.user.id + `>` });
                                                }
                                            });
                                        }	
                                    });								
                                }	
                            });
                        }
                    });
                }
            );	
        } else if (interaction.options.getSubcommand() === 'service') {
        /*
        * Open modal to add a service for selected user.
        */
            const target_user = interaction.options.getUser('user');
            const target_service_code = interaction.options.getString('service');

            if (target_service_code.startsWith("1")) {
                /* VPN service form
                 * Open modal to add a service for selected user.
                 * Paste .ovpn file content to the service_data field.
                 * In case if service is already added to user profile,
                 * it will be replaced in a Database.
                 */
                await interaction.guild.members.fetch(target_user).then(
                    DiscordUser => {
                        switch (target_service_code) {
                            case "101":
                                var target_service_name = "US.vpn.snfx.ee";
                                break;
                            case "102":
                                var target_service_name = "EE.vpn.snfx.ee";
                                break;
                            default:
                                break;
                        }

                        var modal_form = {
                            "title": "Добавить сервис: " + target_service_name,
                            "custom_id": "service_add_vpn",
                            "components": [
                                {
                                    "type": 1,
                                    "components": [{
                                        "type": 4,
                                        "custom_id": "service_user_id",
                                        "label": "Discord ID пользователя:",
                                        "style": 1,
                                        "min_length": 1,
                                        "max_length": 256,
                                        "value": DiscordUser.id,
                                        "required": true,
                                    }]
                                },
                                {
                                    "type": 1,
                                    "components": [{
                                        "type": 4,
                                        "custom_id": "service_code",
                                        "label": "Код сервиса:",
                                        "style": 1,
                                        "min_length": 1,
                                        "max_length": 256,
                                        "value": target_service_code,
                                        "required": true
                                    }]
                                },
                                {
                                    "type": 1,
                                    "components": [{
                                    "type": 4,
                                    "custom_id": "service_data",
                                    "label": "Данные для доступа:",
                                    "style": 2,
                                    "min_length": 1,
                                    "max_length": 2000,
                                    "required": true
                                    }]
                                },
                            ]
                        }
                        interaction.showModal(modal_form);	
                    });
            } else if (target_service_code === "999"){
                /* Bifrost Connect service form
                *  Open modal to add a service for selected user.
                *  In case if Steam ID is already added to user profile, 
                *  it will be replaced in a Database.
                */
                await interaction.guild.members.fetch(target_user).then(
                    DiscordUser => {
                        var modal_form = {
                            "title": "Добавить сервис: Bifrost Connect",
                            "custom_id": "service_add_bifrost",
                            "components": [
                                {
                                    "type": 1,
                                    "components": [{
                                        "type": 4,
                                        "custom_id": "service_user_id",
                                        "label": "Discord ID пользователя:",
                                        "style": 1,
                                        "min_length": 1,
                                        "max_length": 256,
                                        "value": DiscordUser.id,
                                        "required": true,
                                    }]
                                },
                                {
                                    "type": 1,
                                    "components": [{
                                        "type": 4,
                                        "custom_id": "service_code",
                                        "label": "Код сервиса:",
                                        "style": 1,
                                        "min_length": 1,
                                        "max_length": 256,
                                        "value": target_service_code,
                                        "required": true
                                    }]
                                },
                                {
                                    "type": 1,
                                    "components": [{
                                        "type": 4,
                                        "custom_id": "service_user_steam_id",
                                        "label": "Steam ID пользователя:",
                                        "style": 1,
                                        "min_length": 1,
                                        "max_length": 256,
                                        "value": target_service_code,
                                        "required": true
                                    }]
                                }
                            ]
                        }
                        interaction.showModal(modal_form);	
                    });
            } else {
                interaction.reply({ content: "This service is not available.", ephemeral: true });
            }
        }
    },
};

getComendationsProfile = function(discord_uid, callback) {
	let sql1 = "SELECT users.user_id, users.user_discord_uid FROM users WHERE users.user_discord_uid = ? LIMIT 1;";   
	database.query(sql1, [discord_uid], (error1, results, fields) => {
		if (error1) {
			callback("Database error.",null);
			return;
		}
		if (results.length == 0 || results.length > 1){
			callback("User profile doesn't exists.",null);
			return;
		}
		callback(null,results[0]);
	});
// getProfile closed
}

checkComendation = function(user_data, comendation_code, callback) {
    // Check thе achievement exists and is available for user level
    let sql2 = "SELECT * FROM dir_comedations WHERE commendation_code = ?;";
    database.query(sql2, [comendation_code], (error2, commendation_fulldata, fields) => {
        if (error2) {
            callback("Database error.",null);
            return;
        }
        if (commendation_fulldata.length != 1){
            callback("Achievement doesn't added to database.",null);
            return;
        }
        // Check if achivement is already added for selected user
        let sql3 = "SELECT count(*) AS rowscount FROM user_commendations WHERE user_discord_uid = ? AND commendation_code = ?;";
        database.query(sql3, [user_data.user_discord_uid,comendation_code], (error3, check_added, fields) => {
            if (error3) {
                callback("Database error.",null);
                return;
            }
            if (check_added[0].rowscount > 0){
                callback("This comendation is already added for selected user.",null);
                return;
            }
            callback(null,commendation_fulldata[0]);	
        });						
    });		
// checkAchievement ended
}

addComendation = function(user_data, commendation_data, callback) {
	// Add achivement for user
	let sql4 = "INSERT INTO user_commendations (user_discord_uid, commendation_code) VALUES (?,?);";
    database.query(sql4, [user_data.user_discord_uid,commendation_data.commendation_code], (error4, pingback) => {
        if (error4) {
            callback("There was an error adding comendation to user profile.");
            return;
        } else {
            callback(null);
		}
    }); 
// addAchievement ended
}

countComendationsPowerPoints = function(discord_uid, callback) {
    let sql5 = "SELECT SUM(dir_comedations.commendation_pp) AS total_pp FROM user_commendations LEFT JOIN dir_comedations ON user_commendations.commendation_code = dir_comedations.commendation_code WHERE user_commendations.user_discord_uid = ?;";
    database.query(sql5, [discord_uid], (error5, total_pp, fields) => {
        if (error5) {
            callback("Database error.",null);
            return;
        }
        callback(null,total_pp[0].total_pp);
    });
// countComendationsPowerPoints ended
}