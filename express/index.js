var express = require('express');
var bodyParser = require('body-parser');
var logger = require('./common/logger');
const common = require('./common/index.js');
const config = require('./config')('config');

var serverSetup = require('./common/serverSetup');

var app = express();

/* APP SETUP */
app.disable('x-powered-by');
if (config.serveStatic) {
  app.use(express.static('../client/dist'))
}
app.use(common.setHeaders);
app.use(bodyParser.json({
  limit: '10mb'
}));
app.use(bodyParser.urlencoded({
  extended: true,
  limit: '10mb'
}));
app.use(require('morgan')('combined', { 'stream': logger.stream }));

// Sessions
app.use(require('./common/sessions')(app));

/* Routes */
app.use(require('./routes/'));

app.use((err, req, res, next) => {
  res
    .status(500)
    .send('Access Denied');
});

serverSetup(app);
