const MongoClient = require('mongodb').MongoClient;
const uri = process.env.MONGODB_URI;

const clientOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}
const client = new MongoClient(uri, clientOptions);
// const connection = client.connect(err => {
//   console.error(err)
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
  console.log(mapId)
  return client.connect(err => {
    return client.db('elsewhere').collection('maps').findOne({ map: mapId }, (err, docs) => {
      console.log('Found these:')
      console.log(docs)
      return docs.markers;
    });
  });
  // const map = connection.then((err) => {
  //   console.error(err);
  //   const map = connection.db('elsewhere').collection('maps').find({ map: mapId });
  //   console.log(map)
  // })
  return sampleMarkers[mapId].markers;
}

module.exports = {
  getMarkers,
};
