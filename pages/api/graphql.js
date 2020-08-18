import { ApolloServer } from 'apollo-server-micro';

import { schema } from '../../apollo/schema';
import { context } from '../../apollo/context';
import { plugins } from '../../apollo/plugins';

const apolloServer = new ApolloServer({
  schema,
  context,
  plugins,
});
const handler = apolloServer.createHandler({ path: '/api/graphql' });

export const config = {
  api: {
    bodyParser: false,
  },
};

export default handler;
