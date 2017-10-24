function matchURL(txt) {
	var pattern = /((^|\s|&#32;)(http(s)?:\/\/.)?(www\.)?([-a-zA-Z0-9@:%_\+~#=]|\.(?!\.)){2,256}\.[a-z]{2,8}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*))(?=(\s|$|&#32;))/g;
	txt = txt.replace(pattern, function (str, p1)
	{
		var addScheme = p1.indexOf('http://') === -1
						&& p1.indexOf('https://') === -1;
		var link = ' <a href="' + (addScheme ? 'http://' : '') + p1 + '" target="_blank">' + p1 + '</a>';
		if (p1.startsWith(" ")) {
			link = ' <a href="' + (addScheme ? 'http://' : '') + p1.substring(1, p1.length) + '" target="_blank">' + p1 + '</a>'
		} else if (p1.startsWith("&#32;")) {
			link = ' <a href="' + (addScheme ? 'http://' : '') + p1.substring(5, p1.length) + '" target="_blank">' + p1 + '</a>'
		}
		return link;
	});
	return txt;
}
function getMetaInfo(metaMsg, username) {
	var metaInfo = {};

	metaInfo.color = "#acacbf";
	metaInfo.emotes = "";
	metaInfo.badges = "";

	var gotColor = false;
	for (var j = 0; j<metaMsg.length; j++) {
		var info = metaMsg[j].split("=");
		if (info.length <= 1 || info[1].localeCompare("") == 0) {
			continue;
		}

		if (info[0].localeCompare("color") == 0) {
			metaInfo.color = info[1];
			if (metaInfo.color.localeCompare("") == 0 && !(userColors.hasOwnProperty(username))) {
				metaInfo.color = randomColor();
				userColors[username] = metaInfo.color;
			} else if (metaInfo.color.localeCompare("") == 0 && userColors.hasOwnProperty(username)) {
				metaInfo.color = userColors[username];
			}
			gotColor = true;
		} else if (info[0].localeCompare("display-name") == 0) {
			metaInfo.username = info[1];
		} else if (info[0].localeCompare("emotes") == 0) {
			metaInfo.emotes = info[1].split("/");
		} else if (info[0].localeCompare("badges") == 0) {
			metaInfo.badges = info[1].split(",");
		} else if (info[0].localeCompare("system-msg") == 0) {
			metaInfo.systemMsg = info[1].replace(/\\s/g, " ");
		} else if (info[0].localeCompare("emote-sets") == 0) {
			metaInfo.emoteSets = info[1].split(",");
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

	//Color contrast correction
	metaInfo.color = colorCorrection(metaInfo.color);

	return metaInfo;
}
function addMessage(msg) {
	if ( msg.length <= 1 ) {
		return;
	}

	var msgParts = msg.split(" ", 5);

	var channelLC = "";
	for (var j = 0; j < msgParts.length; j++) {
		if (msgParts[j].startsWith("#")) {
			channelLC = msgParts[j].slice(1, msgParts[j].length);
			break;
		}
	}

	if (msg.startsWith("PING :tmi.twitch.tv")) {
		connection.send("PONG :tmi.twitch.tv");
		return;
	}
	else if (msgParts[2].localeCompare("WHISPER") == 0) {
		//alert("Whisper");
		return;
	}
	else if (msgParts[2].startsWith("GLOBALUSERSTATE")) {
		var metaInfo = getMetaInfo(msgParts[0].substring(1, msgParts[0].length).split(";"));
		console.log(metaInfo);
		return;
	}
	else if (channelLC.length < 1) { console.log(msg); return; }

	var currentdate = new Date();
	var time;
	if ( currentdate.getHours() >= 10 && currentdate.getMinutes() >= 10 ) {
		time = currentdate.getHours() + ":" + currentdate.getMinutes();
	} else if ( currentdate.getHours() < 10 && currentdate.getMinutes() >= 10 ) {
		time = "0" + currentdate.getHours() + ":" + currentdate.getMinutes();
	} else if ( currentdate.getHours() >= 10 && currentdate.getMinutes() < 10 ) {
		time = currentdate.getHours() + ":0" + currentdate.getMinutes();
	} else {
		time = "0" + currentdate.getHours() + ":0" + currentdate.getMinutes();
	}

	var newMessage;
	var resubMessage;
	var chatInput = $("#" + channelLC + " .chatInput");
	var chatContent = $("#" + channelLC + " .chatContent");
	var chatMessageList = chatContent.find(".chatMessageList");
	if (typeof chatContent == 'undefined' || typeof chatContent[0] == 'undefined' ) {return;}

	var bottom = false;
	if (chatContent[0].scrollHeight - chatContent.scrollTop() < chatContent.outerHeight() + 50 ) {
		bottom = true;
	}
	//console.log(msg);
	if (msgParts[1].localeCompare("JOIN") == 0) {
		//Ignore JOINs
	}
	else if (msgParts[1].localeCompare("PART") == 0) {
		//Ignore PARTs
	}
	else if (msgParts[1].localeCompare("353") == 0) {
		//Ignore namelist
	}
	else if (msgParts[1].localeCompare("366") == 0) {
		//Ignore end of namelist
	}
	else if (msgParts[1].localeCompare("MODE") == 0) {
		//Ignore gain/lose of Moderator rights
	}
	else if (msgParts[2].localeCompare("ROOMSTATE") == 0) {
		var roomstateMessage = msg.split(" ")[0];
		roomstateMessage = roomstateMessage.substring(1, roomstateMessage.length).split(";");
		var infoMessage = "";
		chatInput.find("p").remove();
		for (var j = 0; j < roomstateMessage.length; j++) {
			info = roomstateMessage[j].split("=");
			var infoKeyword = info[0];
			switch (info[0]) {
				case "broadcaster-lang":
					infoMessage += info[1] + "  ";
					break;
				case "emote-only":
					if (info[1].localeCompare("1") == 0) {
						infoMessage += "EMOTE-ONLY  ";
					}
					break;
				case "followers-only":
					if (info[1].localeCompare("-1") != 0) {
						infoMessage += "FOLLOW " + info[1] + "m  ";
					}
					break;
				case "r9k":
					if (info[1].localeCompare("1") == 0) {
						infoMessage += "R9K  ";
					}
					break;
				case "slow":
					if (info[1].localeCompare("0") != 0) {
						infoMessage += "SLOW " + info[1] + "s  ";
					}
					break;
				case "subs-only":
					if (info[1].localeCompare("1") == 0) {
						infoMessage += "SUB  ";
					}
					break;
			}
		}
		chatInput.append('<p style="color: gray; font-size: 11px;padding-left: 10px;font-weight: 200;">' + infoMessage + '</p>');
	}
	else if (msgParts[2].localeCompare("USERSTATE") == 0) {
		//Ignore Userstate
	}
	else if (msgParts[2].localeCompare("USERNOTICE") == 0) {
		var usernoticeMessage = msg.split(" ");
		usernoticeMessage = usernoticeMessage.slice(4).join(" ");
		var metaInfo = getMetaInfo(msg.substring(1, msg.length).split(" ")[0].split(";"));
		newMessage = '<li style="border-top: 1px solid #673ab7;border-bottom: 1px solid #673ab7;padding-top: 3px; padding-bottom: 3px;"><span style="color: gray;font-size: 11px;">' + time + '</span>  ' + ((metaInfo.systemMsg != null) ? (metaInfo.systemMsg + " ") : "") + '</li>';
		if (usernoticeMessage.length > 0) {
			resubMessage = msg.split(" ")[0]  + " :" + metaInfo.username.toLowerCase() + "!" + metaInfo.username.toLowerCase() + "@" + metaInfo.username.toLowerCase() + ".tmi.twitch.tv PRIVMSG #" + channelLC + " " + usernoticeMessage;
		}
	}
	else if (msgParts[2].localeCompare("CLEARCHAT") == 0) {
		//ToDo: Bans/Timeouts
	}
	else if (msgParts[1].localeCompare("HOSTTARGET") == 0) {
		//Ignore hosting message
	}
	else if (msgParts[2].localeCompare("NOTICE") == 0) {
		var noticeMessage = msg.split(" ");
		noticeMessage = noticeMessage.slice(4).join(" ");
		newMessage = '<li style="border-top: 1px solid #673ab7;border-bottom: 1px solid #673ab7;padding-top: 3px; padding-bottom: 3px;"><span style="color: gray;font-size: 11px;">' + time + '</span>  ' + noticeMessage.substring(1, noticeMessage.length) + '</li>';
	}
	else if (msgParts[1].localeCompare("PRIVMSG") == 0) {
		var noticeMessage = msg.split(" ");
		noticeMessage = noticeMessage.slice(3).join(" ");
		newMessage = '<li style="border-top: 1px solid #673ab7;border-bottom: 1px solid #673ab7;padding-top: 3px; padding-bottom: 3px;"><span style="color: gray;font-size: 11px;">' + time + '</span>  ' + noticeMessage.substring(1, noticeMessage.length) + '</li>';
	}
	else if (msgParts[2].localeCompare("PRIVMSG") == 0) {
		var username = msgParts[1].split("!", 1);
		username = username[0].substring(1, username[0].length );

		var userMessage = msg.split(" ");

		var metaInfo = getMetaInfo(userMessage[0].substring(1, userMessage[0].length).split(";"), username);
		if ( metaInfo.username != null ) {
			username = metaInfo.username;
		}

		userMessage = userMessage.slice(4).join(" ");
		userMessage = userMessage.substring(1, userMessage.length );

		var action = false;
		if (userMessage.startsWith("\001ACTION")) {
			action = true;
			userMessage = userMessage.substring(8, userMessage.length-2 );
		}

		// Replace emote texts with images
		function escapeString(txt) {
			return txt.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/`/g,'&#96;').replace(/!/g,'&#33;').replace(/@/g,'&#64;').replace(/\$/g,'&#36;').replace(/%/g,'&#37;').replace(/=/g,'&#61;').replace(/\+/g,'&#43;').replace(/{/g,'&#123;').replace(/}/g,'&#125;').replace(/\[/g,'&#91;').replace(/]/g,'&#93;');
		}
		if (metaInfo.emotes[0] != "" && metaInfo.emotes[0] != null ) {
			var sortEmotes = [];
			for (var j = 0; j<metaInfo.emotes.length; j++) {
				var emote = metaInfo.emotes[j].split(":");
				var emoteId = emote[0];
				var positions = emote[1].split(",");

				for (var k = 0; k<positions.length; k++) {
					sortEmotes.push([positions[k].split("-")[0], positions[k].split("-")[1], emoteId]);
				}
			}
			for (var k = 0; k<sortEmotes.length-1; k++) {
				for (var l = k+1; l<sortEmotes.length; l++) {
						if (parseInt(sortEmotes[k][0]) > parseInt(sortEmotes[l][0])) {
							var zs = sortEmotes[k];
							sortEmotes[k] = sortEmotes[l];
							sortEmotes[l] = zs;
						}
				}
			}

			var diff = 0;
			var oldAfterEmotePos = 0;
			for (var k = 0; k<sortEmotes.length; k++) {
				var oldMessage = userMessage;
				var imgString = userMessage.substring(0, oldAfterEmotePos) + escapeString(userMessage.substring(oldAfterEmotePos, parseInt(sortEmotes[k][0])+diff)) + "<span style=\" display: inline-block;\" >&#x200b;<img src='https://static-cdn.jtvnw.net/emoticons/v1/" + sortEmotes[k][2] + "/1.0' /></span>";
				userMessage = imgString + userMessage.substring(parseInt(sortEmotes[k][1])+1+diff, userMessage.length);
				oldAfterEmotePos = imgString.length;
				//alert(oldAfterEmotePos);
				//alert(userMessage);
				diff += userMessage.length - oldMessage.length;
			}
		} else {
			userMessage = escapeString(userMessage);
		}
		//alert(userMessage);
		userMessage = matchURL(userMessage);

		//Replace BTTV Global Emotes with img
		for (var j = 0; j < bttvGlobal.length; j++) {
			if (bttvGlobal[j].channel == null) {
				var find = JSON.stringify(bttvGlobal[j].code);
				find = find.substring(1, find.length-1);
				find = '(^|\\b|\\s)' + find.replace(/[.?*+^$[\]\\(){}|-]/g, "\\$&") + '(?=\\s|$)';

				var re = new RegExp(find, 'g');

				var emoteId = JSON.stringify(bttvGlobal[j].id).substring(1, JSON.stringify(bttvGlobal[j].id).length-1);
				userMessage = userMessage.replace(re, " <span style=\" display: inline-block;\" >&#x200b;<img src='https://cdn.betterttv.net/emote/" + emoteId + "/1x' alt='" + bttvGlobal[j].code + "' /></span> ");
			}
		}
		//Replace BTTV Channel Emotes with img
		if (bttvChannels.hasOwnProperty(channelLC)) {
			for (var j = 0; j < bttvChannels[channelLC].length; j++) {
				var find = JSON.stringify(bttvChannels[channelLC][j].code);
				find = find.substring(1, find.length-1);
				find = '(^|\\b|\\s)' + find.replace(/[.?*+^$[\]\\(){}|-]/g, "\\$&") + '(?=\\s|$)';

				var re = new RegExp(find, 'g');

				var emoteId = JSON.stringify(bttvChannels[channelLC][j].id).substring(1, JSON.stringify(bttvChannels[channelLC][j].id).length-1);
				userMessage = userMessage.replace(re, " <span style=\" display: inline-block;\" >&#x200b;<img src='https://cdn.betterttv.net/emote/" + emoteId + "/1x' alt='" + bttvChannels[channelLC][j].code + "' /></span> ");
			}
		}
		//Replace FFZ Global Emotes with img
		for (var j = 0; j < ffzGlobal.default_sets.length; j++) {
			var emoteSetGlobal = ffzGlobal.default_sets[j];
			var emotesInSetGlobal = ffzGlobal["sets"][emoteSetGlobal]["emoticons"];
			for (var k = 0; k < emotesInSetGlobal.length; k++) {

				var find = JSON.stringify(emotesInSetGlobal[k].name);
				find = find.substring(1, find.length-1);
				find = '(^|\\b|\\s)' + find.replace(/[.?*+^$[\]\\(){}|-]/g, "\\$&") + '(?=\\s|$)';

				var re = new RegExp(find, 'g');

				userMessage = userMessage.replace(re, " <span style=\" display: inline-block;\" >&#x200b;<img src='https:" + emotesInSetGlobal[k]["urls"]["1"] + "' alt='" + emotesInSetGlobal[k].name + "' /></span> ");
			}
		}
		//Replace FFZ Channel Emotes with img
		if (ffzChannels.hasOwnProperty(channelLC)) {
			var ffzChannelId = ffzChannels[channelLC]["room"]["_id"];
			if (ffzChannels[channelLC]["sets"][ffzChannelId] != null) {
				var ffzChannelEmoteSet = ffzChannels[channelLC]["sets"][ffzChannelId]["emoticons"];
				for (var j = 0; j < ffzChannelEmoteSet.length; j++) {

					var find = JSON.stringify(ffzChannelEmoteSet[j].name);
					find = find.substring(1, find.length-1);
					find = '(^|\\b|\\s)' + find.replace(/[.?*+^$[\]\\(){}|-]/g, "\\$&") + '(?=\\s|$)';

					var re = new RegExp(find, 'g');

					userMessage = userMessage.replace(re, " <span style=\" display: inline-block;\" >&#x200b;<img src='https:" + ffzChannelEmoteSet[j]["urls"]["1"] + "' alt='" + ffzChannelEmoteSet[j].name + "' /></span> ");
				}
			}
		}

		var newElement;
		if (action) {
			newElement = $('<li><span  style="color: gray;font-size: 11px;">' + time + '</span><span style="color: ' + metaInfo.color + ';font-weight: bold;"> ' + username + '</span> <span style="color: ' + metaInfo.color + ';">' + userMessage + '</span></li>');
		} else {
			newElement = $('<li><span  style="color: gray;font-size: 11px;">' + time + '</span><span style="color: ' + metaInfo.color + ';font-weight: bold;"> ' + username + '</span>: ' + userMessage + '</li>');
		}

		//Put badges in message
		for (var j = 0; j < metaInfo.badges.length; j++) {
			badge = metaInfo.badges[j].split("/");
			if (badge[0].localeCompare("subscriber") == 0) {
				newElement.find("span:nth-of-type(2):first").before("<div style=\" display: inline-block;vertical-align: -32%;border-radius: 2px;background-image: url(" + badgesChannels[channelLC][badge[0]]["versions"][badge[1]]["image_url_1x"] + ");\" ></div>");
			} else {
				newElement.find("span:nth-of-type(2):first").before("<div style=\" display: inline-block;vertical-align: -32%;border-radius: 2px;background-image: url(" + badgesGlobal[badge[0]]["versions"][badge[1]]["image_url_1x"] + ");\"></div>");
			}
		}
		newMessage = newElement;

	}
	else if (channelLC.length >= 1) {
		newMessage = '<li>' + msg + '</li>';
	}
	else { alert("Error"); }

	if (newMessage != null) {
		if (chatMessageList.children('div').length == 0 || (chatMessageList.children('div').length != 0 && chatMessageList.children('div:last').children('li').length >= 100 )) {
			chatMessageList.append("<div></div>");
		}
		chatMessageList.children('div:last').append(newMessage);
		if (resubMessage != null) { addMessage(resubMessage); }
		if (chatMessageList.children('div').length > 3 && bottom) {
			chatMessageList.children('div:visible').slice(0,-3).hide();
		}
	}


	//Limit messages in Chat
	var count = chatMessageList.find("li").length;
	//document.getElementById("newFavInput").value = " " + count;
	if (count >= 200000) {
		$("#" + channelLC + " .chatContent .chatMessageList div:first").remove();
	}

	//Scroll to bottom
	if (bottom) {
		var contentHeight = chatContent[0].scrollHeight;
		chatContent.scrollTop( contentHeight + 50 );
		//chatContent.stop(true, false).delay(50).animate({ scrollTop: contentHeight }, 2000, 'linear');
		$("#" + channelLC + " .chatContent .chatMessageList").find("p:last").imagesLoaded( function() {
			setTimeout(function(){
				contentHeight = chatContent[0].scrollHeight;
				chatContent.scrollTop( contentHeight + 50 );
				//chatContent.stop(true, false).delay(50).animate({ scrollTop: contentHeight }, 2000, 'linear');
				//alert("wub");
			}, 50)
		});
	}
	else if (!bottom && $("#" + channelLC + " .chatNewMessagesInfo").is(':hidden')) {
		var contentHeight = chatContent[0].scrollHeight;
		chatContent.scrollTop( contentHeight + 50 );
		//chatContent.stop(true, false).delay(50).animate({ scrollTop: contentHeight }, 2000, 'linear');
	}
}
function addChat(channel, channelId) {
	var channelLC = channel.toLowerCase();

	if ($(".chat[id$='" + channelLC +"']").length != 0) { return; } //If chat already added do not add another one

	connection.send("JOIN #" + channelLC );
	connectionSend.send("JOIN #" + channelLC );

	var chatArea = $("#main-chat-area");

	chatArea.append('<div class="chat" id="' + channelLC + '">' +
	'<div class="chatHeader" id="' + channelLC + '"><button class="toggleViewerlist" id="' + channelLC + '"></button><span>'+ channel +'</span><button class="removeChat" id="' + channelLC + '"></button><button class="toggleStream" id="' + channelLC + '"></button></div>' +
	'<div class="chatContent" id="' + channelLC + 'scrollArea"><div class="chatMessageList" id="' + channelLC + 'contentArea"></div></div>' +
	'<div class="chatInput" id="' + channelLC + '"><div class="chatNewMessagesInfo" id="' + channelLC + '">More messages below.</div><img class="kappa" src="/img/Kappa.png" /><textarea maxlength="500" class="chatInputField" id="' + channelLC +
  '" placeholder="Send a message..."></textarea><div class="emoteMenu"><div class="emotes"><div class="bttvEmotes" style="width: 100%;"><h3>BTTV Emotes</h3></div><div class="bttvChannelEmotes" style="width: 100%;"><h3>BTTV Channel Emotes</h3></div><div class="ffzEmotes" style="width: 100%;"><h3>FFZ Emotes</h3></div><div class="ffzChannelEmotes" style="width: 100%;"><h3>FFZ Channel Emotes</h3></div></div></div></div>'
	+ '<div class="chatViewerlist" id="' + channelLC + '"></div>'
	+ '<div>');

	//Add Emotes to Emote Menu
		// Twitch Global
		console.log(userEmotes);
	for (var j in userEmotes) {
		var emoteSet = userEmotes[j];
		$(".chatInput[id$='" + channelLC +"'] .emoteMenu .emotes").prepend('<div class="' + j + '" style="width: 100%;"><h3>' + j + '</h3></div>');
		for (var k in emoteSet) {
			$(".chatInput[id$='" + channelLC +"'] .emoteMenu .emotes ." + j).append("<img src='https://static-cdn.jtvnw.net/emoticons/v1/" + emoteSet[k].id + "/1.0' alt='" + emoteSet[k].code + "' />");
		}
	}
		// BTTV Global
	for (var i = 0; i < bttvGlobal.length; i++) {
		if (bttvGlobal[i].channel == null) {
			$(".chatInput[id$='" + channelLC +"'] .emoteMenu .bttvEmotes").append('<img src="https://cdn.betterttv.net/emote/' + bttvGlobal[i].id + '/1x" alt="' + bttvGlobal[i].code + '" />');
		}
	}
		// FFZ Global
	for (var j = 0; j < ffzGlobal.default_sets.length; j++) {
		var emoteSetGlobal = ffzGlobal.default_sets[j];
		var emotesInSetGlobal = ffzGlobal["sets"][emoteSetGlobal]["emoticons"];
		for (var k = 0; k < emotesInSetGlobal.length; k++) {

			var ffzEmoteName = JSON.stringify(emotesInSetGlobal[k].name);

			$(".chatInput[id$='" + channelLC +"'] .emoteMenu .ffzEmotes").append("<img src='https:" + emotesInSetGlobal[k]["urls"]["1"] + "' alt='" + emotesInSetGlobal[k].name + "' />");
		}
	}
		// BTTV Channel
	if (bttvChannels.hasOwnProperty(channelLC)) {
		for (var j = 0; j < bttvChannels[channelLC].length; j++) {
			var bttvChannelEmote = JSON.stringify(bttvChannels[channelLC][j].code);

			var emoteId = JSON.stringify(bttvChannels[channelLC][j].id).substring(1, JSON.stringify(bttvChannels[channelLC][j].id).length-1);
			$(".chatInput[id$='" + channelLC +"'] .emoteMenu .bttvChannelEmotes").append("<img src='https://cdn.betterttv.net/emote/" + emoteId + "/1x' alt='" + bttvChannels[channelLC][j].code + "' />");
		}
	}
		//FFZ Channel
	if (ffzChannels.hasOwnProperty(channelLC)) {
		var ffzChannelId = ffzChannels[channelLC]["room"]["_id"];
		if (ffzChannels[channelLC]["sets"][ffzChannelId] != null) {
			var ffzChannelEmoteSet = ffzChannels[channelLC]["sets"][ffzChannelId]["emoticons"];
			for (var j = 0; j < ffzChannelEmoteSet.length; j++) {

				var ffzChannelEmote = JSON.stringify(ffzChannelEmoteSet[j].name);

				$(".chatInput[id$='" + channelLC +"'] .emoteMenu .ffzChannelEmotes").append("<img src='https:" + ffzChannelEmoteSet[j]["urls"]["1"] + "' alt='" + ffzChannelEmoteSet[j].name + "' />");
			}
		}
	}
	$(".chatInput[id$='" + channelLC +"'] .emoteMenu img").click(function(event){
		var emoteName = $(this).attr("alt");
		var inputField = $(".chatInputField[id$='" + channelLC + "']");
		var curValue = inputField.val();
		var newValue;
		if (!curValue.endsWith(" ") && curValue.length > 0) {
			newValue = curValue + " " + emoteName + " ";
		} else {
			newValue = curValue + emoteName + " ";
		}
		inputField.val(newValue);
	});

  $(".chatInput[id$='" + channelLC +"'] .emoteMenu .emotes h3").click(function(event){
    if ($(this).parent().css("height") === "18px") {
      $(this).parent().css({ 'height': ''});
    } else {
      $(this).parent().css({ 'height': '18px'});
    }
  });
  $(document).on("click", ".toggleStream[id$='" + channelLC + "']", function() {
    if ($(this).parent().parent().find(".chatStream").length) {
      $(this).parent().parent().find(".chatStream").remove();
      $(this).parent().parent().find(".chatContent").css({'height': 'calc(100% - 105px)'});
			$(this).parent().parent().find(".chatViewerlist").css({'height': 'calc(100% - 35px)'});
    } else {
      $(this).parent().parent().prepend('<div class="chatStream" id="' + channelLC + '"><div class="chatStreamInner"><iframe src="https://player.twitch.tv/?channel=' + channelLC + '" frameborder="0" allowfullscreen="true" scrolling="no" height="100%" width="100%"></iframe></div></div>');
      $(this).parent().parent().find(".chatContent").css({'height': 'calc(100% - 105px - ' + $(this).parent().parent().find(".chatStream").outerHeight() + 'px )'});
			$(this).parent().parent().find(".chatViewerlist").css({'height': 'calc(100% - 35px - ' + $(this).parent().parent().find(".chatStream").outerHeight() + 'px )'});
    }
  });
  $(document).on("resize", ".chat[id$='" + channelLC + "']", function() {
    $(this).find(".chatContent").css({'height': 'calc(100% - 105px - ' + $(this).find(".chatStream").outerHeight() + 'px )'});
		$(this).find(".chatViewerlist").css({'height': 'calc(100% - 35px - ' + $(this).find(".chatStream").outerHeight() + 'px )'});
  });
	$(document).on("click", ".removeChat[id$='" + channelLC + "']", function() {
    $(document).off("click", ".toggleStream[id$='" + channelLC + "']");
    $(this).parent().parent().remove();
    connection.send("PART #" + channelLC );
		connectionSend.send("PART #" + channelLC );
	});
	var toggleVL = 0;
	$(document).on("click", ".toggleViewerlist[id$='" + channelLC + "']", function() {
		//if ($(this).parent().parent().find("div.chatViewerlist").css("display").toLowerCase() != "none") {
		if (toggleVL % 2 != 0) {
			$(this).parent().parent().find("div.chatViewerlist").hide();
			$(this).parent().parent().find("div.chatContent").show();
			$(this).parent().parent().find("div.chatInput").show();
		} else {
			$(this).parent().parent().find("div.chatContent").hide();
			$(this).parent().parent().find("div.chatInput").hide();
			$(this).parent().parent().find("div.chatViewerlist").show();

			var viewerlist = $(this).parent().parent().find("div.chatViewerlist");

			$.ajax({
				url: ("https://tmi.twitch.tv/group/user/" + channelLC + "/chatters"),
				headers: {"Accept": "application/vnd.twitchtv.v5+json"},
				dataType: "jsonp",
				async: true
			}).done(function(data) {
				viewerlist.empty();
				data = data.data;
				viewerlist.append("Chatter Count: " + data.chatter_count + "<br /><br />");

				var chatters = data.chatters;
				if (chatters.moderators.length > 0) {
					viewerlist.append("<h3>Moderators</h3>");
					var modList = "<ul>";
					for (var i = 0; i < chatters.moderators.length; i++) {
						modList += "<li>" + chatters.moderators[i] + "</li>";
					}
					modList += "</ul><br />";
					viewerlist.append(modList);
				}
				if (chatters.staff.length > 0) {
					viewerlist.append("<h3>Staff</h3>");
					var staffList = "<ul>";
					for (var i = 0; i < chatters.staff.length; i++) {
						staffList += "<li>" + chatters.staff[i] + "</li>";
					}
					staffList += "</ul><br />";
					viewerlist.append(staffList);
				}
				if (chatters.admins.length > 0) {
					viewerlist.append("<h3>Admins</h3>");
					var adminsList = "<ul>";
					for (var i = 0; i < chatters.admins.length; i++) {
						adminsList += "<li>" + chatters.admins[i] + "</li>";
					}
					adminsList += "</ul><br />";
					viewerlist.append(adminsList);
				}
				if (chatters.global_mods.length > 0) {
					viewerlist.append("<h3>Global Mods</h3>");
					var global_modsList = "<ul>";
					for (var i = 0; i < chatters.global_mods.length; i++) {
						global_modsList += "<li>" + chatters.global_mods[i] + "</li>";
					}
					global_modsList += "</ul><br />";
					viewerlist.append(global_modsList);
				}
				if (chatters.viewers.length > 0) {
					viewerlist.append("<h3>Viewers</h3>");
					var viewersList = "<ul>";
					for (var i = 0; i < chatters.viewers.length; i++) {
						viewersList += "<li>" + chatters.viewers[i] + "</li>";
					}
					viewersList += "</ul><br />";
					viewerlist.append(viewersList);
				}

			});
		}
		toggleVL++;
	});
  $(".chat[id$='" + channelLC +"']").resizable({
		handles: 'e'
	});
	$(".chatInputField[id$='" + channelLC +"']").keydown(function(event){
		if(event.keyCode == 13){
			event.preventDefault();
			if ($(this).val().startsWith(".") || $(this).val().startsWith("/")) {
				connection.send("PRIVMSG #" + channelLC + " :" + $(this).val() );
			} else {
				connectionSend.send("PRIVMSG #" + channelLC + " :" + $(this).val() );
			}
			$(this).val("");
		}
		else if (event.keyCode == 9) {
			event.preventDefault();
			if ($(this).val().length != 0 && !$(this).val().endsWith(" ")) {
				console.log("WUB");
			}
		}
	});
	$(".chatNewMessagesInfo[id$='" + channelLC +"']").click(function(event){
		$(this).hide();
		$("#" + channelLC + " .chatContent").scrollTop($("#" + channelLC + " .chatContent")[0].scrollHeight );
	});
	$(".chatInput[id$='" + channelLC +"'] .kappa").click(function(event){
		if ($(".chatInput[id$='" + channelLC +"'] .emoteMenu").is(':hidden')) {
			$(".chatInput[id$='" + channelLC +"'] .emoteMenu").show();
		} else {
			$(".chatInput[id$='" + channelLC +"'] .emoteMenu").hide();
			$(".chatInput[id$='" + channelLC +"'] .emoteMenu").css({"top": "", "left" : "", "right" : "", "bottom" : ""});
		}
	});
	$(".chatInput[id$='" + channelLC +"'] .emoteMenu").draggable({
        containment: $("#main-chat-area")
    });
    $(".chatInput[id$='" + channelLC +"'] .emoteMenu").resizable({
        handles: 'n, ne, e',
		minHeight: 200,
		minWidth: 200
    });
	chatArea.sortable({
        handle: ".chatHeader",
		start: function(event, ui) {
			ui.placeholder.width(ui.item.width());
			ui.placeholder.height(ui.item.height());
		},
		animation: 300,
		cursor: "move",
		revert:200,
		scroll: true,
		containment: "parent"
	});

	var contentHeightOld = $(".chatContent[id$='" + channelLC + "scrollArea'] .chatMessageList").height();
	var contentWidthOld = $(".chatContent[id$='" + channelLC + "scrollArea'] .chatMessageList").width();
	$(".chat[id$='" + channelLC).resize( function(event){
		if ($(".chatNewMessagesInfo[id$='" + channelLC +"']").is(':hidden') && contentHeightOld <= $(".chatContent[id$='" + channelLC + "contentArea']").height()) {
			$("#" + channelLC + " .chatContent").scrollTop($("#" + channelLC + " .chatContent")[0].scrollHeight + 50 );
			//$("#" + channelLC + " .chatContent").stop(true, true).animate({ scrollTop: $("#" + channelLC + " .chatContent")[0].scrollHeight }, 1000);
			contentHeightOld = $(".chatContent[id$='" + channelLC + "contentArea']").height();
		}
		if ($(".chatNewMessagesInfo[id$='" + channelLC +"']").is(':hidden') ) {
			//alert("test2");
			$("#" + channelLC + " .chatContent").scrollTop($("#" + channelLC + " .chatContent")[0].scrollHeight + 50 );
			contentWidthOld = $(".chatContent[id$='" + channelLC + "contentArea']").width();
		}
	});
	$(".chatContent[id$='" + channelLC + "scrollArea']").scroll( function(){
		//Bug workaround: unexpected horizontal scrolling despite overflow-x: hidden
		if($(this).scrollLeft() != 0 ){
			$(this).scrollLeft(0);
		}
		//New messages info scroll behavior
		if ($(this)[0].scrollHeight - $(this).scrollTop() < $(this).outerHeight() + 50 ) {
			$(".chatNewMessagesInfo[id$='" + channelLC +"']").hide();
		} else {
			$(".chatNewMessagesInfo[id$='" + channelLC +"']").show();
		}

		if ($(this).scrollTop() < 200) {
			$(".chatContent[id$='" + channelLC + "scrollArea'] .chatMessageList").children('div:hidden:last').show();
		}
	});

	//Download recent messages
	/*$.ajax({
		url: ("https://tmi.twitch.tv/api/rooms/" + channelId + "/recent_messages?count=50"),
		headers: {"Accept": "application/vnd.twitchtv.v5+json", "Client-ID": clientID, "Authorization": ("OAuth " + localStorage.accessToken) },
		dataType: "jsonp",
        success: "getJSONPString",
		async: true
	}).done(function(data) {
		console.log(data);
		var recentMessages = data.messages;
		for (var j = 0; j < recentMessages.length; j++) {
			//
		}
	});*/
}
function addFavToList(channelParam) {

	function addFavLine(channel, profilePicURL, channelId) {

		var channelLC = channel.toLowerCase();

		//Download Channel Badges
		$.ajax({
			url: ("https://badges.twitch.tv/v1/badges/channels/" + channelId + "/display"),
			headers: {"Accept": "application/vnd.twitchtv.v5+json", "Client-ID": clientID },
			async: true
		}).done(function(data) {
			badgesChannels[channelLC] = data.badge_sets;
		});

		//Download BTTV Channel Emotes
		$.ajax({
			url: ("https://api.betterttv.net/2/channels/" + channelLC ),
			async: true,
			dataType: "json",
			error: function (xhr, ajaxOptions, thrownError) {
				if (xhr.status == 404) {
					//Ignore - No BTTV emotes in this channel
					console.log("No BTTV Emotes in Channel: " + channel );
				}
			}
		}).done(function(data) {
			bttvChannels[channelLC] = data.emotes;
		});
		//Download FFZ Channel Emotes/Moderator Channel Badge
		$.ajax({
			url: ("https://api.frankerfacez.com/v1/room/" + channelLC ),
			async: true,
			dataType: "json",
			error: function (xhr, ajaxOptions, thrownError) {
				if (xhr.status == 404) {
					//Ignore - No FFZ emotes in this channel
					console.log("No FFZ Emotes in Channel: " + channel );
				}
			}
		}).done(function(data) {
			ffzChannels[channelLC] = data;
		});


		if (channel.length > 0 && $(".favEntry[id$='" + channelLC +"']").length == 0) {
			document.getElementById("newFavInput").value = "";

			var channelList = $("#fav-channel-list");

			channelList.append("<div class=\"favEntry\" id=\"" + channelLC
			+ "\"><img class=\"profilePic\" src=\"" + ((profilePicURL != null ) ? profilePicURL : "/img/defaultProfile.png") + "\" /><input class=\"favEntryAddChatButton\" id=\"" + channelLC + "\"type=\"button\" value=\"" + channel
			+ "\"><input class=\"favEntryRemoveButton\" id=\"" + channelLC + "\" type=\"button\" ></div>");
			$(document).on("click", ".favEntryAddChatButton[id$='" + channelLC + "']", function() {
				addChat(channel, channelId);
			});
			$(document).on("click", ".favEntryRemoveButton[id$='" + channelLC + "']", function() {
				$(this).parent().remove();

				var channels = JSON.parse(localStorage.getItem("channels"));
				var index = channels.indexOf(channelId);
				if (index > -1) {
					channels.splice(index, 1);
				}
				localStorage.setItem("channels", JSON.stringify(channels));
			});
			channelList.sortable({
				axis: "y",
				animation: 300,
				cursor: "move",
				revert:200,
				scroll: true,
				containment: "parent"
			});

			var channels = JSON.parse(localStorage.getItem("channels"));
			var index = channels.indexOf(channelId);
			if (index > -1) {
				channels.splice(index, 1);
			}
			channels.push(channelId);
			localStorage.setItem("channels", JSON.stringify(channels));
		}
	}

	if (document.getElementById("newFavInput").value.length < 3 && channelParam == null) {
		return;
	} else if ( $.type(channelParam) === "string" ) {

		$.ajax({
			url: ("https://api.twitch.tv/kraken/users/" + channelParam),
			headers: {"Accept": "application/vnd.twitchtv.v5+json", "Client-ID": clientID },
			async: true
		}).done(function(data) {
			var channel = data.display_name;
			var channelId = data._id;
			var profilePicURL = data.logo;
			addFavLine(channel, profilePicURL, channelId);
		});
	} else {
		$.ajax({
			url: ("https://api.twitch.tv/kraken/users?login=" + document.getElementById("newFavInput").value),
			headers: {"Accept": "application/vnd.twitchtv.v5+json", "Client-ID": clientID },
			async: true
		}).done(function(data) {
			if (data.users.length >= 1) {
			  var channel = data.users[0].display_name;
			  var channelId = data.users[0]._id;
			  var profilePicURL = data.users[0].logo;
			  document.getElementById("newFavInput").placeholder = "";
			  addFavLine(channel, profilePicURL, channelId);
			} else {
			  var channel = "";
			  document.getElementById("newFavInput").value = "";
			  $("#newFavInput").queue(function(next) { $(this).attr('placeholder','Channel does not exist.'); next(); }).delay(5000).queue(function(next) { $(this).attr('placeholder',''); next(); });
			}
		});
	}

}
function toggleFavList() {
	if (document.getElementById("fav-channel-list").style.display == "none") {
		document.getElementById("fav-channel-list").style.display = "inline-block";
		$(".container").css({"width":"calc(100% - 250px)"});
		document.getElementById("channelListToggle").style.backgroundImage = "url(./img/arrow_down.svg)";
	} else {
		document.getElementById("fav-channel-list").style.display = "none";
		$(".container").css({"width":"100%"});
		document.getElementById("channelListToggle").style.backgroundImage = "url(./img/arrow_up.svg)";
	}
}
