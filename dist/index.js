"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/// <reference path="../typings/index.d.ts" />
const express = require("express");
const bodyParser = require("body-parser");
const Quote = require("./entities/quote");
const Comment = require("./entities/comment");
const Message = require("./entities/message");
const User = require("./entities/user");
const mongoose = require("mongoose");
const morgan = require("morgan");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const moment = require("moment");
const apiController = require("./controllers/api");
var SALT_WORK_FACTOR = 10;
// node-restul doesn't have typings, so we'll have to use plain js require to get it :-(
var restful = require('node-restful'); // ===============
var credentials = {
    email: 'dwilliams@halehan.com',
    password: 'fucktard',
    superSecret: "dog"
};
// COMMON VARIABLES
// ===============
let appPort = (process.env.PORT || 3000);
// let connectionString: string = process.env.MONGODB_URI;  
let connectionString = 'mongodb://wcso:wcso@ds161164.mlab.com:61164/wcso';
// ===============
// Express App
// ===============
var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const login = require("facebook-chat-api");
app.set('superSecret', credentials.superSecret); // secret variable
app.use((req, res, next) => {
    // Set permissive CORS header - this allows this server to be used only as
    // an API server in conjunction with something like webpack-dev-server. 
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, PUT, DELETE, GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With');
    // Disable caching so we'll always get the latest comments.
    res.setHeader('Cache-Control', 'no-cache');
    next();
    // decode token
    /*
    if (token) {
     
         // verifies secret and checks exp
         jwt.verify(token, app.get('superSecret'), (err, decoded) => {
           if (err) {
             return res.json({ success: false, message: 'Failed to authenticate token.' });
           } else {
             // if everything is good, save to request for use in other routes
        //     req.decoded = decoded;
             next();
           }
         });
     
       } else {
     
         // if there is no token
         // return an error
         return res.status(403).send({
             success: false,
             message: 'No token provided.'
         });
     
       }
       */
});
bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
    bcrypt.hash(credentials.password, salt, function (err, hash) {
        console.log(hash);
        console.log(bcrypt.compareSync("catBoy", hash)); // true
        console.log(bcrypt.compareSync("veggies", hash)); // false
    });
});
app.set("port", appPort);
app.use(morgan('dev')); // log requests to the console  
app.get("/api", apiController.getApi);
app.post("/api/user", apiController.postUser);
app.post('/messages/sendmessage', (req, res) => {
    var message = new Message();
    var nowDate = moment().format('MMMM Do YYYY, h:mm:ss a');
    message.message = req.body.message;
    message.messageId = req.body.messageId;
    message.threadId = req.body.threadId;
    message.threadStatus = req.body.threadStatus;
    message.userId = req.body.userId;
    message.createdTime = nowDate;
    // Create simple echo bot 
    login({ email: credentials.email, password: credentials.password }, (err, api) => {
        if (err)
            return console.error(err + 'l');
        var nowDate = moment().format('MMMM Do YYYY, h:mm:ss a');
        message.save(function (err) {
            if (err)
                console.log(err);
        });
        api.sendMessage(req.body.message, req.body.threadId);
        res.json({ message: 'Just sent Message to ' + req.body.threadId });
    });
});
app.post('/authenticate', (req, res) => {
    // find the user
    User.findOne({
        loginId: req.body.loginId
    }, function (err, user) {
        if (err)
            throw err;
        if (!user) {
            res.json({ success: false, message: 'Authentication failed. User not found.' });
        }
        else if (user) {
            console.log(bcrypt.compareSync(req.body.password, user.password)); // true
            // check if password matches
            if (!bcrypt.compareSync(req.body.password, user.password)) {
                res.json({ success: false, message: 'Authentication failed. Wrong password.' });
            }
            else {
                // if user is found and password is right
                // create a token with only our given payload
                // we don't want to pass in the entire user since that has the password
                const payload = {};
                var token = jwt.sign(payload, app.get('superSecret'), {
                    expiresIn: 60 * 60 * 24 // expires in 24 hours
                });
                // return the information including token as JSON
                res.json({
                    success: true,
                    message: 'Enjoy your token!',
                    token: token
                });
            }
        }
    });
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
//# sourceMappingURL=index.js.map