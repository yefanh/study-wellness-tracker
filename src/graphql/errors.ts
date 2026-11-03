import { GraphQLError } from 'graphql';
import { Prisma } from '@prisma/client';
import type { z } from 'zod';
import { toFieldErrors, type FieldErrors } from '@/lib/validation';

// Errors the client is meant to see. Yoga hides the message of any other thrown error
// ("Unexpected error.") so stack traces and SQL never leak to the browser.

export function badInput(fieldErrors: FieldErrors, message = 'Some fields need attention') {
  return new GraphQLError(message, { extensions: { code: 'BAD_USER_INPUT', fieldErrors } });
}

export function notFound(what: string) {
  return new GraphQLError(`${what} not found`, { extensions: { code: 'NOT_FOUND' } });
}

/** Validate resolver input with the same zod schema the form used; throw BAD_USER_INPUT if it fails. */
export function parseInput<S extends z.ZodTypeAny>(schema: S, input: unknown): z.infer<S> {
  const result = schema.safeParse(input);
  if (!result.success) throw badInput(toFieldErrors(result.error));
  return result.data;
}

/** Postgres refused a row because it would break a unique index (Prisma code P2002). */
export function isUniqueViolation(err: unknown): boolean {
  return err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002';
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const isUuid = (id: string) => UUID.test(id);
