'use strict';
import TwitchIRCConnection from './TwitchIRCConnection.js';
/**
 * Websocket connection to Twitch for sending
 */
class SendIRCConnection extends TwitchIRCConnection {
    /**
     * @constructor
     */
    constructor() {
        super();
        this.connection_.onmessage = this.onMessage_;
    }

    /**
     * @param {object} event event triggered by the Websocket connection
     * @private
     */
    onMessage_(event) {
        let messages = event.data.split('\n');

        for (let i = 0; i < messages.length; i++) {
            let msg = messages[i];

            if (msg.length <= 1) {
                continue;
            }

            if (msg.startsWith('PING :tmi.twitch.tv')) {
                this.connection_.send('PONG :tmi.twitch.tv');
            }
        }
    }
}
export default SendIRCConnection;

