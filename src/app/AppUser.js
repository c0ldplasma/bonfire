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
            console.log(data);
            if (typeof(data.login) !== 'undefined') {
                this.userName_ = data.login;
                // noinspection JSUnusedGlobalSymbols
                this.userNameLC_ = data.login.toLowerCase();
                // noinspection JSUnusedGlobalSymbols
                this.userId_ = data.user_id;
            } else {
                alert('Error while getting username');
            }
        });
    }
}
export default AppUser;
