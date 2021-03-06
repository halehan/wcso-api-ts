"use strict";

import * as async from "async";
import * as request from "request";
import { Response, Request, NextFunction } from "express";
import * as User from "../entities/user";
import * as Message from "../entities/message";
import * as Activity from "../entities/activity";
import * as Content from "../entities/content";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import * as moment from "moment";
import * as GoogleMapsAPI from "googlemaps";
import { Constants } from "../utils/constants";
import equalsIgnoreCase from "@composite/equals-ignore-case";
import { ApplicationService } from "../services/Application.service";

const SALT_WORK_FACTOR: number = 10;

const credentials = {
  email: "",
  password: "",
  superSecret: "dog"
}

const messageTxt: string = "We have recived your message and have added the request to our queue.  Please standby for a law enforcement representative to respond.  If this is an emergency situation please call 911. ";

const publicConfig = {
  key: Constants.GOOGLE_API_KEY,
  stagger_time: 1000, // for elevationPath
  encode_polylines: false,
  secure: true
};
let gmAPI: GoogleMapsAPI = new GoogleMapsAPI(publicConfig);


export let verifyToken: any = (req: Request, res: Response) => {
  let token: string = req.body.token || req.query.token || req.headers["x-access-token"] || req.headers.Authorization;

  if (token) {

    jwt.verify(token, credentials.superSecret, (err, decoded) => {

      if (err) {
        return res.json({ success: false, message: "Failed to authenticate token." });
      }
    });

  } else {

    res.send({ success: false, message: "No token exists." });
  }
};

export let authCheck: any = (req: Request, resp: Response) => {

  resp.setHeader("Access-Control-Allow-Headers", "Content-Type, Access-Control-Allow-Headers, "
    + "Authorization, X-Requested-With,x-access-token");

  console.log(req.headers);

  let token: string = req.body.token || req.query.token || req.headers["x-access-token"] || req.headers.authorization;
  let rtn: string;
 // console.log(credentials.superSecret);
  jwt.verify(token,  Constants.SUPERSECRET, (err, decoded) => {
    if (err) {
      rtn = "fail";
    } else {
      rtn = "success";
    }

  });

 // console.log(rtn);
  return rtn;
}

export let get: any = (req: Request, res: Response) => {
  res.json({ message: "Hello and welcome fool." });
};


export let closeThread: any = (req: Request, res: Response) => {

  var validToken: string = authCheck(req, res);
  console.log(validToken);

  if (validToken === "success") {

    Message.update({ threadId: req.body.threadId }, { threadStatus: "closed" }, { multi: true },
      (err, message) => {
        console.log("updated MessageThread " + req.body.threadId);
        res.json({ message: "closed thread " + req.body.threadId });
      });
  } else {
    res.json({ message: "Invalid Token" });
  }
};

export let getMessage: any = (req: Request, res: Response) => {

  var validToken: string = authCheck(req, res);
  if (validToken === "success") {

    Message.find({ "messageId": req.params.message_id, source: "FaceBook" }, "messageId message threadId createdTime",
      (err, message) => {
        if (err) {
          res.send(err);
        }
        res.json(message);
      });
  } else {
    res.json({ message: "Invalid Token" });
  }
};

export let getMessages: any = async (req: Request, res: Response) => {

  const validToken: string = authCheck(req, res);

  if( validToken === "success") {
    ApplicationService.getSMSMessages("open", "FaceBook", "-createdTime").then((value) => {
      res.json(value);
    });

  } else {
    res.json({ message: "Invalid Token" });
  }

};

export let getUsers: any = async (req: Request, res: Response) => {

  const validToken: string = authCheck(req, res);

  if( validToken === "success") {

    const rtnVal: Promise<any> = await ApplicationService.getUsers();

    res.send(rtnVal);

  } else {
    res.send({ message: "Invalid Token" });
  }
};

export let getContents: any = (req: Request, res: Response) => {

  const validToken: string = authCheck(req, res);

  if( validToken === "success") {


    Content.find((err, contents) => {
      if (err) {
        res.send(err);
      }
      //     res.json(users);
      res.send(contents);
    });
  } else {
    let testUser = { username: "test", password: "test", firstName: "Test", lastName: "User" };
    //  res.json({ message: "Invalid Token" });
    res.json({ testUser });
  }

}

