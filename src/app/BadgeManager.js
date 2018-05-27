'use strict';

import TwitchConstants from './TwitchConstants.js';

/**
 *
 */
class BadgeManager {
    /**
     *
     */
    constructor() {
        this.badgesChannels_ = {};
        this.badgesGlobal_ = null;

        this.downloadBadges_();
    }

    downloadBadges_() {
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
}
export default BadgeManager;
