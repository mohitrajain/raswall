/**
 * Created by chiraj on 7/20/16.
 */
var mongoose = require('mongoose');

var Friend =  mongoose.model('friendCollection');

var Message = mongoose.model('chatCollection');

var Count = mongoose.model('countCollection');

var constCount;

Count.remove(function (err) {     // removing previous docs if present any
    if(err)
    console.log('Error deleting count docs in count db');

    else {
      //1  console.log('Deleted older');

        constCount = new Count({

            friendUpdateCount:0,
            chatUpdateCount:0,
            infoUpdateCount:0

        });

        constCount.save(function (err) {
            if(err)
                console.log('Error while saving const doc');

        });
    }
});

exports.totalAdd = function (name,status) {

    var newfriend = new Friend({
        name:name,
        online:true,
        status:status
    });

    newfriend.save(function (err) {
       if(err)
        console.log('Error saving new friend info into system '  + err);
        
           // Saving friendUpdate Count
        else {
           
           constCount.set('friendUpdateCount',constCount.friendUpdateCount + 1);

           constCount.save(function (err,doc) {

               if(err)
                   console.log('Error while saving friendupdate  ' + err);

               else {
               //2    console.log('friendUpdate Saved  ' + doc.friendUpdateCount);
               }
           });
           
       }
    });
};

exports.online = function (name) {
    Friend.findOne({name:name})
          .exec(function (err,doc) {
             if(err || !doc) {
                 console.log(' Friend is not found in database ' + err);
             }
              
              else {
                doc.set('online','true',Boolean);

                 doc.save(function (err) {
                     if(err)
                         console.log('Error saving new friend online info '  + err);

                     // Saving friendUpdate Count
                     else {

                         constCount.set('friendUpdateCount',constCount.friendUpdateCount + 1 );

                         constCount.set('chatUpdateCount',constCount.chatUpdateCount + 1);

                         constCount.save(function (err,doc) {

                             if(err)
                                 console.log('Error while saving friendupdate  ' + err);

                             else {
                              //3   console.log('friendUpdate Saved  ' + doc.friendUpdateCount);
                             }
                         });

                     }
                     
                 });

             }
          });
};

