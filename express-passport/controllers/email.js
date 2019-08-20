const config = require('../config.js')('config')
const sg = require('sendgrid')(config.sendgrid.apikey);
const helper = require('sendgrid').mail;
const fs = require('fs');
const handlebars = require('handlebars');
const logger = require('../common/logger');

const nodemailer = require('nodemailer');
const sgTransport = require('nodemailer-sendgrid-transport');

module.exports = {
  sendEmail,
}

const options = {
  auth: {
    api_key: config.sendgrid.apikey
  }
}

const mailer = nodemailer.createTransport(sgTransport(options));

// Available email templates
const templates = {
  "forgotten_password": {
    template: 'templates/forgotten_pass.email.html',
    compiled: null
  },
}

// Precompiling all of the templates
Object.keys(templates).forEach(key => {
  let obj = templates[key];

  fs.readFile(obj.template, 'utf-8', (err, source) => {
    if(err) {
      logger.error('something went wrong reading file', obj.template, err);
      return;
    }
    obj.compiled = handlebars.compile(source);
  });
});


/*
 * Implementations
 */
function sendEmail(to, from, subject, message, template, template_data){

  let compiled_html = message;
  if(template && templates[template]) {
    template_data.message = message;
    compiled_html = templates[template].compiled(template_data);
  }

  const email = {
    to,
    from,
    subject,
    text: message,
    html: compiled_html
  }

  return new Promise((resolve, reject) => {
    mailer.sendMail(email, (err, info) => {
      if(err) {
        logger.error(`error sending email: ${err}`);
        return reject(err);
      }
      logger.info(`Message sent: ${JSON.stringify(info)}`);
      resolve(info.response)
    });
  });
}
