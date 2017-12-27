var express = require('express');

module.exports = function (app) {

  var users = require('./users_controller');

  app.use('/',express.static('./'));
  
  app.get('/',function (req,res) {
    if(req.session.name)
        res.redirect('/home');
    
    else{
    /*  setInterval(function () {
        console.log(req.sessionID);
      },10000);*/
      req.session.msg = 'Please Login here';
        res.redirect('/login');
    } 
  });
  
  app.get('/login',function (req,res) {
    if(req.session.name)
      res.redirect('/home');

    else{
      if(req.cookies.msg)
      req.session.msg = req.cookies.msg;
      else
        req.session.msg = req.session.msg || 'Login To Continue' ;

      if(req.cookies.msg)
          res.clearCookie('msg');

      res.render('login');
    }
  });

  app.get('/logout',function (req,res) {
    if(req.session.name) {
      if(!req.cookies.msg)
        res.cookie('msg','Successfully Logged Out');
      req.session.destroy(function () {
            res.redirect('/login');
      });
    }
    else{
      res.redirect('/login');
    }
    
  });
  
  app.get('/signup',function (req,res) {
    if(req.session.name) {
      req.session.msg = 'You are Already Logged In';
      res.redirect('/home');
    }

    else{
      req.session.msg2 =  req.session.msg2 || '* All Fields are Mandatory';
      res.render('signup');
    }
    
    
  });

app.get('/home', users.home);
app.post('/login',  users.login);
app.post('/signup', users.signup);
app.get('/editProfile', users.editProfile);
app.post('/editProfile', users.saveProfile);

app.get('/deleteUser', users.deleteUser);
app.post('/addUser', users.addUser);
app.get('/getUsers', users.getUsers);
app.get('/saveUser', users.saveUser);
app.get('/getDistinctCategories', users.getDistinctCategories);

app.post('/addWeblist', users.addWeblist);
app.get('/getWeblists', users.getWeblists);
app.get('/deleteWeblists', users.deleteWeblists);
app.get('/saveWeblists', users.saveWeblists);

app.post('/addCategory', users.addCategory);
app.get('/getDistinctWebLists', users.getDistinctWebLists);
app.get('/getCategories', users.getCategories);
app.get('/saveCategory', users.saveCategory);
app.get('/deleteCategory', users.deleteCategory);

app.get('/getActiveSessions', users.getActiveSessions);


};