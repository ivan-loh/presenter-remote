var WebSocketServer = require('ws').Server;
var http            = require('http');
var uuid            = require('node-uuid');
var express         = require('express');
var app             = express();
var port            = process.env.PORT || 5000;

/**
 * Express Server
 **/
app.use(express.static(__dirname + '/public'));
var server = http.createServer(app);
server.listen(port);
console.log('http server listening on %d', port);

/**
 * Websocket Server
 **/
var displays = {};
var wss      = new WebSocketServer({ server : server });

wss.on('connection', function (socket) {

  var id = uuid.v4();
  var display;

  socket.on('message', function (data) {
    console.log('Received :' + data);
    var message;
    var event   = JSON.parse(data);
    switch (event.type) {

      /**
       * Display Events
       **/
      case 'register-display' :
	displays[id] = socket;
	message      = { type : 'registered-display', data : id };
	message      = JSON.stringify(message);
	socket.send(message);
	break;

      /**
       * Controller events
       **/
      case 'register-controller' :
	 display = displays[event.data];
	 message = { type : 'controller-connected', data : '' };
	 message = JSON.stringify(message);
	 if (display) display.send(message);
	 break;

      case 'controller-events' :
	 message = { type : 'controller-command', data : event.data };
	 message = JSON.stringify(message);
	 if (display) display.send(message);
	 break;
    }
  });

  socket.on('close', function () {
    if (displays[id]) delete displays[id];
    if (display) display.send(JSON.stringify({ type: 'controller-disconnected'}));
  });

});
