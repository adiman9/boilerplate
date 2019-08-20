const session = require('express-session');
let config = require('../config')('config');
const logger = require('./common/logger');

module.exports = function(app) {

  let sessOptions = config.session;

  if(config.useDb) {
    const MySqlStore = require('express-mysql-session')(session);

    // Session handling
    let mySqlOptions = {
      host: config.db.host,
      port: '3306',
      user: config.db.user,
      password: config.db.password,
      database: config.db.database
    }

    var sessionStore = new MySqlStore(mySqlOptions);
    sessOptions.store = sessionStore;
  }

  if(process.env.NODE_ENV === 'production'){
    app.set('trust proxy', 1);
    sessOptions.cookie.secure = true;
  }
  var sessionMiddleware = session(sessOptions);

  return function(req, res, next) {
    var tries = 5;

    function lookupSession(error) {
      if (error) {
        logger.error(`error while looking up session: ${error}`);
        return next(error);
      }
      logger.info('looking up current session');

      tries -= 1;

      if (req.session !== undefined) {
        logger.info('Found the user session');
        return next();
      }

      if(tries < 0) {
        logger.error('Failed to load user session');
        return next(new Error('Session failed to load'));
      }

      sessionMiddleware(req, res, lookupSession);
    }

    lookupSession();
  };
};

