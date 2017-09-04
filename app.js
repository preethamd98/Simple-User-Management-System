const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const parser = require('body-parser');
const methOver = require('method-override');
const redis = require('redis');


//Create a client
let client = redis.createClient();
client.on('connect',function(){console.log('Connected to redis....')});
//Setting up the Port

const port = 3000;

//Init app

const app = express();

//View Engine
app.engine('handlebars',exphbs({defaultLayout:'main'}));
app.set('view engine','handlebars');

//Body parser
app.use(parser.json());
app.use(parser.urlencoded({extended:false}));

//Method Overide

app.use(methOver('_method'));

 app.get('/',function(req,res,next){
   res.render('searchusers');
 });

//Search Processing

app.post('/user/search',function(req,res,next){
  let id = req.body.id;
  client.hgetall(id,function(err,obj){
    if(!obj){
      res.render('searchusers',{
        error:'User does not exists'
      });
    }
    else{
      obj.id=id;
      res.render('details',{user:obj});
    }
  })
});

app.get('/user/add',function(req,res,next){
  res.render('adduser');
});

//Process Add User Page

app.post('/user/add',function(req,res,next){
  let id = req.body.id;
  let first_name = req.body.first_name;
  let last_name = req.body.last_name;
  let email = req.body.email;
  let phoneno = req.body.phoneno;
  client.hmset(id,['first_name',first_name,'last_name',last_name,'email',email,'phoneno',phoneno],function(err,reply){if(err){console.log('err')}
  console.log(reply);
  res.redirect('/');
});
});

//Delete a user
app.delete('/user/delete/:id',function(req,res,next) {
  client.del(req.params.id);
  res.redirect('/');

})



app.listen(port,function(){console.log("The Port is started")});
