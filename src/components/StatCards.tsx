import type { WeekSummary } from '@/graphql/types';
import { formatMinutes } from '@/lib/format';

// A Server Component: plain markup, no state, no event handlers, so it ships zero JavaScript.

export function StatCards({ week, bestStreak }: { week: WeekSummary; bestStreak: number }) {
  const cards = [
    { label: 'Study time', value: formatMinutes(week.studyMinutes) },
    { label: 'Sessions', value: String(week.sessions) },
    { label: 'Average mood', value: week.averageMood === null ? 'No logs' : `${week.averageMood} / 5` },
    { label: 'Best habit streak', value: `${bestStreak} ${bestStreak === 1 ? 'day' : 'days'}` },
  ];
  return (
    <section aria-labelledby="week-heading">
      <h2 id="week-heading" className="mb-3 text-lg font-semibold text-slate-900">
        Last 7 days
      </h2>
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="card">
            <dt className="text-sm text-slate-700">{c.label}</dt>
            <dd className="mt-1 text-2xl font-semibold text-slate-900">{c.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
