
var mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1/raswall',{ useMongoClient: true });

var Schema = mongoose.Schema;

// schema for httprequests collection
var httpSchema = new Schema({
    req_url: String,
    ip: String
});

// schema for category information 
var catgSchema = new Schema({
    catgName:{type:String,unique:true},
    maxTime:Number,
    enrolledLists:[String]              // array of name of blacklists
});

// user's info schema
var usersSchema = new Schema({
    username:{type:String,unique:true},
    password: String,
    ctTime:Date,                // user creation time
    category: String           // category name
});

// schema for user's authenticated session
var authSessionSchema = new Schema({
    username: String,
    magic:String,
    ip: String,
    category: String,
    maxTime: Number,
    req_url: String,
    loginTime:Date
});

// schema contains listname and blacklist of websites that it is intended to block
var webListSchema = new Schema({
    listName:{type:String,unique:true},
    blackList:[String]
});

// schema holding faulty access details about user
var faultySchema = new Schema({
    url:String,
    category:String,
    ip:String,
    username:String,
    listname:String,
    accessTime:Date
});

module.exports.httpRequests = mongoose.model('httprequests',httpSchema);
module.exports.users = mongoose.model('users',usersSchema);
module.exports.authSessions = mongoose.model('authsessions',authSessionSchema);

module.exports.categories = mongoose.model('categories',catgSchema);
module.exports.WebLists = mongoose.model('weblists',webListSchema);
module.exports.faults = mongoose.model('faultyCollection',faultySchema);