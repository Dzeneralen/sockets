
/// <reference path="../typings/tsd.d.ts" />
import * as express from "express";
import * as socketio from "socket.io";
import * as socketioclient from "socket.io-client";
import * as Request from "request";
import * as WebSocket from "websocket";

import * as INSocket from "./NobilSocketInterfaces";
import NobilApplication from "./NobilApplication";
var Secrets =  require("./secrets.json");



function setupDatabase() {
	// port, host
	let nobilApp = new NobilApplication(Secrets.apiKey);
	
	let filePath = "C:\\Users\\dzenand\\Documents\\Web\\sockets\\nobil.json";
	
	nobilApp.getDataFileJSON(filePath).then(() => {
		
		nobilApp.parseDataFromJSONToDB(filePath).then(() => {
			setupWebSocketToNobil(nobilApp);
		});
		
	});
}

function setupWebSocketToNobil(nobilApp: NobilApplication) {
	console.log("Connecting to NOBIL websocket server!");
	
	var wsClient = new WebSocket.client();

	wsClient.on('connect', function(connection) {
		connection.on('error', function(error) {
			console.log("Connection Error: " + error.toString());
		});
		connection.on('close', function() {
			console.log('echo-protocol Connection Closed');
		});
		connection.on('message', function(message) {
			if (message.type === 'utf8') {
				
				let json = JSON.parse(message.utf8Data);
				
				if(json.type === "snapshot:init") {
					let data : INSocket.IStatusInit = json;
				    nobilApp.parseDataFromInitialStatusNobilWebSocket(data).then(() => {
						
						console.log("kick off the client stuff");
						
					});
				}
				
				else if(json.type === "status:update") {
					let data : INSocket.IStatusUpdate = json;
					nobilApp.updateChargingStationWithLiveUpdate(data);
				}
				
				else if(json.type === "status:raw") {
					// Do nothing for now
					// let data: INSocket.IStatusRaw = json;
				}
				
				
			}
		});
		
		function sendNumber() {
			if (connection.connected) {
				var number = Math.round(Math.random() * 0xFFFFFF);
				connection.sendUTF(number.toString());
				setTimeout(sendNumber, 1000);
			}
		}
		sendNumber();
	});
	
	wsClient.connect('ws://realtime.nobil.no/api/v1/stream?apikey=' + Secrets.apiKey);
	
	
	
}



//setupRedis();



let port = 8080;

// Setup
var app = express();
app.use(express.static(__dirname));

// http routing:
app.get('/', function (req, res) {
	res.sendfile(__dirname + "\index.html");
});

var server = app.listen(port, () => {
	console.log("Server running on port: " + port);
	
	var io = socketio.listen(server);

	let connectedUsers = 0;

	io.on("connection", (socket) => {
		console.log("user connected");
		connectedUsers = connectedUsers + 1;
		io.emit("status:user", { users: connectedUsers });
		
		
		socket.on("disconnect", () => {
			connectedUsers = connectedUsers - 1;
			io.emit("status:user", { users: connectedUsers });
		});
	});
});
	
setupDatabase();


