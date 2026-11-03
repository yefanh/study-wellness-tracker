import { PrismaClient } from '@prisma/client';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import {
  CheckInHabitMutation,
  CreateHabitMutation,
  DashboardQuery,
  EndStudySessionMutation,
  LogMoodMutation,
  StartStudySessionMutation,
} from '@/graphql/operations';
import { zonedDate } from '@/lib/time';
import { gql, makeUser, prisma, resetDb } from './helpers';

// These run the real schema + resolvers against a real Postgres test database.

beforeEach(resetDb);
afterAll(() => prisma.$disconnect());

describe('study sessions', () => {
  it('never runs two sessions at once, even when two starts race', async () => {
    const user = await makeUser();
    const [a, b] = await Promise.all([
      gql(StartStudySessionMutation, { input: { focusArea: 'Algorithms' } }, { user }),
      gql(StartStudySessionMutation, { input: { focusArea: 'Algorithms' } }, { user }),
    ]);
    expect(a.errors).toBeUndefined();
    expect(b.errors).toBeUndefined();
    expect(a.data!.startStudySession.id).toBe(b.data!.startStudySession.id);
    expect(await prisma.studySession.count({ where: { userId: user.id, endedAt: null } })).toBe(1);
  });

  it('ends a session once; ending it again changes nothing', async () => {
    const user = await makeUser();
    const start = new Date('2026-11-02T14:00:00Z');
    const session = await prisma.studySession.create({ data: { userId: user.id, startedAt: start } });

    const first = await gql(EndStudySessionMutation, { id: session.id }, { user, now: new Date('2026-11-02T14:50:00Z') });
    expect(first.data!.endStudySession.durationMinutes).toBe(50);

    const again = await gql(EndStudySessionMutation, { id: session.id }, { user, now: new Date('2026-11-02T16:00:00Z') });
    expect(again.data!.endStudySession.durationMinutes).toBe(50);
  });

  it("can't touch another user's session", async () => {
    const owner = await makeUser();
    const intruder = await makeUser();
    const session = await prisma.studySession.create({ data: { userId: owner.id } });
    const result = await gql(EndStudySessionMutation, { id: session.id }, { user: intruder });
    expect(result.errors?.[0].extensions.code).toBe('NOT_FOUND');
    expect((await prisma.studySession.findUnique({ where: { id: session.id } }))!.endedAt).toBeNull();
  });
});

describe('validation', () => {
  it('rejects bad input with per-field messages the form can show', async () => {
    const user = await makeUser();
    const result = await gql(LogMoodMutation, { input: { mood: 7, notes: 'x'.repeat(300) } }, { user });
    expect(result.errors?.[0].extensions).toMatchObject({
      code: 'BAD_USER_INPUT',
      fieldErrors: { mood: 'mood is from 1 to 5', notes: 'Keep notes under 280 characters' },
    });
    expect(await prisma.moodLog.count()).toBe(0);
  });

  it('the database refuses out-of-range scores even if the API check is bypassed', async () => {
    const user = await makeUser();
    await expect(prisma.moodLog.create({ data: { userId: user.id, mood: 9 } })).rejects.toThrow(/MoodLog_scores_1_to_5/);
  });

  it('reports a duplicate habit name on the name field', async () => {
    const user = await makeUser();
    await gql(CreateHabitMutation, { input: { name: 'Stretch', targetPerWeek: 7 } }, { user });
    const dup = await gql(CreateHabitMutation, { input: { name: 'Stretch', targetPerWeek: 3 } }, { user });
    expect(dup.errors?.[0].extensions.fieldErrors).toEqual({ name: 'You already track a habit with this name' });
  });
});

