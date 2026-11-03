import DataLoader from 'dataloader';
import type { HabitCheckIn, PrismaClient } from '@prisma/client';
import { dayToDate } from '@/lib/time';

// The N+1 problem: `habits { checkIns }` runs the Habit.checkIns resolver once per habit,
// so 10 habits would mean 1 + 10 queries. A DataLoader collects every habitId requested
// in the same tick and loads them all with ONE `WHERE habitId IN (...)` query.

export type Loaders = ReturnType<typeof createLoaders>;

export function createLoaders(prisma: PrismaClient, sinceDay: string) {
  return {
    /** Check-ins since `sinceDay` for each habit, oldest first. */
    checkInsByHabit: new DataLoader<string, HabitCheckIn[]>(async (habitIds) => {
      const rows = await prisma.habitCheckIn.findMany({
        where: { habitId: { in: [...habitIds] }, day: { gte: dayToDate(sinceDay) } },
        orderBy: { day: 'asc' },
      });
      const byHabit = new Map(habitIds.map((id) => [id, [] as HabitCheckIn[]]));
      for (const row of rows) byHabit.get(row.habitId)?.push(row);
      // DataLoader requires results in the same order as the keys it was given.
      return habitIds.map((id) => byHabit.get(id) ?? []);
    }),
  };
}
