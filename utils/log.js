const winston = require('winston');

const log = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: {
    app: 'elsewhere',
  },
});

log.add(new winston.transports.Console({
  format: winston.format.simple(),
}));

module.exports = {
  log,
};
