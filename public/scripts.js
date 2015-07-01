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
      socket.emit('new message', message);

  }
});

socket.on('message', function(data) {

  var elClass = (even ? 'ui segment' : 'ui segment inverted');
  even = !even;

  var $el = $('<li class="' + elClass + '"><a href="https://github.com/'+ data.user.username +'">'+ data.user.name +':</a> '+ data.message +'</li>');

  $el.hide().fadeIn(200);
  $('.messages').append($el);
  $('.messages').scrollTop($('.messages')[0].scrollHeight);
});

socket.on('user connected', function(user) {
  var elClass = (even ? 'ui segment' : 'ui segment inverted');
  even = !even;

  var $el = $('<li class="' + elClass + '"><a>Server: </a><a href="https://github.com/'+ user.username +'">'+ user.name +':</a> has joined the chat!</li>');

  $el.hide().fadeIn(200);
  $('.messages').append($el);
  $('.messages').scrollTop($('.messages')[0].scrollHeight);
});

socket.on('user disconnected', function(user) {
  var elClass = (even ? 'ui segment' : 'ui segment inverted');
  even = !even;

  var $el = $('<li class="' + elClass + '"><a>Server: </a><a href="https://github.com/'+ user.username +'">'+ user.name +':</a> has left the chat.</li>');

  $el.hide().fadeIn(200);
  $('.messages').append($el);
  $('.messages').scrollTop($('.messages')[0].scrollHeight);
});


socket.on('num of users', function(num) {
  var elClass = (even ? 'ui segment' : 'ui segment inverted');
  even = !even;

  var $el;
    if (num !== 1) {
      $el = $('<li class="' + elClass + '"><a>Server: </a> There are now '+ num +' users in the chat!</li>');
    } else {
      $el = $('<li class="' + elClass + '"><a>Server: </a> There is now 1 user in the chat!</li>');
    }

  $el.hide().fadeIn(200);
  $('.messages').append($el);
  $('.messages').scrollTop($('.messages')[0].scrollHeight);
});
