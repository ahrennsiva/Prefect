/**
 * Module dependencies.
 */

var express = require('express');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser')
var session = require('express-session');
var methodOverride = require('method-override');
var favicon = require('serve-favicon');
var http = require('http');
var path = require('path');
var app = express();
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
var request = require('request');


// all environments
app.set('port', process.env.PORT || 4205);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cookieParser());
app.use(session({ secret: 'beta-engine', resave:false, saveUninitialized:false}));
app.use(methodOverride());

var db = require('./api/tools/nifty.js').provisionDatabases();

require('./api/routes/main.js')(app, db);


app.use(express.static(path.join(__dirname, 'public')));

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});