var passport = require('passport');

passport.serializeUser(function(user, done) {
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
  done(null, user)
});
