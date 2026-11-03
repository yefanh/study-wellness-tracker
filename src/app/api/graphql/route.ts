import { createYoga } from 'graphql-yoga';
import { createContext } from '@/graphql/context';
import { schema } from '@/graphql/schema';

// The GraphQL HTTP endpoint, served by a Next.js Route Handler.
// Prisma needs Node APIs (TCP sockets, the query engine), so this must not run on the Edge runtime.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const { handleRequest } = createYoga({
  schema,
  context: () => createContext(),
  graphqlEndpoint: '/api/graphql',
  fetchAPI: { Response },
  // GraphiQL (the in-browser query editor) only in development.
  graphiql: process.env.NODE_ENV !== 'production',
});

export { handleRequest as GET, handleRequest as POST };
