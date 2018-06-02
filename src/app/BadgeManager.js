'use strict';

import TwitchConstants from './TwitchConstants.js';

/**
 * Manages the badges which appear in front of the chat username
 */
class BadgeManager {
    /**
     * @constructor
     */
    constructor() {
        this.badgesChannels_ = {};
        // noinspection JSUnusedGlobalSymbols
        this.badgesGlobal_ = null;

        this.downloadGlobalBadges_();
    }

    /**
     * @return {Object}
     */
    getBadgesChannels() {
        return this.badgesChannels_;
    }

    /**
     * @return {Object}
     */
    getBadgesGlobal() {
        return this.badgesGlobal_;
    }

    /**
     * Downloads the JSON information for global badges
     * @private
     */
    downloadGlobalBadges_() {
        // Download Global Badges JSON
        $.ajax({
            context: this,
            url: (TwitchConstants.GLOBAL_BADGES_API_URL),
            headers: {
                'Accept': 'application/vnd.twitchtv.v5+json',
                'Client-ID': TwitchConstants.CLIENT_ID,
            },
            async: true,
        }).done(function(data) {
            // noinspection JSUnusedGlobalSymbols
            this.badgesGlobal_ = data.badge_sets;
        });
    }

    /**
     * @param {string} channelLC
     * @param {string} channelId
     */
    downloadChannelBadges(channelLC, channelId) {
        // Download Channel Badges
        $.ajax({
            context: this,
            url: ('https://badges.twitch.tv/v1/badges/channels/'
                + channelId + '/display'),
            headers: {
                'Accept': 'application/vnd.twitchtv.v5+json',
                'Client-ID': TwitchConstants.CLIENT_ID,
            },
            async: true,
        }).done(function(data) {
            this.badgesChannels_[channelLC] = data.badge_sets;
        });
    }
}
export default BadgeManager;
