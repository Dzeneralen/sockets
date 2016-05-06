
/// <reference path="../typings/tsd.d.ts" />
import * as express from "express";
import * as socketio from "socket.io";
import RedisClient from "./RedisClient";
import DataClient from "./DataClient";


function setupRedis() {
	// port, host
	let redisClient = new RedisClient({});
	
	console.log("Trying to read data");
	let dataClient = new DataClient();
	
	let filePath = "C:\\Users\\dzenand\\Documents\\Web\\sockets\\data\\nobil.json";
	
	dataClient.readNOBILDataDump(filePath).then(nobilData => {
		
		let parsedData = nobilData.chargerstations.map((cs) => {
			
			let createAddress = (street, housenr, city, zip) => {
				return street + " " + housenr + ", " + zip + " " + city;				
			};
			
			let createPointGeometryString = (pointString: string) => {
				let point = pointString.replace("(", "[").replace(")", "]");
				return point;
			};
			
			let info = cs.csmd;
			
			return {
				name: info.name,
				internationalId: info.International_id,
				city: info.City,
				county: info.County,
				description: info.Description_of_location,
				address: createAddress(info.Street, info.House_number, info.City, info.Zipcode),
				owner: info.Owned_by,
				status: info.Station_status,
				geometry: createPointGeometryString(info.Position),
			};
		});
		
		redisClient.connect().then(didConnect => {
			if(didConnect) {
				redisClient.clearAllKeys();
			}
			
			parsedData.forEach(cs => {
				redisClient.setKey(cs.internationalId, JSON.stringify(cs));				
			});
			
			console.log("All new keys added");
		}); 
		
		
	});
	
	
	
}



setupRedis();

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