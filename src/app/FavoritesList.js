'use strict';

/**
 * @param data._total
 * @param data.users._id
 */

import TwitchApi from './TwitchApi.js';

/**
 * List of favorite Twitch channels
 */
class FavoritesList {
    /**
     * @param {BadgeManager} badgeManager
     * @param {EmoteManager} emoteManager
     * @param {ChatManager} chatManager
     * @constructor
     */
    constructor(badgeManager, emoteManager, chatManager) {
        this.isVisible_ = true;
        this.badgeManager_ = badgeManager;
        this.emoteManager_ = emoteManager;
        this.chatManager_ = chatManager;

        $('#addFavFromInput').click(this.addFavToList.bind(this));
        $('#newFavInput').keydown(function(event) {
            if (event.keyCode === 13) {
                $('#addFavFromInput').click();
            }
        });
        document.getElementById('channelListToggle').addEventListener('click', this.toggleFavList);
        this.loadFavoritesFromLocalStorage_();
    }

    /**
     * @private
     */
    loadFavoritesFromLocalStorage_() {
        try {
            let channelsArray = JSON.parse(localStorage.getItem('channels'));
            if (channelsArray !== null) {
                let channelCount = 0;
                let channels = '';
                for (let i = 0; i < channelsArray.length; i++) {
                    channels += channelsArray[i] + ',';
                    channelCount++;
                    if (channelCount > 99) {
                        channels = channels.slice(0, -1);
                        this.addFavToList(channels);
                        channels = '';
                        channelCount = 0;
                    }
                }
                if (channels.length > 1) {
                    channels = channels.slice(0, -1);
                    this.addFavToList(channels);
                }
            } else {
                let channels = [];
                localStorage.setItem('channels', JSON.stringify(channels));
            }
        } catch (err) {
            alert('Error: ' + err);
            let channels = [];
            localStorage.setItem('channels', JSON.stringify(channels));
        }
    }

    /**
     * If the favorites list is enabled, disable it.
     * If its disabled, enable it.
     */
    toggleFavList() {
        this.isVisible_ = !this.isVisible_;
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
        // console.log(channels);
        channels = channels.replace(/\s+/g, '');
        let channelsCount = channels.split(',').length;

        if (channels.length >= 3) {
            // console.log(this);
            TwitchApi.getUsers(channels, this, function(data) {
                let notExistingChannelsCount = channelsCount - data._total;
                for (let i = 0; i < data._total; i++) {
                    let channel = data.users[i].display_name;
                    let channelId = data.users[i]._id;
                    let profilePicURL = data.users[i].logo;
                    // ToDo: Check if next line is necessary
                    document.getElementById('newFavInput').placeholder = '';
                    // noinspection JSPotentiallyInvalidUsageOfClassThis
                    this.addFavLine_(channel, profilePicURL, channelId);
                }

                if (notExistingChannelsCount > 0) {
                    // noinspection JSPotentiallyInvalidUsageOfClassThis
                    this.showChannelDoesNotExistInfo_(notExistingChannelsCount);
                }
            });
        }
    }

    /**
     * @param {number} notExistingChannelsCount
     * @private
     */
    showChannelDoesNotExistInfo_(notExistingChannelsCount) {
        document.getElementById('newFavInput').value = '';
        $('#newFavInput').queue(function(next) {
            let info = (notExistingChannelsCount > 1) ? ' Channels do not exist.' :
                ' Channel does not exist.';
            $(this).attr('placeholder', notExistingChannelsCount + info);
            next();
        }).delay(5000).queue(function(next) {
            $(this).attr('placeholder', '');
            next();
        });
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

            let favList = $('#fav-channel-list');

            favList.append('<div class="favEntry" id="' + channelLC
                + '"><img class="profilePic" src="' + ((profilePicURL != null)
                    ? profilePicURL : '/img/defaultProfile.png')
                + '" /><input class="favEntryAddChatButton" ' +
                'id="' + channelLC + '" type="button" value="' + channel
                + '"><input class="favEntryRemoveButton" ' +
                'id="' + channelLC + '" type="button" ></div>');

            $(document).on('click', '.favEntryAddChatButton[id$=\''
                + channelLC + '\']', this, function(event) {
                event.data.chatManager_.addChat(channel);
            });

            $(document).on('click', '.favEntryRemoveButton[id$=\'' + channelLC + '\']', this,
                function(event) {
                    $(this).parent().remove();
                    event.data.removeChannelFromLocalStorage_(channelLC);
            });

            // ToDo: is it needed to do channelList.sortable() every time when an entry is added?
            favList.sortable({
                axis: 'y',
                animation: 300,
                cursor: 'move',
                revert: 200,
                scroll: true,
                containment: 'parent',
            });
        }

        this.storeChannelInLocalStorage_(channelLC);
    }

    // noinspection JSMethodCanBeStatic
    /**
     * @param {string} channelName Twitch channel id of the channel that is stored
     * @private
     */
    storeChannelInLocalStorage_(channelName) {
        let channels = JSON.parse(localStorage.getItem('channels'));
        let index = channels.indexOf(channelName);
        if (index > -1) {
            channels.splice(index, 1);
        }
        channels.push(channelName);
        localStorage.setItem('channels', JSON.stringify(channels));
    }

    // noinspection JSMethodCanBeStatic
    /**
     * @param {string} channelLC Twitch channel id of the channel that gets deleted
     * @private
     */
    removeChannelFromLocalStorage_(channelLC) {
        let channels = JSON.parse(localStorage.getItem('channels'));
        let index = channels.indexOf(channelLC);
        if (index > -1) {
            channels.splice(index, 1);
        }
        localStorage.setItem('channels', JSON.stringify(channels));
    }
}

export default FavoritesList;
