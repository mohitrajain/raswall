var express = require('express');
var app = express();

var httpRequests = require('./db').httpRequests;

var port = process.env.PORT || 3000;


app.get(/.*/,function(req, res) {// accept all the get request with the /.*/ regular expression

    var requestedUrl = req.protocol + '://'+req.get('Host') + req.url;
    var ip = req.ip;

    
    console.log('requestedUrl : '+ requestedUrl);
    //console.log("host: "+ host);

       
    var obj = {
        'req_url': requestedUrl,
        'ip': ip
    };

    var requestObj = new httpRequests(obj);
    requestObj.save(function (err,doc) {
         if(err){
             console.log(err);
         }

         console.log("doc: "+doc.id);

         res.writeHead(302,{Location:"http://10.20.48.1:10000/login?"+doc.id});// temporarily move to login_manager
         res.end();
    });

});
app.listen(port,"10.20.48.1");