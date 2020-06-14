const { AuthenticationError } = require('apollo-server-micro');

function getMarkersAuth(
  { mapId },
  {
    ownedMaps,
    writableMaps,
    readableMaps,
  },
) {
  if (ownedMaps.includes(mapId)) {
    return;
  }

  if (writableMaps.includes(mapId)) {
    return;
  }

  if (readableMaps.includes(mapId)) {
    return;
  }

  throw new AuthenticationError('You do not have access to view this map.');
}

module.exports = {
  getMarkersAuth,
};
