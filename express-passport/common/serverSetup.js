const http = require('http');
let config = require('../config/')('config');
const logger = require('./logger');

module.exports = (app) => {
  http.createServer(app)
    .listen(8080, () => logger.info('listening on port 8080'));
}