describe('habits', () => {
  it('checking in twice on one day keeps a single check-in', async () => {
    const user = await makeUser();
    const habit = await prisma.habit.create({ data: { userId: user.id, name: 'Read', targetPerWeek: 5 } });
    const now = new Date('2026-11-02T15:00:00Z');

    await gql(CheckInHabitMutation, { habitId: habit.id }, { user, now });
    const second = await gql(CheckInHabitMutation, { habitId: habit.id }, { user, now });

    expect(second.data!.checkInHabit).toMatchObject({ doneToday: true, currentStreak: 1, doneThisWeek: 1 });
    expect(await prisma.habitCheckIn.count({ where: { habitId: habit.id } })).toBe(1);
  });

  it('loads check-ins for every habit with one query (DataLoader, no N+1)', async () => {
    const user = await makeUser();
    for (const name of ['A', 'B', 'C', 'D']) {
      const habit = await prisma.habit.create({ data: { userId: user.id, name, targetPerWeek: 7 } });
      await prisma.habitCheckIn.create({ data: { habitId: habit.id, userId: user.id, day: new Date('2026-11-01') } });
    }

    const counting = new PrismaClient({ log: [{ emit: 'event', level: 'query' }] });
    const checkInQueries: string[] = [];
    counting.$on('query', (e) => {
      if (e.query.includes('"HabitCheckIn"')) checkInQueries.push(e.query);
    });

    const result = await gql(
      `{ habits { name currentStreak doneToday doneThisWeek checkIns { day } } }`,
      {},
      { user, now: new Date('2026-11-02T15:00:00Z'), client: counting },
    );
    await counting.$disconnect();

    expect(result.data!.habits).toHaveLength(4);
    expect(result.data!.habits[0]).toMatchObject({ currentStreak: 1, doneToday: false });
    expect(checkInQueries).toHaveLength(1);
  });
});

describe('dashboard stats', () => {
  it("groups a late-night session under the user's local day, not the UTC day", async () => {
    // 23:30 on Nov 1 in New York is 04:30 on Nov 2 in UTC.
    const nyUser = await makeUser('America/New_York');
    const utcUser = await makeUser('UTC');
    for (const user of [nyUser, utcUser]) {
      const startedAt = zonedDate('2026-11-01', '23:30', 'America/New_York');
      await prisma.studySession.create({
        data: { userId: user.id, startedAt, endedAt: new Date(startedAt.getTime() + 45 * 60_000) },
      });
    }
    const now = new Date('2026-11-02T18:00:00Z');
    const minutesOn = async (user: typeof nyUser, day: string) => {
      const res = await gql(DashboardQuery, { days: 7 }, { user, now });
      return res.data!.stats.studyByDay.find((d: { day: string }) => d.day === day)?.minutes;
    };

    expect(await minutesOn(nyUser, '2026-11-01')).toBe(45);
    expect(await minutesOn(nyUser, '2026-11-02')).toBe(0);
    expect(await minutesOn(utcUser, '2026-11-02')).toBe(45);
  });

  it('returns one row per day, zero-filled, and a matching weekly summary', async () => {
    const user = await makeUser();
    const now = new Date('2026-11-02T18:00:00Z');
    await prisma.studySession.create({
      data: { userId: user.id, startedAt: new Date('2026-10-30T14:00:00Z'), endedAt: new Date('2026-10-30T15:30:00Z') },
    });
    await prisma.moodLog.createMany({
      data: [
        { userId: user.id, mood: 4, energy: 3, recordedAt: new Date('2026-10-30T16:00:00Z') },
        { userId: user.id, mood: 2, recordedAt: new Date('2026-10-31T16:00:00Z') },
      ],
    });

    const res = await gql(DashboardQuery, { days: 14 }, { user, now });
    const stats = res.data!.stats;
    expect(stats.studyByDay).toHaveLength(14);
    expect(stats.studyByDay.at(-1).day).toBe('2026-11-02');
    expect(stats.studyByDay.find((d: { day: string }) => d.day === '2026-10-30')).toEqual({ day: '2026-10-30', minutes: 90, sessions: 1 });
    expect(stats.moodByDay.find((d: { day: string }) => d.day === '2026-10-29')).toMatchObject({ mood: null, entries: 0 });
    expect(stats.week).toEqual({ studyMinutes: 90, sessions: 1, averageMood: 3 });
  });
});
