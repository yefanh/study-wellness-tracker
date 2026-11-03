'use client';

import { useCallback, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { addEntry, applyEntries, confirmEntry, dropEntry, type Entry } from '@/lib/optimistic';

let nextId = 1;

/**
 * Optimistic UI on top of Server Component data.
 *
 *   const { state, run } = useOptimisticState(serverMoodLogs, (logs, log) => prependUnique(logs, log));
 *   await run({ optimistic: draft, action: () => gqlRequest(...), confirmed: (saved) => saved });
 *
 * run(): 1) show `optimistic` now  2) await `action`  3a) success: keep it (or the server's
 * version) and router.refresh() so the Server Component re-renders with real data
 * 3b) failure: roll back and rethrow so the form can show the error.
 *
 * `apply` must be idempotent: for a moment the base may already contain the update.
 */
export function useOptimisticState<S, U>(base: S, apply: (state: S, update: U) => S) {
  const router = useRouter();
  const [entries, setEntries] = useState<Entry<U>[]>([]);
  const baseRef = useRef(base);
  baseRef.current = base;

  const state = applyEntries(base, entries, apply);

  const run = useCallback(
    async <T>({ optimistic, action, confirmed }: { optimistic: U; action: () => Promise<T>; confirmed?: (result: T) => U }) => {
      const id = nextId++;
      setEntries((es) => addEntry(es, id, optimistic, baseRef.current));
      try {
        const result = await action();
        setEntries((es) => confirmEntry(es, id, baseRef.current, confirmed?.(result)));
        // Re-run the Server Component; client state (form inputs, messages) is kept.
        // (This is why the app has no route-level loading.tsx: in Next 14 its boundary
        // made refresh() remount every form on the page.)
        router.refresh();
        return result;
      } catch (err) {
        setEntries((es) => dropEntry(es, id));
        throw err;
      }
    },
    [router],
  );

  return { state, run, isPending: entries.some((e) => e.status === 'pending') };
}
