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

export default App;
