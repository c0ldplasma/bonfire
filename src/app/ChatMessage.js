'use strict';
/**
 * Represents one chat message
 */
class ChatMessage {
    /**
     * @param {string} chatName Name of the chat the message is for
     * @param {string} content The actual content of the message
     * @constructor
     */
    constructor(chatName, content) {
        this.chatName_ = chatName;
        /** @private */
        this.timestamp_ = this.getCurrentTimeFormatted_();
        /** @private */
        this.content_ = content;
        /** @private */
    }

    getContent() {
        return this.content_;
    }

    getTimestamp() {
        return this.timestamp_;
    }

    getChatName() {
        return this.chatName_;
    }

    /**
     * Returns the current time in 24h format
     * @return {string} time in format HH:MM
     * @private
     */
    getCurrentTimeFormatted_() {
        let currentDate = new Date();
        let time;
        if (currentDate.getHours() >= 10 && currentDate.getMinutes() >= 10) {
            time = currentDate.getHours() + ':' + currentDate.getMinutes();
        } else if (currentDate.getHours() < 10 && currentDate.getMinutes() >= 10) {
            time = '0' + currentDate.getHours() + ':' + currentDate.getMinutes();
        } else if (currentDate.getHours() >= 10 && currentDate.getMinutes() < 10) {
            time = currentDate.getHours() + ':0' + currentDate.getMinutes();
        } else {
            time = '0' + currentDate.getHours() + ':0' + currentDate.getMinutes();
        }
        return time;
    }

    getHtml() {
        return '<li style="border-top: 1px solid #673ab7;' +
            'border-bottom: 1px solid #673ab7;padding-top: 3px; ' +
            'padding-bottom: 3px;"><span style="color: gray;' +
            'font-size: 11px;">' + this.timestamp_ + '</span>  ' +
            this.content_
            + '</li>';
    }
}
export default ChatMessage;
