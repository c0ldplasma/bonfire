'use strict';
import ChatMessage from './ChatMessage.js';

/**
 * Represents one roomState message
 */
class RoomStateMessage extends ChatMessage {
    /**
     * @param {string} chatName Name of the chat the message is for
     * @param {string} content The actual content of the message
     * @constructor
     */
    constructor(chatName, content) {
        super(chatName, content);
    }

    /**
     * @return {string} HTML Code
     */
    getHtml() {
        return '<p style="color: gray; font-size: 11px;' +
            'padding-left: 10px;font-weight: 200;">' + this.getContent() + '</p>';
    }
}
export default RoomStateMessage;
