"use strict";


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
import { MessageReplyVo } from '../entities/messageReplyVo';
import MessageReply = require("../entities/messageReply");
import Comment = require("../entities/comment");

const MessagingResponse: any = require("twilio").twiml.MessagingResponse;
var SALT_WORK_FACTOR: number = 10;

const credentials: any = {
  email: "",
  password: "",
  superSecret: "dog"
};

const publicConfig: any = {
  key: Constants.GOOGLE_API_KEY,
  stagger_time: 1000, // for elevationPath
  encode_polylines: false,
  secure: true
};

let gmAPI: GoogleMapsAPI = new GoogleMapsAPI(publicConfig);

export let verifyToken: any = (req: Request, resp: Response) => {
  let token: string = req.body.token || req.query.token || req.headers["x-access-token"] || req.headers.Authorization;

  if (token) {

    jwt.verify(token, Constants.SUPERSECRET, (err, decoded) => {

      if (err) {
        return resp.json({ success: false, message: "Failed to authenticate token." });
      }
    });

  } else {

    resp.send({ success: false, message: "No token exists." });

  }
};

export let getSMSMessages: any = (req: Request, res: Response) => {

  const validToken: string = authCheck(req, res);

  if (validToken === "success") {

    Message.find({ threadStatus: "open", source: "SMS" }).sort("-createdTime").exec(function (err, messages) {
      if (err) {
        res.send(err);
      }
      res.json(messages);
    });

  } else {
    res.json({ message: "Invalid Token" });
  }

};

export let test: any = async (req: Request, res: Response) => {

  /*
  MessageReply.find({}, (err, users) => {
    if (err) { throw err; }
    res.json(users);
    console.log(users);
  });
*/
  MessageReply.find({ "messageNumber": req.body.messageNumber}, "messageTxt messageNumber", (err, results: MessageReplyVo[]) => {
    if (err) {
      console.error("Error " + err);
    }
    let msg: MessageReplyVo = results[0];
    console.log(msg);
    console.log(msg.messageTxt);
    res.json(msg.messageTxt);
  });


 /* Comment.find({}, (err, users) => {
    if (err) { throw err; }
    res.json(users);
    console.log(users);
  });

  let messageId: string = "SMfd382057d4ca8f39482bdfc3395a0f7d";

  Message.find({ "messageId": messageId}, "messageId message threadId createdTime", (err, message) => {
    if (err) {
      res.send(err);
    }
    res.json(message);
  });

  let messageNumber: string = "6069";


*/
};

