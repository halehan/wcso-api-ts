import * as mongoose from "mongoose";

interface IUser{ 
  
    firstName:string;
    lastName:string;    
    loginId:string;
    password:string;
    role:string;
    address:string;
    city: string;
    state: string;
    about:string;
    zip:string;
    phoneMobile:string;
    supervisor:string;    
    createdTime:Date;
    updateDate:Date,
    updateBy:string;
} 
   
interface IUserModel extends IUser, mongoose.Document{};

var userSchema = new mongoose.Schema({  
    
    firstName:String,
    lastName:String,
    loginId:String,
    password:String,
    role:String,
    address:String,
    about:String,
    city: String,
    state: String,
    zip:String,
    phoneMobile:String,
    supervisor:String,  
    createdTime:Date,
    updateDate:Date,
    updateBy:String

});

var User = mongoose.model<IUserModel>("User", userSchema);  
export = User;  