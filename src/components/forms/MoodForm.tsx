'use client';

import { useRef, useState, type FormEvent } from 'react';
import { flushSync } from 'react-dom';
import { gqlRequest, GraphQLRequestError } from '@/graphql/client';
import { LogMoodMutation } from '@/graphql/operations';
import type { MoodLogItem } from '@/graphql/types';
import { useOptimisticState } from '@/hooks/useOptimisticState';
import { formatDateTime, MOOD_LABELS } from '@/lib/format';
import { prependUnique } from '@/lib/optimistic';
import { moodSchema, validate, type FieldErrors } from '@/lib/validation';
import { buttonClass, Field, focusFirstInvalid, FormStatus, inputClass, ScaleField } from './fields';

export function MoodForm({ recent, timezone }: { recent: MoodLogItem[]; timezone: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [mood, setMood] = useState<number | null>(null);
  const [energy, setEnergy] = useState<number | null>(null);
  const [stress, setStress] = useState<number | null>(null);
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<{ message?: string; error?: string }>({});

  const { state: logs, run } = useOptimisticState(recent, (list: MoodLogItem[], log: MoodLogItem) =>
    prependUnique(list, log).slice(0, 5),
  );

  function fill(values: { mood: number | null; energy: number | null; stress: number | null; notes: string }) {
    setMood(values.mood);
    setEnergy(values.energy);
    setStress(values.stress);
    setNotes(values.notes);
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const typed = { mood, energy, stress, notes };
    const check = validate(moodSchema, { mood, energy, stress, notes: notes || null });
    if (!check.ok) {
      flushSync(() => {
        setErrors(check.errors);
        setStatus({});
      });
      focusFirstInvalid(formRef.current);
      return;
    }

    const input = check.data;
    const draft: MoodLogItem = {
      id: `temp-${Date.now()}`,
      recordedAt: new Date().toISOString(),
      mood: input.mood,
      energy: input.energy ?? null,
      stress: input.stress ?? null,
      notes: input.notes || null,
    };
    setErrors({});
    setStatus({ message: 'Saving your mood…' });
    fill({ mood: null, energy: null, stress: null, notes: '' }); // the entry already shows below

    try {
      await run({
        optimistic: draft,
        action: () => gqlRequest(LogMoodMutation, { input }).then((r) => r.logMood),
        confirmed: (saved) => saved,
      });
      setStatus({ message: 'Mood logged.' });
    } catch (err) {
      const e = err instanceof GraphQLRequestError ? err : new GraphQLRequestError('Something went wrong.');
      fill(typed); // give the user their answers back
      setErrors(e.fieldErrors);
      setStatus({ error: `Couldn't save your mood. ${e.message}` });
    }
  }

  return (
    <section aria-labelledby="mood-heading" className="card">
      <h3 id="mood-heading" className="card-title">
        How are you feeling?
      </h3>
      <form ref={formRef} onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        <ScaleField name="mood" legend="Mood" value={mood} onChange={setMood} error={errors.mood} lowLabel="very low" highLabel="great" />
        <div className="flex flex-wrap gap-6">
          <ScaleField name="energy" legend="Energy" value={energy} onChange={setEnergy} error={errors.energy} optional lowLabel="drained" highLabel="energized" />
          <ScaleField name="stress" legend="Stress" value={stress} onChange={setStress} error={errors.stress} optional lowLabel="calm" highLabel="very stressed" />
        </div>
        <Field label="Notes (optional)" error={errors.notes}>
          {(a11y) => <textarea {...a11y} rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} className={inputClass} />}
        </Field>
        <div className="flex items-center gap-3">
          <button type="submit" className={buttonClass}>
            Log mood
          </button>
          <FormStatus message={status.message} error={status.error} />
        </div>
      </form>

      <h4 className="mt-5 text-sm font-medium text-slate-800">Recent</h4>
      <ul className="mt-2 divide-y divide-slate-100" aria-label="Recent mood logs">
        {logs.map((log) => (
          <li key={log.id} className="flex justify-between py-2 text-sm">
            <span>
              {MOOD_LABELS[log.mood]} ({log.mood}/5)
              {log.notes && <span className="text-slate-600"> · {log.notes}</span>}
            </span>
            <span className="text-slate-600">{log.id.startsWith('temp-') ? 'Saving…' : formatDateTime(log.recordedAt, timezone)}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
