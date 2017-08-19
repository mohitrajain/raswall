var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var fs = require('fs');
var url =require('url');

app.use(express.static('public'));

// settings for https
/*
var https = require('https');
var privateKey  = fs.readFileSync('sslcerts/loginkey.pem').toString();
var certificate = fs.readFileSync('sslcerts/logincert.pem').toString();

// credentials for https
var credentials = {
                    key: privateKey,
                    cert: certificate};

var httpsServer = https.createServer(credentials, app);
httpsServer.listen(10000);
*/

var urlencodedParser = bodyParser.urlencoded({extended:false});

// importing model of collections from db.js
var httpRequests = require('./db').httpRequests;
var users = require('./db').users;
var authSessions = require('./db').authSessions;
var categories = require('./db').categories;
var faults = require('./db').faults;

// defining login , keepalive etc webpages string
var loginHTML = fs.readFileSync(__dirname + '/login.html', 'utf8');
var keepaliveHTML = fs.readFileSync(__dirname + '/keepalive.html', 'utf8');
var unauthHTML = fs.readFileSync(__dirname + '/404.html', 'utf8');
var logoutHTML = fs.readFileSync(__dirname + '/logout.html', 'utf8');
var warningHTML = fs.readFileSync(__dirname + '/warning.html', 'utf8');

app.listen(10000);

// this function logs two kinds of events one that is related to the whole raswall and another is user specific events
// LM stands for login manager
function logger(object,event){

    var ti = new Date();
    // for main logs
    if(event == 'main'){
        console.log('Main ' + ti.toUTCString() + ' LM ' + object.type + ' : ' + object.data );
        //fs.writeFile('/var/log/raswall/main.log',ti.toUTCString() + ' LM ' + object.type + ' : ' + object.data + '\n', options,function(err){
        //});
    }
    // for user specfic logs
    else if(event == 'user'){
        console.log('user ' + object.username + ' '+ ti.toUTCString() + ' LM ' + object.type + ' : ' + object.data );
        //fs.writeFile('/var/log/raswall/users/'+object.username ,ti.toUTCString() + ' LM ' + object.type + ' : ' + object.data + '\n', options,function(err){
        //});
    }
    // for suspicious login http requests
    else if(event == 'suspicious'){
        console.log('suspicious ' + ti.toUTCString() + ' LM ' + object.type + ' : ' + object.data );
        //fs.writeFile('/var/log/raswall/suspicious.log' ,ti.toUTCString() + ' LM ' + object.type + ' : ' + object.data + '\n', options,function(err){
        //});
    }
}

// function to handle db errors in login manager
function Dberror(req,res,err,type) {
    res.send("Internal Server Error \nDatabase not working properly \nContact your Admin \nTry again after sometime",500);
    logger({data:err,type:type},'main');
}


// function to redirect non-valid urls to correct login url
function redirect(req,res) {

    var requestedUrl = 'http://nitdelhi.ac.in';

    var obj = {
        'req_url': requestedUrl,
        'ip': req.ip.split(':')[req.ip.split(':').length - 1]
    };

    var requestObj = new httpRequests(obj);
    requestObj.save(function (err,doc) {
        if(err){
            Dberror(req,res,err);
        }
        else{
        res.writeHead(303,{Location:"http://10.20.48.1:10000/login?"+doc.id});// temporarily move to login_manager
        res.end();
        }
    });
}

// this will be reported by squid in form of redirection
app.get('/dberror',function (req,res) {
    res.send("Internal Server Error \nDatabase not working properly \nContact your Admin \nTry again after sometime",500);
});

