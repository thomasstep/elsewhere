const { AuthenticationError } = require('apollo-server-micro');

function createMapAuth(
  args,
  { id },
) {
  if (id) {
    return;
  }

  throw new AuthenticationError('You do not have access to create a map.');
}

module.exports = {
  createMapAuth,
};
