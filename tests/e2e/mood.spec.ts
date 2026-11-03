import { expect, test } from '@playwright/test';
import { failOperation, pickScale } from './helpers';

test('logging a mood shows up instantly and is still there after a reload', async ({ page }) => {
  await page.goto('/');
  const form = page.getByRole('region', { name: 'How are you feeling?' });
  const note = `e2e ${Date.now()}`;

  await pickScale(form, 'Mood', 5);
  await form.getByLabel('Notes (optional)').fill(note);
  await form.getByRole('button', { name: 'Log mood' }).click();

  const newest = page.getByRole('list', { name: 'Recent mood logs' }).getByRole('listitem').first();
  await expect(newest).toContainText(`Great (5/5) · ${note}`);
  await expect(form.getByRole('status')).toHaveText('Mood logged.');

  await page.reload();
  await expect(page.getByRole('list', { name: 'Recent mood logs' }).getByRole('listitem').first()).toContainText(note);
});

test('when the server fails, the optimistic entry is rolled back and the answers come back', async ({ page }) => {
  await failOperation(page, 'LogMood');
  await page.goto('/');
  const form = page.getByRole('region', { name: 'How are you feeling?' });
  const list = page.getByRole('list', { name: 'Recent mood logs' });
  const countBefore = await list.getByRole('listitem').count();

  await pickScale(form, 'Mood', 2);
  await form.getByLabel('Notes (optional)').fill('should roll back');
  await form.getByRole('button', { name: 'Log mood' }).click();

  // 1) shown immediately while the request is in flight
  await expect(list.getByRole('listitem').first()).toContainText('Saving…');
  // 2) the request fails: error announced, entry removed, form refilled
  await expect(form.getByRole('alert')).toHaveText(/Couldn't save your mood/);
  await expect(list.getByText('should roll back')).toHaveCount(0);
  await expect(list.getByRole('listitem')).toHaveCount(countBefore);
  await expect(form.getByLabel('Notes (optional)')).toHaveValue('should roll back');
  await expect(form.getByRole('group', { name: 'Mood' }).getByRole('radio').nth(1)).toBeChecked();
});
