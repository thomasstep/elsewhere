const { ApolloServer, gql, AuthenticationError } = require('apollo-server-micro');
const { schema } = require('../../apollo/schema');
import cookie from 'cookie'
import jwt from 'jsonwebtoken'
const { users } = require('../../utils/db');

const JWT_SECRET = process.env.JWT_SECRET

const apolloServer = new ApolloServer({
  schema,
  context: async (ctx) => {
    const { req, res } = ctx;

    const { token } = cookie.parse(req.headers.cookie ?? '');
    if (token) {
      try {
        const { id, email } = jwt.verify(token, JWT_SECRET)
        const user = await users.findOne({ id, email });

        ctx.user = user;
      } catch (err) {
        console.error(err);
      }
    } else {
      console.log('No token found.');
    }

    return ctx;
  },
});
const handler = apolloServer.createHandler({ path: "/api/graphql" });

export const config = {
  api: {
    bodyParser: false
  }
};

export default handler;