app.get('/login',function(req,res){

    var magic = url.parse(req.url).query;
    // split the ip address to ipv4 only as req.ip is of form ipv6:ipv4
    var req_ip = req.ip.split(":");
    req_ip = req_ip[req_ip.length - 1];

    authSessions.findOne({ip:req_ip},function(err,Doc) {
        if (err)
            Dberror(req, res, err);

        else if (Doc) {
            res.send(" You are still a NOOBIE!!! ",404);
            logger({data: " Already logged in  " + req.ip + 'url : ' + req.protocol + '://' + req.get('Host') + req.url,
                type: 'loginGet'
            }, 'suspicious');
        }
        else {
            httpRequests.findById(magic, function (err, data) {
                // if error due is due to magic number
                if (err){

                    if(err.kind != 'ObjectId')
                        Dberror(req, res, err);
                // if magic is not found at id number , shows that someone has forged the magic number
                else  {
                        redirect(req, res);
                        console.log('message from here ');
                        logger({
                            data: " magic no not found " + req.ip + ' url : ' + req.protocol + '://' + req.get('Host') + req.url,
                            type: 'loginGet'
                        }, 'suspicious');
                        //console.log(" magic no not found ");
                    }
                                }
                    else {
                    if (data) {

                        //check if requested ip is same as source ip . this is to prevent spoofing of source ip address
                        if (data.ip == req_ip) {
                            res.writeHead(200, {'Content-Type': 'text/html'});
                            res.end(loginHTML);
                            logger({
                                data: " Request login page id " + data.id + ' ip ' + req_ip,
                                type: 'LoginReq'
                            }, 'main');
                            //console.log(data.id);
                        }
                        // check above if condition
                        else {
                            redirect(req, res);
                            logger({
                                data: " IP not found req_ip " + req_ip + ' data.ip ' + data.ip + ' url : ' + req.protocol + '://' + req.get('Host') + req.url,
                                type: 'loginGet'
                            }, 'suspicious');
                        }
                    }

                }

            });
        }
    });

});

app.get('/keepalive',function(req,res){

    var magic = url.parse(req.url).query;
    var req_ip = req.ip.split(":");
    req_ip= req_ip[req_ip.length-1];

    authSessions.findOne( { ip: req_ip  }, function(err,data){
        if(err)
            Dberror(req,res,err);
            //console.log(err);

        if(data) {
            // preserving keepalive for future use .
            var keepaliveHTMLCopy = keepaliveHTML;
            keepaliveHTMLCopy = keepaliveHTML.replace('{NewTab}', data.req_url);
            keepaliveHTMLCopy = keepaliveHTMLCopy.replace('{Refresh}', "http://10.20.48.1:10000/Refresh?" + data.magic);
            // incase if user requests for keepalive page at later stage , so time should be updated
            var leftTime = Math.round((data.maxTime *1000 - (new Date() - data.loginTime))/1000);
            keepaliveHTMLCopy = keepaliveHTMLCopy.replace('{timer}', leftTime);
            keepaliveHTMLCopy = keepaliveHTMLCopy.replace('{Logout}', "http://10.20.48.1:10000/logout?" + data.magic);
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.end(keepaliveHTMLCopy);
            logger({data: " keepalive get request from " + req.ip ,
                    type: 'keepalive',
                    username:data.username
                    }, 'user');
        }
            // if no matching data is found in database
        else{
            logger({data:" keepalive not found " + req.ip,
                type:'keepalive'
            },'suspicious');
            redirect(req,res);
        }
    });

});

