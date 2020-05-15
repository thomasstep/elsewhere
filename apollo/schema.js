import { makeExecutableSchema } from 'graphql-tools';
import { typeDefs } from './type-defs';
import { resolvers } from './resolvers';

console.log(typeDefs)
console.log(resolvers)

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

module.exports = { schema };
