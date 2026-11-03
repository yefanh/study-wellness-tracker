import { existsSync } from 'node:fs';
import { defineConfig, devices } from '@playwright/test';

// End-to-end tests drive a real browser against the production build (`next build` first),
// backed by its own database (E2E_DATABASE_URL), prepared by tests/e2e/prepare-db.ts.
if (existsSync('.env')) process.loadEnvFile('.env');

const PORT = 3110;

export default defineConfig({
  testDir: 'tests/e2e',
  testMatch: '**/*.spec.ts',
  // The tests share one demo user, so run them one at a time in a fixed order.
  workers: 1,
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : [['list']],
  use: {
    baseURL: `http://localhost:${PORT}`,
    timezoneId: 'America/New_York',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `npx next start -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: false,
    timeout: 120_000,
    env: { DATABASE_URL: process.env.E2E_DATABASE_URL ?? '', NEXT_DIST_DIR: '.next-e2e' },
  },
});
