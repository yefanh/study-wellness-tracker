'use client';

import { useId, type ReactNode } from 'react';

// Accessible form building blocks. The rules they enforce:
// - every input has a <label> (or a <legend> for a group), so screen readers announce its name
// - hints and errors are linked with aria-describedby, so they are read out with the field
// - aria-invalid marks the broken field; forms move focus to the first one on submit
// - status messages go to a live region that already exists in the page before it changes

export type InputA11yProps = {
  id: string;
  'aria-invalid'?: true;
  'aria-describedby'?: string;
};

export function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: (a11y: InputA11yProps) => ReactNode;
}) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-slate-800">
        {label}
      </label>
      {children({ id, 'aria-invalid': error ? true : undefined, 'aria-describedby': describedBy })}
      {hint && (
        <p id={hintId} className="text-xs text-slate-600">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}

/** A 1-5 rating as a radio group: keyboard users move with the arrow keys, like any radio group. */
export function ScaleField({
  name,
  legend,
  value,
  onChange,
  error,
  optional,
  lowLabel,
  highLabel,
}: {
  name: string;
  legend: string;
  value: number | null;
  onChange: (value: number) => void;
  error?: string;
  optional?: boolean;
  lowLabel: string;
  highLabel: string;
}) {
  const id = useId();
  const errorId = error ? `${id}-error` : undefined;

  return (
    // aria-invalid isn't allowed on radios, so the group carries the marker (data-invalid)
    // and the error is linked to the whole group with aria-describedby.
    <fieldset className="flex flex-col gap-1" aria-describedby={errorId} data-invalid={error ? true : undefined}>
      <legend className="text-sm font-medium text-slate-800">
        {legend}
        {optional && <span className="font-normal text-slate-600"> (optional)</span>}
      </legend>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <label key={n} className="cursor-pointer">
            <input
              type="radio"
              name={name}
              value={n}
              checked={value === n}
              onChange={() => onChange(n)}
              className="peer sr-only"
            />
            <span className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-400 text-sm text-slate-800 peer-checked:border-indigo-700 peer-checked:bg-indigo-700 peer-checked:text-white peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-indigo-700">
              {n}
              {n === 1 && <span className="sr-only">, {lowLabel}</span>}
              {n === 5 && <span className="sr-only">, {highLabel}</span>}
            </span>
          </label>
        ))}
      </div>
      <p className="text-xs text-slate-600" aria-hidden="true">
        1 = {lowLabel}, 5 = {highLabel}
      </p>
      {error && (
        <p id={errorId} className="text-sm text-red-700">
          {error}
        </p>
      )}
    </fieldset>
  );
}

/** Success messages are announced politely; errors interrupt (role="alert"). */
export function FormStatus({ message, error }: { message?: string; error?: string }) {
  return (
    <>
      <p role="status" className="text-sm text-emerald-800">
        {message}
      </p>
      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}
    </>
  );
}

export const inputClass =
  'rounded-md border border-slate-400 bg-white px-3 py-2 text-sm text-slate-900 aria-[invalid=true]:border-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-700';

export const buttonClass =
  'rounded-md bg-indigo-700 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-800 disabled:cursor-not-allowed disabled:bg-slate-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-700';

/** Move keyboard focus to the first field marked invalid (call after the errors have rendered). */
export function focusFirstInvalid(form: HTMLFormElement | null) {
  form?.querySelector<HTMLElement>('[aria-invalid="true"], [data-invalid="true"] input')?.focus();
}
