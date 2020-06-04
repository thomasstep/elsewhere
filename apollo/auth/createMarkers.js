const { AuthenticationError } = require('apollo-server-micro');

function createMarkersAuth(
  { map },
  {
    ownedMaps,
    writableMaps,
  },
) {
  if (ownedMaps.includes(map)) {
    return;
  }

  if (writableMaps.includes(map)) {
    return;
  }

  throw new AuthenticationError('You do not have access to create markers on this map.');
}

module.exports = {
  createMarkersAuth,
};
