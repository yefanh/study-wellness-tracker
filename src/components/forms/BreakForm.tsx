'use client';

import { useRef, useState, type FormEvent } from 'react';
import { flushSync } from 'react-dom';
import { gqlRequest, GraphQLRequestError } from '@/graphql/client';
import { LogBreakMutation } from '@/graphql/operations';
import type { BreakItem } from '@/graphql/types';
import { useOptimisticState } from '@/hooks/useOptimisticState';
import { BREAK_LABELS, formatDateTime } from '@/lib/format';
import { prependUnique } from '@/lib/optimistic';
import { BREAK_TYPES, breakSchema, validate, type FieldErrors } from '@/lib/validation';
import { buttonClass, Field, focusFirstInvalid, FormStatus, inputClass } from './fields';

export function BreakForm({ recent, timezone }: { recent: BreakItem[]; timezone: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [type, setType] = useState<BreakItem['type']>('SHORT');
  const [minutes, setMinutes] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<{ message?: string; error?: string }>({});

  const { state: breaks, run } = useOptimisticState(recent, (list: BreakItem[], item: BreakItem) =>
    prependUnique(list, item).slice(0, 5),
  );

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const check = validate(breakSchema, { type, durationMinutes: minutes === '' ? undefined : Number(minutes) });
    if (!check.ok) {
      flushSync(() => {
        setErrors(check.errors);
        setStatus({});
      });
      focusFirstInvalid(formRef.current);
      return;
    }

    const input = check.data;
    const typedMinutes = minutes;
    setErrors({});
    setMinutes('');
    setStatus({ message: 'Saving your break…' });
    try {
      await run({
        optimistic: {
          id: `temp-${Date.now()}`,
          type: input.type,
          durationMinutes: input.durationMinutes,
          endedAt: new Date().toISOString(),
        },
        action: () => gqlRequest(LogBreakMutation, { input }).then((r) => r.logBreak),
        confirmed: (saved) => saved,
      });
      setStatus({ message: 'Break logged.' });
    } catch (err) {
      const e = err instanceof GraphQLRequestError ? err : new GraphQLRequestError('Something went wrong.');
      setMinutes(typedMinutes);
      setErrors(e.fieldErrors);
      setStatus({ error: `Couldn't save your break. ${e.message}` });
    }
  }

  return (
    <section aria-labelledby="break-heading" className="card">
      <h3 id="break-heading" className="card-title">
        Log a break
      </h3>
      <form ref={formRef} onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Type" error={errors.type}>
            {(a11y) => (
              <select {...a11y} value={type} onChange={(e) => setType(e.target.value as BreakItem['type'])} className={inputClass}>
                {BREAK_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {BREAK_LABELS[t]}
                  </option>
                ))}
              </select>
            )}
          </Field>
          <Field label="Minutes" hint="Between 1 and 180" error={errors.durationMinutes}>
            {(a11y) => (
              <input
                {...a11y}
                type="number"
                inputMode="numeric"
                min={1}
                max={180}
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
                className={inputClass}
              />
            )}
          </Field>
        </div>
        <div className="flex items-center gap-3">
          <button type="submit" className={buttonClass}>
            Log break
          </button>
          <FormStatus message={status.message} error={status.error} />
        </div>
      </form>

      <h4 className="mt-5 text-sm font-medium text-slate-800">Recent</h4>
      <ul className="mt-2 divide-y divide-slate-100" aria-label="Recent breaks">
        {breaks.map((b) => (
          <li key={b.id} className="flex justify-between py-2 text-sm">
            <span>
              {BREAK_LABELS[b.type]} · {b.durationMinutes} min
            </span>
            <span className="text-slate-600">{b.id.startsWith('temp-') ? 'Saving…' : formatDateTime(b.endedAt, timezone)}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
