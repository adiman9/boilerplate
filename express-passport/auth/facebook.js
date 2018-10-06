// Dependencies
var express = require('express');
var router = express.Router();
var passport = require('passport');
var FbStrategy = require('passport-facebook').Strategy;
var config = require('../config/')('auth')
var userModel = require('../model/user');
// TODO add logging to files Sat 30 Sep 13:49:25 2017
const {
  authCallback
} = require('./utils');

// Setup passport Facebook strategy
passport.use(new FbStrategy({
    clientID: config.facebook.clientID,
    clientSecret: config.facebook.clientSecret,
    callbackURL: config.facebook.callbackURL,
    profileFields: ['id', 'email', 'gender', 'link', 'locale', 'name', 'timezone', 'updated_time', 'verified', 'displayName', 'picture.type(large)'],
  },
  async function(accessToken, refreshToken, profile, done) {
    // TODO error handling on all the different strategies Sat 30 Sep 13:48:52 2017
    let user = await userModel.getOrCreateUserFromProfile(profile);
    done(null, user);
  }
));

/* ROUTES */

// /auth/facebook
router.get('/', passport.authenticate('facebook', { scope: ['email']}));

// /auth/facebook/callback
router.get('/callback', authCallback('facebook'));

// Return router
module.exports = router;


