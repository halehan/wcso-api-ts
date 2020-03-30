import * as mongoose from "mongoose";

interface IMessageReply {
    messageNumber: number;
    messageTxt: string;
    createdTime: Date;
}

interface IMessageReplyModel extends IMessageReply, mongoose.Document { }

let messageReplySchema: mongoose.Schema = new mongoose.Schema({
    messageNumber: Number,
    messageTxt: String,
    createdTime:Date
});

let MessageReply: any = mongoose.model<IMessageReplyModel>("reply", messageReplySchema);
export = MessageReply;