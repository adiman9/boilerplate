const express = require('express');
const router = express.Router();
const userModel = require('../model/user');
const analyticsModel = require('../model/analytics');

// /auth/register
router.post('/', async (req, res, next) => {
  let form = req.body;
  const {
    email,
    password,
    password2,
    inviteCode,
  } = form;

  req.checkBody('email', 'Email is required').notEmpty();
  req.checkBody('email', 'Email not valid').isEmail();
  req.checkBody('password', 'Password is required').notEmpty();
  req.checkBody('password2', 'Passwords do not match').equals(password);
  req.checkBody('inviteCode', 'Invite code is required').notEmpty();

  let result = await req.getValidationResult();
  let errors = result.array();

  if(errors.length) {
    res.json({errors})
  } else {
    let emailExists = await userModel.checkIfEmailExists(email);
    if (emailExists) {
      return res.json({
        errors: {
          email: 'Email exists already',
        }
      })
    }

    const inviteValid = await userModel.isInviteCodeValid(inviteCode);

    if (!inviteValid) {
      return res.json({
        errors: {
          inviteCode: 'Invalid invite code',
        }
      });
    }

    let user = await userModel.createUserWithPassword(email, password);

    if (user.id) {
      const useInviteSuccess = await userModel.useInviteCode(user.id, inviteCode);

      if (!useInviteSuccess) {
        // TODO handle error Mon 27 Aug 22:53:47 2018
      }

      const analyticsData = {
        user_id: user.id,
        location: req.header('referer') || '',
        event: 'Register',
        value: 'EmailAndPassword'
      }

      analyticsModel.addAnalyticsEvent(analyticsData)
        .then(suc => {
          if(suc)
            console.log('added analytics event for register');
          else
            console.log('failed to add analytics event for user register');
        });

      req.logIn(user, err => {
        if(err) return next(err);
        // TODO probably redirect to some sort of profile / onboarding page Thu 20 Jul 2017 01:49:01 UTC
        res.json({success: true, name: user.email});
      });
    }
  }
});

module.exports = router;
