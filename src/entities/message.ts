import * as mongoose from "mongoose";

interface IMessage{  
    createdTime:Date;
    threadStatus:string;    
    message:string;
    threadId:string;
    messageId:string;
    userId:string;
    lat:number;
    long:number;
    address:string;
    attachmentUrl:string;
    from:string;
    source:string;
    date_sent: Date,
    to: string,
    status: string,
    direction: string,
    messaging_service_sid: string,
    fromState: string,
    fromCity: string,
    fromZip: string,
    toCity: string,
    toState: string,
    callerName: string,
    callertype: string,
    mobileCountryCode: string,
    mobileNetworkType: string,
    carrierName: string,
    carrierType: string

}

interface IMessageModel extends IMessage, mongoose.Document{};

var messageSchema = new mongoose.Schema({  
    createdTime: Date,
    threadStatus: String,
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
    fromCity: String,
    fromZip: String,
    toCity: String

});

var Message = mongoose.model<IMessageModel>("Message", messageSchema);  
export = Message;  