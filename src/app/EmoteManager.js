'use strict';

import TwitchConstants from './TwitchConstants.js';

/**
 * Manages the Emotes for the chat messages and the emote menu
 */
class EmoteManager {
    /**
     * @param {AppUser} appUser
     * @constructor
     */
    constructor(appUser) {
        this.appUser_ = appUser;

        this.userEmotes_ = {};

        this.bttvChannels_ = {};
        this.bttvGlobal_ = {};

        this.ffzChannels_ = {};
        this.ffzGlobal_ = {};

        this.downloadGlobalEmotes_();
    }

    /**
     * @return {Object}
     */
    getUserEmotes() {
        return this.userEmotes_;
    }
    /**
     * @return {Object}
     */
    getBttvGlobal() {
        return this.bttvGlobal_;
    }
    /**
     * @return {Object}
     */
    getFfzGlobal() {
        return this.ffzGlobal_;
    }
    /**
     * @return {Object}
     */
    getBttvChannels() {
        return this.bttvChannels_;
    }
    /**
     * @return {Object}
     */
    getFfzChannels() {
        return this.ffzChannels_;
    }

    /**
     * Downloads the global Twitch, BTTV and FFZ Emote JSONs
     * @private
     */
    downloadGlobalEmotes_() {
        // Gets a list of the emojis and emoticons that the specified
        // user can use in chat.
        $.ajax({
            context: this,
            url: ('https://api.twitch.tv/kraken/users/' + this.appUser_.getUserId() + '/emotes'),
            headers: {
                'Accept': 'application/vnd.twitchtv.v5+json',
                'Client-ID': TwitchConstants.CLIENT_ID,
                'Authorization': ('OAuth ' + localStorage.accessToken),
            },
            async: true,
        }).done(function(data) {
            this.userEmotes_ = data.emoticon_sets;
            // console.log(data.emoticon_sets);
        });

        // Download Global BTTV Emotes JSON
        $.ajax({
            context: this,
            url: ('https://api.betterttv.net/2/emotes'),
            async: true,
        }).done(function(data) {
            this.bttvGlobal_ = data.emotes;
        });

        // Download Global FFZ Emotes JSON
        $.ajax({
            context: this,
            url: ('https://api.frankerfacez.com/v1/set/global'),
            async: true,
        }).done(function(data) {
            // console.log(data);
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
            context: this,
            url: ('https://api.betterttv.net/2/channels/' + channelLC),
            async: true,
            dataType: 'json',
            error: function(xhr) {
                if (xhr.status === 404) {
                    // Ignore - No BTTV emotes in this channel
                    console.log('No BTTV Emotes in Channel: ' + channelLC);
                }
            },
        }).done(function(data) {
            this.bttvChannels_[channelLC] = data.emotes;
        });
    }

    /**
     *
     * @param {string} channelLC
     * @private
     */
    downloadFfzChannelEmotes_(channelLC) {
        // Download FFZ Channel Emotes/Moderator Channel Badge
        $.ajax({
            context: this,
            url: ('https://api.frankerfacez.com/v1/room/' + channelLC),
            async: true,
            dataType: 'json',
            error: function(xhr) {
                if (xhr.status === 404) {
                    // Ignore - No FFZ emotes in this channel
                    console.log('No FFZ Emotes in Channel: ' + channelLC);
                }
            },
        }).done(function(data) {
            this.ffzChannels_[channelLC] = data;
        });
    }
}
export default EmoteManager;
