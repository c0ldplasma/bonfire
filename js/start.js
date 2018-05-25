/**
 * @param data          Information about the object.
 * @param data.token.user_name
 * @param data.token.user_id
 * @param data.token.badge_sets
 * @param data.token.emoticon_sets
 */

'use strict';


let clientID = '3392e4aec6s6388tlnecfrtl5nh523';
let user;
let userID = '';
/* exported userEmotes */
let userEmotes;

let url = window.location.href;
let urlMainAndTail = url.split('#');
let urlTailParts;

/* exported userColors badgesChannels badgesGlobal */
let userColors = {};
let badgesChannels = {};
let badgesGlobal;

/* exported bttvChannels bttvGlobal */
let bttvChannels = {};
let bttvGlobal;

/* exported ffzChannels ffzGlobal */
let ffzChannels = {};
let ffzGlobal;

let connection;
let connectionSend;

require(['./main', './jquery-ui',
        './jquery.ui.sortable-animation', './colors',
        './imagesloaded.pkgd.min', './jquery'],
    function(main, jqueryui, jqueryuisortable, colors, imagesLoaded, $) {

    imagesLoaded.makeJQueryPlugin( $ );

    if (urlMainAndTail.length > 1) {
        urlTailParts = urlMainAndTail[1].split('&');
        localStorage.accessToken = urlTailParts[0].split('=')[1];
    } else if (localStorage.getItem('accessToken') !== null) {
    } else {
        window.location.replace('https://api.twitch.tv/kraken/oauth2/authorize'
            + '?response_type=token'
            + '&client_id=' + clientID
            + '&redirect_uri=https://chats.c0ldplasma.de'
            + '&scope=chat_login+user_blocks_edit+'
            + 'user_blocks_read+user_subscriptions');
    }

    $.ajax({
        url: ('https://api.twitch.tv/kraken'),
        headers: {
            'Accept': 'application/vnd.twitchtv.v5+json',
            'Client-ID': clientID,
            'Authorization': ('OAuth ' + localStorage.accessToken),
        },
        async: false,
    }).done(function(data) {
        if (data.token.valid === false) {
            window.location.replace('https://api.twitch.tv/kraken/oauth2/authorize'
                + '?response_type=token'
                + '&client_id=' + clientID
                + '&redirect_uri=https://chats.c0ldplasma.de'
                + '&scope=chat_login+user_blocks_edit+'
                + 'user_blocks_read+user_subscriptions');
        } else if (typeof(data.token) !== 'undefined') {
            user = data.token.user_name;
            userID = data.token.user_id;
        } else {
            alert('Error while getting username');
        }
    });
// Download Channel Badges JSON
    $.ajax({
        url: ('https://badges.twitch.tv/v1/badges/global/display'),
        headers: {'Accept': 'application/vnd.twitchtv.v5+json',
            'Client-ID': clientID},
        async: true,
    }).done(function(data) {
        badgesGlobal = data.badge_sets;
    });

// Gets a list of the emojis and emoticons that the specified
// user can use in chat.
    $.ajax({
        url: ('https://api.twitch.tv/kraken/users/' + userID + '/emotes'),
        headers: {
            'Accept': 'application/vnd.twitchtv.v5+json',
            'Client-ID': clientID,
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

});

