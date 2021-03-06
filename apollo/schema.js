import { makeExecutableSchema } from 'graphql-tools';

import { typeDefs } from './typeDefs';
import { resolvers } from './resolvers';


const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

export { schema };
