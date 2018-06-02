'use strict';
import TwitchIRCConnection from './TwitchIRCConnection.js';

/**
 * Websocket connection to Twitch for receiving
 */
class ReceiveIRCConnection extends TwitchIRCConnection {
    /**
     * @param {AppUser} appUser
     * @param {MessageParser} messageParser
     * @param {ChatManager} chatManager
     * @constructor
     */
    constructor(appUser, messageParser, chatManager) {
        super(appUser);
        this.messageParser_ = messageParser;
        this.chatManager_ = chatManager;
        this.connection_.onmessage = this.onMessage_.bind(this);
    }

    /**
     * @param {object} event event triggered by the Websocket connection
     * @private
     */
    onMessage_(event) {
        let messages = event.data.split('\n');

        for (let i = 0; i < messages.length; i++) {
            let msg = messages[i];
            if (msg.startsWith('PING :tmi.twitch.tv')) {
                this.connection_.send('PONG :tmi.twitch.tv');
            } else if (msg.length > 1) {
                let chatMessages = this.messageParser_.parseMessage(msg);
                this.chatManager_.addMessages(chatMessages);
            } else {
                // console.log('Received empty message in ReceiveIRVConnection onMessage_()');
            }
        }
    }
}

export default ReceiveIRCConnection;
