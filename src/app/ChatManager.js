'use strict';
import Chat from './Chat.js';

/**
 * Represents the whole application
 */
class ChatManager {
    /**
     * Creates the ChatManager
     * @param {EmoteManager} emoteManager
     */
    constructor(emoteManager) {
        /**
         * @private
         * @type {Object.<string, Chat>}
         */
        this.chatList_ = {};
        this.emoteManager_ = emoteManager;

        // Bug workaround: unexpected vertical scrolling
        // despite overflow-y: hidden
        $('#main-chat-area').scroll(function() {
            if ($(this).scrollTop() !== 0) {
                $(this).scrollTop(0);
            }
        });
    }

    setReceiveIrcConnection(receiveIrcConnection) {
        this.receiveIrcConnection_= receiveIrcConnection;
    }
    setSendIrcConnection(sendIrcConnection) {
        this.sendIrcConnection_ = sendIrcConnection;
    }

    /**
     * Adds the chat messages to the correct chat
     * @param {Array.<ChatMessage>} chatMessages
     */
    addMessages(chatMessages) {
        for (let i = 0; i < chatMessages.length; i++) {
            let chatName = chatMessages[i].getChatName().toLowerCase();
            this.chatList_[chatName].addMessage(chatMessages[i]);
        }
    }

    /**
     * @param {string} channelName
     * @return {boolean} true if chat already in the chatList
     */
    isChatAlreadyAdded(channelName) {
        return this.chatList_.hasOwnProperty(channelName);
    }

    /**
     * Removes the Chat from the chatList_ and the DOM
     *
     * @param {Object} event
     * @private
     */
    removeChat_(event) {
        let channelName = event.data[1].toLowerCase();
        let thiss = event.data[0];
        delete thiss.chatList_[channelName];
        $(document).off('click', '.toggleStream[id$=\'' + channelName + '\']');
        $(this).parent().parent().remove();
        thiss.receiveIrcConnection_.leaveChat(channelName);
        thiss.sendIrcConnection_.leaveChat(channelName);
    }

    /**
     * Creates new Chat and adds it to the chatList_ if there is not already
     * a chat with this channelName
     * @param {string} channelName Name of the channel that will be added
     */
    addChat(channelName) { // ToDo: Restructure this method
        let channelLC = channelName.toLowerCase();
        if (!this.isChatAlreadyAdded(channelLC)) {
            this.chatList_[channelLC] = new Chat(channelName, this.emoteManager_,
                this.receiveIrcConnection_, this.sendIrcConnection_);
            let chatArea = $('#main-chat-area');
            chatArea.append(this.chatList_[channelLC].getHtml());
            this.chatList_[channelLC].addAbilities();

            this.receiveIrcConnection_.joinChat(channelLC);
            this.sendIrcConnection_.joinChat(channelLC);

            $(document).on('click', '.removeChat[id$=\'' + channelLC + '\']',
                [this, channelName], this.removeChat_);

            // ToDO: Check if .sortable is needed every time
            chatArea.sortable({
                handle: '.chatHeader',
                start(event, ui) {
                    ui.placeholder.width(ui.item.width());
                    ui.placeholder.height(ui.item.height());
                },
                animation: 300,
                cursor: 'move',
                revert: 200,
                scroll: true,
                containment: 'parent',
            });
        }
    }
}

export default ChatManager;
