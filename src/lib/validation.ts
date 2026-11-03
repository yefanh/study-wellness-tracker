import { z } from 'zod';

// One set of rules, used twice: the forms check them for instant feedback, and the
// GraphQL resolvers check them again because the browser can't be trusted.

const score = (label: string) =>
  z
    .number({ required_error: `Pick your ${label}`, invalid_type_error: `Pick your ${label}` })
    .int()
    .min(1, `${label} is from 1 to 5`)
    .max(5, `${label} is from 1 to 5`);

export const BREAK_TYPES = ['SHORT', 'LONG', 'MOVEMENT', 'MEAL', 'OTHER'] as const;

export const startSessionSchema = z.object({
  focusArea: z.string().trim().max(60, 'Keep the focus area under 60 characters').nullish(),
});

export const breakSchema = z.object({
  type: z.enum(BREAK_TYPES, { errorMap: () => ({ message: 'Choose a break type' }) }),
  durationMinutes: z
    .number({ required_error: 'Enter how many minutes', invalid_type_error: 'Enter how many minutes' })
    .int('Use whole minutes')
    .min(1, 'A break is between 1 and 180 minutes')
    .max(180, 'A break is between 1 and 180 minutes'),
  notes: z.string().trim().max(200, 'Keep notes under 200 characters').nullish(),
});

export const moodSchema = z.object({
  mood: score('mood'),
  energy: score('energy').nullish(),
  stress: score('stress').nullish(),
  notes: z.string().trim().max(280, 'Keep notes under 280 characters').nullish(),
});

export const habitSchema = z.object({
  name: z.string().trim().min(1, 'Give the habit a name').max(40, 'Keep the name under 40 characters'),
  targetPerWeek: z
    .number({ invalid_type_error: 'Pick a weekly target' })
    .int()
    .min(1, 'Target is 1 to 7 days a week')
    .max(7, 'Target is 1 to 7 days a week'),
});

/** Field name -> first error message, e.g. { durationMinutes: 'A break is between 1 and 180 minutes' }. */
export type FieldErrors = Record<string, string>;

export function toFieldErrors(error: z.ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path.join('.') || 'form';
    out[key] ??= issue.message;
  }
  return out;
}

export function validate<S extends z.ZodTypeAny>(
  schema: S,
  input: unknown,
): { ok: true; data: z.infer<S> } | { ok: false; errors: FieldErrors } {
  const result = schema.safeParse(input);
  return result.success ? { ok: true, data: result.data } : { ok: false, errors: toFieldErrors(result.error) };
}
