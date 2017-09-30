// Dependencies
var express = require('express');
var router = express.Router();

router.use('/facebook', require('./facebook'));
router.use('/google', require('./google'));
router.use('/twitter', require('./twitter'));
router.use('/github', require('./github'));


// Return router
module.exports = router;


