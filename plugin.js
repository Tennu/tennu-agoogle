var promise = require('bluebird');
var google = require('./google');
var format = require('util').format;

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

        function handleSearch(IRCMessage) {
            return isAdmin(IRCMessage.hostmask, "google").then(function(isadmin) {

                if (!isadmin) {
                    client._logger.warn('Unauthorized host `' + IRCMessage.prefix + '` attempted command: `' + IRCMessage.message + '`');
                    return {
                        intent: 'notice',
                        query: true,
                        message: requiresAdminHelp
                    };
                }

                return google(IRCMessage.args.join(' '), limitResults).then(function(response) {
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