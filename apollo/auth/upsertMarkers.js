const { AuthenticationError } = require('apollo-server-micro');

function upsertMarkersAuth(
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
    throw new AuthenticationError('You do not have access to upsert markers to this map.');
  }
  // If you have access to the map then you're good to go
}

module.exports = {
  upsertMarkersAuth,
};
