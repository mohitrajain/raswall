var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var adminSchema = new Schema({
        
    username:{type:String,unique:true},
    hashpasswd:String
});




mongoose.model('userCollection',userSchema);

