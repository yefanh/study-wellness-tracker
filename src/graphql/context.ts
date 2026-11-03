import type { PrismaClient, User } from '@prisma/client';
import defaultPrisma from '@/lib/prisma';
import { addDays, localDay } from '@/lib/time';
import { createLoaders, type Loaders } from './loaders';

/** What every resolver receives as its third argument. Built fresh for each request. */
export type GraphQLContext = {
  prisma: PrismaClient;
  user: User;
  /** Request time; injectable so tests can pin the clock. */
  now: Date;
  /** `now` as a calendar day in the user's time zone. */
  today: string;
  /** Per-request DataLoaders: their cache must never be shared between users or requests. */
  loaders: Loaders;
};

/** The app has no login: every request acts as the demo user (see DEMO_USER_EMAIL). */
export async function getDemoUser(prisma: PrismaClient): Promise<User> {
  const email = process.env.DEMO_USER_EMAIL ?? 'demo@studywellness.local';
  return prisma.user.upsert({ where: { email }, update: {}, create: { email, name: 'Demo Student' } });
}

export async function createContext(
  opts: { prisma?: PrismaClient; user?: User; now?: Date } = {},
): Promise<GraphQLContext> {
  const prisma = opts.prisma ?? defaultPrisma;
  const user = opts.user ?? (await getDemoUser(prisma));
  const now = opts.now ?? new Date();
  const today = localDay(now, user.timezone);
  return { prisma, user, now, today, loaders: createLoaders(prisma, addDays(today, -89)) };
}
