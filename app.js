
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')

var app = module.exports = express.createServer();
app.use(express.bodyParser());
app.use(express.cookieParser());

// Configuration

app.configure(function(){
   app.set('views', __dirname + '/views');
   app.set('view engine', 'jade');
   app.use(express.methodOverride());
   app.use(app.router);
   app.use(express.static(__dirname + '/public'));
   app.use(express.bodyParser());
   app.use(express.cookieParser());
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Routes

app.get('/', routes.index);
app.get('/auth', routes.auth);
app.get('/logout', routes.logout);
app.get('/files', routes.files);
app.get('/save', routes.save);

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