app.get('/Refresh',function (req,res) {
    var magic = url.parse(req.url).query;
    var req_ip = req.ip.split(":");
    req_ip= req_ip[req_ip.length-1];

    authSessions.find( { $and : [ { magic: magic }, { ip: req_ip } ] }, function (err, data) {
        if(err)
            Dberror(req,res,err);

        if(data.length==0){
            redirect(req,res);
            logger({data: " magic no not found " + req.ip + 'url : ' + req.protocol + '://' + req.get('Host') + req.url,
                    type: 'refresh'
                    }, 'suspicious');
        }else{
            authSessions.findOneAndUpdate( { $and : [ { magic: magic }, { ip: req_ip } ] }, { $set: { loginTime: new Date() } } ,function (err,doc) {
                if(err)
                    Dberror(req,res,err);
                else {
                    var keepaliveHTMLCopy = keepaliveHTML;
                    keepaliveHTMLCopy = keepaliveHTMLCopy.replace('{NewTab}', doc.req_url);
                    keepaliveHTMLCopy = keepaliveHTMLCopy.replace('{Refresh}', "http://10.20.48.1:10000/Refresh?" + doc.magic);
                    keepaliveHTMLCopy = keepaliveHTMLCopy.replace('{timer}', doc.maxTime);
                    keepaliveHTMLCopy = keepaliveHTMLCopy.replace('{Logout}', "http://10.20.48.1:10000/logout?" + doc.magic);

                    res.writeHead(200, {'Content-Type': 'text/html'});
                    res.end(keepaliveHTMLCopy);
                    logger({data: " Refresh request from " + req.ip + ' url ' + req.protocol + '://' + req.get('Host') + req.url,
                            type: 'refresh',
                            username:doc.username
                            }, 'user');
                }
            });
        }
    } );
});

// sending response page for warning request by client
app.get('/warning',function (req,res) {
    // all holding all query string parameters

    var warningHTMLCopy = warningHTML;
    warningHTMLCopy = warningHTMLCopy.replace("{URL}", req.query.url);
    warningHTMLCopy = warningHTMLCopy.replace("{group}", req.query.category);
    warningHTMLCopy = warningHTMLCopy.replace("{client ip}",req.query.ip);
    warningHTMLCopy = warningHTMLCopy.replace("{username}", req.query.username);
    warningHTMLCopy = warningHTMLCopy.replace("{category}", req.query.listname);
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(warningHTMLCopy);

});

app.get('/logout', function (req,res) {
    var magic = url.parse(req.url).query;
    var req_ip = req.ip.split(":");
    req_ip= req_ip[req_ip.length-1];

    authSessions.findOne({ ip: req_ip },function (err,data) {
        if(err)
            Dberror(req,res,err);

        else if(!data){
            redirect(req,res);
            logger({data: " user not logged in " + req.ip + ' url : ' + req.protocol + '://' + req.get('Host') + req.url,
                type: 'logout'
            }, 'suspicious');
        }
        else{
            authSessions.remove(  { ip: req_ip } , function(err){
                if(err)
                    Dberror(req,res,err);
                    
                else {
                    res.writeHead(200, {'Content-Type': 'text/html'});
                    res.end(logoutHTML);
                    logger({data: " logout request from " + req.ip  + ' url ' + req.protocol + '://' + req.get('Host') + req.url ,
                        type: 'logout',
                        username:data.username
                    }, 'user');
                }
            }); 
            
            
        }
    });
});


// malware check redirect handler
app.get('/malware',urlencodedParser,function (req,res) {

    console.log(url.parse(req.url).query);
    res.send('malware details '  + url.parse(req.url).query);

});

