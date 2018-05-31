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
    }

    /**
     * @param {Object.<ChatMessage>} message
     */
    addMessage(message) {
        if (newMessage != null) {
            if (chatMessageList.children('div').length === 0 ||
                (chatMessageList.children('div').length !== 0 &&
                    chatMessageList.children('div:last')
                        .children('li').length >= 100)) {
                chatMessageList.append('<div></div>');
            }
            chatMessageList.children('div:last').append(newMessage);
            if (resubMessage != null) {
                addMessage(resubMessage);
            }
        }
    }

    limitMessages() {
        // Limit messages in Chat
        let count = chatMessageList.find('li').length;
        // document.getElementById("newFavInput").value = " " + count;
        if (count >= 200000) {
            $('#' + channelLC + ' .chatContent .chatMessageList div:first')
                .remove();
        }
    }

    hideNotVisibleMessages() {
        // Hide all divs with 100 messages each which are not the last 3 to improve performance
        if (chatMessageList.children('div').length > 3 && bottom) {
            chatMessageList.children('div:visible').slice(0, -3).hide();
        }
    }

    /**
     * Checks if the Chat is scrolled to the bottom
     * @return {boolean} True if on bottom, false if not
     */
    isScrolledToBottom() {
        let bottom = false;
        if (chatContent[0].scrollHeight - chatContent.scrollTop()
            < chatContent.outerHeight() + 50) bottom = true;
        return bottom;
    }

    /**
     * @private
     */
    correctScrollPosition_() {
        // Scroll to bottom
        if (bottom) {
            let contentHeight = chatContent[0].scrollHeight;
            chatContent.scrollTop(contentHeight + 50);
            // chatContent.stop(true, false).delay(50)
            // .animate({ scrollTop: contentHeight }, 2000, 'linear');
            $('#' + channelLC + ' .chatContent .chatMessageList')
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
            && $('#' + channelLC + ' .chatNewMessagesInfo').is(':hidden')) {
            let contentHeight = chatContent[0].scrollHeight;
            chatContent.scrollTop(contentHeight + 50);
            // chatContent.stop(true, false).delay(50)
            // .animate({ scrollTop: contentHeight }, 2000, 'linear');
        }
    }
}
export default Chat;
