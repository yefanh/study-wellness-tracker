import { execSync } from 'node:child_process';

// Runs once before Vitest: bring the test database up to the latest migration.
// `migrate deploy` only applies pending migrations (creating the database if needed) and
// never drops anything; each test empties the tables itself (see resetDb in helpers.ts).
export default function setup() {
  const url = process.env.TEST_DATABASE_URL;
  if (!url) throw new Error('TEST_DATABASE_URL is not set (copy .env.example to .env)');
  execSync('npx prisma migrate deploy', { stdio: 'pipe', env: { ...process.env, DATABASE_URL: url } });
}
