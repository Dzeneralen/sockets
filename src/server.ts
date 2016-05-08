
/// <reference path="../typings/tsd.d.ts" />
import * as express from "express";
import * as socketio from "socket.io";
import * as Request from "request";
import * as WebSocket from "websocket";

import * as INSocket from "./NobilSocketInterfaces";
import NobilApplication from "./NobilApplication";
let Secrets =  require("./secrets.json");



function InitializeWebServer(nobilApp: NobilApplication) {
	
	let port = 8080;

	let app = express();
	app.use(express.static(__dirname));

	app.get('/', function (req, res) {
		res.sendfile(__dirname + "\index.html");
	});

	let server = app.listen(port, () => {
		console.log("Server running on port: " + port);
		
		let io = socketio.listen(server);
		nobilApp.setupSockets(io);
	});
	
	server.on("listening", () => {
		console.log("Server is now listening to connections!");
	});
}


	
InitializeApplication();

function InitializeApplication() {
	let nobilApp = new NobilApplication(Secrets.apiKey);

	let filePath = "C:\\Users\\dzenand\\Documents\\Web\\sockets\\nobil.json";
	
	nobilApp.getDataFileJSON(filePath).then(() => {
		nobilApp.parseDataFromJSONToDB(filePath).then(() => {
			connectToNobilLiveFeed(nobilApp).then(() => {
				console.log("Initializing web server!");
				InitializeWebServer(nobilApp);
			});
		});
	});
}


function connectToNobilLiveFeed(nobilApp: NobilApplication) {
	console.log("Connecting to NOBIL websocket server!");
	
	let promise = new Promise<void>((resolve, reject) => {
		
		var wsClient = new WebSocket.client();

		wsClient.on('connect', function(connection) {
			
			connection.on('error', function(error) {
				console.log("Connection Error: " + error.toString());
				reject(error);
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
							console.log("Initial data parsed!");
							resolve(null);
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
		});
		
		wsClient.connect('ws://realtime.nobil.no/api/v1/stream?apikey=' + Secrets.apiKey);
	});
	
	return promise;
}

