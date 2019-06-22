<?php
  // https://recent-messages.robotty.de/api/v2/recent-messages/c0ldplasma
  // https://thomassen.sh/twitch-api-endpoints/
  $apiURL = "https://tmi.twitch.tv/api/rooms/" . $_GET['chatId'] . "/recent_messages?count=50";
  $ch = curl_init();
  curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
  curl_setopt($ch, CURLOPT_URL, $apiURL);
  $result = curl_exec($ch);
  curl_close($ch);

  echo $result;
?>
