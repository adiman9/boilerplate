var express = require('express');
var router = express.Router();

router.get('/', (req, res) => {
  res.send('Home Route');
});

module.exports = router;
