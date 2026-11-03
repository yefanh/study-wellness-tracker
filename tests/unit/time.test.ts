import { describe, expect, it } from 'vitest';
import { addDays, currentStreak, localDay, minutesBetween, zonedDate } from '@/lib/time';

describe('localDay', () => {
  it('uses the time zone, not UTC', () => {
    const instant = new Date('2026-11-02T03:30:00Z'); // 22:30 on Nov 1 in New York
    expect(localDay(instant, 'America/New_York')).toBe('2026-11-01');
    expect(localDay(instant, 'UTC')).toBe('2026-11-02');
    expect(localDay(instant, 'Asia/Shanghai')).toBe('2026-11-02');
  });
});

describe('zonedDate', () => {
  it('turns a local wall-clock time into the right instant on both sides of a DST change', () => {
    expect(zonedDate('2026-07-01', '09:00', 'America/New_York').toISOString()).toBe('2026-07-01T13:00:00.000Z'); // EDT, UTC-4
    expect(zonedDate('2026-12-01', '09:00', 'America/New_York').toISOString()).toBe('2026-12-01T14:00:00.000Z'); // EST, UTC-5
  });
});

describe('currentStreak', () => {
  const today = '2026-11-02';

  it('counts consecutive days ending today', () => {
    expect(currentStreak(['2026-10-31', '2026-11-01', '2026-11-02'], today)).toBe(3);
  });

  it("still counts from yesterday when today isn't done yet", () => {
    expect(currentStreak(['2026-10-31', '2026-11-01'], today)).toBe(2);
  });

  it('stops at the first gap', () => {
    expect(currentStreak(['2026-10-28', '2026-10-30', '2026-11-01', '2026-11-02'], today)).toBe(2);
    expect(currentStreak(['2026-10-30'], today)).toBe(0);
  });
});

describe('small helpers', () => {
  it('addDays crosses month boundaries', () => {
    expect(addDays('2026-11-01', -1)).toBe('2026-10-31');
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
  });

  it('minutesBetween rounds and never goes negative', () => {
    expect(minutesBetween(new Date('2026-11-02T10:00:00Z'), new Date('2026-11-02T10:44:40Z'))).toBe(45);
    expect(minutesBetween(new Date('2026-11-02T10:00:00Z'), new Date('2026-11-02T09:00:00Z'))).toBe(0);
  });
});
