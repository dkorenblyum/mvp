var bodyParser = require('body-parser');
var express = require ('express');
var mongoose = require('mongoose');
var sessions = require('client-sessions');


var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

//connect to mongo
mongoose.connect('mongodb://localhost/newauth');

var User = mongoose.model('User', new Schema ({
  id : ObjectId,
  firstName : String,
  lastName : String,
  email: { type: String, unique : true },
  password : String,
  address: String

}))


var app = express();
app.set('view engine', 'jade');
app.locals.pretty = true;


//middeleware
app.use('/static', express.static(__dirname + '/assets'));
app.use(bodyParser.urlencoded({ extended: true}));
app.use(sessions({
  cookieName : 'session',
  secret : 'aslkjfasdfljasdfsaasdfjlakshdf',
  duration: 30 * 60 * 1000,
  activeDuration: 5 * 60 * 1000,
}));

app.get('/', function(req,res){
    res.render('index.jade');
});

app.get('/register', function(req, res){
  res.render('register.jade');
});

app.post('/register', function(req, res){
  var user = new User({
    firstName : req.body.firstName,
    lastName : req.body.lastName,
    email : req.body.email,
    password : req.body.password,
    address : req.body.address
  });

  user.save(function(err){
    if (err){
      var err = 'Something bad happened! Try again!';
      if(err.code === 11000){
        error = 'Email already in use';
      }
      res.render('register.jade', { error : error });
    } else {
      res.redirect('/dashboard');
    }
  })
});

app.get('/login', function(req,res){
  res.render('login.jade');
});

app.post('/login', function(req,res){
  User.findOne({ email : req.body.email }, function(err, user){
    if (!user){
      res.render('login.jade', { error : 'Invalid email or password'});
    }else {
      if (req.body.password === user.password){
        req.session.user = user;
        res.redirect('/dashboard');
      }else {
        res.render('login.jade', { error : 'Invalid email or password'});
      }
    } 
  });
});

app.post('/dashboard', function(req,res){
  res.redirect('/orderDetails');
});

app.get('/orderDetails', function(req,res){

    User.findOne({ email : req.session.user.email }, function(err, user){
        res.locals.user = user;
        res.render('orderDetails.jade');
    });
});

app.get('/dashboard', function(req,res){
  res.render('dashboard.jade');
});

app.get('/logout', function(req,res){
  req.session.reset();
  res.redirect('/');
});

app.listen(3000);




