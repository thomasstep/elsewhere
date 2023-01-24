require('dotenv').config();

module.exports = {
  env: {
    ELSEWHERE_API_URL: process.env.ELSEWHERE_API_URL,
    AUTH_SERVICE_URL: process.env.AUTH_SERVICE_URL,
    AUTH_SERVICE_APP_ID: process.env.AUTH_SERVICE_APP_ID,
    GOOGLE_MAPS_KEY: process.env.GOOGLE_MAPS_KEY,
    GOOGLE_PLACES_KEY: process.env.GOOGLE_PLACES_KEY,
  },
};
