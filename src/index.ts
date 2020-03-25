/// <reference path="../typings/index.d.ts" />
import * as express from "express";  
import * as cors from "cors";  
import * as bodyParser from "body-parser";  
import * as Quote from "./entities/quote";  
import * as Comment from "./entities/comment";
import * as Message from "./entities/message";
import * as User from "./entities/user";
import * as mongoose from "mongoose";
import * as morgan from "morgan";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import * as moment from "moment";
import * as facebookChatAPI from "facebook-chat-api";
// import * as apiController from "./controllers/api";
import * as apiController from "./controllers/fb-page-messenger";
import * as twilioSMS from "./controllers/twillioSMS";

var SALT_WORK_FACTOR = 10;

// node-restul doesn't have typings, so we'll have to use plain js require to get it :-(
// var restful = require('node-restful');  // ===============

// console.log(process.env.TEST);
// apiController.listenBot(process.env.FB_EMAIL, process.env.FB_PASSWORD);

// COMMON VARIABLES
// ===============
let appPort =  (process.env.PORT || 3000);  
let connectionString: string = process.env.MONGODB_URI;  
console.log(appPort + '  ' + connectionString);
// let connectionString: string = 'mongodb://wcso:wcso@ds161164.mlab.com:61164/wcso';

// ===============
// Express App
// ===============
var app = express();  
app.use(cors());
app.use(bodyParser.json());  
app.use(bodyParser.urlencoded({ extended: true}));
// const login = require("facebook-chat-api");

app.set("port", appPort);
app.use(morgan('dev')); // log requests to the console  

//Twillio SMS
app.post("/sms/listen/", twilioSMS.listenSMSMessage);
app.post("/sms/send/", twilioSMS.sendSMSMessage);
app.get("/sms/message/:messageId", twilioSMS.getSMSMessage);
app.get("/sms/messages/", twilioSMS.getSMSMessages);
app.post("/sms/closeThread/", twilioSMS.closeTxt);
//app.get("/sms/test", twilioSMS.testPromise);

// FB Webhook
app.post("/webhook/", apiController.postWebhook);
app.get("/webhook/", apiController.getWebhook);
app.get("/", apiController.get);

//User
app.put("/api/user/:loginId", apiController.putUser);
app.post("/api/user", apiController.postUser);
app.get("/api/user/", apiController.getUsers);
app.get("/api/user/:loginId",  apiController.getUser);

//Message
app.post("/messages/closethread",  apiController.closeThread);
app.post("/messages/sendmessage", cors(), apiController.sendMessage);
app.get("/messages", cors(),  apiController.getMessages);
app.get("/messages/:message_id", apiController.getMessage); 

app.get("/api",  apiController.getApi);
app.post("/authenticate",   apiController.authenticate);

//content
app.get("/api/content/", apiController.getContents);
app.get("/api/content/:content_id",  apiController.getContent);

var dbOpt : any = { 
    useMongoClient: true
} 

mongoose.connect(connectionString, dbOpt);

// ===============
// SERVER
// ===============
let port:number = app.get("port");  
var server = app.listen(port, function(){

    // note: Only for debugging purposes to see that your variables are set correctly...
    console.log("connectionString is: " + connectionString);
    console.log("port is:  " + port);
});