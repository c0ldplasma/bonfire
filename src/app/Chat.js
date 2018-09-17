import TwitchApi from './TwitchApi.js';
import RoomstateMessage from './RoomstateMessage.js';

/**
 * Represents one chat column on the app
 */
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

export default Chat;
