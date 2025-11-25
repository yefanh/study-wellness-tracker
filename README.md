This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Database (Prisma + PostgreSQL)

1. Copy `.env.example` to `.env.local` and set `DATABASE_URL` to your PostgreSQL instance.
2. Create the database named in `DATABASE_URL` if it does not already exist.
3. Apply schema changes: `npm run db:migrate -- --name init` (provide a descriptive migration name).
4. Generate the Prisma client: `npm run db:generate`.
5. Inspect/edit data locally: `npm run db:studio`.

Models live in `prisma/schema.prisma` and cover study sessions, breaks, mood logs, and habit check-ins.

## GraphQL API

- Endpoint: `http://localhost:3000/api/graphql` (server must be running).
- Auth: none yet; a demo user is auto-created (`DEMO_USER_EMAIL` env var overrides the default).
- Common commands:
  - Start server: `npm run dev`
  - Schema client: `npm run db:generate`

Sample query:

```graphql
query DashboardData {
  me {
    id
    habits {
      id
      name
      targetPerWeek
      checkIns {
        completedAt
        value
      }
    }
  }
  studySessions {
    id
    startedAt
    endedAt
    durationMinutes
  }
  moodLogs {
    recordedAt
    mood
    energy
  }
}
```

Sample mutation:

```graphql
mutation TrackFocusAndMood {
  startStudySession(input: { focusArea: "Deep work" }) {
    id
    startedAt
  }
  logMood(input: { mood: 4, energy: 3, stress: 2, notes: "Solid session" }) {
    id
    recordedAt
  }
}
```

## Seed data

- Seed script wipes prior demo data for the demo user and inserts fresh samples.
- Configure `.env.local` first, then run:
  - `npm run db:generate`
  - `npm run db:migrate -- --name init` (if not yet migrated) or `npm run db:push`
  - `npm run db:seed`
- Override demo email via `DEMO_USER_EMAIL` if needed.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
