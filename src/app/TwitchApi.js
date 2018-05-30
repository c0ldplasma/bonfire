'use strict';

import TwitchConstants from './TwitchConstants.js';

/**
 * Twitch Api calls
 */
class TwitchApi {
    /**
     * Gets the data to every user in the users parameter
     * Calls the callback function with the JSON Data when request finished
     * @param {string} users comma seperated list with usernames
     * @param {object} context sets the Object 'this' is referring to in the callback function
     * @param {function} callback function(data) that gets called after the request finished
     */
    static getUsers(users, context, callback) {
        $.ajax({
            context: context,
            url: ('https://api.twitch.tv/kraken/getUsers?login='
                + users),
            headers: {
                'Accept': 'application/vnd.twitchtv.v5+json',
                'Client-ID': TwitchConstants.CLIENT_ID,
            },
            async: true,
        }).done(callback);
    }

    /**
     * Gets the data to the user the OAuth token is from
     * @param {object} context sets the Object 'this' is referring to in the callback function
     * @param {function} callback function(data) that gets called after the request finished
     */
    static getUserFromOAuth(context, callback) {
        $.ajax({
            context: this,
            url: ('https://api.twitch.tv/kraken'),
            headers: {
                'Accept': 'application/vnd.twitchtv.v5+json',
                'Client-ID': TwitchConstants.CLIENT_ID,
                'Authorization': ('OAuth ' + localStorage.accessToken),
            },
            async: false,
        }).done(callback);
    }
}
export default TwitchApi;
