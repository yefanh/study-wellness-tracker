import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

// Locally the URLs come from .env; in CI they are set by the workflow.
if (existsSync('.env')) process.loadEnvFile('.env');

export default defineConfig({
  resolve: {
    alias: [
      { find: '@', replacement: fileURLToPath(new URL('./src', import.meta.url)) },
      // graphql ships both CommonJS and ESM builds. Yoga require()s the CommonJS one, so
      // point our code at it too; two copies of graphql can't share a schema.
      { find: /^graphql$/, replacement: 'graphql/index.js' },
    ],
  },
  test: {
    include: ['tests/unit/**/*.test.ts', 'tests/integration/**/*.test.ts'],
    // Recreates the test database (never the dev one) before the run.
    globalSetup: ['tests/integration/global-setup.ts'],
    env: { DATABASE_URL: process.env.TEST_DATABASE_URL ?? '' },
    // Integration tests share one database, so run test files one at a time.
    fileParallelism: false,
  },
});