exports.total = function (req,res) {

    var info = { arr:[],chats:[] ,updates:0};

    var changed = 1;
    var check = 0;

               // console.log(constCount.chatUpdateCount + '  '  + constCount.friendUpdateCount);
            if(req.cookies.chatUpdated >=0 && req.cookies.chatUpdated < constCount.chatUpdateCount)
            {
             //4   console.log('Chat updating sending message');
                
                info.updates = info.updates + 10 ;

                Message.find({chatters: {$in: [req.session.name]}}).exec(function (err, docs) {

                    if (err)
                        console.log('Error in finding total no. of chats ' + err);

                     else if(docs.length === 0 ){
                        console.log('Length zero of chatting in chat db with user ' + req.session.name);
                    }   
                        
                    else {

                        var fnd;

                        for (var i in docs) {

                            if (docs[i].chatters[0] === req.session.name)
                                fnd = docs[i].chatters[1];

                            else
                                fnd = docs[i].chatters[0];

                       //5     console.log('chat with  = ' + req.body.chatWith);
                            
                            if (req.body.chatWith === fnd) {

                                if (req.cookies.totalChats && req.cookies.totalChats < docs[i].total) {

                                    if(docs[i].chatters.indexOf(req.session.name) === 0 )              // to update the number of read messages in ongoing chat
                                        docs[i].set('firstMsgRead',docs[i].total);

                                    else
                                        docs[i].set('secondMsgRead',docs[i].total);


                                    docs[i].save(function (err) {

                                        if(err)
                                            console.log('Error saving msgRead in database for ' + req.session.name);

                                        else {
                                        //6    console.log('Updated msgRead for the user ' + req.session.name);
                                        }

                                    });
                                    
                                    for (var j = req.cookies.totalChats; j < docs[i].total; j++) {

                                        info.chats.push({
                                            msg: docs[i].chats[j].msg,
                                            num: docs[i].chats[j].num
                                        });

                                    }
                                }

                                res.cookie('totalChats', docs[i].total);

                            }
                                
                                if(docs[i].chatters.indexOf(req.session.name) === 0 ){
                                    info[fnd] = docs[i].total - docs[i].firstMsgRead ;
                                }
                                
                                else{
                                    info[fnd] = docs[i].total - docs[i].secondMsgRead ;
                            }

                          //7  console.log(info);
                            
                        }

                        res.cookie('chatUpdated',constCount.chatUpdateCount);
                        
                        if(req.cookies.friendValue >=0 )
                        {
                            if(req.cookies.friendValue == constCount.friendUpdateCount + constCount.infoUpdateCount) {
                                changed = 0;
                                // console.log(constCount.friendUpdateCount + constCount.infoUpdateCount);
                            }
                            else
                                changed = 1;
                        }

                        res.cookie('friendValue',constCount.friendUpdateCount + constCount.infoUpdateCount);

                        if(changed) {   // if change in users database then only list of all users will be sent

                            // console.log('I am updatded');

                            info.updates = info.updates + 1;

                            Friend.find().exec(function (err, docs) {
                                if (err)
                                    console.log('Error in finding all friends  ' + err);

                                else {
                                    var arr = [];

                                    for (var i in docs) {
                                        if (docs[i].name != req.session.name)
                                            info.arr.push({
                                                name: docs[i].name,
                                                online: docs[i].online,
                                                status: docs[i].status
                                            });
                                    }

                                    res.cookie('fnd',docs.length - 1);

                                //8    console.log('friend data send');

                                    res.send(info);
                                }
                            });

                        }

                        else{
                            res.send(info);
                        }

                    }

                });

            }

    else{
                res.cookie('chatUpdated',constCount.chatUpdateCount);

                if(req.cookies.friendValue >=0 )
                {
                    if(req.cookies.friendValue == constCount.friendUpdateCount + constCount.infoUpdateCount) {
                        changed = 0;
                       // console.log(constCount.friendUpdateCount + constCount.infoUpdateCount);
                    }
                    else
                        changed = 1;
                }

                res.cookie('friendValue',constCount.friendUpdateCount + constCount.infoUpdateCount);

                if(changed) {   // if change in users database then only list of all users will be sent
                    
                   // console.log('I am updatded');

                    info.updates = info.updates + 1;

                    Friend.find().exec(function (err, docs) {
                        if (err)
                            console.log('Error in finding all friends  ' + err);

                        else {
                            var arr = [];

                            for (var i in docs) {
                                if (docs[i].name != req.session.name)
                                    info.arr.push({
                                        name: docs[i].name,
                                        online: docs[i].online,
                                        status: docs[i].status
                                    });
                            }

                            res.cookie('fnd',docs.length - 1);

                         //9   console.log('friend data send');

                            res.send(info);
                        }
                    });

                }

                else{
                    res.send(info);
                }

            }

};

exports.offline = function (name) {
    Friend.findOne({name:name})
        .exec(function (err,doc) {
            if(err || !doc) {
                console.log(' Friend is not found in database ' + err);
            }

            else {
                doc.set('online','false',Boolean);

                doc.save(function (err) {
                    if(err)
                        console.log('Error saving new friend offline info '  + err);
                   
                    // Saving friendUpdate Count
                    else {

                        constCount.set('friendUpdateCount',constCount.friendUpdateCount + 1);

                        constCount.save(function (err,doc) {

                            if(err)
                                console.log('Error while saving friendupdate  ' + err);

                            else {
                             //10   console.log('friendUpdate Saved  ' + doc.friendUpdateCount);
                            }
                        });

                    }
                    
                });

            }
        });
};


