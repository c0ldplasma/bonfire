/**
 * @param data.token.user_name
 * @param data.token.user_id
 */
'use strict';
import TwitchConstants from './TwitchConstants.js';
import TwitchApi from './TwitchApi.js';
/**
 * Represents the User of the chat client
 */
class AppUser {
    /**
     * @constructor
     */
    constructor() {
        /** @private */
        this.userName_ = '';
        // noinspection JSUnusedGlobalSymbols
        /** @private */
        this.userNameLC_ = '';
        // noinspection JSUnusedGlobalSymbols
        /** @private */
        this.userId_ = '';

        this.requestAppUserData();
    }

    /**
     * Getter
     * @return {string} this.userName_
     */
    getUserName() {
        return this.userName_;
    }
    /**
     * Getter
     * @return {string} this.userId_
     */
    getUserId() {
        return this.userId_;
    }

    /**
     * Sends an ajax request to twitch to receive userName_ and userId_ of the AppUser
     */
    requestAppUserData() {
        TwitchApi.getUserFromOAuth(this, function(data) {
            if (data.token.valid === false) {
                window.location.replace(TwitchConstants.AUTHORIZE_URL);
            } else if (typeof(data.token) !== 'undefined') {
                this.userName_ = data.token.user_name;
                // noinspection JSUnusedGlobalSymbols
                this.userNameLC_ = this.userName_.toLowerCase();
                // noinspection JSUnusedGlobalSymbols
                this.userId_ = data.token.user_id;
            } else {
                alert('Error while getting username');
            }
        });
    }
}
export default AppUser;
