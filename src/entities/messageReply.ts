import * as mongoose from "mongoose";

interface IMessageReply {
    messageNumber:string;
    messageTxt:string;
}

interface IMessageReplyModel extends IMessageReply, mongoose.Document { }

let messageReplySchema: mongoose.Schema = new mongoose.Schema({
    messageNumber: String,
    messageTxt: String
});

let MessageReply: any = mongoose.model<IMessageReplyModel>("reply", messageReplySchema);
export = MessageReply;