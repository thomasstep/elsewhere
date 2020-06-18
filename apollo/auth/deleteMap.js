const { AuthenticationError } = require('apollo-server-micro');
const { log } = require('../../utils');

function deleteMapAuth(
  { mapId },
  user,
) {
  const {
    ownedMaps,
  } = user;

  if (ownedMaps.includes(mapId)) {
    return;
  }

  log.error('User does not have access to delete this map.', {
    user,
    mapId,
  });

  throw new AuthenticationError('You do not have access to delete this map.');
}

module.exports = {
  deleteMapAuth,
};
