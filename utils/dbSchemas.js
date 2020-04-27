const mongoose = require('mongoose');

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

module.exports = {
  maps,
};
