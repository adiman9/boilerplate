'use strict';
const crypto = require('crypto');

module.exports = {
  diffArrays,
  groupConcatStringToJson,
  hexStringToUUID,
  parseBase64,
  randomHexString,
  waitForAllPromises
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