exports.totalRemove = function (name) {
    Friend.findOne({name:name})
        .exec(function (err,doc) {
            if(err || !doc) {
                console.log(' Friend is not found in database ' + err);
            }

            else {
                doc.remove(function (err,deldoc) {
                    if(err)
                    console.log('Error deleting user from Friend collection ' + err);
                    
                    else {
                        
                    //11    console.log(deldoc.name + '  user Deleted from Friend collection ');

                        Message.find({chatters: {$in: [name]}}).exec(function (err, chatdocs) {

                            if(err || !chatdocs.length)
                                console.log('Error while finding user\'s  chat database');

                            else{
                               for(var i in chatdocs) {

                                   chatdocs[i].remove(function (err) {
                                       if (err)
                                           console.log('Error while removing user\'s  chat database');

                                       else {

                                           //15  console.log('Chat Databse deleted for ' + name );
                                           // Saving friendUpdate Count
                                           constCount.set('friendUpdateCount', constCount.friendUpdateCount + 1);

                                           constCount.save(function (err, doc) {

                                               if (err)
                                                   console.log('Error while saving friendupdate  ' + err);

                                               else {
                                                   //12      console.log('friendUpdate Saved  ' + doc.friendUpdateCount);
                                               }
                                           });

                                       }

                                   });

                               }

                            }

                        });
                    }
                });
            }
        });
};

exports.friendupdate = function (name,status) {

    Friend.findOne({name:name})
        .exec(function (err,doc) {
            if(err || !doc) {
                console.log(' Friend is not found in database for status updation' + err);
            }

            else {
              doc.set('status',status);
                doc.save(function (err) {
                   if(err)
                       console.log('error while saving changed status ' + err);
                   
                   // Saving infoUpdate Count
                   else {
                       constCount.set('infoUpdateCount',constCount.infoUpdateCount + 1);
                       constCount.set('chatUpdateCount',constCount.chatUpdateCount + 1);
                       
                       constCount.save(function (err,doc) {

                           if(err)
                               console.log('Error while saving infoupdate  ' + err);

                           else {
                            //13   console.log('infoUpdate Saved  ' + doc.infoUpdateCount);
                           }
                       });
                   }

                });
            }
        });

};

module.exports.chatupdatecount = function () {

    constCount.set('chatUpdateCount',constCount.chatUpdateCount + 1);

    constCount.save(function (err,doc) {

        if(err)
            console.log('Error while saving chatupdate  ' + err);

        else {
         //14   console.log('chatUpdate Saved  ' + doc.chatUpdateCount);
        }
    });
    
};

/*
 var MongoClient = require('mongodb').MongoClient;


 // checking for online status left on due to session ending
 Friend.find({online:true}).exec(function (err,docs) {

 if (err || !docs.length)
 console.log(' Error in opening friend db or no user is found online for checking real online status');

 else {

 for (var i in docs) {

 console.log('checking for onlie truth for user  ' + docs[i].name);

 MongoClient.connect("mongodb://127.0.0.1/", function (err, db) {

 if (err)
 console.log('Opening DataBase Error ' + err);

 else {

 var DBase = db.db("auth");

 DBase.collection('session', function (err, Ses) {

 if (err)
 console.log('Error opening session collection using mongo client');

 else {

 Ses.find({name:docs[i].name},function (err,userdoc) {

 if(err)
 console.log('Error in finding user in session db using mongo');

 else if(!userdoc)
 {
 docs[i].set('online','false',Boolean);

 docs[i].save(function (err) {
 if (err)
 console.log('Error saving new friend offline info ' + err);

 // Saving friendUpdate Count
 else {
 constCount.set('friendUpdateCount',constCount.friendUpdateCount + 1);

 if(i == docs.length - 1 )
 db.close();
 }

 });


 }

 });


 }

 });

 }


 });


 }
 }

 });


 // asynchronous check for correct amount of online users is going on 

 */
 
