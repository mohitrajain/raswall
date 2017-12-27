var mongoose = require('mongoose');
var crypto = require('crypto');
var fs = require('fs');
var url = require('url');

function hashPW(pwd){
    return crypto.createHash('sha256').update(pwd).
    digest('base64').toString();
}

var admins = require('./users_model').admins;
var users = require('../db').users;
var weblist = require('../db').WebLists;
var category = require('../db').categories;
var authSessions = require('../db').authSessions;

var homeHTML = fs.readFileSync(__dirname+'/views/home.html','utf8');
var activeSessionHTML = fs.readFileSync(__dirname+'/views/getActiveSession.html','utf8');

exports.home = function (req,res) {
    if(req.session.name) {
        
        admins.findOne({username:req.session.name})
            .exec(function (err,doc) {
                
                if(err || !doc){
                    req.session.msg = 'Database Connectivity Error';
                    res.redirect('/logout');
                    console.log('Error occured while getting user data for Home ' + err);
                }

                else {
                    res.render('home');
                }
            });
    }   
    else
        res.redirect('/login');
    };


exports.login = function (req,res) {
        console.log(req.body.uname + '  ' + req.body.psw);
        admins.findOne({username:req.body.uname })
            .exec(function (err,doc) {
           if(err || !doc) {
               console.log('finding User name while logging in :' + err);
               req.session.msg = 'Wrong Password or Username  !! ';
               var login= fs.readFileSync(__dirname+'/views/login.html', 'utf8');
               login = login.replace("{alert}",req.session.msg);
               res.writeHead(200,{'Content-Type': 'text/html'});
               res.end(login);
           } 
           else{
               console.log("hassPass = " + doc.hashpasswd)
               if(doc.hashpasswd === hashPW(req.body.psw.toString())){
                   console.log('Password match for :  ' + req.sessionID);
                   req.session.regenerate(function () {

                       req.session.userid = doc.id;
                       req.session.name = doc.username;


                       req.session.msg = 'Logged in !!';  
                       res.redirect('/home');
                   });

               }
               else{
                   console.log('Password  Wrong');
                   req.session.msg = 'Wrong Password :' + req.body.ucname;
                   var login= fs.readFileSync(__dirname+'/views/login.html', 'utf8');
                   login = login.replace("{alert}",req.session.msg);
                   res.writeHead(200,{'Content-Type': 'text/html'});
                   res.end(login);
               } 
           }

        });

};


exports.signup = function (req,res) {

    console.log('request came ' + req.body.username +"  "+req.body.pass+" "+req.body.passr);

    if(req.body.pass === req.body.passr){
        console.log("good");
        var user = new admins({
                username: req.body.username,
                hashpasswd: hashPW(req.body.pass.toString())
            }
        );

        user.save(function (err) {
            if (err) {

                if (err.errmsg.indexOf('username') >= 0)
                    req.session.msg2 = 'Username already exist';

                var signup= fs.readFileSync(__dirname+'/views/signup.html', 'utf8');
                signup = signup.replace("{alert}",req.session.msg2);
                res.writeHead(200,{'Content-Type': 'text/html'});
                res.end(signup);

            }
            else {
                req.session.userid = user.id;
                req.session.name = user.username;

                req.session.msg = 'SuccessFully Signed Up';
                res.redirect('/home');
            }

        });
    }else{
        console.log("not");
        req.session.msg2 = 'Please enter same password';
        var signup= fs.readFileSync(__dirname+'/views/signup.html', 'utf8');
        signup = signup.replace("{alert}",req.session.msg2);
        res.writeHead(200,{'Content-Type': 'text/html'});
        res.end(signup);
    }

};
    
exports.editProfile= function (req,res) {
    
    if(req.session.name) {
                            
        admins.findOne({username:req.session.name})
            .exec(function (err,doc) {
                            
                if(err || !doc){
                    req.session.msg = 'Database Connectivity Error';
                    res.redirect('/home');
                    console.log('Error occured while getting user profile  ' + err);
                }
                                    
                else {
                    req.session.msg1 = req.session.msg1 || '* Change the Field You Want';

                    res.render('editProfile', {username: req.session.name,msg: req.session.msg1});
                }
                            
            });
    }
    else{
        req.session.msg = 'Login Please ';
        res.redirect('/login'); //passing msg to the login
    }
};

