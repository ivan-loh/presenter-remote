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
console.log('websocket server started');

wss.on('connection', function (socket) {

  var id;
  var display;

  socket.on('message', function (data) {

    var event = JSON.parse(data);
    switch (event.type) {

      /**
       * Display Events
       **/
      case 'register-display' :
	id           = uuid.v4();
	displays[id] = socket;
	socket.send(JSON.stringify({ type: 'registered-display', data: id}));
	break;

      /**
       * Controller events
       **/
      case 'register-controller' :
	 display = displays[event.data];
	 if (display) display.send('{"type":"controller-connected"}');
	 break;

      case 'controller-events' :
	 if (display)
	   display.send(JSON.stringify({type:'controller-command',data: event.data}));
	 break;
    }
  });

  socket.on('close', function () {
    if (id)      delete displays[id];
    if (display) display.send(JSON.stringify({ type: 'controller-disconnected'}));
  });

});
