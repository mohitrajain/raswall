
var globalObj;

var currForm, distinct_weblist;

$(document).ready(function(){
    $('#main_row').attr('style','height:'+(window.innerHeight-106)+'px;overflow-y: auto;');
});

$(document).ready(function(){
    // the "href" attribute of the modal trigger must specify the modal ID that wants to be triggered
    $('.modal').modal();

});

function showAddModal(){
    if(currForm=="users"){

        $('#addUser').modal('open');
        $.get("/getDistinctCategories",function (data) {
            var sel = document.getElementById("category_addUser");

            for(var i=0;i< data.length ;i++){
                var opt = document.createElement('option');
                opt.setAttribute('value',data[i]);
                opt.textContent = data[i];
                sel.appendChild(opt);
            }
            $('select').material_select();
        });
    }

    if(currForm=="category"){

        $('#addCategory').modal('open');
        $.get("/getDistinctWebLists",function (data) {
            var sel = document.getElementById("enrolledLists_addcategory");

            for(var i=0;i< data.length ;i++){
                var opt = document.createElement('option');
                opt.setAttribute('value',data[i]);
                opt.textContent = data[i];
                sel.appendChild(opt);
            }
            $('select').material_select();
        });

    }

    if(currForm=="weblists"){

        $('#addWeblists').modal('open');

    }
    //To initialise dropdown feature of materialize css


}



/**************************************************** AuthSessions section start ***************************************************/

function show_authSessions(){

    currForm="";
    $.get("/getActiveSessions",function(data){
        if(data == " DB Error in finding all the Sessions "){
            alert(data);
        }
        else if(data == " No active Sessions "){
            alert(data);
        }
        else if(data == " DB error in deleting "){
            alert(data);
        }
        else{
            console.log('here ' + data);
            make_authSessionTable(data);
        }
        $('.drop_session').click(function(){
            $.get("/getActiveSessions?drop="+$(this).attr('value'),function (doc) {
                if(doc == " Error in finding all the Sessions "){
                    $("#Table").html("");
                    alert(doc);
                }
                else if(doc == " DB error "){
                    alert(doc);
                }
                else if(doc == " No active Sessions "){
                    $("#Table").html("");
                    alert(doc);
                }
                else{
                    $("#Table").html("");
                    make_authSessionTable(doc);
                }
            });
        });
    });

}

$('#division').ready(function(){
    show_authSessions();
});



$("#authSessions").click(function () {
    $("#Table").empty();
    show_authSessions();
});

//////////////////////////////////// AuthSessions Table /////////////////////////////////////////

function make_authSessionTable(data){

    var obj = JSON.stringify(data);
    console.log(data);
    var json = JSON.parse(data);

    console.log(json.length);
    console.log(json[0]["ip"]);

    var len = json.length;
    var jsonSize = Object.keys(json[0]).length;

    var thead = document.createElement('thead');
    document.getElementById("Table").appendChild(thead);

    var row = document.createElement('tr');
    thead.appendChild(row);

    for(var j in json[0]){

        if(j!="_id" && j!="__v"){
            var col = document.createElement('th');
            col.textContent = j;
            row.appendChild(col);

        }
    }

    var tbody = document.createElement('tbody');
    document.getElementById("Table").appendChild(tbody);

    for( var i=0; i< len ; i++){

        var rows = document.createElement('tr');
        tbody.appendChild(rows);

        for(var j in json[i]){
            if(j!="_id" && j!="__v"){
                var cols = document.createElement('td');
                cols.textContent = json[i][j] ;
                rows.appendChild(cols);
            }
        }
        var div = document.createElement('div');
        div.setAttribute('class',"drop_session");
        div.setAttribute('value',json[i]["_id"]);
        div.setAttribute('style',"margin-top: 15px");
        rows.appendChild(div);
        var itag = document.createElement('i');
        itag.setAttribute('class','fa fa-trash');
        itag.setAttribute('aria-hidden','true');
        itag.setAttribute('style','font-size: 20px');
        div.appendChild(itag);
    }
}

