const http = require('http');
const https = require('https');
const fs = require('fs');
const yaml = require('js-yaml');
let config = require('../config/')('config');

module.exports = function(app) {
  var server;

  if(process.env.NODE_ENV === 'production' && config.useSSL) {
    /* SSL Setup */
    var privateKey =  fs.readFileSync(config.privateKey)
    var cert = fs.readFileSync(config.sslCert);

    var options = {
        key: privateKey,
        cert: cert
    }

    // SSL server
    https.createServer(options, app).listen(443, err => {
      if(err) console.error(err);
      // get uid of the user who envoked the script
      var uid = parseInt(process.env.SUDO_UID);

      // revert node's uid back to the orignal user so it no longer has sudo priviledges
      if(uid) process.setuid(uid);

      console.log('running secure server on port 443');
    });
    // Redirect to SSL
    http.createServer((req, res) => {
      console.log('REDIRECTING ', req.url);
      res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url  });
      res.end();
    }).listen(80, () => console.log('listening on port 80'));

  } else {
    // Dev server
    http.createServer(app).listen(8080, () => console.log('listening on port 8080'));
  }
}
