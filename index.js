"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/// <reference path="typings/index.d.ts" />
const express = require("express");
const bodyParser = require("body-parser");
const Quote = require("./entities/quote");
const Comment = require("./entities/comment");
const Message = require("./entities/message");
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
app.use(bodyParser.urlencoded({ extended: true }));
app.use((req, res, next) => {
    // Set permissive CORS header - this allows this server to be used only as
    // an API server in conjunction with something like webpack-dev-server. 
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, PUT, DELETE, GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With');
    // Disable caching so we'll always get the latest comments.
    res.setHeader('Cache-Control', 'no-cache');
    next();
});
app.set("port", appPort);
app.get('/api', (req, res) => {
    res.json({ message: 'hooray! welcome to our api!' });
});
// ===============
// REST API LOGIC
// ===============
var quoteApi = restful.model("quote", Quote.schema)
    .methods(["get", "post", "put", "delete"])
    .register(app, "/api/quote");
var commentApi = restful.model("comment", Comment.schema)
    .methods(["get", "post", "put", "delete"])
    .register(app, "/api/comment");
var messageApi = restful.model("message", Message.schema)
    .methods(["get", "post", "put", "delete"])
    .register(app, "/api/message");
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
