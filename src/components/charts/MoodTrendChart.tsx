'use client';

import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { DailyMoodItem } from '@/graphql/types';
import { formatDay } from '@/lib/format';
import { ChartFigure } from './ChartFigure';

const avg = (values: (number | null)[]) => {
  const present = values.filter((v): v is number => v !== null);
  return present.length ? Math.round((present.reduce((a, b) => a + b, 0) / present.length) * 10) / 10 : null;
};

export function MoodTrendChart({ data }: { data: DailyMoodItem[] }) {
  const firstHalf = avg(data.slice(0, 7).map((d) => d.mood));
  const secondHalf = avg(data.slice(-7).map((d) => d.mood));
  const trend =
    firstHalf === null || secondHalf === null
      ? 'Not enough mood logs to show a trend yet.'
      : `Average mood ${secondHalf}/5 this week, ${secondHalf > firstHalf ? 'up' : secondHalf < firstHalf ? 'down' : 'unchanged'} from ${firstHalf}/5 the week before.`;

  return (
    <ChartFigure
      title={`Mood and energy, last ${data.length} days`}
      summary={trend}
      columns={['Day', 'Mood (1-5)', 'Energy (1-5)', 'Logs']}
      rows={data.map((d) => [formatDay(d.day), d.mood ?? 'no log', d.energy ?? 'no log', d.entries])}
    >
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="day" tickFormatter={(day: string) => day.slice(8)} tick={{ fontSize: 12, fill: '#475569' }} />
          <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 12, fill: '#475569' }} />
          <Tooltip labelFormatter={(day: string) => formatDay(day)} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          {/* Told apart by line style as well as colour, for colour-blind readers. */}
          <Line type="monotone" dataKey="mood" name="Mood" stroke="#4338ca" strokeWidth={2} connectNulls isAnimationActive={false} />
          <Line
            type="monotone"
            dataKey="energy"
            name="Energy"
            stroke="#047857"
            strokeWidth={2}
            strokeDasharray="5 4"
            connectNulls
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartFigure>
  );
}
