const { AuthenticationError } = require('apollo-server-micro');

function getMarkersAuth(
  { map },
  {
    ownedMaps,
    writableMaps,
    readableMaps,
  },
) {
  if (
    !ownedMaps.includes(map)
    && !writableMaps.includes(map)
    && !readableMaps.includes(map)
  ) {
    throw new AuthenticationError('You do not have access to view this map.');
  }
  // If you have access to the map then you're good to go
}

module.exports = {
  getMarkersAuth,
};
