var passport = require('passport');
const logger = require('../../common/logger');

passport.serializeUser(function(user, done) {
  logger.info(`serialising user ${user.id}`);
  var sessionUser = {
    id: user.id,
    name: user.name,
    provider: user.provider,
    email: user.email,
    image: user.image
  }
  done(null, sessionUser);
});

passport.deserializeUser(function(user, done) {
  logger.info(`deserialising user ${user.id}`);
  done(null, user)
});
