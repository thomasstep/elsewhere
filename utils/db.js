const mongoose = require('mongoose');
const schemas = require('./dbSchemas');
const { log } = require('./log');


log.info('Mongoose ready state:');
log.info(mongoose.connection.readyState);
if (!mongoose.connection.readyStates) {
  mongoose.Promise = global.Promise;
  const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    bufferCommands: false,
    dbName: 'elsewhere',
    w: 'majority',
  };

  try {
    mongoose.connect(process.env.MONGODB_URI, options).then(() => {
      log.info('Connected to DB.');
    }, (err) => {
      log.error('Error callback connecting to DB.');
      log.error(err);
    });
  } catch (e) {
    log.error('Caught error connecting to DB.');
    log.error(e);
  }
}

module.exports = schemas;
