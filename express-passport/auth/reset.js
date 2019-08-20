const express = require('express');
const router = express.Router();
const userModel = require('../model/user');
const emailController = require('../controllers/email');
const logger = require('../../common/logger');
const config = require('../../config.js')('config');

// /auth/reset
router.get('/:token', checkResetToken);
router.post('/:token', resetPassword);
router.post('/', createResetToken);


async function createResetToken(req, res, next) {
  let form = req.body;
  const {
    email,
  } = form;
  logger.info(`password reset requested for email ${email}`);

  req.checkBody('email', 'Email is required').notEmpty();
  req.checkBody('email', 'Email not valid').isEmail();

  let result = await req.getValidationResult();
  let errors = result.array();

  if(errors.length) {
    logger.info('email validation for password reset failed. ${errors}');
    res.json({errors})
  } else {
    let user = await userModel.getUserByEmail(email);

    if(user) {
      logger.info(`creating password reset for ${user.id}`);
      try {
        let token = await userModel.createPasswordResetToken(user.id);

        // TODO pull email, title, site etc from config Fri 28 Jul 17:56:38 2017
        await emailController.sendEmail(
          user.email,
          config.email.resetPassEmail,
          'Password Reset - Hungry Turtle Code',
          '',
          'forgotten_password',
          {
            token,
            site: config.siteUrl
          }
        );
        res.json({success: true});
      } catch(err) {
        logger.error(`Error while creating password reset token: ${err}`);
        res.json({error: 'Something went wrong, please try again'});
      }
    } else {
      logger.info(`email ${email} not recognised against a valid user`);
      res.json({success: true});
    }
  }
}

async function checkResetToken(req, res, next) {
  logger.info('checking reset token');
  let token = req.params.token;

  let check = await userModel.checkResetToken(token);

  if(check) {
    res.json({success: true});
  } else {
    logger.info('Password reset token request check failed');
    // TODO possible redirect back to /forgot Fri 28 Jul 18:05:59 2017
    res.json({error: 'Unknown or expired token'});
  }
}

async function resetPassword(req, res, next) {
  logger.info('reseting password');
  let token = req.params.token;
  const {
    password,
    password2
  } = req.body;

  req.checkBody('password', 'Password is required').notEmpty();
  req.checkBody('password2', 'Passwords do not match').equals(password);

  let result = await req.getValidationResult();
  let errors = result.array();

  if(errors.length) {
    logger.info('Password reset form validation errors: ${errors}');
    return res.json({errors})
  }

  let check = await userModel.checkResetToken(token);

  if(check) {
    let success = await userModel.resetPassword(token, password);

    return res.json({success});
  } else {
    // TODO possible redirect back to /forgot Fri 28 Jul 18:05:59 2017
    return res.json({error: 'Unknown or expired token'});
  }
}

module.exports = router;
