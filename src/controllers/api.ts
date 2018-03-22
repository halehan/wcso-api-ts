"use strict";

import * as async from "async";
import * as request from "request";
import { Response, Request, NextFunction } from "express";
import * as User from "../entities/user";
import * as Message from "../entities/message";
import * as Activity from "../entities/activity";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import * as moment from "moment";
import { Constants } from '../utils/constants';
var SALT_WORK_FACTOR = 10;

var credentials = {
  email: '',
  password: '',
  superSecret: "dog"
}

const login = require("facebook-chat-api");
const messageTxt = "We have recived your message and have added the request to our queue.  Please standby for a law enforcement representative to respond.  If this is an emergency situation please call 911.";

export let listenBot = (fbEmail: string, fbPassword: string) => {

  console.log("Starting ListenBot ");

  // TODO: hack will change later when i figure out how to handle passwords
  credentials.email = fbEmail;
  credentials.password = fbPassword;
  
  
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
                    message.createdTime = moment().toDate();
  
                    message.save(function(err: any) {
                        if (err)
                        console.log(err);
                        });
  
        });
     });
  });   
  
  };

    export let verifyToken = function(req: Request, res: Response) {
    let token = req.body.token || req.query.token || req.headers['x-access-token'] || req.headers['Authorization'];

    if( token ) {

        jwt.verify(token, credentials.superSecret, (err, decoded) => {

            if (err) {
                return res.json({ success: false, message: 'Failed to authenticate token.' });    
            } else {
                // all good, continue
              //  req.decoded = decoded; 
               // next();
            }
        });

    }  else {

        res.send({ success: false, message: 'No token exists.' });
        
    }
}


export let authCheck = function(req: Request, resp: Response) {

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
    } else {
      rtn = 'success';    
   //   resp.json({ message: 'Invalid Token' });
    }

  });

  console.log(rtn);
  return rtn;
}


export let closeThread = (req: Request, res: Response) => {

var validToken = authCheck(req, res);
console.log(validToken);

    if( validToken == 'success') {
    
      Message.update({threadId:  req.body.threadId}, {threadStatus: "closed"}, {multi: true},
        function(err, message) {
        console.log("updated MessageThread " + req.body.threadId);
        res.json({ message: "closed thread " +  req.body.threadId});	
        });
    } else {
      res.json({ message: 'Invalid Token' });	
    }
};

export let getMessage = (req: Request, res: Response) => {
  
    var validToken = authCheck(req, res);
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

  var validToken = authCheck(req,res);
//  var validToken = 'success';
  if( validToken == 'success') {

    Message.find({threadStatus:"open"}).sort("-createdTime").exec(function(err,messages){
      if (err){ 
        res.send(err);
      }
        res.json(messages);
    });

  } else {
    res.json({ message: 'Invalid Token' });	
  }

}

export let getUsers = (req: Request, res: Response) => {

  if( authCheck(req, res) == 'success') {

    User.find(function(err, users) {
      if (err){
        res.send(err);
      }
   //     res.json(users);
        res.send(users);
    });
      } else{
        let testUser = { username: 'test', password: 'test', firstName: 'Test', lastName: 'User' };
      //  res.json({ message: 'Invalid Token' });	
      res.json({ testUser });	
  }

}

export let sendMessage = (req: Request, res: Response) => {
  var validToken = authCheck(req, res);
  if( validToken == 'success') {
  
  var message = new Message();
  var nowDate = moment().format('MMMM Do YYYY, h:mm:ss a');
    
  message.message = req.body.message;
  message.messageId = req.body.messageId;
  message.threadId = req.body.threadId;
  message.threadStatus = req.body.threadStatus;
  message.userId = req.body.userId;
  message.createdTime = moment().toDate();

  // Create simple echo bot 
  /*
login({email: credentials.email, password: credentials.password}, (err, api) => {
  if(err) return console.error(err + 'l');
  
          message.save(function(err) {
              if (err)
              console.log(err);
              });

      api.sendMessage(req.body.message, req.body.threadId);

      res.json({ message: 'Just sent Message to ' + req.body.threadId});
 
});  */

} else{
  res.json({ message: 'Invalid Token' });	
}

}

export let getUser = (req: Request, res: Response) => {

  var validToken = authCheck(req, res);
  
  if( validToken == 'success') {

    User.findOne({
    'loginId': req.params.loginId
  }, function(err, user) {

    if (err) {
      res.json({ success: false, message: 'ERROR finding user ' + err});
    } 

    if (!user) {
      res.json({ success: false, message: 'ERROR finding user ' +  req.body.loginId });
    } else if (user) {
        return  res.json(user.toJSON());
      }   

  });
 } else {
  res.json({ message: 'Invalid Token' });	
 }
}

export let authenticate = (req: Request, res: Response) => {
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
  }, function(err, user) {

    if (err) throw err;

    if (!user) {
      res.json({ success: false, message: 'Authentication failed. User not found.' });
      this.putActivity(this.loginId, 'Authentication failed. User not found.');
    } else if (user) {
      console.log(req.body.password);
      console.log(bcrypt.compareSync(req.body.password, user.password)); // true
      // check if password matches
      if (!bcrypt.compareSync(req.body.password, user.password)) {
        res.json({ success: false, message: 'Authentication failed. Wrong password.' });
        this.putActivity(this.loginId, 'Authentication failed. Wrong password.');
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

        this.putActivity(this.loginId, 'Success');
      }   

    }

  });

}

