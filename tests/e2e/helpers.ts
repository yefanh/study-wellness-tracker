import type { Locator, Page } from '@playwright/test';

/** Reads a number from one of the "Last 7 days" stat cards, e.g. statValue(page, 'Sessions'). */
export async function statValue(page: Page, label: string): Promise<string> {
  const card = page.getByRole('region', { name: 'Last 7 days' }).locator('div', { has: page.getByText(label, { exact: true }) });
  return (await card.locator('dd').textContent()) ?? '';
}

/** Make every GraphQL request for `operation` fail after `delayMs`, to test rollback. */
export async function failOperation(page: Page, operation: string, delayMs = 800) {
  await page.route('**/api/graphql', async (route) => {
    if (!(route.request().postData() ?? '').includes(`mutation ${operation}`)) return route.continue();
    await new Promise((resolve) => setTimeout(resolve, delayMs));
    await route.fulfill({ status: 500, contentType: 'text/plain', body: 'Internal Server Error' });
  });
}

/**
 * Pick a 1-5 rating. The real radio input is visually hidden (sr-only) behind a styled
 * label, so click the label, as a mouse user would.
 */
export async function pickScale(scope: Locator, group: string | RegExp, value: number) {
  await scope.getByRole('group', { name: group }).locator('label').nth(value - 1).click();
}
