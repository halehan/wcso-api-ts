/// <reference path="typings/index.d.ts" />
import * as express from "express";  
import * as bodyParser from "body-parser";  
import * as Quote from "./entities/quote";  
import * as Comment from "./entities/comment";
import * as Message from "./entities/message";
import * as User from "./entities/user";
import * as mongoose from "mongoose";
import * as morgan from "morgan";

// node-restul doesn't have typings, so we'll have to use plain js require to get it :-(
var restful = require('node-restful');  // ===============


// COMMON VARIABLES
// ===============
let appPort: number =  (process.env.PORT || 3000);  
// let connectionString: string = process.env.MONGODB_URI;  
let connectionString: string = 'mongodb://wcso:wcso@ds161164.mlab.com:61164/wcso';


// ===============
// Express App
// ===============
var app = express();  
app.use(bodyParser.json());  
app.use(bodyParser.urlencoded({ extended: true}));

app.use((req, res, next) => {
    // Set permissive CORS header - this allows this server to be used only as
    // an API server in conjunction with something like webpack-dev-server. 
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, PUT, DELETE, GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With');

    // Disable caching so we'll always get the latest comments.
    res.setHeader('Cache-Control', 'no-cache');
    next();
});

app.set("port", appPort);  

app.get('/', (req, res) => {
    res.json({ message: 'welcome to the root of our api!' });	
})

app.get('/api', (req, res) => {
    res.json({ message: 'hooray! welcome to our api!' });	
});

// ===============
// REST API LOGIC
// ===============
var quoteApi = restful.model("quote", Quote.schema)  
.methods(["get", "post", "put", "delete"])
.register(app, "/api/quote");

var commentApi = restful.model("comment", Comment.schema)  
.methods(["get", "post", "put", "delete"])
.register(app, "/api/comment");

var messageApi = restful.model("message", Message.schema)  
.methods(["get", "post", "put", "delete"])
.register(app, "/api/message");

var userApi = restful.model("user", User.schema)  
.methods(["get", "post", "put", "delete"])
.register(app, "/api/user");

// ===============
// DB 
// ===============
var dbOpt : any = { 
    useMongoClient: true
} 

mongoose.connect(connectionString, dbOpt);


// ===============
// SERVER
// ===============
let port:number = app.get("port");  
var server = app.listen(port, function(){

    // note: Only for debugging purposes to see that your variables are set correctly...
    console.log("connectionString is: " + connectionString);
    console.log("port is: " + port);
    console.log("Server started listening... BOYZ");
});


}