/**
 * GET /api
 * List of API examples.
 */
export let getApi = (req: Request, res: Response) => {
  
  var validToken = authCheck(req, res);
  console.log(validToken);

  if( validToken == 'success') {
    res.json({ message: 'hooray! welcome to our api being called from api.ts controller' });	
   } else {
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
        user.createdTime = moment().toDate();
        user.updateDate = moment().toDate();
        user.updateBy = req.body.updateBy;
        user.zip = req.body.zip;
        user.city = req.body.city;
        user.state = req.body.state;
        user.address = req.body.address;
      
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

  export let putActivity = (logIn: string, message: string) => {

    var activity = new Activity();
    var nowDate = moment().format('MMMM Do YYYY, h:mm:ss a');
    activity.createdTime = moment().toDate();
    activity.loginId = logIn;
    activity.message = message;

    activity.save(function(err) {
      if (err)
       console.log(err);
      else 
       console.log('Activity Created ');
    });

  }

  export let putUser = (req: Request, res: Response) => {

    User.findOne({
      loginId: req.params.loginId
    }, function(err, user) {
  
      if (err) throw err;
  
      if (!user) {
        res.json({ success: false, message: 'Authentication failed. User not found.' });
      } else if (user) {
    	
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
              res.status(500).send(err)
          }
          res.status(200).send(user);
      });  
   
      /*      user.save(function (err, user) {
              if (err) { res.json(500, err) }
              res.json(201, user)
            })  */

          } 
        });  
  
  }

  // Adds support for GET requests to our webhook
export let getWebhook = (req: Request, res: Response) => { 
  console.log('Calling getWebhook');
  
    // Your verify token. Should be a random string.
let VERIFY_TOKEN = "halehan";

// Parse the query params
let mode = req.query['hub.mode'];
console.log('hub.mode = ' + mode);
let token = req.query['hub.verify_token'];
console.log('hub.verify_token = ' + token);
let challenge = req.query['hub.challenge'];
console.log('hub.challenge = ' + challenge);

// Checks if a token and mode is in the query string of the request
if (mode && token) {

// Checks the mode and token sent is correct
if (mode === 'subscribe' && token === Constants.FACEBOOK_VERIFY_TOKEN) {
  
  // Responds with the challenge token from the request
  console.log('WEBHOOK_VERIFIED');
  res.status(200).send(challenge);

} else {
  // Responds with '403 Forbidden' if verify tokens do not match
  res.sendStatus(403);      
}
}
}

  export let postWebhook = (req: Request, res: Response) => {
    console.log('Calling postWebhook');
    let body = req.body;
    
      // Checks this is an event from a page subscription
      if (body.object === 'page') {
        console.log('body.object ===  page');
        // Iterates over each entry - there may be multiple if batched
        body.entry.forEach(function(entry) {
    
          // Gets the message. entry.messaging is an array, but 
          // will only ever contain one message, so we get index 0
          let webhook_event = entry.messaging[0];
         
          if (webhook_event.message && webhook_event.message.text) {
            let text = webhook_event.message.text;
            let sender = webhook_event.sender.id;
       //     api.sendMessage(messageTxt + "\n\n Your message:  \n\n " + fbMessage.body, fbMessage.threadID);
            sendTextMessage(sender, messageTxt + " \n\nYour Message:\n" + text);
        //    sendTextMessage(sender, "Text received : " + text.substring(0, 1000))
            console.log("=====================================================================");
            console.log(webhook_event);
            console.log("=====================================================================");
            console.log(webhook_event.message);
          }
          
        });
    
        // Returns a '200 OK' response to all requests
        res.status(200).send('EVENT_RECEIVED');
      } else {
        // Returns a '404 Not Found' if event is not from a page subscription
        res.sendStatus(404);
      }
 } 
  
  export let sendTextMessage = (sender, text) => {
    // function sendTextMessage(sender, text) {
     let messageData = { text:text }
     let VERIFY_TOKEN = 'EAAHuAlckN1IBAExUeBgFzbVstAZBXVtBpks3eu7CjZAylV3Wmk3xZBS5U6UgkFzanIlMRBQZC1onZCgpLsbOxJe79E2CPZAwMtpmCD78Gp3z18ntv7XNZBqzpZC3hZC0O8QuSqMa7mdtILpjf1T0oMnVABfFJwVr5l6BBJRjdG4tdIHsXOyVo3QTwZABhAjDdTyBEZD';
     request({
       url: 'https://graph.facebook.com/v2.11/me/messages',
       qs: {access_token: VERIFY_TOKEN},
       method: 'POST',
       json: {
         recipient: {id:sender},
         message: messageData,
       }
     }, function(error, response, body) {
       if (error) {
         console.log('Error sending message: ', error)
       } else if (response.body.error) {
         console.log('Error: ', response.body.error)
       }
     })
   }