import { describe, expect, it } from 'vitest';
import { breakSchema, habitSchema, moodSchema, validate } from '@/lib/validation';

describe('shared validation rules', () => {
  it('accepts a valid break', () => {
    expect(validate(breakSchema, { type: 'MOVEMENT', durationMinutes: 15 })).toEqual({
      ok: true,
      data: { type: 'MOVEMENT', durationMinutes: 15 },
    });
  });

  it('gives one readable message per broken field', () => {
    const result = validate(breakSchema, { type: 'NAP', durationMinutes: 0 });
    expect(result).toEqual({
      ok: false,
      errors: { type: 'Choose a break type', durationMinutes: 'A break is between 1 and 180 minutes' },
    });
  });

  it('treats an empty minutes box as missing, not as zero', () => {
    const result = validate(breakSchema, { type: 'SHORT', durationMinutes: undefined });
    expect(result.ok ? null : result.errors.durationMinutes).toBe('Enter how many minutes');
  });

  it('requires mood but lets energy and stress be skipped', () => {
    expect(validate(moodSchema, { mood: null }).ok).toBe(false);
    expect(validate(moodSchema, { mood: 4, energy: null, stress: undefined }).ok).toBe(true);
  });

  it('trims text before checking it', () => {
    const result = validate(habitSchema, { name: '   ', targetPerWeek: 3 });
    expect(result.ok ? null : result.errors.name).toBe('Give the habit a name');
  });
});
