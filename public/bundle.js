!function(){"use strict";class e{static get CLIENT_ID(){return"xllef7inid2mbeqoaj2o6bsohg7pz7"}static get PERMISSION_SCOPE(){return"chat_login+user_blocks_edit+user_blocks_read+user_subscriptions"}static get SELF_URL(){return"http://localhost:5000/"}static get AUTHORIZE_URL(){return"https://id.twitch.tv/oauth2/authorize?response_type=token&client_id="+e.CLIENT_ID+"&redirect_uri="+e.SELF_URL+"&scope="+e.PERMISSION_SCOPE}static get GLOBAL_BADGES_API_URL(){return"https://badges.twitch.tv/v1/badges/global/display"}static get WEBSOCKET_URL(){return"wss://irc-ws.chat.twitch.tv:443"}}class t{static getUsers(t,s,a){$.ajax({context:s,url:"https://api.twitch.tv/helix/users",dataType:"json",headers:{"Client-ID":e.CLIENT_ID},data:{login:t},async:!0}).done(a)}static async getUserFromOAuth(){return await $.ajax({statusCode:{401:function(){window.location.replace(e.AUTHORIZE_URL)}},url:"https://id.twitch.tv/oauth2/validate",dataType:"json",headers:{Authorization:"OAuth "+localStorage.accessToken}})}static getChatterList(e,t,s){$.ajax({context:t,url:"https://tmi.twitch.tv/group/user/"+e+"/chatters",headers:{Accept:"application/vnd.twitchtv.v5+json"},dataType:"jsonp",async:!0}).done(s)}static getRecentMessages(e,t,s){$.ajax({context:t,type:"GET",url:"https://chats.c0ldplasma.de/php/recentMessages.php",data:{chatId:e},async:!0}).done(s)}}class s{constructor(){this.userName_="",this.userNameLC_="",this.userId_=""}getUserName(){return this.userName_}getUserId(){return this.userId_}async requestAppUserData(){return await t.getUserFromOAuth().then(e=>{console.log(e),void 0!==e.login?(this.userName_=e.login,this.userNameLC_=e.login.toLowerCase(),this.userId_=e.user_id):alert("Error while getting username")})}}var a="0.4.0";class n{constructor(t){if(this.appUser_=t,new.target===n)throw new TypeError("Cannot construct abstract instances of TwitchIRCConnection directly");this.isLoaded_=!1,this.connection_=new WebSocket(e.WEBSOCKET_URL),this.connection_.onopen=this.onOpen_.bind(this),this.connection_.onerror=n.onError_.bind(this)}onOpen_(){this.connection_.send("CAP REQ :twitch.tv/membership"),this.connection_.send("CAP REQ :twitch.tv/tags"),this.connection_.send("CAP REQ :twitch.tv/commands"),this.connection_.send("PASS oauth:"+localStorage.accessToken),this.connection_.send("NICK "+this.appUser_.getUserName()),this.isLoaded_=!0}isLoaded(){return this.isLoaded_}static onError_(){console.log("WebSocket Error "+error),alert("ERROR: "+error)}onMessage_(e){}leaveChat(e){this.connection_.send("PART #"+e)}joinChat(e){this.connection_.send("JOIN #"+e)}send(e){this.connection_.send(e)}}class i extends n{constructor(e){super(e),this.connection_.onmessage=this.onMessage_.bind(this)}onMessage_(e){let t=e.data.split("\n");for(let e=0;e<t.length;e++){let s=t[e];s.length<=1||s.startsWith("PING :tmi.twitch.tv")&&this.connection_.send("PONG :tmi.twitch.tv")}}}class o extends n{constructor(e,t,s){super(e),this.messageParser_=t,this.chatManager_=s,this.connection_.onmessage=this.onMessage_.bind(this)}onMessage_(e){let t=e.data.split("\n");for(let e=0;e<t.length;e++){let s=t[e];if(s.startsWith("PING :tmi.twitch.tv"))this.connection_.send("PONG :tmi.twitch.tv");else if(s.length>1){let e=this.messageParser_.parseMessage(s);this.chatManager_.addMessages(e)}}}}class l{constructor(){this.badgesChannels_={},this.badgesGlobal_=null,this.downloadGlobalBadges_()}getBadgesChannels(){return this.badgesChannels_}getBadgesGlobal(){return this.badgesGlobal_}downloadGlobalBadges_(){$.ajax({context:this,url:e.GLOBAL_BADGES_API_URL,headers:{Accept:"application/vnd.twitchtv.v5+json","Client-ID":e.CLIENT_ID},async:!0}).done(function(e){this.badgesGlobal_=e.badge_sets})}downloadChannelBadges(t,s){$.ajax({context:this,url:"https://badges.twitch.tv/v1/badges/channels/"+s+"/display",headers:{Accept:"application/vnd.twitchtv.v5+json","Client-ID":e.CLIENT_ID},async:!0}).done(function(e){this.badgesChannels_[t]=e.badge_sets})}}class r{constructor(e){this.appUser_=e,this.userEmotes_={},this.bttvChannels_={},this.bttvGlobal_={},this.ffzChannels_={},this.ffzGlobal_={},this.downloadGlobalEmotes_()}getUserEmotes(){return this.userEmotes_}getBttvGlobal(){return this.bttvGlobal_}getFfzGlobal(){return this.ffzGlobal_}getBttvChannels(){return this.bttvChannels_}getFfzChannels(){return this.ffzChannels_}downloadGlobalEmotes_(){$.ajax({context:this,url:"https://api.twitch.tv/kraken/users/"+this.appUser_.getUserId()+"/emotes",headers:{Accept:"application/vnd.twitchtv.v5+json","Client-ID":e.CLIENT_ID,Authorization:"OAuth "+localStorage.accessToken},async:!0}).done(function(e){this.userEmotes_=e.emoticon_sets}),$.ajax({context:this,url:"https://api.betterttv.net/2/emotes",async:!0}).done(function(e){this.bttvGlobal_=e.emotes}),$.ajax({context:this,url:"https://api.frankerfacez.com/v1/set/global",async:!0}).done(function(e){this.ffzGlobal_=e})}downloadChannelEmotes(e){this.downloadFfzChannelEmotes_(e),this.downloadBttvChannelEmotes_(e)}downloadBttvChannelEmotes_(e){$.ajax({context:this,url:"https://api.betterttv.net/2/channels/"+e,async:!0,dataType:"json",error:function(t){404===t.status&&console.log("No BTTV Emotes in Channel: "+e)}}).done(function(t){this.bttvChannels_[e]=t.emotes})}downloadFfzChannelEmotes_(e){$.ajax({context:this,url:"https://api.frankerfacez.com/v1/room/"+e,async:!0,dataType:"json",error:function(t){404===t.status&&console.log("No FFZ Emotes in Channel: "+e)}}).done(function(t){this.ffzChannels_[e]=t})}}class h{constructor(e,t,s){this.isVisible_=!0,this.badgeManager_=e,this.emoteManager_=t,this.chatManager_=s,$("#addFavFromInput").click(this.addFavToList.bind(this)),$("#newFavInput").keydown(function(e){13===e.keyCode&&$("#addFavFromInput").click()}),document.getElementById("channelListToggle").addEventListener("click",this.toggleFavList),this.loadFavoritesFromLocalStorage_()}loadFavoritesFromLocalStorage_(){try{let e=JSON.parse(localStorage.getItem("channels"));if(null!==e)for(;e.length;){let t=e.splice(0,98);this.addFavToList(t)}else{let e=[];localStorage.setItem("channels",JSON.stringify(e))}}catch(e){alert("Error: "+e);let t=[];localStorage.setItem("channels",JSON.stringify(t))}}toggleFavList(){this.isVisible_=!this.isVisible_,this.isVisible_?(document.getElementById("fav-channel-list").style.display="none",$(".container").css({width:"100%"}),document.getElementById("channelListToggle").style.backgroundImage="url(./img/arrow_up.svg)"):(document.getElementById("fav-channel-list").style.display="inline-block",$(".container").css({width:"calc(100% - 250px)"}),document.getElementById("channelListToggle").style.backgroundImage="url(./img/arrow_down.svg)")}addFavToList(e){let s=document.getElementById("newFavInput").value.split(",");$.isArray(e)&&(s=e);let a=s.length;t.getUsers(s,this,function(e){e=e.data;let t=a-e._total;for(let t=0;t<e.length;t++){let s=e[t].display_name,a=e[t].id,n=e[t].profile_image_url;document.getElementById("newFavInput").placeholder="",this.addFavLine_(s,n,a)}t>0&&this.showChannelDoesNotExistInfo_(t)})}showChannelDoesNotExistInfo_(e){document.getElementById("newFavInput").value="",$("#newFavInput").queue(function(t){let s=e>1?" Channels do not exist.":" Channel does not exist.";$(this).attr("placeholder",e+s),t()}).delay(5e3).queue(function(e){$(this).attr("placeholder",""),e()})}addFavLine_(e,t,s){let a=e.toLowerCase();if(this.badgeManager_.downloadChannelBadges(a,s),this.emoteManager_.downloadChannelEmotes(a),e.length>0&&0===$(".favEntry[id$='"+a+"']").length){document.getElementById("newFavInput").value="";let n=$("#fav-channel-list");n.append('<div class="favEntry" id="'+a+'"><img class="profilePic" src="'+(null!=t?t:"/img/defaultProfile.png")+'" alt="Pic." /><input class="favEntryAddChatButton" id="'+a+'" type="button" value="'+e+'"><input class="favEntryRemoveButton" id="'+a+'" type="button" ></div>'),$(document).on("click",".favEntryAddChatButton[id$='"+a+"']",this,function(t){t.data.chatManager_.addChat(e,s)}),$(document).on("click",".favEntryRemoveButton[id$='"+a+"']",this,function(e){$(this).parent().remove(),e.data.removeChannelFromLocalStorage_(a)}),n.sortable({axis:"y",animation:300,cursor:"move",revert:200,scroll:!0,containment:"parent"})}this.storeChannelInLocalStorage_(a)}storeChannelInLocalStorage_(e){let t=JSON.parse(localStorage.getItem("channels")),s=t.indexOf(e);s>-1&&t.splice(s,1),t.push(e),localStorage.setItem("channels",JSON.stringify(t))}removeChannelFromLocalStorage_(e){let t=JSON.parse(localStorage.getItem("channels")),s=t.indexOf(e);s>-1&&t.splice(s,1),localStorage.setItem("channels",JSON.stringify(t))}}class c{constructor(e,t){this.chatName_=e,this.timestamp_=this.getCurrentTimeFormatted_(),this.content_=t.trim()}getContent(){return this.content_}getTimestamp(){return this.timestamp_}getChatName(){return this.chatName_}getCurrentTimeFormatted_(){let e,t=new Date;return e=t.getHours()>=10&&t.getMinutes()>=10?t.getHours()+":"+t.getMinutes():t.getHours()<10&&t.getMinutes()>=10?"0"+t.getHours()+":"+t.getMinutes():t.getHours()>=10&&t.getMinutes()<10?t.getHours()+":0"+t.getMinutes():"0"+t.getHours()+":0"+t.getMinutes()}getHtml(){return'<li style="border-top: 1px solid #673ab7;border-bottom: 1px solid #673ab7;padding-top: 3px; padding-bottom: 3px;"><span style="color: gray;font-size: 11px;">'+this.timestamp_+"</span>  "+this.content_+"</li>"}}class d extends c{constructor(e,t){super(e,t)}getHtml(){return'<p style="color: gray; font-size: 11px;padding-left: 10px;font-weight: 200;">'+this.getContent()+"</p>"}}class g{constructor(e,t,s,a,n,i){this.channelName_=e,this.channelId_=t,this.channelNameLC_=e.toLowerCase(),this.emoteManager_=s,this.receiveIrcConnection_=a,this.sendIrcConnection_=n,this.messageParser_=i,this.messageCount_=0,this.containerCount_=0,this.MESSAGE_LIMIT_=2e5,this.MESSAGES_IN_CONTAINER_=100,this.loadRecentMessages_()}addMessage(e){if(e instanceof d){$(".chatInput#"+e.getChatName().toLowerCase()).append(e.getHtml())}else{let t=$("#"+this.channelName_.toLowerCase()+"contentArea");(0===t.children("div").length||0!==t.children("div").length&&t.children("div:last").children("li").length>=this.MESSAGES_IN_CONTAINER_)&&(t.append("<div></div>"),this.containerCount_++),t.children("div:last").append(e.getHtml()),this.messageCount_++,this.limitMessages_(),this.hideNotVisibleMessages(),this.correctScrollPosition_()}}loadRecentMessages_(){t.getRecentMessages(this.channelId_,this,function(e){console.log(e);let t=JSON.parse(e).messages;for(let e=0;e<t.length;e++){let s=this.messageParser_.parseMessage(t[e]);for(let e=0;e<s.length;e++)this.addMessage(s[e])}})}limitMessages_(){this.messageCount_>=this.MESSAGE_LIMIT_&&($("#"+this.channelName_+" .chatContent .chatMessageList div:first").remove(),this.messageCount_-=this.MESSAGES_IN_CONTAINER_,this.containerCount_--)}hideNotVisibleMessages(){if(this.containerCount_>3&&this.isScrolledToBottom()){$("#"+this.channelName_+"contentArea").children("div:visible").slice(0,-3).hide()}}isScrolledToBottom(){let e=!1,t=$("#"+this.channelNameLC_+"scrollArea");return t[0].scrollHeight-t.scrollTop()<t.outerHeight()+50&&(e=!0),e}correctScrollPosition_(){let e=this.isScrolledToBottom(),t=$("#"+this.channelNameLC_+"scrollArea");if(e){let e=t[0].scrollHeight;t.scrollTop(e+50),$("#"+this.channelNameLC_+" .chatContent .chatMessageList").find("p:last").imagesLoaded(function(){setTimeout(function(){e=t[0].scrollHeight,t.scrollTop(e+50)},50)})}else if(!e&&$("#"+this.channelNameLC_+" .chatNewMessagesInfo").is(":hidden")){let e=t[0].scrollHeight;t.scrollTop(e+50)}}getHtml(){let e=this.channelName_.toLowerCase();return`<div class="chat" id="${e}">\n        <div class="chatHeader">\n        <button class="toggleViewerList" id="${e}"></button>\n        <span>${this.channelName_}</span>\n        <button class="removeChat" id="${e}"></button>\n        <button class="toggleStream" id="${e}"></button>\n        </div>\n        <div class="chatContent" id="${e}scrollArea">\n        <div class="chatMessageList" id="${e}contentArea"></div>\n        </div>\n        <div class="chatInput" id="${e}">\n        <div class="chatNewMessagesInfo" id="${e}">More messages below.</div>\n        <img class="kappa" src="/img/Kappa.png" alt="E"/><textarea maxlength="500"\n        class="chatInputField"\n        id="${e}"\n        placeholder="Send a message..."></textarea>\n        <div class="emoteMenu">\n        <div class="emotes">\n        <div class="bttvEmotes" style="width: 100%;"><h3>BTTV Emotes</h3></div>\n        <div class="bttvChannelEmotes" style="width: 100%;"><h3>BTTV Channel Emotes</h3>\n        </div>\n        <div class="ffzEmotes" style="width: 100%;"><h3>FFZ Emotes</h3></div>\n        <div class="ffzChannelEmotes" style="width: 100%;"><h3>FFZ Channel Emotes</h3></div>\n        </div>\n        </div>\n        </div>\n        <div class="chatViewerList" id="${e}"></div>\n        </div>`}addAbilities(){this.addEmotesToEmoteMenu_(),this.addEmoteMenuImgClickAbility_(),this.addEmoteMenuGroupClickAbility_(),this.addEmoteMenuToggleAbility_(),this.addEmoteMenuDraggableAbility_(),this.addEmoteMenuResizableAbility_(),this.addStreamIframeAbility_(),this.addResizeAbility_(),this.addChatterListAbility_(),this.addSendMessagesAbility_(),this.addNewMessageInfoAbility_()}addEmotesToEmoteMenu_(){let e=this.channelName_.toLowerCase(),t=this.emoteManager_.getUserEmotes();for(let s in t)if({}.hasOwnProperty.call(t,s)){let a=t[s];$(".chatInput[id$='"+e+"'] .emoteMenu .emotes").prepend('<div class="'+s+'" style="width: 100%;"><h3>'+s+"</h3></div>");for(let t in a)({}).hasOwnProperty.call(a,t)&&$(".chatInput[id$='"+e+"'] .emoteMenu .emotes ."+s).append("<img src='https://static-cdn.jtvnw.net/emoticons/v1/"+a[t].id+"/1.0' alt='"+a[t].code+"' />")}let s=this.emoteManager_.getBttvGlobal();for(let t=0;t<s.length;t++)null==s[t].channel&&$(".chatInput[id$='"+e+"'] .emoteMenu .bttvEmotes").append('<img src="https://cdn.betterttv.net/emote/'+s[t].id+'/1x" alt="'+s[t].code+'" />');let a=this.emoteManager_.getFfzGlobal();for(let t=0;t<a.default_sets.length;t++){let s=a.default_sets[t],n=a.sets[s].emoticons;for(let t=0;t<n.length;t++)$(".chatInput[id$='"+e+"'] .emoteMenu .ffzEmotes").append("<img src='https:"+n[t].urls[1]+"' alt='"+n[t].name+"' />")}let n=this.emoteManager_.getBttvChannels();if(n.hasOwnProperty(e))for(let t=0;t<n[e].length;t++){let s=JSON.stringify(n[e][t].id).substring(1,JSON.stringify(n[e][t].id).length-1);$(".chatInput[id$='"+e+"'] .emoteMenu .bttvChannelEmotes").append("<img src='https://cdn.betterttv.net/emote/"+s+"/1x' alt='"+n[e][t].code+"' />")}let i=this.emoteManager_.getFfzChannels();if(i.hasOwnProperty(e)){let t=i[e].room._id;if(null!=i[e].sets[t]){let s=i[e].sets[t].emoticons;for(let t=0;t<s.length;t++)$(".chatInput[id$='"+e+"'] .emoteMenu .ffzChannelEmotes").append("<img src='https:"+s[t].urls[1]+"' alt='"+s[t].name+"' />")}}}addEmoteMenuImgClickAbility_(){let e=this.channelName_.toLowerCase();$(".chatInput[id$='"+e+"'] .emoteMenu img").click(function(){let t,s=$(this).attr("alt"),a=$(".chatInputField[id$='"+e+"']"),n=a.val();t=!n.endsWith(" ")&&n.length>0?n+" "+s+" ":n+s+" ",a.val(t)})}addEmoteMenuGroupClickAbility_(){let e=this.channelName_.toLowerCase();$(".chatInput[id$='"+e+"'] .emoteMenu .emotes h3").click(function(){"18px"===$(this).parent().css("height")?$(this).parent().css({height:""}):$(this).parent().css({height:"18px"})})}addEmoteMenuToggleAbility_(){let e=this.channelName_.toLowerCase(),t=$(".chatInput[id$='"+e+"'] .emoteMenu");$(".chatInput[id$='"+e+"'] .kappa").click(function(){t.is(":hidden")?$(".chatInput[id$='"+e+"'] .emoteMenu").show():(t.hide(),t.css({top:"",left:"",right:"",bottom:""}))})}addEmoteMenuDraggableAbility_(){let e=this.channelName_.toLowerCase(),t=$(".chatInput[id$='"+e+"'] .emoteMenu"),s=$("#main-chat-area");t.draggable({containment:s})}addEmoteMenuResizableAbility_(){let e=this.channelName_.toLowerCase();$(".chatInput[id$='"+e+"'] .emoteMenu").resizable({handles:"n, ne, e",minHeight:200,minWidth:200})}addStreamIframeAbility_(){let e=this.channelName_.toLowerCase();$(document).on("click",".toggleStream[id$='"+e+"']",function(){$(this).parent().parent().find(".chatStream").length?($(this).parent().parent().find(".chatStream").remove(),$(this).parent().parent().find(".chatContent").css({height:"calc(100% - 105px)"}),$(this).parent().parent().find(".chatViewerList").css({height:"calc(100% - 35px)"})):($(this).parent().parent().prepend('<div class="chatStream" id="'+e+'"><div class="chatStreamInner"><iframe src="https://player.twitch.tv/?channel='+e+'" frameborder="0" allowfullscreen="true" scrolling="no" height="100%" width="100%"></iframe></div></div>'),$(this).parent().parent().find(".chatContent").css({height:"calc(100% - 105px - "+$(this).parent().parent().find(".chatStream").outerHeight()+"px )"}),$(this).parent().parent().find(".chatViewerList").css({height:"calc(100% - 35px - "+$(this).parent().parent().find(".chatStream").outerHeight()+"px )"}))})}addResizeAbility_(){let e=this.channelName_.toLowerCase();$(document).on("resize",".chat[id$='"+e+"']",function(){$(this).find(".chatContent").css({height:"calc(100% - 105px - "+$(this).find(".chatStream").outerHeight()+"px )"}),$(this).find(".chatViewerList").css({height:"calc(100% - 35px - "+$(this).find(".chatStream").outerHeight()+"px )"})}),$(".chat[id$='"+e+"']").resizable({handles:"e",start:function(){$("iframe").css("pointer-events","none")},stop:function(){$("iframe").css("pointer-events","auto")}});let t=$(".chatContent[id$='"+e+"scrollArea'] .chatMessageList").height();$(".chat[id$='"+e).resize(function(){let s=$(".chatNewMessagesInfo[id$='"+e+"']"),a=$("#"+e+" .chatContent"),n=$(".chatContent[id$='"+e+"contentArea']");s.is(":hidden")&&t<=n.height()&&(a.scrollTop(a[0].scrollHeight+50),t=n.height()),s.is(":hidden")&&a.scrollTop(a[0].scrollHeight+50)})}addChatterListAbility_(){let e=this.channelName_.toLowerCase(),s=0;$(document).on("click",".toggleViewerList[id$='"+e+"']",function(){if(s%2!=0)$(this).parent().parent().find("div.chatViewerList").hide(),$(this).parent().parent().find("div.chatContent").show(),$(this).parent().parent().find("div.chatInput").show();else{$(this).parent().parent().find("div.chatContent").hide(),$(this).parent().parent().find("div.chatInput").hide(),$(this).parent().parent().find("div.chatViewerList").show();let s=$(this).parent().parent().find("div.chatViewerList");t.getChatterList(e,this,function(e){s.empty(),e=e.data,s.append("Chatter Count: "+e.chatter_count+"<br /><br />");let t=e.chatters;if(t.moderators.length>0){s.append("<h3>Moderators</h3>");let e="<ul>";for(let s=0;s<t.moderators.length;s++)e+="<li>"+t.moderators[s]+"</li>";e+="</ul><br />",s.append(e)}if(t.staff.length>0){s.append("<h3>Staff</h3>");let e="<ul>";for(let s=0;s<t.staff.length;s++)e+="<li>"+t.staff[s]+"</li>";e+="</ul><br />",s.append(e)}if(t.admins.length>0){s.append("<h3>Admins</h3>");let e="<ul>";for(let s=0;s<t.admins.length;s++)e+="<li>"+t.admins[s]+"</li>";e+="</ul><br />",s.append(e)}if(t.global_mods.length>0){s.append("<h3>Global Mods</h3>");let e="<ul>";for(let s=0;s<t.global_mods.length;s++)e+="<li>"+t.global_mods[s]+"</li>";e+="</ul><br />",s.append(e)}if(t.viewers.length>0){s.append("<h3>Viewers</h3>");let e="<ul>";for(let s=0;s<t.viewers.length;s++)e+="<li>"+t.viewers[s]+"</li>";e+="</ul><br />",s.append(e)}})}s++})}addSendMessagesAbility_(){let e=this.channelName_.toLowerCase();$(".chatInputField[id$='"+e+"']").keydown(this,function(t){13===t.keyCode?(t.preventDefault(),$(this).val().startsWith(".")||$(this).val().startsWith("/")?t.data.receiveIrcConnection_.send("PRIVMSG #"+e+" :"+$(this).val()):t.data.sendIrcConnection_.send("PRIVMSG #"+e+" :"+$(this).val()),$(this).val("")):9===t.keyCode&&(t.preventDefault(),0===$(this).val().length||$(this).val().endsWith(" ")||console.log("WUB"))})}addNewMessageInfoAbility_(){let e=this.channelName_.toLowerCase();$(".chatNewMessagesInfo[id$='"+e+"']").click(function(){$(this).hide();let t=$("#"+e+" .chatContent");t.scrollTop(t[0].scrollHeight)}),$(".chatContent[id$='"+e+"scrollArea']").scroll(function(){0!==$(this).scrollLeft()&&$(this).scrollLeft(0),$(this)[0].scrollHeight-$(this).scrollTop()<$(this).outerHeight()+50?$(".chatNewMessagesInfo[id$='"+e+"']").hide():$(".chatNewMessagesInfo[id$='"+e+"']").show(),$(this).scrollTop()<200&&$(".chatContent[id$='"+e+"scrollArea'] .chatMessageList").children("div:hidden:last").show()})}}class p{constructor(e,t){this.chatList_={},this.emoteManager_=e,this.messageParser_=t,$("#main-chat-area").scroll(function(){0!==$(this).scrollTop()&&$(this).scrollTop(0)})}setReceiveIrcConnection(e){this.receiveIrcConnection_=e}setSendIrcConnection(e){this.sendIrcConnection_=e}addMessages(e){for(let t=0;t<e.length;t++){let s=e[t].getChatName().toLowerCase();this.chatList_[s].addMessage(e[t])}}isChatAlreadyAdded(e){return this.chatList_.hasOwnProperty(e)}removeChat_(e){let t=e.data[1].toLowerCase(),s=e.data[0];delete s.chatList_[t],$(document).off("click",".toggleStream[id$='"+t+"']"),$(this).parent().parent().remove(),s.receiveIrcConnection_.leaveChat(t),s.sendIrcConnection_.leaveChat(t)}addChat(e,t){let s=e.toLowerCase();if(!this.isChatAlreadyAdded(s)&&this.receiveIrcConnection_.isLoaded()&&this.sendIrcConnection_.isLoaded()){this.chatList_[s]=new g(e,t,this.emoteManager_,this.receiveIrcConnection_,this.sendIrcConnection_,this.messageParser_);let a=$("#main-chat-area");a.append(this.chatList_[s].getHtml()),this.chatList_[s].addAbilities(),this.receiveIrcConnection_.joinChat(s),this.sendIrcConnection_.joinChat(s),$(document).on("click",".removeChat[id$='"+s+"']",[this,e],this.removeChat_),baron("#"+s+"scrollArea"),a.sortable({handle:".chatHeader",start(e,t){t.placeholder.width(t.item.width()),t.placeholder.height(t.item.height())},animation:300,cursor:"move",revert:200,scroll:!0,containment:"parent"})}}}class m extends c{constructor(e,t,s,a,n,i,o,l,r){super(e,t),this.badges_=s,this.emotes_=a,this.chatterName_=n,this.chatterColor_=i,this.action_=o,this.emoteManager_=l,this.badgeManager_=r}getHtml(){let e=this.replaceTwitchEmotesAndEscapeHtml(this.getContent());return e=m.matchURL_(e),e=this.replaceBttvEmotes(e),e=this.replaceFfzEmotes(e),e=this.replaceBadges(e)}replaceTwitchEmotesAndEscapeHtml(e){if(""!==this.emotes_[0]&&null!=this.emotes_[0]){let t=[];for(let e=0;e<this.emotes_.length;e++){let s=this.emotes_[e].split(":"),a=s[0],n=s[1].split(",");for(let e=0;e<n.length;e++)t.push([n[e].split("-")[0],n[e].split("-")[1],a])}for(let e=0;e<t.length-1;e++)for(let s=e+1;s<t.length;s++)if(parseInt(t[e][0])>parseInt(t[s][0])){let a=t[e];t[e]=t[s],t[s]=a}let s=0,a=0;for(let n=0;n<t.length;n++){let i=e,o=e.substring(0,a)+m.escapeString_(e.substring(a,parseInt(t[n][0])+s))+'<span style=" display: inline-block;" >&#x200b;<img src="https://static-cdn.jtvnw.net/emoticons/v1/'+t[n][2]+'/1.0" alt="{Emote}" /></span>';e=o+e.substring(parseInt(t[n][1])+1+s,e.length),a=o.length,s+=e.length-i.length}}else e=m.escapeString_(e);return e}replaceBttvEmotes(e){let t=this.emoteManager_.getBttvGlobal();for(let s=0;s<t.length;s++)if(null==t[s].channel){let a=JSON.stringify(t[s].code);a="(^|\\b|\\s)"+(a=a.substring(1,a.length-1)).replace(/[.?*+^$[\]\\(){}|-]/g,"\\$&")+"(?=\\s|$)";let n=new RegExp(a,"g"),i=JSON.stringify(t[s].id).substring(1,JSON.stringify(t[s].id).length-1);e=e.replace(n,' <span style=" display: inline-block;" >&#x200b;<img src=\'https://cdn.betterttv.net/emote/'+i+"/1x' alt='"+t[s].code+"' /></span> ")}let s=this.emoteManager_.getBttvChannels();if(s.hasOwnProperty(this.chatName_))for(let t=0;t<s[this.chatName_].length;t++){let a=JSON.stringify(s[this.chatName_][t].code);a="(^|\\b|\\s)"+(a=a.substring(1,a.length-1)).replace(/[.?*+^$[\]\\(){}|-]/g,"\\$&")+"(?=\\s|$)";let n=new RegExp(a,"g"),i=JSON.stringify(s[this.chatName_][t].id).substring(1,JSON.stringify(s[this.chatName_][t].id).length-1);e=e.replace(n,' <span style=" display: inline-block;" >&#x200b;<img src=\'https://cdn.betterttv.net/emote/'+i+"/1x' alt='"+s[this.chatName_][t].code+"' /></span> ")}return e}replaceFfzEmotes(e){let t=this.emoteManager_.getFfzGlobal();for(let s=0;s<t.default_sets.length;s++){let a=t.default_sets[s],n=t.sets[a].emoticons;for(let t=0;t<n.length;t++){let s=JSON.stringify(n[t].name);s="(^|\\b|\\s)"+(s=s.substring(1,s.length-1)).replace(/[.?*+^$[\]\\(){}|-]/g,"\\$&")+"(?=\\s|$)";let a=new RegExp(s,"g");e=e.replace(a,' <span style=" display: inline-block;" >&#x200b;<img src=\'https:'+n[t].urls[1]+"' alt='"+n[t].name+"' /></span> ")}}let s=this.emoteManager_.getFfzChannels();if(s.hasOwnProperty(this.chatName_)){let t=s[this.chatName_].room._id;if(null!=s[this.chatName_].sets[t]){let a=s[this.chatName_].sets[t].emoticons;for(let t=0;t<a.length;t++){let s=JSON.stringify(a[t].name);s="(^|\\b|\\s)"+(s=s.substring(1,s.length-1)).replace(/[.?*+^$[\]\\(){}|-]/g,"\\$&")+"(?=\\s|$)";let n=new RegExp(s,"g");e=e.replace(n,' <span style=" display: inline-block;" >&#x200b;<img src=\'https:'+a[t].urls[1]+"' alt='"+a[t].name+"' /></span> ")}}}return e}replaceBadges(e){let t;t=this.action_?$('<li><span style="color: gray;font-size: 11px;">'+this.getTimestamp()+'</span><span style="color: '+this.chatterColor_+';font-weight: bold;"> '+this.chatterName_+'</span> <span style="color: '+this.chatterColor_+';">'+e+"</span></li>"):$('<li><span style="color: gray;font-size: 11px;">'+this.getTimestamp()+'</span><span style="color: '+this.chatterColor_+';font-weight: bold;"> '+this.chatterName_+"</span>: "+e+"</li>");for(let e=0;e<this.badges_.length;e++){let s=this.badges_[e].split("/"),a=this.badgeManager_.getBadgesChannels()[this.chatName_][s[0]];0===s[0].localeCompare("subscriber")?t.find("span:nth-of-type(2):first").before('<div style=" display: inline-block;vertical-align: -32%;border-radius: 2px;background-image: url('+a.versions[s[1]].image_url_1x+');" ></div>'):t.find("span:nth-of-type(2):first").before('<div style=" display: inline-block;vertical-align: -32%;border-radius: 2px;background-image: url('+this.badgeManager_.getBadgesGlobal()[s[0]].versions[s[1]].image_url_1x+');"></div>')}return t}static matchURL_(e){return e=e.replace(/((^|\s|&#32;)(http(s)?:\/\/.)?(www\.)?([-a-zA-Z0-9@:%_+~#=]|\.(?!\.)){2,256}\.[a-z]{2,8}\b([-a-zA-Z0-9@:%_+.~#?&/=]*))(?=(\s|$|&#32;))/g,function(e,t){let s=-1===t.indexOf("http://")&&-1===t.indexOf("https://"),a=' <a href="'+(s?"http://":"")+t+'" target="_blank">'+t+"</a>";return t.startsWith(" ")?a=' <a href="'+(s?"http://":"")+t.substring(1,t.length)+'" target="_blank">'+t+"</a>":t.startsWith("&#32;")&&(a=' <a href="'+(s?"http://":"")+t.substring(5,t.length)+'" target="_blank">'+t+"</a>"),a})}static escapeString_(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/`/g,"&#96;").replace(/!/g,"&#33;").replace(/@/g,"&#64;").replace(/\$/g,"&#36;").replace(/%/g,"&#37;").replace(/=/g,"&#61;").replace(/\+/g,"&#43;").replace(/{/g,"&#123;").replace(/}/g,"&#125;").replace(/\[/g,"&#91;").replace(/]/g,"&#93;")}}var u={userColors_:{},getUserColors(){return this.userColors_},addUserColor(e,t){this.userColors_[e]=t},randomColor(){let e=["#ff0000","#ff4500","#ff69b4","#0000ff","#2e8b57","#8a2be2","#008000","#daa520","#00ff7f","#b22222","#d2691e","#ff7f50","#5f9ea0","#9acd32","#1e90ff"];return e[Math.floor(Math.random()*e.length)]},colorCorrection(e){let t=this.hex2rgb_(e),s=this.rgb2yiq_(t.r,t.g,t.b);for(;s.y<.5;){t=this.yiq2rgb_(s.y,s.i,s.q);let e=this.rgb2hsl_(t.r,t.g,t.b);e.l=Math.min(Math.max(0,.1+.9*e.l),1),t=this.hsl2rgb_(e.h,e.s,e.l),s=this.rgb2yiq_(t.r,t.g,t.b)}return t=this.yiq2rgb_(s.y,s.i,s.q),(e=this.rgb2hex_(t.r,t.g,t.b)).substring(0,7)},rgb2hex_:(e,t,s)=>"#"+((1<<24)+(e<<16)+(t<<8)+s).toString(16).slice(1),hex2rgb_(e){let t=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(e);return t?{r:parseInt(t[1],16),g:parseInt(t[2],16),b:parseInt(t[3],16)}:null},rgb2yiq_:(e,t,s)=>({y:(.299*e+.587*t+.114*s)/255,i:(.596*e+-.275*t+-.321*s)/255,q:(.212*e+-.523*t+.311*s)/255}),yiq2rgb_(e,t,s){let a=255*(e+.956*t+.621*s),n=255*(e+-.272*t+-.647*s),i=255*(e+-1.105*t+1.702*s);return a<0?a=0:a>255&&(a=255),n<0?n=0:n>255&&(n=255),i<0?i=0:i>255&&(i=255),{r:a,g:n,b:i}},rgb2hsl_(e,t,s){e/=255,t/=255,s/=255;let a=Math.max(e,t,s),n=Math.min(e,t,s),i=(a+n)/2,o=(a+n)/2,l=(a+n)/2;if(a===n)i=o=0;else{let r=a-n;switch(o=l>.5?r/(2-a-n):r/(a+n),a){case e:i=(t-s)/r+(t<s?6:0);break;case t:i=(s-e)/r+2;break;case s:i=(e-t)/r+4}i/=6}return{h:360*i,s:o,l:l}},hsl2rgb_(e,t,s){if(void 0===e)return{r:0,g:0,b:0};let a,n,i,o=(1-Math.abs(2*s-1))*t,l=e/60,r=o*(1-Math.abs(l%2-1));0===(l=Math.floor(l))?(a=o,n=r,i=0):1===l?(a=r,n=o,i=0):2===l?(a=0,n=o,i=r):3===l?(a=0,n=r,i=o):4===l?(a=r,n=0,i=o):5===l&&(a=o,n=0,i=r);let h=s-o/2;return a+=h,n+=h,i+=h,{r:Math.round(255*a),g:Math.round(255*n),b:Math.round(255*i)}}};class _{constructor(e,t){this.emoteManager_=e,this.badgeManager_=t}parseMessage(e){let t=e.split(" "),s=_.parseChatName_(t);if(0===t[2].localeCompare("WHISPER"))return[];if(t[2].startsWith("GLOBALUSERSTATE"))return[];if(s.length<1)return[];let a=[];return 0===t[1].localeCompare("JOIN")||0===t[1].localeCompare("PART")||0===t[1].localeCompare("353")||0===t[1].localeCompare("366")||0===t[1].localeCompare("MODE")||(0===t[2].localeCompare("ROOMSTATE")?a=_.parseRoomState_(e,s):0===t[2].localeCompare("USERSTATE")||(0===t[2].localeCompare("USERNOTICE")?a=this.parseUserNotice_(e,s):0===t[2].localeCompare("CLEARCHAT")||0===t[1].localeCompare("HOSTTARGET")||(0===t[2].localeCompare("NOTICE")||0===t[1].localeCompare("PRIVMSG")?a=_.parseNotice_(t,s):0===t[2].localeCompare("PRIVMSG")?a=this.parsePrivmsg_(t,s):s.length>=1?a=[new c(s,e)]:alert("Error")))),a}parsePrivmsg_(e,t){let s=e[1].split("!",1);s=s[0].substring(1,s[0].length);let a=e[0].substring(1,e[0].length),n=_.getMetaInfoWithColor_(a.split(";"),s);null!=n.username&&(s=n.username);let i=e.slice(4).join(" "),o=!1;(i=i.substring(1,i.length)).startsWith("ACTION")&&(o=!0,i=i.substring(8,i.length-2));let l=i,r=n.emotes,h=n.badges,c=n.color;return[new m(t,l,h,r,s,c,o,this.emoteManager_,this.badgeManager_)]}static parseRoomState_(e,t){let s=e.split(" ")[0],a=(s=s.substring(1,s.length)).split(";"),n="";$("#"+t+" .chatInput").find("p").remove();for(let e=0;e<a.length;e++){let t=a[e].split("=");switch(t[0]){case"broadcaster-lang":n+=t[1]+"  ";break;case"emote-only":0===t[1].localeCompare("1")&&(n+="EMOTE-ONLY  ");break;case"followers-only":0!==t[1].localeCompare("-1")&&(n+="FOLLOW "+t[1]+"m  ");break;case"r9k":0===t[1].localeCompare("1")&&(n+="R9K  ");break;case"slow":0!==t[1].localeCompare("0")&&(n+="SLOW "+t[1]+"s  ");break;case"subs-only":0===t[1].localeCompare("1")&&(n+="SUB  ")}}return[new d(t,n)]}parseUserNotice_(e,t){let s=e.split(" ").slice(4).join(" "),a=e.substring(1,e.length).split(" ")[0].split(";"),n=_.getMetaInfo_(a),i=[];return i.push(new c(t,null!=n.systemMsg?n.systemMsg+" ":"")),s.length>0&&i.push(this.parseMessage(e.split(" ")[0]+" :"+n.username.toLowerCase()+"!"+n.username.toLowerCase()+"@"+n.username.toLowerCase()+".tmi.twitch.tv PRIVMSG #"+t+" "+s)[0]),i}static parseNotice_(e,t){let s=0===e[2].localeCompare("NOTICE")?4:3,a=e.slice(s).join(" ");return[new c(t,a.substring(1,a.length))]}static parseChatName_(e){let t="";for(let s=0;s<e.length;s++)if(e[s].startsWith("#")){t=(t=e[s].slice(1,e[s].length)).trim();break}return t}static getMetaInfoWithColor_(e,t){let s={color:"#acacbf",emotes:"",badges:""},a=!1;for(let n=0;n<e.length;n++){let i=e[n].split("=");i.length<=1||0===i[1].localeCompare("")||(0===i[0].localeCompare("color")?(s.color=i[1],0!==s.color.localeCompare("")||u.getUserColors().hasOwnProperty(t)?0===s.color.localeCompare("")&&u.getUserColors().hasOwnProperty(t)&&(s.color=u.getUserColors()[t]):(s.color=u.randomColor(),u.addUserColor(t,s.color)),a=!0):0===i[0].localeCompare("display-name")?s.username=i[1]:0===i[0].localeCompare("emotes")?s.emotes=i[1].split("/"):0===i[0].localeCompare("badges")?s.badges=i[1].split(","):0===i[0].localeCompare("system-msg")?s.systemMsg=i[1].replace(/\\s/g," "):0===i[0].localeCompare("emote-sets")&&(s.emoteSets=i[1].split(",")))}return a||(u.getUserColors().hasOwnProperty(t)?s.color=u.getUserColors()[t]:(s.color=u.randomColor(),u.addUserColor(t,s.color))),s.color=u.colorCorrection(s.color),s}static getMetaInfo_(e){let t={emotes:"",badges:""};for(let s=0;s<e.length;s++){let a=e[s].split("=");a.length<=1||0===a[1].localeCompare("")||(0===a[0].localeCompare("display-name")?t.username=a[1]:0===a[0].localeCompare("emotes")?t.emotes=a[1].split("/"):0===a[0].localeCompare("badges")?t.badges=a[1].split(","):0===a[0].localeCompare("system-msg")?t.systemMsg=a[1].replace(/\\s/g," "):0===a[0].localeCompare("emote-sets")&&(t.emoteSets=a[1].split(",")))}return t}}let f,b=window.location.href.split("#");b.length>1?(f=b[1].split("&"),localStorage.accessToken=f[0].split("=")[1]):null!==localStorage.getItem("accessToken")||window.location.replace(e.AUTHORIZE_URL),$(function(){new class{constructor(){this.createApp()}async createApp(){document.title+=` ${a}`,this.appUser_=new s,await this.appUser_.requestAppUserData(),this.badgeManager_=new l,this.emoteManager_=new r(this.appUser_),this.messageParser_=new _(this.emoteManager_,this.badgeManager_),this.chatManager_=new p(this.emoteManager_,this.messageParser_),new h(this.badgeManager_,this.emoteManager_,this.chatManager_),this.sendIrcConnection_=new i(this.appUser_),this.receiveIrcConnection_=new o(this.appUser_,this.messageParser_,this.chatManager_),this.chatManager_.setReceiveIrcConnection(this.receiveIrcConnection_),this.chatManager_.setSendIrcConnection(this.sendIrcConnection_)}}})}();
//# sourceMappingURL=bundle.js.map
