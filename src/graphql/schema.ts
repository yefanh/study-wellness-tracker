import { createSchema } from 'graphql-yoga';
import type { GraphQLContext } from './context';
import type { Resolvers } from './generated/resolvers-types';
import { typeDefs } from './typeDefs';
import { DateTime } from './resolvers/scalars';
import { studyResolvers } from './resolvers/study';
import { wellnessResolvers } from './resolvers/wellness';
import { habitResolvers } from './resolvers/habits';
import { statsResolvers } from './resolvers/stats';

const modules = [studyResolvers, wellnessResolvers, habitResolvers, statsResolvers];

// Each module owns a slice of Query/Mutation; merge them into one resolver map.
const resolvers: Resolvers = { DateTime, Query: { me: (_parent, _args, { user }) => user } };
for (const mod of modules) {
  for (const [typeName, fields] of Object.entries(mod)) {
    resolvers[typeName] = { ...(resolvers[typeName] as object), ...(fields as object) };
  }
}

/** The executable schema: SDL + resolvers. Used by the HTTP route and by Server Components. */
export const schema = createSchema<GraphQLContext>({ typeDefs, resolvers });
