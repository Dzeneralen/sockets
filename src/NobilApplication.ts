import * as Promise from "promise";
import * as Request from "request";
import * as fs from "fs";

import * as INSocket from "./NobilSocketInterfaces";
import * as INFile from "./NobilFileInterfaces";
import RedisClient from "./RedisClient";


interface ChargerStationDBO {
    name: string;
    internationalId: string;
    city: string;
    county: string;
    description: string;
    address: string;
    owner: string;
    status: number;
    realtime: boolean,
    geometry: string;
    connectors?: INSocket.IConnector[];
};


class NobilApplication {

    apiKey: string;
    rClient: RedisClient;
    io: SocketIO.Server;
    
    static geometrySet = "cs_geometry";
    static liveSet = "cs_live";
    static geometryLiveSet = "cs_geometry_live";

    constructor(apiKey: string) {
        this.apiKey = apiKey;
        this.io = null;
        this.rClient = new RedisClient({});
    }

    getDataFileJSON(path: string) {
        let promise = new Promise<void>((resolve, reject) => {

            let basePath = "http://www.nobil.no/api/server/datadump.php?apikey=";
            let queryParams = "&countrycode=NOR&fromdate=2005-01-01&format=json";

            let writeStream = fs.createWriteStream(path);

            writeStream.on("finish", () => {
                console.log("JSON file fetched from server and written to local path!");
                resolve(null);
            });

            writeStream.on("error", (error) => {
                console.log("An error occured when trying to write file at path " + path);
                console.log(error);

                reject(null);
            })

            writeStream.on("open", () => {
                Request(basePath + this.apiKey + queryParams).pipe(writeStream);
                console.log("Fetching remote JSON file from NOBIL and saving it to " + path);
            });
        });

        return promise;
    }

    private readDataFileJSON(path: string) {
        let promise = new Promise<INFile.INOBILDataDump>((resolve, reject) => {
            let dataFromJSON: INFile.INOBILDataDump = require(path);
            console.log("JSON file with initial data read in to memory!");
            resolve(dataFromJSON);
        });

        return promise;
    }

    parseDataFromJSONToDB(path: string) {

        return this.readDataFileJSON(path).then(nobilDump => {
            let parsedData = this.mapDataFromJSONToDBStructure(nobilDump);

            return this.rClient.connect().then(isConnected => {
                if (isConnected) {
                    this.rClient.clearAllKeys();

                    console.log("Writing " + parsedData.length + " chargerstations to the Database!");

                    parsedData.forEach((cs) => {
                        this.rClient.setKey(cs.internationalId, JSON.stringify(cs));
                        this.rClient.addToSet(NobilApplication.geometrySet, cs.internationalId);
                    });

                    console.log("DB seeded with initial data!");
                }
            });
        });
    }
    
    setupSockets(io: SocketIO.Server) {
        
        this.io = io;
        
        let connectedUsers = 0;
        console.log("Setting up sockets on nobilApp");
		this.io.on("connection", (socket) => {
            
			connectedUsers = connectedUsers + 1;
			this.io.emit("status:user", { users: connectedUsers });
			
			this.getInitialStateForClient().then(state => {
				socket.emit("status:init", state);
			});
			
			socket.on("disconnect", () => {
                
				connectedUsers = connectedUsers - 1;
				io.emit("status:user", { users: connectedUsers });
                
			});
		});
    }
    
    getInitialStateForClient() {
        let promise = new Promise<string>((resolve, reject) => {
            return this.rClient.connect().then(() => {
                return this.rClient.getMembersForSet(NobilApplication.geometryLiveSet).then(keys => {
                   return this.rClient.getValuesForKeys<string>(keys).then(jsonStrings => {
                       let resultingString = "[" + jsonStrings.join(",") + "]";
                       resolve(resultingString);
                   }); 
                });
            });
        });
        
        return promise;
    }

    parseDataFromInitialStatusNobilWebSocket(data: INSocket.IStatusInit) {

        let csLiveUpdated = data.data;

        return this.rClient.connect().then(isConnected => {

            if (!isConnected) {
                console.log("Warning: Could not connect to redis database!");
                return;
            }
             
            return this.rClient.getMembersForSet(NobilApplication.geometrySet).then(norKeys => {
                
                console.log("There are " + norKeys.length + " chargerstations with geometry in Norway!");

                function keyInArray(key: string, array: Array<string>): boolean {
                    return array.indexOf(key) !== -1;
                }

                let chargingStationsWithGeometryAndUpdates = csLiveUpdated.filter(cs => {
                    return keyInArray(cs.uuid, norKeys);
                });
                
                console.log("There are " + csLiveUpdated.length + " chargingstations with  live updates");
                
                csLiveUpdated.map(cs => {
                    this.rClient.addToSet(NobilApplication.liveSet, cs.uuid);
                });
                
                console.log("There are " + chargingStationsWithGeometryAndUpdates.length + " chargingstations with geometry and live updates in Norway!");
                
                chargingStationsWithGeometryAndUpdates.map(cs => {
                    this.rClient.addToSet(NobilApplication.geometryLiveSet, cs.uuid);
                });
                
                console.log("Trying to loop live with geometry");
                
                let keysForChargingStationsWithGeometryAndUpdates = chargingStationsWithGeometryAndUpdates.map(cs => {
                    return cs.uuid;    
                });
                
                return this.rClient.getValuesForKeys<string>(keysForChargingStationsWithGeometryAndUpdates).then(csFromDbStringArray => {
                   csFromDbStringArray.map(csJSON => {
                      
                       let cs : ChargerStationDBO = JSON.parse(csJSON);
                      
                       let liveUpdateCs = csLiveUpdated.filter(lcs => {
                            return lcs.uuid == cs.internationalId;
                       })[0];
                       
                       let json = this.getUpdatedJSONForChargingStation(cs, liveUpdateCs);
                       
                       this.rClient.setKey(cs.internationalId, json);
                   });
                   
                   console.log("All up to date!");
                });
            });
        });




    }
    
    getUpdatedJSONForChargingStation(cs: ChargerStationDBO, liveUpdateCs: INSocket.IChargerStation) {
        
        cs.status = liveUpdateCs.status;
        cs.connectors = liveUpdateCs.connectors;
        cs.realtime = true;
        
        return JSON.stringify(cs);
    }
    
    updateChargingStationWithLiveUpdate(updateStation: INSocket.IStatusUpdate) {
        let promise = new Promise((resolve, reject) => {
        
            this.rClient.getKey(updateStation.data.uuid).then(jsonString => {
                
                if(jsonString === null) {
                    // Station with no geometry in db
                    resolve(null);
                }
                
                let cs = JSON.parse(jsonString);
                let json = this.getUpdatedJSONForChargingStation(cs, updateStation.data);
                
                // Broadcast
                if(this.io !== null) {
                    this.io.emit("status:update", json);
                }
                
                this.rClient.setKey(updateStation.data.uuid, json);
                resolve(null);
            });
        });
        return promise;        
    }

    private mapDataFromJSONToDBStructure(data: INFile.INOBILDataDump) {

        let parsedData = data.chargerstations.map<ChargerStationDBO>((cs) => {

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
                realtime: false,
                geometry: createPointGeometryString(info.Position),
            };
        });

        console.log("Data from JSON file mapped to DB structure!");

        return parsedData;
    }




}

export default NobilApplication;