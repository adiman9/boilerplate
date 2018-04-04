const sg = require('sendgrid')
  ('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');
const helper = require('sendgrid').mail;
const fs = require('fs');
const handlebars = require('handlebars');

const nodemailer = require('nodemailer');
const sgTransport = require('nodemailer-sendgrid-transport');

module.exports = {
  sendEmail,
}



// TODO pull the key from config Fri 28 Jul 14:27:23 2017;
const options = {
  auth: {
    api_key: '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'
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
      console.log('something went wrong reading file', obj.template, err);
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
      if(err) return reject(err);
      console.log('Message sent:', info);
      resolve(info.response)
    });
  });
}
