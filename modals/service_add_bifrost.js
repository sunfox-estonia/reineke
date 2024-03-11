//const {} = require('discord.js');
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
    data: {
        name: 'service_add_bifrost'
    },
    async execute(interaction) {
        const BotLogChannel = interaction.client.channels.cache.get(config.log_channels.log);
        const user_discord_id = interaction.fields.getTextInputValue('service_user_id');
        const user_steam_id = interaction.fields.getTextInputValue('service_user_steam_id');

        checkBifrost(user_discord_id, function(error, result) {
            if (error) {
                interaction.reply({ content: error, ephemeral: true });
                return;
            } else {
                if (result == TRUE) {
                    rewriteBifrost(user_discord_id, user_steam_id, function(error) {
                        if (error) {
                            interaction.reply({ content: error, ephemeral: true });
                            return;
                        } else {
                            interaction.reply({ content: 'Steam ID updated successfully for user <@` + user_discord_id + `>..', ephemeral: true });
                            BotLogChannel.send({ content: `[ADMIN] BIFROST: <@` + DiscordUser.user.id + `> Steam ID has been UPDATED by ${interaction.user.tag}.` });
                            return;
                        }
                    });
                } else {
                    writeBifrost(user_steam_id, user_discord_id, function(error) {
                        if (error) {
                            interaction.reply({ content: error, ephemeral: true });
                            return;
                        } else {
                            interaction.reply({ content: `Steam ID added successfully for user <@` + user_discord_id + `>.`, ephemeral: true });
                            BotLogChannel.send({ content: `[ADMIN] BIFROST: <@` + DiscordUser.user.id + `> Steam ID has been ADDED by ${interaction.user.tag}.` });
                            return;
                        }
                    });
                }
            }
        });
    }
}

writeBifrost = function(UserSteamUid, UserDiscordUid, callback) {
	let sql1 = "UPDATE users SET user_steam_uid = ?, user_date_updated = now() WHERE user_discord_uid = ?;";
    database.query(sql1, [UserSteamUid,UserDiscordUid], (error1, pingback) => {
        if (error1) {
            callback("Can't write steam ID for selected user.");
            return;
	    } else {
			callback(null);
	    }
    }); 
// writeBifrost ended
}

rewriteBifrost = function(UserDiscordUid, UserSteamUid, callback) {
	let sql2 = "UPDATE users SET user_steam_uid = ?, user_date_updated = now() WHERE user_discord_uid = ?;"; 
    database.query(sql2, [UserSteamUid,UserDiscordUid], (error2, pingback) => {
        if (error2) {
            callback("Can't update Steam ID for selected user.");
            return;
	    } else {
			callback(null);
	    }
    }); 
// rewriteBifrost ended
}

checkBifrost = function (UserDiscordUid, callback) {
	let sql3 = "SELECT count(*) AS rowscount FROM users WHERE user_discord_uid = ?;";
    let sql4 = "SELECT count(*) AS rowscount FROM users WHERE user_discord_uid = ? AND user_steam_uid IS NOT NULL;";
	database.query(sql3, [UserDiscordUid], (error3, users_count, fields) => {
		if (error3) {
			callback("Database error.",null);
			return;
		} else {
            if (users_count[0].rowscount != 0) {
                database.query(sql4, [UserDiscordUid], (error4, steam_count, fields) => {
                    if (error4) {
                        callback("Database error.",null);
                        return;
                    } else {
                        if (steam_count[0].rowscount != 0) {
                            callback(null,TRUE);
                            return;
                        } else {
                            callback(null,FALSE);
                            return;
                        }
                    }
                });
            } else {
                callback("User not found in a Database, can't assign Steam ID.",null);
                return;
            }
		}
	});
	// existsBifrost closed
}