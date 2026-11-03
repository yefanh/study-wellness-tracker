# Study Wellness Dashboard

A full-stack tracker for study sessions, breaks, mood logs and habit check-ins, with a
dashboard that charts how studying and wellbeing move together.

| Layer | Stack |
|---|---|
| UI | Next.js 14 App Router, React Server Components, TypeScript, Tailwind CSS, Recharts |
| API | GraphQL (GraphQL Yoga) in a Next.js Route Handler on the Node.js runtime, typed with GraphQL Code Generator, DataLoader |
| Data | PostgreSQL 16, Prisma ORM, zod validation shared by forms and resolvers |
| Tests | Vitest (unit + integration against real Postgres), Playwright end-to-end with axe accessibility checks |
| CI | GitHub Actions: codegen check, type check, lint, Vitest, production build, Playwright |

## Features

- **Server-rendered dashboard.** `src/app/page.tsx` is a Server Component that loads everything
  in one GraphQL query, executed in-process, and sends finished HTML.
- **Typed GraphQL API** at `/api/graphql`. Types for resolvers and client operations are generated
  from the schema, so a schema change that isn't followed through fails `tsc`.
- **Data visualizations.** Daily study minutes and mood/energy trends are aggregated in SQL
  (time-zone aware), plus a 28-day check-in strip per habit. Every chart has a text summary
  and a screen-reader data table.
- **Accessible forms.** Labels, linked hints and errors (`aria-describedby`), focus moves to the
  first invalid field, and live-region status messages. Fully usable from the keyboard.
- **Optimistic UI.** New entries, check-ins and the study timer update instantly, then
  reconcile with the server (`router.refresh()`) or roll back on failure.
- **Integrity in the database.** A partial unique index allows one running session per user,
  check-ins are unique per habit per day, and CHECK constraints guard the score ranges.

## Quick start

Requires Node 20+ and Docker.

```bash
make setup   # npm install, Playwright Chromium, .env from .env.example
make db      # Postgres on localhost:5440 + migrations
make seed    # 8 weeks of demo data
make dev     # http://localhost:3010
```

There is no login: every request acts as the demo user (`DEMO_USER_EMAIL`).
In development, GraphiQL is available at http://localhost:3010/api/graphql.

## Tests

```bash
make test
```

This runs the same steps as CI (`.github/workflows/ci.yml`):

1. `codegen:check`: generated GraphQL types match the schema.
2. `typecheck` and `lint` (including `jsx-a11y` rules).
3. `test:unit`: Vitest. Unit tests for time zones, validation and optimistic-update
   bookkeeping; integration tests that run the real schema against a Postgres test database.
4. `build:e2e`: production build into `.next-e2e/`, so a running `next dev` is not affected.
5. `test:e2e`: Playwright in Chromium against the production build and its own database.
   Covers the session, mood, break and habit flows, rollback on a failed request, keyboard use,
   and an axe WCAG 2.1 AA scan.

Tests use separate databases (`TEST_DATABASE_URL`, `E2E_DATABASE_URL`) and never touch dev data.

## Project map

| Path | What it holds |
|---|---|
| `src/app/` | App Router: `layout.tsx`, the dashboard `page.tsx`, `error.tsx`, and the GraphQL route `api/graphql/route.ts` |
| `src/graphql/` | Schema (`typeDefs.ts`), resolvers, per-request context, DataLoader, operations, generated types |
| `src/components/` | Charts (`charts/`), forms and accessible field components (`forms/`), stat cards |
| `src/hooks/`, `src/lib/` | Optimistic-update hook and its pure logic, time-zone helpers, SQL aggregates, validation |
| `prisma/` | Schema, migrations (with the hand-written constraints), seed script |
| `tests/` | `unit/`, `integration/` (Vitest), `e2e/` (Playwright) |

## Useful scripts

| Command | Does |
|---|---|
| `npm run codegen` | Regenerate GraphQL types after editing `typeDefs.ts` or `operations.ts` |
| `npm run db:migrate -- --name <change>` | Create and apply a new migration after editing `schema.prisma` |
| `npm run db:studio` | Browse the dev database in Prisma Studio |
| `make stop` | Stop the Postgres container (data stays in the Docker volume) |
