"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/// <reference path="../typings/index.d.ts" />
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const morgan = require("morgan");
const apiController = require("./controllers/api");
var SALT_WORK_FACTOR = 10;
// node-restul doesn't have typings, so we'll have to use plain js require to get it :-(
var restful = require('node-restful'); // ===============
console.log(process.env.TEST);
apiController.listenBot(process.env.FB_EMAIL, process.env.FB_PASSWORD);
// COMMON VARIABLES
// ===============
let appPort = (process.env.PORT || 3000);
// let connectionString: string = process.env.MONGODB_URI;  
let connectionString = 'mongodb://wcso:wcso@ds161164.mlab.com:61164/wcso';
// ===============
// Express App
// ===============
var app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const login = require("facebook-chat-api");
app.set("port", appPort);
app.use(morgan('dev')); // log requests to the console  
//User
app.put("/api/user/:loginId", apiController.putUser);
app.post("/api/user", apiController.postUser);
app.get("/api/user/", apiController.getUsers);
app.get("/api/user/:loginId", apiController.getUser);
//Message
app.post("/messages/closethread", apiController.closeThread);
app.post("/messages/sendmessage", cors(), apiController.sendMessage);
app.get("/messages", cors(), apiController.getMessages);
app.get("/messages/:message_id", apiController.getMessage);
app.get("/api", apiController.getApi);
app.post("/authenticate", apiController.authenticate);
// ===============
// REST API LOGIC
// ===============
/*
var quoteApi = restful.model("quote", Quote.schema)
.methods(["get", "post", "put", "delete"])
.register(app, "/api/quote");

var commentApi = restful.model("comment", Comment.schema)
.methods(["get", "post", "put", "delete"])
.register(app, "/api/comment");

var messageApi = restful.model("message", Message.schema)
.methods(["get", "post", "put", "delete"])
.register(app, "/api/message");
*/
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
    console.log("port is:  " + port);
});
//# sourceMappingURL=index.js.map