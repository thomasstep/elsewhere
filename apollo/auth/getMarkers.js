const { AuthenticationError } = require('apollo-server-micro');
const { log } = require('../../utils');

function getMarkersAuth(
  { mapId },
  user,
) {
  const {
    ownedMaps,
    writableMaps,
    readableMaps,
  } = user;

  if (ownedMaps.includes(mapId)) {
    return;
  }

  if (writableMaps.includes(mapId)) {
    return;
  }

  if (readableMaps.includes(mapId)) {
    return;
  }

  log.error('User does not have access to view this map.', {
    user,
    mapId,
  });

  throw new AuthenticationError('You do not have access to view this map.');
}

module.exports = {
  getMarkersAuth,
};
