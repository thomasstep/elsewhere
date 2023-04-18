module.exports = {
  elsewhereApiUrl: process.env.ELSEWHERE_API_URL,
  authenticationServiceUrl: process.env.AUTH_SERVICE_URL,
  applicationId: process.env.AUTH_SERVICE_APP_ID,
  googleMapsKey: process.env.GOOGLE_MAPS_KEY,
  debug: (process.env.DEBUG || 'false') === 'true',
  jwtCookieName: '2cb0a000-d297-4b86-b652-8084021bccfd',
  refreshTokenName: '0dcb9c59-a57f-4e00-84ea-b7f02addc299',
  snackbarAutoCloseTime: 5000, // in milliseconds
  hourHeight: 40, // in px
};
