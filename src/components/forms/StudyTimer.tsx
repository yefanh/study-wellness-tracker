'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { flushSync } from 'react-dom';
import { gqlRequest, GraphQLRequestError } from '@/graphql/client';
import { EndStudySessionMutation, StartStudySessionMutation } from '@/graphql/operations';
import type { ActiveSession, SessionItem } from '@/graphql/types';
import { useOptimisticState } from '@/hooks/useOptimisticState';
import { formatDateTime, formatMinutes, formatTime } from '@/lib/format';
import { startSessionSchema, validate, type FieldErrors } from '@/lib/validation';
import { buttonClass, Field, focusFirstInvalid, FormStatus, inputClass } from './fields';

type Update = { type: 'start'; session: ActiveSession } | { type: 'end' };

/** Seconds since `startedAt`, ticking once a second. Null on the server render, to avoid a hydration mismatch. */
function useElapsed(startedAt: string | undefined) {
  const [seconds, setSeconds] = useState<number | null>(null);
  useEffect(() => {
    if (!startedAt) return setSeconds(null);
    const tick = () => setSeconds(Math.max(0, Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000)));
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [startedAt]);
  return seconds;
}

export function StudyTimer({
  active,
  recent,
  timezone,
}: {
  active: ActiveSession | null;
  recent: SessionItem[];
  timezone: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [focusArea, setFocusArea] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<{ message?: string; error?: string }>({});

  const { state: session, run, isPending } = useOptimisticState<ActiveSession | null, Update>(active, (_current, u) =>
    u.type === 'start' ? u.session : null,
  );
  const elapsed = useElapsed(session?.startedAt);

  async function onStart(event: FormEvent) {
    event.preventDefault();
    const check = validate(startSessionSchema, { focusArea: focusArea || null });
    if (!check.ok) {
      flushSync(() => setErrors(check.errors));
      focusFirstInvalid(formRef.current);
      return;
    }
    setErrors({});
    setStatus({ message: 'Starting…' });
    const draft = { id: `temp-${Date.now()}`, startedAt: new Date().toISOString(), focusArea: check.data.focusArea || null };
    try {
      await run({
        optimistic: { type: 'start', session: draft },
        action: () => gqlRequest(StartStudySessionMutation, { input: check.data }).then((r) => r.startStudySession),
        confirmed: (saved) => ({ type: 'start', session: saved }),
      });
      setFocusArea('');
      setStatus({ message: 'Session started.' });
    } catch (err) {
      const e = err instanceof GraphQLRequestError ? err : new GraphQLRequestError('Something went wrong.');
      setErrors(e.fieldErrors);
      setStatus({ error: `Couldn't start the session. ${e.message}` });
    }
  }

  async function onEnd() {
    if (!session) return;
    const id = session.id;
    setStatus({ message: 'Saving session…' });
    try {
      const ended = await run({
        optimistic: { type: 'end' },
        action: () => gqlRequest(EndStudySessionMutation, { id }).then((r) => r.endStudySession),
      });
      setStatus({ message: `Session saved: ${formatMinutes(ended.durationMinutes)}.` });
    } catch (err) {
      const e = err instanceof GraphQLRequestError ? err : new GraphQLRequestError('Something went wrong.');
      setStatus({ error: `Couldn't end the session. ${e.message}` });
    }
  }

  const clock =
    elapsed === null
      ? ''
      : `${Math.floor(elapsed / 60)}:${String(elapsed % 60).padStart(2, '0')}`;

  return (
    <section aria-labelledby="study-heading" className="card">
      <h3 id="study-heading" className="card-title">
        Study session
      </h3>

      {session ? (
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-slate-700">
              Studying{session.focusArea ? `: ${session.focusArea}` : ''} since {formatTime(session.startedAt, timezone)}
            </p>
            {/* Not a live region: announcing every second would be noise. */}
            <p className="text-3xl font-semibold tabular-nums text-slate-900">{clock}</p>
          </div>
          <button
            type="button"
            onClick={onEnd}
            disabled={isPending || session.id.startsWith('temp-')}
            className={buttonClass}
          >
            End session
          </button>
        </div>
      ) : (
        <form ref={formRef} onSubmit={onStart} noValidate className="flex flex-wrap items-end gap-3">
          <div className="min-w-48 flex-1">
            <Field label="Focus area (optional)" error={errors.focusArea}>
              {(a11y) => (
                <input {...a11y} value={focusArea} onChange={(e) => setFocusArea(e.target.value)} placeholder="e.g. Algorithms" className={inputClass} />
              )}
            </Field>
          </div>
          <button type="submit" className={buttonClass}>
            Start session
          </button>
        </form>
      )}
      <div className="mt-2">
        <FormStatus message={status.message} error={status.error} />
      </div>

      <h4 className="mt-4 text-sm font-medium text-slate-800">Recent sessions</h4>
      <ul className="mt-2 divide-y divide-slate-100" aria-label="Recent study sessions">
        {recent.map((s) => (
          <li key={s.id} className="flex justify-between py-2 text-sm">
            <span>
              {s.focusArea ?? 'Study'} · {formatMinutes(s.durationMinutes)}
            </span>
            <span className="text-slate-600">{formatDateTime(s.startedAt, timezone)}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