/**************************************************** User section start ***************************************************/

// Click on users
$('#users').click(function () {
    currForm = "users";
    $.get("/getUsers",function (data) {
        if(data == " DB Error in finding User "){
            alert(data);
        }
        else if(data == " NO USERS "){
            alert(data);
        }else{
            $('#Table').empty();
            make_usersTable(data);
        }

    });
});

function AddUser_btn_click(){
    $.post("/addUser", $("#addUserForm").serialize(),function (doc) {
        alert(doc);
        $.get('/getUsers',function (data) {
            if(data == " DB Error in finding User "){
                alert(data);
            }
            else if(data == " NO USERS "){
                alert(data);
            }else{
                $('#Table').empty();
                make_usersTable(data);
            }
        })
    })
}

//////////////////////////////////// Users Table /////////////////////////////////////////

function make_usersTable(data) {
    // parse the incoming data
    var obj = JSON.stringify(data);
    console.log(data);
    var json = JSON.parse(data);

    var len = json.length;
    //var jsonSize = Object.keys(json[0]).length;
    console.log(json);

    //adding <thead> tag for table headings
    var thead = document.createElement('thead');
    document.getElementById("Table").appendChild(thead);


    var row = document.createElement('tr');
    thead.appendChild(row);

    // adding heading text of table i.e., name of headings in table
    for(var j in json[0]){

        if(j!="_id" && j!="__v"){
            var col = document.createElement('th');
            col.textContent = j;
            row.appendChild(col);
        }
    }

    var tbody = document.createElement('tbody');
    document.getElementById("Table").appendChild(tbody);

    //
    for( var i=0; i< len ; i++){

        var rows = document.createElement('tr');
        rows.setAttribute("id","row_"+json[i]["_id"]);
        tbody.appendChild(rows);

        for(var j in json[i]){
            if(j!="_id" && j!="__v"){
                var cols = document.createElement('td');
                cols.textContent = json[i][j] ;
                rows.appendChild(cols);
            }
        }

        var div = document.createElement('div');
        div.setAttribute('class',"user_details");
        div.setAttribute('value',json[i]["_id"]);
        div.setAttribute('style',"margin-top: 15px");
        rows.appendChild(div);

        var edit = document.createElement('i');
        edit.setAttribute('class','fa fa-pencil');
        edit.setAttribute('aria-hidden','true');
        edit.setAttribute('id','edit_'+json[i]["_id"]);
        edit.setAttribute('onclick','edit_user('+JSON.stringify(json[i])+')');
        edit.setAttribute('style','font-size: 20px');
        div.appendChild(edit);

        var save = document.createElement('i');
        save.setAttribute('class','fa fa-floppy-o');
        save.setAttribute('aria-hidden','true');
        save.setAttribute('id','save_'+json[i]["_id"]);
        save.setAttribute('style','font-size: 20px; display: none ');
        div.appendChild(save);

        var del = document.createElement('i');
        del.setAttribute('class','fa fa-trash');
        del.setAttribute('aria-hidden','true');
        del.setAttribute('value',json[i]["_id"]);
        del.setAttribute('onclick','delete_user(this)');
        del.setAttribute('style',"font-size: 20px; padding-left: 10px");
        div.appendChild(del);
    }
}

//////////////////////////////////// Edit User /////////////////////////////////////////

