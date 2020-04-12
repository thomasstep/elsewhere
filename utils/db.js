const MongoClient = require('mongodb').MongoClient;
const uri = process.env.MONGODB_URI;

// const client = new MongoClient(uri, { useNewUrlParser: true });
// client.connect(err => {
//   const collection = client.db("test").collection("devices");
//   // perform actions on the collection object
//   client.close();
// });

const sampleMarkers = {
  '1': {
      markers: [
        {lat: 25.774, lng: -80.190},
        {lat: 18.466, lng: -66.118},
        {lat: 32.321, lng: -64.757},
        {lat: 25.774, lng: -80.190}
      ],
  }
}

function getMarkers(mapId) {
  return sampleMarkers[mapId].markers;
}

module.exports = {
  getMarkers,
};
