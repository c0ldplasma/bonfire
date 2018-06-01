'use strict';

/**
 * Twitch constants like CLIENT_ID and API-URLs
 */
class TwitchConstants {
    /**
     * @return {string} Client Id for authorization on the Twitch apis
     * @constructor
     */
    static get CLIENT_ID() {
        return 'xllef7inid2mbeqoaj2o6bsohg7pz7';
    }

    /**
     * @return {string} Scope needed for the app (for requesting an access token)
     * @constructor
     */
    static get PERMISSION_SCOPE() {
        return 'chat_login+user_blocks_edit+user_blocks_read+user_subscriptions';
    }

    /**
     * @return {string} URL of the app
     * @constructor
     */
    static get SELF_URL() {
        return 'http://localhost:5000/';
    }

    /**
     * @return {string} URL for getting an access token
     * @constructor
     */
    static get AUTHORIZE_URL() {
        return `https://api.twitch.tv/kraken/oauth2/authorize?response_type=token&client_id=
        ${TwitchConstants.CLIENT_ID}&redirect_uri=${TwitchConstants.SELF_URL}&scope=
        ${TwitchConstants.PERMISSION_SCOPE}`;
    }

    /**
     * @return {string} URL of the badges api for getting global badges
     * @constructor
     */
    static get GLOBAL_BADGES_API_URL() {
        return 'https://badges.twitch.tv/v1/badges/global/display';
    }

    /**
     * @return {string} The URL for connecting to the IRC Chat
     * @constructor
     */
    static get WEBSOCKET_URL() {
        return 'wss://irc-ws.chat.twitch.tv:443';
    }
}

export default TwitchConstants;
