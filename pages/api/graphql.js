const { ApolloServer, gql } = require('apollo-server-micro');
const { schema } = require('../../apollo/schema');

const apolloServer = new ApolloServer({
  schema,
  context(ctx) {
    return ctx
  },
});
const handler = apolloServer.createHandler({ path: "/api/graphql" });

export const config = {
  api: {
    bodyParser: false
  }
};

export default handler;
