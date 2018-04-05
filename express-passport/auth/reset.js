const express = require('express');
const router = express.Router();
const userModel = require('../model/user');
const emailController = require('../controllers/email');

// /auth/reset
router.get('/:token', checkResetToken);
router.post('/:token', resetPassword);
router.post('/', createResetToken);


async function createResetToken(req, res, next) {
  console.log('creating reset link');
  let form = req.body;
  const {
    email,
  } = form;

  req.checkBody('email', 'Email is required').notEmpty();
  req.checkBody('email', 'Email not valid').isEmail();

  let result = await req.getValidationResult();
  let errors = result.array();

  if(errors.length) {
    res.json({errors})
  } else {
    let user = await userModel.getUserByEmail(email);

    if(user) {
      try {
        let token = await userModel.createPasswordResetToken(user.id);

        // TODO pull email, title, site etc from config Fri 28 Jul 17:56:38 2017
        await emailController.sendEmail(
          user.email,
          'noreply@hungryturtlecode.com',
          'Password Reset - Hungry Turtle Code',
          '',
          'forgotten_password',
          {
            token,
            site: 'http://localhost:4000'
          }
        );
        res.json({success: true});
      } catch(err) {
        res.json({error: 'Something went wrong, please try again'});
      }
    } else {
      res.json({success: true});
    }
  }
}

async function checkResetToken(req, res, next) {
  console.log('checking reset token');
  let token = req.params.token;

  let check = await userModel.checkResetToken(token);

  if(check) {
    res.json({success: true});
  } else {
    // TODO possible redirect back to /forgot Fri 28 Jul 18:05:59 2017
    res.json({error: 'Unknown or expired token'});
  }
}

async function resetPassword(req, res, next) {
  console.log('reseting password');
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
