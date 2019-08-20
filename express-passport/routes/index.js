var express = require('express');
var router = express.Router();
const path = require('path');
const config = require('../config')('config');
const logger = require('../common/logger');

router.use('/v0', require('./api.v0'));

router.get('/', (req, res) => {
  logger.info(`${req.user.id} requested api root. Not allowed.`);
  res
    .status(400)
    .send('Access Denied');
});

// Unknown route. 404
router.get('*', (req, res) => {
  if (config.serveStatic) {
    return res.sendFile(path.join(
      __dirname,
      '../../client', 'dist', 'index.html'));
  }
  return res.render('404')
});

module.exports = router;
