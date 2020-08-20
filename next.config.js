require('dotenv').config();
require('./utils/db');

module.exports = {
  env: {
    MONGODB_URI: process.env.MONGODB_URI,
    GOOGLE_MAPS_KEY: process.env.GOOGLE_MAPS_KEY,
    JWT_SECRET: process.env.JWT_SECRET,
  },
};
