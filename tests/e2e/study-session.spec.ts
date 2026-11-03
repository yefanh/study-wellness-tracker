import { expect, test } from '@playwright/test';
import { statValue } from './helpers';

test('start and end a study session; the weekly stats update', async ({ page }) => {
  await page.goto('/');
  const before = Number(await statValue(page, 'Sessions'));

  const card = page.getByRole('region', { name: 'Study session' });
  await card.getByLabel('Focus area (optional)').fill('E2E focus');
  await card.getByRole('button', { name: 'Start session' }).click();

  // Optimistic: the timer shows at once, before the server answers.
  await expect(card.getByText('Studying: E2E focus since')).toBeVisible();
  await expect(card.getByRole('status')).toHaveText('Session started.');

  // A reload must find the same running session (it was really saved).
  await page.reload();
  await expect(card.getByText('Studying: E2E focus since')).toBeVisible();

  await card.getByRole('button', { name: 'End session' }).click();
  await expect(card.getByRole('status')).toHaveText(/Session saved: \d+ min\./);
  await expect(card.getByRole('button', { name: 'Start session' })).toBeVisible();

  // router.refresh() re-ran the Server Component: list and stat card show the new session.
  await expect(page.getByRole('list', { name: 'Recent study sessions' }).getByRole('listitem').first()).toContainText('E2E focus');
  await expect.poll(async () => Number(await statValue(page, 'Sessions'))).toBe(before + 1);
});