function edit_user(obj) {
    console.log(obj);

    var objArray = [];

    for(var j in obj){
        if(j!="_id" && j!="__v")
            objArray.push(j);
    }

    globalObj = objArray;

    console.log(globalObj);

    console.log("row id: row"+obj["_id"]);
    var row = document.getElementById("row_"+obj["_id"]);
    console.log(row);
    var htmlText = "";
    //htmlText += '<form action="/editUser?user='+obj["_id"]+'" method="get">';

    console.log(objArray.length);
    for( var i =0 ;i<objArray.length; i++){
        if(objArray[i]=="password"){
            htmlText+= '<td><input type="password" name='+objArray[i]+' value='+obj[objArray[i]]+'></td>';
        }
        else if(objArray[i] == "ctTime"){
            htmlText+= '<td><input type="text" name='+objArray[i]+' value='+obj[objArray[i]]+' disabled ></td> ';
        }
        else{
            htmlText+= '<td><input type="text" name='+objArray[i]+' value='+obj[objArray[i]]+'></td>';
        }
    }
    //htmlText+='<input type="submit" value="Submit"></form>';
    console.log(htmlText);
    row.innerHTML = htmlText;

    var div = document.createElement('div');
    div.setAttribute('class',"user_details");
    div.setAttribute('value',obj["_id"]);
    div.setAttribute('style',"margin-top: 15px");
    row.appendChild(div);

    var save = document.createElement('i');
    save.setAttribute('class','fa fa-floppy-o');
    save.setAttribute('aria-hidden','true');
    save.setAttribute('id','save_'+obj["_id"]);
    save.setAttribute('onclick','save_user(globalObj,"' + obj["_id"]+'")' );
    save.setAttribute('style','font-size: 20px');
    div.appendChild(save);

    var del = document.createElement('i');
    del.setAttribute('class','fa fa-trash');
    del.setAttribute('aria-hidden','true');
    del.setAttribute('value',obj["_id"]);
    del.setAttribute('onclick','delete_user(this)');
    del.setAttribute('style',"font-size: 20px; padding-left: 10px");
    div.appendChild(del);
}

//////////////////////////////////// Save User /////////////////////////////////////////

function save_user(objArray, id) {

    console.log(objArray);
    console.log(id);
    var getQuery='';
    for(var i=0; i<objArray.length; i++){
        getQuery+="&"+objArray[i]+'='+document.getElementsByName(objArray[i])[0].value;
    }

    console.log(getQuery);

    $.get("/saveUser?id="+id+getQuery,function (data) {
        console.log("response: "+data);
        if(data =="DB Error"){
            alert(data);
        }
        else if(data == "User details updated but error in displaying"){
            alert(data);
        }
        else{
            $("#Table").empty();
            make_usersTable(data);
        }
    })
}

//////////////////////////////////// Delete User /////////////////////////////////////////

function delete_user(val) {
    val = $(val).attr('value');
    $.get("/deleteUser?user="+val,function (data) {
        if(data == " Error in deleting User "){
            alert(data);
        }else{
            $("#row_"+val).remove();
        }
    });
}

/**************************************************** Category section start ***************************************************/

$('#categories').click(function () {
    currForm="category";
    $.get("/getCategories",function (data) {
        if(data == " DB Error in finding Category "){
            alert(data);
        }
        else if(data == " NO CATEGORIES "){
            alert(data);
        }else{
            $('#Table').empty();
            make_categoryTable(data);
        }

    });
});


function AddCategory_btn_click(){
    $.post("/addCategory", $("#addCategoryForm").serialize(),function (doc) {
        alert(doc);
        $.get("/getCategories",function (data) {
            if(data == " DB Error in finding Category "){
                alert(data);
            }
            else if(data == " NO CATEGORIES "){
                alert(data);
            }else{
                $('#Table').empty();
                make_categoryTable(data);
            }

        });
    })
}

//////////////////////////////////// Category Table /////////////////////////////////////////

