import { GraphQLScalarType, Kind } from 'graphql';

function toDate(value: unknown): Date {
  const date = value instanceof Date ? value : new Date(value as string);
  if (Number.isNaN(date.getTime())) throw new TypeError('DateTime must be an ISO-8601 string');
  return date;
}

/** Date objects inside the server, ISO strings on the wire. */
export const DateTime = new GraphQLScalarType<Date, string>({
  name: 'DateTime',
  serialize: (value) => toDate(value).toISOString(),
  parseValue: (value) => toDate(value),
  parseLiteral: (ast) => {
    if (ast.kind !== Kind.STRING) throw new TypeError('DateTime must be an ISO-8601 string');
    return toDate(ast.value);
  },
});
