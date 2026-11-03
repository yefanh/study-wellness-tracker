import type { PrismaClient } from '@prisma/client';

// Dashboard aggregates are computed in Postgres, not in JS: the database returns one row
// per day instead of shipping every session and mood log to the server.
//
// generate_series() produces every day in the window, and LEFT JOIN keeps days with no
// data (minutes = 0), so the chart never skips a day.
// `x AT TIME ZONE tz` turns a timestamptz into local wall-clock time, so a session is
// grouped under the user's calendar day, not the UTC one.
// The `>= window start` condition lets Postgres use the (userId, startedAt) index.

export type DailyStudy = { day: string; minutes: number; sessions: number };
export type DailyMood = { day: string; mood: number | null; energy: number | null; entries: number };

export async function studyByDay(
  prisma: PrismaClient,
  userId: string,
  tz: string,
  today: string,
  days: number,
): Promise<DailyStudy[]> {
  return prisma.$queryRaw<DailyStudy[]>`
    SELECT to_char(d.day, 'YYYY-MM-DD') AS day,
           COALESCE(ROUND(SUM(EXTRACT(EPOCH FROM (s."endedAt" - s."startedAt")) / 60)), 0)::int AS minutes,
           COUNT(s.id)::int AS sessions
    FROM (
      SELECT generate_series(${today}::date - ${days - 1}::int, ${today}::date, interval '1 day')::date AS day
    ) d
    LEFT JOIN "StudySession" s
      ON s."userId" = ${userId}::uuid
     AND s."endedAt" IS NOT NULL
     AND s."startedAt" >= ((${today}::date - ${days - 1}::int)::timestamp AT TIME ZONE ${tz})
     AND (s."startedAt" AT TIME ZONE ${tz})::date = d.day
    GROUP BY d.day
    ORDER BY d.day`;
}

export async function moodByDay(
  prisma: PrismaClient,
  userId: string,
  tz: string,
  today: string,
  days: number,
): Promise<DailyMood[]> {
  return prisma.$queryRaw<DailyMood[]>`
    SELECT to_char(d.day, 'YYYY-MM-DD') AS day,
           ROUND(AVG(m.mood)::numeric, 2)::float8 AS mood,
           ROUND(AVG(m.energy)::numeric, 2)::float8 AS energy,
           COUNT(m.id)::int AS entries
    FROM (
      SELECT generate_series(${today}::date - ${days - 1}::int, ${today}::date, interval '1 day')::date AS day
    ) d
    LEFT JOIN "MoodLog" m
      ON m."userId" = ${userId}::uuid
     AND m."recordedAt" >= ((${today}::date - ${days - 1}::int)::timestamp AT TIME ZONE ${tz})
     AND (m."recordedAt" AT TIME ZONE ${tz})::date = d.day
    GROUP BY d.day
    ORDER BY d.day`;
}

/** Totals for the last 7 days, derived from the daily series so the cards and charts always agree. */
export function weekSummary(study: DailyStudy[], mood: DailyMood[]) {
  const lastStudy = study.slice(-7);
  const lastMood = mood.slice(-7);
  const entries = lastMood.reduce((n, d) => n + d.entries, 0);
  const moodTotal = lastMood.reduce((n, d) => n + (d.mood ?? 0) * d.entries, 0);
  return {
    studyMinutes: lastStudy.reduce((n, d) => n + d.minutes, 0),
    sessions: lastStudy.reduce((n, d) => n + d.sessions, 0),
    averageMood: entries ? Math.round((moodTotal / entries) * 10) / 10 : null,
  };
}
