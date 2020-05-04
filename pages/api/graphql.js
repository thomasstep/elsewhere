const { ApolloServer, gql } = require('apollo-server-micro');
const { maps } = require('../../utils/db');

const schema = gql`
  type Marker {
    lat: Float!
    lng: Float!
  }

  input MarkerInput {
    lat: Float!
    lng: Float!
  }

  type Query {
    hello: String!
    getMarkers(map: ID!): [Marker]!
  }

  type Mutation {
    upsertMarkers(map: ID!, markers: [MarkerInput]!): Boolean!
    deleteMarkers(map: ID!, markers: [MarkerInput]!): Boolean!
  }
`;

const resolvers = {
  Query: {
    hello: (parent, args, context) => "Hello!",
    getMarkers: async (parent, args) => {
      console.log(process.env)
      const { markers } = await maps.findOne({ map: args.map });
      return markers;
    },
  },
  Mutation: {
    upsertMarkers: async (parent, args) => {
      const promises = [];
      args.markers.forEach((marker) => {
        promises.push(
          maps.updateOne(
            {
              map: args.map
            },
            {
              $push: {
                markers: {
                  ...marker
                }
              }
            }
          )
        );
      });

      try {
        await Promise.all(promises);
      } catch (err) {
        console.error('Error upserting markers.');
        console.error(err);
        return false;
      }

      return true;
    },
    deleteMarkers: async (parent, args) => {
      const promises = [];
      args.markers.forEach((marker) => {
        promises.push(
          maps.update(
            {
              map: args.map,
            },
            {
              $pull: {
                markers: marker,
              },
            },
          ),
        );
      });
      
      try {
        await Promise.all(promises);
      } catch (err) {
        console.error('Error deleting markers.');
        console.error(err);
        return false;
      }

      return true;
    }
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
