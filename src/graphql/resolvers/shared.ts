/** List arguments are capped so one request can't ask for the whole table. */
export function clampLimit(limit: number | null | undefined, max = 50): number {
  return Math.min(max, Math.max(1, limit ?? 5));
}
