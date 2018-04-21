var express = require('express');
var router = express.Router();
const path = require('path');
const config = require('../config')('config');

router.get('/', (req, res) => {
  res.send('Home Route');
});

// Unknown route. 404
router.get('*', (req, res) => {
  if (config.serveStatic) {
    return res.sendFile(path.join(
      __dirname,
      '../../client', 'dist', 'index.html'
    ));
  }
  return res.render('404');
});

module.exports = router;
