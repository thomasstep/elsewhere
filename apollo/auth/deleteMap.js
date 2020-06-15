const { AuthenticationError } = require('apollo-server-micro');

function deleteMapAuth(
  { mapId },
  {
    ownedMaps,
  },
) {
  if (ownedMaps.includes(mapId)) {
    return;
  }

  throw new AuthenticationError('You do not have access to delete this map.');
}

module.exports = {
  deleteMapAuth,
};