function make_categoryTable(data) {
    // parse the incoming data
    var obj = JSON.stringify(data);
    console.log(data);
    var json = JSON.parse(data);

    var len = json.length;
    //var jsonSize = Object.keys(json[0]).length;
    console.log(json);

    //adding <thead> tag for table headings
    var thead = document.createElement('thead');
    document.getElementById("Table").appendChild(thead);


    var row = document.createElement('tr');
    thead.appendChild(row);

    // adding heading text of table i.e., name of headings in table
    for(var j in json[0]){

        if(j!="_id" && j!="__v"){
            var col = document.createElement('th');
            col.textContent = j;
            row.appendChild(col);
        }
    }

    var tbody = document.createElement('tbody');
    document.getElementById("Table").appendChild(tbody);

    //
    for( var i=0; i< len ; i++){

        var rows = document.createElement('tr');
        rows.setAttribute("id","row_"+json[i]["_id"]);
        tbody.appendChild(rows);

        for(var j in json[i]){
            if(j!="_id" && j!="__v"){
                var cols = document.createElement('td');
                cols.textContent = json[i][j] ;
                rows.appendChild(cols);
            }
        }

        var div = document.createElement('div');
        div.setAttribute('class',"category_details");
        div.setAttribute('value',json[i]["_id"]);
        div.setAttribute('style',"margin-top: 15px");
        rows.appendChild(div);

        var edit = document.createElement('i');
        edit.setAttribute('class','fa fa-pencil');
        edit.setAttribute('aria-hidden','true');
        edit.setAttribute('id','edit_'+json[i]["_id"]);
        edit.setAttribute('onclick','edit_category('+JSON.stringify(json[i])+')');
        edit.setAttribute('style','font-size: 20px');
        div.appendChild(edit);

        var save = document.createElement('i');
        save.setAttribute('class','fa fa-floppy-o');
        save.setAttribute('aria-hidden','true');
        save.setAttribute('id','save_'+json[i]["_id"]);
        save.setAttribute('style','font-size: 20px; display: none ');
        div.appendChild(save);

        var del = document.createElement('i');
        del.setAttribute('class','fa fa-trash');
        del.setAttribute('aria-hidden','true');
        del.setAttribute('value',json[i]["_id"]);
        del.setAttribute('onclick','delete_category(this)');
        del.setAttribute('style',"font-size: 20px; padding-left: 10px");
        div.appendChild(del);
    }
}

//////////////////////////////////// Edit Category /////////////////////////////////////////

function edit_category(obj) {
    console.log(obj);

    var objArray = [];

    for(var j in obj){
        if(j!="_id" && j!="__v")
            objArray.push(j);
    }

    globalObj = objArray;

    console.log(globalObj);

    console.log("row id: row"+obj["_id"]);
    var row = document.getElementById("row_"+obj["_id"]);
    console.log(row);
    var htmlText = "";



    console.log(objArray.length);
    for( var i =0 ;i<objArray.length; i++){
        if(objArray[i]=='enrolledLists'){

            htmlText+= '<td><select name='+objArray[i]+' multiple >';

            /*$.get("/getDistinctWebLists",function (data,objArray[i]) {
                var sel = document.getElementById("enrolledLists_addcategory");

                for(var k=0;k< data.length ;k++){
                    htmlText+='<option value"'+data[k]+'">'+data[k]+'</option>';
                }
                htmlText+= '</select></td>';
                $('select').material_select();
            });*/

            var temp = obj[objArray[i]].toString();
            var list_array = temp.split(',');

            for(var k=0; k< list_array.length; k++){
                htmlText+='<option value"'+list_array[k]+'">'+list_array[k]+'</option>';
            }

            htmlText+= '</select></td>';

        }else{
            htmlText+= '<td><input type="text" name='+objArray[i]+' value='+obj[objArray[i]]+'></td>';
        }

    }
    //htmlText+='<input type="submit" value="Submit"></form>';
    console.log('now='+htmlText);
    row.innerHTML = htmlText;
    $('select').material_select();
    var div = document.createElement('div');
    div.setAttribute('class',"category_details");
    div.setAttribute('value',obj["_id"]);
    div.setAttribute('style',"margin-top: 15px");
    row.appendChild(div);

    var save = document.createElement('i');
    save.setAttribute('class','fa fa-floppy-o');
    save.setAttribute('aria-hidden','true');
    save.setAttribute('id','save_'+obj["_id"]);
    save.setAttribute('onclick','save_category(globalObj,"' + obj["_id"]+'")' );
    save.setAttribute('style','font-size: 20px');
    div.appendChild(save);

    var del = document.createElement('i');
    del.setAttribute('class','fa fa-trash');
    del.setAttribute('aria-hidden','true');
    del.setAttribute('value',obj["_id"]);
    del.setAttribute('onclick','delete_category(this)');
    del.setAttribute('style',"font-size: 20px; padding-left: 10px");
    div.appendChild(del);
}

