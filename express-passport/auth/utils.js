const userModel = require('../model/user');
const analyticsModel = require('../model/analytics');
const passport = require('passport');
const logger = require('../common/logger');

module.exports = {
  authCallback,
  ensureAuth,
  isSignedIn,
}

function isSignedIn(req, res, next) {
  let user = req.user;

  if(
      user &&
      (
        user.provider === 'facebook' ||
        user.provider === 'google' ||
        user.provider === 'github' ||
        user.provider === 'twitter' ||
        user.provider === 'password'
      )
    )
      return next();

  res.json({error: 'Please Sign In'});
}

function authCallback(strategy, noRedirect) {
  return (req, res, next) => {
    passport.authenticate(strategy, (err, user, info) => {
      if(err) return res.json({error: 'Something went wrong. Please try again'});
      if(!user) return res.json({error: 'Unkown Credentials'});

      let anonUserId = req.session.anonUserId;

      if(anonUserId)
        userModel.addUserAlias(user.id, anonUserId)
          .then(added => console.log('added alias for user', user.id, anonUserId));

      let analyticsData = {
        location: req.header('referer') || '',
        value: strategy,
        user_id: user.id
      }

      if(user.method === 'create') {
        analyticsData.event = 'Register';
      } else {
        analyticsData.event = 'SignIn';
      }
      analyticsModel.addAnalyticsEvent(analyticsData)
        .then(suc => {
          if(suc)
            console.log('added analytics event for', analyticsData.event);
          else
            console.log('failed to add analytics event for user', analyticsData.event);
        });

      req.logIn(user, err => {
        if(err) return next(err);
        req.session.anonUserId = '';

        if(noRedirect)
          return res.json({success: true});

        return res.redirect(req.header('referer') || '');
      });
    })(req, res, next);
  }
}

function ensureAuth(req, res, next) {
  if(req.isAuthenticated())
    logger.info('User is authenticated')
    return next(null);
  logger.info('Not authenticated')
  res.redirect('/');
}
