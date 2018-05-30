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
'use strict';
/**
 * Parser for parsing IRC messages sent by Twitch
 */
class MessageParser {
    /**
     * @constructor
     */
    constructor() {}
    /**
     * Parses an IRC message from Twitch and appends it to the corresponding chat.
     *
     * @param {string} msg Single raw chat message sent by Twitch
     */
    parseMessage(msg) {
        let msgParts = msg.split(' ', 5);

        if (msgParts[2].localeCompare('WHISPER') === 0) {
            // alert("Whisper");
            return;
        } else if (msgParts[2].startsWith('GLOBALUSERSTATE')) {
            let metaInfo = this.getMetaInfo_(
                msgParts[0].substring(1, msgParts[0].length).split(';'));
            console.log(metaInfo);
            return;
        } else if (channelLC.length < 1) {
            console.log(msg);
            return;
        }

        let time = this.getCurrentTimeFormatted_();

        // Parse chat channel name the message is for
        let channelLC = '';
        for (let j = 0; j < msgParts.length; j++) {
            if (msgParts[j].startsWith('#')) {
                channelLC = msgParts[j].slice(1, msgParts[j].length);
                break;
            }
        }

        let newMessage;
        let chatContent = $('#' + channelLC + ' .chatContent');
        let chatMessageList = chatContent.find('.chatMessageList');
        if (typeof chatContent === 'undefined'
            || typeof chatContent[0] === 'undefined') return;

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
            this.parseRoomstate_(msg, channelLC);
        } else if (msgParts[2].localeCompare('USERSTATE') === 0) {
            // Ignore Userstate
        } else if (msgParts[2].localeCompare('USERNOTICE') === 0) {
            newMessage = this.parseUsernotice_(msg, channelLC);
        } else if (msgParts[2].localeCompare('CLEARCHAT') === 0) {
            // ToDo: Bans/Timeouts
        } else if (msgParts[1].localeCompare('HOSTTARGET') === 0) {
            // Ignore hosting message
        } else if (msgParts[2].localeCompare('NOTICE') === 0
            || msgParts[1].localeCompare('PRIVMSG') === 0) {
            newMessage = this.parseNotice_(msgParts);
        } else if (msgParts[2].localeCompare('PRIVMSG') === 0) {
            newMessage = this.parsePrivmsg_(msgParts);
        } else if (channelLC.length >= 1) {
            newMessage = '<li>' + msg + '</li>';
        } else {
            alert('Error');
        }

