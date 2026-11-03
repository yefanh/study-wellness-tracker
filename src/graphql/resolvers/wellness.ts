import { breakSchema, moodSchema } from '@/lib/validation';
import { minutesBetween } from '@/lib/time';
import type { Resolvers } from '../generated/resolvers-types';
import { parseInput } from '../errors';
import { clampLimit } from './shared';

// Breaks and mood logs: simple "append a record" resolvers.

export const wellnessResolvers: Resolvers = {
  Query: {
    recentBreaks: (_parent, { limit }, { prisma, user }) =>
      // Newest logged first. A long break logged later can start earlier, so sort by end time.
      prisma.break.findMany({ where: { userId: user.id }, orderBy: { endedAt: 'desc' }, take: clampLimit(limit) }),

    recentMoodLogs: (_parent, { limit }, { prisma, user }) =>
      prisma.moodLog.findMany({ where: { userId: user.id }, orderBy: { recordedAt: 'desc' }, take: clampLimit(limit) }),
  },

  Mutation: {
    logBreak: (_parent, { input }, { prisma, user, now }) => {
      const { type, durationMinutes, notes } = parseInput(breakSchema, input);
      return prisma.break.create({
        data: {
          userId: user.id,
          type,
          notes: notes || null,
          startedAt: new Date(now.getTime() - durationMinutes * 60_000),
          endedAt: now,
        },
      });
    },

    logMood: (_parent, { input }, { prisma, user, now }) => {
      const { mood, energy, stress, notes } = parseInput(moodSchema, input);
      return prisma.moodLog.create({
        data: { userId: user.id, recordedAt: now, mood, energy: energy ?? null, stress: stress ?? null, notes: notes || null },
      });
    },
  },

  Break: {
    durationMinutes: (b) => minutesBetween(b.startedAt, b.endedAt),
  },
};