exports.saveProfile = function (req,res) {
    
            admins.findOne({username:req.session.name})
                .exec(function (err,doc) {
                   if(err || !doc){
                       req.session.msg1 = 'Database Connection Problem ';
                       res.redirect('/editProfile');
                    console.log('error While finding username  ' + err);
                   }
                    
                    else {


                       if(req.body.value > 1 ){
                           console.log('password changed  new password  =  ' + req.body.password.toString());
                           doc.set('hashpasswd',hashPW(req.body.password.toString()));
                       }

                       doc.save(function (err) {

                           if(err) {
                               req.session.msg1 = 'Error Saving Documents ';
                               res.redirect('/editProfile');
                               console.log('error saving the document  ' + err);
                           }

                           if(req.body.value > 1 ){
                               res.cookie('msg','Password Changed !! Please Login To Continue'); 
                              res.redirect('/logout');
                           }
                           else {
                               req.session.msg = 'Changes Saved  Successfully !';
                               res.redirect('/home');   // msg for home also
                           }
                           });
                   }
                    
                });

};

/**************************************************** User Panel starts ***************************************************/

exports.deleteUser = function (req,res) {
    console.log("delete user: "+req.query.user);

    users.deleteOne({_id: req.query.user},function (err) {
        if(err){
            console.log(" Error in deleting User ");
            res.status(200).send(" Error in deleting User ");
        }else{
            res.status(200).send();
        }
    })
    
};

exports.getUsers = function (req,res) {
    console.log(" Show Users ");
    
    users.find(function (err,data) {
        if(err){
            var msg = " DB Error in finding User ";
            console.log(msg);
            res.status(200).send(msg);
        }else{
            if(data.length > 0){
                console.log(" users found ");
                var obj = data;

                console.log(JSON.stringify(data));
                res.status(200).send(JSON.stringify(data));
            }else{
                var msg = " NO USERS ";
                console.log(msg);
                res.status(200).send(msg);
            }
        }
    });
};

exports.saveUser = function (req,res) {
    console.log("save user"+req.query.username);

    users.update({_id: req.query.id},{ $set :  { username: req.query.username, password: req.query.password, category: req.query.category, ctTime: new Date()} }, function (err,data) {
        if(err){
            var msg = "DB Error";
            res.status(200).send(msg);
        }else{
            console.log("updated: ");

            users.find(function (err,doc) {
                if(err){
                    var msg = "User details updated but error in displaying";
                    res.status(200).send(msg);
                }
                else{
                    console.log("new: "+doc);
                    res.status(200).send(JSON.stringify(doc));
                }
            })

        }
    });
};

exports.getDistinctCategories = function (req,res) {
    category.find().distinct('catgName',function (err,doc) {
       if (err)
           console.log(err);
       else{
           console.log(doc);
           res.status(200).send(doc);
       }
    });
}

exports.addUser = function(req,res){
    console.log(" add user: "+req.body.username+ "pass: "+req.body.password+' Category: '+req.body.category);


    var user= new users({
        username: req.body.username,
        password: req.body.password,
        ctTime : new Date(),
        category: req.body.category
    });

    user.save(function (err, data) {
        if(err){
            var msg= " error in saving new user to db: "

            if(err.code==11000){
                msg= " Duplicate entry error";
            }

            console.log(msg+err);

        }else{
            var msg= " new user is successfully saved ";
        }

        res.status(200).send(msg);
    });
};

/**************************************************** User Panel ends ***************************************************/


/**************************************************** Weblists Panel starts ***************************************************/


exports.addWeblist = function(req,res){
    console.log(" add weblist: "+req.body.listName+ " Blacklist: "+ req.body.blackList);

    var list= new weblist({
        listName: req.body.listName,
        blackList: req.body.blackList.split(',')
    });

    list.save(function (err,data) {
       if(err){
           var msg = "weblist saving err/Duplicate entry ";

           if(err.code==11000){
               msg= " Duplicate entry error";
           }

           console.log(msg+err);

           res.status(200).send(msg);

       }else{
           var msg= " new weblist is successfully saved ";
           console.log(msg);

           res.status(200).send(msg);
       }
    });
};


exports.getWeblists = function (req,res) {
    weblist.find(function (err,data) {
        if(err){
            var msg = " DB Error in finding Weblists ";
            console.log(msg);
            res.status(200).send(msg);
        }else{
            if(data.length > 0){
                console.log(" Weblists found ");
                var obj = data;

                console.log(JSON.stringify(data));
                res.status(200).send(JSON.stringify(data));
            }else{
                var msg = " NO WEBLISTS ";
                console.log(msg);
                res.status(200).send(msg);
            }
        }
    });
};