        if (newMessage != null) {
            if (chatMessageList.children('div').length === 0 ||
                (chatMessageList.children('div').length !== 0 &&
                    chatMessageList.children('div:last')
                        .children('li').length >= 100)) {
                chatMessageList.append('<div></div>');
            }
            chatMessageList.children('div:last').append(newMessage);
            if (resubMessage != null) {
                addMessage(resubMessage);
            }
        }
    }

    /**
     * @param {Array} msgParts
     * @return {string} newMessage li HTML element
     */
    parsePrivmsg_(msgParts) {
        let username = msgParts[1].split('!', 1);
        username = username[0].substring(1, username[0].length);

        let userMessage = msg.split(' ');
        let metaInfoRaw = userMessage[0].substring(1, userMessage[0].length);
        let metaInfo = this.getMetaInfo_(metaInfoRaw.split(';'), username);
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

        // Replace emote texts with images
        if (metaInfo.emotes[0] !== '' && metaInfo.emotes[0] != null) {
            let sortEmotes = [];
            for (let j = 0; j < metaInfo.emotes.length; j++) {
                let emote = metaInfo.emotes[j].split(':');
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
                    + escapeString_(userMessage.substring(oldAfterEmotePos,
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
            userMessage = escapeString_(userMessage);
        }
        // alert(userMessage);
        userMessage = this.matchURL_(userMessage);

        // Replace BTTV Global Emotes with img
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
        if (bttvChannels.hasOwnProperty(channelLC)) {
            for (let j = 0; j < bttvChannels[channelLC].length; j++) {
                let find = JSON.stringify(bttvChannels[channelLC][j].code);
                find = find.substring(1, find.length - 1);
                find = '(^|\\b|\\s)' +
                    find.replace(/[.?*+^$[\]\\(){}|-]/g, '\\$&') + '(?=\\s|$)';

                let re = new RegExp(find, 'g');

                let emoteId = JSON.stringify(bttvChannels[channelLC][j].id)
                    .substring(1,
                        JSON.stringify(bttvChannels[channelLC][j].id).length
                        - 1);
                userMessage = userMessage.replace(re,
                    ' <span style=" display: inline-block;" >&#x200b;' +
                    '<img src=\'https://cdn.betterttv.net/emote/' +
                    emoteId +
                    '/1x\' alt=\'' + bttvChannels[channelLC][j].code + '\' />' +
                    '</span> ');
            }
        }
        // Replace FFZ Global Emotes with img
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
        if (ffzChannels.hasOwnProperty(channelLC)) {
            let ffzChannelId = ffzChannels[channelLC]['room']['_id'];
            if (ffzChannels[channelLC]['sets'][ffzChannelId] != null) {
                let ffzChannelEmoteSet =
                    ffzChannels[channelLC]['sets'][ffzChannelId]['emoticons'];
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

        let newElement;
        if (action) {
            newElement = $('<li><span style="color: gray;font-size: 11px;">'
                + time + '</span><span style="color: ' + metaInfo.color
                + ';font-weight: bold;"> ' + username + '</span>' +
                ' <span style="color: ' + metaInfo.color + ';">'
                + userMessage + '</span></li>');
        } else {
            newElement = $('<li><span style="color: gray;font-size: 11px;">'
                + time + '</span><span style="color: ' + metaInfo.color
                + ';font-weight: bold;"> ' + username + '</span>: '
                + userMessage + '</li>');
        }

        // Put badges in message
        for (let j = 0; j < metaInfo.badges.length; j++) {
            let badge = metaInfo.badges[j].split('/');
            let badgeGroup = badgesChannels[channelLC][badge[0]];
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
                    badgesGlobal[badge[0]]['versions'][badge[1]]['image_url_1x']
                    + ');"></div>');
            }
        }
        return newElement;
    }

    /**
     * @param {string} msg ROOMSTATE message
     * @param {string} channelLC channel the ROOMSTATE belongs to
     * @private
     */
    parseRoomstate_(msg, channelLC) {
        let roomstateMsg = msg.split(' ')[0];
        roomstateMsg = roomstateMsg.substring(1, roomstateMsg.length);
        roomstateMsg = roomstateMsg.split(';');
        let infoMessage = '';
        let chatInput = $('#' + channelLC + ' .chatInput');
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
        chatInput.append('<p style="color: gray; font-size: 11px;' +
            'padding-left: 10px;font-weight: 200;">' + infoMessage + '</p>');
    }

    /**
     * @param {string} msg USERNOTICE message
     * @param {string} channelLC channel the ROOMSTATE belongs to
     * @return {string} newMessage li HTML element
     * @private
     */
    parseUsernotice_(msg, channelLC) {
        let usernoticeMessage = msg.split(' ');
        usernoticeMessage = usernoticeMessage.slice(4).join(' ');
        let metaInfoRaw = msg.substring(1, msg.length).split(' ')[0].split(';');
        let metaInfo = this.getMetaInfo_(metaInfoRaw);
        let newMessage = '<li style="border-top: 1px solid #673ab7;' +
            'border-bottom: 1px solid #673ab7;padding-top: 3px; ' +
            'padding-bottom: 3px;"><span style="color: gray;font-size: 11px;">'
            + time + '</span>  ' +
            ((metaInfo.systemMsg != null) ? (metaInfo.systemMsg + ' ') : '')
            + '</li>';
        if (usernoticeMessage.length > 0) {
            resubMessage = msg.split(' ')[0] + ' :' +
                metaInfo.username.toLowerCase() + '!' +
                metaInfo.username.toLowerCase() + '@' +
                metaInfo.username.toLowerCase() + '.tmi.twitch.tv PRIVMSG #'
                + channelLC + ' ' + usernoticeMessage;
        }
        return newMessage;
    }

    /**
     * @param {Array} msgParts
     * @return {string} li HTML chat message entry
     * @private
     */
    parseNotice_(msgParts) {
        let noticeMessage = msg.split(' ');
        let slicePoint = msgParts[2].localeCompare('NOTICE') === 0 ? 4 : 3;
        noticeMessage = noticeMessage.slice(slicePoint).join(' ');
        return '<li style="border-top: 1px solid #673ab7;' +
            'border-bottom: 1px solid #673ab7;padding-top: 3px; ' +
            'padding-bottom: 3px;"><span style="color: gray;' +
            'font-size: 11px;">' + time + '</span>  ' +
            noticeMessage.substring(1, noticeMessage.length)
            + '</li>';
    }

    /**
     * Searches for URLs in the given String and replaces them with the
     * proper <a href=""> HTML Tag
     * @param {string} txt - Text in which the links get searched
     * @return {string} Text with <a href=""> HTML Tags
     * @private
     */
    matchURL_(txt) {
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
     * Parses the meta information part of a chat message.
     *
     * @param {string[]} metaMsg [{@badges=<badges>},{color=<color>},...]
     * @param {string} username user from whom the message was sent
     * @return {Object} Object with one property for every meta information
     * @private
     */
    getMetaInfo_(metaMsg, username) {
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
                    && !(userColors.hasOwnProperty(username))) {
                    metaInfo.color = randomColor();
                    userColors[username] = metaInfo.color;
                } else if (metaInfo.color.localeCompare('') === 0
                    && userColors.hasOwnProperty(username)) {
                    metaInfo.color = userColors[username];
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
            if (userColors.hasOwnProperty(username)) {
                metaInfo.color = userColors[username];
            } else {
                metaInfo.color = randomColor();
                userColors[username] = metaInfo.color;
            }
        }

        // Color contrast correction
        metaInfo.color = colorCorrection(metaInfo.color);

        return metaInfo;
    }

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
     * Escape HTML characters in the message before adding to the chat
     * @param {string} txt message to escape
     * @return {string} escaped message
     * @private
     */
    escapeString_(txt) {
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
export default MessageParser;
