const dotenvconfig = require('dotenv').config();
const logger = require('./common/logger');
logger.info('Starting application');

if (dotenvconfig.error) {
  logger.error(`failed to parse dotenv: ${dotenvconfig.error}`);
  throw dotenvconfig.error
}

const express = require('express');
const bodyParser = require('body-parser');
const exphbs = require('express-handlebars');
const passport = require('passport');
const config = require('./config')('config');
require('./auth/passportInit');
const userModel = require('./model/user');
const common = require('./common/index.js');
const helmet = require('helmet');
const responseTime = require('response-time')

const serverSetup = require('./common/serverSetup');

const app = express();

if (process.env.NODE_ENV === 'development') {
  app.use(responseTime());
}

/* APP SETUP */
app.disable('x-powered-by');
app.use(helmet())
if (config.serveStatic) {
  app.use(express.static('../client/dist'))
}
app.use(common.setHeaders);
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
  logger.error(err);
  res
    .status(500)
    .send('Access Denied');
});

serverSetup(app);

process.on('unhandledRejection', function(reason, p){
  logger.error('unhandledPromiseRejection:', p, "reason:", reason);
});
