import 'server-only';
import { execute, parse } from 'graphql';
import { createContext } from './context';
import type { TypedDocumentString } from './generated/client/graphql';
import { schema } from './schema';

/**
 * Run a GraphQL operation inside the server process, for Server Components.
 *
 * No HTTP round trip to our own /api/graphql, yet it goes through the same schema,
 * resolvers and validation as browser requests, and returns the same typed result.
 * `import 'server-only'` makes the build fail if a Client Component imports this file.
 */
export async function serverQuery<TResult, TVariables>(
  document: TypedDocumentString<TResult, TVariables>,
  variables: TVariables,
): Promise<TResult> {
  const result = await execute({
    schema,
    document: parse(document.toString()),
    variableValues: variables as Record<string, unknown>,
    contextValue: await createContext(),
  });
  if (result.errors?.length) throw result.errors[0];
  // graphql-js builds result objects with a null prototype, which React refuses to pass
  // from a Server Component to a Client Component. A JSON round trip makes them plain,
  // exactly like the HTTP path would.
  return JSON.parse(JSON.stringify(result.data)) as TResult;
}
