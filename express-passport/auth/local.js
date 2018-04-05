// Dependencies
var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
const userModel = require('../model/user');
const {
  authCallback
} = require('./utils');

// Setup passport Facebook strategy
passport.use(new LocalStrategy(
  async function(email, password, done) {
    // TODO pass better errors along Thu 20 Jul 2017 00:03:59 UTC
    let user = await userModel.getUserByEmail(email);
    if(!user) {
      // user not found
      return done(null, false);
    }

    let valid_pass = await userModel.verifyUserPassword(user.id, password);

    if(!valid_pass) {
      // wrong password
      return done(null, false);
    }
    done(null, user);
  }
));

/* ROUTES */

router.post('/', authCallback('local', true));

// Return router
module.exports = router;


