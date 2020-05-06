const { ApolloServer, gql } = require('apollo-server-micro');
const passport = require('passport');

const { maps } = require('../../utils/db');

const GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.use(new GoogleStrategy({
    clientID: GOOGLE_OAUTH_CLIENT_ID,
    clientSecret: GOOGLE_OAUTH_CLIENT_SECRET,
    callbackURL: "http://www.example.com/auth/google/callback"
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));

const authenticateGoogle = (req, res) => new Promise((resolve, reject) => {
  passport.authenticate('google-token', { session: false }, (err, data, info) => {
      if (err) reject(err);
      resolve({ data, info });
  })(req, res);
});

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
    getMarkers: async (parent, args) => {
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
    },
    authGoogle: async (_, { input: { accessToken } }, { req, res }) => {
      req.body = {
        ...req.body,
        access_token: accessToken,
      };

      try {
        // data contains the accessToken, refreshToken and profile from passport
        const { data, info } = await authenticateGoogle(req, res);

        if (data) {
          const user = await User.upsertGoogleUser(data);

          if (user) {
            return ({
              name: user.name,
              token: user.generateJWT(),
            });
          }
        }

        if (info) {
          console.log(info);
          switch (info.code) {
            case 'ETIMEDOUT':
              return (new Error('Failed to reach Google: Try Again'));
            default:
              return (new Error('something went wrong'));
          }
        }
        return (Error('server error'));
      } catch (error) {
        return error;
      }
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
