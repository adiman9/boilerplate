// Dependencies
var express = require('express');
var router = express.Router();
var passport = require('passport');
var GhStrategy = require('passport-github2').Strategy;
var config = require('../config')('auth')
const siteConfig = require('../config.js')('config');
var userModel = require('../model/user');
const {
  authCallback
} = require('./utils');

// Setup passport Facebook strategy
passport.use(new GhStrategy({
    clientID: config.github.clientID,
    clientSecret: config.github.clientSecret,
    callbackURL: siteConfig.apiUrl + '/' + siteConfig.apiVersion + config.github.callbackURL,
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

// /auth/github/callback
router.get('/callback', authCallback('github'));

// /auth/github
router.get('/:invite_code?',
  (req, res, next) => {
    req.session.referer = req.header('referer');
    req.session.inviteCode = req.params.invite_code;

    next();
  },
  passport.authenticate('github', { scope: [ 'user:email' ] })
);

// Return router
module.exports = router;


