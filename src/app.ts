/// <reference path="../typings/index.d.ts" />
import * as express from "express";
import * as cors from "cors";
import * as bodyParser from "body-parser";
import * as mongoose from "mongoose";
import * as morgan from "morgan";


import * as apiController from "./controllers/fb-page-messenger";
import * as twilioSMS from "./controllers/twillioSMS";

abstract class App {

    static get port(): any { return process.env.PORT || 3000; }
    static get connectionString(): string { return process.env.MONGODB_URI; }
    static get address(): string { return process.env.MONGODB_URI; }


    static startServer(): void {
        const server: any = express();
        server.use(cors());
        server.use(bodyParser.json());
        server.use(bodyParser.urlencoded({ extended: true }));
        server.use(morgan("dev")); // log requests to the console

        server.post("/whatsapp/incoming/", twilioSMS.incoming);
        server.post("/whatsapp/callback/", twilioSMS.whatsAppCallback);

        server.post("/sms/listen/", twilioSMS.listenSMSMessage);
        server.post("/sms/listen/test/", twilioSMS.test);
        server.post("/sms/send/", twilioSMS.sendSMSMessage);
        server.get("/sms/message/:messageId", twilioSMS.getSMSMessage);
        server.get("/sms/messages/", twilioSMS.getSMSMessages);
        // server.post("/sms/closeThread/", twilioSMS.closeTxt);
        server.post("/sms/messageReply/", twilioSMS.newReply);
        server.get("/sms/messageReply/", twilioSMS.getReplies);
        server.delete("/sms/messageReply/:id", twilioSMS.deleteReply);
        server.put("/sms/messageReply/", twilioSMS.updateReply);

        // FB Webhook
        server.post("/webhook/", apiController.postWebhook);
        server.get("/webhook/", apiController.getWebhook);
        server.get("/", apiController.get);

        //User
        server.put("/api/user/:loginId", apiController.putUser);
        server.post("/api/user", apiController.postUser);
        server.get("/api/user/", apiController.getUsers);
        server.get("/api/user/:loginId", apiController.getUser);

        //Message
        server.post("/messages/closethread", apiController.closeThread);
        server.post("/messages/sendmessage", cors(), apiController.sendMessage);
        server.get("/messages", cors(), apiController.getMessages);
        server.get("/messages/:message_id", apiController.getMessage);

        server.get("/api", apiController.getApi);
        server.post("/authenticate", apiController.authenticate);

        //content
        server.get("/api/content/", apiController.getContents);
        server.get("/api/content/:content_id", apiController.getContent);

        const dbOpt: any = { useNewUrlParser: true, useUnifiedTopology: true };

        mongoose.connect(App.connectionString, dbOpt);


        server.listen(App.port, () => { console.log("====APP ===== Listening on port " + App.port); });
    }

}

App.startServer();