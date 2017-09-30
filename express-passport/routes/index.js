var express = require('express');
var router = express.Router();

router.use('/v0/auth', require('../auth/index.js'));

router.get('/', (req, res) => {
  res.render('hello');
});

// Unknown route. 404
router.get('*', (req, res) => { res.render('404') });

module.exports = router;
