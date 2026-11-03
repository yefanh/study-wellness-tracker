import { moodByDay, studyByDay, weekSummary } from '@/lib/stats';
import type { Resolvers } from '../generated/resolvers-types';

export const statsResolvers: Resolvers = {
  Query: {
    stats: async (_parent, { days }, { prisma, user, today }) => {
      const window = Math.min(60, Math.max(7, days ?? 14));
      // The two aggregates don't depend on each other, so run them in parallel.
      const [study, mood] = await Promise.all([
        studyByDay(prisma, user.id, user.timezone, today, window),
        moodByDay(prisma, user.id, user.timezone, today, window),
      ]);
      return { studyByDay: study, moodByDay: mood, week: weekSummary(study, mood) };
    },
  },
};