//////////////////////////////////// Save Category /////////////////////////////////////////

function save_category(objArray, id) {

    console.log(objArray);
    console.log(id);
    var getQuery='';
    for(var i=0; i<objArray.length; i++){
        getQuery+="&"+objArray[i]+'='+document.getElementsByName(objArray[i])[0].value;
    }

    console.log(getQuery);

    $.get("/saveCategory?id="+id+getQuery,function (data) {
        console.log("response: "+data);
        if(data =="DB Error"){
            alert(data);
        }
        else if(data == "Category details updated but error in displaying"){
            alert(data);
        }
        else{
            $("#Table").empty();
            make_categoryTable(data);
        }
    })
}

//////////////////////////////////// Delete Category /////////////////////////////////////////
function delete_category(val) {
    val = $(val).attr('value');
    $.get("/deleteCategory?category="+val,function (data) {
        if(data == " Error in deleting Category "){
            alert(data);
        }else{
            $("#row_"+val).remove();
        }
    });
}
/**************************************************** Category section end ***************************************************/



/**************************************************** Weblists section start ***************************************************/


$('#weblists').click(function () {
    currForm="weblists";
    $.get("/getWeblists",function (data) {
        if(data == " DB Error in finding Weblists "){
            alert(data);
        }
        else if(data == " NO WEBLISTS "){
            alert(data);
        }else{
            $('#Table').empty();
            make_weblistsTable(data);
        }

    });
});


function AddWeblists_btn_click(){
    $.post("/addWeblist", $("#addWeblistsForm").serialize(),function (doc) {
        alert(doc);
        $.get("/getWeblists",function (data) {
            if(data == " DB Error in finding Weblists "){
                alert(data);
            }
            else if(data == " NO WEBLISTS "){
                alert(data);
            }else{
                $('#Table').empty();
                make_weblistsTable(data);
            }

        });
    })
}

//////////////////////////////////// Weblists Table /////////////////////////////////////////

function make_weblistsTable(data) {
    // parse the incoming data
    var obj = JSON.stringify(data);
    console.log(data);
    var json = JSON.parse(data);

    var len = json.length;
    //var jsonSize = Object.keys(json[0]).length;
    console.log(json);

    //adding <thead> tag for table headings
    var thead = document.createElement('thead');
    document.getElementById("Table").appendChild(thead);


    var row = document.createElement('tr');
    thead.appendChild(row);

    // adding heading text of table i.e., name of headings in table
    for(var j in json[0]){

        if(j!="_id" && j!="__v"){
            var col = document.createElement('th');
            col.textContent = j;
            row.appendChild(col);
        }
    }

    var tbody = document.createElement('tbody');
    document.getElementById("Table").appendChild(tbody);

    //
    for( var i=0; i< len ; i++){

        var rows = document.createElement('tr');
        rows.setAttribute("id","row_"+json[i]["_id"]);
        tbody.appendChild(rows);

        for(var j in json[i]){
            if(j!="_id" && j!="__v"){
                var cols = document.createElement('td');
                cols.textContent = json[i][j] ;
                rows.appendChild(cols);
            }
        }

        var div = document.createElement('div');
        div.setAttribute('class',"weblists_details");
        div.setAttribute('value',json[i]["_id"]);
        div.setAttribute('style',"margin-top: 15px");
        rows.appendChild(div);

        var edit = document.createElement('i');
        edit.setAttribute('class','fa fa-pencil');
        edit.setAttribute('aria-hidden','true');
        edit.setAttribute('id','edit_'+json[i]["_id"]);
        edit.setAttribute('onclick','edit_weblists('+JSON.stringify(json[i])+')');
        edit.setAttribute('style','font-size: 20px');
        div.appendChild(edit);

        var save = document.createElement('i');
        save.setAttribute('class','fa fa-floppy-o');
        save.setAttribute('aria-hidden','true');
        save.setAttribute('id','save_'+json[i]["_id"]);
        save.setAttribute('style','font-size: 20px; display: none ');
        div.appendChild(save);

        var del = document.createElement('i');
        del.setAttribute('class','fa fa-trash');
        del.setAttribute('aria-hidden','true');
        del.setAttribute('value',json[i]["_id"]);
        del.setAttribute('onclick','delete_weblists(this)');
        del.setAttribute('style',"font-size: 20px; padding-left: 10px");
        div.appendChild(del);
    }
}

