const { AuthenticationError } = require('apollo-server-micro');

function deleteMarkersAuth(
  { map },
  {
    ownedMaps,
    writableMaps,
  },
) {
  if (
    !ownedMaps.includes(map)
    && !writableMaps.includes(map)
  ) {
    throw new AuthenticationError('You do not have access to delete markers from this map.');
  }
  // If you have access to the map then you're good to go
}

module.exports = {
  deleteMarkersAuth,
};
