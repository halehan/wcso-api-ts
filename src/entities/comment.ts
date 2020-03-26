import * as mongoose from "mongoose";

interface IComment {
    text:string;
    author:string;
}

interface ICommentModel extends IComment, mongoose.Document{};

let commentSchema: mongoose.Schema = new mongoose.Schema({
    text: String,
    author: String
});

let Comment: any = mongoose.model<ICommentModel>("Comment", commentSchema);
export = Comment;