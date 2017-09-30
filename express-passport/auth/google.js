// Dependencies
var express = require('express');
var router = express.Router();
var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var config = require('../config/')('auth')
var userModel = require('../model/user');

// Setup passport Facebook strategy
passport.use(new GoogleStrategy({
    clientID: config.google.clientID,
    clientSecret: config.google.clientSecret,
    callbackURL: config.google.callbackURL
  },
  async function(accessToken, refreshToken, profile, done) {
    let user = await userModel.getOrCreateUserFromProfile(profile);
    done(null, user);
  }
));

/* ROUTES */

// /auth/google
router.get('/', 
  passport.authenticate('google', { 
    scope: [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile'
    ]
  })
);

// /auth/google/callback
router.get('/callback', 
  passport.authenticate(
    'google', { 
      failureRedirect: '/'
    }
  ),
  (req, res) => {
    res.redirect('/profile');
  }
);

// Return router
module.exports = router;


