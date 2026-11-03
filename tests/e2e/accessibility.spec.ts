import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('the dashboard has no WCAG 2.1 A/AA violations that axe can detect', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Trends' })).toBeVisible();

  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  expect(results.violations.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
});

test('the break form works from the keyboard and explains its errors', async ({ page }) => {
  await page.goto('/');
  const form = page.getByRole('region', { name: 'Log a break' });
  const minutes = form.getByLabel('Minutes');

  // Keyboard only: focus the field, type an invalid value, submit with Enter.
  await minutes.focus();
  await page.keyboard.type('0');
  await page.keyboard.press('Enter');

  // The error is tied to the input, so a screen reader reads it with the field name.
  await expect(minutes).toHaveAttribute('aria-invalid', 'true');
  await expect(minutes).toHaveAccessibleDescription('Between 1 and 180 A break is between 1 and 180 minutes');
  await expect(minutes).toBeFocused();

  await page.keyboard.press('ControlOrMeta+a');
  await page.keyboard.type('15');
  await page.keyboard.press('Enter');
  await expect(form.getByRole('status')).toHaveText('Break logged.');
  await expect(page.getByRole('list', { name: 'Recent breaks' }).getByRole('listitem').first()).toContainText('Short break · 15 min');
  await expect(minutes).not.toHaveAttribute('aria-invalid');
});

test('the skip link is the first stop for keyboard users', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
});
