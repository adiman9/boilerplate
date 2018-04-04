var express = require('express');
var router = express.Router();

// /v0
router.use('/auth', require('../auth/index.js'));

router.get('/', (req, res) => {
  res.render('v0 API root endpoint');
});

// Unknown route. 404
router.get('*', (req, res) => { res.render('404') });

module.exports = router;
