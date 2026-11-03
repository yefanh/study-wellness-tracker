import { habitSchema } from '@/lib/validation';
import { addDays, currentStreak, dateToDay, dayToDate } from '@/lib/time';
import type { Resolvers } from '../generated/resolvers-types';
import { badInput, isUniqueViolation, isUuid, notFound, parseInput } from '../errors';

export const habitResolvers: Resolvers = {
  Query: {
    habits: (_parent, _args, { prisma, user }) =>
      prisma.habit.findMany({ where: { userId: user.id, archived: false }, orderBy: { createdAt: 'asc' } }),
  },

  Mutation: {
    createHabit: async (_parent, { input }, { prisma, user }) => {
      const data = parseInput(habitSchema, input);
      try {
        return await prisma.habit.create({ data: { ...data, userId: user.id } });
      } catch (err) {
        if (isUniqueViolation(err)) throw badInput({ name: 'You already track a habit with this name' });
        throw err;
      }
    },

    checkInHabit: async (_parent, { habitId }, { prisma, user, today }) => {
      const habit = isUuid(habitId) ? await prisma.habit.findFirst({ where: { id: habitId, userId: user.id } }) : null;
      if (!habit) throw notFound('Habit');
      // Upsert on the (habitId, day) unique key: a retry or double click can't add a second row.
      await prisma.habitCheckIn.upsert({
        where: { habitId_day: { habitId, day: dayToDate(today) } },
        update: {},
        create: { habitId, userId: user.id, day: dayToDate(today) },
      });
      return habit;
    },
  },

  // All four fields share one DataLoader call per habit, so the whole `habits` list costs
  // two queries in total (habits + check-ins), however many habits there are.
  Habit: {
    checkIns: async (habit, _args, { loaders, today }) => {
      const since = addDays(today, -27);
      const rows = await loaders.checkInsByHabit.load(habit.id);
      return rows.filter((r) => dateToDay(r.day) >= since);
    },
    currentStreak: async (habit, _args, { loaders, today }) => {
      const rows = await loaders.checkInsByHabit.load(habit.id);
      return currentStreak(rows.map((r) => dateToDay(r.day)), today);
    },
    doneToday: async (habit, _args, { loaders, today }) => {
      const rows = await loaders.checkInsByHabit.load(habit.id);
      return rows.some((r) => dateToDay(r.day) === today);
    },
    doneThisWeek: async (habit, _args, { loaders, today }) => {
      const since = addDays(today, -6);
      const rows = await loaders.checkInsByHabit.load(habit.id);
      return rows.filter((r) => dateToDay(r.day) >= since).length;
    },
  },

  HabitCheckIn: {
    day: (checkIn) => dateToDay(checkIn.day),
  },
};
