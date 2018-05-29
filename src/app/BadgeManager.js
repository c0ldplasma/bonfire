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
        this.badgesGlobal_ = null;

        this.downloadGlobalBadges_();
    }

    /**
     * Downloads the JSON information for global badges
     * @private
     */
    downloadGlobalBadges_() {
        // Download Global Badges JSON
        $.ajax({
            url: (TwitchConstants.GLOBAL_BADGES_API_URL),
            headers: {
                'Accept': 'application/vnd.twitchtv.v5+json',
                'Client-ID': TwitchConstants.CLIENT_ID,
            },
            async: true,
        }).done(function(data) {
            this.badgesGlobal_ = data.badge_sets;
        });
    }
    downloadChannelBadges(channelLC, channelId) {
        // Download Channel Badges
        $.ajax({
            url: ('https://badges.twitch.tv/v1/badges/channels/'
                + channelId + '/display'),
            headers: {
                'Accept': 'application/vnd.twitchtv.v5+json',
                'Client-ID': TwitchConstants.CLIENT_ID,
            },
            async: true,
        }).done(function(data) {
            badgesChannels[channelLC] = data.badge_sets;
        });
    }
}
export default BadgeManager;
