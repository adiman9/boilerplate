const yaml = require('js-yaml');
const fs = require('fs');
const utils = require('./utils.js');

module.exports = (configFile) => {
  let configObj;
  const configDir = utils.resolveHome(process.env.APP_CONFIG_DIRECTORY);

  try {
    configObj = yaml.safeLoad(fs.readFileSync(`${configDir}/${configFile}.yml`, 'utf-8'));
    return configObj || {};
  } catch(e) {
    console.error(`Config yml parse error: ${e}`);
  }
}
