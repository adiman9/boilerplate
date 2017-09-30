const {
  getDbConnection,
  dbQuery
} = require('../db/db.js');

class WithLike {
  constructor(Handler) {
    return fn => {
      let handler;
      if(Handler)
        handler = new Handler();

      return (...args) => {
        return this.promiseWrapper(handler, fn, args);
      }
    };
  }
  promiseWrapper(handler, cb, args) {
    return new Promise((resolve, reject) => {
      if(handler)
        handler.enter(cb);

      cb.apply(cb, args)
        .then(result => {
          if(result instanceof Error)
            reject(result);

          resolve(result);
        });
    })
    .catch(err => {
      if(handler)
        handler.error(err)
      return err;
    })
    .then((val) => {
      if(handler)
        handler.exit(val);
      return val;
    });
  }
}

class Model {
  constructor(handler) {
    return new WithLike(handler);
  }
}

/*
 * An example of a handler that could be passed to the Model
 * Requires these three lifecycle methods.
 */
// class ModelSetupCleanup {
//   async enter(fn) {
//     // add code to do before everything
//   }
//   exit(val) {
//     // cleanup code
//     return val;
//   }
//   error(err) {
//     // handle errors
//     return err;
//   }
// }

module.exports = new Model();
module.exports.Model = Model;
