// The bookkeeping behind optimistic UI, kept free of React so it can be unit tested.
//
// What the user sees = the server's data (`base`) + every update we have applied locally
// but the server data doesn't include yet. An update lives through three states:
//   pending    shown immediately, request in flight
//   confirmed  the server said yes; keep showing it until fresh server data arrives
//   (dropped)  the request failed -> rollback, or fresh server data arrived -> no longer needed

export type Entry<U> = {
  id: number;
  update: U;
  status: 'pending' | 'confirmed';
  /** The base object that was current when the server confirmed this update. */
  confirmedOn?: unknown;
};

/** Still needed? Pending always; confirmed only until the base changes (new server data). */
export function isLive<U>(entry: Entry<U>, base: unknown): boolean {
  return entry.status === 'pending' || entry.confirmedOn === base;
}

export function applyEntries<S, U>(base: S, entries: Entry<U>[], apply: (state: S, update: U) => S): S {
  return entries.filter((e) => isLive(e, base)).reduce((state, e) => apply(state, e.update), base);
}

export function addEntry<U>(entries: Entry<U>[], id: number, update: U, base: unknown): Entry<U>[] {
  return [...entries.filter((e) => isLive(e, base)), { id, update, status: 'pending' }];
}

/** Mark as confirmed; optionally swap the guessed update for one built from the server's reply. */
export function confirmEntry<U>(entries: Entry<U>[], id: number, base: unknown, update?: U): Entry<U>[] {
  return entries.map((e) =>
    e.id === id ? { ...e, update: update ?? e.update, status: 'confirmed', confirmedOn: base } : e,
  );
}

/** Rollback: forget the update as if it never happened. */
export function dropEntry<U>(entries: Entry<U>[], id: number): Entry<U>[] {
  return entries.filter((e) => e.id !== id);
}

/** Helper for list states: put `item` first unless an item with the same id is already there. */
export function prependUnique<T extends { id: string }>(items: T[], item: T): T[] {
  return items.some((i) => i.id === item.id) ? items : [item, ...items];
}
