const mongoose = require('mongoose');

const usersSchema = new mongoose.Schema({
  uuid: String,
  email: String,
  hashedPassword: String,
  ownedMaps: [String],
  writableMaps: [String],
  readableMaps: [String],
});

const mapsSchema = new mongoose.Schema({
  uuid: String,
  name: String,
  markers: [
    {
      lat: Number,
      lng: Number,
    },
  ],
  owners: [String],
  writers: [String],
  readers: [String],
});

const maps = mongoose.models.maps || mongoose.model('maps', mapsSchema);
const users = mongoose.models.users || mongoose.model('users', usersSchema);

module.exports = {
  maps,
  users,
};
