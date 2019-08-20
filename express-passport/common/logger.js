const winston = require('winston');
const Mail = require('winston-mail').Mail;
winston.emitErrs = true;
const config = require('../config.js')('config');


const transports = [
  new winston.transports.File({
    level: 'info',
    filename: './logs/all-logs.log',
    handleExceptions: true,
    json: true,
    maxsize: 5242880, //5MB
    maxFiles: 10,
    colorize: false
  }),
  new winston.transports.Console({
    level: 'debug',
    handleExceptions: true,
    json: false,
    prettyPrint: true,
    colorize: true
  })
];

const errorTransports = process.env.environment === 'production' ? [
  getEmailTransport('HTC Error Log Report')
] : [];

const exceptionTransports = process.env.environment === 'production' ? [
  getEmailTransport('HTC uncaughtException Report')
] : [];


const logger = new winston.Logger({
  transports: transports.concat(errorTransports),
  exitOnError: false,
  exceptionHandlers: exceptionTransports,
});

module.exports = logger;
module.exports.stream = {
  write: (msg, enc) => {
    logger.info(msg);
  }
}
module.exports.suppress = () => {
  transports
    .concat([errorTransports, exceptionTransports])
    .forEach(trans => {
      trans.silent = true;
    });
}

function getEmailTransport(subject) {
  return new winston.transports.Mail({
    to: config.email.adminEmail,
    from: config.email.errorEmail,
    host: config.email.host,
    port: config.email.port,
    username: config.email.username,
    password: config.email.password,
    subject,
    ssl: true,
    level: 'error'
  })
}
