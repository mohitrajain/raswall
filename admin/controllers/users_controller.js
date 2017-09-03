var mongoose = require('mongoose');
var crypto = require('crypto');
var fs = require('fs');

function hashPW(pwd){
    return crypto.createHash('sha256').update(pwd).
    digest('base64').toString();
}

var User = mongoose.model('userCollection');

exports.home = function (req,res) {
    if(req.session.name) {
        
        User.findOne({username:req.session.name})
            .exec(function (err,doc) {
                
                if(err || !doc){
                    req.session.msg = 'Database Connectivity Error';
                    res.redirect('/logout');
                    console.log('Error occured while getting user data for Home ' + err);
                }

                else {
                    res.render('home', {username: req.session.name, msg: req.session.msg,email:doc.email,status:doc.status,country:doc.country});
                }
            });
    }   
    else
        res.redirect('/login');
    };


exports.login = function (req,res) {
        console.log(req.body.uname + '  ' + req.body.psw);
        User.findOne({username:req.body.uname })
            .exec(function (err,doc) {
           if(err || !doc) {
               console.log('finding User name while logging in :' + err);
               req.session.msg = 'Wrong Password or Username  !! ';
               var login= fs.readFileSync('/root/Downloads/softChat-master/views/login.html', 'utf8');
               login = login.replace("{alert}",req.session.msg);
               res.writeHead(200,{'Content-Type': 'text/html'});
               res.end(login);
           } 
           else{
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
                   var login= fs.readFileSync('/root/Downloads/softChat-master/views/login.html', 'utf8');
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
        var user = new User({
                username: req.body.username,
                hashpasswd: hashPW(req.body.pass.toString())
            }
        );

        user.save(function (err) {
            if (err) {

                if (err.errmsg.indexOf('username') >= 0)
                    req.session.msg2 = 'Username already exist';

                var signup= fs.readFileSync('/root/Downloads/softChat-master/views/signup.html', 'utf8');
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
        var signup= fs.readFileSync('/root/Downloads/softChat-master/views/signup.html', 'utf8');
        signup = signup.replace("{alert}",req.session.msg2);
        res.writeHead(200,{'Content-Type': 'text/html'});
        res.end(signup);
    }

};
    
exports.editProfile= function (req,res) {
    
                        if(req.session.name) {
                            
                            User.findOne({username:req.session.name})
                                .exec(function (err,doc) {
                            
                                    if(err || !doc){
                                        req.session.msg = 'Database Connectivity Error';
                                        res.redirect('/home');
                                    console.log('Error occured while getting user profile  ' + err);   
                                    }
                                    
                                    else {
                                        req.session.msg1 = req.session.msg1 || '* Change the Field You Want';
                                        //var profile= fs.readFileSync('/root/Downloads/softChat-master/views/editProfile.html', 'utf8');
                                        //profile = profile.replace("{username}",req.session.name);
                                        //res.writeHead(200,{'Content-Type': 'text/html'});
                                        //res.end(profile);
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
    
            User.findOne({username:req.session.name})
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
    if(req.session.name){
        
        User.findOne({username:req.session.name})
            .exec(function (err,doc) {
                if(err || !doc){
                    req.session.msg = 'Database Connection Problem';
                    res.redirect('/editProfile');
                }
                else{
                    
                    doc.remove(function (err,deldoc) {
                       
                        if(err || !deldoc){
                            req.session.msg = 'Problem in Deleting User';
                            res.redirect('/editProfile');
                        }
                        else{
                            res.cookie('msg','Account Deleted  for User :  ' + deldoc.username);
                            res.redirect('/logout');
                        }
                        
                    });
                    
                }
                
            });
        
    }        
    else 
    res.redirect('/login');
    
};

