"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/// <reference path="typings/index.d.ts" />
const express = require("express");
const bodyParser = require("body-parser");
const Quote = require("./entities/quote");
const mongoose = require("mongoose");
// node-restul doesn't have typings, so we'll have to use plain js require to get it :-(
var restful = require('node-restful'); // ===============
// COMMON VARIABLES
// ===============
let appPort = (process.env.PORT || 8080);
// let connectionString: string = process.env.MONGODB_URI;  
let connectionString = 'mongodb://wcso:wcso@ds161164.mlab.com:61164/wcso';
// ===============
// Express App
// ===============
var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.set("port", appPort);
// ===============
// REST API LOGIC
// ===============
var quoteApi = restful.model("quote", Quote.schema)
    .methods(["get", "post", "put", "delete"])
    .register(app, "/api/quote");
// ===============
// DB 
// ===============
var dbOpt = {
    useMongoClient: true
};
mongoose.connect(connectionString, dbOpt);
// ===============
// SERVER
// ===============
let port = app.get("port");
var server = app.listen(port, function () {
    // note: Only for debugging purposes to see that your variables are set correctly...
    console.log("connectionString is: " + connectionString);
    console.log("port is: " + port);
    console.log("Server started listening... BOYZ");
});
