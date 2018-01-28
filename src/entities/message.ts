import * as mongoose from "mongoose";

interface IMessage{  
    createdTime:Date;
    threadStatus:string;    
    message:string;
    threadId:number;
    messageId:string;
    userId:string;
    lat:number;
    long:number;
    address:string;
    attachmentUrl:string;

}

interface IMessageModel extends IMessage, mongoose.Document{};

var messageSchema = new mongoose.Schema({  
    createdTime: Date,
    threadStatus: String,
    message: String,
    threadId: Number,
    messageId: String,
    userId: String,
    lat: Number,
    long: Number,
    address: String,
    attachmentUrl: String

});

var Message = mongoose.model<IMessageModel>("Message", messageSchema);  
export = Message;  