import { expect, test } from '@playwright/test';

test.describe('server-rendered dashboard', () => {
  // With JavaScript off, only HTML produced on the server can show up.
  test.use({ javaScriptEnabled: false });

  test('shows stats, charts and recent activity before any JavaScript runs', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1, name: 'Study Wellness' })).toBeVisible();

    const week = page.getByRole('region', { name: 'Last 7 days' });
    await expect(week.getByText('Study time')).toBeVisible();
    await expect(week.getByText(/\d+h|\d+ min/)).toBeVisible();

    // Each chart carries a data table for screen readers, also rendered on the server.
    await expect(page.getByRole('table', { name: 'Study time, last 14 days' }).getByRole('row')).toHaveCount(15);
    await expect(page.getByRole('list', { name: 'Recent study sessions' }).getByRole('listitem')).toHaveCount(5);
    await expect(page.getByRole('list', { name: 'Habits' }).getByRole('listitem')).toHaveCount(3);
  });
});
