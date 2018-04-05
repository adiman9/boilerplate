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
    password2
  } = form;

  req.checkBody('email', 'Email is required').notEmpty();
  req.checkBody('email', 'Email not valid').isEmail();
  req.checkBody('password', 'Password is required').notEmpty();
  req.checkBody('password2', 'Passwords do not match').equals(password);

  let result = await req.getValidationResult();
  let errors = result.array();

  if(errors.length) {
    res.json({errors})
  } else {
    let user = await userModel.createUserWithPassword(email, password);

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
});

module.exports = router;
