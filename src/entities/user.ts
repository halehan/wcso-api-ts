import * as mongoose from "mongoose";

interface IUser{ 
    firstName:string;
    lastName:string;    
    loginId:string;
    password:string;
    role:string;
    phoneMobile:string;
    supervisor:string;    
    createDate:string;
    updateDate:string,
    updateBy:string;
} 
   

interface IUserModel extends IUser, mongoose.Document{};

var userSchema = new mongoose.Schema({  
    firstName:String,
    lastName:String,
    loginId:String,
    password:String,
    role:String,
    phoneMobile:String,
    supervisor:String,  
    createDate:String,
    updateDate:String,
    updateBy:String

});

var User = mongoose.model<IUserModel>("User", userSchema);  
export = User;  