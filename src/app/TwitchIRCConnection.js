'use strict';
import TwitchConstants from './TwitchConstants.js';

/**
 * Websocket connection to Twitch
 * @abstract
 */
class TwitchIRCConnection {
    /**
     * @param {AppUser} appUser
     * @constructor
     */
    constructor(appUser) {
        /** @private */
        this.appUser_ = appUser;

        if (new.target === TwitchIRCConnection) {
            throw new TypeError('Cannot construct abstract instances ' +
                'of TwitchIRCConnection directly');
        }
        this.isLoaded_ = false;
        this.connection_ = new WebSocket(TwitchConstants.WEBSOCKET_URL);
        this.connection_.onopen = this.onOpen_.bind(this);
        this.connection_.onerror = TwitchIRCConnection.onError_.bind(this);
    }

    /**
     * Gets called when the connection established
     * @private
     */
    onOpen_() {
        this.connection_.send('CAP REQ :twitch.tv/membership');
        this.connection_.send('CAP REQ :twitch.tv/tags');
        this.connection_.send('CAP REQ :twitch.tv/commands');
        this.connection_.send('PASS oauth:' + localStorage.accessToken);
        this.connection_.send('NICK ' + this.appUser_.getUserName());
        this.isLoaded_ = true;
    }

    /**
     * @return {boolean}
     */
    isLoaded() {
        return this.isLoaded_;
    }

    /**
     * Gets called on error
     * @private
     */
    static onError_() {
        console.log('WebSocket Error ' + error);
        alert('ERROR: ' + error);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Gets called on message
     * @param {object} event event triggered by the Websocket connection
     * @private
     * @abstract
     */
    onMessage_(event) {};

    /**
     * Leave the specified chat
     * @param {string} chatName
     */
    leaveChat(chatName) {
        this.connection_.send('PART #' + chatName);
    }

    /**
     * Join the specified chat
     * @param {string} chatName
     */
    joinChat(chatName) {
        this.connection_.send('JOIN #' + chatName);
    }

    /**
     * Sends the specified message to the Websocket connection
     * @param {string} message
     */
    send(message) {
        this.connection_.send(message);
    }
}

export default TwitchIRCConnection;
