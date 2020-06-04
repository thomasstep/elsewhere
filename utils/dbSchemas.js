const mongoose = require('mongoose');

const usersSchema = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
  },
  email: String,
  hashedPassword: String,
  ownedMaps: [String],
  writableMaps: [String],
  readableMaps: [String],
});

const mapsSchema = new mongoose.Schema({
  // The map field is a UUID used to identify the map
  map: {
    type: String,
    unique: true,
  },
  name: String,
  markers: [
    {
      lat: Number,
      lng: Number,
    },
  ],
});

const maps = mongoose.models.maps || mongoose.model('maps', mapsSchema);
const users = mongoose.models.users || mongoose.model('users', usersSchema);

module.exports = {
  maps,
  users,
};
