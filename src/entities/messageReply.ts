import * as mongoose from "mongoose";

interface IMessageReply{
    messageNumber:string;
    messageTxt:string;
}

interface IMessageReplyModel extends IMessageReply, mongoose.Document {}

let messageReplySchema = new mongoose.Schema({
    messageNumber: String,
    messageTxt: String

});

let MessageReply = mongoose.model<IMessageReplyModel>("MessageReply", messageReplySchema);
export = MessageReply;