var express = require('express');
var bodyParser = require('body-parser');
var exphbs = require('express-handlebars');
var logger = require('./common/logger');
var passport = require('passport');
require('./auth/passportInit');
const userModel = require('./model/user');

var serverSetup = require('./common/serverSetup');

var app = express();

/* APP SETUP */
app.use(bodyParser.json({
  limit: '10mb'
}));
app.use(bodyParser.urlencoded({
  extended: true,
  limit: '10mb'
}));
app.use(require('morgan')('combined', { 'stream': logger.stream }));
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

// Sessions
app.use(require('./common/sessions')(app));

// Passport Auth Init
app.use(passport.initialize());
app.use(passport.session());

// Anonymous login for all users
app.use(async (req, res, next) => {
  if(!req.user) {
    let user =  await userModel.createAnonymousUser();
    req.session.anonUserId = user.id;
    req.logIn(user, err => {
      if(err) return next(err)

      next();
    });
    return;
  }
  next();
});

/* Routes */
app.use(require('./routes/'));

app.use((err, req, res, next) => {
  res
    .status(500)
    .send('Access Denied');
});

serverSetup(app);