exports.saveWeblists = function (req,res) {
    console.log("save weblists"+req.query.listName);

    weblist.update({_id: req.query.id},{ $set :  { listName: req.query.listName, blackList: req.query.blackList.split(',') } }, function (err,data) {
        if(err){
            var msg = "DB Error";
            res.status(200).send(msg);
        }else{
            console.log("updated: ");

            weblist.find(function (err,doc) {
                if(err){
                    var msg = "Weblists details updated but error in displaying";
                    res.status(200).send(msg);
                }
                else{
                    console.log("new: "+doc);
                    res.status(200).send(JSON.stringify(doc));
                }
            })
        }
    });
};

exports.deleteWeblists = function (req,res) {
    console.log("delete weblists: "+req.query.listName);

    weblist.deleteOne({_id: req.query.listName},function (err) {
        if(err){
            console.log(" Error in deleting weblists ");
            res.status(200).send(" Error in deleting Weblists ");
        }else{
            res.status(200).send();
        }
    })

};

/**************************************************** Weblists Panel ends ***************************************************/

/**************************************************** Category Panel start ***************************************************/

exports.getDistinctWebLists = function (req,res) {
    weblist.find().distinct('listName',function (err,doc) {
        if (err)
            console.log(err);
        else{
            console.log(doc);
            res.status(200).send(doc);
        }
    });
};

exports.addCategory = function(req,res){
    console.log(" add category: "+req.body.category+ ' maxTime: '+req.body.maxTime+' EnrolledList: '+req.body.enrolledLists);

   var catg = new category({
       catgName : req.body.category,
       maxTime : req.body.maxTime,
       enrolledLists : req.body.enrolledLists
   });

   catg.save(function (err,data) {
       if(err){
           var msg= " error in saving new category to db: ";

           if(err.code==11000){
               msg= " Duplicate entry error";
           }

           console.log(msg+err);

       }else{
           var msg= " new category is successfully saved ";
       }

       res.status(200).send(msg);
   });
};


exports.deleteCategory = function (req,res) {
    console.log("delete category: "+req.query.category);

    category.deleteOne({_id: req.query.category},function (err) {
        if(err){
            console.log(" Error in deleting category ");
            res.status(200).send(" Error in deleting category ");
        }else{
            res.status(200).send();
        }
    })

};


exports.saveCategory = function (req,res) {
    console.log("save category"+req.query.catgName+"enrolledList: "+req.query.enrolledLists);

    console.log(typeof(req.query.enrolledLists));
    category.update({_id: req.query.id},{ $set :  { catgName: req.query.catgName, maxTime: req.query.maxTime, enrolledLists: req.query.enrolledLists } }, function (err,data) {
        if(err){
            var msg = "DB Error";
            res.status(200).send(msg);
        }else{
            console.log("updated: ");

            category.find(function (err,doc) {
                if(err){
                    var msg = "Category details updated but error in displaying";
                    res.status(200).send(msg);
                }
                else{
                    console.log("new: "+doc);
                    res.status(200).send(JSON.stringify(doc));
                }
            })
        }
    });
};


exports.getCategories = function (req,res) {
    console.log(" Show Categories ");

    category.find(function (err,data) {
        if(err){
            var msg = " DB Error in finding Categories ";
            console.log(msg);
            res.status(200).send(msg);
        }else{
            if(data.length > 0){
                console.log(" Categories found ");
                var obj = data;

                console.log(JSON.stringify(data));
                res.status(200).send(JSON.stringify(data));
            }else{
                var msg = " NO CATEGORIES ";
                console.log(msg);
                res.status(200).send(msg);
            }
        }
    });
};

/**************************************************** Category Panel ends ***************************************************/

exports.getActiveSessions = function (req,res) {

    if(req.query.drop != undefined){
        console.log("drop= "+req.query.drop);

        authSessions.deleteOne({_id:req.query.drop},function (err, data) {
            if(err){
                console.log(" DB error in deleting");
                res.status(200).send(" DB error in deleting ");
            }else{
                console.log("removed");
                findSession(res);
            }
        });
    }else {

        console.log("req= "+req.query);
        findSession(res);
    }

};

function findSession(res) {
    authSessions.find(function (err, data) {

        if(err){
            var msg = " DB Error in finding all the Sessions ";
            console.log(msg);
            res.status(200).send(msg);
        }else{
            if(data.length>0){
                var obj= data;
                console.log("Active users are present");
                res.status(200).send(JSON.stringify(obj));
            }else{
                var msg = " No active Sessions ";
                console.log(msg);
                res.status(200).send(msg);
            }
        }

    });
}




