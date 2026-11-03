import { describe, expect, it } from 'vitest';
import { addEntry, applyEntries, confirmEntry, dropEntry, prependUnique, type Entry } from '@/lib/optimistic';
import { weekSummary } from '@/lib/stats';

type Item = { id: string; label: string };
const apply = (list: Item[], item: Item) => prependUnique(list, item);

describe('optimistic bookkeeping', () => {
  const server: Item[] = [{ id: 'a', label: 'from server' }];
  const draft = { id: 'temp-1', label: 'draft' };

  it('shows a pending update on top of the server data immediately', () => {
    const entries = addEntry<Item>([], 1, draft, server);
    expect(applyEntries(server, entries, apply).map((i) => i.id)).toEqual(['temp-1', 'a']);
  });

  it('rolls back by dropping the entry when the request fails', () => {
    const entries = dropEntry(addEntry<Item>([], 1, draft, server), 1);
    expect(applyEntries(server, entries, apply)).toEqual(server);
  });

  it("keeps a confirmed update (with the server's version) until fresh server data arrives", () => {
    const saved = { id: 'b', label: 'saved' };
    let entries: Entry<Item>[] = addEntry([], 1, draft, server);
    entries = confirmEntry(entries, 1, server, saved);
    expect(applyEntries(server, entries, apply).map((i) => i.id)).toEqual(['b', 'a']);

    // router.refresh() delivers a new base that already contains the saved item:
    const refreshed = [saved, ...server];
    expect(applyEntries(refreshed, entries, apply)).toBe(refreshed);
  });

  it('applying a list update twice does not duplicate the item (idempotent)', () => {
    expect(apply(apply(server, draft), draft)).toHaveLength(2);
  });
});

describe('weekSummary', () => {
  it('sums the last 7 days and weights mood by number of logs', () => {
    const study = Array.from({ length: 10 }, (_, i) => ({ day: `d${i}`, minutes: 10, sessions: 1 }));
    const mood = [
      ...Array.from({ length: 8 }, (_, i) => ({ day: `d${i}`, mood: null, energy: null, entries: 0 })),
      { day: 'd8', mood: 2, energy: null, entries: 1 },
      { day: 'd9', mood: 5, energy: null, entries: 2 },
    ];
    expect(weekSummary(study, mood)).toEqual({ studyMinutes: 70, sessions: 7, averageMood: 4 });
  });
});
