const session = require('express-session');
let config = require('../config')('config');

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
        return next(error);
      }

      tries -= 1;

      if (req.session !== undefined) {
        return next();
      }

      if(tries < 0) {
        return next(new Error('Session failed to load'));
      }

      sessionMiddleware(req, res, lookupSession);
    }

    lookupSession();
  };
};

