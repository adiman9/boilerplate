// Dependencies
var express = require('express');
var router = express.Router();
var passport = require('passport');
var TwStrategy = require('passport-twitter').Strategy;
var config = require('../config')('auth')
const siteConfig = require('../config.js')('config');
var userModel = require('../model/user');
const {
  authCallback
} = require('./utils');

// Setup passport Twitter strategy
passport.use(new TwStrategy({
    consumerKey: config.twitter.consumerKey,
    consumerSecret: config.twitter.consumerSecret,
    callbackURL: siteConfig.apiUrl + '/' + siteConfig.apiVersion + config.twitter.callbackURL,
    userProfileURL: "https://api.twitter.com/1.1/account/verify_credentials.json?include_email=true"
  },
  async function(accessToken, refreshToken, profile, done) {
    const isValid = await userModel.verifyProfile(profile);

    if (isValid.valid) {
      return done(null, {
        ...profile,
        exists: isValid.exists,
      });
    }

    done('Email already in use', null);
  }
));

/* ROUTES */

// /auth/twitter/callback
router.get('/callback', authCallback('twitter'));

// /auth/twitter
router.get('/:invite_code?',
  (req, res, next) => {
    req.session.referer = req.header('referer');
    req.session.inviteCode = req.params.invite_code;

    next();
  },
  passport.authenticate('twitter')
);

// Return router
module.exports = router;


