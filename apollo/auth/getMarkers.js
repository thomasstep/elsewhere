const { AuthenticationError } = require('apollo-server-micro');

function getMarkersAuth(
  { map },
  {
    ownedMaps,
    writableMaps,
    readableMaps,
  },
) {
  if (ownedMaps.includes(map)) {
    return;
  }

  if (writableMaps.includes(map)) {
    return;
  }

  if (readableMaps.includes(map)) {
    return;
  }

  throw new AuthenticationError('You do not have access to view this map.');
}

module.exports = {
  getMarkersAuth,
};