export let listenSMSMessage: any = async (req: Request, res: Response) => {

  let twiml = new MessagingResponse();
  let message = new Message();
  let msg: MessageReplyVo;

  console.log(req.body.Body);

  MessageReply.find({ "messageNumber": req.body.messageNumber}, "messageTxt messageNumber", (err, results: MessageReplyVo[]) => {
    if (err) {
      console.error("Error " + err);
    }
    msg = results[0];
    console.log(msg);
    console.log(msg.messageTxt);
  });


 /* Message.find({ "messageId": req.params.message_id }, "messageId message threadId createdTime", (err, message) => {
    if (err) {
      res.send(err);
    }
    res.json(message);
  }); */

  const client: any = require("twilio")(Constants.TWILIO_ACCOUNTSID, Constants.TWILIO_AUTHTOKEN);
  twiml.message(msg.messageTxt);
 // twiml.message("Your message has been logged and someone will respond shortly. ");

  client.lookups.phoneNumbers(req.body.From)
    .fetch({ type: "carrier" })
    .then((phone_number) => {

      message.carrierName = phone_number.carrier.name;
      message.carrierType = phone_number.carrier.type;
      message.mobileCountryCode = phone_number.carrier.mobile_country_code;

    });

  client.lookups.phoneNumbers(req.body.From)
    .fetch({ type: "caller-name" })
    .then((phone_number) => {

      message.callerName = phone_number.callerName.caller_name;
      message.callertype = phone_number.callerName.caller_type;

    });

  /*
    client.lookups.phoneNumbers(req.body.From)
                .fetch({type: "caller-name"})
                .then(phone_number => console.log(phone_number.callerName.caller_name));  */


  console.log("message  = " + req.body.Body);
  console.log("messageId  = " + req.body.MessageSid);
  console.log("from = " + req.body.From);
  console.log("from city = " + req.body.FromCity);
  console.log("from state = " + req.body.FromState);
  console.log("from country = " + req.body.FromCountry);
  console.log("from zip = " + req.body.FromZip);
  console.log("to = " + req.body.To);
  console.log("to city = " + req.body.ToCity);
  console.log("to state = " + req.body.ToState);
  console.log("to country = " + req.body.ToCountry);
  console.log("to zip = " + req.body.ToZip);
  console.log("SMS Status = " + req.body.SmsStatus);


  console.log("------ Caller Meta  ---------------------------------");

  console.log("Caller Name = " + message.callerName);
  console.log("Caller Type = " + message.callertype);
  console.log("Mobile Network Type = " + message.mobileNetworkType);
  console.log("Mobile Country Code = " + message.mobileCountryCode);

  message.messageId = req.body.MessageSid;
  message.message = req.body.Body;
  message.threadId = req.body.MessageSid;
  message.from = req.body.From;
  message.to = req.body.To;
  message.status = req.body.SmsStatus;
  message.direction = "incoming-api";
  message.toCity = req.body.ToCity;
  message.fromCity = req.body.FromCity;
  message.fromState = req.body.FromState;
  message.fromZip = req.body.FromZip;
  message.source = "SMS";
  message.threadStatus = "open";
  message.createdTime = moment().toDate();

  if (req.body.NumMedia !== "0") {
    //      const filename = `${req.body.MessageSid}.png`;
    const url: string = req.body.MediaUrl0;

    message.attachmentUrl = url;

    if (message.message === undefined || message.message === null) {
      message.message = "Attachment";
    }

    console.log("url = " + url);
    /*     request(url).pipe(fs.createWriteStream(filename))
           .on("close", () => console.log("Image downloaded.")); */
  }
  message.save((err: any) => {
    if (err) {
      console.log(err);
    }
  });

  res.writeHead(200, { "Content-Type": "text/xml" });
  res.end(twiml.toString());

};

export let getSMSMessage: any = (req: Request, resp: Response) => {

  const client: any = require("twilio")(Constants.TWILIO_ACCOUNTSID, Constants.TWILIO_AUTHTOKEN);

  client.messages(req.params.messageId)
    .fetch()
    .then( (message) => {
      resp.json({ message: message });
    });

};

export let sendSMSMessage = (req: Request, resp: Response) => {
  let twilio = require("twilio");
  let client = new twilio(Constants.TWILIO_ACCOUNTSID, Constants.TWILIO_AUTHTOKEN);
  let rtn: string = "";

  const validToken: any = authCheck(req, resp);

  if (validToken === "success") {

    client.messages.create({
      body: req.body.msg,
      to: req.body.to,  // text this number
      from: Constants.TWILIO_NUMBER // from a valid Twilio number
    }).then( (results) => {

      const message = new Message();
 //     const nowDate = moment().format("MMMM Do YYYY, h:mm:ss a");

      message.messageId = results.sid;
      message.threadId = results.sid;
      message.date_sent = results.date_sent;
      message.from = results.from;
      message.to = results.to;
      message.status = results.status;
      message.direction = results.direction;
      message.messaging_service_sid = results.messaging_service_sid;

      message.message = req.body.msg;

      message.source = "SMS";
      message.threadStatus = "open";
      message.createdTime = moment().toDate();

      message.save( (err: any) => {
        if (err) {
          console.log(err);
        }
      });


      resp.json({ sid: results.sid });
    });

  } else {
    resp.json({ message: "Invalid Token" });
  }

};

export let authCheck: any =  (req: Request, resp: Response) => {

  resp.setHeader("Access-Control-Allow-Headers", "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With,x-access-token");

  console.log(req.headers);

  var token = req.body.token || req.query.token || req.headers["x-access-token"] || req.headers.authorization;
  var rtn;
  console.log(credentials.superSecret);
  jwt.verify(token, Constants.SUPERSECRET, (err, decoded) => {
    if (err) {
      rtn = "fail";
      //   resp.json({ message: "Invalid Token" });
    } else {
      rtn = "success";
      //   resp.json({ message: "Invalid Token" });
    }

  });

  console.log(rtn);
  return rtn;
}

