const { graphql, buildSchema } = require('graphql');

const { getMarkers } = require('../../utils/db');

const schema = buildSchema(`
  type Marker {
    lat: Float!
    lng: Float!
  }

  type Query {
    hello: String!
    getMarkers(id: ID!): [Marker]!
  }
`);

const resolvers = {
  // Query: {
    hello: (_parent, _args, _context) => "Hello!",
    getMarkers: (parent, args, context) => {
      console.log('HISDJLFK:SJD:OLI')
      return getMarkers(args.id);
    },
  // },
};

module.exports = async (req, res) => {
  const query = req.body.query;
  const response = await graphql(schema, query, resolvers);

  return res.end(JSON.stringify(response));
};

module.exports({
  body: {
    query: 'query{getMarkers(id:1){lat lng}}'
  }
}, {
  end: (res) => {
    console.log(res)
  }
})
