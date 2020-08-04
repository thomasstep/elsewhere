const { AuthenticationError } = require('apollo-server-micro');
const { log } = require('../../utils');

function getPlaceAuth(
  user,
) {
  const {
    id,
  } = user;

  if (id) {
    return;
  }

  log.error('No user account while trying to access getPlace.', {
    user,
  });

  throw new AuthenticationError('You need an account to query this endpoint.');
}

module.exports = {
  getPlaceAuth,
};
