(function () {
'use strict';

class TwitchConstants {
    static get CLIENT_ID() {
        return 'xllef7inid2mbeqoaj2o6bsohg7pz7';
    }
    static get PERMISSION_SCOPE() {
        return 'chat_login+user_blocks_edit+user_blocks_read+user_subscriptions';
    }
    static get SELF_URL() {
        return 'http://localhost:5000/';
    }
    static get AUTHORIZE_URL() {
        return `https://api.twitch.tv/kraken/oauth2/authorize?response_type=token&client_id=
        ${TwitchConstants.CLIENT_ID}&redirect_uri=${TwitchConstants.SELF_URL}&scope=
        ${TwitchConstants.PERMISSION_SCOPE}`;
    }
    static get GLOBAL_BADGES_API_URL() {
        return 'https://badges.twitch.tv/v1/badges/global/display';
    }

}

/**
 * @param data.token.user_name
 * @param data.token.user_id
 */
class AppUser {
    /**
     * @param {string} userName The Twitch username of the chat client user
     * @param {string} userId The Twitch user ID of the chat client user
     */
    constructor() {
        /** @private */
        this.userName_ = null;
        /** @private */
        this.userId_ = null;

        this.requestAppUserData();
    }

    /**
     * Sends an ajax request to twitch to receive userName_ and userId_ of the AppUser
     */
    requestAppUserData() {
        $.ajax({
            url: ('https://api.twitch.tv/kraken'),
            headers: {
                'Accept': 'application/vnd.twitchtv.v5+json',
                'Client-ID': TwitchConstants.CLIENT_ID,
                'Authorization': ('OAuth ' + localStorage.accessToken),
            },
            async: false,
        }).done(function(data) {
            if (data.token.valid === false) {
                window.location.replace(TwitchConstants.AUTHORIZE_URL);
            } else if (typeof(data.token) !== 'undefined') {
                this.userName_ = data.token.user_name;
                this.userId_ = data.token.user_id;
            } else {
                alert('Error while getting username');
            }
        });
    }
}

var version = "0.3.1";

function rgb2hex(r, g, b) {
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function hex2rgb(hex) {
    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
    } : null;
}

function rgb2yiq(r, g, b) {
    // matrix transform
    let y = ((0.299 * r) + (0.587 * g) + (0.114 * b)) / 255;
    let i = ((0.596 * r) + (-0.275 * g) + (-0.321 * b)) / 255;
    let q = ((0.212 * r) + (-0.523 * g) + (0.311 * b)) / 255;
    return [y, i, q];
}

function yiq2rgb(y, i, q) {
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
    
    return [r, g, b];
}

function rgb2hsl(r, g, b) {
    r /= 255, g /= 255, b /= 255;

    let max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max == min) {
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

    return [h, s, l];
}

function hsl2rgb(h, s, l) {
    let r, g, b;

    if (s == 0) {
        r = g = b = l; // achromatic
    } else {
        function hue2rgb(p, q, t) {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        }

        let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        let p = 2 * l - q;

        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }

    return [r * 255, g * 255, b * 255];
}

function colorCorrection(color) {
    // Color contrast correction
    color = hex2rgb(color);
    color = rgb2yiq(color.r, color.g, color.b);
    while (color[0] < 0.5) {
        color = yiq2rgb(color[0], color[1], color[2]);
        color = rgb2hsl(color[0], color[1], color[2]);
        color[2] = Math.min(Math.max(0, 0.1 + 0.9 * color[2]), 1);
        color = hsl2rgb(color[0], color[1], color[2]);
        color = rgb2yiq(color[0], color[1], color[2]);
    }
    color = color = yiq2rgb(color[0], color[1], color[2]);
    color = rgb2hex(color[0], color[1], color[2]);
    return color.substring(0, 7);
}

function randomColor() {
    let color;
    let col = Math.floor(Math.random() * 15);
    switch (col) {
        case 0:
            color = '#ff0000';
            break;
        case 1:
            color = '#ff4500';
            break;
        case 2:
            color = '#ff69b4';
            break;
        case 3:
            color = '#0000ff';
            break;
        case 4:
            color = '#2e8b57';
            break;
        case 5:
            color = '#8a2be2';
            break;
        case 6:
            color = '#008000';
            break;
        case 7:
            color = '#daa520';
            break;
        case 8:
            color = '#00ff7f';
            break;
        case 9:
            color = '#b22222';
            break;
        case 10:
            color = '#d2691e';
            break;
        case 11:
            color = '#ff7f50';
            break;
        case 12:
            color = '#5f9ea0';
            break;
        case 13:
            color = '#9acd32';
            break;
        case 14:
            color = '#1e90ff';
            break;
        default:
            color = '#000';
            break;
    }
    return color;
}

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

function matchURL(txt) {
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
 */
function getMetaInfo(metaMsg, username) {
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

/* exported parseMessage */
/**
 * Parses an IRC message from Twitch and appends it to the corresponding chat.
 *
 * @param {string} msg Single whole raw chat message sent by Twitch
 */
function addMessage(msg) {
    if (msg.length <= 1) {
        return;
    }

    let msgParts = msg.split(' ', 5);

    let channelLC = '';
    for (let j = 0; j < msgParts.length; j++) {
        if (msgParts[j].startsWith('#')) {
            channelLC = msgParts[j].slice(1, msgParts[j].length);
            break;
        }
    }

    if (msg.startsWith('PING :tmi.twitch.tv')) {
        connection.send('PONG :tmi.twitch.tv');
        return;
    } else if (msgParts[2].localeCompare('WHISPER') === 0) {
        // alert("Whisper");
        return;
    } else if (msgParts[2].startsWith('GLOBALUSERSTATE')) {
        let metaInfo = getMetaInfo(
            msgParts[0].substring(1, msgParts[0].length).split(';'));
        console.log(metaInfo);
        return;
    } else if (channelLC.length < 1) {
        console.log(msg);
        return;
    }

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

    let newMessage;
    let resubMessage;
    let chatInput = $('#' + channelLC + ' .chatInput');
    let chatContent = $('#' + channelLC + ' .chatContent');
    let chatMessageList = chatContent.find('.chatMessageList');
    if (typeof chatContent === 'undefined'
        || typeof chatContent[0] === 'undefined') return;

    let bottom = false;
    if (chatContent[0].scrollHeight - chatContent.scrollTop()
        < chatContent.outerHeight() + 50) bottom = true;

    // console.log(msg);
    if (msgParts[1].localeCompare('JOIN') === 0) {
        // Ignore JOINs
    } else if (msgParts[1].localeCompare('PART') === 0) {
        // Ignore PARTs
    } else if (msgParts[1].localeCompare('353') === 0) {
        // Ignore namelist
    } else if (msgParts[1].localeCompare('366') === 0) {
        // Ignore end of namelist
    } else if (msgParts[1].localeCompare('MODE') === 0) {
        // Ignore gain/lose of Moderator rights
    } else if (msgParts[2].localeCompare('ROOMSTATE') === 0) {
        let roomstateMsg = msg.split(' ')[0];
        roomstateMsg = roomstateMsg.substring(1, roomstateMsg.length);
        roomstateMsg = roomstateMsg.split(';');
        let infoMessage = '';
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
    } else if (msgParts[2].localeCompare('USERSTATE') === 0) {
        // Ignore Userstate
    } else if (msgParts[2].localeCompare('USERNOTICE') === 0) {
        let usernoticeMessage = msg.split(' ');
        usernoticeMessage = usernoticeMessage.slice(4).join(' ');
        let metaInfoRaw = msg.substring(1, msg.length).split(' ')[0].split(';');
        let metaInfo = getMetaInfo(metaInfoRaw);
        newMessage = '<li style="border-top: 1px solid #673ab7;' +
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
    } else if (msgParts[2].localeCompare('CLEARCHAT') === 0) {
        // ToDo: Bans/Timeouts
    } else if (msgParts[1].localeCompare('HOSTTARGET') === 0) {
        // Ignore hosting message
    } else if (msgParts[2].localeCompare('NOTICE') === 0) {
        let noticeMessage = msg.split(' ');
        noticeMessage = noticeMessage.slice(4).join(' ');
        newMessage = '<li style="border-top: 1px solid #673ab7;' +
            'border-bottom: 1px solid #673ab7;padding-top: 3px; ' +
            'padding-bottom: 3px;"><span style="color: gray;' +
            'font-size: 11px;">' + time + '</span>  ' +
            noticeMessage.substring(1, noticeMessage.length)
            + '</li>';
    } else if (msgParts[1].localeCompare('PRIVMSG') === 0) {
        let noticeMessage = msg.split(' ');
        noticeMessage = noticeMessage.slice(3).join(' ');
        newMessage = '<li style="border-top: 1px solid #673ab7;' +
            'border-bottom: 1px solid #673ab7;padding-top: 3px; ' +
            'padding-bottom: 3px;"><span style="color: gray;font-size: 11px;">'
            + time + '</span>  ' +
            noticeMessage.substring(1, noticeMessage.length)
            + '</li>';
    } else if (msgParts[2].localeCompare('PRIVMSG') === 0) {
        let username = msgParts[1].split('!', 1);
        username = username[0].substring(1, username[0].length);

        let userMessage = msg.split(' ');
        let metaInfoRaw = userMessage[0].substring(1, userMessage[0].length);
        let metaInfo = getMetaInfo(metaInfoRaw.split(';'), username);
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

        /**
         * Escape HTML characters in the message before adding to the chat
         * @param {string} txt message to escape
         * @return {string} escaped message
         */
        function escapeString(txt) {
            return txt.replace(/&/g, '&amp;').replace(/</g, '&lt;')
                .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
                .replace(/`/g, '&#96;').replace(/!/g, '&#33;')
                .replace(/@/g, '&#64;').replace(/\$/g, '&#36;')
                .replace(/%/g, '&#37;').replace(/=/g, '&#61;')
                .replace(/\+/g, '&#43;').replace(/{/g, '&#123;')
                .replace(/}/g, '&#125;').replace(/\[/g, '&#91;')
                .replace(/]/g, '&#93;');
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
                    + escapeString(userMessage.substring(oldAfterEmotePos,
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
            userMessage = escapeString(userMessage);
        }
        // alert(userMessage);
        userMessage = matchURL(userMessage);

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
        newMessage = newElement;
    } else if (channelLC.length >= 1) {
        newMessage = '<li>' + msg + '</li>';
    } else {
        alert('Error');
    }

    if (newMessage != null) {
        if (chatMessageList.children('div').length === 0
            ||
            (chatMessageList.children('div').length !== 0
                && chatMessageList.children('div:last')
                    .children('li').length >= 100)) {
            chatMessageList.append('<div></div>');
        }
        chatMessageList.children('div:last').append(newMessage);
        if (resubMessage != null) {
            addMessage(resubMessage);
        }
        if (chatMessageList.children('div').length > 3 && bottom) {
            chatMessageList.children('div:visible').slice(0, -3).hide();
        }
    }


    // Limit messages in Chat
    let count = chatMessageList.find('li').length;
    // document.getElementById("newFavInput").value = " " + count;
    if (count >= 200000) {
        $('#' + channelLC + ' .chatContent .chatMessageList div:first')
            .remove();
    }

    // Scroll to bottom
    if (bottom) {
        let contentHeight = chatContent[0].scrollHeight;
        chatContent.scrollTop(contentHeight + 50);
        // chatContent.stop(true, false).delay(50)
        // .animate({ scrollTop: contentHeight }, 2000, 'linear');
        $('#' + channelLC + ' .chatContent .chatMessageList')
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
        && $('#' + channelLC + ' .chatNewMessagesInfo').is(':hidden')) {
        let contentHeight = chatContent[0].scrollHeight;
        chatContent.scrollTop(contentHeight + 50);
        // chatContent.stop(true, false).delay(50)
        // .animate({ scrollTop: contentHeight }, 2000, 'linear');
    }
}

/* exported addFavToList */
/**
 * Add a channel to the list of favorites
 *
 * @param {string} channelParam channel name or null
 */
function addFavToList(channelParam) {
    /**
     *
     *
     * @param {string} channel channel name
     * @param {string} profilePicURL URL to profile image file
     * @param {string} channelId channel id
     */
    function addFavLine(channel, profilePicURL, channelId) {
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

    if (document.getElementById('newFavInput').value.length < 3
        && channelParam == null) {
    } else if ($.type(channelParam) === 'string') {
        $.ajax({
            url: ('https://api.twitch.tv/kraken/getUsers/' + channelParam),
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
            url: ('https://api.twitch.tv/kraken/getUsers?login='
                + document.getElementById('newFavInput').value),
            headers: {
                'Accept': 'application/vnd.twitchtv.v5+json',
                'Client-ID': clientID,
            },
            async: true,
        }).done(function(data) {
            if (data.getUsers.length >= 1) {
                let channel = data.getUsers[0].display_name;
                let channelId = data.getUsers[0]._id;
                let profilePicURL = data.getUsers[0].logo;
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

/* exported toggleFavList */
/**
 * If the favorites list is enabled, disable it.
 * If its disabled, enable it.
 */
function toggleFavList() {
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
 * Represents the whole application
 */
class App {
    /**
     * Created the whole application
     * @constructor
     */
    constructor() {
        /** @private */
        this.appUser_ = new AppUser();
        /** @private */
        this.chatList_ = [];
        /** private */

        this.main_();
    }

    /**
     * @return {AppUser}
     */
    getAppUser() {
        return this.appUser_;
    }

    /**
     * @return {Array}
     */
    getChatList() {
        return this.chatList_;
    }

    /**
     * Main function for now
     * @private
     */
    main_() {
        let user;
        let userID = '';
        /* exported userEmotes */
        window.userEmotes = null;

        /* exported userColors badgesChannels badgesGlobal */
        window.userColors = {};
        window.badgesChannels = {};
        window.badgesGlobal = null;

        /* exported bttvChannels bttvGlobal */
        window.bttvChannels = {};
        window.bttvGlobal = null;

        /* exported ffzChannels ffzGlobal */
        window.ffzChannels = {};
        window.ffzGlobal = null;

        window.connection = null;
        window.connectionSend = null;
// Download Channel Badges JSON
        $.ajax({
            url: (TwitchConstants.GLOBAL_BADGES_API_URL),
            headers: {
                'Accept': 'application/vnd.twitchtv.v5+json',
                'Client-ID': CLIENT_ID,
            },
            async: true,
        }).done(function(data) {
            badgesGlobal = data.badge_sets;
        });

// Gets a list of the emojis and emoticons that the specified
// user can use in chat.
        $.ajax({
            url: ('https://api.twitch.tv/kraken/getUsers/' + userID + '/emotes'),
            headers: {
                'Accept': 'application/vnd.twitchtv.v5+json',
                'Client-ID': this.clientId_,
                'Authorization': ('OAuth ' + localStorage.accessToken),
            },
            async: true,
        }).done(function(data) {
            userEmotes = data.emoticon_sets;
        });

// Download Global BTTV Emotes JSON
        $.ajax({
            url: ('https://api.betterttv.net/2/emotes'),
            async: true,
        }).done(function(data) {
            bttvGlobal = data.emotes;
        });

// Download Global FFZ Emotes JSON
        $.ajax({
            url: ('https://api.frankerfacez.com/v1/set/global'),
            async: true,
        }).done(function(data) {
            ffzGlobal = data;
        });

        connection = new WebSocket('wss://irc-ws.chat.twitch.tv:443');
// When the connection is open, send some data to the server
        connection.onopen = function() {
            connection.send('CAP REQ :twitch.tv/membership');
            connection.send('CAP REQ :twitch.tv/tags');
            connection.send('CAP REQ :twitch.tv/commands');
            connection.send('PASS oauth:' + localStorage.accessToken);
            connection.send('NICK ' + user);
        };
// Log errors
        connection.onerror = function(error) {
            console.log('WebSocket Error ' + error);
            alert('ERROR: ' + error);
        };
// Log messages from the server
        connection.onmessage = function(e) {
            let messages = e.data.split('\n');

            for (let i = 0; i < messages.length; i++) {
                let msg = messages[i];
                console.log(msg);
                addMessage(msg);
            }
        };


        connectionSend = new WebSocket('wss://irc-ws.chat.twitch.tv:443');
// When the connection is open, send some data to the server
        connectionSend.onopen = function() {
            connectionSend.send('CAP REQ :twitch.tv/membership');
            connectionSend.send('CAP REQ :twitch.tv/tags');
            connectionSend.send('CAP REQ :twitch.tv/commands');
            connectionSend.send('PASS oauth:' + localStorage.accessToken);
            connectionSend.send('NICK ' + user);
        };
// Log errors
        connectionSend.onerror = function(error) {
            console.log('WebSocket Error ' + error);
            alert('ERROR: ' + error);
        };
// Log messages from the server
        connectionSend.onmessage = function(e) {
            let messages = e.data.split('\n');

            for (let i = 0; i < messages.length; i++) {
                let msg = messages[i];

                if (msg.length <= 1) {
                    continue;
                }

                if (msg.startsWith('PING :tmi.twitch.tv')) {
                    connectionSend.send('PONG :tmi.twitch.tv');
                }
            }
        };

        $(function() { // this will be called when the DOM is ready
            document.title += ` ${version}`;
            try {
                let channels = JSON.parse(localStorage.getItem('channels'));
                if (channels !== null) {
                    for (let i = 0; i < channels.length; i++) {
                        addFavToList(channels[i]);
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

            $('#addFavFromInput').click(addFavToList);
            $('#newFavInput').keydown(function(event) {
                if (event.keyCode === 13) {
                    $('#addFavFromInput').click();
                }
            });
            document.getElementById('channelListToggle')
                .addEventListener('click', toggleFavList);

            // Bug workaround: unexpected vertical scrolling
            // despite overflow-y: hidden
            $('#main-chat-area').scroll(function() {
                if ($(this).scrollTop() !== 0) {
                    $(this).scrollTop(0);
                }
            });
        });
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

new App();

}());
//# sourceMappingURL=bundle.js.map