app.post('/login', urlencodedParser, function(req, res){
	var username,password,redir,magic;

    var req_ip = req.ip.split(":");
    req_ip= req_ip[req_ip.length-1];

	username= req.body.username;
	password= req.body.password;

	magic = url.parse(req.url).query;


    httpRequests.findById(magic, function (err,data) {
        if(err)
            Dberror(req,res,err,'DBerrorPostLoginHttpRequests 1');

        else if(!data){
            // redirect to login page
            //authSessions.find({},)
            redirect(req,res);
            logger({data: " magic no not found " + req.ip + ' url : ' + req.protocol + '://' + req.get('Host') + req.url,
                    type: 'loginPost'
                    }, 'suspicious');

        }

        else {
            var req_ip = req.ip.split(":");
            req_ip = req_ip[req_ip.length - 1];

            redir = data.req_url;

            //check if requested ip is same as source ip
            if (data.ip == req_ip) {

                //check users collection for authentication
                users.findOne({$and: [{username: username}, {password: password}]}, function (err, doc) {
                    if(err)
                        Dberror(req,res,err,'DBerrorPostLoginHttpRequests 1');

                    //Username and Password not found
                    if (!doc) {

                        //console.log(" Invalid username and password combination");
                        res.writeHead(302, {'Content-Type': 'text/html'});
                        // setting flag to indicate login fail in login.html

                        var loginHTMLCopy = loginHTML;
                        loginHTML = loginHTMLCopy.replace('{check}', "fail");
                        res.end(loginHTMLCopy);

                        logger({data: " username password not match " + req.ip + ' user : ' + username + ' password : ' + password ,
                                type: 'loginPost'
                                }, 'suspicious');

                    }
                    // Username and Password are correct
                    else {

                        categories.findOne({catgName:doc.category},function(err,docu){
                            if(err)
                                Dberror(req,res,err);
                            else{
                                var obj = {
                                    username: username,
                                    magic: magic,
                                    ip: req_ip,
                                    req_url: redir,
                                    category:doc.category,
                                    loginTime: new Date()
                                };
                                
                                obj.maxTime = docu.maxTime;

                                var sessionObj = new authSessions(obj);
                                sessionObj.save(function (err, session_data) {
                                    if (err)
                                        Dberror(req,res,err);

                                    else{
                                        httpRequests.deleteMany({ip: session_data.ip}, function (err) {
                                            if(err)
                                                Dberror(req,res,err,'DBerrorCheckSessionTimerauthSession 1');

                                            else{
                                                res.writeHead(302, {Location: "http://10.20.48.1:10000/keepalive?" + magic});
                                                res.end(keepaliveHTML);
                                                logger({data: " user authanticated " + req.ip + ' user ' + username + ' pass ' + password,
                                                    type: 'loginPost',
                                                    username: username
                                                }, 'user');
                                            }
                                        });

                                    } // else no error sessionObj.save

                                });     // sessionObj.save
                                
                                
                            }// else err categories.findOne
                        });// categories.findOne
                        
                    } // else when doc is present
                }); //users.findone
                
            }// if ip match
                
            // else for ip not match found
            else{
                res.send(" You are still a NOOBIE!!! ",404);
                logger({data: " Ip no not found " + req.ip + ' url : ' + req.protocol + '://' + req.get('Host') + req.url,
                        type: 'loginPost'
                        }, 'suspicious');
            }
        }
    });

});

var checkSessionTimer = setInterval(checkSession,10000);

function checkSession(){
	authSessions.find(function (err,docs) {
        if(err){
            logger({data:err,type:'DBerrorCheckSessionTimerauthSession 1'},'main');
            // different , err no reply must be sent
        }

		if(docs){
            console.log(docs.length);
			for(var i=0; i<docs.length;i++){
                    var dbTime = docs[i].loginTime;
                    var currTime = new Date();

                    if((currTime - dbTime)> (docs[i].maxTime * 1000)){
                    	authSessions.deleteOne(docs[i],function (err) {
                            if (err){
                                logger({data:err,type:'DBerrorCheckSessionTimerauthSession 2'},'main'); // different , err no reply must be sent
                            }
                            else{
                                logger({data: " user time over " + docs[i].category + ' maxtime was ' + docs[i].maxTime,
                                    type: 'timeOver',
                                    username: docs[i].username
                                }, 'user');
                            }
                        });
					}
			}
		}

    });

  /*  faults.find(function (err,docs) {
        if(err)
            logger({data:err,type:'DBerrorCheckSessionTimerfaults 1'},'main');
        else{
            for(var i=0; i<docs.length;i++){
                var dbTime = docs[i].accessTime;
                var currTime = new Date();

                if((currTime - dbTime)> (5000)){
                    authSessions.deleteOne(docs[i],function (err) {
                        if (err){
                            logger({data:err,type:'DBerrorCheckSessionTimerfaults 2'},'main'); // different , err no reply must be sent
                        }
                        else{
                            logger({data: " deleted faulty entry for url  " + docs[i].url + ' ip ' + docs[i].ip + ' username ' + docs[i].username ,
                                type: 'timeOverFaulty',
                            }, 'main');
                        }
                    });
                }
            }
        }

    });*/

};