// Dependencies
var express = require('express');
var router = express.Router();
var passport = require('passport');
var TwStrategy = require('passport-twitter').Strategy;
var config = require('../config/')('auth')
var userModel = require('../model/user');
const {
  authCallback
} = require('./utils');

// Setup passport Facebook strategy
passport.use(new TwStrategy({
    consumerKey: config.twitter.consumerKey,
    consumerSecret: config.twitter.consumerSecret,
    callbackURL: config.twitter.callbackURL,
    userProfileURL: "https://api.twitter.com/1.1/account/verify_credentials.json?include_email=true"
  },
  async function(accessToken, refreshToken, profile, done) {
    let user = await userModel.getOrCreateUserFromProfile(profile);
    done(null, user);
  }
));

/* ROUTES */

// /auth/twitter
router.get('/', passport.authenticate('twitter'));

// /auth/twitter/callback
router.get('/callback', authCallback('twitter'));

// Return router
module.exports = router;


