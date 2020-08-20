const mongoose = require('mongoose');
const schemas = require('./dbSchemas');
const { log } = require('./log');

// async function connectMongo() {
//   if (!mongoose.connection.readyStates) {
//     mongoose.Promise = global.Promise;
//     const options = {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//       bufferCommands: false,
//       dbName: 'elsewhere',
//       w: 'majority',
//       useFindAndModify: false,
//     };

//     try {
//       log.info('Attempting to connect to DB.');
//       await mongoose.connect(process.env.MONGODB_URI, options);
//       log.info('Connected to DB.');
//     } catch (e) {
//       log.error('Caught error connecting to DB.');
//       log.error(e);
//     }
//   } else {
//     log.info('DB already connected.');
//   }
// }

module.exports = {
  // connectMongo,
  ...schemas,
};

if (!mongoose.connection.readyStates) {
  mongoose.Promise = global.Promise;
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
    mongoose.connect(process.env.MONGODB_URI, options);
    log.info('Connected to DB.');
  } catch (e) {
    log.error('Caught error connecting to DB.');
    log.error(e);
  }
} else {
  log.info('DB already connected.');
}
