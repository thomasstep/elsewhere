const { AuthenticationError } = require('apollo-server-micro');
const { log } = require('../../utils');

function updateMapAuth(
  { updates: { mapId } },
  user,
) {
  const {
    ownedMaps,
  } = user;

  if (ownedMaps.includes(mapId)) {
    return;
  }

  log.error('User does not have access to update this map.', {
    user,
    mapId,
  });

  throw new AuthenticationError('You do not have access to update this map.');
}

module.exports = {
  updateMapAuth,
};
