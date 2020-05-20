// Back end utils ONLY
// importing this from the front end will throw errors for fs not being available
const schemas = require('./db');
const { log } = require('./log');

module.exports = {
  ...schemas,
  log,
};
