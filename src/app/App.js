/**
 * @param data.emoticon_sets
 * @param data.badge_sets
 */


'use strict';
import AppUser from './AppUser.js';
import {version} from '../../package.json';
import SendIRCConnection from './SendIRCConnection.js';
import ReceiveIRCConnection from './ReceiveIRCConnection.js';
import BadgeManager from './BadgeManager.js';
import EmoteManager from './EmoteManager.js';
import NameColorManager from './NameColorManager.js';
import FavoritesList from './FavoritesList.js';
import ChatManager from './ChatManager.js';
import MessageParser from './MessageParser.js';

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
        /** @private */
        this.chatManager_ = new ChatManager();
        /** @private */
        this.nameColorManager_ = new NameColorManager();
        /** @private */
        this.badgeManager_ = new BadgeManager();
        /** @private */
        this.emoteManager_ = new EmoteManager();
        /** @private */
        this.favoritesList_ =
            new FavoritesList(this.badgeManager_, this.emoteManager_, this.chatManager_);

        new SendIRCConnection(this.appUser_);
        new ReceiveIRCConnection(this.appUser_,
            new MessageParser(this.nameColorManager_), this.chatManager_);
        this.main_();
    }

    /**
     * Main function for now
     * @private
     */
    main_() {
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
    }
}

export default App;
