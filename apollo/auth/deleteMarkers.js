const { AuthenticationError } = require('apollo-server-micro');

function deleteMarkersAuth(
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

  throw new AuthenticationError('You do not have access to delete markers from this map.');
}

module.exports = {
  deleteMarkersAuth,
};
