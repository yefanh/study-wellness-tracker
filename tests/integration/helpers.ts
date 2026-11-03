import { execute, parse, type ExecutionResult } from 'graphql';
import type { PrismaClient, User } from '@prisma/client';
import { createContext } from '@/graphql/context';
import { schema } from '@/graphql/schema';
import prisma from '@/lib/prisma';

export { prisma };

/** Wipe every table (all rows hang off User via ON DELETE CASCADE). Test database only. */
export async function resetDb() {
  if (!/_test\b/.test(process.env.DATABASE_URL ?? '')) {
    throw new Error('Refusing to truncate: DATABASE_URL is not the *_test database');
  }
  await prisma.$executeRawUnsafe('TRUNCATE "User" CASCADE');
}

let n = 0;
export function makeUser(timezone = 'America/New_York') {
  return prisma.user.create({ data: { email: `user${++n}@test.local`, name: `User ${n}`, timezone } });
}

/** Execute an operation exactly like the HTTP route would, but as `user` and at time `now`. */
export async function gql<T = Record<string, any>>(
  query: string | { toString(): string },
  variables: Record<string, unknown>,
  opts: { user: User; now?: Date; client?: PrismaClient },
): Promise<ExecutionResult<T>> {
  const contextValue = await createContext({ prisma: opts.client ?? prisma, user: opts.user, now: opts.now });
  return (await execute({ schema, document: parse(String(query)), variableValues: variables, contextValue })) as ExecutionResult<T>;
}
