const { ApolloServer, gql } = require('apollo-server-micro');
const { maps } = require('./utils/db');

const schema = gql`
  type Marker {
    lat: Float!
    lng: Float!
  }

  type Query {
    hello: String!
    getMarkers(id: ID!): [Marker]!
  }
`;

const resolvers = {
  Query: {
    hello: (parent, args, context) => "Hello!",
    getMarkers: async (parent, args) => {
      const { markers } = await maps.findOne({ map: args.id });
      console.log('Markers')
      console.log(markers)
      return markers;
    },
  },
};


const apolloServer = new ApolloServer({ typeDefs: schema, resolvers });
const handler = apolloServer.createHandler({ path: "/api/graphql" });

export const config = {
  api: {
    bodyParser: false
  }
};

export default handler;
