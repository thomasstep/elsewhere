const mongoose = require('mongoose');
require('dotenv').config({ path: `${__dirname}\\..\\..\\.env`});
const { maps } = require('./dbSchemas');

let connection;

console.log('Mongoose ready state:')
console.log(mongoose.connection.readyState)
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
    connection = mongoose.connect(process.env.MONGODB_URI, options).then(() => {
      console.log('Connected to DB.');
    }, (err) => {
      console.error('Error callback connecting to DB.');
      console.error(err);
    });
  } catch (e) {
    console.error('Caught error connecting to DB.');
    console.error(e);
  }
}

module.exports = {
  maps,
};
