'use strict';

import TwitchConstants from './TwitchConstants.js';

/**
 * List of favorite Twitch channels
 */
class FavoritesList {
    /**
     * @param {BadgeManager} badgeManager
     * @param {EmoteManager} emoteManager
     * @param {ChatsManager} chatsManager
     * @constructor
     */
    constructor(badgeManager, emoteManager, chatsManager) {
        this.favList_ = [];
        this.isVisible_ = true;
        this.badgeManager_ = badgeManager;
        this.emoteManager_ = emoteManager;
        this.chatsManager_ = chatsManager;
    }

    /**
     * If the favorites list is enabled, disable it.
     * If its disabled, enable it.
     */
    toggleFavList() {
        this.isVisible_ ? false : true;
        if (!this.isVisible_) {
            document.getElementById('fav-channel-list').style.display
                = 'inline-block';
            $('.container').css({'width': 'calc(100% - 250px)'});
            document.getElementById('channelListToggle').style.backgroundImage
                = 'url(./img/arrow_down.svg)';
        } else {
            document.getElementById('fav-channel-list').style.display = 'none';
            $('.container').css({'width': '100%'});
            document.getElementById('channelListToggle').style.backgroundImage
                = 'url(./img/arrow_up.svg)';
        }
    }

    /**
     * Add a channel to the list of favorites
     *
     * @param {string} channelLC channel name or null
     */
    addFavToList(channelLC) {
        let channels = document.getElementById('newFavInput').value;
        if ($.type(channelLC) === 'string') {
            channels = channelLC;
        }

        if (channels.length >= 3) {
            $.ajax({
                url: ('https://api.twitch.tv/kraken/users?login='
                    + channels),
                headers: {
                    'Accept': 'application/vnd.twitchtv.v5+json',
                    'Client-ID': TwitchConstants.CLIENT_ID,
                },
                async: true,
            }).done(function(data) {
                if (data.users.length >= 1) {
                    let channel = data.users[0].display_name;
                    let channelId = data.users[0]._id;
                    let profilePicURL = data.users[0].logo;
                    document.getElementById('newFavInput').placeholder = '';
                    addFavLine(channel, profilePicURL, channelId);
                } else {
                    document.getElementById('newFavInput').value = '';
                    $('#newFavInput').queue(function(next) {
                        $(this).attr('placeholder', 'Channel does not exist.');
                        next();
                    }).delay(5000).queue(function(next) {
                        $(this).attr('placeholder', '');
                        next();
                    });
                }
            });
        }
    }

    /**
     * @param {string} channel channel name
     * @param {string} profilePicURL URL to profile image file
     * @param {string} channelId channel id
     */
    addFavLine_(channel, profilePicURL, channelId) {
        let channelLC = channel.toLowerCase();

        this.badgeManager_.downloadChannelBadges(channelLC, channelId);
        this.emoteManager_.downloadChannelEmotes(channelLC);


        if (channel.length > 0
            && $('.favEntry[id$=\'' + channelLC + '\']').length === 0) {
            document.getElementById('newFavInput').value = '';

            let channelList = $('#fav-channel-list');

            channelList.append('<div class="favEntry" id="' + channelLC
                + '"><img class="profilePic" src="' + ((profilePicURL != null)
                    ? profilePicURL : '/img/defaultProfile.png')
                + '" /><input class="favEntryAddChatButton" ' +
                'id="' + channelLC + '" type="button" value="' + channel
                + '"><input class="favEntryRemoveButton" ' +
                'id="' + channelLC + '" type="button" ></div>');

            $(document).on('click', '.favEntryAddChatButton[id$=\''
                + channelLC + '\']', function() {
                this.chatsManager_.addChat(channel, channelId);
            });

            $(document).on('click', '.favEntryRemoveButton[id$=\''
                + channelLC + '\']', function() {
                    $(this).parent().remove();
                    this.removeChannelFromLocalStorage_(channelId);
            });

            // ToDo: is it needed to do channelList.sortable() every time when an entry is added?
            channelList.sortable({
                axis: 'y',
                animation: 300,
                cursor: 'move',
                revert: 200,
                scroll: true,
                containment: 'parent',
            });
        }

        this.storeChannelInLocalStorage_(channelId);
    }

    /**
     * @param {string} channelId Twitch channel id of the channel that is stored
     * @private
     */
    storeChannelInLocalStorage_(channelId) {
        let channels = JSON.parse(localStorage.getItem('channels'));
        let index = channels.indexOf(channelId);
        if (index > -1) {
            channels.splice(index, 1);
        }
        channels.push(channelId);
        localStorage.setItem('channels', JSON.stringify(channels));
    }

    /**
     * @param {string} channelId Twitch channel id of the channel that gets deleted
     * @private
     */
    removeChannelFromLocalStorage_(channelId) {
        let channels = JSON.parse(localStorage.getItem('channels'));
        let index = channels.indexOf(channelId);
        if (index > -1) {
            channels.splice(index, 1);
        }
        localStorage.setItem('channels', JSON.stringify(channels));
    }
}

export default FavoritesList;
