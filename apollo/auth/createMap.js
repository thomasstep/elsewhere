const { AuthenticationError } = require('apollo-server-micro');
const { log } = require('../../utils');

function createMapAuth(
  args,
  user,
) {
  const { id } = user;

  if (id) {
    return;
  }

  log.error('User does not have access to create a map.', {
    user,
    args,
  });

  throw new AuthenticationError('You do not have access to create a map.');
}

module.exports = {
  createMapAuth,
};
