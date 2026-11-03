// Display helpers. Times are always formatted in the user's time zone (passed in),
// so the server render and the browser render produce the same text.

export function formatMinutes(total: number): string {
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (!h) return `${m} min`;
  return m ? `${h}h ${m}m` : `${h}h`;
}

export function formatTime(iso: string, timeZone: string): string {
  return new Intl.DateTimeFormat('en-US', { timeZone, hour: 'numeric', minute: '2-digit' }).format(new Date(iso));
}

export function formatDateTime(iso: string, timeZone: string): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'short',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(iso));
}

/** '2026-11-02' -> 'Mon, Nov 2' (a calendar day, so no time zone conversion). */
export function formatDay(day: string, style: 'short' | 'long' = 'short'): string {
  const date = new Date(`${day}T12:00:00Z`);
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'UTC',
    weekday: 'short',
    month: style === 'long' ? 'long' : 'short',
    day: 'numeric',
  }).format(date);
}

export const MOOD_LABELS = ['', 'Very low', 'Low', 'Okay', 'Good', 'Great'] as const;

export const BREAK_LABELS: Record<string, string> = {
  SHORT: 'Short break',
  LONG: 'Long break',
  MOVEMENT: 'Movement',
  MEAL: 'Meal',
  OTHER: 'Other',
};
