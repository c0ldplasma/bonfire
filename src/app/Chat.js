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
}
export default Chat;
