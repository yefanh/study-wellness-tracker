import type { FieldErrors } from '@/lib/validation';
import type { TypedDocumentString } from './generated/client/graphql';

/** A failed request, normalised so forms can show `fieldErrors` next to the right inputs. */
export class GraphQLRequestError extends Error {
  constructor(
    message: string,
    readonly code?: string,
    readonly fieldErrors: FieldErrors = {},
  ) {
    super(message);
    this.name = 'GraphQLRequestError';
  }
}

type GraphQLResponse<T> = {
  data?: T | null;
  errors?: { message: string; extensions?: { code?: string; fieldErrors?: FieldErrors } }[];
};

/** Send an operation from the browser. Result and variables are typed by the document. */
export async function gqlRequest<TResult, TVariables>(
  document: TypedDocumentString<TResult, TVariables>,
  variables: TVariables,
): Promise<TResult> {
  let res: Response;
  try {
    res = await fetch('/api/graphql', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ query: document.toString(), variables }),
    });
  } catch {
    throw new GraphQLRequestError('Network error. Check your connection and try again.', 'NETWORK');
  }

  const body = (await res.json().catch(() => null)) as GraphQLResponse<TResult> | null;
  const first = body?.errors?.[0];
  if (first) throw new GraphQLRequestError(first.message, first.extensions?.code, first.extensions?.fieldErrors);
  if (!res.ok || !body?.data) throw new GraphQLRequestError('Something went wrong. Please try again.', 'SERVER');
  return body.data;
}
