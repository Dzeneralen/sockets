
/// <reference path="../typings/tsd.d.ts" />
import * as express from "express";
import * as socketio from "socket.io";

let port = 8080;

// Setup
var app = express();
//var io = socketio.listen(app);

// Serve static content
app.use(express.static(__dirname));
app.listen(port);
console.log(__dirname);

// http routing:
app.get('/', function (req, res) {
	res.sendfile(__dirname + "\index.html");
});

console.log("Server running on port: " + port);

/*
// socket events
io.sockets.on('connection', function (socket) {
	
	socket.emit('toClient', {
		type: 'status',
		msg: 'Connection established'
	});
	
	socket.on('toServer', function (data) {
		
		// do any required processing with incoming data
		
		
		// send data to others
		data.type = 'broadcast';
		socket.broadcast.emit('toClient', data);
		
		// sned copy to self
		data.type = 'cc';
		socket.emit('toClient', data);
		
	});
	
});
*/