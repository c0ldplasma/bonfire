'use strict';
import Chat from './app/Chat.js';
/**
 * Represents the whole application
 */
class ChatList {
    /**
     * Creates the ChatList
     */
    constructor() {
        /** @private */
        this.chatList_ = {};
    }

    /**
     * @param {string} channelName
     * @return {boolean} true if chat already in the chatList
     */
    chatAlreadyAdded(channelName) {
        return this.chatList_.hasOwnProperty(channelName) ? true : false;
    }

    /**
     * Removes the Chat from the chatList_ and the DOM
     *
     * @param {string} channelName Name of the channel that will be removed
     */
    removeChat(channelName) {
        delete this.chatList_[channelName];

        //ToDo: Remove from DOM
    }

    /**
     * Creates new Chat and adds it to the chatList_ if there is not already
     * a chat with this channelName
     *
     * @param {string} channelName Name of the channel that will be added
     */
    addChat(channelName) {
        let channelLC = channelName.toLowerCase();

        connection.send('JOIN #' + channelLC);
        connectionSend.send('JOIN #' + channelLC);

        let chatArea = $('#main-chat-area');

        chatArea.append('<div class="chat" id="' + channelLC + '">' +
            '<div class="chatHeader" id="' + channelLC + '">' +
            '<button class="toggleViewerlist" id="' + channelLC + '"></button>' +
            '<span>' + channelName + '</span>' +
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
            + '<div class="chatViewerlist" id="' + channelLC + '"></div>');

        // Add Emotes to Emote Menu
        // Twitch Global
        console.log(userEmotes);
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
        for (let i = 0; i < bttvGlobal.length; i++) {
            if (bttvGlobal[i].channel == null) {
                $('.chatInput[id$=\'' + channelLC + '\'] .emoteMenu .bttvEmotes')
                    .append('<img src="https://cdn.betterttv.net/emote/'
                        + bttvGlobal[i].id + '/1x" alt="' + bttvGlobal[i].code
                        + '" />');
            }
        }
        // FFZ Global
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
        $('.chatInput[id$=\'' + channelLC + '\'] .emoteMenu img')
            .click(/* @this HTMLElement */function() {
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

        $('.chatInput[id$=\'' + channelLC + '\'] .emoteMenu .emotes h3')
            .click(/* @this HTMLElement */function() {
                if ($(this).parent().css('height') === '18px') {
                    $(this).parent().css({'height': ''});
                } else {
                    $(this).parent().css({'height': '18px'});
                }
            });
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
        $(document).on('resize', '.chat[id$=\'' + channelLC + '\']',
            /* @this HTMLElement */function() {
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
        $(document).on('click', '.removeChat[id$=\'' + channelLC + '\']',
            /* @this HTMLElement */function() {
                $(document).off('click', '.toggleStream[id$=\'' + channelLC
                    + '\']');
                $(this).parent().parent().remove();
                connection.send('PART #' + channelLC);
                connectionSend.send('PART #' + channelLC);
            });
        let toggleVL = 0;
        $(document).on('click', '.toggleViewerlist[id$=\'' + channelLC + '\']',
            /* @this HTMLElement */function() {
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

                    $.ajax({
                        url: ('https://tmi.twitch.tv/group/user/' + channelLC
                            + '/chatters'),
                        headers: {'Accept': 'application/vnd.twitchtv.v5+json'},
                        dataType: 'jsonp',
                        async: true,
                    }).done(function(data) {
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

        $('.chat[id$=\'' + channelLC + '\']').resizable({
            handles: 'e',
            start: function() {
                $('iframe').css('pointer-events', 'none');
            },
            stop: function() {
                $('iframe').css('pointer-events', 'auto');
            },
        });
        $('.chatInputField[id$=\'' + channelLC + '\']').keydown(
            /* @this HTMLElement */function(event) {
            if (event.keyCode === 13) {
                event.preventDefault();
                if ($(this).val().startsWith('.')
                    || $(this).val().startsWith('/')) {
                    connectionSend.send('PRIVMSG #' + channelLC + ' :'
                        + $(this).val());
                } else {
                    connectionSend.send('PRIVMSG #' + channelLC
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
        $('.chatNewMessagesInfo[id$=\'' + channelLC + '\']').click(
            /* @this HTMLElement */function() {
            $(this).hide();
            let $chatContent = $('#' + channelLC + ' .chatContent');
            $chatContent.scrollTop($chatContent[0].scrollHeight);
        });
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
        $emoteMenu.draggable({
            containment: chatArea,
        });
        $emoteMenu.resizable({
            handles: 'n, ne, e',
            minHeight: 200,
            minWidth: 200,
        });
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

        let contentHeightOld =
            $('.chatContent[id$=\'' + channelLC + 'scrollArea\'] .chatMessageList')
                .height();
        /* let contentWidthOld =
            $('.chatContent[id$=\'' + channelLC + 'scrollArea\'] .chatMessageList')
                .width();*/
        $('.chat[id$=\'' + channelLC).resize(function() {
            let $newMessagesInfo =
                $('.chatNewMessagesInfo[id$=\'' + channelLC + '\']');
            let $chatContent = $('#' + channelLC + ' .chatContent');
            let $chatContentArea =
                $('.chatContent[id$=\'' + channelLC + 'contentArea\']');
            if ($newMessagesInfo.is(':hidden')
                && contentHeightOld
                <= $chatContentArea
                    .height()) {
                $chatContent
                    .scrollTop($chatContent[0]
                        .scrollHeight + 50);
                // $("#" + channelLC + " .chatContent").stop(true, true)
                // .animate({ scrollTop: $("#" + channelLC + " .chatContent")[0]
                // .scrollHeight }, 1000);
                contentHeightOld =
                    $chatContentArea.height();
            }
            if ($newMessagesInfo.is(':hidden')) {
                // alert("test2");
                $chatContent
                    .scrollTop($chatContent[0]
                        .scrollHeight + 50);
                /* contentWidthOld =
                    $('.chatContent[id$=\''
                     + channelLC + 'contentArea\']').width();*/
            }
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

        // Download recent messages
        /* $.ajax({
           url: ('https://tmi.twitch.tv/api/rooms/' + channelId
           + '/recent_messages?count=50'),
           headers: {'Accept': 'application/vnd.twitchtv.v5+json',
               'Client-ID': clientID,
               'Authorization': ('OAuth ' + localStorage.accessToken)},
           dataType: 'jsonp',
           success: 'getJSONPString',
           async: true,
       }).done(function(data) {
           console.log(data);
           let recentMessages = data.messages;
           for (let j = 0; j < recentMessages.length; j++) {
               //
           }
       });*/
    }
}
export default ChatList;
