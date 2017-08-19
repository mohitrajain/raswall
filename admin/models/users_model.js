var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
        
    username:{type:String,unique:true},
    hashpasswd:String
});

var chatSchema = new Schema({
    chatters:[String],
    chats:[ { num:Number , msg:String } ],
    total:Number,
    firstMsgRead:Number,
    secondMsgRead:Number
});

var friendSchema = new Schema({
  name:{type:String,unique:true},
  online:Boolean,
    status:String
});

var countSchema = new Schema({
   
    friendUpdateCount:Number,
    chatUpdateCount:Number,
    infoUpdateCount:Number      // Status shown under each username in friends section 
    
});

mongoose.model('userCollection',userSchema);

mongoose.model('chatCollection',chatSchema);

mongoose.model('friendCollection',friendSchema);

mongoose.model('countCollection',countSchema);
