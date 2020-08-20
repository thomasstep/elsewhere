const mongoose = require('mongoose');
const schemas = require('./dbSchemas');
const { log } = require('./log');

const connection = {};

async function connectMongo() {
  if (connection.isConnected) {
    log.info('DB already connected.');
    return;
  }

  // if (!mongoose.connection.readyStates) {
  //   mongoose.Promise = global.Promise;
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      bufferCommands: false,
      dbName: 'elsewhere',
      w: 'majority',
      useFindAndModify: false,
    };

    try {
      log.info('Attempting to connect to DB.');
      const db = await mongoose.connect(process.env.MONGODB_URI, options);
      log.info('Connected to DB.');
      connection.isConnected = db.connections[0].readyState;
    } catch (e) {
      log.error('Caught error connecting to DB.');
      log.error(e);
    }
  // } else {
  //   log.info('DB already connected.');
  // }
}

// if (!mongoose.connection.readyStates) {
//   mongoose.Promise = global.Promise;
//   const options = {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//     bufferCommands: false,
//     dbName: 'elsewhere',
//     w: 'majority',
//     useFindAndModify: false,
//   };

//   try {
//     log.info('Attempting to connect to DB.');
//     mongoose.connect(process.env.MONGODB_URI, options);
//     log.info('Connected to DB.');
//   } catch (e) {
//     log.error('Caught error connecting to DB.');
//     log.error(e);
//   }
// } else {
//   log.info('DB already connected.');
// }

module.exports = {
  connectMongo,
  ...schemas,
};