//////////////////////////////////// Edit weblists /////////////////////////////////////////

function edit_weblists(obj) {
    console.log(obj);

    var objArray = [];

    for(var j in obj){
        if(j!="_id" && j!="__v")
            objArray.push(j);
    }

    globalObj = objArray;

    console.log(globalObj);

    console.log("row id: row"+obj["_id"]);
    var row = document.getElementById("row_"+obj["_id"]);
    console.log(row);
    var htmlText = "";

    console.log(objArray.length);
    for( var i =0 ;i<objArray.length; i++){

        htmlText+= '<td><input type="text" name='+objArray[i]+' value='+obj[objArray[i]]+'></td>';

    }

    console.log(htmlText);
    row.innerHTML = htmlText;

    var div = document.createElement('div');
    div.setAttribute('class',"weblists_details");
    div.setAttribute('value',obj["_id"]);
    div.setAttribute('style',"margin-top: 15px");
    row.appendChild(div);

    var save = document.createElement('i');
    save.setAttribute('class','fa fa-floppy-o');
    save.setAttribute('aria-hidden','true');
    save.setAttribute('id','save_'+obj["_id"]);
    save.setAttribute('onclick','save_weblists(globalObj,"' + obj["_id"]+'")' );
    save.setAttribute('style','font-size: 20px');
    div.appendChild(save);

    var del = document.createElement('i');
    del.setAttribute('class','fa fa-trash');
    del.setAttribute('aria-hidden','true');
    del.setAttribute('value',obj["_id"]);
    del.setAttribute('onclick','delete_weblists(this)');
    del.setAttribute('style',"font-size: 20px; padding-left: 10px");
    div.appendChild(del);
}

//////////////////////////////////// Save Weblists /////////////////////////////////////////

function save_weblists(objArray, id) {

    console.log(objArray);
    console.log(id);
    var getQuery='';
    for(var i=0; i<objArray.length; i++){
        getQuery+="&"+objArray[i]+'='+document.getElementsByName(objArray[i])[0].value;
    }

    console.log(getQuery);

    $.get("/saveWeblists?id="+id+getQuery,function (data) {
        console.log("response: "+data);
        if(data =="DB Error"){
            alert(data);
        }
        else if(data == "Weblists details updated but error in displaying"){
            alert(data);
        }
        else{
            $("#Table").empty();
            make_weblistsTable(data);
        }
    })
}

//////////////////////////////////// Delete Weblists /////////////////////////////////////////
function delete_weblists(val) {
    val = $(val).attr('value');
    $.get("/deleteWeblists?listName="+val,function (data) {
        if(data == " Error in deleting Weblists "){
            alert(data);
        }else{
            $("#row_"+val).remove();
        }
    });
}
/**************************************************** Weblists section end ***************************************************/


