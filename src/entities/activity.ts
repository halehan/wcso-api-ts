import * as mongoose from "mongoose";

interface IActivity{  
    
    loginId:string;
    value:string;
    createdTime:Date,    
}

interface IActivityModel extends IActivity, mongoose.Document{};

var activitySchema = new mongoose.Schema({ 
    createdTime: Date,
    loginId: String,
    value: String  
});

var Activity = mongoose.model<IActivityModel>("Activity", activitySchema);  
export = Activity;  