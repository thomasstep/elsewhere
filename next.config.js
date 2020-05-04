require('dotenv').config();
module.exports = {
  env: {
    MONGODB_URI: process.env.MONGODB_URI,
    GOOGLE_MAPS_KEY: process.env.GOOGLE_MAPS_KEY,
  },
}
