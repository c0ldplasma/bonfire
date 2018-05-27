'use strict';
import TwitchIRCConnection from './TwitchIRCConnection.js';
/**
 * Websocket connection to Twitch
 * @abstract
 */
class SendIRCConnection extends TwitchIRCConnection{
    /**
     * @param {function} onMessage
     */
    constructor() {
        super();
    }

    onMessage_(rawMessage) {
        let messages = rawMessage.data.split('\n');

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

