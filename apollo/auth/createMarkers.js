const { AuthenticationError } = require('apollo-server-micro');
const { log } = require('../../utils');

function createMarkersAuth(
  { mapId },
  user,
) {
  const {
    ownedMaps,
    writableMaps,
  } = user;

  if (ownedMaps.includes(mapId)) {
    return;
  }

  if (writableMaps.includes(mapId)) {
    return;
  }

  log.error('User does not have access to create markers on this map.', {
    user,
    mapId,
  });

  throw new AuthenticationError('You do not have access to create markers on this map.');
}

module.exports = {
  createMarkersAuth,
};
