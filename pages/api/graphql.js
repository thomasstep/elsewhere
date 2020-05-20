import cookie from 'cookie';
import jwt from 'jsonwebtoken';

const { ApolloServer } = require('apollo-server-micro');
const { schema } = require('../../apollo/schema');

const { log, users } = require('../../utils');

const { JWT_SECRET } = process.env;

const apolloServer = new ApolloServer({
  schema,
  context: async (ctx) => {
    const { req } = ctx;

    const { token } = cookie.parse(req.headers.cookie ?? '');
    if (token) {
      try {
        const { id, email } = jwt.verify(token, JWT_SECRET);
        const user = await users.findOne({ id, email });

        ctx.user = user;
      } catch (err) {
        log.error(err);
      }
    } else {
      log.info('No token found.');
    }

    return ctx;
  },
});
const handler = apolloServer.createHandler({ path: '/api/graphql' });

export const config = {
  api: {
    bodyParser: false,
  },
};

export default handler;
