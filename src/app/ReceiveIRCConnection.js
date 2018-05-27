'use strict';
import TwitchIRCConnection from './TwitchIRCConnection.js';
import {addMessage} from './mainFunctions.js';
/**
 * Websocket connection to Twitch
 * @abstract
 */
class ReceiveIRCConnection extends TwitchIRCConnection {
    /**
     * @param {function} onMessage
     */
    constructor() {
        super();
        this.connection_.onmessage = this.onMessage_;
    }

    onMessage_(rawMessage) {
        let messages = rawMessage.data.split('\n');

        for (let i = 0; i < messages.length; i++) {
            let msg = messages[i];
            console.log(msg);
            addMessage(msg);
        }
    }
}
export default ReceiveIRCConnection;
