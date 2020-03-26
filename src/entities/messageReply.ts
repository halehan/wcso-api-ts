import * as mongoose from "mongoose";

interface IMessageReply {
    messageNumber: Number;
    messageTxt: String;
}

interface IMessageModel extends IMessageReply, mongoose.Document{};

let messageSchema = new mongoose.Schema({
    messageNumber: Number,
    messageTxt: String
});

let MessageReply  = mongoose.model<IMessageModel>("MessageReply", messageSchema);
export = MessageReply;