'use client';

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { DailyStudyItem } from '@/graphql/types';
import { formatDay, formatMinutes } from '@/lib/format';
import { ChartFigure } from './ChartFigure';

// Recharts draws with browser APIs, so this is a Client Component. The data arrives
// already aggregated (one row per day) from the Server Component.

export function StudyMinutesChart({ data }: { data: DailyStudyItem[] }) {
  const total = data.reduce((n, d) => n + d.minutes, 0);
  const best = data.reduce((a, b) => (b.minutes > a.minutes ? b : a), data[0]);
  const summary = total
    ? `${formatMinutes(total)} over ${data.length} days. Best day: ${formatDay(best.day)} with ${formatMinutes(best.minutes)}.`
    : `No study sessions in the last ${data.length} days.`;

  return (
    <ChartFigure
      title={`Study time, last ${data.length} days`}
      summary={summary}
      columns={['Day', 'Minutes', 'Sessions']}
      rows={data.map((d) => [formatDay(d.day), d.minutes, d.sessions])}
    >
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -12 }}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="day" tickFormatter={(day: string) => day.slice(8)} tick={{ fontSize: 12, fill: '#475569' }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#475569' }} />
          <Tooltip
            labelFormatter={(day: string) => formatDay(day)}
            formatter={(value: number) => [formatMinutes(value), 'Studied']}
          />
          <Bar dataKey="minutes" fill="#4338ca" radius={[4, 4, 0, 0]} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </ChartFigure>
  );
}
