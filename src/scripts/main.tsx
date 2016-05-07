/// <reference path="./../../typings/tsd.d.ts" />

import * as React from "react";
import * as ReactDOM from "react-dom";
import Application from "./Application";

import * as io from "socket.io-client";

var socket = io.connect("/");
socket.on("status:user", (data) => {
    console.log("Connected users: " + data.users);
});

ReactDOM.render(<Application />, document.getElementById("app-container"));