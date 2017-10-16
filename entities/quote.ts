import * as mongoose from "mongoose";

interface IQuote{  
    text:string;
    author:string;    
}

interface IQuoteModel extends IQuote, mongoose.Document{};

var quoteSchema = new mongoose.Schema({  
    text: String,
    author: String  
});

var Quote = mongoose.model<IQuoteModel>("Quote", quoteSchema);  
export = Quote;  