'use strict';
import App from './app/App.js';
import TwitchConstants from './app/TwitchConstants.js';

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


