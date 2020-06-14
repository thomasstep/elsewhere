const { AuthenticationError } = require('apollo-server-micro');

function createMarkersAuth(
  { mapId },
  {
    ownedMaps,
    writableMaps,
  },
) {
  if (ownedMaps.includes(mapId)) {
    return;
  }

  if (writableMaps.includes(mapId)) {
    return;
  }

  throw new AuthenticationError('You do not have access to create markers on this map.');
}

module.exports = {
  createMarkersAuth,
};
