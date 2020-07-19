'use strict';

import TwitchConstants from './TwitchConstants';

/**
 * Twitch Api calls
 */
class TwitchApi {
    /**
     * Gets the data to every user in the users parameter
     * Calls the callback function with the JSON Data when request finished
     * @param {string} users comma separated list with usernames
     * @param {object} context sets the Object 'this' is referring to in the callback function
     * @param {function} callback function(data) that gets called after the request finished
     */
    static getUsers(users, context, callback) {
        $.ajax({
            context: context,
            url: ('https://api.twitch.tv/helix/users'),
            dataType: 'json',
            headers: {
                'Client-ID': TwitchConstants.CLIENT_ID,
                'Authorization': ('Bearer ' + localStorage.accessToken),
            },
            data: {login: users},
            async: true,
        }).done(callback).fail(function(jqXHR, textStatus) {
            console.log("Request failed: " + textStatus)
            console.log(jqXHR);
        });
    }

    /**
     * Gets the data to the user the OAuth token is from
     * @return {data}
     */
    static async getUserFromOAuth() {
        return await $.ajax({
            statusCode: {
                401: function() {
                    window.location.replace(TwitchConstants.AUTHORIZE_URL);
                },
            },
            url: ('https://id.twitch.tv/oauth2/validate'),
            dataType: 'json',
            headers: {
                'Authorization': ('OAuth ' + localStorage.accessToken),
            },
        });
    }

    /**
     * Gets the names of all chatters in the specified chat
     * @param {string} chatName name of the chat
     * @param {object} context sets the Object 'this' is referring to in the callback function
     * @param {function} callback function(data) that gets called after the request finished
     */
    static getChatterList(chatName, context, callback) {
        $.ajax({
            context: context,
            url: ('https://tmi.twitch.tv/group/user/' + chatName
                + '/chatters'),
            headers: {'Accept': 'application/vnd.twitchtv.v5+json'},
            dataType: 'jsonp',
            async: true,
        }).done(callback);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Gets recent messages from the specified chat
     * @param {string} chatName
     * @param {object} context sets the Object 'this' is referring to in the callback function
     * @param {function} callback function(data) that gets called after the request finished
     */
    static getRecentMessages(chatName, context, callback) {
        // Download recent messages
        $.ajax({
            context: context,
            type: 'GET',
            url: ('https://recent-messages.robotty.de/api/v2/recent-messages/' + chatName),
            async: true,
        }).done(callback);
    }
}

export default TwitchApi;
