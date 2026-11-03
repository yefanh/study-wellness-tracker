import { MoodTrendChart } from '@/components/charts/MoodTrendChart';
import { StudyMinutesChart } from '@/components/charts/StudyMinutesChart';
import { BreakForm } from '@/components/forms/BreakForm';
import { HabitPanel } from '@/components/forms/HabitPanel';
import { MoodForm } from '@/components/forms/MoodForm';
import { StudyTimer } from '@/components/forms/StudyTimer';
import { StatCards } from '@/components/StatCards';
import { DashboardQuery } from '@/graphql/operations';
import { serverQuery } from '@/graphql/server-client';
import { formatDay } from '@/lib/format';
import { localDay } from '@/lib/time';

// Always render on request with fresh data (never cached at build time).
export const dynamic = 'force-dynamic';

/**
 * The dashboard is a Server Component: this function runs on the server, fetches everything
 * in ONE GraphQL query, and sends finished HTML. The browser only downloads JavaScript for
 * the interactive pieces (forms and charts, marked 'use client').
 */
export default async function DashboardPage() {
  const data = await serverQuery(DashboardQuery, { days: 14 });
  const timezone = data.me.timezone;
  const today = localDay(new Date(), timezone);
  const bestStreak = Math.max(0, ...data.habits.map((h) => h.currentStreak));

  return (
    <main id="main" className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8 sm:px-8">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900">Study Wellness</h1>
        <p className="text-slate-700">
          {formatDay(today, 'long')} · {data.me.name}
        </p>
      </header>

      <StatCards week={data.stats.week} bestStreak={bestStreak} />

      <div className="grid gap-8 lg:grid-cols-2">
        <section aria-labelledby="log-heading" className="flex flex-col gap-6">
          <h2 id="log-heading" className="text-lg font-semibold text-slate-900">
            Log
          </h2>
          <StudyTimer active={data.activeSession} recent={data.recentSessions} timezone={timezone} />
          <MoodForm recent={data.recentMoodLogs} timezone={timezone} />
          <BreakForm recent={data.recentBreaks} timezone={timezone} />
        </section>

        <section aria-labelledby="trends-heading" className="flex flex-col gap-6">
          <h2 id="trends-heading" className="text-lg font-semibold text-slate-900">
            Trends
          </h2>
          <StudyMinutesChart data={data.stats.studyByDay} />
          <MoodTrendChart data={data.stats.moodByDay} />
          <HabitPanel habits={data.habits} today={today} />
        </section>
      </div>
    </main>
  );
}
