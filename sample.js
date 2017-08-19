const readline = require('readline');
var process = require('process');
var fs = require('fs');

var authSessions = require('./db').authSessions;
var users = require('./db').users;
var httpRequests = require('./db').httpRequests;
var categories = require('./db').categories;
var webLists = require('./db').WebLists;
var faults = require('./db').faults;

// options for data entry in log file i.e. acl_log
var options = {encoding:'utf8', flag:'a'};

// flag for checking faulty url
var faulty = false;

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// function that will run on every request passed by squid on standard input
rl.on('line', function (answer) {
        logger(answer,'request');
	authCheck(answer);
    });


// this function logs many kinds of events like one that is related to the whole raswall and another is user specific events
// SQ stands for squid
function logger(object,event){

    var ti = new Date();
    // for main logs
    if(event == 'main'){
	fs.writeFile('/var/log/raswall/main.log',ti.toUTCString() + ' SQ ' + object.type + ' : ' + object.data + '\n', options,function(err){
           });
                        }
    // for user specfic logs 
    else if(event == 'user'){
    fs.writeFile('/var/log/raswall/users/'+object.username ,ti.toUTCString() + ' SQ ' + object.type + ' : ' + object.data + '\n', options,function(err){
           });
                            }

    else if(event == 'debug'){
    fs.writeFile('/var/log/raswall/debug.log' ,ti.toUTCString() + ' SQ ' + object.type + ' : ' + object.data + '\n', options,function(err){
           });
                            }
}

// function to flush out redirector output to stdout and logging it also 
function writeOut(str,msg){
    process.stdout.write(str);
    logger({data: msg + ' ' + str,type:'Debug'},'debug');
}

function authCheck(answer){

    // checking for ip address in session collection
	authSessions.findOne({ip:answer.split(' ')[answer.split(' ').length - 5].split('/')[0]},function(err,Doc){
	if (err){
            writeOut("302:http://10.20.48.1:10000/dberror?"+ '\n','dberror');
            logger({data:err,type:'DBerror'},'main');
            }
        
        else if(Doc){ 

			// calling check function to see if url should be blocked or not			
			checkURL(Doc,answer.split(' ')[answer.split(' ').length - 6]);
            logger({data:Doc.ip + ' requested for ' + answer.split(' ')[answer.split(' ').length - 6],
                    type:'users',
                    username:Doc.username
                    },'user');				
		}

		else{

			var obj = {
        			   req_url: answer.split(' ')[answer.split(' ').length - 6],
        			   ip: answer.split(' ')[answer.split(' ').length - 5].split('/')[0]
    				  };

    			var requestObj = new httpRequests(obj);

    			requestObj.save(function (err,doc) {
         		if(err){
                    writeOut("302:http://10.20.48.1:10000/dberror?"+ '\n','dberror');
             		logger({data:err,type:'DBerror'},'main');
                }

			else {
			   // temporarily move to login_manager
         		   writeOut("302:http://10.20.48.1:10000/login?"+doc.id + '\n','login ');

                   logger({data:doc.req_url + ' redirected to login page with id ' + doc.id,
                           type:'redirectID'
                           },'main');
			     }
	       						});


				}

	});

}

// fucntion checks whether the specific user is allowed to access the domain or not
function checkURL(data,url){

    // extracting domain from whole url
    if(url.split('/').length > 2)
    var domain = url.split('/')[2];
    else
    var domain = url; 

    // flag for checking faulty url
    faulty = false;

    // extracting user info 		
    users.findOne({username:data.username},function(err,doc){
        if (err){
            writeOut("302:http://10.20.48.1:10000/dberror?"+ '\n','dberror');
            logger({data:err,type:'DBerror'},'main');
        }
        else {

		// checking user categories collection to block sites defined per category ( of user)
                categories.findOne({catgName:doc.category},function(err,docu){
                    if(err){
                        writeOut("302:http://10.20.48.1:10000/dberror?"+ '\n','dberror');
                        logger({data:err,type:'DBerror'},'main');
                    }
                    else{
                        for(var j =0 ; j< docu.enrolledLists.length ; j++){
			              var ch = weblistcheck(docu.enrolledLists,j,domain,data,url);
                          if(ch == true)
                            break;
                        							}// for loop docu.enrolledLists

                    }// else err categories.findOne

                });// categories.findOne


        }// else err for uers.findOne
    }); // users.findOne

                            } // checkurl 

// this function is a little workaround for asynchronous database calls
// docu = category{ Students , Faculty etc } d = docu.enrolledLists , l = j = index in docu.enrolledLists
// data = authsession documnet conataining username , category etc 
function weblistcheck(d,l,domain,data,url) {

        // finding all the sub categories stored in enrolled list to get full list
        logger({data:'checking docu.enrolledLists : ' + d + ' l = ' + l + ' d[l] = ' + d[l] ,type:'test'},'debug');
        webLists.findOne({listName:d[l]},function (err,document) {
            if(err){
                writeOut("302:http://10.20.48.1:10000/dberror?"+ '\n','dberror');
                logger({data:err,type:'DBerror'},'main');
            }
            else{
                for(var k = 0 ; k<document.blackList.length;k++){

                    // now matching against the domain and stored values
                    var rePattern = new RegExp('([\s\S]*' + document.blackList[k] +'[\s\S]*)','g');
                    logger({data:'checking url : ' + document.blackList[k] + ' k = ' + k +  ' l = ' + l,type:'test'},'debug');

                    if(domain.match(rePattern)){
                        // setting flag to true i.e. faulty url found 
                        faulty = true;

                        // creating faulty access object for saving in database
                        var faultyObj = new faults({
                            url:url,
                            category:data.category,
                            ip:data.ip,
                            username:data.username,
                            listname:document.listName,
                            accessTime:new Date()
                        });

                        faultyObj.save(function (err,docum) {
                        if(err){
                            writeOut("302:http://10.20.48.1:10000/dberror?"+ '\n','dberror');
                            logger({data:err,type:'DBerror'},'main');
                                }
                        else{
                        writeOut( "302:http://10.20.48.1:10000/warning?" + docum.id + ' \n','warning ' + docum.url);

                        logger({data:docum.username +  ' of category ' + docum.category + ' with ip ' + docum.ip + ' tried to access ' + docum.url + ' in listing ' + docum.listName,
                                type:'MatchWithBlocked',
                                username:docum.username
                                },'user');
                            }
                                });

                        // breaking out of loop such that no more url check would be proceeded 
                        break;
                                                }// if domain.match


                                                                    }// for loop document.blacklist

                    if(faulty == true) 
                        return true;                                            

            // checking if the url is faulty or not after all categories check && j == l == ( docu.enrolledLists.length -1 ) 
            if(faulty == false && l == d.length -1 ){
                logger({data:'checking faulty : ' + faulty + ' k = ' + k +  ' l = ' + l,type:'test'},'debug');
                //logger('not faulty ' + l +' ' + k,'test');
                writeOut('ERR\n','passed ' + url);
                return false;
                                                    }
            else
                return false;                                                                

                }// else err in webLists.findOne
                                                                        }); // webLists.findone
}