export let getContent: any = (req: Request, res: Response) => {

  var validToken: string = authCheck(req, res);
  if (validToken === "success") {

    Content.find({ "contentKey": req.params.content_id }, "contentKey content", (err, message) => {
      if (err) {
        res.send(err);
      }
      res.json(message);
    });
  } else {
    res.json({ message: "Invalid Token" });
  }

};

export let sendMessage: any = (req: Request, res: Response) => {
  console.log("In the SendMessage.  Sending a FaceBook message");
  let validToken: string = authCheck(req, res);
  if (validToken === "success") {

    let message = new Message();

    message.message = req.body.message;
    message.messageId = req.body.messageId;
    message.threadId = req.body.threadId;
    message.threadStatus = req.body.threadStatus;
    message.source = "FaceBook";
    // message.userId = req.body.userId;
    message.createdTime = moment().toDate();
    message.from = "WCSO";

    console.log("Message = " + message.message);

    Message.find({ "threadId": message.threadId }, "messageId message threadId threadStatus", (err: any, messageCheck: any) => {

      if (err) {
        console.log(err);
      } else {
        if (messageCheck.length === 0 || messageCheck[messageCheck.length - 1].threadStatus === "closed") {

          console.log(messageCheck);
          //     api.sendMessage(messageTxt + "\n\n Your message:  \n\n " + fbMessage.body, fbMessage.threadID);
          sendTextMessage(message.threadId, messageTxt + " \n\nYour Message:\n" + message.message);
          //   sendTextMessage(messagePayload);
          res.json({ message: "Just sent Message to " + message.threadId });

        } else {
          sendTextMessage(message.threadId, message.message);

          //   sendTextMessage(messagePayload);
          res.json({ message: "Just sent Message to " + message.threadId });
        }
      }
    });

    // sendTextMessage( message.threadId, messageTxt + " \n\nYour Message:\n" +  message.message);

    message.save((err) => {
      if (err) {
        console.log(err);
      }
    });

  } else {
    res.json({ message: "Invalid Token" });
  }

}

export let getUser: any = (req: Request, res: Response) => {

  let validToken: any = authCheck(req, res);

  if (validToken === "success") {

    User.findOne({
      "loginId": req.params.loginId
    }, (err, user) => {

      if (err) {
        res.json({ success: false, message: "ERROR finding user " + err });
      }

      if (!user) {
        res.json({ success: false, message: "ERROR finding user " + req.body.loginId });
      } else if (user) {
        return res.json(user.toJSON());
      }
    });
  } else {
    res.json({ message: "Invalid Token" });
  }
}

