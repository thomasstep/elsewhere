module.exports = {
  elsewhereApiUrl: process.env.ELSEWHERE_API_URL,
  authenticationServiceUrl: process.env.AUTH_SERVICE_URL,
  applicationId: process.env.AUTH_SERVICE_APP_ID,
  googleMapsKey: process.env.GOOGLE_MAPS_KEY,
  debug: (process.env.DEBUG || 'false') === 'true',
  jwtCookieName: 'authToken',
  newEntryFormView: 'newEntry',
  activeEntryFormView: 'activeEntry',
  mapView: 'map',
  scheduleView: 'schedule',
};
