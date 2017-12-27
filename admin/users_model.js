var mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1/raswall',{ useMongoClient: true });
var Schema = mongoose.Schema;

var adminSchema = new Schema({
        
    username:{type:String,unique:true},
    hashpasswd:String
});

module.exports.admins = mongoose.model('admins',adminSchema);

