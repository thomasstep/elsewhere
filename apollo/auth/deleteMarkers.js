const { AuthenticationError } = require('apollo-server-micro');

function deleteMarkersAuth(
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

  throw new AuthenticationError('You do not have access to delete markers from this map.');
}

module.exports = {
  deleteMarkersAuth,
};
