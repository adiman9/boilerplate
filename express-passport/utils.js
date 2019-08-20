'use strict';
const crypto = require('crypto');
const path = require('path');

module.exports = {
  beauty,
  diffArrays,
  groupConcatStringToJson,
  hexStringToUUID,
  parseBase64,
  randomHexString,
  waitForAllPromises,
  resolveHome,
  shuffle,
  getFunctionName,
  isPOJO,
  getAllFuncs,
}

// Polyfill for inserting strings into middle of existing strings
if (!String.prototype.splice) {
  String.prototype.splice = function(idx, rem, str) {
    return this.slice(0, idx) + str + this.slice(idx + Math.abs(rem));
  };
}

function randomHexString(length) {
  return new Promise((resolve, reject) => {
    crypto.randomBytes(length, function(err, buf) {
      if(err) return reject(err);

      resolve(buf.toString('hex'));
    });
  });
}

function parseBase64(obj) {
  let base64Split = obj.split(',');
  let encodingSplit = base64Split[0].split(';');

  let encoding = encodingSplit[1];
  let type = encodingSplit[0].split(':')[1];
  let base64Data = base64Split[1];

  let buf = new Buffer(base64Data, 'base64');

  return {
    data: buf,
    encoding: encoding,
    file_type: type
  }
}

function diffArrays(arr1, arr2) {
  let hashtables = {
    'a': {},
    'b': {}
  };
  arr1.forEach(item => {
    hashtables['a'][item] = true;
  });
  arr2.forEach(item => {
    hashtables['b'][item] = true;
  });

  let removed = arr1.filter(item => {
    return !(item in hashtables['b']);
  });
  let added = arr2.filter(item => {
    return !(item in hashtables['a']);
  });

  return {
    added,
    removed
  };
}

function waitForAllPromises(proms) {
  let count = 0;
  let numOfProms = proms.length || Object.keys(proms).length;

  return new Promise((resolve, reject) => {
    if(proms instanceof Array){
      proms.forEach(promise => {
        promise
          .then(() => {
            count++;
            if(count === numOfProms) {
              resolve(true);
            }
          })
          .catch(() => resolve(false));
      });
    } else if (proms instanceof Object) {
      let results = {};
      Object.keys(proms).forEach(key => {
        proms[key]
          .then(res => {
            results[key] = res;
            count++;
            if(count === numOfProms) {
              resolve(results);
            }
          })
          .catch(() => resolve(false));
      });
    } else {
      console.error('arg passed to waitForAllPromises is not an array');
    }
  });
}

function hexStringToUUID(str) {
  let resId = str.toLowerCase();
  resId = resId.splice(8, 0, '-');
  resId = resId.splice(13, 0, '-');
  resId = resId.splice(18, 0, '-');
  resId = resId.splice(23, 0, '-');

  return resId;
}

function groupConcatStringToJson(str) {
  let arr = str.split('/END/');

  let items = arr.map(r => {
    let vals = r.split('::::');
    return vals.reduce((obj, val) => {
      let keyval = val.split('====');
      obj[keyval[0]] = keyval[1];
      return obj;
    }, {});
  });

  return items;
}

function resolveHome(filepath) {
  if (filepath[0] === '~') {
    return path.join(process.env.HOME, filepath.slice(1));
  }
  return filepath;
}

function beauty(data) {
  console.log(JSON.stringify(data, null, 4));
}

function shuffle(a) {
  const result = [...a];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const x = result[i];
    result[i] = result[j];
    result[j] = x;
  }
  return result;
}

function getFunctionName(fn) {
  if (fn.name) {
    return fn.name;
  }
  return (fn.toString().trim().match(/^function\s*([^\s(]+)/) || [])[1];
}

/*!
 * Determines if `arg` is a plain old JavaScript object (POJO). Specifically,
 * `arg` must be an object but not an instance of any special class, like String,
 * ObjectId, etc.
 *
 * `Object.getPrototypeOf()` is part of ES5: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/getPrototypeOf
 *
 * @param {Object|Array|String|Function|RegExp|any} arg
 * @api private
 * @return {Boolean}
 */

function isPOJO(arg) {
  if (arg == null || typeof arg !== 'object') {
    return false;
  }
  const proto = Object.getPrototypeOf(arg);
  // Prototype may be null if you used `Object.create(null)`
  // Checking `proto`'s constructor is safe because `getPrototypeOf()`
  // explicitly crosses the boundary from object data to object metadata
  return !proto || proto.constructor.name === 'Object';
}

function getAllFuncs(obj) {
  let props = [];
  let tempObj = obj;

  do {
    props = props.concat(Object.getOwnPropertyNames(tempObj));
    tempObj = Object.getPrototypeOf(tempObj);
  } while (tempObj && tempObj !== Object.prototype);

  return props
    .sort()
    .filter((e, i, arr) => {
      const skip = ['arguments', 'caller', 'callee', 'constructor', 'bind', 'apply', 'call', 'toString'];
      if (skip.includes(e)) {
        return false;
      }
      if (e !== arr[i + 1] && typeof obj[e] === 'function') {
        return true;
      }
      return false;
    });
}
