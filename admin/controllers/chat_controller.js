/**
 * Created by chiraj on 7/20/16.
 */
var mongoose = require('mongoose');

var friend = require('./friend_controller');

var User = mongoose.model('userCollection');

var Message = mongoose.model('chatCollection');

var Count = mongoose.model('countCollection');

exports.allChats = function (req,res) {
    if(req.session.name){
            User.findOne({username:req.params.friendname})
                .exec(function (err,doc) {
                   if(err || !doc)
                    console.log('Error in finding friend name in database ' + err);

                   else{
                        var obj = {
                            user:{}
                        };
                            obj.user.username = doc.username;
                            obj.user.country = doc.country;
                            obj.user.email = doc.email;
                            obj.user.status = doc.status;
                            obj.user.chats = [];
                       
                       Message.findOne({chatters:{$all:[req.session.name,req.params.friendname]}}).exec(function (err,doc) {
                                 if(err)
                                     console.log('Error while finding a user \'s chat database ');
                                  
                                  else if(!doc) {

                                  // 1   console.log(doc);

                                  //2   console.log('Creating chat DataBase for ' +  req.session.name + ' and  '  + req.params.friendname);

                                     var chatdoc = new Message({
                                        chatters:[req.session.name,req.params.friendname],
                                         chats:[],
                                         total:0,
                                         firstMsgRead:0,
                                         secondMsgRead:0
                                     });

                                     chatdoc.save(function (err,saved) {

                                         if(err)
                                             console.log('Error while saving in chat database ' + err );

                                         else {
                                         //3    console.log('Doc saved to chat database ' + saved);
                                             
                                             obj.user.chats = saved.chats;
                                             
                                             obj.user.msgNum = 0;

                                             res.cookie('totalChats',0);
                                             
                                             res.json(JSON.stringify(obj));
                                         }

                                     });
                                     
                                 }

                                  else{

                              //4       console.log('Chat DataBase for ' +  req.session.name + ' and  '  + req.params.friendname + 'Already exists');
                                     res.cookie('totalChats',doc.total);

                                     if(doc.chatters.indexOf(req.session.name) === 0 )
                                     doc.set('firstMsgRead',doc.total);

                                     else
                                         doc.set('secondMsgRead',doc.total);


                                     doc.save(function (err) {
                                        
                                         if(err)
                                             console.log('Error saving msgRead in database for ' + req.session.name);
                                         
                                         else {
                                      //5       console.log('Updated msgRead for the user ' + req.session.name);

                                             friend.chatupdatecount();                                  // after checking on all the messages clear that message
                                         }
                                         
                                     });

                                     for(var i in doc.chats){
                                         obj.user.chats.push({num:doc.chats[i].num,
                                                              msg:doc.chats[i].msg   });
                                         
                                     }
                                     
                                     if(doc.chatters[0] === req.session.name)
                                         obj.user.msgNum = 0;
                                     
                                     else 
                                         obj.user.msgNum = 1;
                                     
                                     res.json(JSON.stringify(obj));
                                 }
                              });
                                               }

                });
    }
    else{
        req.session.msg = 'Login Please';
        res.redirect('/login');
    }
};


module.exports.msgCollect = function (req,res) {

            if(req.session.name) {

                if (req.body.message == '') {
                    res.send('not a proper message');
                }

                else {
                    Message.findOne({chatters: {$all: [req.session.name, req.params.sendingTo]}}).exec(function (err, doc) {

                        if (err || !doc) {
                        
                            console.log('Error finding chat database ' + err);
                            
                            req.session.msg = ' Person you are trying to contact can\'t  be find in database . ';
                            res.send('reload');
                        }

                        else {

                            var sessionUser = 1;
                            if (doc.chatters[0] === req.session.name) {
                                sessionUser = 0;
                            }


                            if (doc.chatters.indexOf(req.session.name) === 0)       // updating msgread of the user who writes the current message
                                doc.update({
                                    $push: {chats: {msg: req.body.message, num: sessionUser}},
                                    $inc: {total: 1, firstMsgRead: 1}
                                })
                                    .exec(function (err, saved) {

                                        if (err)
                                            console.log('Error Saving message in chats array ' + err);

                                        else {

                                         //6   console.log('Message Saved');

                                            friend.chatupdatecount();

                                            res.send('saved');

                                        }

                                    });

                            else
                                doc.update({
                                    $push: {chats: {msg: req.body.message, num: sessionUser}},
                                    $inc: {total: 1, secondMsgRead: 1}
                                })
                                    .exec(function (err, saved) {

                                        if (err)
                                            console.log('Error Saving message in chats array ' + err);

                                        else {

                                       //7     console.log('Message Saved');

                                            friend.chatupdatecount();

                                            res.send('saved');

                                        }

                                    });

                        }

                    });
                }
            }

    else {      req.session.msg = 'Login Please ';
                res.redirect('/login');

            }
};
