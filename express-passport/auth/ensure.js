const logger = require('../common/logger');

module.exports = function(req, res, next) {
  if(req.isAuthenticated())
    logger.info('User is authenticated')
    return next(null);
  logger.info('Not authenticated')
  res.redirect('/');
}
