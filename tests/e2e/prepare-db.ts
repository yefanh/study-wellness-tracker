// Run before `playwright test`: migrate the e2e database and load fresh demo data.
// Non-destructive at the schema level: `migrate deploy` only applies pending migrations,
// and the seed replaces just the demo user's rows.
import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';

if (existsSync('.env')) process.loadEnvFile('.env');
const url = process.env.E2E_DATABASE_URL;
if (!url) throw new Error('E2E_DATABASE_URL is not set (copy .env.example to .env)');

const env = { ...process.env, DATABASE_URL: url };
execSync('npx prisma migrate deploy', { stdio: 'inherit', env });
execSync('npx tsx prisma/seed.ts', { stdio: 'inherit', env });
