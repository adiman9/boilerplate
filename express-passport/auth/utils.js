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
    passport.authenticate(strategy, async (err, profile, info) => {
      const ref = req.session.referer.split('?')[0];
      req.session.referer = '';
      if(!profile) return res.json({error: 'Unkown Credentials'});

      if (err === 'Email already in use') {
        if (noRedirect) {
          return res.json({ success: false, error: 'Email already in use' });
        }
        // TODO redirect to an actual error page Fri 10 Aug 22:44:49 2018
        return res.redirect(ref + '/?error=true' || '');
      }
      // TODO redirect to an actual error page Fri 10 Aug 22:44:49 2018
      if(err) return res.json({error: 'Something went wrong. Please try again'});

      if (!profile.exists) {
        const inviteCode = req.session.inviteCode;
        const inviteValid = await userModel.isInviteCodeValid(inviteCode);

        if (!inviteValid) {
          if (noRedirect) {
            return res.json({ success: false, error: 'Invalid invite code' });
          }
          return res.redirect(ref + '/?error=invalid invite code' || '');
        }
      }
      let user = await userModel.getOrCreateUserFromProfile(profile);

      if(!user) return res.json({error: 'Unkown Credentials'});

      if (!profile.exists) {
        let inviteUseSuccess = await userModel.useInviteCode(user.id, req.session.inviteCode);

        if (!inviteUseSuccess) {
          // TODO deal with errors Mon 27 Aug 22:39:44 2018
        }
        req.session.inviteCode = '';
      }

      let anonUserId = req.session.anonUserId;

      if(anonUserId)
        userModel.addUserAlias(user.id, anonUserId)
          .then(added => console.log('added alias for user', user.id, anonUserId));

      const analyticsData = {
        location: ref || '',
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

        return res.redirect(ref || '');
      });
    })(req, res, next);
  }
}

function ensureAuth(req, res, next) {
  if(req.isAuthenticated()) {
    logger.info('User is authenticated')
    return next(null);
  }
  logger.info('Not authenticated')
  res.redirect('/');
}
