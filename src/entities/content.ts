import * as mongoose from "mongoose";

interface IContent{  
    text:string;
    author:string;    
}

interface IContentModel extends IContent, mongoose.Document{};

var contentSchema = new mongoose.Schema({  
    text: String,
    author: String  
});

var Content = mongoose.model<IContentModel>("Content", contentSchema);  
export = Content;  