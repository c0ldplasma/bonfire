'use strict';

/**
 *
 */
class EmoteManager {
    /**
     *
     */
    constructor() {
        this.userEmotes_ = null;

        this.bttvChannels_ = {};
        this.bttvGlobal_ = null;

        this.ffzChannels_ = {};
        this.ffzGlobal_ = null;

        this.downloadGlobalEmotes_();
    }

    downloadGlobalEmotes_() {
        // Gets a list of the emojis and emoticons that the specified
        // user can use in chat.
        $.ajax({
            url: ('https://api.twitch.tv/kraken/users/' + userID + '/emotes'),
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
}
export default EmoteManager;
