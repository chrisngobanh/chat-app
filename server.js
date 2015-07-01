'use strict';

var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var express = require('express');
var nunjucks = require('nunjucks');
var qs = require('querystring');
var request = require('request');

var app = express();

var server = app.listen(3000, 'localhost', function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('Chat App listening at http://%s:%s in ' +
              '%s mode.', host, port, app.get('env'));

});

var io = require('socket.io')(server);

var CLIENT_ID = process.env.CLIENT_ID;
var CLIENT_SECRET = process.env.CLIENT_SECRET;

var Request = request.defaults({
  json: true,
  headers: {
    'User-Agent': 'chrischatapp',
    Authorization: 'token ' + process.env.CLIENT_TOKEN
  }
});

nunjucks.configure('views', {
  autoescape: true,
  express: app
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(cookieParser('https://youtu.be/g3p2TZ5q9to'));

var numOfUsers = 0;

app.get('/', function(req, res) {
  if (req.cookies.user) {
    io.emit('new user', req.cookies.user);
    res.render('index.html');
  } else {
    var loginUrl = 'https://github.com/login/oauth/authorize' + '?' +
                qs.stringify({client_id: CLIENT_ID});
    res.render('login.html', {loginUrl: loginUrl});
  }

});

app.get('/github', function(req, res) {
  var code = req.query.code;

  if (!code) {
    res.redirect('/');
    return;
  }

  Request.post({url: 'https://github.com/login/oauth/access_token',
    form: {
      code: code,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET
    }
  }, function(err, _res, body) {
    if (err) {
      console.log(err);
      res.redirect('/');
    } else if (res.statusCode !== 200) {
      console.log('Something went wrong with GitHub.');
      res.redirect('/');
    } else if (body.error) {


      res.redirect('/');

    } else {

      var token = body.access_token;
      Request.get({
        url: 'https://api.github.com/user',
        headers: { Authorization: 'token ' + token }
      }, function(err, _res, body) {
        if (err) {
          console.log(err);
          res.redirect('/');
        } else if (res.statusCode === 401) {
          console.log('Something went wrong with GitHub.');
          res.redirect('/');
        } else {
          var user = {
            username: body.login,
            name: body.name
          };

          res.cookie('user', user);
          res.redirect('/');
        }
      });
    }

  });

});

app.post('/createmessage', function(req, res) {
  var data = {
    message: req.body.message,
    user: req.cookies.user || {name: 'Chris Banh', username: 'chrisngobanh'}
  };
  io.emit('new message', data);
  res.status(200).send();
});

io.on('connection', function(socket) {
  //socket.emit('user connected', onlineUsers);
  numOfUsers++;
  io.emit('num of users', numOfUsers);
  socket.on('new message', function(message) {

    io.emit('message', message);
  });

  socket.on('disconnect', function() {
    numOfUsers--;
    io.emit('num of users', numOfUsers);
  });
});

