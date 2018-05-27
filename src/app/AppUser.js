/**
 * @param data.token.user_name
 * @param data.token.user_id
 */
'use strict';
import TwitchConstants from './TwitchConstants.js';
/**
 * Represents the User of the chat client
 */
class AppUser {
    /**
     * @param {string} userName The Twitch username of the chat client user
     * @param {string} userId The Twitch user ID of the chat client user
     */
    constructor() {
        /** @private */
        this.userName_ = null;
        /** @private */
        this.userId_ = null;

        this.requestAppUserData();
    }

    /**
     * Sends an ajax request to twitch to receive userName_ and userId_ of the AppUser
     */
    requestAppUserData() {
        $.ajax({
            url: ('https://api.twitch.tv/kraken'),
            headers: {
                'Accept': 'application/vnd.twitchtv.v5+json',
                'Client-ID': TwitchConstants.CLIENT_ID,
                'Authorization': ('OAuth ' + localStorage.accessToken),
            },
            async: false,
        }).done(function(data) {
            if (data.token.valid === false) {
                window.location.replace(TwitchConstants.AUTHORIZE_URL);
            } else if (typeof(data.token) !== 'undefined') {
                this.userName_ = data.token.user_name;
                this.userId_ = data.token.user_id;
            } else {
                alert('Error while getting username');
            }
        });
    }
}
export default AppUser;
