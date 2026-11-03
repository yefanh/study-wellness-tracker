'use client';

import { useRef, useState, type FormEvent } from 'react';
import { flushSync } from 'react-dom';
import { gqlRequest, GraphQLRequestError } from '@/graphql/client';
import { CheckInHabitMutation, CreateHabitMutation } from '@/graphql/operations';
import type { HabitItem } from '@/graphql/types';
import { useOptimisticState } from '@/hooks/useOptimisticState';
import { addDays } from '@/lib/time';
import { habitSchema, validate, type FieldErrors } from '@/lib/validation';
import { buttonClass, Field, focusFirstInvalid, FormStatus, inputClass } from './fields';

type Update =
  | { type: 'checkIn'; habitId: string; today: string }
  | { type: 'replace'; habit: HabitItem }
  | { type: 'add'; habit: HabitItem };

// Idempotent on purpose: applying the same update twice gives the same list.
function applyHabitUpdate(habits: HabitItem[], u: Update): HabitItem[] {
  switch (u.type) {
    case 'checkIn':
      return habits.map((h) =>
        h.id === u.habitId && !h.doneToday
          ? {
              ...h,
              doneToday: true,
              currentStreak: h.currentStreak + 1,
              doneThisWeek: h.doneThisWeek + 1,
              checkIns: [...h.checkIns, { day: u.today }],
            }
          : h,
      );
    case 'replace':
      return habits.map((h) => (h.id === u.habit.id ? u.habit : h));
    case 'add':
      return habits.some((h) => h.id === u.habit.id) ? habits : [...habits, u.habit];
  }
}

/** The last 28 days as squares. Visual only; screen readers get the sentence next to it. */
function HabitStrip({ habit, today }: { habit: HabitItem; today: string }) {
  const done = new Set(habit.checkIns.map((c) => c.day));
  const days = Array.from({ length: 28 }, (_, i) => addDays(today, i - 27));
  return (
    <>
      <div className="flex gap-0.5" aria-hidden="true">
        {days.map((day) => (
          <span key={day} title={day} className={`h-3 w-2 rounded-sm ${done.has(day) ? 'bg-emerald-600' : 'bg-slate-200'}`} />
        ))}
      </div>
      <p className="sr-only">
        Checked in on {days.filter((d) => done.has(d)).length} of the last 28 days.
      </p>
    </>
  );
}

export function HabitPanel({ habits: serverHabits, today }: { habits: HabitItem[]; today: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [name, setName] = useState('');
  const [target, setTarget] = useState(5);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<{ message?: string; error?: string }>({});
  const { state: habits, run } = useOptimisticState(serverHabits, applyHabitUpdate);

  async function checkIn(habit: HabitItem) {
    setStatus({});
    try {
      await run({
        optimistic: { type: 'checkIn', habitId: habit.id, today },
        action: () => gqlRequest(CheckInHabitMutation, { habitId: habit.id }).then((r) => r.checkInHabit),
        confirmed: (saved) => ({ type: 'replace', habit: saved }),
      });
      setStatus({ message: `${habit.name}: checked in.` });
    } catch (err) {
      const e = err instanceof GraphQLRequestError ? err : new GraphQLRequestError('Something went wrong.');
      setStatus({ error: `Couldn't check in ${habit.name}. ${e.message}` });
    }
  }

  async function onCreate(event: FormEvent) {
    event.preventDefault();
    const check = validate(habitSchema, { name, targetPerWeek: target });
    if (!check.ok) {
      flushSync(() => setErrors(check.errors));
      focusFirstInvalid(formRef.current);
      return;
    }
    setErrors({});
    const typedName = name;
    setName('');
    const draft: HabitItem = {
      id: `temp-${Date.now()}`,
      name: check.data.name,
      targetPerWeek: check.data.targetPerWeek,
      currentStreak: 0,
      doneToday: false,
      doneThisWeek: 0,
      checkIns: [],
    };
    try {
      await run({
        optimistic: { type: 'add', habit: draft },
        action: () => gqlRequest(CreateHabitMutation, { input: check.data }).then((r) => r.createHabit),
        confirmed: (saved) => ({ type: 'add', habit: saved }),
      });
      setStatus({ message: `Added ${check.data.name}.` });
    } catch (err) {
      const e = err instanceof GraphQLRequestError ? err : new GraphQLRequestError('Something went wrong.');
      setName(typedName);
      flushSync(() => setErrors(e.fieldErrors));
      focusFirstInvalid(formRef.current);
      setStatus({ error: `Couldn't add the habit. ${e.message}` });
    }
  }

  return (
    <section aria-labelledby="habits-heading" className="card">
      <h3 id="habits-heading" className="card-title">
        Habits
      </h3>
      <ul className="flex flex-col divide-y divide-slate-100" aria-label="Habits">
        {habits.map((habit) => {
          const saving = habit.id.startsWith('temp-');
          return (
            <li key={habit.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div className="flex flex-col gap-1">
                <span className="font-medium text-slate-900">{habit.name}</span>
                <span className="text-xs text-slate-600">
                  {habit.doneThisWeek}/{habit.targetPerWeek} this week · {habit.currentStreak}-day streak
                </span>
                <HabitStrip habit={habit} today={today} />
              </div>
              <button
                type="button"
                onClick={() => checkIn(habit)}
                disabled={habit.doneToday || saving}
                className={buttonClass}
              >
                {habit.doneToday ? 'Done today' : 'Check in'}
                <span className="sr-only"> {habit.name}</span>
              </button>
            </li>
          );
        })}
      </ul>
      <FormStatus message={status.message} error={status.error} />

      <form ref={formRef} onSubmit={onCreate} noValidate className="mt-4 flex flex-wrap items-end gap-3 border-t border-slate-100 pt-4">
        <div className="min-w-40 flex-1">
          <Field label="New habit" error={errors.name}>
            {(a11y) => <input {...a11y} value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />}
          </Field>
        </div>
        <Field label="Days per week" error={errors.targetPerWeek}>
          {(a11y) => (
            <select {...a11y} value={target} onChange={(e) => setTarget(Number(e.target.value))} className={inputClass}>
              {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          )}
        </Field>
        <button type="submit" className={buttonClass}>
          Add habit
        </button>
      </form>
    </section>
  );
}
