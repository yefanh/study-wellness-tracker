import { startSessionSchema } from '@/lib/validation';
import { minutesBetween } from '@/lib/time';
import type { Resolvers } from '../generated/resolvers-types';
import { isUniqueViolation, isUuid, notFound, parseInput } from '../errors';
import { clampLimit } from './shared';

export const studyResolvers: Resolvers = {
  Query: {
    activeSession: (_parent, _args, { prisma, user }) =>
      prisma.studySession.findFirst({ where: { userId: user.id, endedAt: null } }),

    recentSessions: (_parent, { limit }, { prisma, user }) =>
      prisma.studySession.findMany({
        where: { userId: user.id, endedAt: { not: null } },
        orderBy: { startedAt: 'desc' },
        take: clampLimit(limit),
      }),
  },

  Mutation: {
    startStudySession: async (_parent, { input }, { prisma, user }) => {
      const { focusArea } = parseInput(startSessionSchema, input);
      try {
        return await prisma.studySession.create({ data: { userId: user.id, focusArea: focusArea || null } });
      } catch (err) {
        // The partial unique index allows one running session per user. A double click
        // or a second tab lands here; hand back the session that is already running.
        if (isUniqueViolation(err)) {
          return prisma.studySession.findFirstOrThrow({ where: { userId: user.id, endedAt: null } });
        }
        throw err;
      }
    },

    endStudySession: async (_parent, { id }, { prisma, user, now }) => {
      if (!isUuid(id)) throw notFound('Study session');
      // One atomic UPDATE: only this user's session, only if it is still running.
      // Ending it twice is harmless; the second call changes nothing.
      await prisma.studySession.updateMany({
        where: { id, userId: user.id, endedAt: null },
        data: { endedAt: now },
      });
      const session = await prisma.studySession.findFirst({ where: { id, userId: user.id } });
      if (!session) throw notFound('Study session');
      return session;
    },
  },

  StudySession: {
    durationMinutes: (session, _args, { now }) => minutesBetween(session.startedAt, session.endedAt ?? now),
  },
};
