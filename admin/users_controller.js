var mongoose = require('mongoose');
var crypto = require('crypto');
var fs = require('fs');
var url = require('url');

function hashPW(pwd){
    return crypto.createHash('sha256').update(pwd).
    digest('base64').toString();
}

var admins = require('../db').admins;
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

               /* category.find({},{catgName:1,_id:0},function (err,doc) {
                    if(err){
                        console.log("DB Error in finding categories");
                        res.status(200).send("DB Error in finding categories");
                    }else{

                    }
                });*/
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


exports.addUser = function(req,res){
    console.log(" add user: "+req.body.username+ ' Category: '+req.body.category);

    users.find({category: req.body.category}, function (err, data) {
        if(err){

            var msg1 = " Database error ";
            console.log(msg1+err);
            var homeHTMLCopy = homeHTML;

            //split html in two parts first one having string to be replaced AND LOWER part is added to complete the page

            homeHTMLCopy =   homeHTMLCopy.split('<tagOfNoUse>')[0].replace('{add_user}',msg1) + homeHTMLCopy.split('<tagOfNoUse>')[1]  ;
            res.writeHead(200,{'Content-Type': 'text/html'});
            res.end(homeHTMLCopy);

        }else{
            if(data.length>0){
                console.log("category: "+data.category);


                var user= new users({
                    username: req.body.username,
                    password: req.body.password,
                    category: req.body.category,
                    ctTime : new Date(),
                });

                user.save(function (err, data) {
                    if(err){
                        var msg= " error in saving new user to db: "

                        if(err.code==11000){
                            msg= " Duplicate entry error";
                        }

                        console.log(msg+err);
                        var homeHTMLCopy = homeHTML;

                        //split html in two parts first one having string to be replaced AND LOWER part is added to complete the page

                        homeHTMLCopy =   homeHTMLCopy.split('<tagOfNoUse>')[0].replace('{add_user}',msg) + homeHTMLCopy.split('<tagOfNoUse>')[1]  ;
                        res.writeHead(200,{'Content-Type': 'text/html'});
                        res.end(homeHTMLCopy);

                    }else{
                        var msg= " new user is successfully saved ";
                        console.log(msg);
                        var homeHTMLCopy = homeHTML;

                        //split html in two parts first one having string to be replaced AND LOWER part is added to complete the page

                        homeHTMLCopy =   homeHTMLCopy.split('<tagOfNoUse>')[0].replace('{add_user}',msg) + homeHTMLCopy.split('<tagOfNoUse>')[1]  ;
                        res.writeHead(200,{'Content-Type': 'text/html'});
                        res.end(homeHTMLCopy);

                    }
                });
            }else{
                var msg2 = "category not found";
                console.log(msg2);
                var homeHTMLCopy = homeHTML;

                //split html in two parts first one having string to be replaced AND LOWER part is added to complete the page

                homeHTMLCopy =   homeHTMLCopy.split('<tagOfNoUse>')[0].replace('{add_user}',msg2) + homeHTMLCopy.split('<tagOfNoUse>')[1]  ;
                res.writeHead(200,{'Content-Type': 'text/html'});
                res.end(homeHTMLCopy);
            }
        }
    });
};



exports.addWeblist = function(req,res){
    console.log(" add weblist: "+req.body.listName+ " Blacklist: "+ req.body.blackList);

    var list= new weblist({
        listName: req.body.listName,
        blackList: req.body.blackList
    });

    list.save(function (err,data) {
       if(err){
           var msg = "weblist saving err/Duplicate entry ";

           if(err.code==11000){
               msg= " Duplicate entry error";
           }

           console.log(msg+err);

           var homeHTMLCopy = homeHTML;

           //split html in two parts first one having string to be replaced AND LOWER part is added to complete the page

           homeHTMLCopy =   homeHTMLCopy.split('<tagOfNoUse>')[0].replace('{add_weblist}',msg) + homeHTMLCopy.split('<tagOfNoUse>')[1]  ;
           res.writeHead(200,{'Content-Type': 'text/html'});
           res.end(homeHTMLCopy);

       }else{
           var msg= " new weblist is successfully saved ";
           console.log(msg);
           var homeHTMLCopy = homeHTML;

           //split html in two parts first one having string to be replaced AND LOWER part is added to complete the page

           homeHTMLCopy =   homeHTMLCopy.split('<tagOfNoUse>')[0].replace('{add_weblist}',msg) + homeHTMLCopy.split('<tagOfNoUse>')[1]  ;
           res.writeHead(200,{'Content-Type': 'text/html'});
           res.end(homeHTMLCopy);
       }
    });
};


exports.addCategory = function(req,res){
    console.log(" add category: "+req.body.catgName+ ' maxTime: '+req.body.maxTime+' EnrolledList: '+req.body.enrolledList);

    weblist.find({listName: req.body.catgName}, function (err, data) {
        if(err){
            var msg1 = " Database error ";
            console.log(msg1+err);
            var homeHTMLCopy = homeHTML;

            //split html in two parts first one having string to be replaced AND LOWER part is added to complete the page

            homeHTMLCopy =   homeHTMLCopy.split('<tagOfNoUse>')[0].replace('{add_category}',msg1) + homeHTMLCopy.split('<tagOfNoUse>')[1]  ;
            res.writeHead(200,{'Content-Type': 'text/html'});
            res.end(homeHTMLCopy);

        }else{
            if(data.length>0){
                console.log("ListName: "+data.listName);

                console.log(" BlackList: "+req.body.blackList.length);

                var enrolledlist = req.body.enrolledList.split(",");

                var catg= new category({
                    catgName: req.body.catgName,
                    maxTime: req.body.maxTime,
                    enrolledList : req.body.enrolledList
                });

                user.save(function (err, data) {
                    if(err){
                        var msg= " error in saving new category to db: "

                        if(err.code==11000){
                            msg= " Duplicate entry error";
                        }

                        console.log(msg+err);
                        var homeHTMLCopy = homeHTML;

                        //split html in two parts first one having string to be replaced AND LOWER part is added to complete the page

                        homeHTMLCopy =   homeHTMLCopy.split('<tagOfNoUse>')[0].replace('{add_category}',msg) + homeHTMLCopy.split('<tagOfNoUse>')[1]  ;
                        res.writeHead(200,{'Content-Type': 'text/html'});
                        res.end(homeHTMLCopy);
                    }else{
                        var msg= " new category is successfully saved ";
                        console.log(msg);
                        var homeHTMLCopy = homeHTML;

                        //split html in two parts first one having string to be replaced AND LOWER part is added to complete the page

                        homeHTMLCopy =   homeHTMLCopy.split('<tagOfNoUse>')[0].replace('{add_category}',msg) + homeHTMLCopy.split('<tagOfNoUse>')[1]  ;
                        res.writeHead(200,{'Content-Type': 'text/html'});
                        res.end(homeHTMLCopy);

                    }
                });
            }else{
                var msg2 = "category not found in weblist";
                console.log(msg2);
                var homeHTMLCopy = homeHTML;

                //split html in two parts first one having string to be replaced AND LOWER part is added to complete the page

                homeHTMLCopy =   homeHTMLCopy.split('<tagOfNoUse>')[0].replace('{add_category}',msg2) + homeHTMLCopy.split('<tagOfNoUse>')[1]  ;
                res.writeHead(200,{'Content-Type': 'text/html'});
                res.end(homeHTMLCopy);
            }
        }
    });
};

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
