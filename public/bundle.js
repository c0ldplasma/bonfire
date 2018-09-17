(function () {
'use strict';

class TwitchConstants {
    /**
     * @return {string} Client Id for authorization on the Twitch apis
     * @constructor
     */
    static get CLIENT_ID() {
        return 'xllef7inid2mbeqoaj2o6bsohg7pz7';
    }

    /**
     * @return {string} Scope needed for the app (for requesting an access token)
     * @constructor
     */
    static get PERMISSION_SCOPE() {
        return 'chat_login+user_blocks_edit+user_blocks_read+user_subscriptions';
    }

    /**
     * @return {string} URL of the app
     * @constructor
     */
    static get SELF_URL() {
        return 'http://localhost:5000/';
    }

    /**
     * @return {string} URL for getting an access token
     * @constructor
     */
    static get AUTHORIZE_URL() {
        return 'https://id.twitch.tv/oauth2/authorize?response_type=token&client_id=' +
        TwitchConstants.CLIENT_ID + '&redirect_uri=' + TwitchConstants.SELF_URL + '&scope=' +
        TwitchConstants.PERMISSION_SCOPE;
    }

    /**
     * @return {string} URL of the badges api for getting global badges
     * @constructor
     */
    static get GLOBAL_BADGES_API_URL() {
        return 'https://badges.twitch.tv/v1/badges/global/display';
    }

    /**
     * @return {string} The URL for connecting to the IRC Chat
     * @constructor
     */
    static get WEBSOCKET_URL() {
        return 'wss://irc-ws.chat.twitch.tv:443';
    }
}

class TwitchApi {
    /**
     * Gets the data to every user in the users parameter
     * Calls the callback function with the JSON Data when request finished
     * @param {string} users comma seperated list with usernames
     * @param {object} context sets the Object 'this' is referring to in the callback function
     * @param {function} callback function(data) that gets called after the request finished
     */
    static getUsers(users, context, callback) {
        $.ajax({
            context: context,
            url: ('https://api.twitch.tv/helix/users'),
            dataType: 'json',
            headers: {
                'Client-ID': TwitchConstants.CLIENT_ID,
            },
            data: {login: users},
            async: true,
        }).done(callback);
    }

    /**
     * Gets the data to the user the OAuth token is from
     * @return {data}
     */
    static async getUserFromOAuth() {
        const data = await $.ajax({
            statusCode: {
                401: function() {
                    window.location.replace(TwitchConstants.AUTHORIZE_URL);
                },
            },
            url: ('https://id.twitch.tv/oauth2/validate'),
            dataType: 'json',
            headers: {
                'Authorization': ('OAuth ' + localStorage.accessToken),
            },
        });
        return data;
    }

    /**
     * Gets the names of all chatters in the specified chat
     * @param {string} chatName name of the chat
     * @param {object} context sets the Object 'this' is referring to in the callback function
     * @param {function} callback function(data) that gets called after the request finished
     */
    static getChatterList(chatName, context, callback) {
        $.ajax({
            context: context,
            url: ('https://tmi.twitch.tv/group/user/' + chatName
                + '/chatters'),
            headers: {'Accept': 'application/vnd.twitchtv.v5+json'},
            dataType: 'jsonp',
            async: true,
        }).done(callback);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Gets recent messages from the specified chat
     * @param {string} chatId
     * @param {object} context sets the Object 'this' is referring to in the callback function
     * @param {function} callback function(data) that gets called after the request finished
     */
    static getRecentMessages(chatId, context, callback) {
        // Download recent messages
        $.ajax({
            context: context,
            type: 'GET',
            url: ('https://chats.c0ldplasma.de/php/recentMessages.php'),
            data: {chatId: chatId},
            async: true,
        }).done(callback);
    }
}

/**
 * @param data.token.user_name
 * @param data.token.user_id
 */
class AppUser {
    /**
     * @constructor
     */
    constructor() {
        /** @private */
        this.userName_ = '';
        // noinspection JSUnusedGlobalSymbols
        /** @private */
        this.userNameLC_ = '';
        // noinspection JSUnusedGlobalSymbols
        /** @private */
        this.userId_ = '';
    }

    /**
     * Getter
     * @return {string} this.userName_
     */
    getUserName() {
        return this.userName_;
    }
    /**
     * Getter
     * @return {string} this.userId_
     */
    getUserId() {
        return this.userId_;
    }

    /**
     * Sends an ajax request to twitch to receive userName_ and userId_ of the AppUser
     * @return {Promise}
     */
    async requestAppUserData() {
        return await TwitchApi.getUserFromOAuth().then((data) => {
            console.log(data);
            if (typeof(data.login) !== 'undefined') {
                this.userName_ = data.login;
                // noinspection JSUnusedGlobalSymbols
                this.userNameLC_ = data.login.toLowerCase();
                // noinspection JSUnusedGlobalSymbols
                this.userId_ = data.user_id;
            } else {
                alert('Error while getting username');
            }
        });
    }
}

var version = "0.4.0";

class TwitchIRCConnection {
    /**
     * @param {AppUser} appUser
     * @constructor
     */
    constructor(appUser) {
        /** @private */
        this.appUser_ = appUser;

        if (new.target === TwitchIRCConnection) {
            throw new TypeError('Cannot construct abstract instances ' +
                'of TwitchIRCConnection directly');
        }
        this.isLoaded_ = false;
        this.connection_ = new WebSocket(TwitchConstants.WEBSOCKET_URL);
        this.connection_.onopen = this.onOpen_.bind(this);
        this.connection_.onerror = TwitchIRCConnection.onError_.bind(this);
    }

    /**
     * Gets called when the connection established
     * @private
     */
    onOpen_() {
        this.connection_.send('CAP REQ :twitch.tv/membership');
        this.connection_.send('CAP REQ :twitch.tv/tags');
        this.connection_.send('CAP REQ :twitch.tv/commands');
        this.connection_.send('PASS oauth:' + localStorage.accessToken);
        this.connection_.send('NICK ' + this.appUser_.getUserName());
        this.isLoaded_ = true;
    }

    /**
     * @return {boolean}
     */
    isLoaded() {
        return this.isLoaded_;
    }

    /**
     * Gets called on error
     * @private
     */
    static onError_() {
        console.log('WebSocket Error ' + error);
        alert('ERROR: ' + error);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Gets called on message
     * @param {object} event event triggered by the Websocket connection
     * @private
     * @abstract
     */
    onMessage_(event) {};

    /**
     * Leave the specified chat
     * @param {string} chatName
     */
    leaveChat(chatName) {
        this.connection_.send('PART #' + chatName);
    }

    /**
     * Join the specified chat
     * @param {string} chatName
     */
    joinChat(chatName) {
        this.connection_.send('JOIN #' + chatName);
    }

    /**
     * Sends the specified message to the Websocket connection
     * @param {string} message
     */
    send(message) {
        this.connection_.send(message);
    }
}

class SendIRCConnection extends TwitchIRCConnection {
    /**
     * @param {AppUser} appUser
     * @constructor
     */
    constructor(appUser) {
        super(appUser);
        this.connection_.onmessage = this.onMessage_.bind(this);
    }

    /**
     * @param {object} event event triggered by the Websocket connection
     * @private
     */
    onMessage_(event) {
        let messages = event.data.split('\n');

        for (let i = 0; i < messages.length; i++) {
            let msg = messages[i];

            if (msg.length <= 1) {
                continue;
            }

            if (msg.startsWith('PING :tmi.twitch.tv')) {
                this.connection_.send('PONG :tmi.twitch.tv');
            }
        }
    }
}

class ReceiveIRCConnection extends TwitchIRCConnection {
    /**
     * @param {AppUser} appUser
     * @param {MessageParser} messageParser
     * @param {ChatManager} chatManager
     * @constructor
     */
    constructor(appUser, messageParser, chatManager) {
        super(appUser);
        this.messageParser_ = messageParser;
        this.chatManager_ = chatManager;
        this.connection_.onmessage = this.onMessage_.bind(this);
    }

    /**
     * @param {object} event event triggered by the Websocket connection
     * @private
     */
    onMessage_(event) {
        let messages = event.data.split('\n');

        for (let i = 0; i < messages.length; i++) {
            let msg = messages[i];
            if (msg.startsWith('PING :tmi.twitch.tv')) {
                this.connection_.send('PONG :tmi.twitch.tv');
            } else if (msg.length > 1) {
                let chatMessages = this.messageParser_.parseMessage(msg);
                this.chatManager_.addMessages(chatMessages);
            } else {
                // console.log('Received empty message in ReceiveIRVConnection onMessage_()');
            }
        }
    }
}

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
                while (channelsArray.length) {
                    let channels = channelsArray.splice(0, 98);
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
     * @param {Array.<string>} channelArray channel name or null
     */
    addFavToList(channelArray) {
        let channels = document.getElementById('newFavInput').value.split(',');
        if ($.isArray(channelArray)) {
            channels = channelArray;
        }
        let channelsCount = channels.length;

        TwitchApi.getUsers(channels, this, function(data) {
            data = data.data;
            let notExistingChannelsCount = channelsCount - data._total;
            for (let i = 0; i < data.length; i++) {
                let channel = data[i].display_name;
                let channelId = data[i].id;
                let profilePicURL = data[i].profile_image_url;
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
                event.data.chatManager_.addChat(channel, channelId);
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

class ChatMessage {
    /**
     * @param {string} chatName Name of the chat the message is for
     * @param {string} content The actual content of the message
     * @constructor
     */
    constructor(chatName, content) {
        this.chatName_ = chatName;
        /** @private */
        this.timestamp_ = this.getCurrentTimeFormatted_();
        /** @private */
        this.content_ = content.trim();
        /** @private */
    }

    /**
     * @return {string}
     */
    getContent() {
        return this.content_;
    }
    /**
     * @return {string}
     */
    getTimestamp() {
        return this.timestamp_;
    }
    /**
     * @return {string}
     */
    getChatName() {
        return this.chatName_;
    }

    // noinspection JSMethodCanBeStatic
    /**
     * Returns the current time in 24h format
     * @return {string} time in format HH:MM
     * @private
     */
    getCurrentTimeFormatted_() {
        let currentDate = new Date();
        let time;
        if (currentDate.getHours() >= 10 && currentDate.getMinutes() >= 10) {
            time = currentDate.getHours() + ':' + currentDate.getMinutes();
        } else if (currentDate.getHours() < 10 && currentDate.getMinutes() >= 10) {
            time = '0' + currentDate.getHours() + ':' + currentDate.getMinutes();
        } else if (currentDate.getHours() >= 10 && currentDate.getMinutes() < 10) {
            time = currentDate.getHours() + ':0' + currentDate.getMinutes();
        } else {
            time = '0' + currentDate.getHours() + ':0' + currentDate.getMinutes();
        }
        return time;
    }
    /**
     * @return {string} HTML Code
     */
    getHtml() {
        return '<li style="border-top: 1px solid #673ab7;' +
            'border-bottom: 1px solid #673ab7;padding-top: 3px; ' +
            'padding-bottom: 3px;"><span style="color: gray;' +
            'font-size: 11px;">' + this.timestamp_ + '</span>  ' +
            this.content_
            + '</li>';
    }
}

class RoomstateMessage extends ChatMessage {
    /**
     * @param {string} chatName Name of the chat the message is for
     * @param {string} content The actual content of the message
     * @constructor
     */
    constructor(chatName, content) {
        super(chatName, content);
    }

    /**
     * @return {string} HTML Code
     */
    getHtml() {
        return '<p style="color: gray; font-size: 11px;' +
            'padding-left: 10px;font-weight: 200;">' + this.getContent() + '</p>';
    }
}

class Chat {
    /**
     * Adds the chat column for channelName to the app
     *
     * @param {string} channelName Name of the channel
     * @param {string} channelId
     * @param {EmoteManager} emoteManager
     * @param {ReceiveIRCConnection} receiveIrcConnection
     * @param {SendIRCConnection} sendIrcConnection
     * @param {MessageParser} messageParser
     */
    constructor(channelName, channelId, emoteManager, receiveIrcConnection, sendIrcConnection,
                messageParser) {
        /** @private */
        this.channelName_ = channelName;
        /** @private */
        this.channelId_ = channelId;
        /** @private */
        this.channelNameLC_ = channelName.toLowerCase();
        /** @private */
        this.emoteManager_ = emoteManager;
        /** @private */
        this.receiveIrcConnection_ = receiveIrcConnection;
        /** @private */
        this.sendIrcConnection_ = sendIrcConnection;
        /** @private */
        this.messageParser_ = messageParser;
        /** @private */
        this.messageCount_ = 0;
        /** @private */
        this.containerCount_ = 0;
        /** @private
         *  @const */
        this.MESSAGE_LIMIT_ = 200000;
        /** @private
         *  @const */
        this.MESSAGES_IN_CONTAINER_ = 100;

        this.loadRecentMessages_();
    }

    /**
     * @param {Object.<ChatMessage>} chatMessage
     */
    addMessage(chatMessage) {
        if (chatMessage instanceof RoomstateMessage) {
            let chatInput = $('.chatInput#' + chatMessage.getChatName().toLowerCase());
            chatInput.append(chatMessage.getHtml());
        } else {
            let chatMessageList = $('#' + this.channelName_.toLowerCase() + 'contentArea');

            if (chatMessageList.children('div').length === 0 ||
                (chatMessageList.children('div').length !== 0 &&
                    chatMessageList.children('div:last')
                        .children('li').length >= this.MESSAGES_IN_CONTAINER_)) {
                chatMessageList.append('<div></div>');
                this.containerCount_++;
            }
            chatMessageList.children('div:last').append(chatMessage.getHtml());
            this.messageCount_++;
            this.limitMessages_();
            this.hideNotVisibleMessages();
            this.correctScrollPosition_();
        }
    }

    /**
     * Downloads recent chat messages and adds them to the chat
     * @private
     */
    loadRecentMessages_() {
        TwitchApi.getRecentMessages(this.channelId_, this, function(data) {
            let recentMessages = JSON.parse(data).messages;
            for (let j = 0; j < recentMessages.length; j++) {
                let chatMessages = this.messageParser_.parseMessage(recentMessages[j]);
                for (let i = 0; i < chatMessages.length; i++) {
                    this.addMessage(chatMessages[i]);
                }
            }
        });
    }

    /**
     * Checks whether there are more than this.MESSAGE_LIMIT_ messages in chat.
     * If yes than remove the first div with messages
     * @private
     */
    limitMessages_() {
        if (this.messageCount_ >= this.MESSAGE_LIMIT_) {
            $('#' + this.channelName_ + ' .chatContent .chatMessageList div:first').remove();
            // noinspection JSUnusedGlobalSymbols
            this.messageCount_ -= this.MESSAGES_IN_CONTAINER_;
            this.containerCount_--;
        }
    }

    /**
     * When chat is scrolled to bottom, this hides all message containers except the last 3
     */
    hideNotVisibleMessages() {
        // Hide all divs with 100 messages each which are not the last 3 to improve performance
        if (this.containerCount_ > 3 && this.isScrolledToBottom()) {
            let chatMessageList = $('#' + this.channelName_ + 'contentArea');
            chatMessageList.children('div:visible').slice(0, -3).hide();
        }
    }

    /**
     * Checks if the Chat is scrolled to the bottom
     * @return {boolean} True if on bottom, false if not
     */
    isScrolledToBottom() {
        let bottom = false;
        let chatContent = $('#' + this.channelNameLC_ + 'scrollArea');
        if (chatContent[0].scrollHeight - chatContent.scrollTop()
            < chatContent.outerHeight() + 50) bottom = true;
        return bottom;
    }

    /**
     * @private
     */
    correctScrollPosition_() {
        // Scroll to bottom
        let bottom = this.isScrolledToBottom();
        let chatContent = $('#' + this.channelNameLC_ + 'scrollArea');
        if (bottom) {
            let contentHeight = chatContent[0].scrollHeight;
            chatContent.scrollTop(contentHeight + 50);
            // chatContent.stop(true, false).delay(50)
            // .animate({ scrollTop: contentHeight }, 2000, 'linear');
            $('#' + this.channelNameLC_ + ' .chatContent .chatMessageList')
                .find('p:last').imagesLoaded(function() {
                setTimeout(function() {
                    contentHeight = chatContent[0].scrollHeight;
                    chatContent.scrollTop(contentHeight + 50);
                    // chatContent.stop(true, false).delay(50)
                    // .animate({ scrollTop: contentHeight }, 2000, 'linear');
                    // alert("wub");
                }, 50);
            });
        } else if (!bottom
            && $('#' + this.channelNameLC_ + ' .chatNewMessagesInfo').is(':hidden')) {
            let contentHeight = chatContent[0].scrollHeight;
            chatContent.scrollTop(contentHeight + 50);
            // chatContent.stop(true, false).delay(50)
            // .animate({ scrollTop: contentHeight }, 2000, 'linear');
        }
    }

    /**
     * @return {string} HTML Code for the chat
     */
    getHtml() {
        let channelLC = this.channelName_.toLowerCase();
        return '<div class="chat" id="' + channelLC + '">' +
            '<div class="chatHeader" >' +
            '<button class="toggleViewerlist" id="' + channelLC + '"></button>' +
            '<span>' + this.channelName_ + '</span>' +
            '<button class="removeChat" id="' + channelLC + '"></button>' +
            '<button class="toggleStream" id="' + channelLC + '"></button>' +
            '</div>' +
            '<div class="chatContent" id="' + channelLC + 'scrollArea">' +
            '<div class="chatMessageList" id="' + channelLC + 'contentArea">' +
            '</div></div>' +
            '<div class="chatInput" id="' + channelLC + '">' +
            '<div class="chatNewMessagesInfo" id="' + channelLC + '">' +
            'More messages below.</div>' +
            '<img class="kappa" src="/img/Kappa.png" />' +
            '<textarea maxlength="500" class="chatInputField" id="'
            + channelLC +
            '" placeholder="Send a message..."></textarea>' +
            '<div class="emoteMenu">' +
            '<div class="emotes">' +
            '<div class="bttvEmotes" style="width: 100%;">' +
            '<h3>BTTV Emotes</h3></div>' +
            '<div class="bttvChannelEmotes" style="width: 100%;">' +
            '<h3>BTTV Channel Emotes</h3></div>' +
            '<div class="ffzEmotes" style="width: 100%;">' +
            '<h3>FFZ Emotes</h3></div>' +
            '<div class="ffzChannelEmotes" style="width: 100%;">' +
            '<h3>FFZ Channel Emotes</h3></div>' +
            '</div></div></div>'
            + '<div class="chatViewerlist" id="' + channelLC + '">' +
            '</div></div>';
    }

    /**
     * Adds all abilities to the Chat (Button actions etc.)
     */
    addAbilities() {
        this.addEmotesToEmoteMenu_();
        this.addEmoteMenuImgClickAbility_();
        this.addEmoteMenuGroupClickAbility_();
        this.addEmoteMenuToggleAbility_();
        this.addEmoteMenuDraggableAbility_();
        this.addEmoteMenuResizableAbility_();
        this.addStreamIframeAbility_();
        this.addResizeAbility_();
        this.addChatterListAbility_();
        this.addSendMessagesAbility_();
        this.addNewMessageInfoAbility_();
    }
    /**
     * @private
     */
    addEmotesToEmoteMenu_() {
        let channelLC = this.channelName_.toLowerCase();
        let userEmotes = this.emoteManager_.getUserEmotes();
        // Twitch Global/Channel
        for (let j in userEmotes) {
            if ({}.hasOwnProperty.call(userEmotes, j)) {
                let emoteSet = userEmotes[j];
                $('.chatInput[id$=\'' + channelLC + '\'] .emoteMenu .emotes')
                    .prepend('<div class="' + j + '" style="width: 100%;">' +
                        '<h3>' + j + '</h3></div>');
                for (let k in emoteSet) {
                    if ({}.hasOwnProperty.call(emoteSet, k)) {
                        $('.chatInput[id$=\'' + channelLC
                            + '\'] .emoteMenu .emotes .' + j)
                            .append('<img ' +
                                'src=\'https://static-cdn.jtvnw.net/emoticons/v1/'
                                + emoteSet[k].id + '/1.0\' alt=\''
                                + emoteSet[k].code + '\' />');
                    }
                }
            }
        }
        // BTTV Global
        let bttvGlobal = this.emoteManager_.getBttvGlobal();
        for (let i = 0; i < bttvGlobal.length; i++) {
            if (bttvGlobal[i].channel == null) {
                $('.chatInput[id$=\'' + channelLC + '\'] .emoteMenu .bttvEmotes')
                    .append('<img src="https://cdn.betterttv.net/emote/'
                        + bttvGlobal[i].id + '/1x" alt="' + bttvGlobal[i].code
                        + '" />');
            }
        }
        // FFZ Global
        let ffzGlobal = this.emoteManager_.getFfzGlobal();
        for (let j = 0; j < ffzGlobal.default_sets.length; j++) {
            let emoteSetGlobal = ffzGlobal.default_sets[j];
            let emotesInSetGlobal = ffzGlobal['sets'][emoteSetGlobal]['emoticons'];
            for (let k = 0; k < emotesInSetGlobal.length; k++) {
                // let ffzEmoteName = JSON.stringify(emotesInSetGlobal[k].name);

                $('.chatInput[id$=\'' + channelLC + '\'] .emoteMenu .ffzEmotes')
                    .append('<img src=\'https:' +
                        emotesInSetGlobal[k]['urls']['1'] + '\' ' +
                        'alt=\'' + emotesInSetGlobal[k].name + '\' />');
            }
        }
        // BTTV Channel
        let bttvChannels = this.emoteManager_.getBttvChannels();
        if (bttvChannels.hasOwnProperty(channelLC)) {
            for (let j = 0; j < bttvChannels[channelLC].length; j++) {
                /* let bttvChannelEmote =
                    JSON.stringify(bttvChannels[channelLC][j].code);*/

                let emoteId = JSON.stringify(bttvChannels[channelLC][j].id)
                    .substring(1,
                        JSON.stringify(bttvChannels[channelLC][j].id).length - 1);
                $('.chatInput[id$=\'' + channelLC
                    + '\'] .emoteMenu .bttvChannelEmotes')
                    .append('<img src=\'https://cdn.betterttv.net/emote/' +
                        emoteId +
                        '/1x\' alt=\'' + bttvChannels[channelLC][j].code + '\' />');
            }
        }
        // FFZ Channel
        let ffzChannels = this.emoteManager_.getFfzChannels();
        if (ffzChannels.hasOwnProperty(channelLC)) {
            let ffzChannelId = ffzChannels[channelLC]['room']['_id'];
            if (ffzChannels[channelLC]['sets'][ffzChannelId] != null) {
                let ffzChannelEmoteSet =
                    ffzChannels[channelLC]['sets'][ffzChannelId]['emoticons'];
                for (let j = 0; j < ffzChannelEmoteSet.length; j++) {
                    /* let ffzChannelEmote =
                        JSON.stringify(ffzChannelEmoteSet[j].name);*/

                    $('.chatInput[id$=\'' + channelLC
                        + '\'] .emoteMenu .ffzChannelEmotes')
                        .append('<img src=\'https:' +
                            ffzChannelEmoteSet[j]['urls']['1'] + '\' ' +
                            'alt=\'' + ffzChannelEmoteSet[j].name + '\' />');
                }
            }
        }
    }
    /**
     * @private
     */
    addEmoteMenuImgClickAbility_() {
        let channelLC = this.channelName_.toLowerCase();
        $('.chatInput[id$=\'' + channelLC + '\'] .emoteMenu img').click(function() {
            let emoteName = $(this).attr('alt');
            let inputField = $('.chatInputField[id$=\'' + channelLC + '\']');
            let curValue = inputField.val();
            let newValue;
            if (!curValue.endsWith(' ') && curValue.length > 0) {
                newValue = curValue + ' ' + emoteName + ' ';
            } else {
                newValue = curValue + emoteName + ' ';
            }
            inputField.val(newValue);
        });
    }

    /**
     * @private
     */
    addEmoteMenuGroupClickAbility_() {
        let channelLC = this.channelName_.toLowerCase();
        $('.chatInput[id$=\'' + channelLC + '\'] .emoteMenu .emotes h3')
            .click(/* @this HTMLElement */function() {
                if ($(this).parent().css('height') === '18px') {
                    $(this).parent().css({'height': ''});
                } else {
                    $(this).parent().css({'height': '18px'});
                }
            });
    }

    /**
     * @private
     */
    addEmoteMenuToggleAbility_() {
        let channelLC = this.channelName_.toLowerCase();
        let $emoteMenu = $('.chatInput[id$=\'' + channelLC + '\'] .emoteMenu');
        $('.chatInput[id$=\'' + channelLC + '\'] .kappa').click(function() {
            if ($emoteMenu.is(':hidden')) {
                $('.chatInput[id$=\'' + channelLC + '\'] .emoteMenu').show();
            } else {
                $emoteMenu.hide();
                $emoteMenu.css({
                    'top': '',
                    'left': '',
                    'right': '',
                    'bottom': '',
                });
            }
        });
    }

    /**
     * @private
     */
    addEmoteMenuDraggableAbility_() {
        let channelLC = this.channelName_.toLowerCase();
        let $emoteMenu = $('.chatInput[id$=\'' + channelLC + '\'] .emoteMenu');
        let chatArea = $('#main-chat-area');
        $emoteMenu.draggable({
            containment: chatArea,
        });
    }
    /**
     * @private
     */
    addEmoteMenuResizableAbility_() {
        let channelLC = this.channelName_.toLowerCase();
        let $emoteMenu = $('.chatInput[id$=\'' + channelLC + '\'] .emoteMenu');
        $emoteMenu.resizable({
            handles: 'n, ne, e',
            minHeight: 200,
            minWidth: 200,
        });
    }
    /**
     * @private
     */
    addStreamIframeAbility_() {
        let channelLC = this.channelName_.toLowerCase();
        $(document).on('click', '.toggleStream[id$=\'' + channelLC + '\']',
            /* @this HTMLElement */function() {
                if ($(this).parent().parent().find('.chatStream').length) {
                    $(this).parent().parent().find('.chatStream').remove();
                    $(this).parent().parent().find('.chatContent')
                        .css({'height': 'calc(100% - 105px)'});
                    $(this).parent().parent().find('.chatViewerlist')
                        .css({'height': 'calc(100% - 35px)'});
                } else {
                    $(this).parent().parent().prepend(
                        '<div class="chatStream" id="' + channelLC + '">' +
                        '<div class="chatStreamInner">' +
                        '<iframe src="https://player.twitch.tv/?channel=' + channelLC
                        + '" frameborder="0" allowfullscreen="true"' +
                        ' scrolling="no" height="100%" width="100%"></iframe>' +
                        '</div></div>');
                    $(this).parent().parent().find('.chatContent')
                        .css({
                            'height': 'calc(100% - 105px - ' +
                            $(this).parent().parent()
                                .find('.chatStream').outerHeight() + 'px )',
                        });
                    $(this).parent().parent().find('.chatViewerlist')
                        .css({
                            'height': 'calc(100% - 35px - ' +
                            $(this).parent().parent()
                                .find('.chatStream').outerHeight() + 'px )',
                        });
                }
            });
    }
    /**
     * @private
     */
    addResizeAbility_() {
        let channelLC = this.channelName_.toLowerCase();
        $(document).on('resize', '.chat[id$=\'' + channelLC + '\']', function() {
            $(this).find('.chatContent')
                .css({
                    'height': 'calc(100% - 105px - ' + $(this)
                        .find('.chatStream').outerHeight() + 'px )',
                });
            $(this).find('.chatViewerlist')
                .css({
                    'height': 'calc(100% - 35px - ' + $(this)
                        .find('.chatStream').outerHeight() + 'px )',
                });
        });
        $('.chat[id$=\'' + channelLC + '\']').resizable({
            handles: 'e',
            start: function() {
                $('iframe').css('pointer-events', 'none');
            },
            stop: function() {
                $('iframe').css('pointer-events', 'auto');
            },
        });
        let contentHeightOld =
            $('.chatContent[id$=\'' + channelLC + 'scrollArea\'] .chatMessageList').height();
        $('.chat[id$=\'' + channelLC).resize(function() {
            let $newMessagesInfo = $('.chatNewMessagesInfo[id$=\'' + channelLC + '\']');
            let $chatContent = $('#' + channelLC + ' .chatContent');
            let $chatContentArea = $('.chatContent[id$=\'' + channelLC + 'contentArea\']');
            if ($newMessagesInfo.is(':hidden') && contentHeightOld <= $chatContentArea.height()) {
                $chatContent.scrollTop($chatContent[0].scrollHeight + 50);
                contentHeightOld = $chatContentArea.height();
            }
            if ($newMessagesInfo.is(':hidden')) {
                $chatContent.scrollTop($chatContent[0].scrollHeight + 50);
            }
        });
    }
    /**
     * @private
     */
    addChatterListAbility_() {
        let channelLC = this.channelName_.toLowerCase();
        let toggleVL = 0;
        $(document).on('click', '.toggleViewerlist[id$=\'' + channelLC + '\']', function() {
            // if ($(this).parent().parent().find("div.chatViewerlist")
            // .css("display").toLowerCase() != "none") {
            if (toggleVL % 2 !== 0) {
                $(this).parent().parent().find('div.chatViewerlist').hide();
                $(this).parent().parent().find('div.chatContent').show();
                $(this).parent().parent().find('div.chatInput').show();
            } else {
                $(this).parent().parent().find('div.chatContent').hide();
                $(this).parent().parent().find('div.chatInput').hide();
                $(this).parent().parent().find('div.chatViewerlist').show();

                let viewerlist =
                    $(this).parent().parent().find('div.chatViewerlist');

                TwitchApi.getChatterList(channelLC, this, function(data) {
                    viewerlist.empty();
                    data = data.data;
                    viewerlist.append('Chatter Count: ' + data.chatter_count +
                        '<br /><br />');

                    let chatters = data.chatters;
                    if (chatters.moderators.length > 0) {
                        viewerlist.append('<h3>Moderators</h3>');
                        let modList = '<ul>';
                        for (let i = 0; i < chatters.moderators.length; i++) {
                            modList += '<li>' + chatters.moderators[i] + '</li>';
                        }
                        modList += '</ul><br />';
                        viewerlist.append(modList);
                    }
                    if (chatters.staff.length > 0) {
                        viewerlist.append('<h3>Staff</h3>');
                        let staffList = '<ul>';
                        for (let i = 0; i < chatters.staff.length; i++) {
                            staffList += '<li>' + chatters.staff[i] + '</li>';
                        }
                        staffList += '</ul><br />';
                        viewerlist.append(staffList);
                    }
                    if (chatters.admins.length > 0) {
                        viewerlist.append('<h3>Admins</h3>');
                        let adminsList = '<ul>';
                        for (let i = 0; i < chatters.admins.length; i++) {
                            adminsList += '<li>' + chatters.admins[i] + '</li>';
                        }
                        adminsList += '</ul><br />';
                        viewerlist.append(adminsList);
                    }
                    if (chatters.global_mods.length > 0) {
                        viewerlist.append('<h3>Global Mods</h3>');
                        let globalModsList = '<ul>';
                        for (let i = 0; i < chatters.global_mods.length; i++) {
                            globalModsList +=
                                '<li>' + chatters.global_mods[i] + '</li>';
                        }
                        globalModsList += '</ul><br />';
                        viewerlist.append(globalModsList);
                    }
                    if (chatters.viewers.length > 0) {
                        viewerlist.append('<h3>Viewers</h3>');
                        let viewersList = '<ul>';
                        for (let i = 0; i < chatters.viewers.length; i++) {
                            viewersList += '<li>' + chatters.viewers[i] + '</li>';
                        }
                        viewersList += '</ul><br />';
                        viewerlist.append(viewersList);
                    }
                });
            }
            toggleVL++;
        });
    }
    /**
     * @private
     */
    addSendMessagesAbility_() {
        let channelLC = this.channelName_.toLowerCase();
        $('.chatInputField[id$=\'' + channelLC + '\']').keydown(this, function(event) {
            if (event.keyCode === 13) {
                event.preventDefault();
                if ($(this).val().startsWith('.')
                    || $(this).val().startsWith('/')) {
                    event.data.receiveIrcConnection_.send('PRIVMSG #' + channelLC + ' :'
                        + $(this).val());
                } else {
                    event.data.sendIrcConnection_.send('PRIVMSG #' + channelLC
                        + ' :' + $(this).val());
                }
                $(this).val('');
            } else if (event.keyCode === 9) {
                event.preventDefault();
                if ($(this).val().length !== 0 && !$(this).val().endsWith(' ')) {
                    console.log('WUB');
                }
            }
        });
    }
    /**
     * @private
     */
    addNewMessageInfoAbility_() {
        let channelLC = this.channelName_.toLowerCase();
        $('.chatNewMessagesInfo[id$=\'' + channelLC + '\']').click(function() {
            $(this).hide();
            let $chatContent = $('#' + channelLC + ' .chatContent');
            $chatContent.scrollTop($chatContent[0].scrollHeight);
        });
        $('.chatContent[id$=\'' + channelLC + 'scrollArea\']').scroll(
            /* @this HTMLElement */function() {
                // Bug workaround: unexpected horizontal scrolling
                // despite overflow-x: hidden
                if ($(this).scrollLeft() !== 0) {
                    $(this).scrollLeft(0);
                }
                // New messages info scroll behavior
                if ($(this)[0].scrollHeight - $(this).scrollTop()
                    < $(this).outerHeight() + 50) {
                    $('.chatNewMessagesInfo[id$=\'' + channelLC + '\']').hide();
                } else {
                    $('.chatNewMessagesInfo[id$=\'' + channelLC + '\']').show();
                }

                if ($(this).scrollTop() < 200) {
                    $('.chatContent[id$=\'' + channelLC
                        + 'scrollArea\'] .chatMessageList')
                        .children('div:hidden:last').show();
                }
            });
    }
}

//import SimpleBar from '../../public/lib/simplebar.js';

/**
 * Represents the whole application
 */
class ChatManager {
    /**
     * Creates the ChatManager
     * @param {EmoteManager} emoteManager
     * @param {MessageParser} messageParser
     */
    constructor(emoteManager, messageParser) {
        /**
         * @private
         * @type {Object.<string, Chat>}
         */
        this.chatList_ = {};
        this.emoteManager_ = emoteManager;
        this.messageParser_ = messageParser;

        // Bug workaround: unexpected vertical scrolling
        // despite overflow-y: hidden
        $('#main-chat-area').scroll(function() {
            if ($(this).scrollTop() !== 0) {
                $(this).scrollTop(0);
            }
        });
    }

    setReceiveIrcConnection(receiveIrcConnection) {
        this.receiveIrcConnection_= receiveIrcConnection;
    }
    setSendIrcConnection(sendIrcConnection) {
        this.sendIrcConnection_ = sendIrcConnection;
    }

    /**
     * Adds the chat messages to the correct chat
     * @param {Array.<ChatMessage>} chatMessages
     */
    addMessages(chatMessages) {
        for (let i = 0; i < chatMessages.length; i++) {
            let chatName = chatMessages[i].getChatName().toLowerCase();
            this.chatList_[chatName].addMessage(chatMessages[i]);
        }
    }

    /**
     * @param {string} channelName
     * @return {boolean} true if chat already in the chatList
     */
    isChatAlreadyAdded(channelName) {
        return this.chatList_.hasOwnProperty(channelName);
    }

    /**
     * Removes the Chat from the chatList_ and the DOM
     *
     * @param {Object} event
     * @private
     */
    removeChat_(event) {
        let channelName = event.data[1].toLowerCase();
        let thiss = event.data[0];
        delete thiss.chatList_[channelName];
        $(document).off('click', '.toggleStream[id$=\'' + channelName + '\']');
        $(this).parent().parent().remove();
        thiss.receiveIrcConnection_.leaveChat(channelName);
        thiss.sendIrcConnection_.leaveChat(channelName);
    }

    /**
     * Creates new Chat and adds it to the chatList_ if there is not already
     * a chat with this channelName
     * @param {string} channelName Name of the channel that will be added
     * @param {string} channelId
     */
    addChat(channelName, channelId) {
        let channelLC = channelName.toLowerCase();
        if (!this.isChatAlreadyAdded(channelLC) && this.receiveIrcConnection_.isLoaded() &&
                this.sendIrcConnection_.isLoaded()) {
            this.chatList_[channelLC] = new Chat(channelName, channelId, this.emoteManager_,
                this.receiveIrcConnection_, this.sendIrcConnection_, this.messageParser_);
            let chatArea = $('#main-chat-area');
            chatArea.append(this.chatList_[channelLC].getHtml());
            this.chatList_[channelLC].addAbilities();

            this.receiveIrcConnection_.joinChat(channelLC);
            this.sendIrcConnection_.joinChat(channelLC);

            $(document).on('click', '.removeChat[id$=\'' + channelLC + '\']',
                [this, channelName], this.removeChat_);

            baron('#' + channelLC + 'scrollArea');

            // ToDO: Check if .sortable is needed every time
            chatArea.sortable({
                handle: '.chatHeader',
                start(event, ui) {
                    ui.placeholder.width(ui.item.width());
                    ui.placeholder.height(ui.item.height());
                },
                animation: 300,
                cursor: 'move',
                revert: 200,
                scroll: true,
                containment: 'parent',
            });
        }
    }
}

class UserMessage extends ChatMessage {
    /**
     * @param {string} chatName Name of the chat the message is for
     * @param {string} content The actual content of the message
     * @param {array} badges List of badges shown in front of the name
     * @param {Array.<string>} emotePositions
     * @param {string} chatterName Name of the chatter the message is from
     * @param {string} chatterColor The color of the chatters name in hex #xxxxxx
     * @param {boolean} action
     * @param {EmoteManager} emoteManager
     * @param {BadgeManager} badgeManager
     * @constructor
     */
    constructor(chatName, content, badges, emotePositions, chatterName, chatterColor, action,
                emoteManager, badgeManager) {
        super(chatName, content);
        /** @private */
        this.badges_ = badges;
        /** @private */
        this.emotes_ = emotePositions;
        /** @private */
        this.chatterName_ = chatterName;
        /** @private */
        this.chatterColor_ = chatterColor;
        /** @private */
        this.action_ = action;
        /** @private */
        this.emoteManager_ = emoteManager;
        /** @private */
        this.badgeManager_ = badgeManager;
    }

    /**
     * @return {string} HTML code
     */
    getHtml() {
        let html = this.replaceTwitchEmotesAndEscapeHtml(this.getContent());
        html = UserMessage.matchURL_(html);
        html = this.replaceBttvEmotes(html);
        html = this.replaceFfzEmotes(html);
        html = this.replaceBadges(html);
        return html;
    }

    /**
     * Replace Twitch emote texts with img html tag
     * and simultaneously escape the HTML chars in the msg
     * @param {string} userMessage
     * @return {string}
     */
    replaceTwitchEmotesAndEscapeHtml(userMessage) {
        // Replace emote texts with images
        if (this.emotes_[0] !== '' && this.emotes_[0] != null) {
            let sortEmotes = [];
            for (let j = 0; j < this.emotes_.length; j++) {
                let emote = this.emotes_[j].split(':');
                let emoteId = emote[0];
                let positions = emote[1].split(',');

                for (let k = 0; k < positions.length; k++) {
                    sortEmotes.push(
                        [positions[k].split('-')[0],
                            positions[k].split('-')[1], emoteId]);
                }
            }
            for (let k = 0; k < sortEmotes.length - 1; k++) {
                for (let l = k + 1; l < sortEmotes.length; l++) {
                    if (parseInt(sortEmotes[k][0])
                        > parseInt(sortEmotes[l][0])) {
                        let zs = sortEmotes[k];
                        sortEmotes[k] = sortEmotes[l];
                        sortEmotes[l] = zs;
                    }
                }
            }

            let diff = 0;
            let oldAfterEmotePos = 0;
            for (let k = 0; k < sortEmotes.length; k++) {
                let oldMessage = userMessage;

                let imgString = userMessage.substring(0, oldAfterEmotePos)
                    + UserMessage.escapeString_(userMessage.substring(oldAfterEmotePos,
                        parseInt(sortEmotes[k][0]) + diff)) +
                    '<span style=" display: inline-block;" >&#x200b;' +
                    '<img src=\'https://static-cdn.jtvnw.net/emoticons/v1/'
                    + sortEmotes[k][2] + '/1.0\' /></span>';

                userMessage = imgString +
                    userMessage.substring(parseInt(sortEmotes[k][1])
                        + 1 + diff, userMessage.length);
                oldAfterEmotePos = imgString.length;
                // alert(oldAfterEmotePos);
                // alert(userMessage);
                diff += userMessage.length - oldMessage.length;
            }
        } else {
            userMessage = UserMessage.escapeString_(userMessage);
        }
        return userMessage;
    }

    /**
     * Replaces Bttv emote texts with img html tag
     * @param {string} userMessage
     * @return {string}
     */
    replaceBttvEmotes(userMessage) {
        // Replace BTTV Global Emotes with img
        let bttvGlobal = this.emoteManager_.getBttvGlobal();
        for (let j = 0; j < bttvGlobal.length; j++) {
            if (bttvGlobal[j].channel == null) {
                let find = JSON.stringify(bttvGlobal[j].code);
                find = find.substring(1, find.length - 1);
                find = '(^|\\b|\\s)' +
                    find.replace(/[.?*+^$[\]\\(){}|-]/g, '\\$&') + '(?=\\s|$)';

                let re = new RegExp(find, 'g');

                let emoteId = JSON.stringify(bttvGlobal[j].id)
                    .substring(1, JSON.stringify(bttvGlobal[j].id).length - 1);
                userMessage = userMessage.replace(re,
                    ' <span style=" display: inline-block;" >&#x200b;' +
                    '<img src=\'https://cdn.betterttv.net/emote/' + emoteId +
                    '/1x\' alt=\'' + bttvGlobal[j].code + '\' /></span> ');
            }
        }
        // Replace BTTV Channel Emotes with img
        let bttvChannels = this.emoteManager_.getBttvChannels();
        if (bttvChannels.hasOwnProperty(this.chatName_)) {
            for (let j = 0; j < bttvChannels[this.chatName_].length; j++) {
                let find = JSON.stringify(bttvChannels[this.chatName_][j].code);
                find = find.substring(1, find.length - 1);
                find = '(^|\\b|\\s)' + find.replace(/[.?*+^$[\]\\(){}|-]/g, '\\$&') + '(?=\\s|$)';

                let re = new RegExp(find, 'g');

                let emoteId =
                    JSON.stringify(bttvChannels[this.chatName_][j].id)
                    .substring(1,
                        JSON.stringify(
                            bttvChannels[this.chatName_][j].id).length - 1);
                userMessage = userMessage.replace(re,
                    ' <span style=" display: inline-block;" >&#x200b;' +
                    '<img src=\'https://cdn.betterttv.net/emote/' +
                    emoteId +
                    '/1x\' alt=\'' +
                    bttvChannels[this.chatName_][j].code + '\' />' +
                    '</span> ');
            }
        }
        return userMessage;
    }
    /**
     * Replaces Ffz emote texts with img html tag
     * @param {string} userMessage
     * @return {string}
     */
    replaceFfzEmotes(userMessage) {
        // Replace FFZ Global Emotes with img
        let ffzGlobal = this.emoteManager_.getFfzGlobal();
        for (let j = 0; j < ffzGlobal.default_sets.length; j++) {
            let emoteSetGlobal = ffzGlobal.default_sets[j];
            let emotesInSetGlobal =
                ffzGlobal['sets'][emoteSetGlobal]['emoticons'];
            for (let k = 0; k < emotesInSetGlobal.length; k++) {
                let find = JSON.stringify(emotesInSetGlobal[k].name);
                find = find.substring(1, find.length - 1);
                find = '(^|\\b|\\s)'
                    + find.replace(/[.?*+^$[\]\\(){}|-]/g, '\\$&')
                    + '(?=\\s|$)';

                let re = new RegExp(find, 'g');

                userMessage = userMessage.replace(re,
                    ' <span style=" display: inline-block;" >&#x200b;' +
                    '<img src=\'https:' + emotesInSetGlobal[k]['urls']['1']
                    + '\' alt=\'' + emotesInSetGlobal[k].name + '\' />' +
                    '</span> ');
            }
        }
        // Replace FFZ Channel Emotes with img
        let ffzChannels = this.emoteManager_.getFfzChannels();
        if (ffzChannels.hasOwnProperty(this.chatName_)) {
            let ffzChannelId = ffzChannels[this.chatName_]['room']['_id'];
            if (ffzChannels[this.chatName_]['sets'][ffzChannelId] != null) {
                let ffzChannelEmoteSet =
                    ffzChannels[this.chatName_]['sets'][ffzChannelId]['emoticons'];
                for (let j = 0; j < ffzChannelEmoteSet.length; j++) {
                    let find = JSON.stringify(ffzChannelEmoteSet[j].name);
                    find = find.substring(1, find.length - 1);
                    find = '(^|\\b|\\s)'
                        + find.replace(/[.?*+^$[\]\\(){}|-]/g, '\\$&')
                        + '(?=\\s|$)';

                    let re = new RegExp(find, 'g');

                    userMessage = userMessage.replace(re,
                        ' <span style=" display: inline-block;" >&#x200b;' +
                        '<img src=\'https:' + ffzChannelEmoteSet[j]['urls']['1']
                        + '\' alt=\'' + ffzChannelEmoteSet[j].name + '\' />' +
                        '</span> ');
                }
            }
        }
        return userMessage;
    }

    /**
     * Puts badges img tags in the message
     * @param {string} userMessage
     * @return {string}
     */
    replaceBadges(userMessage) {
        let newElement;
        if (this.action_) {
            newElement = $('<li><span style="color: gray;font-size: 11px;">'
                + this.getTimestamp() + '</span><span style="color: ' + this.chatterColor_
                + ';font-weight: bold;"> ' + this.chatterName_ + '</span>' +
                ' <span style="color: ' + this.chatterColor_ + ';">'
                + userMessage + '</span></li>');
        } else {
            newElement = $('<li><span style="color: gray;font-size: 11px;">'
                + this.getTimestamp() + '</span><span style="color: ' + this.chatterColor_
                + ';font-weight: bold;"> ' + this.chatterName_ + '</span>: '
                + userMessage + '</li>');
        }

        // Put badges in message
        for (let j = 0; j < this.badges_.length; j++) {
            let badge = this.badges_[j].split('/');
            let badgeGroup = this.badgeManager_.getBadgesChannels()[this.chatName_][badge[0]];
            if (badge[0].localeCompare('subscriber') === 0) {
                newElement.find('span:nth-of-type(2):first').before(
                    '<div style=" display: inline-block;' +
                    'vertical-align: -32%;border-radius: 2px;' +
                    'background-image: url(' +
                    badgeGroup['versions'][badge[1]]['image_url_1x']
                    + ');" ></div>');
            } else {
                newElement.find('span:nth-of-type(2):first').before(
                    '<div style=" display: inline-block;' +
                    'vertical-align: -32%;border-radius: 2px;' +
                    'background-image: url(' +
                    this.badgeManager_
                        .getBadgesGlobal()[badge[0]]['versions'][badge[1]]['image_url_1x']
                    + ');"></div>');
            }
        }
        return newElement;
    }

    /**
     * Searches for URLs in the given String and replaces them with the
     * proper <a href=""> HTML Tag
     * @param {string} txt - Text in which the links get searched
     * @return {string} Text with <a href=""> HTML Tags
     * @private
     */
    static matchURL_(txt) {
        let pattern =
            /((^|\s|&#32;)(http(s)?:\/\/.)?(www\.)?([-a-zA-Z0-9@:%_+~#=]|\.(?!\.)){2,256}\.[a-z]{2,8}\b([-a-zA-Z0-9@:%_+.~#?&/=]*))(?=(\s|$|&#32;))/g;
        txt = txt.replace(pattern, function(str, p1) {
            let addScheme = p1.indexOf('http://') === -1
                && p1.indexOf('https://') === -1;
            let link = ' <a href="'
                + (addScheme ? 'http://' : '')
                + p1 + '" target="_blank">' + p1 + '</a>';
            if (p1.startsWith(' ')) {
                link = ' <a href="'
                    + (addScheme ? 'http://' : '') +
                    p1.substring(1, p1.length) + '" target="_blank">' + p1 + '</a>';
            } else if (p1.startsWith('&#32;')) {
                link = ' <a href="'
                    + (addScheme ? 'http://' : '') +
                    p1.substring(5, p1.length) + '" target="_blank">' + p1 + '</a>';
            }
            return link;
        });
        return txt;
    }

    /**
     * Escape HTML characters in the message before adding to the chat
     * @param {string} txt message to escape
     * @return {string} escaped message
     * @private
     */
    static escapeString_(txt) {
        return txt.replace(/&/g, '&amp;').replace(/</g, '&lt;')
            .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
            .replace(/`/g, '&#96;').replace(/!/g, '&#33;')
            .replace(/@/g, '&#64;').replace(/\$/g, '&#36;')
            .replace(/%/g, '&#37;').replace(/=/g, '&#61;')
            .replace(/\+/g, '&#43;').replace(/{/g, '&#123;')
            .replace(/}/g, '&#125;').replace(/\[/g, '&#91;')
            .replace(/]/g, '&#93;');
    }
}

var NameColorManager = {
    userColors_: {},

    /**
     * @return {Object.<string, string>}
     */
    getUserColors() {
        return this.userColors_;
    },

    /**
     * @param {string} username
     * @param {string} color hex #xxxxxx
     */
    addUserColor(username, color) {
        this.userColors_[username] = color;
    },

    /**
     * Returns a random color of the Twitch standard name colors
     * @return {string} Random color as hex #xxxxxx
     */
    randomColor() {
        let colorChoices = [
            '#ff0000', '#ff4500',
            '#ff69b4', '#0000ff',
            '#2e8b57', '#8a2be2',
            '#008000', '#daa520',
            '#00ff7f', '#b22222',
            '#d2691e', '#ff7f50',
            '#5f9ea0', '#9acd32',
            '#1e90ff',
        ];
        let randomNumber = Math.floor(Math.random() * colorChoices.length);
        return colorChoices[randomNumber];
    },

    /**
     * Does correct the name color for dark backgrounds, so they are better readable
     * @param {string} hexColor to be corrected as #xxxxxx hex value
     * @return {string} corrected color as #xxxxxx hex value
     */
    colorCorrection(hexColor) {
        // Color contrast correction
        let rgbColor = this.hex2rgb_(hexColor);
        let yiqColor = this.rgb2yiq_(rgbColor.r, rgbColor.g, rgbColor.b);
        while (yiqColor.y < 0.5) {
            rgbColor = this.yiq2rgb_(yiqColor.y, yiqColor.i, yiqColor.q);
            let hslColor = this.rgb2hsl_(rgbColor.r, rgbColor.g, rgbColor.b);
            hslColor.l = Math.min(Math.max(0, 0.1 + 0.9 * hslColor.l), 1);
            rgbColor = this.hsl2rgb_(hslColor.h, hslColor.s, hslColor.l);
            yiqColor = this.rgb2yiq_(rgbColor.r, rgbColor.g, rgbColor.b);
        }
        rgbColor = this.yiq2rgb_(yiqColor.y, yiqColor.i, yiqColor.q);
        hexColor = this.rgb2hex_(rgbColor.r, rgbColor.g, rgbColor.b);
        return hexColor.substring(0, 7);
    },

    /**
     * Converts (r,g,b) to #xxxxxx hex color
     * @param {number} r red 0-255
     * @param {number} g green 0-255
     * @param {number} b blue 0-255
     * @return {string} color as #xxxxxx hex value
     * @private
     */
    rgb2hex_(r, g, b) {
        return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    },

    /**
     * Converts a #xxxxxx hex color to a rgb color
     * @param {string} hex color as #xxxxxx hex value
     * @return {{r: number, g: number, b: number}} r, g, b: 0-255
     * @private
     */
    hex2rgb_(hex) {
        let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
        } : null;
    },

    /**
     * Converts a rgb color to a yiq color
     * @param {number} r red 0-255
     * @param {number} g green 0-255
     * @param {number} b blue 0-255
     * @return {{y: number, i: number, q: number}} y, i and q between 0.0 and 1.0
     * @private
     */
    rgb2yiq_(r, g, b) {
        // matrix transform
        let y = ((0.299 * r) + (0.587 * g) + (0.114 * b)) / 255;
        let i = ((0.596 * r) + (-0.275 * g) + (-0.321 * b)) / 255;
        let q = ((0.212 * r) + (-0.523 * g) + (0.311 * b)) / 255;
        return {
            y: y,
            i: i,
            q: q,
        };
    },

    /**
     * Converts a yiq color to a rgb color
     * @param {number} y luma 0.0-1.0
     * @param {number} i first chrominance 0.0-1.0
     * @param {number} q second chrominance 0.0-1.0
     * @return {{r: number, g: number, b: number}} r, g, b: 0-255
     * @private
     */
    yiq2rgb_(y, i, q) {
        // matrix transform
        let r = (y + (0.956 * i) + (0.621 * q)) * 255;
        let g = (y + (-0.272 * i) + (-0.647 * q)) * 255;
        let b = (y + (-1.105 * i) + (1.702 * q)) * 255;
        // bounds-checking
        if (r < 0) {
            r = 0;
        } else if (r > 255) {
            r = 255;
        }
        if (g < 0) {
            g = 0;
        } else if (g > 255) {
            g = 255;
        }
        if (b < 0) {
            b = 0;
        } else if (b > 255) {
            b = 255;
        }
        return {
            r: r,
            g: g,
            b: b,
        };
    },

    /**
     * Converts a rgb color to a hsl color
     * @param {number} r red 0-255
     * @param {number} g green 0-255
     * @param {number} b blue 0-255
     * @return {{h: number, s: number, l: number}} h: 0-360, s: 0.0-1.0, l: 0.0-1.0
     * @private
     */
    rgb2hsl_(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;

        let max = Math.max(r, g, b);
        let min = Math.min(r, g, b);
        let h = (max + min) / 2;
        let s = (max + min) / 2;
        let l = (max + min) / 2;

        if (max === min) {
            h = s = 0; // achromatic
        } else {
            let d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

            switch (max) {
                case r:
                    h = (g - b) / d + (g < b ? 6 : 0);
                    break;
                case g:
                    h = (b - r) / d + 2;
                    break;
                case b:
                    h = (r - g) / d + 4;
                    break;
            }

            h /= 6;
        }

        return {
            h: h*360,
            s: s,
            l: l,
        };
    },

    /**
     * Converts an hsl color to a rgb color
     * @param {number} h hue 0-360
     * @param {number} s saturation 0.0-1.0
     * @param {number} l lightness 0.0-1.0
     * @return {{r: number, g: number, b: number}} r, g, b: 0-255
     * @private
     */
    hsl2rgb_(h, s, l) {
        // based on algorithm from http://en.wikipedia.org/wiki/HSL_and_HSV#Converting_to_RGB
        if ( h === undefined ) {
            return {
                r: 0,
                g: 0,
                b: 0,
            };
        }

        let chroma = (1 - Math.abs((2 * l) - 1)) * s;
        let huePrime = h / 60;
        let secondComponent = chroma * (1 - Math.abs((huePrime % 2) - 1));

        huePrime = Math.floor(huePrime);
        let red;
        let green;
        let blue;

        if ( huePrime === 0 ) {
            red = chroma;
            green = secondComponent;
            blue = 0;
        } else if ( huePrime === 1 ) {
            red = secondComponent;
            green = chroma;
            blue = 0;
        } else if ( huePrime === 2 ) {
            red = 0;
            green = chroma;
            blue = secondComponent;
        } else if ( huePrime === 3 ) {
            red = 0;
            green = secondComponent;
            blue = chroma;
        } else if ( huePrime === 4 ) {
            red = secondComponent;
            green = 0;
            blue = chroma;
        } else if ( huePrime === 5 ) {
            red = chroma;
            green = 0;
            blue = secondComponent;
        }

        let lightnessAdjustment = l - (chroma / 2);
        red += lightnessAdjustment;
        green += lightnessAdjustment;
        blue += lightnessAdjustment;

        return {
            r: Math.round(red * 255),
            g: Math.round(green * 255),
            b: Math.round(blue * 255),
        };
    },
};

/**
 * @param data
 * @param data.getUsers
 * @param data.getUsers.display_name
 * @param data.logo
 * @param ffzGlobal.default_sets
 * @param data.chatter_count
 * @param data.chatters
 * @param chatters.moderators
 * @param chatters.viewers
 * @param chatters.global_mods
 * @param chatters.admins
 * @param chatters.staff
 */


class MessageParser {
    /**
     * @param {EmoteManager} emoteManager
     * @param {BadgeManager} badgeManager
     * @constructor
     */
    constructor(emoteManager, badgeManager) {
        /** @private */
        this.emoteManager_ = emoteManager;
        /** @private */
        this.badgeManager_ = badgeManager;
    }

    /**
     * Parses an IRC message from Twitch and appends it to the corresponding chat.
     *
     * @param {string} msg Single raw chat message sent by Twitch
     * @return {Array.<ChatMessage>} Array of ChatMessage and UserMessage
     */
    parseMessage(msg) {
        let msgParts = msg.split(' ');

        let chatName = MessageParser.parseChatName_(msgParts);

        if (msgParts[2].localeCompare('WHISPER') === 0) {
            // ToDo: Implement whisper
            return [];
        } else if (msgParts[2].startsWith('GLOBALUSERSTATE')) {
            return [];
        } else if (chatName.length < 1) {
            // console.log('Message with no Chat specified: ' + msg);
            return [];
        }
        /** @type {Array.<ChatMessage>} */
        let chatMessages = [];
        if (msgParts[1].localeCompare('JOIN') === 0) {
            // Ignore JOINs (a user joined a channel)
        } else if (msgParts[1].localeCompare('PART') === 0) {
            // Ignore PARTs (a user left a channel)
        } else if (msgParts[1].localeCompare('353') === 0) {
            // Ignore namelist
        } else if (msgParts[1].localeCompare('366') === 0) {
            // Ignore end of namelist
        } else if (msgParts[1].localeCompare('MODE') === 0) {
            // Ignore gain/lose of Moderator rights
        } else if (msgParts[2].localeCompare('ROOMSTATE') === 0) {
            chatMessages = MessageParser.parseRoomstate_(msg, chatName);
        } else if (msgParts[2].localeCompare('USERSTATE') === 0) {
            // Ignore Userstate
        } else if (msgParts[2].localeCompare('USERNOTICE') === 0) {
            chatMessages = this.parseUsernotice_(msg, chatName);
        } else if (msgParts[2].localeCompare('CLEARCHAT') === 0) {
            // ToDo: Bans/Timeouts
        } else if (msgParts[1].localeCompare('HOSTTARGET') === 0) {
            // Ignore hosting message
        } else if (msgParts[2].localeCompare('NOTICE') === 0
            || msgParts[1].localeCompare('PRIVMSG') === 0) {
            chatMessages = MessageParser.parseNotice_(msgParts, chatName);
        } else if (msgParts[2].localeCompare('PRIVMSG') === 0) {
            chatMessages = this.parsePrivmsg_(msgParts, chatName);
        } else if (chatName.length >= 1) {
            chatMessages = [new ChatMessage(chatName, msg)];
        } else {
            alert('Error');
        }
        return chatMessages;
    }

    /**
     * @param {Array} msgParts
     * @param {string} chatName channel the ROOMSTATE belongs to
     * @return {Array.<ChatMessage>} newMessages
     */
    parsePrivmsg_(msgParts, chatName) {
        let username = msgParts[1].split('!', 1);
        username = username[0].substring(1, username[0].length);

        let userMessage = msgParts;
        let metaInfoRaw = userMessage[0].substring(1, userMessage[0].length);
        let metaInfo = this.getMetaInfoWithColor_(metaInfoRaw.split(';'), username);
        if (metaInfo.username != null) {
            username = metaInfo.username;
        }

        userMessage = userMessage.slice(4).join(' ');
        userMessage = userMessage.substring(1, userMessage.length);

        let action = false;
        if (userMessage.startsWith('\x01ACTION')) {
            action = true;
            userMessage = userMessage.substring(8, userMessage.length - 2);
        }
        let messageContent = userMessage;
        let emotePositions = metaInfo.emotes;
        let badges = metaInfo.badges;
        let color = metaInfo.color;
        return [
            new UserMessage(chatName, messageContent, badges,
                emotePositions, username, color, action, this.emoteManager_, this.badgeManager_),
        ];
    }

    /**
     * @param {string} msg ROOMSTATE message
     * @param {string} chatName channel the ROOMSTATE belongs to
     * @return {Array.<ChatMessage>} newMessages
     * @private
     */
    static parseRoomstate_(msg, chatName) {
        let roomstateMsg = msg.split(' ')[0];
        roomstateMsg = roomstateMsg.substring(1, roomstateMsg.length);
        roomstateMsg = roomstateMsg.split(';');
        let infoMessage = '';
        let chatInput = $('#' + chatName + ' .chatInput');
        chatInput.find('p').remove();
        for (let j = 0; j < roomstateMsg.length; j++) {
            let info = roomstateMsg[j].split('=');
            let infoKeyword = info[0];
            switch (infoKeyword) {
                case 'broadcaster-lang':
                    infoMessage += info[1] + '  ';
                    break;
                case 'emote-only':
                    if (info[1].localeCompare('1') === 0) {
                        infoMessage += 'EMOTE-ONLY  ';
                    }
                    break;
                case 'followers-only':
                    if (info[1].localeCompare('-1') !== 0) {
                        infoMessage += 'FOLLOW ' + info[1] + 'm  ';
                    }
                    break;
                case 'r9k':
                    if (info[1].localeCompare('1') === 0) {
                        infoMessage += 'R9K  ';
                    }
                    break;
                case 'slow':
                    if (info[1].localeCompare('0') !== 0) {
                        infoMessage += 'SLOW ' + info[1] + 's  ';
                    }
                    break;
                case 'subs-only':
                    if (info[1].localeCompare('1') === 0) {
                        infoMessage += 'SUB  ';
                    }
                    break;
            }
        }
        return [new RoomstateMessage(chatName, infoMessage)];
    }

    /**
     * @param {string} msg USERNOTICE message
     * @param {string} chatName channel the ROOMSTATE belongs to
     * @return {Array.<ChatMessage>} newMessages
     * @private
     */
    parseUsernotice_(msg, chatName) {
        let chatMessages = [];

        let usernoticeMessage = msg.split(' ');
        usernoticeMessage = usernoticeMessage.slice(4).join(' ');
        let metaInfoRaw = msg.substring(1, msg.length).split(' ')[0].split(';');
        let metaInfo = MessageParser.getMetaInfo_(metaInfoRaw);
        chatMessages.push(new ChatMessage(chatName,
            ((metaInfo.systemMsg != null) ? (metaInfo.systemMsg + ' ') : '')));
        if (usernoticeMessage.length > 0) {
            chatMessages.push(this.parseMessage(msg.split(' ')[0] + ' :' +
                metaInfo.username.toLowerCase() + '!' +
                metaInfo.username.toLowerCase() + '@' +
                metaInfo.username.toLowerCase() + '.tmi.twitch.tv PRIVMSG #'
                + chatName + ' ' + usernoticeMessage)[0]);
        }
        return chatMessages;
    }

    /**
     * @param {Array.<string>} msgParts
     * @param {string} chatName channel the ROOMSTATE belongs to
     * @return {Array.<ChatMessage>} newMessages
     * @private
     */
    static parseNotice_(msgParts, chatName) {
        let noticeMessage = msgParts;
        let slicePoint = msgParts[2].localeCompare('NOTICE') === 0 ? 4 : 3;
        noticeMessage = noticeMessage.slice(slicePoint).join(' ');
        return [new ChatMessage(chatName, noticeMessage.substring(1, noticeMessage.length))];
    }

    /**
     * @param {Array.<string>} msgParts
     * @return {string} chatName the message belongs to
     * @private
     */
    static parseChatName_(msgParts) {
        let chatName = '';
        // Parse chat channel name the message is for
        for (let j = 0; j < msgParts.length; j++) {
            if (msgParts[j].startsWith('#')) {
                chatName = msgParts[j].slice(1, msgParts[j].length);
                chatName = chatName.trim();
                break;
            }
        }
        return chatName;
    }

    /**
     * Parses the meta information part of a chat message.
     *
     * @param {string[]} metaMsg [{@badges=<badges>},{color=<color>},...]
     * @param {string} username user from whom the message was sent
     * @return {Object} Object with one property for every meta information
     * @private
     */
    getMetaInfoWithColor_(metaMsg, username) {
        let metaInfo = {};

        metaInfo.color = '#acacbf';
        metaInfo.emotes = '';
        metaInfo.badges = '';

        let gotColor = false;
        for (let j = 0; j < metaMsg.length; j++) {
            let info = metaMsg[j].split('=');
            if (info.length <= 1 || info[1].localeCompare('') === 0) {
                continue;
            }

            if (info[0].localeCompare('color') === 0) {
                metaInfo.color = info[1];
                if (metaInfo.color.localeCompare('') === 0
                    && !(NameColorManager.getUserColors().hasOwnProperty(username))) {
                    metaInfo.color = NameColorManager.randomColor();
                    NameColorManager.addUserColor(username, metaInfo.color);
                } else if (metaInfo.color.localeCompare('') === 0
                    && NameColorManager.getUserColors().hasOwnProperty(username)) {
                    metaInfo.color = NameColorManager.getUserColors()[username];
                }
                gotColor = true;
            } else if (info[0].localeCompare('display-name') === 0) {
                metaInfo.username = info[1];
            } else if (info[0].localeCompare('emotes') === 0) {
                metaInfo.emotes = info[1].split('/');
            } else if (info[0].localeCompare('badges') === 0) {
                metaInfo.badges = info[1].split(',');
            } else if (info[0].localeCompare('system-msg') === 0) {
                metaInfo.systemMsg = info[1].replace(/\\s/g, ' ');
            } else if (info[0].localeCompare('emote-sets') === 0) {
                metaInfo.emoteSets = info[1].split(',');
            }
        }

        if (!gotColor) {
            if (NameColorManager.getUserColors().hasOwnProperty(username)) {
                metaInfo.color = NameColorManager.getUserColors()[username];
            } else {
                metaInfo.color = NameColorManager.randomColor();
                NameColorManager.addUserColor(username, metaInfo.color);
            }
        }

        // Color contrast correction
        metaInfo.color = NameColorManager.colorCorrection(metaInfo.color);

        return metaInfo;
    }

    /**
     * Parses the meta information part of a chat message.
     *
     * @param {string[]} metaMsg [{@badges=<badges>},{color=<color>},...]
     * @return {Object} Object with one property for every meta information
     * @private
     */
    static getMetaInfo_(metaMsg) {
        let metaInfo = {};

        metaInfo.emotes = '';
        metaInfo.badges = '';

        for (let j = 0; j < metaMsg.length; j++) {
            let info = metaMsg[j].split('=');
            if (info.length <= 1 || info[1].localeCompare('') === 0) {
                continue;
            }

            if (info[0].localeCompare('display-name') === 0) {
                metaInfo.username = info[1];
            } else if (info[0].localeCompare('emotes') === 0) {
                metaInfo.emotes = info[1].split('/');
            } else if (info[0].localeCompare('badges') === 0) {
                metaInfo.badges = info[1].split(',');
            } else if (info[0].localeCompare('system-msg') === 0) {
                metaInfo.systemMsg = info[1].replace(/\\s/g, ' ');
            } else if (info[0].localeCompare('emote-sets') === 0) {
                metaInfo.emoteSets = info[1].split(',');
            }
        }
        return metaInfo;
    }
}

/**
 * @param data.emoticon_sets
 * @param data.badge_sets
 */


class App {
    /**
     * Created the whole application
     * @constructor
     */
    constructor() {
        // noinspection JSIgnoredPromiseFromCall
        this.createApp();
    }

    /**
     * Create the app
     */
    async createApp() {
        document.title += ` ${version}`;
        /** @private */
        this.appUser_ = new AppUser();
        await this.appUser_.requestAppUserData();
        /** @private */
        this.badgeManager_ = new BadgeManager();
        /** @private */
        this.emoteManager_ = new EmoteManager(this.appUser_);
        /** @private */
        this.messageParser_ =
            new MessageParser(this.emoteManager_, this.badgeManager_);
        /** @private */
        this.chatManager_ = new ChatManager(this.emoteManager_, this.messageParser_);
        /** @private */
        new FavoritesList(this.badgeManager_, this.emoteManager_, this.chatManager_);
        /** @private */
        this.sendIrcConnection_ = new SendIRCConnection(this.appUser_);
        /** @private */
        this.receiveIrcConnection_ = new ReceiveIRCConnection(this.appUser_,
            this.messageParser_, this.chatManager_);
        this.chatManager_.setReceiveIrcConnection(this.receiveIrcConnection_);
        this.chatManager_.setSendIrcConnection(this.sendIrcConnection_);
    }
}

let url = window.location.href;
let urlMainAndTail = url.split('#');
let urlTailParts;

if (urlMainAndTail.length > 1) {
    urlTailParts = urlMainAndTail[1].split('&');
    localStorage.accessToken = urlTailParts[0].split('=')[1];
} else if (localStorage.getItem('accessToken') !== null) {
} else {
    window.location.replace(TwitchConstants.AUTHORIZE_URL);
}

$(function() { // this will be called when the DOM is ready
    new App();
});

}());
//# sourceMappingURL=bundle.js.map
