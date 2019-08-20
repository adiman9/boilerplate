exports.setHeaders = function (req, res, next) {
  // Website you wish to allow to connect
  const host = req.get('origin');
  if (
    host &&
    host.indexOf('http://localhost') === 0
  ) {
    setHeadersForRequest(req, res, next, host);
  } else if (!host) {
    const referer = req.get('referer');

    if (!referer) return next();

    const allowed = ['http://localhost:4000', 'http://localhost:8080'];

    for (let origin of allowed) {
      if (referer.indexOf(origin) === 0) {
        return setHeadersForRequest(req, res, next, origin);
      }
    }
    return next();
  } else {
    logger.warn(`request made from unknown host: ${host}`);
  }
};


function setHeadersForRequest(req, res, next, origin) {
  res.setHeader('Access-Control-Allow-Origin', origin);
  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Authorization');

  if(req.method === 'OPTIONS'){
    res.sendStatus(200);
  }else{
    next();
  }
}
