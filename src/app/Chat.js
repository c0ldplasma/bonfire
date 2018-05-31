/**
 * Represents one chat column on the app
 */
class Chat {
    /**
     * Adds the chat column for channelName to the app
     *
     * @param {string} channelName Name of the channel
     */
    constructor(channelName) {
        /** @private */
        this.channelName_ = channelName;
        /** @private */
        this.messageCount_ = 0;
        /** @private */
        this.containerCount_ = 0;
        /** @private
         *  @const */
        this.MESSAGE_LIMIT_ = 200000;
        /** @private
         *  @const */
        this.MESSAGES_IN_CONTAINER_ = 100;
    }

    /**
     * @param {Object.<ChatMessage>} chatMessage
     */
    addMessage(chatMessage) {
        let chatMessageList = $('#' + this.channelName_ + 'contentArea');

        if (chatMessageList.children('div').length === 0 ||
            (chatMessageList.children('div').length !== 0 &&
                chatMessageList.children('div:last')
                    .children('li').length >= this.MESSAGES_IN_CONTAINER_)) {
            chatMessageList.append('<div></div>');
            this.containerCount_++;
        }

        chatMessageList.children('div:last').append(chatMessage.getHtml());
        this.messageCount_++;
        this.limitMessages_();
        this.hideNotVisibleMessages();
        this.correctScrollPosition_();
    }

    /**
     * Checks whether there are more than this.MESSAGE_LIMIT_ messages in chat.
     * If yes than remove the first div with messages
     * @private
     */
    limitMessages_() {
        if (this.messageCount_ >= this.MESSAGE_LIMIT_) {
            $('#' + this.channelName_ + ' .chatContent .chatMessageList div:first').remove();
            this.messageCount_ -= this.MESSAGES_IN_CONTAINER_;
            this.containerCount_--;
        }
    }

    /**
     * When chat is scrolled to bottom, this hides all message containers except the last 3
     */
    hideNotVisibleMessages() {
        // Hide all divs with 100 messages each which are not the last 3 to improve performance
        if (this.containerCount_ > 3 && this.isScrolledToBottom()) {
            let chatMessageList = $('#' + this.channelName_ + 'contentArea');
            chatMessageList.children('div:visible').slice(0, -3).hide();
        }
    }

    /**
     * Checks if the Chat is scrolled to the bottom
     * @return {boolean} True if on bottom, false if not
     */
    isScrolledToBottom() {
        let bottom = false;
        let chatContent = $('#' + this.channelName_ + 'scrollArea');
        if (chatContent[0].scrollHeight - chatContent.scrollTop()
            < chatContent.outerHeight() + 50) bottom = true;
        return bottom;
    }

    /**
     * @private
     */
    correctScrollPosition_() {
        // Scroll to bottom
        let bottom = this.isScrolledToBottom();
        let chatContent = $('#' + this.channelName_ + 'scrollArea');
        if (bottom) {
            let contentHeight = chatContent[0].scrollHeight;
            chatContent.scrollTop(contentHeight + 50);
            // chatContent.stop(true, false).delay(50)
            // .animate({ scrollTop: contentHeight }, 2000, 'linear');
            $('#' + this.channelName_ + ' .chatContent .chatMessageList')
                .find('p:last').imagesLoaded(function() {
                setTimeout(function() {
                    contentHeight = chatContent[0].scrollHeight;
                    chatContent.scrollTop(contentHeight + 50);
                    // chatContent.stop(true, false).delay(50)
                    // .animate({ scrollTop: contentHeight }, 2000, 'linear');
                    // alert("wub");
                }, 50);
            });
        } else if (!bottom
            && $('#' + this.channelName_ + ' .chatNewMessagesInfo').is(':hidden')) {
            let contentHeight = chatContent[0].scrollHeight;
            chatContent.scrollTop(contentHeight + 50);
            // chatContent.stop(true, false).delay(50)
            // .animate({ scrollTop: contentHeight }, 2000, 'linear');
        }
    }
}
export default Chat;
