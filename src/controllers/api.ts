"use strict";

import * as async from "async";
import * as request from "request";
import { Response, Request, NextFunction } from "express";
import * as User from "../entities/user";
import * as Message from "../entities/message";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import * as moment from "moment";
var SALT_WORK_FACTOR = 10;

var credentials = {
  email: '',
  password: '',
  superSecret: "dog"
}

const login = require("facebook-chat-api");

export let listenBot = (fbEmail: string, fbPassword: string) => {

  console.log("Starting ListenBot ");

  // TODO: hack will change later when i figure out how to handle passwords
  credentials.email = fbEmail;
  credentials.password = fbPassword;
  
  const messageTxt = "We have recived your message and have added the request to our queue.  Please standby for a law enforcement representative to respone.  If this is an emergency situation please call 911.";
  
  // Create simple echo bot
  login({email: fbEmail, password: fbPassword}, (err: any, api: any) => {
    
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

  
    api.listen((err: any, fbMessage: any) => {
      if (err) return console.error(err);
        console.log("This Bot is listening on Darryl Williams or dwilliams@inspired-tech.net FB account");
        console.log("We will listen here for messages and when we get them write them to a MongoDB and use the messgeId and ThreadId to respond to FB user");
        console.log("Message Body = " + fbMessage.body);
        console.log("Message ThreadID = " + fbMessage.threadID);
        console.log("Message MessageID = " + fbMessage.messageID);
        console.log("Message Timestamp " + fbMessage.timestamp);
  
        Message.find({"threadId": fbMessage.threadID}, "messageId message threadId threadStatus", function(err: any, messageCheck: any) {
        console.log("messageCheck = " + messageCheck);
            if (err)
               console.log(err);
            else {
                if (messageCheck.length === 0 || messageCheck[messageCheck.length - 1].threadStatus === "closed") {
                    console.log(messageCheck);
                    api.sendMessage(messageTxt + "\n\n Your message:  \n\n " + fbMessage.body, fbMessage.threadID);
  
                }
            }
  
            const  message = new Message();
  
                    const nowDate = moment().format("MMMM Do YYYY, h:mm:ss a");
  
                    message.messageId = fbMessage.messageID;
                    message.threadId = fbMessage.threadID;
                    message.message = fbMessage.body;
                    message.threadStatus = "open";
                    message.createdTime = nowDate;
  
                    message.save(function(err: any) {
                        if (err)
                        console.log(err);
                        });
  
        });
     });
  });
  
  };


let authCheck = function(req){
  var token = req.body.token || req.query.token || req.headers['x-access-token'];
  var rtn;
  console.log(credentials.superSecret);
  jwt.verify(token, credentials.superSecret, (err, decoded) => {      
    if (err) {
      rtn = 'fail';    
    } else {
      rtn = 'success';    
    }

  });

  console.log(rtn);
  return rtn;
}


export let closeThread = (req: Request, res: Response, next: NextFunction) => {

  var validToken = authCheck(req);
    if( validToken == 'success') {

      Message.update({threadId:  req.params.thread_id}, {threadStatus: "closed"}, {multi: true},
        function(err, message) {
        console.log("updated MessageThread " + req.params.thread_id);
        res.json({ message: "closed thread " +  req.params.thread_id});	
        });
    } else {
      res.json({ message: 'Invalid Token' });	
    }
};

export let getMessage = (req: Request, res: Response) => {
  
    var validToken = authCheck(req);
    if( validToken == 'success') {

    Message.find({'messageId': req.params.message_id}, 'messageId message threadId createdTime', function(err, message) {
        if (err)
          res.send(err);
        res.json(message);
      });  
    } else {
      res.json({ message: 'Invalid Token' });	
    }
  
  }


export let getMessages = (req: Request, res: Response) => {

  var validToken = authCheck(req);
  if( validToken == 'success') {

  Message.find(function(err, messages) {
    if (err){
      res.send(err);
    }
    res.json(messages);
  }).sort({"createdTime": -1});
  } else{
    res.json({ message: 'Invalid Token' });	
  }

}

export let getUsers = (req: Request, res: Response) => {

  if( authCheck(req) == 'success') {

    User.find(function(err, users) {
      if (err){
        res.send(err);
      }
      res.json(users);
    });
  } else{
    res.json({ message: 'Invalid Token' });	
  }

}

export let sendMessage = (req: Request, res: Response) => {
  var validToken = authCheck(req);
  if( validToken == 'success') {
  
  var message = new Message();
  var nowDate = moment().format('MMMM Do YYYY, h:mm:ss a');
    
  message.message = req.body.message;
  message.messageId = req.body.messageId;
  message.threadId = req.body.threadId;
  message.threadStatus = req.body.threadStatus;
  message.userId = req.body.userId;
  message.createdTime = nowDate;

  // Create simple echo bot 
login({email: credentials.email, password: credentials.password}, (err, api) => {
  if(err) return console.error(err + 'l');
  
          message.save(function(err) {
              if (err)
              console.log(err);
              });

      api.sendMessage(req.body.message, req.body.threadId);

      res.json({ message: 'Just sent Message to ' + req.body.threadId});
 
});

} else{
  res.json({ message: 'Invalid Token' });	
}

}

export let authenticate = (req: Request, res: Response) => {
  var validToken = authCheck(req);

  User.findOne({
    loginId: req.body.loginId
  }, function(err, user) {

    if (err) throw err;

    if (!user) {
      res.json({ success: false, message: 'Authentication failed. User not found.' });
    } else if (user) {
      console.log(bcrypt.compareSync(req.body.password, user.password)); // true
      // check if password matches
      if (!bcrypt.compareSync(req.body.password, user.password)) {
        res.json({ success: false, message: 'Authentication failed. Wrong password.' });
      } else {

      // if user is found and password is right
      // create a token with only our given payload
      // we don't want to pass in the entire user since that has the password
    const payload = {
//        admin: user.admin 
    };
        var token = jwt.sign(payload, credentials.superSecret, {
            expiresIn : 60*60*24 // expires in 24 hours
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

}

/**
 * GET /api
 * List of API examples.
 */
export let getApi = (req: Request, res: Response) => {
  console.log(authCheck(req));
  var validToken = authCheck(req);
  if( validToken == 'success') {
    res.json({ message: 'hooray! welcome to our api being called from api.ts controller' });	
   } else{
      res.json({ message: 'Invalid Token' });	
    }
  };

export let postUser = (req: Request, res: Response) => {

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
    user.createDate = nowDate;
    user.updateDate = nowDate;
    user.updateBy = req.body.updateBy;
  
    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt){
      
        bcrypt.hash(req.body.password, salt, function(err, hash){
            user.password = hash;
            console.log(hash);    
            console.log(bcrypt.compareSync("halehanp2$", hash)); // true
            console.log(bcrypt.compareSync("catBoy", hash)); // false
  
            user.save(function(err) {
              if (err)
                res.send(err);
        
              res.json({ message: 'User created from Controller! ' + user.firstName +'  ' + user.lastName });
            });
         
        });
    });
  
  };