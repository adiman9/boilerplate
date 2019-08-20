// Dependencies
var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
const userModel = require('../model/user');
const {
  authCallback
} = require('./utils');
const logger = require('../../common/logger');

// Setup passport Local strategy
passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    session: true
  },
  async function(email, password, done) {
    // TODO pass better errors along Thu 20 Jul 2017 00:03:59 UTC
    let user = await userModel.getUserByEmail(email);
    if(!user) {
      // user not found
      logger.info('User not found for email ${email}');
      return done(null, false);
    }

    let valid_pass = await userModel.verifyUserPassword(user.id, password);

    if(!valid_pass) {
      // wrong password
      logger.info('invalid password for user ${user.id}');
      return done(null, false);
    }

    done(null, {
      ...user,
      exists: true,
    });
  }
));

/* ROUTES */

router.post('/', (req, res, next) => {
  req.session.referer = req.header('referer');

  next();
}, authCallback('local', true));

// Return router
module.exports = router;


