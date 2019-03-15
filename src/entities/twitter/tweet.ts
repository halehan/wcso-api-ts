import * as mongoose from "mongoose";

interface ITweet{  
    
    createdTime:Date, 
    id_str:string;
    text:string;
    source:string;
    userId:string;
    userName:string;
    userScreenName:string;
    userLocation:string;
    userDescription:string;
    userFollowerCount:string;
    userFriendsCount:string;

       
}

interface ITweetModel extends ITweet, mongoose.Document{};

var tweetSchema = new mongoose.Schema({ 
    createdTime: Date,
    id_str: String,
    text: String,
    source: String,
    userId: String,
    userName: String,
    userScreenName: String,
    userLocation: String,
    userDescription: String,
    userFollowerCount: String,
    userFriendsCount: String


});

var Tweet = mongoose.model<ITweetModel>("Tweet", tweetSchema);  
export = Tweet;  