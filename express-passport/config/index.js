const yaml = require('js-yaml');
const fs = require('fs');

module.exports = (config) => {
  let configObj;

  try {
    configObj = yaml.safeLoad(fs.readFileSync(__dirname + '/' + config + '.yml', 'utf-8'));
    return configObj || {};
  } catch(e) {
    console.error(e);
  }
}
