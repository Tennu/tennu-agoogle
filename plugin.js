var parseArgs = require('minimist');
var format = require('util').format;
var google = require('./google');

// Will not change if 2 instances of tennu launched
const helps = {
    "google": [
        "{{!}}google <query>",
        "Search google from IRC."
    ]
};

var TennuGoogle = {
    requiresRoles: ["admin"],
    init: function(client, imports) {

        const adminCooldown = client._plugins.getRole("admin-cooldown");

        const requiresAdminHelp = "Requires admin privileges.";
        const googleRequestFailed = 'Failed to fetch results from Google.';

        var isAdmin = imports.admin.isAdmin;
        if (adminCooldown) {
            var cooldown = client.config("google")['cooldown'];
            if (!cooldown) {
                client._logger.warn('tennu-google: Cooldown plugin found but no cooldown defined.')
            }
            else {
                isAdmin = adminCooldown.isAdmin;
            }
        }

        var limitResults = client.config("google").limitResults;
        var maxUserDefinedLimit = client.config("google").maxUserDefinedLimit;

        // Validate config
        if (maxUserDefinedLimit < 1 || maxUserDefinedLimit > 8) {
            client._logger.warn(format('tennu-agoogle: maxUserDefinedLimit must be between 1 and 8. Caugfht "%s" Defaulting to 1.', maxUserDefinedLimit));
            maxUserDefinedLimit = 1;
        }

        if (limitResults < 1 || limitResults > 8) {
            client._logger.warn(format('tennu-agoogle: limitResults must be between 1 and 8. Caugfht "%s" Defaulting to 1.', limitResults));
            limitResults = 1;
        }

        var minimistConfig = {
            string: ['limit'],
            default: {
                limit: limitResults
            },
            alias: {
                'limit': ['l'],
            }
        };

        function handleSearch(IRCMessage) {
            return isAdmin(IRCMessage.hostmask, "google").then(function(isadmin) {

                if (!isadmin) {
                    client._logger.warn('tennu-agoogle: Unauthorized host `' + IRCMessage.prefix + '` attempted command: `' + IRCMessage.message + '`');
                    return {
                        intent: 'notice',
                        query: true,
                        message: requiresAdminHelp
                    };
                }

                // Its important to note, the default minimist values are set via the config.
                // Otherwise, changing limitResults would persist.
                var sayArgs = parseArgs(IRCMessage.args, minimistConfig);

                if (sayArgs.limit) {
                    var limit = parseInt(sayArgs.limit);
                    if (limit !== "NaN" && limit > 0 && limit <= maxUserDefinedLimit) {
                        limitResults = sayArgs.limit;
                    }
                    else {
                        return {
                            intent: "notice",
                            query: true,
                            message: format('%s is not valid. Please pass in 1-%s.', sayArgs.limit, maxUserDefinedLimit)
                        };
                    }
                }

                return google(sayArgs._.join(' '), limitResults).then(function(response) {

                    if (!response.responseData.results.length) {
                        return 'No results.';
                    }

                    var results = response.responseData.results.slice(0, limitResults);
                    return results.map(function(result) {
                        return format('%s - %s', result.titleNoFormatting, result.unescapedUrl);
                    });

                })

            }).catch(function(err) {
                client._logger.error(googleRequestFailed);
                client._logger.error(err);
                return {
                    intent: 'notice',
                    query: true,
                    message: googleRequestFailed
                };
            });
        };

        return {
            handlers: {
                "!google": handleSearch,
            },
            commands: ["google"],
            help: {
                "google": helps.google
            }
        };

    }
};

module.exports = TennuGoogle;