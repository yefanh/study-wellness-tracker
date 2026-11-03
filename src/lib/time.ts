// Calendar-day helpers. A "day" is a 'YYYY-MM-DD' string in the user's time zone,
// so 23:30 in Boston counts toward that Boston day even though it is already tomorrow in UTC.

const dayFormatters = new Map<string, Intl.DateTimeFormat>();

/** The 'YYYY-MM-DD' calendar day that instant `date` falls on in time zone `tz`. */
export function localDay(date: Date, tz: string): string {
  let fmt = dayFormatters.get(tz);
  if (!fmt) {
    // en-CA formats dates as YYYY-MM-DD
    fmt = new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' });
    dayFormatters.set(tz, fmt);
  }
  return fmt.format(date);
}

export function addDays(day: string, n: number): string {
  const d = new Date(`${day}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

/** Postgres `date` columns arrive in JS as midnight UTC; these convert both ways. */
export const dayToDate = (day: string) => new Date(`${day}T00:00:00Z`);
export const dateToDay = (date: Date) => date.toISOString().slice(0, 10);

/** The instant at wall-clock `time` ('HH:MM') on `day` in `tz` (used by the seed script and tests). */
export function zonedDate(day: string, time: string, tz: string): Date {
  const asIfUtc = new Date(`${day}T${time}:00Z`);
  return new Date(asIfUtc.getTime() - offsetMs(asIfUtc, tz));
}

function offsetMs(date: Date, tz: string): number {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      hourCycle: 'h23',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
      .formatToParts(date)
      .map((p) => [p.type, Number(p.value)]),
  );
  const wall = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
  return wall - date.getTime();
}

export function minutesBetween(start: Date, end: Date): number {
  return Math.max(0, Math.round((end.getTime() - start.getTime()) / 60_000));
}

/**
 * Consecutive check-in days ending today. If today isn't checked in yet the streak
 * still counts from yesterday, so it doesn't look "broken" first thing in the morning.
 */
export function currentStreak(days: Iterable<string>, today: string): number {
  const done = new Set(days);
  let cursor = done.has(today) ? today : addDays(today, -1);
  let streak = 0;
  while (done.has(cursor)) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}
