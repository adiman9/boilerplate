// Dependencies
var express = require('express');
var router = express.Router();
var passport = require('passport');
var FbStrategy = require('passport-facebook').Strategy;
var config = require('../config')('auth')
const siteConfig = require('../config.js')('config');
var userModel = require('../model/user');
// TODO add logging to files Sat 30 Sep 13:49:25 2017
const {
  authCallback
} = require('./utils');

// Setup passport Facebook strategy
passport.use(new FbStrategy({
    clientID: config.facebook.clientID,
    clientSecret: config.facebook.clientSecret,
    callbackURL: siteConfig.apiUrl + '/' + siteConfig.apiVersion + config.facebook.callbackURL,
    profileFields: ['id', 'email', 'gender', 'link', 'locale', 'name', 'timezone', 'updated_time', 'verified', 'displayName', 'picture.type(large)'],
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

// /auth/facebook/callback
router.get('/callback', authCallback('facebook'));

// /auth/facebook
router.get('/:invite_code?',
  (req, res, next) => {
    req.session.referer = req.header('referer');
    req.session.inviteCode = req.params.invite_code;

    next();
  },
  passport.authenticate('facebook', { scope: ['email'] })
);

// Return router
module.exports = router;


