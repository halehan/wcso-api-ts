import * as mongoose from "mongoose";

interface IMessage {
    numMedia: number;
    mediaUrl0: string;
    smsSid: string;
    smsStatus: string;
    createdTime: Date;
    threadStatus: string;
    incomingMessage: string;
    message: string;
    threadId: string;
    messageId: string;
    userId: string;
    lat: number;
    long: number;
    address: string;
    attachmentUrl: string;
    from: string;
    source: string;
    date_sent: Date;
    to: string;
    status: string;
    direction: string;
    messaging_service_sid: string;
    fromState: string;
    fromCity: string;
    fromZip: string;
    toCity: string;
    toState: string;
    callertype: string;
    phoneNumber:
    {
        countryCode: string;
        phoneNumber: string;
        nationalFormat: string,
        callerName: {
            caller_name: string,
            caller_type: string,
            error_code: string,
        }
    }
}

interface IMessageModel extends IMessage, mongoose.Document { }

let messageSchema: any = new mongoose.Schema({
    numMedia: Number,
    mediaUrl0: String,
    smsSid: String,
    smsStatus: String,
    mediaContentType0: String,
    createdTime: Date,
    threadStatus: String,
    incomingMessage: String,
    message: String,
    threadId: String,
    messageId: String,
    userId: String,
    lat: Number,
    long: Number,
    address: String,
    attachmentUrl: String,
    from: String,
    source: String,
    date_sent: Date,
    to: String,
    status: String,
    direction: String,
    messaging_service_sid: String,
    fromState: String,
    fromCity: String,
    fromZip: String,
    toCity: String,
    toState: String,
    callertype: String,
    phoneNumber:
    {
        countryCode: String,
        phoneNumber: String,
        nationalFormat: String,
        callerName: {
            caller_name: String,
            caller_type: String,
            error_code: String,
        }
    }
});

let Message: any = mongoose.model<IMessageModel>("Message", messageSchema);
export = Message;