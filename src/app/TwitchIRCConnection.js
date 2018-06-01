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

        this.connection_ = new WebSocket(TwitchConstants.WEBSOCKET_URL);
        this.connection_.onopen = this.onOpen_;
        this.connection_.onerror = this.onError_;
    }

    onOpen_() {
        this.connection_.send('CAP REQ :twitch.tv/membership');
        this.connection_.send('CAP REQ :twitch.tv/tags');
        this.connection_.send('CAP REQ :twitch.tv/commands');
        this.connection_.send('PASS oauth:' + localStorage.accessToken);
        this.connection_.send('NICK ' + this.appUser_.getUserName());
    }

    /**
     * Calles on error
     * @private
     */
    onError_() {
        console.log('WebSocket Error ' + error);
        alert('ERROR: ' + error);
    }

    /**
     * Calles on message
     * @param {object} event event triggered by the Websocket connection
     * @private
     */
    onMessage_(event) {
    };

    leaveChat(chatName) {
        this.connection_.send('PART #' + chatName);
    }

    joinChat(chatName) {
        this.connection_.send('JOIN #' + chatName);
    }
}

export default TwitchIRCConnection;
