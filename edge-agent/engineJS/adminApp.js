const express = require('express');
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const passport = require('passport')
const mongoose = require('mongoose')
const flash = require('connect-flash')
const uuid = require('uuid/v4')
const session = require('express-session')
const FileStore = require('session-file-store') (session)
const cors = require('cors')

require('./authentication/passport')

const routes = require('./routes/index');
const users = require('./routes/users');
const api = require('./routes/api');
// () executes the function so that we can potentially have multiple indy handlers;
//const indyHandler = require('./indy/src/handler')({ defaultHandlers: true, eventHandlers: [] }); 

const app = express();


// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/ssi-agent', { useCreateIndex: true, useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Mongo ready " + mongoose.connection.readyState))
  .catch (() => console.log("Connection Error!"))


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');


// Session configuration
app.use(session({ 
    genid: () => { return uuid() },
    //name: `server-session-cookie-id-for-${config.walletName}`,
    store: new FileStore(),
    secret: 'ssi2020',
    saveUninitialized: true,
    resave: true,
    rolling: true
  }))
  
// Passport initialization
app.use(passport.initialize());
app.use(passport.session());
  

// Connect flash
app.use(flash());

app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Allow fetch from localhost
app.use(
    cors({
      credentials: true,
      origin: ["http://localhost:3000","http://localhost:3001"],
      default: "http://localhost:3000"
    })
  );

// Global Vars
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next()
})


app.use('/', routes);
app.use('/users', users);
app.use('/api', api);
//app.post('/indy', indyHandler.middleware);


/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
