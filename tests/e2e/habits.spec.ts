import { expect, test } from '@playwright/test';

test('add a habit, check in, and keep the check-in after a reload', async ({ page }) => {
  await page.goto('/');
  const panel = page.getByRole('region', { name: 'Habits' });
  const name = `Meditate ${Date.now() % 100000}`;

  await panel.getByLabel('New habit').fill(name);
  await panel.getByLabel('Days per week').selectOption('3');
  await panel.getByRole('button', { name: 'Add habit' }).click();

  const row = panel.getByRole('listitem').filter({ hasText: name });
  await expect(row).toContainText('0/3 this week · 0-day streak');

  await row.getByRole('button', { name: `Check in ${name}` }).click();
  // Optimistic: counters and button flip before the server confirms.
  await expect(row).toContainText('1/3 this week · 1-day streak');
  await expect(row.getByRole('button', { name: `Done today ${name}` })).toBeDisabled();

  await page.reload();
  await expect(panel.getByRole('listitem').filter({ hasText: name })).toContainText('1/3 this week · 1-day streak');
});

test('a duplicate habit name is reported on the field and focused', async ({ page }) => {
  await page.goto('/');
  const panel = page.getByRole('region', { name: 'Habits' });
  const input = panel.getByLabel('New habit');

  await input.fill('Stretch'); // already exists in the seed data
  await panel.getByRole('button', { name: 'Add habit' }).click();

  await expect(input).toHaveAccessibleDescription('You already track a habit with this name');
  await expect(input).toBeFocused();
  await expect(input).toHaveValue('Stretch');
  await expect(panel.getByRole('listitem').filter({ hasText: /^Stretch/ })).toHaveCount(1);
});
