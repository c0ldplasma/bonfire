'use strict';

/**
 * Manages the Emotes for the chat messages and the emote menu
 */
class EmoteManager {
    /**
     * @constructor
     */
    constructor() {
        this.userEmotes_ = null;

        this.bttvChannels_ = {};
        this.bttvGlobal_ = null;

        this.ffzChannels_ = {};
        this.ffzGlobal_ = null;

        this.downloadGlobalEmotes_();
    }

    /**
     * Downloads the global Twitch, BTTV and FFZ Emote JSONs
     * @private
     */
    downloadGlobalEmotes_() {
        // Gets a list of the emojis and emoticons that the specified
        // user can use in chat.
        $.ajax({
            url: ('https://api.twitch.tv/kraken/getUsers/' + userID + '/emotes'),
            headers: {
                'Accept': 'application/vnd.twitchtv.v5+json',
                'Client-ID': this.clientId_,
                'Authorization': ('OAuth ' + localStorage.accessToken),
            },
            async: true,
        }).done(function(data) {
            this.userEmotes_ = data.emoticon_sets;
        });

        // Download Global BTTV Emotes JSON
        $.ajax({
            url: ('https://api.betterttv.net/2/emotes'),
            async: true,
        }).done(function(data) {
            this.bttvGlobal_ = data.emotes;
        });

        // Download Global FFZ Emotes JSON
        $.ajax({
            url: ('https://api.frankerfacez.com/v1/set/global'),
            async: true,
        }).done(function(data) {
            this.ffzGlobal_ = data;
        });
    }

    /**
     *
     * @param {string} channelLC
     */
    downloadChannelEmotes(channelLC) {
        this.downloadFfzChannelEmotes_(channelLC);
        this.downloadBttvChannelEmotes_(channelLC);
    }

    /**
     *
     * @param {string} channelLC
     * @private
     */
    downloadBttvChannelEmotes_(channelLC) {
        // Download BTTV Channel Emotes
        $.ajax({
            url: ('https://api.betterttv.net/2/channels/' + channelLC),
            async: true,
            dataType: 'json',
            error: function(xhr) {
                if (xhr.status === 404) {
                    // Ignore - No BTTV emotes in this channel
                    console.log('No BTTV Emotes in Channel: ' + channel);
                }
            },
        }).done(function(data) {
            bttvChannels[channelLC] = data.emotes;
        });
    }

    /**
     *
     * @param channelLC
     * @private
     */
    downloadFfzChannelEmotes_(channelLC) {
        // Download FFZ Channel Emotes/Moderator Channel Badge
        $.ajax({
            url: ('https://api.frankerfacez.com/v1/room/' + channelLC),
            async: true,
            dataType: 'json',
            error: function(xhr) {
                if (xhr.status === 404) {
                    // Ignore - No FFZ emotes in this channel
                    console.log('No FFZ Emotes in Channel: ' + channel);
                }
            },
        }).done(function(data) {
            ffzChannels[channelLC] = data;
        });
    }
}
export default EmoteManager;
