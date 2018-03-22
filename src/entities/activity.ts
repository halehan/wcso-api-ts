import * as mongoose from "mongoose";

interface IActivity{  
    
    loginId:string;
    message:string;
    createdTime:Date,    
}

interface IActivityModel extends IActivity, mongoose.Document{};

var activitySchema = new mongoose.Schema({ 
    createdTime: Date,
    loginId: String,
    message: String  
});

var Activity = mongoose.model<IActivityModel>("Activity", activitySchema);  
export = Activity;  