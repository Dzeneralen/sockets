/// <reference path="./../../typings/tsd.d.ts" />

import * as React from "react";
import * as ReactDOM from "react-dom";
import Application from "./Application";
import Store from "./ChargerStationStore";

import * as io from "socket.io-client";

var socket = io.connect("/");
socket.on("status:user", (data) => {
    console.log("Connected users: " + data.users);
});

socket.on("status:init", (data) => {
    
    let parsedStations = JSON.parse(data);
    
    Store.Instance.setInitialChargerStations(parsedStations);
});

socket.on("status:update", data => {
    let parsedStation = JSON.parse(data);
    
    Store.Instance.updateChargerStation(parsedStation);
});

ReactDOM.render(<Application />, document.getElementById("app-container"));