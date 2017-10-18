import * as mongoose from "mongoose";

interface IComment{  
    text:string;
    author:string;    
}

interface ICommentModel extends IComment, mongoose.Document{};

var commentSchema = new mongoose.Schema({  
    text: String,
    author: String  
});

var Comment = mongoose.model<ICommentModel>("Comment", commentSchema);  
export = Comment;  