export let get = (req: Request, res: Response) => {
  res.json({ message: "Hello and welcome" });
}

/*
this will close the current session using the incoming phone number
*/
export let closeTxt = (req: Request, res: Response) => {

  let validToken: string = authCheck(req, res);

  if (validToken === "success") {

    Message.update({ source: "SMS", from: req.body.from, to: req.body.to }, { threadStatus: "closed" }, { multi: true },
      function (err, message) {
        console.log("updated MessageThread " + req.body.from);
        res.json({ message: "closed thread " + req.body.threadId });
      });

  } else {
    res.json({ message: "Invalid Token" });
  }
};

export let getMessage = (req: Request, res: Response) => {

  const validToken = authCheck(req, res);
  if (validToken === "success") {

    Message.find({ "messageId": req.params.message_id }, "messageId message threadId createdTime", function (err, message) {
      if (err)
        res.send(err);
      res.json(message);
    });
  } else {
    res.json({ message: "Invalid Token" });
  }

}

export let getMessages = (req: Request, res: Response) => {

  var validToken = authCheck(req, res);

  if (validToken === "success") {

    Message.find({ threadStatus: "open", source: "SMS" }).sort("-createdTime").exec(function (err, messages) {
      if (err) {
        res.send(err);
      }
      res.json(messages);
    });

  } else {
    res.json({ message: "Invalid Token" });
  }

}

export let getUsers = (req: Request, res: Response) => {

  if (authCheck(req, res) === "success") {

    User.find((err, users) => {
      if (err) {
        res.send(err);
      }
      //     res.json(users);
      res.send(users);
    });
  }

};

export let getContents = (req: Request, res: Response) => {

  if (authCheck(req, res) === "success") {

    Content.find( (err, contents) =>{
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

export let getContent = (req: Request, res: Response) => {

  var validToken = authCheck(req, res);
  if (validToken == "success") {

    Content.find({ "contentKey": req.params.content_id }, "contentKey content", function (err, message) {
      if (err)
        res.send(err);
      res.json(message);
    });
  } else {
    res.json({ message: "Invalid Token" });
  }

}

export let getUser = (req: Request, res: Response) => {

  var validToken = authCheck(req, res);

  if (validToken == "success") {

    User.findOne({
      "loginId": req.params.loginId
    }, function (err, user) {

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

export let authenticate = (req: Request, res: Response) => {


  console.log("In the authenticate method");
  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)

  // var validToken = authCheck(req, res);

  User.findOne({
    loginId: req.body.loginId
  }, function (err, user) {

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
        var token = jwt.sign(payload, Constants.SUPERSECRET, {
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

};

/**
 * GET /api
 * List of API examples.
 */
export let getApi = (req: Request, res: Response) => {

  var validToken = authCheck(req, res);
  console.log(validToken);

  if (validToken === "success") {
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


  var user = new User();
  // var nowDate = moment().format("MMMM Do YYYY, h:mm:ss a");
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

      user.save( (err) => {
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
          res.status(500).send(err)
        }
        res.status(200).send(user);
      });

    }
  });

};

export let getAddress = (lat: number, long: number): string => {
  let address = null;

  const reverseGeocodeParams = {
    "latlng": lat + "," + long,
    "language": "en"
  };
  gmAPI.reverseGeocode(reverseGeocodeParams, function (err, result) {
    console.log(result);
    address = result.results[0].formatted_address;
    console.log("address " + address);
  });

  const msg: string = "lat : " + lat + " long : " + long + "\n";
  console.log("Location = " + msg);

  return address;
};

export let putActivity = (login, message, messageText) => {
  console.log("IN THE putActivity method");
  console.log("Login = " + login + " message = " + message);
  var activity = new Activity();
  //     var nowDate = moment().format("MMMM Do YYYY, h:mm:ss a");
  activity.createdTime = moment().toDate();
  activity.loginId = login;
  activity.message = message;
  activity.messageTxt = Constants.REPLY_MESSAGE;

  activity.save((err) => {
    if (err) {
      console.log(err);
    } else {
      console.log("Activity Created ");
    }
  });

};