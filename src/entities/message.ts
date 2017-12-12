import * as mongoose from "mongoose";

interface IMessage{  
    createdTime:Date;
    threadStatus:string;    
    message:string;
    threadId:string;
    messageId:string;
    userId:string;

}

interface IMessageModel extends IMessage, mongoose.Document{};

var messageSchema = new mongoose.Schema({  
    createdTime: Date,
    threadStatus: String,
    message: String,
    threadId: String,
    messageId: String,
    userId: String

});

var Message = mongoose.model<IMessageModel>("Message", messageSchema);  
export = Message;  