/* global io */

'use strict';

var socket = io();

var even = false;

$('.messageInput').focus();

$(window).keydown(function(event) {
  if (!(event.ctrlKey || event.metaKey || event.altKey)) {
    $('.messageInput').focus();
  }

  // 13 is the enter key
  if (event.which === 13) {
    //if (username) {
      var message = $('.messageInput').val();
      if (!message) {
        return;
      }
      $('.messageInput').val('');
      //socket.emit('new message', message);
      $.ajax({
        url : '/createmessage',
        type: 'POST',
        data: 'message=' + message
      });
    //}
  }
});

socket.on('new message', function(data) {

  var elClass = (even ? 'ui segment' : 'ui segment inverted');

  var $el = $('<li class="' + elClass + '"><a href="https://github.com/'+ data.user.username +'">'+ data.user.name +':</a> '+ data.message +'</li>');

  $el.hide().fadeIn(200);
  $('.messages').append($el);
  even = !even;
});
