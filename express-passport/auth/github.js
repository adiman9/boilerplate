// Dependencies
var express = require('express');
var router = express.Router();
var passport = require('passport');
var GhStrategy = require('passport-github2').Strategy;
var config = require('../config/')('auth')
var userModel = require('../model/user');
const {
  authCallback
} = require('./utils');

// Setup passport Facebook strategy
passport.use(new GhStrategy({
    clientID: config.github.clientID,
    clientSecret: config.github.clientSecret,
    callbackURL: config.github.callbackURL
  },
  async function(accessToken, refreshToken, profile, done) {
    let user = await userModel.getOrCreateUserFromProfile(profile);
    done(null, user);
  }
));

/* ROUTES */

// /auth/github
router.get('/', passport.authenticate('github', { scope: [ 'user:email' ] }));

// /auth/github/callback
router.get('/callback', authCallback('github'));

// Return router
module.exports = router;


