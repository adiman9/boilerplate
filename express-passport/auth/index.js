// Dependencies
var express = require('express');
var router = express.Router();
const analyticsModel = require('../model/analytics');

// Return if the user is currently logged in or not
router.get('/', (req, res) => {
  const user = req.user;
  res.json({loggedIn: user.provider !== 'anonymous'});
});
// Log user out
router.delete('/', (req, res) => {
  if(req.user) {
    const analyticsData = {
      user_id: req.user.id,
      location: req.header('referer') || '',
      event: 'SignOut',
      value: ''
    }

    analyticsModel.addAnalyticsEvent(analyticsData)
      .then(suc => {
        if(suc)
          console.log('added analytics event for sign out');
        else
          console.log('failed to add analytics event for user signout');
      });
  }

  req.logOut();
  res.json({success: true});
});

router.use('/facebook', require('./facebook'));
router.use('/google', require('./google'));
router.use('/twitter', require('./twitter'));
router.use('/github', require('./github'));
router.use('/login', require('./local'));
router.use('/register', require('./register'));
router.use('/reset', require('./reset'));


// Return router
module.exports = router;
