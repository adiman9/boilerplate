exports.setHeaders = function (req, res, next) {
  // Website you wish to allow to connect
  const host = req.get('origin');
  if (
    host &&
    host.indexOf('http://localhost') === 0
  ) {
    res.setHeader('Access-Control-Allow-Origin', host);
  }

  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
};
