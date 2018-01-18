"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const User = require("../entities/user");
const Message = require("../entities/message");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const moment = require("moment");
var SALT_WORK_FACTOR = 10;
var credentials = {
    email: '',
    password: '',
    superSecret: "dog"
};
const login = require("facebook-chat-api");
exports.listenBot = (fbEmail, fbPassword) => {
    console.log("Starting ListenBot ");
    // TODO: hack will change later when i figure out how to handle passwords
    credentials.email = fbEmail;
    credentials.password = fbPassword;
    const messageTxt = "We have recived your message and have added the request to our queue.  Please standby for a law enforcement representative to respond.  If this is an emergency situation please call 911.";
    // Create simple echo bot
    login({ email: fbEmail, password: fbPassword }, (err, api) => {
        if (err) {
            console.error("ERROR  " + err.error);
            return "Error: " + err.error;
        }
        console.log("Logging into FB  ");
        api.setOptions({
            listenEvents: false,
            forceLogin: true,
            logLevel: "info"
        });
        api.listen((err, fbMessage) => {
            if (err)
                return console.error(err);
            console.log("This Bot is listening on Darryl Williams or dwilliams@inspired-tech.net FB account");
            console.log("We will listen here for messages and when we get them write them to a MongoDB and use the messgeId and ThreadId to respond to FB user");
            console.log("Message Body = " + fbMessage.body);
            console.log("Message ThreadID = " + fbMessage.threadID);
            console.log("Message MessageID = " + fbMessage.messageID);
            console.log("Message Timestamp " + fbMessage.timestamp);
            Message.find({ "threadId": fbMessage.threadID }, "messageId message threadId threadStatus", function (err, messageCheck) {
                console.log("messageCheck = " + messageCheck);
                if (err)
                    console.log(err);
                else {
                    if (messageCheck.length === 0 || messageCheck[messageCheck.length - 1].threadStatus === "closed") {
                        console.log(messageCheck);
                        api.sendMessage(messageTxt + "\n\n Your message:  \n\n " + fbMessage.body, fbMessage.threadID);
                    }
                }
                const message = new Message();
                const nowDate = moment().format("MMMM Do YYYY, h:mm:ss a");
                message.messageId = fbMessage.messageID;
                message.threadId = fbMessage.threadID;
                message.message = fbMessage.body;
                message.threadStatus = "open";
                message.createdTime = moment().toDate();
                message.save(function (err) {
                    if (err)
                        console.log(err);
                });
            });
        });
    });
};
exports.verifyToken = function (req, res) {
    let token = req.body.token || req.query.token || req.headers['x-access-token'] || req.headers['Authorization'];
    if (token) {
        jwt.verify(token, credentials.superSecret, (err, decoded) => {
            if (err) {
                return res.json({ success: false, message: 'Failed to authenticate token.' });
            }
            else {
                // all good, continue
                //  req.decoded = decoded; 
                // next();
            }
        });
    }
    else {
        res.send({ success: false, message: 'No token exists.' });
    }
};
exports.authCheck = function (req, resp) {
    // resp.setHeader('Access-Control-Allow-Origin', '*');
    // resp.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    // resp.setHeader('Access-Control-Allow-Headers', 'Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With,x-access-token');
    // resp.setHeader('Cache-Control', 'no-cache');
    console.log(req.headers);
    var token = req.body.token || req.query.token || req.headers['x-access-token'] || req.headers['authorization'];
    var rtn;
    console.log(credentials.superSecret);
    jwt.verify(token, credentials.superSecret, (err, decoded) => {
        if (err) {
            rtn = 'fail';
            //   resp.json({ message: 'Invalid Token' });
        }
        else {
            rtn = 'success';
            //   resp.json({ message: 'Invalid Token' });
        }
    });
    console.log(rtn);
    return rtn;
};
exports.closeThread = (req, res) => {
    var validToken = exports.authCheck(req, res);
    console.log(validToken);
    if (validToken == 'success') {
        Message.update({ threadId: req.body.threadId }, { threadStatus: "closed" }, { multi: true }, function (err, message) {
            console.log("updated MessageThread " + req.body.threadId);
            res.json({ message: "closed thread " + req.body.threadId });
        });
    }
    else {
        res.json({ message: 'Invalid Token' });
    }
};
exports.getMessage = (req, res) => {
    var validToken = exports.authCheck(req, res);
    if (validToken == 'success') {
        Message.find({ 'messageId': req.params.message_id }, 'messageId message threadId createdTime', function (err, message) {
            if (err)
                res.send(err);
            res.json(message);
        });
    }
    else {
        res.json({ message: 'Invalid Token' });
    }
};
exports.getMessages = (req, res) => {
    var validToken = exports.authCheck(req, res);
    //  var validToken = 'success';
    if (validToken == 'success') {
        Message.find({ threadStatus: "open" }).sort("-createdTime").exec(function (err, messages) {
            if (err) {
                res.send(err);
            }
            res.json(messages);
        });
    }
    else {
        res.json({ message: 'Invalid Token' });
    }
};
exports.getUsers = (req, res) => {
    if (exports.authCheck(req, res) == 'success') {
        User.find(function (err, users) {
            if (err) {
                res.send(err);
            }
            //     res.json(users);
            res.send(users);
        });
    }
    else {
        let testUser = { username: 'test', password: 'test', firstName: 'Test', lastName: 'User' };
        //  res.json({ message: 'Invalid Token' });	
        res.json({ testUser });
    }
};
exports.sendMessage = (req, res) => {
    var validToken = exports.authCheck(req, res);
    if (validToken == 'success') {
        var message = new Message();
        var nowDate = moment().format('MMMM Do YYYY, h:mm:ss a');
        message.message = req.body.message;
        message.messageId = req.body.messageId;
        message.threadId = req.body.threadId;
        message.threadStatus = req.body.threadStatus;
        message.userId = req.body.userId;
        message.createdTime = moment().toDate();
        // Create simple echo bot 
        login({ email: credentials.email, password: credentials.password }, (err, api) => {
            if (err)
                return console.error(err + 'l');
            message.save(function (err) {
                if (err)
                    console.log(err);
            });
            api.sendMessage(req.body.message, req.body.threadId);
            res.json({ message: 'Just sent Message to ' + req.body.threadId });
        });
    }
    else {
        res.json({ message: 'Invalid Token' });
    }
};
exports.getUser = (req, res) => {
    var validToken = exports.authCheck(req, res);
    if (validToken == 'success') {
        User.findOne({
            'loginId': req.params.loginId
        }, function (err, user) {
            if (err) {
                res.json({ success: false, message: 'ERROR finding user ' + err });
            }
            if (!user) {
                res.json({ success: false, message: 'ERROR finding user ' + req.body.loginId });
            }
            else if (user) {
                return res.json(user.toJSON());
            }
        });
    }
    else {
        res.json({ message: 'Invalid Token' });
    }
};
exports.authenticate = (req, res) => {
    // res.setHeader("Access-Control-Allow-Origin", '*'); //<-- you can change this with a specific url like http://localhost:4200
    // res.setHeader("Access-Control-Allow-Credentials", 'true');
    // res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    // res.setHeader("Access-Control-Allow-Headers", 'Origin,X-Requested-With,Content-Type,Accept,content-type,application/json');
    console.log('In the authenticate method');
    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    // var validToken = authCheck(req, res);
    User.findOne({
        loginId: req.body.loginId
    }, function (err, user) {
        if (err)
            throw err;
        if (!user) {
            res.json({ success: false, message: 'Authentication failed. User not found.' });
        }
        else if (user) {
            console.log(req.body.password);
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
                var token = jwt.sign(payload, credentials.superSecret, {
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
};
/**
 * GET /api
 * List of API examples.
 */
exports.getApi = (req, res) => {
    var validToken = exports.authCheck(req, res);
    console.log(validToken);
    if (validToken == 'success') {
        res.json({ message: 'hooray! welcome to our api being called from api.ts controller' });
    }
    else {
        res.json({ message: 'Invalid Token' });
    }
};
exports.postUser = (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, PUT, DELETE, GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With');
    res.setHeader('Cache-Control', 'no-cache');
    var user = new User();
    var nowDate = moment().format('MMMM Do YYYY, h:mm:ss a');
    user.firstName = req.body.firstName;
    user.lastName = req.body.lastName;
    user.loginId = req.body.loginId;
    user.role = req.body.role;
    user.phoneMobile = req.body.phoneMobile;
    user.supervisor = req.body.supervisor;
    user.createdTime = moment().toDate();
    user.updateDate = moment().toDate();
    user.updateBy = req.body.updateBy;
    user.zip = req.body.zip;
    user.city = req.body.city;
    user.state = req.body.state;
    user.address = req.body.address;
    bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
        bcrypt.hash(req.body.password, salt, function (err, hash) {
            user.password = hash;
            console.log(hash);
            console.log(bcrypt.compareSync("halehanp2$", hash)); // true
            console.log(bcrypt.compareSync("catBoy", hash)); // false
            user.save(function (err) {
                if (err)
                    res.send(err);
                res.json({ message: 'User created from Controller! ' + user.firstName + '  ' + user.lastName });
            });
        });
    });
};
exports.putUser = (req, res) => {
    User.findOne({
        loginId: req.params.loginId
    }, function (err, user) {
        if (err)
            throw err;
        if (!user) {
            res.json({ success: false, message: 'Authentication failed. User not found.' });
        }
        else if (user) {
            user.firstName = req.body.firstName;
            user.lastName = req.body.lastName;
            user.role = req.body.role;
            user.phoneMobile = req.body.phoneMobile;
            user.supervisor = req.body.supervisor;
            user.updateDate = moment().toDate();
            user.updateBy = req.body.updateBy;
            user.about = req.body.about;
            user.zip = req.body.zip;
            user.city = req.body.city;
            user.state = req.body.state;
            user.address = req.body.address;
            /*    let promise = user.save();
        
                promise.then(function () {
                  res.status(200).send(user);
                }); */
            user.save((err, user) => {
                if (err) {
                    res.status(500).send(err);
                }
                res.status(200).send(user);
            });
            /*      user.save(function (err, user) {
                    if (err) { res.json(500, err) }
                    res.json(201, user)
                  })  */
        }
    });
};
//# sourceMappingURL=api.js.map