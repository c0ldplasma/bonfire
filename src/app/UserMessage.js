'use strict';
import ChatMessage from './ChatMessage.js';
/**
 * Represents one chat message of a chat user
 */
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
export default UserMessage;
