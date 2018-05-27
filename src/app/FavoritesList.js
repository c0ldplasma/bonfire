'use strict';

/**
 * List of favorite Twitch channels
 */
class FavoritesList {
    constructor() {
        this.favList_ = [];
        this.isVisible_ = true;
    }

    /**
     * If the favorites list is enabled, disable it.
     * If its disabled, enable it.
     */
    toggleFavList() {
        if (document.getElementById('fav-channel-list').style.display === 'none') {
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
     * @param {string} channelParam channel name or null
     */
    addFavToList(channelParam) {
        if (document.getElementById('newFavInput').value.length < 3
            && channelParam == null) {
        } else if ($.type(channelParam) === 'string') {
            $.ajax({
                url: ('https://api.twitch.tv/kraken/users/' + channelParam),
                headers: {
                    'Accept': 'application/vnd.twitchtv.v5+json',
                    'Client-ID': clientID,
                },
                async: true,
            }).done(function(data) {
                let channel = data.display_name;
                let channelId = data._id;
                let profilePicURL = data.logo;
                addFavLine(channel, profilePicURL, channelId);
            });
        } else {
            $.ajax({
                url: ('https://api.twitch.tv/kraken/users?login='
                    + document.getElementById('newFavInput').value),
                headers: {
                    'Accept': 'application/vnd.twitchtv.v5+json',
                    'Client-ID': clientID,
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

        // Download Channel Badges
        $.ajax({
            url: ('https://badges.twitch.tv/v1/badges/channels/'
                + channelId + '/display'),
            headers: {
                'Accept': 'application/vnd.twitchtv.v5+json',
                'Client-ID': clientID,
            },
            async: true,
        }).done(function(data) {
            badgesChannels[channelLC] = data.badge_sets;
        });

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
                addChat(channel, channelId);
            });
            $(document).on('click', '.favEntryRemoveButton[id$=\''
                + channelLC + '\']', function() {
                $(this).parent().remove();

                let channels = JSON.parse(localStorage.getItem('channels'));
                let index = channels.indexOf(channelId);
                if (index > -1) {
                    channels.splice(index, 1);
                }
                localStorage.setItem('channels', JSON.stringify(channels));
            });
            channelList.sortable({
                axis: 'y',
                animation: 300,
                cursor: 'move',
                revert: 200,
                scroll: true,
                containment: 'parent',
            });

            let channels = JSON.parse(localStorage.getItem('channels'));
            let index = channels.indexOf(channelId);
            if (index > -1) {
                channels.splice(index, 1);
            }
            channels.push(channelId);
            localStorage.setItem('channels', JSON.stringify(channels));
        }
    }
}

export default FavoritesList;
