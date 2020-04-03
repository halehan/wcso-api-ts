import { Constants } from "../utils/constants";
import Message = require("../entities/message");
import User = require("../entities/user");
import { MessageReplyVo } from "../entities/messageReplyVo";
import MessageReply = require("../entities/messageReply");
import moment = require("moment");

export class ApplicationService {


    public static async getSMSReplies(): Promise<any> {

        return new Promise((resolve, reject) => {

            MessageReply.find({}, (err: Error, replies: MessageReplyVo[]) => {
                if (err) { reject(err); } else {
                    resolve(replies);
                }
            });
        });
    }

    public static async getSMSMessages(_threadStatus: string, _source: string, _sort: string): Promise<any> {

        return new Promise((resolve, reject) => {

            Message.find({ threadStatus: _threadStatus, source: _source }).sort(_sort).exec((err: Error, messages: Object[]) => {
                if (err) { reject(err); } else {
                    resolve(messages);
                }
            });
        });
    }

    public static async getSMSMessage(messageId: any): Promise<any> {

        const client: any = require("twilio")(Constants.TWILIO_ACCOUNTSID, Constants.TWILIO_AUTHTOKEN);

        return new Promise((resolve, reject) => {

            client.messages(messageId)
                .fetch()
                .then((message) => {
                    resolve(message);
                });
        });
    }

    public static async sendSMSMessage(_message: string, _to: string, _from: string): Promise<any> {

        const client: any = require("twilio")(Constants.TWILIO_ACCOUNTSID, Constants.TWILIO_AUTHTOKEN);

        return new Promise((resolve, reject) => {

            client.messages.create({
                body: _message, // message
                to: _to,        // text this number
                from: _from     // from a valid Twilio number
              }).then((results) => {

                const message: any = new Message();
                message.messageId = results.sid;
                message.threadId = results.sid;
                message.date_sent = results.date_sent;
                message.from = results.from;
                message.to = results.to;
                message.status = results.status;
                message.direction = results.direction;
                message.messaging_service_sid = results.messaging_service_sid;
                message.message = _message;
                message.source = "SMS";
                message.threadStatus = "open";
                message.createdTime = moment().toDate();

                message.save((err: any) => {
                  if (err) {
                    console.log(err);
                  }
                });
                resolve(results);
              });
        });
    }


    public static async getUsers(): Promise<any> {

        return new Promise((resolve, reject) => {

            User.find({}, (err: Error, users: Object[]) => {
                if (err) { reject(err); } else {
                    resolve(users);
                }
            });
        });
    }
}