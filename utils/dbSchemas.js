const mongoose = require('mongoose');

const usersSchema = new mongoose.Schema({
  id: String,
  email: String,
  hashedPassword: String,
});

const mapsSchema = new mongoose.Schema({
  map: String,
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
