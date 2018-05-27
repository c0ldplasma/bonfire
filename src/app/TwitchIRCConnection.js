'use strict';
import TwitchConstants from './TwitchConstants.js';
/**
 * Websocket connection to Twitch
 * @abstract
 */
class TwitchIRCConnection {
    /**
     * @param {function} onMessage
     */
    constructor() {
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
        this.connection_.send('NICK ' + user);
    }
    onError_() {
        console.log('WebSocket Error ' + error);
        alert('ERROR: ' + error);
    }
    onMessage_(message) {};
}
export default TwitchIRCConnection;
