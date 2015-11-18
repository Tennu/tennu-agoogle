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

        const requiresAdminHelp = "Requires admin privileges.";
        const googleRequestFailed = 'Failed to fetch results from Google.';

        var googleConfig = client.config("agoogle");

        // Confirm config values are present
        if (!googleConfig || !googleConfig.hasOwnProperty('limitResults') || !googleConfig.hasOwnProperty('maxUserDefinedLimit')) {
            throw Error('tennu-agoogle: is missing some or all of its configuration.');
        }

        var isAdmin = imports.admin.isAdmin;
        const adminCooldown = client._plugins.getRole("cooldown");
        if (adminCooldown) {
            var cooldown = googleConfig['cooldown'];
            if (!cooldown) {
                client._logger.warn('tennu-google: Cooldown plugin found but no cooldown defined.');
            }
            else {
                isAdmin = adminCooldown(cooldown);
                client._logger.notice('tennu-agoogle: cooldowns enabled: ' + cooldown + ' seconds.');
            }
        }

        var limitResults = googleConfig.limitResults;
        var maxUserDefinedLimit = googleConfig.maxUserDefinedLimit;

        // Validate config values
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
            return isAdmin(IRCMessage.hostmask).then(function(isadmin) {

                    // isAdmin will be "undefined" if cooldown system is enabled
                    // isAdmin will be true/false if cooldown system is disabled
                    if (typeof(isAdmin) !== "undefined" && isAdmin === false) {
                        throw new Error(requiresAdminHelp);
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

                    }).catch(function(err) {
                        client._logger.error(googleRequestFailed);
                        client._logger.error(err);
                        return {
                            intent: 'notice',
                            query: true,
                            message: googleRequestFailed
                        };
                    });

                }).catch(adminFail);
        };

        function adminFail(err) {
            return {
                intent: 'notice',
                query: true,
                message: err
            };
        }

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