export let authenticate: any = (req: Request, res: Response) => {

  console.log("In the authenticate method");
  // set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)

  // var validToken = authCheck(req, res);

  User.findOne({
    loginId: req.body.loginId
  }, (err, user) => {

    if (err) throw err;

    if (!user) {
      putActivity(req.body.loginId, "FAIL", "Authentication failed. User not found.");
      res.json({ success: false, message: "Authentication failed. User not found." });
    } else if (user) {
      //    console.log(req.body.password);
      //    console.log(bcrypt.compareSync(req.body.password, user.password)); // true
      // check if password matches
      if (!bcrypt.compareSync(req.body.password, user.password)) {
        putActivity(req.body.loginId, "FAIL", "Authentication failed. Wrong password.");
        res.json({ success: false, message: "Authentication failed. Wrong password." });
      } else {

        putActivity(req.body.loginId, "SUCCESS", "Authentication successful.");

        // if user is found and password is right
        // create a token with only our given payload
        // we don"t want to pass in the entire user since that has the password
        const payload = {
          //        admin: user.admin 
        };
        var token = jwt.sign(payload, credentials.superSecret, {
          expiresIn: 60 * 60 * 24 // expires in 24 hours
        });

        // return the information including token as JSON
        res.json({
          success: true,
          message: "Enjoy your token!",
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
export let getApi: any = (req: Request, res: Response) => {

  let validToken = authCheck(req, res);
  console.log(validToken);

  if (validToken == "success") {
    res.json({ message: "hooray! welcome to our api being called from api.ts controller" });
  } else {
    res.json({ message: "Invalid Token" });
  }
};

export let postUser: any = (req: Request, res: Response) => {

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, PUT, DELETE, GET");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

  res.setHeader("Cache-Control", "no-cache");

  let user: any = new User();
  //   const nowDate: string = moment().format("MMMM Do YYYY, h:mm:ss a");
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

  bcrypt.genSalt(SALT_WORK_FACTOR, (err, salt) => {
    bcrypt.hash(req.body.password, salt, (err, hash) => {
      user.password = hash;
      console.log(hash);
      //     console.log(bcrypt.compareSync("halehanp2$", hash)); // true
      //     console.log(bcrypt.compareSync("catBoy", hash)); // false

      user.save((err) => {
        if (err) {
          res.send(err);
        }
        res.json({ message: "User created from Controller! " + user.firstName + "  " + user.lastName });
      });

    });
  });
};

export let putUser: any = (req: Request, res: Response) => {

  User.findOne({
    loginId: req.params.loginId
  }, (err, user) => {

    if (err) { throw err; }

    if (!user) {
      res.json({ success: false, message: "Authentication failed. User not found." });
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

// adds support for GET requests to our webhook
export let getWebhook: any = (req: Request, res: Response) => {
  console.log("Calling getWebhook 320");

  // parse the query params
  let mode: string = req.query["hub.mode"];
  console.log("hub.mode = " + mode);
  let token: string = req.query["hub.verify_token"];
  console.log("hub.verify_token = " + token);
  let challenge: string = req.query["hub.challenge"];
  console.log("hub.challenge = " + challenge);

  // checks if a token and mode is in the query string of the request
  if (mode && token) {

    // checks the mode and token sent is correct
    if (mode === "subscribe" && token === Constants.FACEBOOK_VERIFY_TOKEN) {

      // responds with the challenge token from the request
      console.log("WEBHOOK_VERIFIED");
      res.status(200).send(challenge);

    } else {
      // responds with "403 Forbidden" if verify tokens do not match
      res.sendStatus(403);
    }
  }
};

/* ============================================================================= */

export let postWebhook: any = (req: Request, res: Response) => {
  console.log("Calling postWebhook...");
  let body: any = req.body;
  let count: number = 0;


  // checks this is an event from a page subscription
  if (body.object === "page") {
    console.log("body.object ===  page");
    // iterates over each entry - there may be multiple if batched
    body.entry.forEach((entry) => {
      count = count + 1;

      // gets the message. entry.messaging is an array, but 
      // will only ever contain one message, so we get index 0
      let webhook_event: any = entry.messaging[0];
      console.log("webhook_event " + webhook_event);
      let lat: number = null;
      let long: number = null;
      let address: string = null;
      let attachmentUrl: string = null;
      let saveMessage: boolean = false;

      //    if (webhook_event && ( !(webhook_event.message === undefined || webhook_event.message.attachments === undefined)) ){
      if (webhook_event.message && (!(webhook_event.message.attachments === undefined))) {
        let messageAttachments: Object = webhook_event.message.attachments;
        console.log("message Has Attachment.");

        if (messageAttachments[0].payload.coordinates) {
          lat = messageAttachments[0].payload.coordinates.lat;
          long = messageAttachments[0].payload.coordinates.long;

          const reverseGeocodeParams = {
            "latlng": lat + "," + long,
            "language": "en"
          };
          gmAPI.reverseGeocode(reverseGeocodeParams, (err, result) => {
            console.log(result);
            address = result.results[0].formatted_address;
            console.log("address " + address);
            console.log(webhook_event.message);
            console.log(webhook_event.message.mid);

            Message.update({ threadId: webhook_event.sender.id, threadStatus: "open" },
              { lat: lat, long: long, address: address }, { multi: true }, (err, message) => {
                console.log("updated MessageThread " + webhook_event.sender.id);
              });

          });

        }

        if (messageAttachments[0].payload.url) {
          attachmentUrl = messageAttachments[0].payload.url;
          saveMessage = true;
          console.log(attachmentUrl);
        }
      }

      if ((webhook_event.message && webhook_event.message.text) || saveMessage) {
        let text: string = webhook_event.message.text;
        let sender: string = webhook_event.sender.id;
        let recipient: string = webhook_event.recipient.id;
        let timestamp: string = webhook_event.timestamp;
        let mid: string = webhook_event.message.mid;
        let seq: string = webhook_event.message.seq;
        console.log(webhook_event.message.text);

        Message.find({
          threadId: sender  // search Filters
        },
          ["messageId", "message", "threadId", "threadStatus"], // columns to Return
          {
            skip: 0, // starting Row
            limit: 150, // ending Row
            sort: {
              createdTime: -1 // sort by Date Added DESC
            }
          },
          //      (req: Request, res: Response, next: NextFunction) => {
          //        function(err: any, msg: any){
          (err: any, msg: any) => {
            if (err) {
              console.log(err);
            } else {
              console.log(msg);
              if (msg.length === 0 || (msg.length > 0 && msg[0].threadStatus === "closed") ||
                equalsIgnoreCase(webhook_event.message.text, "#LOCATION")) {
                let txt: string = Constants.REPLY_MESSAGE + text;
                sendLocationMessage(sender, txt);
              }
            }
          });

        console.log("=====================================================================");
        console.log("Sender = " + sender);
        console.log("recipient = " + recipient);
        console.log("timestamp = " + timestamp);
        console.log("text = " + text);
        console.log("mid = " + mid);
        console.log("seq = " + seq);
        console.log("=====================================================================");

        const message = new Message();
        //        const nowDate: string = moment().format("MMMM Do YYYY, h:mm:ss a");

        message.messageId = mid;
        message.threadId = sender;
        message.source = "FaceBook";
        if (text) {
          message.message = text;
        }
        message.threadStatus = "open";
        message.createdTime = moment().toDate();

        if (saveMessage) {
          message.message = "Attachment";
          message.attachmentUrl = attachmentUrl;
        }

        if (lat) {
          message.lat = lat;
        }
        if (long) {
          message.long = long;
        }
        if (address) {
          message.address = address;
        }

        message.from = "FaceBook";
        //    (err: any, msg: any) => {
        message.save((err: any) => {
          if (err) {
            console.log(err);
          }
        });
      }
    });

    console.log("count = " + count);

    // returns a "200 OK" response to all requests
    res.status(200).send("EVENT_RECEIVED");
  } else {
    // returns a "404 Not Found" if event is not from a page subscription
    res.sendStatus(404);
  }
};


/* ============================================================================= */
/*

  export let postWebhook = (req: Request, res: Response) => {
    console.log("Calling postWebhook");
    let body = req.body;
    let saveMessage: boolean = false;

      // Checks this is an event from a page subscription
      if (body.object === "page") {
        console.log("body.object ===  page");
        // Iterates over each entry - there may be multiple if batched
        body.entry.forEach(function(entry) {

          // Gets the message. entry.messaging is an array, but 
          // will only ever contain one message, so we get index 0
          let webhook_event = entry.messaging[0];
          let lat = null;
          let long = null;
          let address = null;
          let attachment = null;

          if (webhook_event && ( !(webhook_event.message === undefined || webhook_event.message.attachments === undefined)) ){
            let messageAttachments = webhook_event.message.attachments;
            console.log("message Has Attachment");

            if(messageAttachments[0].payload.url){
              attachment = messageAttachments[0].payload.url;
              saveMessage = true;
              console.log(attachment);
            }
            
            if(messageAttachments[0].payload.coordinates)
            {
                lat = messageAttachments[0].payload.coordinates.lat;
                long = messageAttachments[0].payload.coordinates.long;
                saveMessage = true;

                const reverseGeocodeParams = {
                  "latlng":        lat + "," + long,
                  "language":      "en"
                };
                  gmAPI.reverseGeocode(reverseGeocodeParams, function(err, result){
                    console.log(result);
                    address = result.results[0].formatted_address;
                    console.log("address " + address);

                  });
            }
          }

          if (webhook_event.message && webhook_event.message.text ) {
            let sender = webhook_event.sender.id;
            let recipient = webhook_event.recipient.id;
            let timestamp = webhook_event.timestamp;
            let text = webhook_event.message.text;
            let mid = webhook_event.message.mid;
            let seq = webhook_event.message.seq;

            Message.find({"threadId": sender}, "messageId message threadId threadStatus lat long address attachmentUrl", function(err: any, savedMessage: any) {
                  if (err)
                     console.log(err);
                  else {
                      if (savedMessage.length === 0 || savedMessage[savedMessage.length - 1].threadStatus === "closed") {
                          console.log(savedMessage)
                          let txt = Constants.REPLY_MESSAGE + text;

                          sendLocationMessage(sender, txt);
                      }
                  }
                });

              console.log("=====================================================================");
              console.log("Sender = " +sender);
              console.log("recipient = " +recipient);
              console.log("timestamp = " +timestamp);
              console.log("text = " +text);
              console.log("mid = " +mid);
              console.log("seq = " +seq);
              console.log("=====================================================================");

              const  message = new Message();
              const nowDate = moment().format("MMMM Do YYYY, h:mm:ss a");
              
              message.messageId = mid;
              message.threadId = sender;
              message.message = text;
              message.threadStatus = "open";
              message.createdTime = moment().toDate();

              if(lat){
                message.lat = lat;
              }
              if (long){
                message.long = long;
              }
              if (address){
                message.address = address;
              }
              
                message.save(function(err: any) {
                        if (err)
                          console.log(err);
                    });
              
          }
         
        });  
    
    
        res.status(200).send("EVENT_RECEIVED");
      } else {
        // Returns a "404 Not Found" if event is not from a page subscription
        res.sendStatus(404);
      }
 } */

export let getAddress: any = (lat: number, long: number): string => {

  let address: string = null;

  const reverseGeocodeParams = {
    "latlng": lat + "," + long,
    "language": "en"
  };
  gmAPI.reverseGeocode(reverseGeocodeParams, (err, result) => {
    console.log(result);
    address = result.results[0].formatted_address;
    console.log("address " + address);
  });

  const msg: string = "lat : " + lat + " long : " + long + "\n";
  console.log("Location = " + msg);

  return address;
}


export let sendTextMessage: any = (sender, text) => {
  let messageData: any = { text: text }
  let VERIFY_TOKEN: string = Constants.FACEBOOK_PAGE_VERIFY_TOKEN;
  request({
    url: "https://graph.facebook.com/v2.11/me/messages",
    qs: { access_token: VERIFY_TOKEN },
    method: "POST",
    json: {
      recipient: { id: sender },
      message: messageData,
    }
  }, (error, response, body) => {
    if (error) {
      console.log("Error sending message: ", error);
    } else if (response.body.error) {
      console.log("Error: ", response.body.error);
    }
  });
};

export let sendLocationMessage: any = (sender, text) => {
  //    let messageData = { text:text }
  let VERIFY_TOKEN: string = Constants.FACEBOOK_PAGE_VERIFY_TOKEN;
  request({
    url: "https://graph.facebook.com/v2.11/me/messages",
    qs: { access_token: VERIFY_TOKEN },
    method: "POST",
    json: {
      "recipient": {
        "id": sender
      },
      "message": {
        "text": text,
        "quick_replies": [
          {
            "content_type": "location"
          }
        ]
      }
    }
  }, (error, response, body) => {
    if (error) {
      console.log("Error sending message: ", error)
    } else if (response.body.error) {
      console.log("Error: ", response.body.error)
    }
  })
}

export let getGoogleMapData = (sender) => {
  request({
    url: "https://graph.facebook.com/v2.11/me/messages",
    qs: { key: Constants.GOOGLE_API_KEY },
    method: "GET",
    json: {
      "recipient": {
        "id": sender
      }
    }
  }, (error, response, body) => {
    if (error) {
      console.log("Error getting message: ", error)
    } else if (response.body.error) {
      console.log("Error: ", response.body.error)
    }
  });
};

export let putActivity: any = (login, message, messageText) => {
  console.log("IN THE putActivity method");
  console.log("Login = " + login + " message = " + message);
  let activity: any = new Activity();
  activity.createdTime = moment().toDate();
  activity.loginId = login;
  activity.message = message;
  activity.messageTxt = messageText;

  activity.save((err) => {
    if (err) {
      console.log(err);
    } else {
      console.log("Activity Created ");
    }
  });
};